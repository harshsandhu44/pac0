# astr0naut

An animated SVG generator that transforms your GitHub contribution graph into a Pac-Man-inspired arcade animation — a chomper character traverses the contribution grid, eating pellets that represent your coding activity.

![Galaxy](./dist/galaxy.svg)

---

## How it works

- Each contribution cell maps to a grid node in the animation
- Zero-contribution cells are empty (dark grid squares, like GitHub's empty cells)
- Low contributions (1–3) become small pellets
- Medium contributions (4–10) become medium pellets
- High contributions (11–20) become large pellets
- Very high contributions (21+) become power pellets (gold, pulsing)
- The chomper traverses the grid in a serpentine pattern: left to right across weeks, alternating top-to-bottom and bottom-to-top within each column
- Pellets disappear as the chomper reaches them, then reappear at the start of each loop

---

## Local setup

**Requirements:** [Bun](https://bun.sh)

```bash
# Clone and install
git clone https://github.com/YOUR_USERNAME/astr0naut
cd astr0naut
bun install
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GITHUB_TOKEN` | Yes | Personal access token (read:user scope) or GitHub Actions built-in token |

---

## Generate the SVG locally

```bash
GITHUB_TOKEN=ghp_xxxx bun run generate -- --username YOUR_GITHUB_USERNAME
```

Options:
- `--username` — GitHub username (required)
- `--output` — output file path (default: `dist/galaxy.svg`)
- `--year` — year to fetch (default: current year)

The SVG is written to `dist/galaxy.svg` by default.

---

## Preview locally

Open `preview.html` in a browser, or use the quick HTML preview:

```html
<!-- preview.html -->
<html>
<body style="background:#0d1117; margin:0; padding:20px">
  <img src="./dist/galaxy.svg" style="width:100%; max-width:900px">
</body>
</html>
```

To generate from mock data (no GitHub token needed):

```bash
bun run scripts/test-render.ts
open preview.html
```

---

## Embed in your GitHub profile README

```markdown
![My Contributions](https://raw.githubusercontent.com/YOUR_USERNAME/astr0naut/main/dist/galaxy.svg)
```

Or using a relative path if this lives in your profile repo:

```markdown
![My Contributions](./dist/galaxy.svg)
```

---

## GitHub Action (auto-update)

The included workflow (`.github/workflows/generate-galaxy.yml`) runs daily at midnight UTC and commits an updated SVG automatically.

To enable it:
1. Push this repo to GitHub
2. Go to **Actions** → **Generate Galaxy SVG** → **Run workflow** (first manual run)
3. After that it updates daily on the schedule

No additional secrets are needed — the workflow uses the built-in `GITHUB_TOKEN`.

---

## Project structure

```
src/
  cli.ts          CLI argument parser
  github.ts       GitHub GraphQL contribution fetcher
  normalize.ts    Normalize API response to internal model
  pellets.ts      Map contribution cells to pellet grid + serpentine path
  timeline.ts     Compute chomper path and animation timing
  render-svg.ts   Generate the final animated SVG
  types.ts        TypeScript types
  themes/
    arcade.ts     Default dark arcade theme (colors + sizes)

scripts/
  generate.ts     Main generation script
  test-render.ts  Local smoke test with mock data

dist/
  galaxy.svg      Generated output (committed by the Action)
```
