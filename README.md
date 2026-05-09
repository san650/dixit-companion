# Dixit Companion

A small companion booklet for Dixit storytellers. Generates a category by
pairing an _activity_ (Música, Cine, Política, …) with a _region_ (Argentina,
Uruguay, Europa, …, or _del mundo_) so the clue giver has a narrower frame to
spin their tale around.

Built as a static, mobile-first PWA: HTML + CSS + JS, no build step, works
offline after the first load.

## Use it

Open `index.html` over HTTP (the service worker won't register from
`file://`):

```sh
python3 -m http.server 8765
# then open http://localhost:8765
```

Click **Empezar partida** to begin a game. Each click of **Otra categoría**
generates a fresh pair, pushing the previous one into the recede stack
behind it. **Bitácora** opens the full session log; **Terminar partida**
clears the game (with a confirmation step) and returns to the empty state.

The current game persists across page refreshes via `localStorage`.

## Editing categories

`data.json` defines the pool. Each activity carries its own list of regions:

```json
{
  "activities": [
    { "name": "Música", "regions": ["Argentina", "Uruguay", "..."] },
    { "name": "Mitos",  "regions": [] }
  ]
}
```

`del mundo` is added to every activity at runtime, so you don't need to list
it. An empty `regions` array means the activity only pairs with `del mundo`.

## Project layout

```
index.html             app shell
styles.css             theme (Fraunces serif, midnight + gold palette)
app.js                 game logic, persistence, log dialog
data.json              activities and their regions
manifest.webmanifest   PWA manifest
service-worker.js      offline cache (shell + data + Google Fonts)
icon.svg               app icon
```

## License

[MIT](./LICENSE) — Copyright (c) 2026 Santiago Ferreira.
