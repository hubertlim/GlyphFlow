# Pretext Demo

A single-page application showcasing [@chenglou/pretext](https://github.com/chenglou/pretext) — a pure JavaScript/TypeScript library for multiline text measurement and layout without DOM reflow.

## Demos

1. **Paragraph Height Without DOM** — computes text height via `prepare()` + `layout()` using pure arithmetic
2. **Canvas Rendering** — breaks text into lines with `prepareWithSegments()` + `layoutWithLines()` and renders directly to `<canvas>`
3. **Shrink-Wrap Width** — finds the tightest container width using `walkLineRanges()`

All demos are interactive with editable text and resizable width sliders.

## Quick Start (Docker)

```bash
docker compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000).

To stop:

```bash
docker compose down
```

## Local Development

Requires [Node.js](https://nodejs.org/) >= 18.

```bash
npm install
npm run dev
```

## Tech Stack

- [Vite](https://vite.dev/) — build tool
- [@chenglou/pretext](https://github.com/chenglou/pretext) — text measurement engine
- Vanilla JS — no framework dependencies
- [Inter](https://rsms.me/inter/) — font (loaded from Google Fonts)

## License

MIT
