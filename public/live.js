// WebSocket som kobler seg til igjen av seg selv, med ping så mobilnett ikke kutter forbindelsen.
window.connectLive = function (path, onState, onStatus) {
  let ws, ping, tries = 0, closed = false;
  function open() {
    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    ws = new WebSocket(proto + "//" + location.host + path);
    ws.onopen = () => { tries = 0; onStatus && onStatus("on"); ping = setInterval(() => { try { ws.send("ping"); } catch {} }, 20000); };
    ws.onmessage = (e) => { if (e.data === "pong") return; try { onState(JSON.parse(e.data)); } catch {} };
    ws.onclose = (e) => {
      clearInterval(ping); onStatus && onStatus("off");
      if (closed || e.code === 1008) return;
      if (e.code === 1000 && e.reason === "Møtet er slettet") { onStatus && onStatus("gone"); return; }
      setTimeout(open, Math.min(8000, 400 * 2 ** tries++));
    };
  }
  open();
  return { send: (o) => { if (ws && ws.readyState === 1) { ws.send(JSON.stringify(o)); return true; } return false; }, close: () => { closed = true; ws && ws.close(); } };
};
