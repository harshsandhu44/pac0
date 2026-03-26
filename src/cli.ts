export interface CLIArgs {
  username: string
  output: string
  token: string
}

export function parseArgs(argv: string[]): CLIArgs {
  const args: Record<string, string> = {}

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg && arg.startsWith('--')) {
      const key = arg.slice(2)
      const value = argv[i + 1] ?? ''
      args[key] = value
      i++ // skip value
    }
  }

  const token = process.env['GITHUB_TOKEN']
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required')
  }

  const username = args['username']
  if (!username) {
    throw new Error('--username <github-username> is required')
  }

  return {
    username,
    output: args['output'] ?? 'dist/pac0.svg',
    token,
  }
}
