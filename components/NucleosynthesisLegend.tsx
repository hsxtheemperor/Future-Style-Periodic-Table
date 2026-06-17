'use client'

import { NUCLEOSYNTHESIS_LABEL, NUCLEOSYNTHESIS_COLOR, type NucleosynthesisOrigin } from '@/lib/types'

const ENTRIES = Object.entries(NUCLEOSYNTHESIS_LABEL) as [NucleosynthesisOrigin, string][]

export function NucleosynthesisLegend() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {ENTRIES.map(([key, label]) => (
        <div key={key} className="flex items-center gap-2.5">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 shadow-lg"
            style={{ 
              background: NUCLEOSYNTHESIS_COLOR[key],
              boxShadow: `0 0 8px ${NUCLEOSYNTHESIS_COLOR[key]}70`,
            }}
          />
          <span className="text-[10px] text-white/50 whitespace-nowrap font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}
