# pac0

An animated SVG generator that transforms your GitHub contribution graph into a Pac-Man-inspired arcade animation — a chomper character traverses the contribution grid, eating pellets that represent your coding activity.

![Galaxy](https://raw.githubusercontent.com/harshsandhu44/pac0/output/galaxy.svg)

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
git clone https://github.com/YOUR_USERNAME/pac0
cd pac0
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

## Use as a GitHub Action

Add pac0 to any repo's workflow to auto-generate and publish your animation:

```yaml
name: Generate pac0 SVG

on:
  schedule:
    - cron: '0 0 * * *'
  workflow_dispatch:

permissions:
  contents: write

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: harshsandhu44/pac0@main
        with:
          github_user_name: ${{ github.repository_owner }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          outputs: galaxy.svg

      - name: Push to output branch
        run: |
          cp galaxy.svg /tmp/galaxy.svg
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git fetch origin
          if git show-ref --verify --quiet refs/remotes/origin/output; then
            git checkout -b output origin/output
          else
            git checkout --orphan output
            git rm -rf . --quiet
          fi
          cp /tmp/galaxy.svg galaxy.svg
          git add galaxy.svg
          git diff --staged --quiet || git commit -m "chore: update galaxy.svg [skip ci]"
          git push origin HEAD:output
```

Then embed in your profile README:

```markdown
![My Contributions](https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/output/galaxy.svg)
```

### Action inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `github_user_name` | Yes | — | GitHub username to generate the animation for |
| `github_token` | No | `github.token` | Token for fetching contribution data |
| `outputs` | No | `dist/galaxy.svg` | Output file path(s), one per line |
| `year` | No | current year | Calendar year to generate for |

---

## Self-hosted setup (this repo)

The included workflow (`.github/workflows/generate-galaxy.yml`) runs daily at midnight UTC and publishes the updated SVG to the `output` branch automatically.

To enable it:
1. Push this repo to GitHub
2. Go to **Actions** → **Generate Galaxy SVG** → **Run workflow** (first manual run)
3. After that it updates daily on the schedule

No additional secrets needed — the workflow uses the built-in `GITHUB_TOKEN`.

---

## Embed in your GitHub profile README

```markdown
![My Contributions](https://raw.githubusercontent.com/harshsandhu44/pac0/output/galaxy.svg)
```

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
  galaxy.svg      Generated output (published to the output branch by the Action)
```
