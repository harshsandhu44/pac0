import { describe, it, expect } from 'bun:test'
import { buildPellets } from '../src/pellets.ts'
import { normalizeWeeks } from '../src/normalize.ts'
import { defaultTheme } from '../src/themes/arcade.ts'
import type { RawContributionWeek } from '../src/types.ts'

function makeWeeks(
  count: number,
  countFn: (w: number, d: number) => number
): RawContributionWeek[] {
  return Array.from({ length: count }, (_, w) => ({
    contributionDays: Array.from({ length: 7 }, (_, d) => ({
      date: `2025-01-${String(w * 7 + d + 1).padStart(2, '0')}`,
      contributionCount: countFn(w, d),
    })),
  }))
}

describe('traversal order', () => {
  it('visits weeks in chronological (calendar) order', () => {
    const rawWeeks = makeWeeks(5, (w, d) => w + d)
    const grid = normalizeWeeks(rawWeeks, 'testuser')
    const { path } = buildPellets(grid, defaultTheme)

    // All week 0 cells should come before week 1 cells, etc.
    const weekOrder = path.map((c) => c.weekIndex)
    for (let i = 1; i < weekOrder.length; i++) {
      expect(weekOrder[i]!).toBeGreaterThanOrEqual(weekOrder[i - 1]!)
    }
  })

  it('week 0 traverses top-to-bottom (day 0 first)', () => {
    const rawWeeks = makeWeeks(2, () => 1)
    const grid = normalizeWeeks(rawWeeks, 'testuser')
    const { path } = buildPellets(grid, defaultTheme)

    const week0 = path.filter((c) => c.weekIndex === 0)
    const dayOrder = week0.map((c) => c.dayIndex)
    expect(dayOrder).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('week 1 traverses bottom-to-top (day 6 first)', () => {
    const rawWeeks = makeWeeks(2, () => 1)
    const grid = normalizeWeeks(rawWeeks, 'testuser')
    const { path } = buildPellets(grid, defaultTheme)

    const week1 = path.filter((c) => c.weekIndex === 1)
    const dayOrder = week1.map((c) => c.dayIndex)
    expect(dayOrder).toEqual([6, 5, 4, 3, 2, 1, 0])
  })
})

describe('pellet bucket mapping', () => {
  it('assigns none to zero-count days', () => {
    const rawWeeks = makeWeeks(4, (w, d) => (w === 0 && d === 0 ? 0 : w + 1))
    const grid = normalizeWeeks(rawWeeks, 'testuser')
    const { cells } = buildPellets(grid, defaultTheme)

    const zeroCell = cells.find((c) => c.count === 0)
    expect(zeroCell?.pelletType).toBe('none')
  })

  it('power pellets are the top ~10% of active days', () => {
    // Give a wide spread of values so power is truly at the top
    const rawWeeks = makeWeeks(10, (w, d) => w * 7 + d)
    const grid = normalizeWeeks(rawWeeks, 'testuser')
    const { cells } = buildPellets(grid, defaultTheme)

    const activeCells = cells.filter((c) => c.count > 0)
    const powerCells = activeCells.filter((c) => c.pelletType === 'power')
    const ratio = powerCells.length / activeCells.length
    // Power should be roughly the top 10% — allow some slack
    expect(ratio).toBeLessThan(0.15)
  })

  it('assigns at least 3 distinct types for varied data', () => {
    const rawWeeks = makeWeeks(10, (w, d) => (w * 7 + d) % 20)
    const grid = normalizeWeeks(rawWeeks, 'testuser')
    const { cells } = buildPellets(grid, defaultTheme)

    const types = new Set(cells.map((c) => c.pelletType))
    expect(types.size).toBeGreaterThanOrEqual(3)
  })
})
