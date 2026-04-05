# GlyphFlow

Kinetic text art generator powered by [@chenglou/pretext](https://github.com/chenglou/pretext) — a pure JavaScript library for text measurement and layout without DOM reflow.

Text is shaped into dynamic forms (sine waves, funnels, diamonds) using Pretext's `layoutNextLine()` API with variable widths per line, rendered directly to Canvas at 60fps. Because layout is pure arithmetic, it runs every animation frame without jank.

## Features

- Variable-width line layout with animated shape functions
- Multiple color modes (gradient, rainbow, thermal, monochrome)
- Multilingual text support (Latin, CJK, Arabic, emoji)
- Real-time parameter tweaking (font, size, shape, speed)
- Export to PNG
- Zero DOM text measurement — everything is Canvas

## Quick Start

```bash
docker compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000).

```bash
docker compose down
```

## Local Development

```bash
npm install
npm run dev
```

## Tech Stack

- [Vite](https://vite.dev/) — build tool
- [@chenglou/pretext](https://github.com/chenglou/pretext) — text measurement engine
- Vanilla JS — no framework
- Canvas API — rendering

## License

MIT
