'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Element } from '@/lib/types'
import { getCategoryColor, formatValue } from '@/lib/elements'
import { AtomVisualizer } from './AtomVisualizer'

interface Props {
  element: Element | null
  onClose: () => void
}

type TabId = 'basic' | 'physical' | 'chemical' | 'history' | 'media'

const TABS: { id: TabId; label: string }[] = [
  { id: 'basic', label: 'Basic' },
  { id: 'physical', label: 'Physical' },
  { id: 'chemical', label: 'Chemical' },
  { id: 'history', label: 'History' },
  { id: 'media', label: 'Media' },
]

// Checks if a string is mostly non-ASCII / Chinese characters
function isChinese(str: string): boolean {
  if (!str) return false
  const cjkCount = (str.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length
  return cjkCount / str.length > 0.3
}

function PropItem({
  label,
  value,
  unit = '',
  wide = false,
}: {
  label: string
  value: string | number | null | undefined
  unit?: string
  wide?: boolean
}) {
  const display =
    value === null || value === undefined || value === ''
      ? '—'
      : `${value}${unit ? ` ${unit}` : ''}`
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-xl p-4 ${wide ? 'col-span-2' : ''}`}
      style={{
        background: 'rgba(255,255,255,0.028)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: '2px solid rgba(0,212,255,0.4)',
      }}
    >
      <span className="text-[10px] text-white/35 uppercase tracking-[0.18em] font-medium leading-none">
        {label}
      </span>
      <span className="text-[15px] text-white/85 font-mono leading-tight">{display}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-3 flex items-center gap-2"
      style={{ color: '#00d4ff' }}
    >
      <span
        className="inline-block w-4 h-px"
        style={{ background: 'rgba(0,212,255,0.5)' }}
        aria-hidden="true"
      />
      {children}
      <span
        className="flex-1 h-px"
        style={{ background: 'rgba(0,212,255,0.1)' }}
        aria-hidden="true"
      />
    </h3>
  )
}

export function ElementModal({ element, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (element) {
      setActiveTab('basic')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [element])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    },
    [onClose]
  )

  if (!element) return null

  const color = getCategoryColor(element.category_ui_name, element.color_hex)
  const catEn = element.category_en || element.category_ui_name

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${element.name_en} details`}
    >
      <div
        className="modal-animate-in w-full max-w-5xl max-h-[92vh] rounded-2xl flex flex-col md:flex-row overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, #0b1220 0%, #060b14 100%)',
          border: `1px solid ${color}25`,
          boxShadow: `0 0 80px ${color}12, 0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left column: atom + identity ── */}
        <div
          className="hidden md:flex flex-col items-center justify-between relative py-8 px-6"
          style={{
            width: 300,
            minWidth: 300,
            background: `radial-gradient(ellipse at 50% 40%, ${color}0d 0%, transparent 70%)`,
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Symbol */}
          <div className="w-full text-center">
            <div
              className="font-serif text-[72px] font-light leading-none tracking-tight"
              style={{
                color,
                textShadow: `0 0 40px ${color}70`,
                lineHeight: 1,
              }}
            >
              {element.symbol}
            </div>
            <div
              className="mt-2 font-serif text-[22px] font-light text-white/80 tracking-wide"
              style={{ letterSpacing: '0.04em' }}
            >
              {element.name_en}
            </div>
            <div
              className="mt-1 text-[11px] font-mono tracking-widest"
              style={{ color: `${color}aa` }}
            >
              #{element.number}
            </div>
          </div>

          {/* Atom canvas */}
          <div className="flex-1 flex items-center justify-center w-full my-4">
            <AtomVisualizer element={element} size={228} className="w-full" />
          </div>

          {/* Shells list — compact, bottom of left column */}
          <div className="w-full space-y-1">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/25 text-center mb-2">
              Electron Shells
            </p>
            <div className="flex justify-center flex-wrap gap-1">
              {element.shells.map((count, i) => {
                const shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q']
                const shellColors = [
                  '#38bdf8', '#60a5fa', '#818cf8',
                  '#a78bfa', '#c084fc', '#e879f9', '#f472b6',
                ]
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center px-2.5 py-1.5 rounded-md"
                    style={{
                      background: `${shellColors[i % shellColors.length]}10`,
                      border: `1px solid ${shellColors[i % shellColors.length]}25`,
                    }}
                  >
                    <span
                      className="text-[9px] font-mono leading-none"
                      style={{ color: shellColors[i % shellColors.length] }}
                    >
                      {shellNames[i]}
                    </span>
                    <span className="text-[11px] font-mono text-white/70 font-semibold leading-none mt-0.5">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right column: content ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header row */}
          <div
            className="flex items-start gap-3 px-6 py-5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Mobile symbol */}
            <div
              className="md:hidden font-serif text-4xl font-light leading-none flex-shrink-0"
              style={{ color }}
            >
              {element.symbol}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2
                  className="font-serif text-2xl font-light text-white tracking-wide"
                  style={{ letterSpacing: '0.02em' }}
                >
                  {element.name_en}
                </h2>
                <span
                  className="text-sm font-mono"
                  style={{ color: `${color}80` }}
                >
                  #{element.number}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span
                  className="text-[11px] px-3 py-1 rounded-full font-medium tracking-wide"
                  style={{
                    color,
                    background: `${color}12`,
                    border: `1px solid ${color}35`,
                  }}
                >
                  {catEn}
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/45 tracking-wide">
                  {element.phase_en || element.phase}
                </span>
                <span
                  className="text-[11px] px-3 py-1 rounded-full font-mono font-semibold"
                  style={{
                    color: '#00d4ff',
                    background: 'rgba(0,212,255,0.06)',
                    border: '1px solid rgba(0,212,255,0.2)',
                  }}
                >
                  {element.block}-block
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/45">
                  Period {element.period}
                  {element.group ? ` · Group ${element.group}` : ''}
                </span>
              </div>
            </div>

            {/* Atomic mass + close */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/35 hover:text-white hover:bg-red-500/15 border border-white/08 hover:border-red-500/30 transition-all duration-200 text-base"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
              <div className="text-right hidden sm:block">
                <div className="text-[9px] uppercase tracking-[0.15em] text-white/25">
                  Atomic Mass
                </div>
                <div className="text-[13px] font-mono text-white/60 mt-0.5">
                  {element.atomic_mass.toPrecision(6)}
                  <span className="text-[10px] text-white/30 ml-1">u</span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          {element.summary_en && (
            <div
              className="mx-6 mt-4 px-4 py-3 rounded-xl text-[13px] leading-relaxed text-white/50 flex-shrink-0 font-serif"
              style={{
                background: 'rgba(255,255,255,0.018)',
                borderLeft: `2px solid ${color}45`,
              }}
            >
              {element.summary_en}
            </div>
          )}

          {/* Tabs */}
          <div
            className="flex mx-6 mt-4 flex-shrink-0 rounded-xl overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)' }}
            role="tablist"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className="flex-1 text-[12px] font-medium py-2.5 transition-all duration-200 tracking-wide"
                style={
                  activeTab === tab.id
                    ? {
                        background: color,
                        color: '#000',
                        fontWeight: 700,
                      }
                    : {
                        color: 'rgba(255,255,255,0.38)',
                      }
                }
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-5">
            <div key={activeTab} className="tab-content-animate">
              {activeTab === 'basic' && <BasicTab element={element} color={color} />}
              {activeTab === 'physical' && <PhysicalTab element={element} />}
              {activeTab === 'chemical' && <ChemicalTab element={element} />}
              {activeTab === 'history' && <HistoryTab element={element} />}
              {activeTab === 'media' && <MediaTab element={element} color={color} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tab Components ─────────────────────────────────────────────────────────

function BasicTab({ element, color }: { element: Element; color: string }) {
  const configHtml = element.electron_configuration
    ? element.electron_configuration.replace(
        /(\d)([spdf])(\d+)/g,
        (_m, a, o, n) => `${a}${o}<sup>${n}</sup>`
      )
    : '—'

  return (
    <div className="space-y-7">
      {/* Electron config */}
      <div>
        <SectionTitle>Electron Configuration</SectionTitle>
        <div
          className="rounded-xl px-5 py-4 font-mono space-y-2.5"
          style={{ background: 'rgba(0,212,255,0.035)', border: '1px solid rgba(0,212,255,0.08)' }}
        >
          <div
            className="text-[19px] text-white/90 leading-relaxed tracking-wide"
            dangerouslySetInnerHTML={{ __html: configHtml }}
          />
          {element.electron_configuration_semantic && (
            <div className="text-[13px] text-white/35 pt-0.5">
              {element.electron_configuration_semantic}
            </div>
          )}
        </div>
      </div>

      {/* Oxidation states */}
      {element.valence && element.valence.length > 0 && (
        <div>
          <SectionTitle>Common Oxidation States</SectionTitle>
          <div className="flex flex-wrap gap-3">
            {element.valence.map((v) => (
              <span
                key={v}
                className="w-12 h-12 flex items-center justify-center rounded-xl text-[17px] font-bold font-mono"
                style={{
                  color: '#ff6699',
                  background: 'rgba(255,0,85,0.1)',
                  border: '1px solid rgba(255,0,85,0.28)',
                }}
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Isotopes */}
      {element.isotopes && element.isotopes.length > 0 && (
        <div>
          <SectionTitle>Isotopes</SectionTitle>
          <div className="flex flex-wrap gap-2.5">
            {element.isotopes.map((iso) => (
              <span
                key={iso.m}
                className="px-4 py-2 rounded-lg text-[13px] font-mono"
                style={
                  iso.s
                    ? {
                        color: '#86efac',
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.25)',
                      }
                    : {
                        color: '#93c5fd',
                        background: 'rgba(59,130,246,0.06)',
                        border: '1px solid rgba(59,130,246,0.2)',
                      }
                }
              >
                {iso.s ? '●' : '○'}&thinsp;
                <sup>{iso.m}</sup>
                {element.symbol}
              </span>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] text-white/25">
            ● stable &nbsp;○ unstable
          </p>
        </div>
      )}

      {/* Position */}
      <div>
        <SectionTitle>Position in Table</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          <PropItem label="Atomic No." value={element.number} />
          <PropItem label="Period" value={element.period} />
          <PropItem label="Group" value={element.group ?? '—'} />
          <PropItem label="Block" value={element.block?.toUpperCase()} />
        </div>
      </div>
    </div>
  )
}

function PhysicalTab({ element }: { element: Element }) {
  return (
    <div className="space-y-6">
      {element.appearance_en && (
        <div>
          <SectionTitle>Appearance</SectionTitle>
          <p className="text-[14px] text-white/60 leading-relaxed font-serif italic">
            {element.appearance_en}
          </p>
        </div>
      )}
      <div>
        <SectionTitle>Physical Properties</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          <PropItem label="Atomic Mass (u)" value={element.atomic_mass} />
          <PropItem
            label="Atomic Radius (pm)"
            value={element.radius ?? '—'}
          />
          <PropItem
            label="Density (g/cm³)"
            value={
              element.density !== null ? formatValue(element.density, 4) : '—'
            }
          />
          <PropItem
            label="Melting Point (K)"
            value={element.melt !== null ? formatValue(element.melt, 5) : '—'}
          />
          <PropItem
            label="Boiling Point (K)"
            value={element.boil !== null ? formatValue(element.boil, 5) : '—'}
          />
          <PropItem
            label="Molar Heat (J/mol·K)"
            value={
              element.molar_heat !== null
                ? formatValue(element.molar_heat!, 4)
                : '—'
            }
          />
          <PropItem label="Phase" value={element.phase_en || element.phase} />
          {element['cpk-hex'] && (
            <div
              className="flex flex-col gap-1 rounded-lg p-3"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: '2px solid rgba(0,212,255,0.35)',
              }}
            >
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium leading-none">
                CPK Color
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className="w-5 h-5 rounded-md flex-shrink-0"
                  style={{ background: `#${element['cpk-hex']}` }}
                />
                <span className="text-sm text-white/90 font-mono">
                  #{element['cpk-hex']}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ChemicalTab({ element }: { element: Element }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Chemical Properties</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <PropItem
            label="Electronegativity (Pauling)"
            value={
              element.electronegativity_pauling !== null
                ? formatValue(element.electronegativity_pauling!, 3)
                : '—'
            }
          />
          <PropItem
            label="Electron Affinity (kJ/mol)"
            value={
              element.electron_affinity !== null
                ? formatValue(element.electron_affinity!, 4)
                : '—'
            }
          />
        </div>
      </div>

      {element.ionization_energies && element.ionization_energies.length > 0 && (
        <div>
          <SectionTitle>Ionization Energies (kJ/mol)</SectionTitle>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {element.ionization_energies.map((energy, i) => {
              const max = Math.max(...element.ionization_energies)
              const pct = (energy / max) * 100
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-[11px] text-white/30 w-8 flex-shrink-0 font-mono">
                    IE{i + 1}
                  </span>
                  <div
                    className="flex-1 h-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #00d4ff, #8b5cf6)',
                      }}
                    />
                  </div>
                  <span className="text-[12px] text-white/70 font-mono w-16 text-right flex-shrink-0">
                    {energy.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function HistoryTab({ element }: { element: Element }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Discovery</SectionTitle>
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.05)' }}
        >
          {[
            {
              label: 'Discovered by',
              value:
                element.discovered_by_en || element.discovered_by || '—',
            },
            {
              label: 'Named by',
              value: element.named_by_en || element.named_by || '—',
            },
          ].map((row, i) => (
            <div
              key={row.label}
              className="flex justify-between items-center py-3.5 px-4"
              style={{
                background:
                  i % 2 === 0
                    ? 'rgba(255,255,255,0.015)'
                    : 'rgba(255,255,255,0.025)',
                borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <span className="text-[11px] text-white/30 uppercase tracking-widest">
                {row.label}
              </span>
              <span className="text-[14px] text-white/75 font-serif">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>References</SectionTitle>
        {element.source_en && (
          <a
            href={element.source_en}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-[13px] px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-[rgba(0,212,255,0.1)]"
            style={{
              color: '#00d4ff',
              background: 'rgba(0,212,255,0.05)',
              border: '1px solid rgba(0,212,255,0.18)',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Wikipedia — {element.name_en}
          </a>
        )}
      </div>
    </div>
  )
}

function MediaTab({ element, color }: { element: Element; color: string }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  const imgUrl = element.image?.url
  // Only use attribution text if it's not Chinese
  const attribution =
    element.image?.attribution && !isChinese(element.image.attribution)
      ? element.image.attribution
      : null

  if (!imgUrl || imgError) {
    return (
      <div
        className="flex items-center justify-center rounded-xl text-[13px] text-white/25 -mx-6 -mt-5"
        style={{
          aspectRatio: '16 / 9',
          background: '#0f141c',
        }}
      >
        No image available
      </div>
    )
  }

  return (
    /* Pull the image flush to all edges of the tab pane by negating the
       px-6 pt-5 padding of the parent scroll container */
    <div
      className="-mx-6 -mt-5 relative overflow-hidden"
      style={{
        aspectRatio: '16 / 9',
        background: '#0f141c',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgUrl}
        alt={element.name_en}
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: imgLoaded ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
        crossOrigin="anonymous"
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
      />

      {/* Element name overlay — top-left badge */}
      {imgLoaded && (
        <div
          className="absolute top-0 left-0 right-0 px-5 pt-4 pb-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(15,20,28,0.72) 0%, transparent 100%)',
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: `${color}cc` }}>
            Element Photo
          </p>
          <p className="text-[17px] font-serif font-light text-white/90 mt-0.5">
            {element.name_en}
          </p>
        </div>
      )}

      {/* Attribution overlay — bottom */}
      {attribution && imgLoaded && (
        <div
          className="absolute bottom-0 left-0 right-0 px-5 py-4"
          style={{
            background: 'linear-gradient(to top, rgba(15,20,28,0.82) 0%, transparent 100%)',
          }}
        >
          <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">
            {attribution}
          </p>
        </div>
      )}

      {/* Loading spinner */}
      {!imgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0f141c' }}>
          <div
            className="w-9 h-9 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: color,
              animation: 'spin 0.8s linear infinite',
            }}
          />
        </div>
      )}
    </div>
  )
}
