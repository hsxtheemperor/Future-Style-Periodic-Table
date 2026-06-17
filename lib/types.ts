export interface ElementImage {
  title: string
  url: string
  attribution: string
}

export interface Isotope {
  m: number
  s: boolean
}

export interface Element {
  number: number
  symbol: string
  name: string
  name_en: string
  atomic_mass: number
  period: number
  group: number | null
  block: string
  xpos: number
  ypos: number
  category: string
  category_en: string
  category_ui_name: string
  color_hex: string | null
  phase: string
  phase_en: string
  appearance: string | null
  appearance_en: string | null
  density: number | null
  melt: number | null
  boil: number | null
  molar_heat: number | null
  radius: number | null
  electronegativity_pauling: number | null
  electron_affinity: number | null
  ionization_energies: number[]
  shells: number[]
  electron_configuration: string
  electron_configuration_semantic: string
  discovered_by: string | null
  discovered_by_en: string | null
  named_by: string | null
  named_by_en: string | null
  summary: string
  summary_en: string
  source: string
  source_en: string
  bohr_model_image: string | null
  bohr_model_3d: string | null
  image: ElementImage | null
  valence: string[]
  isotopes: Isotope[]
  'cpk-hex': string | null
}

// ─── Visualization modes ──────────────────────────────────────────────────────

export type VisualizationMode =
  | 'standard'
  | 'radius'
  | 'en'
  | 'ip'
  | 'melt'
  | 'boil'
  | 'density'
  | 'nucleosynthesis'
  | 'phase-state'

export interface VisualizationConfig {
  key: VisualizationMode
  label: string
  unit: string
  property: keyof Element | null
  /** If true this mode uses a special non-heatmap renderer */
  overlay?: boolean
}

export const VISUALIZATION_MODES: VisualizationConfig[] = [
  { key: 'standard',          label: 'Standard',          unit: '',       property: null },
  { key: 'radius',            label: 'Radius',            unit: 'pm',     property: 'radius' },
  { key: 'en',                label: 'Electronegativity', unit: '',       property: 'electronegativity_pauling' },
  { key: 'ip',                label: 'Ionization Energy', unit: 'kJ/mol', property: 'ionization_energies' },
  { key: 'melt',              label: 'Melting Point',     unit: 'K',      property: 'melt' },
  { key: 'boil',              label: 'Boiling Point',     unit: 'K',      property: 'boil' },
  { key: 'density',           label: 'Density',           unit: 'g/cm³',  property: 'density' },
  { key: 'nucleosynthesis',   label: 'Origin',            unit: '',       property: null,   overlay: true },
  { key: 'phase-state',       label: 'Phase',             unit: '',       property: null,   overlay: true },
]

// ─── Categories ───────────────────────────────────────────────────────────────

export interface CategoryInfo {
  name: string
  nameEn: string
  color: string
  uiName: string
}

export const CATEGORIES: CategoryInfo[] = [
  { name: '碱金属',   nameEn: 'Alkali Metal',          color: '#ef4444', uiName: '碱金属' },
  { name: '碱土金属', nameEn: 'Alkaline Earth Metal',  color: '#f97316', uiName: '碱土金属' },
  { name: '过渡金属', nameEn: 'Transition Metal',      color: '#8b5cf6', uiName: '过渡金属' },
  { name: '后过渡金属',nameEn: 'Post-transition Metal', color: '#06b6d4', uiName: '后过渡金属' },
  { name: '类金属',   nameEn: 'Metalloid',             color: '#3b82f6', uiName: '类金属' },
  { name: '非金属',   nameEn: 'Nonmetal',              color: '#eab308', uiName: '非金属' },
  { name: '卤素',     nameEn: 'Halogen',               color: '#22c55e', uiName: '卤素' },
  { name: '稀有气体', nameEn: 'Noble Gas',             color: '#ec4899', uiName: '稀有气体' },
  { name: '镧系',     nameEn: 'Lanthanide',            color: '#f472b6', uiName: '镧系' },
  { name: '锕系',     nameEn: 'Actinide',              color: '#a78bfa', uiName: '锕系' },
]

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  '碱金属':   '#ef4444',
  '碱土金属': '#f97316',
  '过渡金属': '#8b5cf6',
  '后过渡金属':'#06b6d4',
  '类金属':   '#3b82f6',
  '非金属':   '#eab308',
  '卤素':     '#22c55e',
  '稀有气体': '#ec4899',
  '镧系':     '#f472b6',
  '锕系':     '#a78bfa',
}

export const CATEGORY_EN_MAP: Record<string, string> = {
  '碱金属':   'Alkali Metal',
  '碱土金属': 'Alkaline Earth Metal',
  '过渡金属': 'Transition Metal',
  '后过渡金属':'Post-transition Metal',
  '类金属':   'Metalloid',
  '非金属':   'Nonmetal',
  '卤素':     'Halogen',
  '稀有气体': 'Noble Gas',
  '镧系':     'Lanthanide',
  '锕系':     'Actinide',
}

// ─── Nucleosynthesis origin ───────────────────────────────────────────────────

export type NucleosynthesisOrigin =
  | 'big-bang'
  | 'cosmic-ray'
  | 'low-mass-star'
  | 'massive-star'
  | 'supernova'
  | 'neutron-star'
  | 'artificial'
  | 'unknown'

export const NUCLEOSYNTHESIS_LABEL: Record<NucleosynthesisOrigin, string> = {
  'big-bang':      'Big Bang',
  'cosmic-ray':    'Cosmic Ray Fission',
  'low-mass-star': 'Low-Mass Stars',
  'massive-star':  'Massive Stars / Supernovae',
  'supernova':     'Exploding Massive Stars',
  'neutron-star':  'Neutron Star Mergers',
  'artificial':    'Synthetic / Lab-made',
  'unknown':       'Unknown / Multiple',
}

export const NUCLEOSYNTHESIS_COLOR: Record<NucleosynthesisOrigin, string> = {
  'big-bang':      '#38bdf8', // sky blue
  'cosmic-ray':    '#a3e635', // lime
  'low-mass-star': '#fbbf24', // amber
  'massive-star':  '#f97316', // orange
  'supernova':     '#ef4444', // red
  'neutron-star':  '#c084fc', // purple
  'artificial':    '#6b7280', // gray
  'unknown':       '#374151', // dark gray
}

/**
 * Maps atomic number → nucleosynthesis origin.
 * Sources: Ott (2003), Arnould & Goriely (2003), Burbidge et al. (1957)
 */
export const NUCLEOSYNTHESIS_MAP: Record<number, NucleosynthesisOrigin> = {
  1: 'big-bang', 2: 'big-bang',          // H, He
  3: 'cosmic-ray', 4: 'cosmic-ray', 5: 'cosmic-ray', // Li, Be, B
  6: 'massive-star', 7: 'massive-star', 8: 'massive-star', // C, N, O
  9: 'massive-star', 10: 'massive-star',  // F, Ne
  11: 'massive-star', 12: 'massive-star', // Na, Mg
  13: 'massive-star', 14: 'massive-star', 15: 'massive-star',
  16: 'massive-star', 17: 'massive-star', 18: 'massive-star',
  19: 'massive-star', 20: 'massive-star',
  21: 'massive-star', 22: 'massive-star', 23: 'massive-star',
  24: 'massive-star', 25: 'massive-star', 26: 'supernova',  // Fe from supernovae
  27: 'supernova', 28: 'supernova', 29: 'supernova',
  30: 'supernova', 31: 'supernova', 32: 'supernova',
  33: 'supernova', 34: 'supernova', 35: 'supernova',
  36: 'supernova',
  37: 'supernova', 38: 'low-mass-star', 39: 'supernova',
  40: 'supernova', 41: 'supernova', 42: 'supernova',
  43: 'supernova', 44: 'supernova', 45: 'neutron-star',
  46: 'neutron-star', 47: 'neutron-star', 48: 'supernova',
  49: 'supernova', 50: 'supernova',
  51: 'neutron-star', 52: 'neutron-star', 53: 'neutron-star',
  54: 'supernova',
  55: 'low-mass-star', 56: 'low-mass-star',
  57: 'low-mass-star', 58: 'low-mass-star', 59: 'neutron-star',
  60: 'neutron-star', 61: 'neutron-star', 62: 'neutron-star',
  63: 'neutron-star', 64: 'neutron-star', 65: 'neutron-star',
  66: 'neutron-star', 67: 'neutron-star', 68: 'neutron-star',
  69: 'neutron-star', 70: 'neutron-star', 71: 'neutron-star',
  72: 'neutron-star', 73: 'neutron-star', 74: 'neutron-star',
  75: 'neutron-star', 76: 'neutron-star', 77: 'neutron-star',
  78: 'neutron-star', 79: 'neutron-star', // Au — r-process
  80: 'neutron-star', 81: 'neutron-star', 82: 'neutron-star',
  83: 'neutron-star',
  84: 'artificial', 85: 'artificial', 86: 'supernova',
  87: 'artificial', 88: 'artificial',
  89: 'artificial', 90: 'artificial', 91: 'artificial',
  92: 'artificial',
  // All trans-uranium: lab-made
  93:'artificial',94:'artificial',95:'artificial',96:'artificial',
  97:'artificial',98:'artificial',99:'artificial',100:'artificial',
  101:'artificial',102:'artificial',103:'artificial',104:'artificial',
  105:'artificial',106:'artificial',107:'artificial',108:'artificial',
  109:'artificial',110:'artificial',111:'artificial',112:'artificial',
  113:'artificial',114:'artificial',115:'artificial',116:'artificial',
  117:'artificial',118:'artificial',
}

// ─── CAS / Old-IUPAC group notation ──────────────────────────────────────────

/** Returns [ modern, CAS (US), Old-IUPAC (EU) ] for group 1–18. */
export function getGroupNotations(group: number): [string, string, string] {
  const CAS: Record<number, string> = {
    1:'IA', 2:'IIA', 3:'IIIB', 4:'IVB', 5:'VB', 6:'VIB', 7:'VIIB',
    8:'VIIIB', 9:'VIIIB', 10:'VIIIB', 11:'IB', 12:'IIB',
    13:'IIIA', 14:'IVA', 15:'VA', 16:'VIA', 17:'VIIA', 18:'VIIIA',
  }
  const OLD: Record<number, string> = {
    1:'IA', 2:'IIA', 3:'IIIA', 4:'IVA', 5:'VA', 6:'VIA', 7:'VIIA',
    8:'VIII', 9:'VIII', 10:'VIII', 11:'IB', 12:'IIB',
    13:'IIIB', 14:'IVB', 15:'VB', 16:'VIB', 17:'VIIB', 18:'VIII',
  }
  return [String(group), CAS[group] ?? '—', OLD[group] ?? '—']
}
