import type { PelletGrid, AnimationTimeline } from './types.js'

// Equal time budget per cell regardless of jump distance between columns.
// Long inter-column dashes will appear faster; within-column steps feel normal.
const CELL_DURATION = 0.07  // seconds per cell before clamping
const MIN_DURATION = 15
const MAX_DURATION = 30

export function buildTimeline(pelletGrid: PelletGrid): AnimationTimeline {
  const path = pelletGrid.path
  if (path.length === 0) {
    return { pathD: '', totalDuration: MIN_DURATION, cellTimings: [], keyPoints: '0;1', keyTimes: '0;1' }
  }

  // Build SVG path string for animateMotion
  const first = path[0]!
  const parts: string[] = [`M ${first.x},${first.y}`]
  for (let i = 1; i < path.length; i++) {
    parts.push(`L ${path[i]!.x},${path[i]!.y}`)
  }
  const pathD = parts.join(' ')

  // Clamp total duration based on cell count
  const rawDuration = path.length * CELL_DURATION
  const totalDuration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, rawDuration))

  const N = path.length

  // Equal time per cell: each cell gets 1/(N-1) of the total time
  const cellTimings = path.map((_, i) =>
    N === 1 ? 0 : (i / (N - 1)) * totalDuration
  )

  // keyTimes: equal spacing 0 → 1 (one entry per path node)
  const keyTimeValues = path.map((_, i) => (N === 1 ? 0 : i / (N - 1)))

  // keyPoints: proportional to cumulative pixel distance along path
  // This decouples visual speed from time: long column-to-column jumps get
  // the same time budget as short within-column steps, so the chomper dashes
  // between columns and cruises within them.
  const cumDist: number[] = [0]
  for (let i = 1; i < N; i++) {
    const dx = path[i]!.x - path[i - 1]!.x
    const dy = path[i]!.y - path[i - 1]!.y
    cumDist.push(cumDist[i - 1]! + Math.sqrt(dx * dx + dy * dy))
  }
  const totalDist = cumDist[N - 1]!

  const keyPointValues = totalDist > 0
    ? cumDist.map(d => d / totalDist)
    : path.map((_, i) => (N === 1 ? 0 : i / (N - 1)))

  const fmt = (v: number) => v.toFixed(4)
  const keyTimes  = keyTimeValues.map(fmt).join(';')
  const keyPoints = keyPointValues.map(fmt).join(';')

  return { pathD, totalDuration, cellTimings, keyPoints, keyTimes }
}
