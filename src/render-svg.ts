import type { NormalizedGrid, PelletGrid, CellNode, AnimationTimeline, Theme } from './types.js'

function pelletRadius(type: CellNode['pelletType']): number {
  switch (type) {
    case 'small':  return 3
    case 'medium': return 4
    case 'large':  return 5
    case 'power':  return 6
    default:       return 0
  }
}

function pelletColor(type: CellNode['pelletType'], colors: Theme['colors']): string {
  switch (type) {
    case 'small':  return colors.pelletSmall
    case 'medium': return colors.pelletMedium
    case 'large':  return colors.pelletLarge
    case 'power':  return colors.pelletPower
    default:       return 'transparent'
  }
}

function renderGridBackground(pelletGrid: PelletGrid, theme: Theme): string {
  const { cellSize } = theme.sizes
  const half = cellSize / 2
  const rx = Math.max(1, Math.round(cellSize * 0.18))
  return pelletGrid.cells
    .map(c =>
      `<rect x="${(c.x - half).toFixed(1)}" y="${(c.y - half).toFixed(1)}" ` +
      `width="${cellSize}" height="${cellSize}" rx="${rx}" fill="${theme.colors.gridEmpty}"/>`
    )
    .join('\n  ')
}

function renderPellets(pelletGrid: PelletGrid, timeline: AnimationTimeline, theme: Theme): string {
  const parts: string[] = []
  const dur = timeline.totalDuration.toFixed(2)

  for (const cell of pelletGrid.path) {
    if (cell.pelletType === 'none') continue

    const r = pelletRadius(cell.pelletType)
    const fill = pelletColor(cell.pelletType, theme.colors)
    const timing = timeline.cellTimings[cell.pathIndex] ?? 0
    // Clamp ratio away from 0 so the pellet is at least briefly visible
    const ratio = Math.max(0.001, timing / timeline.totalDuration).toFixed(4)
    const cx = cell.x.toFixed(1)
    const cy = cell.y.toFixed(1)

    if (cell.pelletType === 'power') {
      // Power pellet: pulsing size + synced disappearance
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}">` +
        `<animate attributeName="r" values="${r};${r + 2};${r}" dur="0.8s" repeatCount="indefinite"/>` +
        `<animate attributeName="opacity" values="1;0;0" keyTimes="0;${ratio};1" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>` +
        `</circle>`
      )
    } else {
      parts.push(
        `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}">` +
        `<animate attributeName="opacity" values="1;0;0" keyTimes="0;${ratio};1" calcMode="discrete" dur="${dur}s" repeatCount="indefinite"/>` +
        `</circle>`
      )
    }
  }

  return parts.join('\n  ')
}

function renderChomper(theme: Theme, timeline: AnimationTimeline): string {
  const r = theme.sizes.chomperRadius
  const fill = theme.colors.chomperFill
  const mouth = theme.colors.chomperMouth
  const eye = theme.colors.chomperEye

  // Chomper faces right (+x direction). rotate="auto" on animateMotion handles turns.
  // Mouth is a dark wedge overlaid on the yellow circle.
  // Open: 30° half-angle; Closed: 3° half-angle.
  const openX  = (r * 0.866).toFixed(2)
  const openY  = (r * 0.5).toFixed(2)
  const closedX = (r * 0.9986).toFixed(2)
  const closedY = (r * 0.0523).toFixed(2)

  const openPath   = `M 0,0 L ${openX},-${openY} A ${r},${r} 0 0,1 ${openX},${openY} Z`
  const closedPath = `M 0,0 L ${closedX},-${closedY} A ${r},${r} 0 0,1 ${closedX},${closedY} Z`

  // Eye: slightly forward and up relative to center (moves with rotate="auto")
  const eyeCx = '1'
  const eyeCy = (-r * 0.55).toFixed(1)

  return `<g id="chomper">
    <animateMotion
      path="${timeline.pathD}"
      dur="${timeline.totalDuration.toFixed(2)}s"
      repeatCount="indefinite"
      rotate="auto"
      keyPoints="${timeline.keyPoints}"
      keyTimes="${timeline.keyTimes}"
      calcMode="linear"/>
    <circle r="${r}" fill="${fill}"/>
    <path fill="${mouth}" d="${openPath}">
      <animate attributeName="d"
               values="${openPath};${closedPath};${openPath}"
               dur="0.3s"
               repeatCount="indefinite"/>
    </path>
    <circle cx="${eyeCx}" cy="${eyeCy}" r="1.5" fill="${eye}"/>
  </g>`
}

export function renderSVG(
  grid: NormalizedGrid,
  pelletGrid: PelletGrid,
  timeline: AnimationTimeline,
  theme: Theme,
): string {
  const { width, height } = theme.sizes
  const { bg, pelletPower } = theme.colors

  const gridBg  = renderGridBackground(pelletGrid, theme)
  const pellets = renderPellets(pelletGrid, timeline, theme)
  const chomper = renderChomper(theme, timeline)

  return `<svg xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 ${width} ${height}"
  width="${width}"
  height="${height}"
  role="img"
  aria-label="${grid.username}'s GitHub contributions (${grid.year})">
  <title>${grid.username}'s GitHub contributions — ${grid.year}</title>
  <desc>A chomper traverses a pellet grid built from ${grid.username}'s ${grid.year} GitHub contribution history.</desc>

  <rect width="${width}" height="${height}" fill="${bg}"/>

  <text x="10" y="28" fill="#8b949e" font-family="monospace" font-size="13" font-weight="bold">@${grid.username}</text>
  <text x="${width - 10}" y="28" fill="${pelletPower}" font-family="monospace" font-size="11" text-anchor="end">${grid.year}</text>

  ${gridBg}

  ${pellets}

  ${chomper}
</svg>`
}
