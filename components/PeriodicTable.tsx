'use client'

import { useMemo } from 'react'
import type { Element, VisualizationMode } from '@/lib/types'
import { getHeatmapRange } from '@/lib/elements'
import { ElementCard } from './ElementCard'

interface Props {
  elements: Element[]
  mode: VisualizationMode
  activeCategoryId: string | null
  searchQuery: string
  onSelect: (el: Element) => void
}

const COLS = 18
const ROWS = 10
const CELL_W = 66
const CELL_H = 74
const GAP = 4

export function PeriodicTable({ elements, mode, activeCategoryId, searchQuery, onSelect }: Props) {
  const [heatMin, heatMax] = useMemo(
    () => (mode !== 'standard' ? getHeatmapRange(elements, mode) : [0, 1]),
    [elements, mode]
  )

  // Build a position lookup
  const byPos = useMemo(() => {
    const map: Record<string, Element> = {}
    for (const el of elements) {
      map[`${el.xpos},${el.ypos}`] = el
    }
    return map
  }, [elements])

  const totalWidth = COLS * CELL_W + (COLS - 1) * GAP
  const totalHeight = ROWS * CELL_H + (ROWS - 1) * GAP

  return (
    <div
      className="relative"
      style={{ width: totalWidth, height: totalHeight, flexShrink: 0 }}
      role="grid"
      aria-label="Periodic Table of Elements"
    >
      {/* Period labels */}
      {[1, 2, 3, 4, 5, 6, 7].map(p => (
        <div
          key={`period-${p}`}
          className="absolute text-[10px] font-mono text-white/25 flex items-center justify-center"
          style={{
            left: -18,
            top: (p - 1) * (CELL_H + GAP),
            width: 14,
            height: CELL_H,
          }}
        >
          {p}
        </div>
      ))}

      {/* Group labels */}
      {Array.from({ length: 18 }, (_, i) => i + 1).map(g => (
        <div
          key={`group-${g}`}
          className="absolute text-[10px] font-mono text-white/20 flex items-center justify-center"
          style={{
            left: (g - 1) * (CELL_W + GAP),
            top: -16,
            width: CELL_W,
            height: 14,
          }}
        >
          {g}
        </div>
      ))}

      {/* Lanthanide/Actinide row separators */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          top: 7 * (CELL_H + GAP) + CELL_H / 2 - 0.5,
          width: 2 * (CELL_W + GAP) + CELL_W,
          height: 1,
          background: 'rgba(0,212,255,0.08)',
        }}
      />

      {/* Lanthanide label */}
      <div
        className="absolute text-[9px] font-mono text-white/20 text-right"
        style={{
          right: totalWidth - 3 * (CELL_W + GAP) + CELL_W - 4,
          top: 8 * (CELL_H + GAP) + CELL_H / 2 - 6,
        }}
      >
        La–Lu
      </div>
      <div
        className="absolute text-[9px] font-mono text-white/20 text-right"
        style={{
          right: totalWidth - 3 * (CELL_W + GAP) + CELL_W - 4,
          top: 9 * (CELL_H + GAP) + CELL_H / 2 - 6,
        }}
      >
        Ac–Lr
      </div>

      {/* Placeholder cells for lanthanide/actinide rows */}
      {[{ row: 6, label: '57–71', name: 'Lanthanides' }, { row: 7, label: '89–103', name: 'Actinides' }].map(({ row, label, name }) => (
        <div
          key={label}
          className="absolute flex flex-col items-center justify-center rounded text-center"
          style={{
            left: 2 * (CELL_W + GAP),
            top: (row - 1) * (CELL_H + GAP),
            width: CELL_W,
            height: CELL_H,
            background: 'rgba(255,255,255,0.015)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: 5,
          }}
        >
          <span className="text-[11px] font-bold" style={{ color: '#00d4ff' }}>{label}</span>
          <span className="text-[8.5px] text-white/35 mt-0.5">{name}</span>
        </div>
      ))}

      {/* All elements */}
      {elements.map((el, idx) => (
        <ElementCard
          key={el.number}
          element={el}
          mode={mode}
          heatmapMin={heatMin}
          heatmapMax={heatMax}
          activeCategoryId={activeCategoryId}
          searchQuery={searchQuery}
          onSelect={onSelect}
          style={{
            position: 'absolute',
            left: (el.xpos - 1) * (CELL_W + GAP),
            top: (el.ypos - 1) * (CELL_H + GAP),
            width: CELL_W,
            height: CELL_H,
            animationDelay: `${idx * 6}ms`,
          }}
        />
      ))}
    </div>
  )
}
