# Kuttelista

Avstemning fra mobilen for Produktforum hos NGU. Deltakerne scanner en QR-kode og tar stilling til én funksjon om gangen: må gjøres før vi lanserer, manuell løsning for en stund eller ingenting nå. Storskjermen holder stemmene skjult til alle har stemt eller tiden er ute, og teller dem så opp.

Caset er en tenkt førsteversjon av Prøvedatabase. Funksjonslista ligger i `public/features.js`.

Kjører på Cloudflare Workers, med én Durable Object per møte. Ingen innlogging, og et møte slettes etter 48 timer.

## Slik bruker du den

1. Åpne forsiden og trykk «Lag nytt møte». Da kommer storskjermen opp.
2. Deltakerne scanner QR-koden.
3. Trykk høyre piltast for å vise første funksjon.

Tastene på storskjermen:

- Høyre og venstre piltast går til neste og forrige funksjon.
- T gir ti sekunder ekstra, og V viser stemmene med en gang.
- L låser det flest stemte på. 1, 2 og 3 låser må gjøres, manuell løsning og ingenting nå.
- S viser oppsummeringen.

## Utvikling

```bash
npm install
npx wrangler dev
```

Push til `main` deployer via GitHub Actions. Wrangler er låst til 4.40.0, fordi nyere versjoner ikke fikk slått på workers.dev-adressen da prosjektet ble satt opp.
