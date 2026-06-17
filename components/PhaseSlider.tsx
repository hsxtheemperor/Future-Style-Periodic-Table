'use client'

import { PHASE_COLOR, type PhaseAtTemp } from '@/lib/elements'

interface Props {
  temperature: number
  onChange: (t: number) => void
}

const PRESETS = [
  { label: '0 K', value: 0, note: 'Absolute Zero' },
  { label: '77 K', value: 77, note: 'Liquid N₂' },
  { label: '293 K', value: 293, note: 'Room Temp' },
  { label: '1000 K', value: 1000, note: 'Forge Heat' },
  { label: '3000 K', value: 3000, note: 'Arc Plasma' },
  { label: '6000 K', value: 6000, note: 'Solar Surface' },
]

const PHASES: { id: PhaseAtTemp; label: string }[] = [
  { id: 'solid',   label: 'Solid' },
  { id: 'liquid',  label: 'Liquid' },
  { id: 'gas',     label: 'Gas' },
  { id: 'unknown', label: 'Unknown' },
]

export function PhaseSlider({ temperature, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Slider row */}
      <div className="flex items-center gap-3 px-2">
        <span className="text-[10px] font-mono text-white/35 w-6 text-right flex-shrink-0">0 K</span>
        <input
          type="range"
          min={0}
          max={6000}
          step={5}
          value={temperature}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 phase-slider"
          aria-label="Temperature in Kelvin"
        />
        <span className="text-[10px] font-mono text-white/35 w-10 flex-shrink-0">6000 K</span>
        {/* Live readout */}
        <span
          className="text-[13px] font-mono font-semibold w-24 text-right flex-shrink-0 px-3 py-1.5 rounded-lg"
          style={{ 
            color: '#00d4ff',
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.2)',
          }}
        >
          {temperature.toLocaleString()} K
        </span>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 px-2">
        {PRESETS.map(p => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className="text-[10px] font-mono px-3 py-1.5 rounded-lg transition-all duration-150 border"
            style={
              temperature === p.value
                ? { 
                    background: 'rgba(0,212,255,0.15)',
                    color: '#00d4ff',
                    borderColor: 'rgba(0,212,255,0.5)',
                    boxShadow: '0 0 8px rgba(0,212,255,0.2)',
                    fontWeight: 600,
                  }
                : { 
                    background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.45)',
                    borderColor: 'rgba(255,255,255,0.1)',
                  }
            }
            title={p.note}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-2 pt-1">
        {PHASES.map(ph => (
          <div key={ph.id} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 shadow-lg"
              style={{ 
                background: PHASE_COLOR[ph.id],
                boxShadow: `0 0 8px ${PHASE_COLOR[ph.id]}60`,
              }}
            />
            <span className="text-[10px] text-white/45 font-medium">{ph.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
