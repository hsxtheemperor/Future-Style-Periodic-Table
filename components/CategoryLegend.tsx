'use client'

import { CATEGORIES } from '@/lib/types'

interface Props {
  activeCategoryId: string | null
  onToggle: (id: string | null) => void
}

export function CategoryLegend({ activeCategoryId, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {CATEGORIES.map(cat => {
        const isActive = activeCategoryId === cat.uiName
        return (
          <button
            key={cat.uiName}
            onClick={() => onToggle(isActive ? null : cat.uiName)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border"
            style={isActive
              ? {
                  background: `${cat.color}20`,
                  borderColor: `${cat.color}80`,
                  color: cat.color,
                  boxShadow: `0 0 12px ${cat.color}30`,
                }
              : {
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.45)',
                }
            }
            aria-pressed={isActive}
            aria-label={`Filter by ${cat.nameEn}`}
          >
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: cat.color }}
            />
            {cat.nameEn}
          </button>
        )
      })}
    </div>
  )
}
