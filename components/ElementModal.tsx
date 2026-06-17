'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Element } from '@/lib/types'
import { NUCLEOSYNTHESIS_MAP, NUCLEOSYNTHESIS_LABEL, NUCLEOSYNTHESIS_COLOR } from '@/lib/types'
import { getCategoryColor, formatValue, calcZeff } from '@/lib/elements'
import { AtomVisualizer } from './AtomVisualizer'

interface Props {
  element: Element | null
  onClose: () => void
}

type TabId = 'basic' | 'physical' | 'chemical' | 'quantum' | 'history' | 'media'

const TABS: { id: TabId; label: string }[] = [
  { id: 'basic',    label: 'Basic'    },
  { id: 'physical', label: 'Physical' },
  { id: 'chemical', label: 'Chemical' },
  { id: 'quantum',  label: 'Quantum'  },
  { id: 'history',  label: 'History'  },
  { id: 'media',    label: 'Media'    },
]

function isChinese(str: string): boolean {
  if (!str) return false
  const cjkCount = (str.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length
  return cjkCount / str.length > 0.3
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function PropItem({
  label,
  value,
  unit = '',
  wide = false,
  color,
}: {
  label: string
  value: string | number | null | undefined
  unit?: string
  wide?: boolean
  color?: string
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
        borderLeft: `2px solid ${color ?? 'rgba(0,212,255,0.4)'}`,
      }}
    >
      <span className="text-[10px] text-white/35 uppercase tracking-[0.18em] font-medium leading-none">
        {label}
      </span>
      <span className="text-[15px] text-white/85 font-mono leading-tight">{display}</span>
    </div>
  )
}

function SectionTitle({ children, accent }: { children: React.ReactNode; accent?: string }) {
  const c = accent ?? '#00d4ff'
  return (
    <h3
      className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-3 flex items-center gap-2"
      style={{ color: c }}
    >
      <span className="inline-block w-4 h-px" style={{ background: `${c}80` }} aria-hidden="true" />
      {children}
      <span className="flex-1 h-px" style={{ background: `${c}18` }} aria-hidden="true" />
    </h3>
  )
}

// ─── Orbital Box Diagram ──────────────────────────────────────────────────────

/**
 * Parses the electron configuration string into a list of subshell fills.
 * e.g. "1s2 2s2 2p6 3s1" → [{n:1,l:'s',total:2,filled:2}, ...]
 */
interface SubshellFill {
  n: number
  l: 's' | 'p' | 'd' | 'f'
  total: number      // max slots
  filled: number     // electrons in this subshell
}

const SUBSHELL_CAPACITY: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 }

function parseConfig(config: string): SubshellFill[] {
  // strip noble-gas shorthand e.g. [He]
  const stripped = config.replace(/\[.*?\]/g, '').trim()
  const tokens = stripped.match(/(\d)([spdf])(\d+)/g) ?? []
  return tokens.map(tok => {
    const m = tok.match(/(\d)([spdf])(\d+)/)!
    const n = parseInt(m[1])
    const l = m[2] as 's' | 'p' | 'd' | 'f'
    const electrons = parseInt(m[3])
    return { n, l, total: SUBSHELL_CAPACITY[l], filled: electrons }
  })
}

const BLOCK_COLOR: Record<string, string> = {
  s: '#38bdf8',  // sky blue
  p: '#34d399',  // emerald
  d: '#a78bfa',  // violet
  f: '#f472b6',  // pink
}

function OrbitalBox({ filled, total, color }: { filled: number; total: number; color: string }) {
  const pairs = Math.floor(total / 2)
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: pairs }).map((_, i) => {
        const electronIndex = i * 2
        // Hund's rule: fill one per box before pairing
        // For simplicity in display: half-fill first, then pair
        const halfFill = Math.ceil(filled / 2)
        const hasUp   = electronIndex < filled
        const hasDown = electronIndex + 1 < filled

        // If filled > pairs: pair first boxes, else spread
        const spread = filled <= pairs
        const spreadUp   = spread ? i < filled     : i < halfFill
        const spreadDown = spread ? false           : i < (filled - halfFill)

        const showUp   = spread ? spreadUp   : hasUp
        const showDown = spread ? spreadDown : hasDown

        return (
          <div
            key={i}
            className="flex flex-col items-center justify-center gap-[1px]"
            style={{
              width: 20,
              height: 32,
              borderRadius: 3,
              border: `1px solid ${color}45`,
              background: (showUp || showDown) ? `${color}12` : 'rgba(255,255,255,0.03)',
            }}
          >
            {/* Up arrow */}
            <span
              className="leading-none select-none"
              style={{
                fontSize: 11,
                color: showUp ? color : 'transparent',
                lineHeight: 1,
              }}
            >
              ↑
            </span>
            {/* Down arrow */}
            <span
              className="leading-none select-none"
              style={{
                fontSize: 11,
                color: showDown ? color : 'transparent',
                lineHeight: 1,
              }}
            >
              ↓
            </span>
          </div>
        )
      })}
    </div>
  )
}

function OrbitalBoxDiagram({ element, color }: { element: Element; color: string }) {
  if (!element.electron_configuration) return null
  const subshells = parseConfig(element.electron_configuration)
  if (subshells.length === 0) return null

  return (
    <div className="space-y-2">
      {subshells.map((sh, idx) => {
        const blockColor = BLOCK_COLOR[sh.l] ?? color
        return (
          <div key={idx} className="flex items-center gap-3">
            {/* Label */}
            <span
              className="text-[12px] font-mono w-8 text-right flex-shrink-0 font-semibold"
              style={{ color: blockColor }}
            >
              {sh.n}{sh.l}
            </span>
            {/* Boxes */}
            <OrbitalBox filled={sh.filled} total={sh.total} color={blockColor} />
            {/* Electron count */}
            <span className="text-[11px] font-mono text-white/35">
              {sh.filled}/{sh.total}
            </span>
          </div>
        )
      })}
      {/* Block colour legend */}
      <div className="flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {Object.entries(BLOCK_COLOR).map(([l, c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: c }} />
            <span className="text-[10px] text-white/40 font-mono">{l}-block</span>
          </div>
        ))}
        <span className="text-[10px] text-white/25 ml-auto">↑ spin-up &nbsp; ↓ spin-down</span>
      </div>
    </div>
  )
}

// ─── Tab components ───────────────────────────────────────────────────────────

function BasicTab({ element, color }: { element: Element; color: string }) {
  const configHtml = element.electron_configuration
    ? element.electron_configuration.replace(
        /(\d)([spdf])(\d+)/g,
        (_m, a, o, n) => `${a}${o}<sup>${n}</sup>`
      )
    : '—'

  return (
    <div className="space-y-7">
      {/* Electron config text */}
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

      {/* Orbital Box Diagram */}
      <div>
        <SectionTitle>Orbital Box Diagram</SectionTitle>
        <div
          className="rounded-xl px-5 py-4"
          style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <OrbitalBoxDiagram element={element} color={color} />
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
                    ? { color: '#86efac', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }
                    : { color: '#93c5fd', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }
                }
              >
                {iso.s ? '●' : '○'}&thinsp;
                <sup>{iso.m}</sup>
                {element.symbol}
              </span>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] text-white/25">● stable &nbsp;○ unstable</p>
        </div>
      )}

      {/* Position */}
      <div>
        <SectionTitle>Position in Table</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          <PropItem label="Atomic No." value={element.number} />
          <PropItem label="Period"     value={element.period} />
          <PropItem label="Group"      value={element.group ?? '—'} />
          <PropItem label="Block"      value={element.block?.toUpperCase()} />
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
          <PropItem label="Atomic Mass (u)"     value={element.atomic_mass} />
          <PropItem label="Atomic Radius (pm)"  value={element.radius ?? '—'} />
          <PropItem label="Density (g/cm³)"     value={element.density !== null ? formatValue(element.density, 4) : '—'} />
          <PropItem label="Melting Point (K)"   value={element.melt    !== null ? formatValue(element.melt, 5) : '—'} />
          <PropItem label="Boiling Point (K)"   value={element.boil    !== null ? formatValue(element.boil, 5) : '—'} />
          <PropItem label="Molar Heat (J/mol·K)"value={element.molar_heat !== null ? formatValue(element.molar_heat!, 4) : '—'} />
          <PropItem label="Phase (STP)"          value={element.phase_en || element.phase} />
          {element['cpk-hex'] && (
            <div
              className="flex flex-col gap-1.5 rounded-xl p-4"
              style={{
                background: 'rgba(255,255,255,0.028)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: '2px solid rgba(0,212,255,0.4)',
              }}
            >
              <span className="text-[10px] text-white/35 uppercase tracking-[0.18em] font-medium leading-none">CPK Color</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-5 h-5 rounded-md flex-shrink-0" style={{ background: `#${element['cpk-hex']}` }} />
                <span className="text-[15px] text-white/85 font-mono">#{element['cpk-hex']}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Biological role data
const BIO_ROLE: Record<number, { role: 'essential' | 'inert' | 'toxic'; note: string }> = {
  1:  { role: 'essential', note: 'Core component of water and all organic molecules.' },
  6:  { role: 'essential', note: 'Backbone of all organic chemistry and life.' },
  7:  { role: 'essential', note: 'Key component of amino acids, DNA, and proteins.' },
  8:  { role: 'essential', note: 'Required for cellular respiration.' },
  11: { role: 'essential', note: 'Critical electrolyte for nerve impulses.' },
  12: { role: 'essential', note: 'Cofactor in 300+ enzyme systems; bone structure.' },
  15: { role: 'essential', note: 'Core of DNA, RNA, ATP, and cell membranes.' },
  16: { role: 'essential', note: 'Component of two amino acids (Cys, Met).' },
  17: { role: 'essential', note: 'Electrolyte; required for stomach acid (HCl).' },
  19: { role: 'essential', note: 'Key electrolyte for heart and nerve function.' },
  20: { role: 'essential', note: 'Bone and teeth structure; muscle contraction.' },
  23: { role: 'essential', note: 'Cofactor in enzymes; may influence insulin.' },
  24: { role: 'essential', note: 'Trace mineral; glucose metabolism.' },
  25: { role: 'essential', note: 'Antioxidant enzymes; bone formation.' },
  26: { role: 'essential', note: 'Oxygen transport (haemoglobin, myoglobin).' },
  27: { role: 'essential', note: 'Vitamin B12 cofactor; RBC maturation.' },
  28: { role: 'essential', note: 'Enzyme cofactor; iron metabolism.' },
  29: { role: 'essential', note: 'Enzyme cofactor; connective tissue.' },
  30: { role: 'essential', note: 'Required for 300+ enzymes; immune function.' },
  34: { role: 'essential', note: 'Antioxidant (glutathione peroxidase).' },
  42: { role: 'essential', note: 'Cofactor for several redox enzymes.' },
  53: { role: 'essential', note: 'Thyroid hormone synthesis.' },
  2:  { role: 'inert',    note: 'Biologically inert noble gas.' },
  10: { role: 'inert',    note: 'Biologically inert noble gas.' },
  18: { role: 'inert',    note: 'Biologically inert noble gas.' },
  36: { role: 'inert',    note: 'Biologically inert noble gas.' },
  54: { role: 'inert',    note: 'Biologically inert noble gas.' },
  79: { role: 'inert',    note: 'Non-toxic at trace levels; no known biological role.' },
  78: { role: 'inert',    note: 'Catalytic but biologically non-essential.' },
  47: { role: 'inert',    note: 'Antimicrobial at small amounts; no known metabolic role.' },
  82: { role: 'toxic',    note: 'Heavy metal; disrupts haem synthesis and neural function.' },
  80: { role: 'toxic',    note: 'Highly toxic; binds thiols and disrupts enzymes.' },
  33: { role: 'toxic',    note: 'Carcinogen; disrupts cellular signalling.' },
  48: { role: 'toxic',    note: 'Replaces zinc in enzymes; renal and bone damage.' },
  83: { role: 'toxic',    note: 'Low-level toxicity; historical medical use.' },
  84: { role: 'toxic',    note: 'Radioactive; acutely toxic.' },
  88: { role: 'toxic',    note: 'Radioactive; replaces calcium in bone.' },
  55: { role: 'toxic',    note: 'Not metabolised; can cause arrhythmia.' },
  56: { role: 'toxic',    note: 'Mimics calcium; not metabolised safely.' },
}

const BIO_COLOR = { essential: '#34d399', inert: '#60a5fa', toxic: '#f87171' }
const BIO_LABEL = { essential: 'Essential', inert: 'Inert / Safe', toxic: 'Highly Toxic' }

function ChemicalTab({ element }: { element: Element }) {
  const bio = BIO_ROLE[element.number]

  return (
    <div className="space-y-6">
      {/* Chemical properties */}
      <div>
        <SectionTitle>Chemical Properties</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5">
          <PropItem
            label="Electronegativity (Pauling)"
            value={element.electronegativity_pauling !== null ? formatValue(element.electronegativity_pauling!, 3) : '—'}
          />
          <PropItem
            label="Electron Affinity (kJ/mol)"
            value={element.electron_affinity !== null ? formatValue(element.electron_affinity!, 4) : '—'}
          />
        </div>
      </div>

      {/* Ionization energies */}
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
                  <span className="text-[11px] text-white/30 w-8 flex-shrink-0 font-mono">IE{i + 1}</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00d4ff, #8b5cf6)' }}
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

      {/* Biological Profile */}
      <div>
        <SectionTitle accent={bio ? BIO_COLOR[bio.role] : '#64748b'}>Biological Profile</SectionTitle>
        {bio ? (
          <div
            className="rounded-xl p-4 flex gap-4 items-start"
            style={{
              background: `${BIO_COLOR[bio.role]}0d`,
              border: `1px solid ${BIO_COLOR[bio.role]}30`,
            }}
          >
            <div
              className="mt-0.5 flex-shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold"
              style={{ background: `${BIO_COLOR[bio.role]}22`, color: BIO_COLOR[bio.role] }}
            >
              {BIO_LABEL[bio.role]}
            </div>
            <p className="text-[13px] text-white/60 leading-relaxed">{bio.note}</p>
          </div>
        ) : (
          <p className="text-[13px] text-white/35 italic">No biological role data available.</p>
        )}
      </div>
    </div>
  )
}

// ─── Quantum / Advanced Tab ───────────────────────────────────────────────────

// Static crystal structure data (selected elements)
const CRYSTAL_STRUCTURE: Record<number, { sym: string; label: string }> = {
  1:  { sym: 'HEX',  label: 'Hexagonal' },
  2:  { sym: 'FCC',  label: 'Face-Centred Cubic' },
  3:  { sym: 'BCC',  label: 'Body-Centred Cubic' },
  4:  { sym: 'HEX',  label: 'Hexagonal (hcp)' },
  5:  { sym: 'TET',  label: 'Tetragonal' },
  6:  { sym: 'HEX',  label: 'Hexagonal (graphite)' },
  7:  { sym: 'HEX',  label: 'Hexagonal' },
  8:  { sym: 'MONO', label: 'Monoclinic' },
  11: { sym: 'BCC',  label: 'Body-Centred Cubic' },
  12: { sym: 'HEX',  label: 'Hexagonal (hcp)' },
  13: { sym: 'FCC',  label: 'Face-Centred Cubic' },
  14: { sym: 'DIA',  label: 'Diamond Cubic' },
  19: { sym: 'BCC',  label: 'Body-Centred Cubic' },
  20: { sym: 'FCC',  label: 'Face-Centred Cubic' },
  22: { sym: 'HEX',  label: 'Hexagonal (hcp)' },
  23: { sym: 'BCC',  label: 'Body-Centred Cubic' },
  24: { sym: 'BCC',  label: 'Body-Centred Cubic' },
  25: { sym: 'CUBE', label: 'Cubic' },
  26: { sym: 'BCC',  label: 'Body-Centred Cubic' },
  27: { sym: 'HEX',  label: 'Hexagonal (hcp)' },
  28: { sym: 'FCC',  label: 'Face-Centred Cubic' },
  29: { sym: 'FCC',  label: 'Face-Centred Cubic' },
  30: { sym: 'HEX',  label: 'Hexagonal' },
  32: { sym: 'DIA',  label: 'Diamond Cubic' },
  40: { sym: 'HEX',  label: 'Hexagonal (hcp)' },
  41: { sym: 'BCC',  label: 'Body-Centred Cubic' },
  42: { sym: 'BCC',  label: 'Body-Centred Cubic' },
  46: { sym: 'FCC',  label: 'Face-Centred Cubic' },
  47: { sym: 'FCC',  label: 'Face-Centred Cubic' },
  50: { sym: 'TET',  label: 'Tetragonal (β-Sn)' },
  51: { sym: 'RHOM', label: 'Rhombohedral' },
  52: { sym: 'TRIG', label: 'Trigonal' },
  74: { sym: 'BCC',  label: 'Body-Centred Cubic' },
  78: { sym: 'FCC',  label: 'Face-Centred Cubic' },
  79: { sym: 'FCC',  label: 'Face-Centred Cubic' },
  80: { sym: 'RHOM', label: 'Rhombohedral' },
  82: { sym: 'FCC',  label: 'Face-Centred Cubic' },
}

// Magnetic ordering data
const MAGNETIC_ORDER: Record<number, { order: string; color: string }> = {
  26: { order: 'Ferromagnetic',       color: '#ef4444' },
  27: { order: 'Ferromagnetic',       color: '#ef4444' },
  28: { order: 'Ferromagnetic',       color: '#ef4444' },
  7:  { order: 'Diamagnetic',         color: '#60a5fa' },
  8:  { order: 'Paramagnetic',        color: '#fbbf24' },
  13: { order: 'Paramagnetic',        color: '#fbbf24' },
  23: { order: 'Paramagnetic',        color: '#fbbf24' },
  24: { order: 'Antiferromagnetic',   color: '#a78bfa' },
  25: { order: 'Antiferromagnetic',   color: '#a78bfa' },
  29: { order: 'Diamagnetic',         color: '#60a5fa' },
  30: { order: 'Diamagnetic',         color: '#60a5fa' },
  6:  { order: 'Diamagnetic',         color: '#60a5fa' },
  1:  { order: 'Diamagnetic',         color: '#60a5fa' },
  2:  { order: 'Diamagnetic',         color: '#60a5fa' },
  4:  { order: 'Diamagnetic',         color: '#60a5fa' },
  5:  { order: 'Diamagnetic',         color: '#60a5fa' },
  10: { order: 'Diamagnetic',         color: '#60a5fa' },
  14: { order: 'Diamagnetic',         color: '#60a5fa' },
  18: { order: 'Diamagnetic',         color: '#60a5fa' },
  36: { order: 'Diamagnetic',         color: '#60a5fa' },
  54: { order: 'Diamagnetic',         color: '#60a5fa' },
  86: { order: 'Diamagnetic',         color: '#60a5fa' },
  79: { order: 'Diamagnetic',         color: '#60a5fa' },
  47: { order: 'Diamagnetic',         color: '#60a5fa' },
  78: { order: 'Paramagnetic',        color: '#fbbf24' },
  44: { order: 'Paramagnetic',        color: '#fbbf24' },
  45: { order: 'Paramagnetic',        color: '#fbbf24' },
  46: { order: 'Paramagnetic',        color: '#fbbf24' },
  64: { order: 'Ferromagnetic',       color: '#ef4444' },
  66: { order: 'Ferromagnetic',       color: '#ef4444' },
  67: { order: 'Ferromagnetic',       color: '#ef4444' },
}

function QuantumTab({ element, color }: { element: Element; color: string }) {
  const zeff = calcZeff(element)
  const crystal = CRYSTAL_STRUCTURE[element.number]
  const magnetic = MAGNETIC_ORDER[element.number]
  const origin = NUCLEOSYNTHESIS_MAP[element.number] ?? 'unknown'
  const originLabel = NUCLEOSYNTHESIS_LABEL[origin]
  const originColor = NUCLEOSYNTHESIS_COLOR[origin]

  return (
    <div className="space-y-7">

      {/* Effective nuclear charge */}
      <div>
        <SectionTitle>Effective Nuclear Charge (Z&#x2091;&#x2092;&#x2091;)</SectionTitle>
        <div
          className="rounded-xl px-5 py-4 flex items-center gap-5"
          style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.08)' }}
        >
          <div className="flex flex-col items-center">
            <span className="text-[36px] font-mono font-bold leading-none" style={{ color }}>
              {zeff.toFixed(2)}
            </span>
            <span className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">Zeff (Slater)</span>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono text-white/40">
              <span>Z (atomic number)</span>
              <span className="text-white/70">{element.number}</span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-white/40">
              <span>Shielding constant S</span>
              <span className="text-white/70">{(element.number - zeff).toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-white/25 pt-1">
              Zeff = Z − S &nbsp;|&nbsp; Slater&apos;s Rules approximation
            </div>
          </div>
        </div>
      </div>

      {/* Crystal structure + magnetic ordering */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <SectionTitle>Crystal Structure</SectionTitle>
          {crystal ? (
            <div
              className="rounded-xl p-4 flex flex-col gap-1"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '2px solid rgba(168,139,250,0.5)' }}
            >
              <span className="text-[22px] font-mono font-bold" style={{ color: '#a78bfa' }}>{crystal.sym}</span>
              <span className="text-[12px] text-white/50">{crystal.label}</span>
            </div>
          ) : (
            <p className="text-[13px] text-white/30 italic">No data</p>
          )}
        </div>

        <div>
          <SectionTitle>Magnetic Ordering</SectionTitle>
          {magnetic ? (
            <div
              className="rounded-xl p-4 flex flex-col gap-1"
              style={{
                background: `${magnetic.color}0d`,
                border: `1px solid ${magnetic.color}30`,
                borderLeft: `2px solid ${magnetic.color}80`,
              }}
            >
              <span className="text-[14px] font-semibold" style={{ color: magnetic.color }}>
                {magnetic.order}
              </span>
              <span className="text-[10px] text-white/30">at room temperature</span>
            </div>
          ) : (
            <p className="text-[13px] text-white/30 italic">No data</p>
          )}
        </div>
      </div>

      {/* Nucleosynthesis origin */}
      <div>
        <SectionTitle accent={originColor}>Cosmic Origin</SectionTitle>
        <div
          className="rounded-xl px-5 py-4 flex items-center gap-4"
          style={{
            background: `${originColor}0d`,
            border: `1px solid ${originColor}28`,
          }}
        >
          <span
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[18px] font-bold"
            style={{ background: `${originColor}20`, color: originColor }}
          >
            ✦
          </span>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: originColor }}>{originLabel}</p>
            <p className="text-[11px] text-white/30 mt-0.5">How {element.name_en} was forged in the universe</p>
          </div>
        </div>
      </div>

      {/* Shells detail */}
      <div>
        <SectionTitle>Electron Shell Populations</SectionTitle>
        <div className="flex flex-wrap gap-2.5">
          {element.shells.map((count, i) => {
            const shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q']
            const shellColors = ['#38bdf8','#60a5fa','#818cf8','#a78bfa','#c084fc','#e879f9','#f472b6']
            const c = shellColors[i % shellColors.length]
            return (
              <div
                key={i}
                className="flex flex-col items-center px-4 py-3 rounded-xl gap-0.5"
                style={{ background: `${c}10`, border: `1px solid ${c}25` }}
              >
                <span className="text-[10px] font-mono" style={{ color: c }}>{shellNames[i]}</span>
                <span className="text-[20px] font-mono font-bold text-white/80">{count}</span>
                <span className="text-[9px] text-white/25">e⁻</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function HistoryTab({ element }: { element: Element }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Discovery</SectionTitle>
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { label: 'Discovered by', value: element.discovered_by_en || element.discovered_by || '—' },
            { label: 'Named by',      value: element.named_by_en || element.named_by || '—' },
          ].map((row, i) => (
            <div
              key={row.label}
              className="flex justify-between items-center py-3.5 px-4"
              style={{
                background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(255,255,255,0.025)',
                borderBottom: i === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <span className="text-[11px] text-white/30 uppercase tracking-widest">{row.label}</span>
              <span className="text-[14px] text-white/75 font-serif">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {element.summary_en && (
        <div>
          <SectionTitle>Background</SectionTitle>
          <p className="text-[13px] text-white/55 leading-relaxed font-serif">{element.summary_en}</p>
        </div>
      )}

      <div>
        <SectionTitle>References</SectionTitle>
        {element.source_en && (
          <a
            href={element.source_en}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-[13px] px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-[rgba(0,212,255,0.1)]"
            style={{ color: '#00d4ff', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.18)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
  const [imgError, setImgError]   = useState(false)

  const imgUrl = element.image?.url
  const attribution =
    element.image?.attribution && !isChinese(element.image.attribution)
      ? element.image.attribution
      : null

  if (!imgUrl || imgError) {
    return (
      <div
        className="flex items-center justify-center rounded-xl text-[13px] text-white/25 -mx-6 -mt-5"
        style={{ aspectRatio: '16/9', background: '#0f141c' }}
      >
        No image available
      </div>
    )
  }

  return (
    <div
      className="-mx-6 -mt-5 relative overflow-hidden"
      style={{ aspectRatio: '16/9', background: '#0f141c' }}
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

      {imgLoaded && (
        <div
          className="absolute top-0 left-0 right-0 px-5 pt-4 pb-10"
          style={{ background: 'linear-gradient(to bottom, rgba(15,20,28,0.72) 0%, transparent 100%)' }}
        >
          <p className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: `${color}cc` }}>
            Element Photo
          </p>
          <p className="text-[17px] font-serif font-light text-white/90 mt-0.5">{element.name_en}</p>
        </div>
      )}

      {attribution && imgLoaded && (
        <div
          className="absolute bottom-0 left-0 right-0 px-5 py-4"
          style={{ background: 'linear-gradient(to top, rgba(15,20,28,0.82) 0%, transparent 100%)' }}
        >
          <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2">{attribution}</p>
        </div>
      )}

      {!imgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0f141c' }}>
          <div
            className="w-9 h-9 rounded-full border-2 border-transparent"
            style={{ borderTopColor: color, animation: 'spin 0.8s linear infinite' }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

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
    return () => { document.body.style.overflow = '' }
  }, [element])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => { if (e.target === overlayRef.current) onClose() },
    [onClose]
  )

  if (!element) return null

  const color  = getCategoryColor(element.category_ui_name, element.color_hex)
  const catEn  = element.category_en || element.category_ui_name

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
        {/* ── Left column ───────────────────────────────────────────────── */}
        <div
          className="hidden md:flex flex-col items-center justify-between relative py-8 px-6"
          style={{
            width: 300,
            minWidth: 300,
            background: `radial-gradient(ellipse at 50% 40%, ${color}0d 0%, transparent 70%)`,
            borderRight: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Symbol + name */}
          <div className="w-full text-center">
            <div
              className="font-serif text-[72px] font-light leading-none tracking-tight"
              style={{ color, textShadow: `0 0 40px ${color}70`, lineHeight: 1 }}
            >
              {element.symbol}
            </div>
            <div className="mt-2 font-serif text-[22px] font-light text-white/80 tracking-wide" style={{ letterSpacing: '0.04em' }}>
              {element.name_en}
            </div>
            <div className="mt-1 text-[11px] font-mono tracking-widest" style={{ color: `${color}aa` }}>
              #{element.number}
            </div>
          </div>

          {/* Atom canvas */}
          <div className="flex-1 flex items-center justify-center w-full my-4">
            <AtomVisualizer element={element} size={228} className="w-full" />
          </div>

          {/* Compact shell counts at the bottom */}
          <div className="w-full">
            <p className="text-[9px] uppercase tracking-[0.2em] text-white/20 text-center mb-2">
              Electron Shells
            </p>
            <div className="flex justify-center flex-wrap gap-1">
              {element.shells.map((count, i) => {
                const shellNames  = ['K','L','M','N','O','P','Q']
                const shellColors = ['#38bdf8','#60a5fa','#818cf8','#a78bfa','#c084fc','#e879f9','#f472b6']
                const c = shellColors[i % shellColors.length]
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center px-2.5 py-1.5 rounded-md"
                    style={{ background: `${c}10`, border: `1px solid ${c}25` }}
                  >
                    <span className="text-[9px] font-mono leading-none" style={{ color: c }}>{shellNames[i]}</span>
                    <span className="text-[11px] font-mono text-white/70 font-semibold leading-none mt-0.5">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right column ──────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Header */}
          <div
            className="flex items-start gap-3 px-6 py-5 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="md:hidden font-serif text-4xl font-light leading-none flex-shrink-0" style={{ color }}>
              {element.symbol}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-3 flex-wrap">
                <h2 className="font-serif text-2xl font-light text-white tracking-wide" style={{ letterSpacing: '0.02em' }}>
                  {element.name_en}
                </h2>
                <span className="text-sm font-mono" style={{ color: `${color}80` }}>#{element.number}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span
                  className="text-[11px] px-3 py-1 rounded-full font-medium tracking-wide"
                  style={{ color, background: `${color}12`, border: `1px solid ${color}35` }}
                >
                  {catEn}
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/45 tracking-wide">
                  {element.phase_en || element.phase}
                </span>
                <span
                  className="text-[11px] px-3 py-1 rounded-full font-mono font-semibold"
                  style={{ color: '#00d4ff', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}
                >
                  {element.block}-block
                </span>
                <span className="text-[11px] px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/45">
                  Period {element.period}{element.group ? ` · Group ${element.group}` : ''}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full text-white/35 hover:text-white hover:bg-red-500/15 border border-white/[0.08] hover:border-red-500/30 transition-all duration-200 text-base"
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
              <div className="text-right hidden sm:block">
                <div className="text-[9px] uppercase tracking-[0.15em] text-white/25">Atomic Mass</div>
                <div className="text-[13px] font-mono text-white/60 mt-0.5">
                  {element.atomic_mass.toPrecision(6)}
                  <span className="text-[10px] text-white/30 ml-1">u</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex mx-6 mt-5 flex-shrink-0 rounded-xl overflow-hidden gap-1 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(0,212,255,0.1)', padding: '5px' }}
            role="tablist"
          >
            {TABS.map((tab, idx) => {
              // Distinct color for each tab when active
              const tabColors = [
                '#38bdf8', // basic: sky blue
                '#06b6d4', // physical: cyan
                '#8b5cf6', // chemical: violet
                '#a78bfa', // quantum: purple
                '#f472b6', // history: pink
                '#fbbf24', // media: amber
              ]
              const tabColor = tabColors[idx % tabColors.length]
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  className="flex-1 text-[11px] font-medium py-2.5 px-3 rounded-lg transition-all duration-200 tracking-wide border"
                  style={
                    isActive
                      ? { 
                          background: `${tabColor}18`,
                          color: tabColor,
                          fontWeight: 700,
                          borderColor: `${tabColor}50`,
                          boxShadow: `0 0 20px ${tabColor}35, inset 0 0 8px ${tabColor}08`,
                        }
                      : { 
                          color: 'rgba(255,255,255,0.4)',
                          background: 'rgba(255,255,255,0.02)',
                          borderColor: 'rgba(255,255,255,0.06)',
                        }
                  }
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-6">
            <div key={activeTab} className="tab-content-animate">
              {activeTab === 'basic'    && <BasicTab    element={element} color={color} />}
              {activeTab === 'physical' && <PhysicalTab element={element} />}
              {activeTab === 'chemical' && <ChemicalTab element={element} />}
              {activeTab === 'quantum'  && <QuantumTab  element={element} color={color} />}
              {activeTab === 'history'  && <HistoryTab  element={element} />}
              {activeTab === 'media'    && <MediaTab    element={element} color={color} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
