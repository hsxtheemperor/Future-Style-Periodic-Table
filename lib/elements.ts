import type { Element } from './types'
import {
  CATEGORY_COLOR_MAP,
  CATEGORY_EN_MAP,
  NUCLEOSYNTHESIS_MAP,
  NUCLEOSYNTHESIS_COLOR,
} from './types'
import rawData from './elements.json'

const raw = rawData as { elements: Element[] }

export function getElements(): Element[] {
  return raw.elements
}

export function getCategoryColor(categoryUiName: string, colorHex?: string | null): string {
  if (colorHex) return colorHex
  return CATEGORY_COLOR_MAP[categoryUiName] || '#6b7280'
}

export function getCategoryNameEn(categoryUiName: string): string {
  return CATEGORY_EN_MAP[categoryUiName] || categoryUiName
}

export function getHeatmapValue(el: Element, mode: string): number | null {
  switch (mode) {
    case 'radius':   return el.radius
    case 'en':       return el.electronegativity_pauling
    case 'ip':       return el.ionization_energies?.[0] ?? null
    case 'melt':     return el.melt
    case 'boil':     return el.boil
    case 'density':  return el.density
    default:         return null
  }
}

export function getHeatmapRange(elements: Element[], mode: string): [number, number] {
  const vals = elements
    .map(e => getHeatmapValue(e, mode))
    .filter((v): v is number => v !== null && isFinite(v))
  if (vals.length === 0) return [0, 1]
  return [Math.min(...vals), Math.max(...vals)]
}

/**
 * Sharp, STEPPED color scale for Electronegativity (Pauling).
 * Uses DISCRETE color bands with SHARP boundaries - smallest change in EN value = noticeable color jump.
 * Range: 0.79 (Fr) to 3.98 (F)
 */
export function electronegativityColor(value: number | null, min: number, max: number): string {
  if (value === null || value === undefined) return 'rgb(40,40,50)'  // dark neutral for missing data
  
  let t = (value - min) / (max - min || 1)
  t = Math.max(0, Math.min(1, t))
  
  // 12 VIVID, DISTINCT color steps - NO interpolation, SHARP boundaries
  if (t < 0.083)  return rgb(75, 0, 130)        // Deep indigo
  if (t < 0.167)  return rgb(0, 50, 200)        // Vivid blue
  if (t < 0.25)   return rgb(0, 120, 255)       // Bright blue-cyan
  if (t < 0.333)  return rgb(0, 200, 255)       // Brilliant cyan
  if (t < 0.417)  return rgb(0, 255, 150)       // Cyan-green
  if (t < 0.5)    return rgb(100, 255, 0)       // Neon lime
  if (t < 0.583)  return rgb(200, 255, 0)       // Bright yellow-green
  if (t < 0.667)  return rgb(255, 220, 0)       // Golden yellow
  if (t < 0.75)   return rgb(255, 160, 0)       // Orange
  if (t < 0.833)  return rgb(255, 80, 0)        // Vivid red-orange
  if (t < 0.917)  return rgb(255, 20, 0)        // Bright red
  return rgb(220, 10, 60)                       // Deep crimson (highest EN)
}

/**
 * Sharp, STEPPED color scale for Atomic Radius.
 * Uses DISCRETE color bands with SHARP boundaries - smallest radius change = noticeable color jump.
 * Range: 25-300 pm approximately
 */
export function radiusColor(value: number | null, min: number, max: number): string {
  if (value === null || value === undefined) return 'rgb(40,40,50)'  // dark neutral for missing data
  
  let t = (value - min) / (max - min || 1)
  t = Math.max(0, Math.min(1, t))
  
  // 12 VIVID, DISTINCT color steps - NO interpolation, SHARP boundaries
  // Small radius (top) → large radius (bottom)
  if (t < 0.083)  return rgb(0, 80, 140)        // Deep teal (smallest)
  if (t < 0.167)  return rgb(0, 140, 200)       // Teal-cyan
  if (t < 0.25)   return rgb(0, 180, 255)       // Bright cyan
  if (t < 0.333)  return rgb(0, 220, 180)       // Cyan-green
  if (t < 0.417)  return rgb(100, 255, 0)       // Neon lime
  if (t < 0.5)    return rgb(180, 255, 0)       // Yellow-green
  if (t < 0.583)  return rgb(255, 220, 0)       // Golden yellow
  if (t < 0.667)  return rgb(255, 180, 0)       // Orange-yellow
  if (t < 0.75)   return rgb(255, 120, 0)       // Bright orange
  if (t < 0.833)  return rgb(255, 60, 0)        // Red-orange
  if (t < 0.917)  return rgb(255, 0, 100)       // Red-magenta
  return rgb(200, 0, 120)                       // Deep magenta (largest)
}

function rgb(r: number, g: number, b: number): string {
  return `rgb(${r},${g},${b})`
}

/**
 * Logarithmic heatmap colour — fixes the "outlier crush" problem where a few
 * extreme values (e.g. carbon boiling at 4300 K, tungsten at 5900 K) pull all
 * other elements into an indistinct muddy mid-tone.
 * Falls back to linear when min ≤ 0 (e.g. negative electron affinities).
 * Used for density, boiling/melting points, and ionization energy.
 */
export function heatmapColor(value: number | null, min: number, max: number): string {
  if (value === null || value === undefined) return 'rgba(255,255,255,0.04)'

  let t: number
  const safeMin = Math.max(min, 1e-6)
  const safeMax = Math.max(max, safeMin + 1e-6)
  const safeVal = Math.max(value, 1e-6)

  if (min > 0) {
    // Log scale: dramatically better contrast across the range
    t = (Math.log(safeVal) - Math.log(safeMin)) / (Math.log(safeMax) - Math.log(safeMin))
  } else {
    // Linear fallback for properties that can be zero or negative
    t = (value - min) / (max - min || 1)
  }
  t = Math.max(0, Math.min(1, t))

  // Cyberpunk gradient: deep indigo → cyan → teal → lime → amber → red
  const stops: [number, number, number][] = [
    [30,  20, 100],   // indigo
    [0,  180, 220],   // cyan
    [20, 210, 150],   // teal-green
    [200,220,  20],   // lime
    [240, 80,  20],   // red-orange
  ]
  const seg = t * (stops.length - 1)
  const i   = Math.floor(seg)
  const frac = seg - i
  const a = stops[Math.min(i, stops.length - 1)]
  const b = stops[Math.min(i + 1, stops.length - 1)]
  const r  = Math.round(a[0] + (b[0] - a[0]) * frac)
  const g  = Math.round(a[1] + (b[1] - a[1]) * frac)
  const bl = Math.round(a[2] + (b[2] - a[2]) * frac)
  return `rgb(${r},${g},${bl})`
}

/** Returns the nucleosynthesis accent colour for an element. */
export function nucleosynthesisColor(atomicNumber: number): string {
  const origin = NUCLEOSYNTHESIS_MAP[atomicNumber] ?? 'unknown'
  return NUCLEOSYNTHESIS_COLOR[origin]
}

/**
 * Returns the phase of an element at a given temperature (K).
 * Uses melting/boiling points from the dataset.
 */
export type PhaseAtTemp = 'solid' | 'liquid' | 'gas' | 'unknown'

export function phaseAtTemperature(el: Element, tempK: number): PhaseAtTemp {
  if (el.melt === null && el.boil === null) return 'unknown'
  if (el.melt !== null && tempK < el.melt) return 'solid'
  if (el.boil !== null && tempK < el.boil) return 'liquid'
  if (el.boil !== null && tempK >= el.boil) return 'gas'
  if (el.melt !== null && tempK >= el.melt) return 'liquid'
  return 'unknown'
}

export const PHASE_COLOR: Record<PhaseAtTemp, string> = {
  solid:   '#60a5fa', // blue
  liquid:  '#34d399', // emerald
  gas:     '#f97316', // orange
  unknown: '#374151', // dark gray
}

export function formatValue(val: number | null | undefined, decimals = 3): string {
  if (val === null || val === undefined) return '—'
  if (!isFinite(val)) return '—'
  return Number(val.toPrecision(decimals)).toString()
}

/**
 * Effective nuclear charge via Slater's Rules (simplified).
 * Zeff = Z - S, where S is the shielding constant.
 */
export function calcZeff(el: Element): number {
  const { shells } = el
  if (!shells || shells.length === 0) return el.number
  // Build a flat electron sequence per shell group
  // Slater groups: [1s] [2s,2p] [3s,3p] [3d] [4s,4p] [4d] [4f] ...
  // Simplified: group shells as given, apply standard Slater shielding
  let S = 0
  const n = shells.length
  for (let i = 0; i < n - 1; i++) {
    // Every electron in a lower shell contributes 0.85 (adjacent) or 1.00 (deeper)
    S += shells[i] * (n - i - 1 === 1 ? 0.85 : 1.0)
  }
  // Electrons in the same (outermost) shell contribute 0.35 each (excluding the electron itself)
  S += (shells[n - 1] - 1) * 0.35
  return Math.max(1, el.number - S)
}
