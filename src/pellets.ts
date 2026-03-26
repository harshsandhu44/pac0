import type { NormalizedGrid, CellNode, PelletGrid, PelletType, Theme, WeekData } from './types.js'

function computeThresholds(weeks: WeekData[]): { small: number; medium: number; large: number } {
  const counts = weeks
    .flatMap((w) => w.days.map((d) => d.count))
    .filter((c) => c > 0)
    .sort((a, b) => a - b)
  if (counts.length === 0) return { small: 1, medium: 4, large: 11 }
  const p = (pct: number) => counts[Math.floor(counts.length * pct)] ?? counts[counts.length - 1]!
  return { small: p(0.33), medium: p(0.67), large: p(0.9) }
}

function classifyPellet(count: number, t: ReturnType<typeof computeThresholds>): PelletType {
  if (count === 0) return 'none'
  if (count <= t.small) return 'small'
  if (count <= t.medium) return 'medium'
  if (count <= t.large) return 'large'
  return 'power'
}

export function buildPellets(grid: NormalizedGrid, theme: Theme): PelletGrid {
  const { cellStep, gridOffsetX, gridOffsetY } = theme.sizes
  const thresholds = computeThresholds(grid.weeks)
  const cells: CellNode[] = []

  for (const week of grid.weeks) {
    week.days.forEach((day, dayIndex) => {
      const x = gridOffsetX + week.weekIndex * cellStep + cellStep / 2
      const y = gridOffsetY + dayIndex * cellStep + cellStep / 2
      cells.push({
        weekIndex: week.weekIndex,
        dayIndex,
        x,
        y,
        pelletType: classifyPellet(day.count, thresholds),
        count: day.count,
        pathIndex: -1,
      })
    })
  }

  // Traverse weeks in chronological (calendar) order.
  // Serpentine direction alternates by week index: even weeks go top-to-bottom,
  // odd weeks go bottom-to-top.
  const path: CellNode[] = []

  for (let i = 0; i < grid.weeks.length; i++) {
    const week = grid.weeks[i]!
    const colCells = cells
      .filter((c) => c.weekIndex === week.weekIndex)
      .sort((a, b) => (i % 2 === 0 ? a.dayIndex - b.dayIndex : b.dayIndex - a.dayIndex))

    for (const cell of colCells) {
      cell.pathIndex = path.length
      path.push(cell)
    }
  }

  return { cells, path, cellStep }
}
