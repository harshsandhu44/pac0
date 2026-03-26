import { describe, it, expect } from 'bun:test'
import { buildTimeline } from '../src/timeline.ts'
import { buildPellets } from '../src/pellets.ts'
import { normalizeWeeks } from '../src/normalize.ts'
import { defaultTheme } from '../src/themes/arcade.ts'
import type { RawContributionWeek } from '../src/types.ts'

function makeGrid(weekCount: number) {
  const rawWeeks: RawContributionWeek[] = Array.from({ length: weekCount }, (_, w) => ({
    contributionDays: Array.from({ length: 7 }, (_, d) => ({
      date: `2025-01-${String(w * 7 + d + 1).padStart(2, '0')}`,
      contributionCount: (w + d) % 15,
    })),
  }))
  return normalizeWeeks(rawWeeks, 'testuser')
}

describe('buildTimeline', () => {
  it('duration is within [50, 120] for a full 53-week grid', () => {
    const grid = makeGrid(53)
    const pelletGrid = buildPellets(grid, defaultTheme)
    const timeline = buildTimeline(pelletGrid)
    expect(timeline.totalDuration).toBeGreaterThanOrEqual(50)
    expect(timeline.totalDuration).toBeLessThanOrEqual(120)
  })

  it('cellTimings length matches path length', () => {
    const grid = makeGrid(10)
    const pelletGrid = buildPellets(grid, defaultTheme)
    const timeline = buildTimeline(pelletGrid)
    expect(timeline.cellTimings.length).toBe(pelletGrid.path.length)
  })

  it('keyPoints and keyTimes have the same number of values', () => {
    const grid = makeGrid(10)
    const pelletGrid = buildPellets(grid, defaultTheme)
    const timeline = buildTimeline(pelletGrid)
    const kpCount = timeline.keyPoints.split(';').length
    const ktCount = timeline.keyTimes.split(';').length
    expect(kpCount).toBe(ktCount)
  })

  it('handles empty path without throwing', () => {
    const timeline = buildTimeline({ cells: [], path: [], cellStep: 16 })
    expect(timeline.pathD).toBe('')
    expect(timeline.totalDuration).toBe(50)
    expect(timeline.cellTimings).toEqual([])
  })
})
