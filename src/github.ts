import type { RawContributionWeek } from './types.js'

const GRAPHQL_URL = 'https://api.github.com/graphql'

const QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`

interface GraphQLResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: RawContributionWeek[]
        }
      }
    } | null
  }
  errors?: Array<{ message: string }>
}

export interface FetchOptions {
  username: string
  token: string
  year?: number
}

export async function fetchContributions(opts: FetchOptions): Promise<RawContributionWeek[]> {
  // Always fetch the last 365 days from today so the grid spans a full year
  // regardless of when in the calendar year the script runs.
  const today = new Date()
  const to = today.toISOString().slice(0, 19) + 'Z'
  const oneYearAgo = new Date(today)
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  const from = oneYearAgo.toISOString().slice(0, 19) + 'Z'

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${opts.token}`,
      'Content-Type': 'application/json',
      // GitHub API requires a User-Agent header
      'User-Agent': 'pac0/1.0',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { username: opts.username, from, to },
    }),
  })

  if (!response.ok) {
    throw new Error(`GitHub API returned HTTP ${response.status}: ${await response.text()}`)
  }

  const json = await response.json() as GraphQLResponse

  // GraphQL errors come back as HTTP 200 with an errors field
  if (json.errors && json.errors.length > 0) {
    throw new Error(`GitHub GraphQL error: ${json.errors[0]?.message ?? 'unknown'}`)
  }

  if (!json.data?.user) {
    throw new Error(`GitHub user '${opts.username}' not found or contributions are private`)
  }

  return json.data.user.contributionsCollection.contributionCalendar.weeks
}
