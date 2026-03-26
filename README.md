# pac0

An animated SVG generator that transforms your GitHub contribution graph into a Pac-Man-inspired arcade animation — a chomper character traverses the contribution grid, eating pellets that represent your coding activity.

![pac0](https://raw.githubusercontent.com/harshsandhu44/pac0/refs/heads/output/pac0.svg)

---

## How it works

1. **Fetch** — pulls the last 365 days of contributions from the GitHub GraphQL API
2. **Normalize** — maps raw API data to a typed week/day grid
3. **Build path** — creates a serpentine traversal in chronological calendar order: week 0 goes top-to-bottom, week 1 goes bottom-to-top, week 2 top-to-bottom, and so on
4. **Render** — generates an animated SVG where the chomper follows the path and pellets disappear on contact

Pellet sizing adapts to the user's actual contribution distribution (percentile-based):

| Count                     | Pellet type           |
| ------------------------- | --------------------- |
| 0                         | empty (dark cell)     |
| bottom 33% of active days | small                 |
| 34–67%                    | medium                |
| 68–90%                    | large                 |
| top 10%                   | power (gold, pulsing) |

---

## Local setup

**Requirements:** [Bun](https://bun.sh)

```bash
git clone https://github.com/YOUR_USERNAME/pac0
cd pac0
bun install
```

---

## Environment variables

| Variable       | Required | Description                                                              |
| -------------- | -------- | ------------------------------------------------------------------------ |
| `GITHUB_TOKEN` | Yes      | Personal access token (read:user scope) or GitHub Actions built-in token |

---

## Generate the SVG locally

```bash
GITHUB_TOKEN=ghp_xxxx bun run generate -- --username YOUR_GITHUB_USERNAME
```

Options:

- `--username` — GitHub username (required)
- `--output` — output file path (default: `dist/pac0.svg`)

---

## Preview locally

Generate from mock data (no GitHub token needed):

```bash
bun run mock
bun run preview    # opens preview.html in your default browser (macOS)
```

Or open `preview.html` manually — it loads `dist/pac0.svg` directly.

---

## Run tests

```bash
bun test
```

Covers traversal order, bucket mapping, timeline structure, and SVG output sanity.

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
          username: ${{ github.repository_owner }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          output: dist/pac0.svg

      - name: Push to output branch
        run: |
          cp dist/pac0.svg /tmp/pac0.svg
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git fetch origin
          if git show-ref --verify --quiet refs/remotes/origin/output; then
            git checkout -b output origin/output
          else
            git checkout --orphan output
            git rm -rf . --quiet
          fi
          cp /tmp/pac0.svg pac0.svg
          git add pac0.svg
          git diff --staged --quiet || git commit -m "chore: update pac0.svg [skip ci]"
          git push origin HEAD:output
```

Then embed in your profile README:

```markdown
![My Contributions](https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/refs/heads/output/pac0.svg)
```

### Action inputs

| Input          | Required | Default         | Description                                   |
| -------------- | -------- | --------------- | --------------------------------------------- |
| `username`     | Yes      | —               | GitHub username to generate the animation for |
| `github_token` | No       | `github.token`  | Token for fetching contribution data          |
| `output`       | No       | `dist/pac0.svg` | Output file path, relative to the repo root   |

---

## Self-hosted setup (this repo)

The included workflow (`.github/workflows/generate.yml`) runs daily at midnight UTC and publishes the updated SVG to the `output` branch automatically.

To enable it:

1. Push this repo to GitHub
2. Go to **Actions** → **Generate pac0 SVG** → **Run workflow** (first manual run)
3. After that it updates daily on the schedule

No additional secrets needed — the workflow uses the built-in `GITHUB_TOKEN`.

---

## Embed in your GitHub profile README

```markdown
![My Contributions](https://raw.githubusercontent.com/harshsandhu44/pac0/refs/heads/output/pac0.svg)
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
  mock.ts         Generate SVG from mock data (no token needed)

tests/
  pellets.test.ts   Traversal order + bucket mapping tests
  timeline.test.ts  Animation timing tests
  render.test.ts    SVG output sanity tests

dist/
  pac0.svg        Generated output (published to the output branch by the Action)
```
