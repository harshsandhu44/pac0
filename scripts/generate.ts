import { parseArgs } from '../src/cli.ts'
import { fetchContributions } from '../src/github.ts'
import { normalizeWeeks } from '../src/normalize.ts'
import { buildPellets } from '../src/pellets.ts'
import { buildTimeline } from '../src/timeline.ts'
import { renderSVG } from '../src/render-svg.ts'
import { defaultTheme } from '../src/themes/arcade.ts'

const args = parseArgs(process.argv.slice(2))

console.log(`Fetching contributions for @${args.username} (last 365 days)...`)

const rawWeeks = await fetchContributions({
  username: args.username,
  token: args.token,
})

const grid = normalizeWeeks(rawWeeks, args.username)
console.log(`Received ${grid.weeks.length} weeks of data`)

const pelletGrid = buildPellets(grid, defaultTheme)
const powerCount = pelletGrid.cells.filter((c) => c.pelletType === 'power').length
const noneCount = pelletGrid.cells.filter((c) => c.pelletType === 'none').length
console.log(
  `Pellets: ${powerCount} power, ${noneCount} empty, ${pelletGrid.cells.length - powerCount - noneCount} normal`
)

const timeline = buildTimeline(pelletGrid)
console.log(
  `Animation: ${pelletGrid.path.length} cells, ${timeline.totalDuration.toFixed(1)}s total`
)

const svg = renderSVG(grid, pelletGrid, timeline, defaultTheme)

await Bun.write(args.output, svg)
console.log(`Written to ${args.output}`)
