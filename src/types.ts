// Raw shapes from GitHub GraphQL API
export interface RawContributionDay {
  date: string
  contributionCount: number
}

export interface RawContributionWeek {
  contributionDays: RawContributionDay[]
}

// Normalized domain model
export interface ContributionDay {
  date: string
  count: number
}

export interface WeekData {
  weekIndex: number
  days: ContributionDay[]
  total: number
}

export interface NormalizedGrid {
  weeks: WeekData[]
  username: string
}

// Pellet grid
export type PelletType = 'none' | 'small' | 'medium' | 'large' | 'power'

export interface CellNode {
  weekIndex: number
  dayIndex: number // 0-6 (row in the grid)
  x: number // center x in SVG
  y: number // center y in SVG
  pelletType: PelletType
  count: number
  pathIndex: number // order in serpentine traversal
}

export interface PelletGrid {
  cells: CellNode[] // all cells in week/day order
  path: CellNode[] // cells in serpentine traversal order
  cellStep: number // pixel distance between cell centers
}

// Animation timeline
export interface AnimationTimeline {
  pathD: string // SVG path 'd' attribute for animateMotion
  totalDuration: number // seconds
  cellTimings: number[] // arrival time (s) at each cell in path order
  keyPoints: string // animateMotion keyPoints: path progress at each keyTime
  keyTimes: string // animateMotion keyTimes: equal time per cell
}

// Theme
export interface ThemeColors {
  bg: string
  gridEmpty: string // faint cell for 0-contribution days
  pelletSmall: string
  pelletMedium: string
  pelletLarge: string
  pelletPower: string
  chomperFill: string
  chomperMouth: string
  chomperEye: string
}

export interface ThemeSizes {
  width: number
  height: number
  cellSize: number // visible pixel size of each cell square
  cellStep: number // spacing between cell centers (cellSize + gap)
  chomperRadius: number
  gridOffsetX: number // left padding to start of grid
  gridOffsetY: number // top padding to start of grid
}

export interface Theme {
  colors: ThemeColors
  sizes: ThemeSizes
}
