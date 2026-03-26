import type { Theme } from '../types.js'

export const defaultTheme: Theme = {
  colors: {
    bg: '#0d1117',
    gridEmpty: '#161b22',
    pelletSmall: '#39d353',
    pelletMedium: '#26a641',
    pelletLarge: '#2ea043',
    pelletPower: '#FFD700',
    chomperFill: '#FFD700',
    chomperMouth: '#0d1117',
    chomperEye: '#1a1a1a',
  },
  sizes: {
    width: 900,
    height: 200,
    cellSize: 12,
    cellStep: 16, // 12px cell + 4px gap; 53 cols × 16 = 848px + 8px offset = 856px
    chomperRadius: 7,
    gridOffsetX: 8,
    gridOffsetY: 40, // room for title above grid; 7 rows × 16 = 112px → grid ends at y=152
  },
}
