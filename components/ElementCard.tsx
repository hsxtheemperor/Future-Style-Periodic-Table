'use client'

import { memo, useMemo } from 'react'
import type { Element, VisualizationMode } from '@/lib/types'
import {
  getCategoryColor,
  getHeatmapValue,
  heatmapColor,
  electronegativityColor,
  radiusColor,
  nucleosynthesisColor,
  phaseAtTemperature,
  PHASE_COLOR,
  formatValue,
} from '@/lib/elements'

interface Props {
  element: Element
  mode: VisualizationMode
  heatmapMin: number
  heatmapMax: number
  activeCategoryId: string | null
  searchQuery: string
  onSelect: (el: Element) => void
  style?: React.CSSProperties
  /** Temperature in Kelvin — used only for phase-state mode */
  phaseTemperature?: number
}

function matchesSearch(el: Element, q: string): boolean {
  if (!q) return false
  const lq = q.toLowerCase().trim()
  return (
    el.name_en.toLowerCase().includes(lq) ||
    el.symbol.toLowerCase().includes(lq) ||
    String(el.number).includes(lq) ||
    el.category_en.toLowerCase().includes(lq) ||
    !!(el.block && el.block.toLowerCase().includes(lq))
  )
}

export const ElementCard = memo(function ElementCard({
  element,
  mode,
  heatmapMin,
  heatmapMax,
  activeCategoryId,
  searchQuery,
  onSelect,
  style,
  phaseTemperature = 293,
}: Props) {
  const isOverlay = mode === 'nucleosynthesis' || mode === 'phase-state'
  const isHeatmap = mode !== 'standard' && !isOverlay

  // Resolve the card accent colour for this mode
  const bgColor = useMemo(() => {
    if (mode === 'nucleosynthesis') {
      return nucleosynthesisColor(element.number)
    }
    if (mode === 'phase-state') {
      const phase = phaseAtTemperature(element, phaseTemperature)
      return PHASE_COLOR[phase]
    }
    if (isHeatmap) {
      const val = getHeatmapValue(element, mode)
      // Use specialized vivid color functions for specific modes
      if (mode === 'en') {
        return electronegativityColor(val, heatmapMin, heatmapMax)
      }
      if (mode === 'radius') {
        return radiusColor(val, heatmapMin, heatmapMax)
      }
      // Default heatmap color for other modes (density, melting, boiling, ip)
      return heatmapColor(val, heatmapMin, heatmapMax)
    }
    return getCategoryColor(element.category_ui_name, element.color_hex)
  }, [mode, element, heatmapMin, heatmapMax, isHeatmap, phaseTemperature])

  // Heatmap numeric value (shown in corner)
  const heatVal = isHeatmap ? getHeatmapValue(element, mode) : null

  // Phase label for phase-state mode
  const phaseLabel = mode === 'phase-state'
    ? phaseAtTemperature(element, phaseTemperature)
    : null

  // Visibility
  const catMatch = activeCategoryId === null || element.category_ui_name === activeCategoryId
  const searchActive = searchQuery.trim().length > 0
  const searchMatch = searchActive ? matchesSearch(element, searchQuery) : false

  let opacity = 1
  if (activeCategoryId !== null && !catMatch) opacity = 0.1
  if (searchActive && !searchMatch) opacity = 0.08
  if (searchActive && searchMatch) opacity = 1
  if (activeCategoryId !== null && catMatch && !searchActive) opacity = 1

  // For radius/EN modes the entire card background IS the data visualization — fully opaque.
  const isSolidBg = isHeatmap && (mode === 'radius' || mode === 'en')

  const borderColor = searchMatch
    ? 'rgba(0,212,255,0.9)'
    : isSolidBg
      ? 'rgba(0,0,0,0.25)'
      : isHeatmap || isOverlay
        ? bgColor.replace('rgb(', 'rgba(').replace(')', ', 0.4)')
        : `${bgColor}50`
  const cardBg = useMemo(() => {
    if (isSolidBg) {
      // bgColor is already a full rgb(...) string — use it directly as a solid background
      return bgColor
    }
    if (isHeatmap) {
      // Other heatmaps: tinted bg using inline rgba
      return bgColor.replace('rgb(', 'rgba(').replace(')', ', 0.55)')
    }
    if (isOverlay) {
      return bgColor.replace('rgb(', 'rgba(').replace(')', ', 0.28)')
    }
    // Standard mode: subtle tint (bgColor may be a hex string here)
    return `${bgColor}38`
  }, [isSolidBg, isHeatmap, isOverlay, bgColor])

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${element.name_en}, atomic number ${element.number}`}
      onClick={() => onSelect(element)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(element)}
      className="element-card select-none hover:scale-105 hover:z-50"
      style={{
        ...style,
        opacity,
        backgroundColor: cardBg,
        borderColor,
        boxShadow: searchMatch ? '0 0 16px rgba(0,212,255,0.5), 0 0 32px rgba(0,212,255,0.2)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Atomic number */}
      <span
        className="absolute top-[3px] left-[5px] text-[9px] font-mono leading-none"
        style={{
          color: isSolidBg ? 'rgba(255,255,255,0.9)' : isHeatmap || isOverlay ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.55)',
          textShadow: isSolidBg ? '0 1px 2px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        {element.number}
      </span>

      {/* Symbol */}
      <span
        className="text-[21px] font-semibold font-serif leading-none mt-[6px]"
        style={{
          color: isSolidBg ? '#ffffff' : isHeatmap || isOverlay ? '#ffffff' : bgColor,
          textShadow: isSolidBg ? '0 1px 4px rgba(0,0,0,0.5)' : `0 0 12px ${bgColor}90`,
          letterSpacing: '-0.01em',
        }}
      >
        {element.symbol}
      </span>

      {/* Name */}
      <span
        className="text-[8.5px] font-normal mt-[1px] leading-none truncate w-full text-center px-0.5 font-serif"
        style={{
          color: isSolidBg ? 'rgba(255,255,255,0.92)' : isHeatmap || isOverlay ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.65)',
          textShadow: isSolidBg ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {element.name_en}
      </span>

      {/* Bottom-right info chip */}
      {isHeatmap && heatVal !== null && (
        <span
          className="absolute bottom-[2px] right-[3px] text-[8px] font-mono font-bold"
          style={{
            color: isSolidBg ? 'rgba(255,255,255,0.9)' : bgColor,
            textShadow: isSolidBg ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
          }}
        >
          {formatValue(heatVal)}
        </span>
      )}

      {mode === 'phase-state' && phaseLabel && phaseLabel !== 'unknown' && (
        <span
          className="absolute bottom-[2px] right-[3px] text-[7.5px] font-mono font-semibold capitalize"
          style={{ color: bgColor }}
        >
          {phaseLabel}
        </span>
      )}

      {!isHeatmap && !isOverlay && (
        <span
          className="absolute bottom-[2px] right-[3px] text-[8px] font-mono"
          style={{ color: `${bgColor}a0` }}
        >
          {element.atomic_mass.toPrecision(4)}
        </span>
      )}
    </div>
  )
})
