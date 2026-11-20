import { DurableObject } from "cloudflare:workers";

// Romkoder uten tegn som er lette å forveksle (0/O, 1/I/L)
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CHOICES = ["need", "hand", "wait"];
const ROOM_TTL_MS = 48 * 3600 * 1000;
const VOTE_MS = 20 * 1000;

function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join("");
}

function page(env, url, path) {
  return env.ASSETS.fetch(new Request(new URL(path, url)));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/new" && request.method === "POST") {
      const key = crypto.randomUUID();
      for (let i = 0; i < 8; i++) {
        const code = newCode();
        if (await env.ROOMS.getByName(code).init(key)) {
          return Response.json({ code, key });
        }
      }
      return new Response("Fant ingen ledig kode", { status: 503 });
    }

    let m = path.match(/^\/ws\/([A-Za-z2-9]{4})$/);
    if (m) {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Forventer WebSocket", { status: 426 });
      }
      return env.ROOMS.getByName(m[1].toUpperCase()).fetch(request);
    }

    m = path.match(/^\/s\/([A-Za-z2-9]{4})\/?$/);
    if (m) return page(env, url, "/vote");

    m = path.match(/^\/vis\/([A-Za-z2-9]{4})\/?$/);
    if (m) return page(env, url, "/host");

    return env.ASSETS.fetch(request);
  },
};

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    // Klienter sender "ping" for å holde forbindelsen. Svaret går uten å vekke objektet.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    ctx.blockConcurrencyWhile(async () => {
      this.s = (await ctx.storage.get("s")) || null;
    });
  }

  async init(key) {
    if (this.s) return false;
    this.s = { key, phase: "lobby", cur: null, votes: {}, locked: {}, deadlines: {} };
    await this.ctx.storage.put("s", this.s);
    await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL_MS);
    return true;
  }

  async alarm() {
    for (const ws of this.ctx.getWebSockets()) {
      try { ws.close(1000, "Møtet er slettet"); } catch {}
    }
    await this.ctx.storage.deleteAll();
    this.s = null;
  }

  async fetch(request) {
    if (!this.s) return new Response("Fant ikke møtet", { status: 404 });
    const url = new URL(request.url);
    const role = url.searchParams.get("role");
    let att;
    if (role === "host") {
      if (url.searchParams.get("key") !== this.s.key) return new Response("Feil nøkkel", { status: 403 });
      att = { role: "host" };
    } else {
      const vid = url.searchParams.get("vid") || "";
      if (!/^[A-Za-z0-9-]{8,40}$/.test(vid)) return new Response("Mangler id", { status: 400 });
      att = { role: "voter", vid };
    }
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server, [att.role]);
    server.serializeAttachment(att);
    this.send(server, att);
    this.pushHosts();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, msg) {
    if (!this.s || typeof msg !== "string" || msg.length > 300) return;
    let d;
    try { d = JSON.parse(msg); } catch { return; }
    const att = ws.deserializeAttachment() || {};
    const s = this.s;

    if (att.role === "voter") {
      if (d.t !== "vote" || s.phase !== "vote" || !s.cur || s.locked[s.cur]) return;
      if (d.f !== s.cur) return;
      if (d.c !== null && !CHOICES.includes(d.c)) return;
      const v = (s.votes[s.cur] ||= {});
      if (d.c) v[att.vid] = d.c; else delete v[att.vid];
      await this.save();
      this.pushHosts();
      this.pushVoter(att.vid);
      return;
    }

    if (att.role !== "host") return;
    const fid = typeof d.f === "string" && /^[a-z0-9-]{1,40}$/.test(d.f) ? d.f : null;
    switch (d.t) {
      case "show":
        if (!fid) return;
        s.cur = fid;
        s.phase = "vote";
        s.deadlines ||= {};
        if (!s.deadlines[fid]) s.deadlines[fid] = Date.now() + VOTE_MS;
        break;
      case "extend": {
        s.deadlines ||= {};
        const dl = s.deadlines[s.cur];
        if (!s.cur || !dl || dl <= Date.now()) return;
        s.deadlines[s.cur] = dl + 10 * 1000;
        break;
      }
      case "reveal":
        if (!s.cur) return;
        s.deadlines ||= {};
        s.deadlines[s.cur] = Date.now();
        break;
      case "lock":
        if (!fid || !CHOICES.includes(d.c)) return;
        s.locked[fid] = { c: d.c, split: !!d.split };
        break;
      case "unlock":
        if (!fid) return;
        delete s.locked[fid];
        break;
      case "phase":
        if (!["lobby", "vote", "summary"].includes(d.p)) return;
        s.phase = d.p;
        break;
      case "reset":
        s.phase = "lobby"; s.cur = null; s.votes = {}; s.locked = {}; s.deadlines = {};
        break;
      default:
        return;
    }
    await this.save();
    this.pushAll();
  }

  async webSocketClose(ws, code) {
    try { ws.close(code === 1005 ? 1000 : code, "bye"); } catch {}
    this.pushHosts(ws);
  }

  async webSocketError(ws) {
    this.pushHosts(ws);
  }

  async save() {
    await this.ctx.storage.put("s", this.s);
  }

  voterCount(exclude) {
    const ids = new Set();
    for (const ws of this.ctx.getWebSockets("voter")) {
      if (ws === exclude || ws.readyState !== WebSocket.OPEN) continue;
      const a = ws.deserializeAttachment();
      if (a?.vid) ids.add(a.vid);
    }
    return ids.size;
  }

  hostState(exclude) {
    const s = this.s;
    const tallies = {};
    for (const [fid, v] of Object.entries(s.votes)) {
      const t = { need: 0, hand: 0, wait: 0 };
      for (const c of Object.values(v)) t[c]++;
      tallies[fid] = t;
    }
    return { t: "state", phase: s.phase, cur: s.cur, tallies, locked: s.locked, voters: this.voterCount(exclude), deadline: s.cur ? s.deadlines?.[s.cur] || null : null, now: Date.now() };
  }

  voterState(vid) {
    const s = this.s;
    return {
      t: "state",
      phase: s.phase,
      cur: s.cur,
      mine: s.cur ? s.votes[s.cur]?.[vid] || null : null,
      locked: s.cur ? s.locked[s.cur] || null : null,
      deadline: s.cur ? s.deadlines?.[s.cur] || null : null,
      now: Date.now(),
    };
  }

  send(ws, att) {
    try {
      ws.send(JSON.stringify(att.role === "host" ? this.hostState() : this.voterState(att.vid)));
    } catch {}
  }

  pushHosts(exclude) {
    const msg = JSON.stringify(this.hostState(exclude));
    for (const ws of this.ctx.getWebSockets("host")) {
      if (ws === exclude) continue;
      try { ws.send(msg); } catch {}
    }
  }

  pushVoter(vid) {
    const msg = JSON.stringify(this.voterState(vid));
    for (const ws of this.ctx.getWebSockets("voter")) {
      if (ws.deserializeAttachment()?.vid === vid) {
        try { ws.send(msg); } catch {}
      }
    }
  }

  pushAll() {
    this.pushHosts();
    for (const ws of this.ctx.getWebSockets("voter")) {
      const a = ws.deserializeAttachment();
      try { ws.send(JSON.stringify(this.voterState(a?.vid))); } catch {}
    }
  }
}
