import type { RawContributionWeek, NormalizedGrid, WeekData, ContributionDay } from './types.js'

export function normalizeWeeks(
  rawWeeks: RawContributionWeek[],
  username: string,
  year: number,
): NormalizedGrid {
  const weeks: WeekData[] = rawWeeks.map((raw, index) => {
    const days: ContributionDay[] = raw.contributionDays.map(d => ({
      date: d.date,
      count: d.contributionCount,
    }))
    const total = days.reduce((sum, d) => sum + d.count, 0)
    return { weekIndex: index, days, total }
  })

  return { weeks, username, year }
}
