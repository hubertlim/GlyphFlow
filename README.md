# GlyphFlow

> Kinetic text art generator — text shaped into animated forms, rendered to Canvas at 60fps with zero DOM measurement.

![GlyphFlow demo](docs/screenshoot.gif)

Powered by [Pretext](https://github.com/chenglou/pretext) by [Cheng Lou](https://github.com/chenglou) — a pure JavaScript library that measures and lays out multiline text without triggering DOM reflow. GlyphFlow uses its `layoutNextLine()` API to assign a different width to every line, creating dynamic shapes that animate in real-time.

Because Pretext's layout is pure arithmetic over cached measurements, it can run every animation frame without jank — something impossible with traditional DOM-based text measurement.

## Try It

**[Live Demo →](https://hubertlim.github.io/GlyphFlow/)**

## Features

- 9 animated shape functions (sine, funnel, diamond, heartbeat, zigzag, spiral, wave collapse, hourglass, staircase)
- 9 color modes (gradient, rainbow, thermal, monochrome, ocean, neon, sunset, forest, cyberpunk)
- 8 preset themes that combine shape, color, font, and text into one click
- Multilingual text support (Latin, CJK, Arabic, emoji)
- Real-time controls for font, size, shape, speed, and line height
- Export current frame to PNG
- Zero DOM text measurement — everything renders to Canvas

## Quick Start

```bash
docker compose up --build -d
```

Open [http://localhost:3000](http://localhost:3000). To stop:

```bash
docker compose down
```

## Local Development

Requires [Node.js](https://nodejs.org/) >= 18.

```bash
npm install
npm run dev
```

## How It Works

1. Text is prepared once via `prepareWithSegments()` — segments are measured using the browser's Canvas font engine
2. Each animation frame, `layoutNextLine()` is called per line with a width determined by the active shape function and current time
3. Lines are centered and rendered to Canvas with color derived from width ratio
4. Shape guide lines are drawn as subtle overlays

The key insight: because layout is a pure function of (prepared text, width), you can call it thousands of times per second with different widths and get instant results.

## Tech Stack

- [Pretext](https://github.com/chenglou/pretext) — text measurement and layout engine
- [Vite](https://vite.dev/) — build tool
- Vanilla JS — no framework dependencies
- Canvas API — rendering
- Docker — containerized build and serve

## Contributing

Contributions are welcome. Whether it's a new shape function, color mode, theme, or bug fix — all PRs are appreciated.

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and ideas.

Some ways to get involved:
- 🎨 Add a new shape or color mode
- 🌍 Add a multilingual text preset
- ⌨️ Add keyboard shortcuts
- 📱 Improve mobile/responsive layout
- 🐛 Report a bug or suggest a feature via [Issues](https://github.com/hubertlim/GlyphFlow/issues)

## Acknowledgments

This project exists thanks to [Cheng Lou](https://github.com/chenglou) and his work on [Pretext](https://github.com/chenglou/pretext). Pretext's architecture — Canvas `measureText` for shaping, streaming line breaking, and pure-arithmetic layout — is what makes real-time kinetic text art possible in the browser. The original design was informed by [Sebastian Markbage](https://github.com/sebmarkbage)'s [text-layout](https://github.com/nicolo-ribaudo/tc39-proposal-structs) explorations.

If you find Pretext interesting, go [star the original repo](https://github.com/chenglou/pretext) — it deserves more attention.

## License

[MIT](LICENSE)
