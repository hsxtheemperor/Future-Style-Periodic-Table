'use client'

import { heatmapColor } from '@/lib/elements'

interface Props {
  min: number
  max: number
  unit: string
  label: string
}

export function HeatmapLegend({ min, max, unit, label }: Props) {
  const stops = 24
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">{label}</span>
      <div className="flex items-center gap-3 w-full justify-center">
        <span className="text-[10px] font-mono text-white/45 min-w-fit">{min.toPrecision(3)}</span>
        <div
          className="h-4 rounded-md overflow-hidden flex-grow max-w-md shadow-lg"
          style={{
            background: `linear-gradient(to right, ${Array.from({ length: stops }, (_, i) => heatmapColor(min + (max - min) * (i / (stops - 1)), min, max)).join(', ')})`,
            boxShadow: '0 0 16px rgba(0,212,255,0.1), inset 0 0 8px rgba(0,0,0,0.2)',
          }}
        />
        <span className="text-[10px] font-mono text-white/45 min-w-fit">{max.toPrecision(3)}</span>
        {unit && <span className="text-[10px] text-white/35 ml-1 font-mono">{unit}</span>}
      </div>
    </div>
  )
}
