import type { NormalizedGrid, CellNode, PelletGrid, PelletType, Theme } from './types.js'

function getPelletType(count: number): PelletType {
  if (count === 0) return 'none'
  if (count < 4) return 'small'
  if (count < 11) return 'medium'
  if (count < 21) return 'large'
  return 'power'
}

export function buildPellets(grid: NormalizedGrid, theme: Theme): PelletGrid {
  const { cellStep, gridOffsetX, gridOffsetY } = theme.sizes
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
        pelletType: getPelletType(day.count),
        count: day.count,
        pathIndex: -1,
      })
    })
  }

  // Sort weeks by total contribution ascending so the chomper visits
  // the least-active columns first and ends on the most-active ones.
  // Within each column, serpentine direction alternates by sorted index
  // (not week index) to keep motion smooth and grid-aligned.
  const sortedWeeks = [...grid.weeks].sort((a, b) =>
    a.total !== b.total ? a.total - b.total : a.weekIndex - b.weekIndex
  )

  const path: CellNode[] = []

  for (let sortedIdx = 0; sortedIdx < sortedWeeks.length; sortedIdx++) {
    const week = sortedWeeks[sortedIdx]!
    const colCells = cells
      .filter(c => c.weekIndex === week.weekIndex)
      .sort((a, b) => sortedIdx % 2 === 0 ? a.dayIndex - b.dayIndex : b.dayIndex - a.dayIndex)

    for (const cell of colCells) {
      cell.pathIndex = path.length
      path.push(cell)
    }
  }

  return { cells, path, cellStep }
}
