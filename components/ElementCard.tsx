'use client'

import { memo, useMemo } from 'react'
import type { Element, VisualizationMode } from '@/lib/types'
import { getCategoryColor, getHeatmapValue, heatmapColor, formatValue } from '@/lib/elements'

interface Props {
  element: Element
  mode: VisualizationMode
  heatmapMin: number
  heatmapMax: number
  activeCategoryId: string | null
  searchQuery: string
  onSelect: (el: Element) => void
  style?: React.CSSProperties
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
}: Props) {
  const isHeatmap = mode !== 'standard'
  const heatVal = isHeatmap ? getHeatmapValue(element, mode) : null
  const bgColor = useMemo(() => {
    if (isHeatmap) return heatmapColor(heatVal, heatmapMin, heatmapMax)
    return getCategoryColor(element.category_ui_name, element.color_hex)
  }, [isHeatmap, heatVal, heatmapMin, heatmapMax, element])

  const catMatch = activeCategoryId === null || element.category_ui_name === activeCategoryId
  const searchActive = searchQuery.trim().length > 0
  const searchMatch = searchActive ? matchesSearch(element, searchQuery) : false

  let opacity = 1
  if (activeCategoryId !== null && !catMatch) opacity = 0.1
  if (searchActive && !searchMatch) opacity = 0.08
  if (searchActive && searchMatch) opacity = 1
  if (activeCategoryId !== null && catMatch && !searchActive) opacity = 1

  const borderColor = useMemo(() => {
    if (searchMatch) return 'rgba(0, 212, 255, 0.9)'
    if (isHeatmap) return 'rgba(0,0,0,0.15)'
    return `${bgColor}50`
  }, [searchMatch, isHeatmap, bgColor])

  const cardBg = isHeatmap ? bgColor : `${bgColor}22`

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${element.name_en}, atomic number ${element.number}`}
      onClick={() => onSelect(element)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(element)}
      className="element-card select-none"
      style={{
        ...style,
        opacity,
        backgroundColor: cardBg,
        borderColor,
        boxShadow: searchMatch ? `0 0 12px rgba(0, 212, 255, 0.4)` : undefined,
        transition: 'background-color 0.35s ease, opacity 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Atomic number */}
      <span
        className="absolute top-[3px] left-[5px] text-[9px] font-mono leading-none"
        style={{ color: isHeatmap ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.5)' }}
      >
        {element.number}
      </span>

      {/* Symbol */}
      <span
        className="text-[21px] font-semibold font-serif leading-none mt-[6px]"
        style={{
          color: isHeatmap ? '#fff' : bgColor,
          textShadow: isHeatmap ? 'none' : `0 0 12px ${bgColor}80`,
          letterSpacing: '-0.01em',
        }}
      >
        {element.symbol}
      </span>

      {/* Name */}
      <span
        className="text-[8.5px] font-normal mt-[1px] leading-none truncate w-full text-center px-0.5 font-serif"
        style={{ color: isHeatmap ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.6)' }}
      >
        {element.name_en}
      </span>

      {/* Heatmap value */}
      {isHeatmap && heatVal !== null && (
        <span className="absolute bottom-[2px] right-[3px] text-[8px] font-mono font-bold text-white/80">
          {formatValue(heatVal)}
        </span>
      )}

      {/* Mass (standard mode) */}
      {!isHeatmap && (
        <span
          className="absolute bottom-[2px] right-[3px] text-[8px] font-mono"
          style={{ color: `${bgColor}90` }}
        >
          {element.atomic_mass.toPrecision(4)}
        </span>
      )}
    </div>
  )
})
