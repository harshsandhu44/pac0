import { describe, it, expect } from 'bun:test'
import { renderSVG } from '../src/render-svg.ts'
import { buildPellets } from '../src/pellets.ts'
import { buildTimeline } from '../src/timeline.ts'
import { normalizeWeeks } from '../src/normalize.ts'
import { defaultTheme } from '../src/themes/arcade.ts'
import type { RawContributionWeek } from '../src/types.ts'

// Deterministic mock: same wave function as scripts/mock.ts
function mockWeeks(count: number): RawContributionWeek[] {
  return Array.from({ length: count }, (_, w) => ({
    contributionDays: Array.from({ length: 7 }, (_, d) => {
      const wave = Math.sin(w * 0.4) * 0.5 + Math.sin(w * 1.1 + d * 0.3) * 0.3 + 0.2
      const base = Math.max(0, Math.floor(wave * 25))
      return {
        date: `2025-01-${String(w * 7 + d + 1).padStart(2, '0')}`,
        contributionCount: w % 5 === 2 ? 0 : base,
      }
    }),
  }))
}

describe('renderSVG', () => {
  const grid = normalizeWeeks(mockWeeks(53), 'testuser')
  const pelletGrid = buildPellets(grid, defaultTheme)
  const timeline = buildTimeline(pelletGrid)
  const svg = renderSVG(grid, pelletGrid, timeline, defaultTheme)

  it('produces a valid SVG string', () => {
    expect(svg.trimStart()).toMatch(/^<svg /)
    expect(svg).toContain('</svg>')
  })

  it('includes the username', () => {
    expect(svg).toContain('@testuser')
  })

  it('has reasonable size (>10KB)', () => {
    expect(svg.length).toBeGreaterThan(10_000)
  })

  it('includes animateMotion for the chomper', () => {
    expect(svg).toContain('<animateMotion')
  })

  it('has a viewBox matching theme dimensions', () => {
    expect(svg).toContain(`viewBox="0 0 ${defaultTheme.sizes.width} ${defaultTheme.sizes.height}"`)
  })
})
