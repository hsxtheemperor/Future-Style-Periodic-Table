import type { Element } from './types'
import { CATEGORY_COLOR_MAP, CATEGORY_EN_MAP } from './types'
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
    case 'radius': return el.radius
    case 'en': return el.electronegativity_pauling
    case 'ip': return el.ionization_energies?.[0] ?? null
    case 'melt': return el.melt
    case 'boil': return el.boil
    case 'density': return el.density
    default: return null
  }
}

export function getHeatmapRange(elements: Element[], mode: string): [number, number] {
  const vals = elements
    .map(e => getHeatmapValue(e, mode))
    .filter((v): v is number => v !== null && isFinite(v))
  if (vals.length === 0) return [0, 1]
  return [Math.min(...vals), Math.max(...vals)]
}

export function heatmapColor(value: number | null, min: number, max: number): string {
  if (value === null || value === undefined) return 'rgba(255,255,255,0.04)'
  const t = Math.max(0, Math.min(1, (value - min) / (max - min || 1)))
  // Deep blue → cyan → green → yellow → red
  const stops = [
    [0, 30, 120],     // deep blue
    [0, 180, 220],    // cyan
    [30, 200, 100],   // green
    [220, 200, 30],   // yellow
    [240, 50, 30],    // red
  ]
  const seg = t * (stops.length - 1)
  const i = Math.floor(seg)
  const frac = seg - i
  const a = stops[Math.min(i, stops.length - 1)]
  const b = stops[Math.min(i + 1, stops.length - 1)]
  const r = Math.round(a[0] + (b[0] - a[0]) * frac)
  const g = Math.round(a[1] + (b[1] - a[1]) * frac)
  const bl = Math.round(a[2] + (b[2] - a[2]) * frac)
  return `rgb(${r}, ${g}, ${bl})`
}

export function formatValue(val: number | null | undefined, decimals = 3): string {
  if (val === null || val === undefined) return '—'
  if (!isFinite(val)) return '—'
  return Number(val.toPrecision(decimals)).toString()
}
