/**
 * Cascadex Biopunk v2 Color Palette
 * Bioluminescent organism scanner aesthetic
 */

export const COLORS = {
  // Core backgrounds
  bg: {
    void: '#020408',         // true void black — main background
    surface: '#0A0F18',      // card/panel surfaces
    elevated: '#111827',     // modals, sheets
    border: '#1A2332',       // dividers and borders
  },

  // Primary palette
  primary: '#00FFB2',        // bioluminescent teal
  secondary: '#00E5FF',      // neon cyan
  enzyme: '#A855F7',         // brighter violet
  danger: '#FF0066',         // toxic magenta
  warning: '#FFB800',        // bioluminescent amber
  safe: '#00FFB2',           // bio-glow teal

  // Graph node types
  graph: {
    drug: '#00E5FF',         // neon cyan
    enzyme: '#A855F7',       // violet
    metabolite: '#00FFB2',   // teal
    receptor: '#FF0066',     // magenta
  },

  // Text
  text: {
    primary: '#E8F0FF',      // off-white with slight blue tint
    secondary: '#6B8299',    // muted steel
    muted: '#2D4052',        // ghost text
    inverse: '#020408',      // for light surfaces
  },

  // Glow variants (for shadows/borders)
  glow: {
    teal: 'rgba(0, 255, 178, 0.25)',
    tealStrong: 'rgba(0, 255, 178, 0.5)',
    cyan: 'rgba(0, 229, 255, 0.20)',
    magenta: 'rgba(255, 0, 102, 0.25)',
    magentaStrong: 'rgba(255, 0, 102, 0.5)',
    violet: 'rgba(168, 85, 247, 0.25)',
    amber: 'rgba(255, 184, 0, 0.20)',
  },

  // Semantic
  severity: {
    critical: '#FF0066',
    moderate: '#FFB800',
    safe: '#00FFB2',
    unknown: '#6B8299',
  },

  // Glass membrane
  glass: {
    bg: 'rgba(10, 15, 24, 0.75)',
    border: 'rgba(0, 255, 178, 0.12)',
    borderDanger: 'rgba(255, 0, 102, 0.15)',
  },
} as const;

export type ColorToken = typeof COLORS;
