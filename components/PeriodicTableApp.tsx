'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import type { Element, VisualizationMode } from '@/lib/types'
import { VISUALIZATION_MODES } from '@/lib/types'
import { getHeatmapRange } from '@/lib/elements'
import { PeriodicTable } from './PeriodicTable'
import { ElementModal } from './ElementModal'
import { CategoryLegend } from './CategoryLegend'
import { HeatmapLegend } from './HeatmapLegend'
import { PhaseSlider } from './PhaseSlider'
import { NucleosynthesisLegend } from './NucleosynthesisLegend'

interface Props {
  elements: Element[]
}

export function PeriodicTableApp({ elements }: Props) {
  const [mode, setMode] = useState<VisualizationMode>('standard')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)
  const [statsOpen, setStatsOpen] = useState(false)
  const [phaseTemperature, setPhaseTemperature] = useState(293)
  const searchRef = useRef<HTMLInputElement>(null)

  const currentVizConfig = useMemo(
    () => VISUALIZATION_MODES.find(v => v.key === mode) ?? VISUALIZATION_MODES[0],
    [mode]
  )

  const [heatMin, heatMax] = useMemo(
    () => (!currentVizConfig.overlay && mode !== 'standard' ? getHeatmapRange(elements, mode) : [0, 1]),
    [elements, mode, currentVizConfig.overlay]
  )

  const handleSelect    = useCallback((el: Element) => setSelectedElement(el), [])
  const handleCloseModal = useCallback(() => setSelectedElement(null), [])
  const handleCategoryToggle = useCallback((id: string | null) => setActiveCategoryId(id), [])

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const stats = useMemo(() => ({
    total:     elements.length,
    metals:    elements.filter(e => ['碱金属','碱土金属','过渡金属','后过渡金属'].includes(e.category_ui_name)).length,
    nonmetals: elements.filter(e => ['非金属','卤素','稀有气体'].includes(e.category_ui_name)).length,
    metalloids:elements.filter(e => e.category_ui_name === '类金属').length,
    solids:    elements.filter(e => e.phase_en === 'Solid').length,
    liquids:   elements.filter(e => e.phase_en === 'Liquid').length,
    gases:     elements.filter(e => e.phase_en === 'Gas').length,
  }), [elements])

  const handleModeChange = useCallback((key: VisualizationMode) => {
    setMode(key)
    if (key !== 'standard') setActiveCategoryId(null)
  }, [])

  return (
    <div className="min-h-screen bg-[#030509] bg-grid relative overflow-x-hidden">
      {/* Scan line */}
      <div className="scan-line" aria-hidden="true" />

      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 60%)' }}
        aria-hidden="true"
      />

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-[100] w-full"
        style={{
          background: 'rgba(3,5,9,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0,212,255,0.08)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.6)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">

          {/* Title */}
          <div className="flex items-center gap-2 mr-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <ellipse cx="12" cy="12" rx="10" ry="4" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
            </svg>
            <h1 className="text-base font-semibold font-serif tracking-wide text-glow-cyan" style={{ color: '#00d4ff', letterSpacing: '0.04em' }}>
              Periodic Table
            </h1>
            <span className="text-[10px] font-mono text-white/25 hidden sm:block">118 elements</span>
          </div>

          {/* Mode buttons */}
          <nav
            className="flex rounded-xl p-1.5 gap-1 flex-wrap backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.1)' }}
            role="group"
            aria-label="Visualization modes"
          >
            {VISUALIZATION_MODES.map(vm => (
              <button
                key={vm.key}
                onClick={() => handleModeChange(vm.key)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap border"
                style={
                  mode === vm.key
                    ? { 
                        background: 'rgba(0,212,255,0.15)',
                        color: '#00d4ff',
                        borderColor: 'rgba(0,212,255,0.4)',
                        fontWeight: 700,
                        boxShadow: '0 0 16px rgba(0,212,255,0.25)',
                      }
                    : { 
                        color: 'rgba(255,255,255,0.5)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.02)',
                      }
                }
                aria-pressed={mode === vm.key}
              >
                {vm.label}
              </button>
            ))}
          </nav>

          {/* Search */}
          <div className="relative ml-auto">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search… ( / )"
              aria-label="Search elements"
              className="pl-8 pr-8 py-2 rounded-lg text-[12px] text-white placeholder-white/30 outline-none transition-all duration-200 w-36 focus:w-52 backdrop-blur-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0,212,255,0.15)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.6)', e.currentTarget.style.background = 'rgba(0,212,255,0.05)')}
              onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)', e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            />
            {searchQuery && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Stats toggle */}
          <button
            onClick={() => setStatsOpen(v => !v)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 border backdrop-blur-sm"
            style={
              statsOpen
                ? { 
                    color: '#00d4ff',
                    background: 'rgba(0,212,255,0.12)',
                    borderColor: 'rgba(0,212,255,0.4)',
                    boxShadow: '0 0 12px rgba(0,212,255,0.2)',
                  }
                : { 
                    color: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.02)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }
            }
            aria-pressed={statsOpen}
          >
            Stats
          </button>
        </div>

        {/* Stats panel */}
        {statsOpen && (
          <div
            className="max-w-[1400px] mx-auto px-4 pb-3 flex flex-wrap gap-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
          >
            {[
              { label: 'Total',     value: stats.total },
              { label: 'Metals',    value: stats.metals },
              { label: 'Nonmetals', value: stats.nonmetals },
              { label: 'Metalloids',value: stats.metalloids },
              { label: 'Solids',    value: stats.solids },
              { label: 'Liquids',   value: stats.liquids },
              { label: 'Gases',     value: stats.gases },
            ].map(s => (
              <div key={s.label} className="flex items-baseline gap-1.5 mt-2">
                <span className="text-[18px] font-bold font-mono" style={{ color: '#00d4ff' }}>{s.value}</span>
                <span className="text-[10px] text-white/35 uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* ── LEGEND / CONTROLS STRIP ─────────────────────────────────────────── */}
      <div
        className="w-full py-4 px-4"
        style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}
      >
        <div className="max-w-[1400px] mx-auto">
          {mode === 'standard' && (
            <CategoryLegend
              activeCategoryId={activeCategoryId}
              onToggle={handleCategoryToggle}
            />
          )}
          {!currentVizConfig.overlay && mode !== 'standard' && (
            <HeatmapLegend
              min={heatMin}
              max={heatMax}
              unit={currentVizConfig.unit}
              label={currentVizConfig.label}
            />
          )}
          {mode === 'phase-state' && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: 'rgba(0,212,255,0.75)' }}>
                Temperature Slider — Phase at {phaseTemperature.toLocaleString()} K
              </p>
              <PhaseSlider temperature={phaseTemperature} onChange={setPhaseTemperature} />
            </div>
          )}
          {mode === 'nucleosynthesis' && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: 'rgba(0,212,255,0.75)' }}>
                Cosmic Origin of the Elements
              </p>
              <NucleosynthesisLegend />
            </div>
          )}
        </div>
      </div>

      {/* ── TABLE ────────────────────────────────────────────────────────────── */}
      <main className="px-4 py-6 overflow-x-auto" style={{ paddingLeft: 'max(1rem, calc((100vw - 1280px) / 2))' }}>
        <PeriodicTable
          elements={elements}
          mode={mode}
          activeCategoryId={activeCategoryId}
          searchQuery={searchQuery}
          onSelect={handleSelect}
          phaseTemperature={phaseTemperature}
        />
      </main>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="py-6 px-4 text-center">
        <p className="text-[11px] text-white/15">
          Interactive Periodic Table · 118 Elements · Data from Wikipedia
        </p>
      </footer>

      {/* ── ELEMENT MODAL ────────────────────────────────────────────────────── */}
      {selectedElement && (
        <ElementModal element={selectedElement} onClose={handleCloseModal} />
      )}
    </div>
  )
}
