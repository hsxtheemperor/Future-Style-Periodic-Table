'use client'

import { useMemo } from 'react'
import type { Element, VisualizationMode } from '@/lib/types'
import { getGroupNotations } from '@/lib/types'
import { getHeatmapRange } from '@/lib/elements'
import { ElementCard } from './ElementCard'

interface Props {
  elements: Element[]
  mode: VisualizationMode
  activeCategoryId: string | null
  searchQuery: string
  onSelect: (el: Element) => void
  phaseTemperature?: number
}

const COLS = 18
const ROWS = 10
const CELL_W = 66
const CELL_H = 74
const GAP = 4

// Height of the dual group-header row above the table
const HEADER_H = 36

export function PeriodicTable({
  elements,
  mode,
  activeCategoryId,
  searchQuery,
  onSelect,
  phaseTemperature = 293,
}: Props) {
  const isHeatmap = mode !== 'standard' && mode !== 'nucleosynthesis' && mode !== 'phase-state'

  const [heatMin, heatMax] = useMemo(
    () => (isHeatmap ? getHeatmapRange(elements, mode) : [0, 1]),
    [elements, mode, isHeatmap]
  )

  const byPos = useMemo(() => {
    const map: Record<string, Element> = {}
    for (const el of elements) map[`${el.xpos},${el.ypos}`] = el
    return map
  }, [elements])

  const totalWidth  = COLS * CELL_W + (COLS - 1) * GAP
  const totalHeight = ROWS * CELL_H + (ROWS - 1) * GAP + HEADER_H

  return (
    <div
      className="relative"
      style={{ width: totalWidth, height: totalHeight, flexShrink: 0 }}
      role="grid"
      aria-label="Periodic Table of Elements"
    >

      {/* ── Dual Group headers ────────────────────────────────────────────── */}
      {Array.from({ length: 18 }, (_, i) => i + 1).map(g => {
        const [modern, cas, old] = getGroupNotations(g)
        return (
          <div
            key={`gh-${g}`}
            className="absolute flex flex-col items-center justify-end pb-1"
            style={{
              left: (g - 1) * (CELL_W + GAP),
              top: 0,
              width: CELL_W,
              height: HEADER_H,
            }}
          >
            {/* Modern number — primary */}
            <span className="text-[11px] font-mono font-semibold leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>
              {modern}
            </span>
            {/* CAS / Old-IUPAC — stacked dim row */}
            <span className="text-[8px] font-mono leading-tight" style={{ color: 'rgba(0,212,255,0.35)' }}>
              {cas}&thinsp;/&thinsp;{old}
            </span>
          </div>
        )
      })}

      {/* ── Period labels ─────────────────────────────────────────────────── */}
      {[1, 2, 3, 4, 5, 6, 7].map(p => (
        <div
          key={`period-${p}`}
          className="absolute text-[10px] font-mono text-white/25 flex items-center justify-center"
          style={{
            left: -18,
            top: HEADER_H + (p - 1) * (CELL_H + GAP),
            width: 14,
            height: CELL_H,
          }}
        >
          {p}
        </div>
      ))}

      {/* ── Lanthanide / Actinide placeholder cells ───────────────────────── */}
      {[
        { row: 6, label: '57–71', name: 'Lanthanides' },
        { row: 7, label: '89–103', name: 'Actinides'  },
      ].map(({ row, label, name }) => (
        <div
          key={label}
          className="absolute flex flex-col items-center justify-center rounded text-center"
          style={{
            left: 2 * (CELL_W + GAP),
            top: HEADER_H + (row - 1) * (CELL_H + GAP),
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

      {/* ── Connector lines La/Ac rows ────────────────────────────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 0,
          top: HEADER_H + 7 * (CELL_H + GAP) + CELL_H / 2 - 0.5,
          width: 2 * (CELL_W + GAP) + CELL_W,
          height: 1,
          background: 'rgba(0,212,255,0.08)',
        }}
      />

      {/* La–Lu / Ac–Lr row labels */}
      {[
        { row: 9,  text: 'La–Lu' },
        { row: 10, text: 'Ac–Lr' },
      ].map(({ row, text }) => (
        <div
          key={text}
          className="absolute text-[9px] font-mono text-white/20"
          style={{
            left: 3 * (CELL_W + GAP) - 2,
            top: HEADER_H + (row - 1) * (CELL_H + GAP) + CELL_H / 2 - 6,
          }}
        >
          {text}
        </div>
      ))}

      {/* ── All elements ──────────────────────────────────────────────────── */}
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
          phaseTemperature={phaseTemperature}
          style={{
            position: 'absolute',
            left: (el.xpos - 1) * (CELL_W + GAP),
            top: HEADER_H + (el.ypos - 1) * (CELL_H + GAP),
            width: CELL_W,
            height: CELL_H,
            animationDelay: `${idx * 6}ms`,
          }}
        />
      ))}
    </div>
  )
}
