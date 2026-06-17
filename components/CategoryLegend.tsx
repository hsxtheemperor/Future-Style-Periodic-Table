'use client'

import { CATEGORIES } from '@/lib/types'

interface Props {
  activeCategoryId: string | null
  onToggle: (id: string | null) => void
}

export function CategoryLegend({ activeCategoryId, onToggle }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {CATEGORIES.map(cat => {
        const isActive = activeCategoryId === cat.uiName
        return (
          <button
            key={cat.uiName}
            onClick={() => onToggle(isActive ? null : cat.uiName)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 border backdrop-blur-sm"
            style={isActive
              ? {
                  background: `${cat.color}18`,
                  borderColor: `${cat.color}70`,
                  color: cat.color,
                  boxShadow: `0 0 12px ${cat.color}25, inset 0 0 8px ${cat.color}08`,
                  fontWeight: 600,
                }
              : {
                  background: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)',
                }
            }
            aria-pressed={isActive}
            aria-label={`Filter by ${cat.nameEn}`}
          >
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0 transition-all duration-200"
              style={{ 
                background: cat.color,
                boxShadow: isActive ? `0 0 6px ${cat.color}80` : 'none',
              }}
            />
            {cat.nameEn}
          </button>
        )
      })}
    </div>
  )
}
