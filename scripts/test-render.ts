// Local smoke test: generate an SVG from mock contribution data without hitting the GitHub API
import { normalizeWeeks } from '../src/normalize.ts'
import { buildPellets } from '../src/pellets.ts'
import { buildTimeline } from '../src/timeline.ts'
import { renderSVG } from '../src/render-svg.ts'
import { defaultTheme } from '../src/themes/arcade.ts'
import type { RawContributionWeek } from '../src/types.ts'

function mockWeeks(count: number): RawContributionWeek[] {
  const weeks: RawContributionWeek[] = []
  for (let w = 0; w < count; w++) {
    const days = []
    for (let d = 0; d < 7; d++) {
      const wave = Math.sin(w * 0.4) * 0.5 + Math.sin(w * 1.1 + d * 0.3) * 0.3 + 0.2
      const base = Math.max(0, Math.floor(wave * 25))
      const contributionCount = w % 5 === 2 ? 0 : base
      days.push({ date: `2025-01-${String(w * 7 + d + 1).padStart(2, '0')}`, contributionCount })
    }
    weeks.push({ contributionDays: days })
  }
  return weeks
}

const rawWeeks = mockWeeks(53)
const grid = normalizeWeeks(rawWeeks, 'testuser', 2025)
const pelletGrid = buildPellets(grid, defaultTheme)
const timeline = buildTimeline(pelletGrid)
const svg = renderSVG(grid, pelletGrid, timeline, defaultTheme)

const powerCount = pelletGrid.cells.filter(c => c.pelletType === 'power').length
const noneCount  = pelletGrid.cells.filter(c => c.pelletType === 'none').length
console.log(`Pellets: ${powerCount} power, ${noneCount} empty, ${pelletGrid.cells.length - powerCount - noneCount} normal, ${pelletGrid.path.length} in path`)
console.log(`Timeline: ${timeline.totalDuration.toFixed(2)}s, path length: ${timeline.pathD.length} chars`)
console.log(`SVG size: ${svg.length} bytes`)

await Bun.write('dist/test-render.svg', svg)
await Bun.write('dist/galaxy.svg', svg)
console.log('Written to dist/test-render.svg and dist/galaxy.svg')
