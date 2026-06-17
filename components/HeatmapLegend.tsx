'use client'

import { heatmapColor } from '@/lib/elements'

interface Props {
  min: number
  max: number
  unit: string
  label: string
}

export function HeatmapLegend({ min, max, unit, label }: Props) {
  const stops = 20
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-white/35 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-white/40">{min.toPrecision(3)}</span>
        <div
          className="h-3 rounded w-40 overflow-hidden"
          style={{
            background: `linear-gradient(to right, ${Array.from({ length: stops }, (_, i) => heatmapColor(min + (max - min) * (i / (stops - 1)), min, max)).join(', ')})`,
          }}
        />
        <span className="text-[10px] font-mono text-white/40">{max.toPrecision(3)}</span>
        {unit && <span className="text-[10px] text-white/30">{unit}</span>}
      </div>
    </div>
  )
}
