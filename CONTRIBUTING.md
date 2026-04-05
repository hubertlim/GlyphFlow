# Contributing to GlyphFlow

Thanks for your interest in contributing.

## Getting Started

1. Fork the repository
2. Clone your fork and create a branch: `git checkout -b feat/my-feature`
3. Run locally with Docker: `docker compose up --build -d`
4. Make your changes and verify at `http://localhost:3000`
5. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, etc.
6. Push and open a Pull Request

## Development Without Docker

```bash
npm install
npm run dev
```

## Guidelines

- Keep it simple — this is a vanilla JS project, no frameworks
- All text layout must go through Pretext APIs, not DOM measurement
- Test with multilingual text (the "Multilingual" preset is a good baseline)
- Ensure the animation loop stays smooth (check the FPS counter)

## Ideas for Contributions

- New shape functions (spiral, zigzag, custom curves)
- New color modes
- Keyboard shortcuts
- Mobile/responsive sidebar
- Additional font options
