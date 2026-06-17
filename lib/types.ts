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

export type VisualizationMode =
  | 'standard'
  | 'radius'
  | 'en'
  | 'ip'
  | 'melt'
  | 'boil'
  | 'density'

export interface VisualizationConfig {
  key: VisualizationMode
  label: string
  unit: string
  property: keyof Element | null
}

export const VISUALIZATION_MODES: VisualizationConfig[] = [
  { key: 'standard', label: 'Standard', unit: '', property: null },
  { key: 'radius', label: 'Radius', unit: 'pm', property: 'radius' },
  { key: 'en', label: 'Electronegativity', unit: '', property: 'electronegativity_pauling' },
  { key: 'ip', label: 'Ionization Energy', unit: 'kJ/mol', property: 'ionization_energies' },
  { key: 'melt', label: 'Melting Point', unit: 'K', property: 'melt' },
  { key: 'boil', label: 'Boiling Point', unit: 'K', property: 'boil' },
  { key: 'density', label: 'Density', unit: 'g/cm³', property: 'density' },
]

export interface CategoryInfo {
  name: string
  nameEn: string
  color: string
  uiName: string
}

export const CATEGORIES: CategoryInfo[] = [
  { name: '碱金属', nameEn: 'Alkali Metal', color: '#ef4444', uiName: '碱金属' },
  { name: '碱土金属', nameEn: 'Alkaline Earth Metal', color: '#f97316', uiName: '碱土金属' },
  { name: '过渡金属', nameEn: 'Transition Metal', color: '#8b5cf6', uiName: '过渡金属' },
  { name: '后过渡金属', nameEn: 'Post-transition Metal', color: '#06b6d4', uiName: '后过渡金属' },
  { name: '类金属', nameEn: 'Metalloid', color: '#3b82f6', uiName: '类金属' },
  { name: '非金属', nameEn: 'Nonmetal', color: '#eab308', uiName: '非金属' },
  { name: '卤素', nameEn: 'Halogen', color: '#22c55e', uiName: '卤素' },
  { name: '稀有气体', nameEn: 'Noble Gas', color: '#ec4899', uiName: '稀有气体' },
  { name: '镧系', nameEn: 'Lanthanide', color: '#f472b6', uiName: '镧系' },
  { name: '锕系', nameEn: 'Actinide', color: '#a78bfa', uiName: '锕系' },
]

export const CATEGORY_COLOR_MAP: Record<string, string> = {
  '碱金属': '#ef4444',
  '碱土金属': '#f97316',
  '过渡金属': '#8b5cf6',
  '后过渡金属': '#06b6d4',
  '类金属': '#3b82f6',
  '非金属': '#eab308',
  '卤素': '#22c55e',
  '稀有气体': '#ec4899',
  '镧系': '#f472b6',
  '锕系': '#a78bfa',
}

export const CATEGORY_EN_MAP: Record<string, string> = {
  '碱金属': 'Alkali Metal',
  '碱土金属': 'Alkaline Earth Metal',
  '过渡金属': 'Transition Metal',
  '后过渡金属': 'Post-transition Metal',
  '类金属': 'Metalloid',
  '非金属': 'Nonmetal',
  '卤素': 'Halogen',
  '稀有气体': 'Noble Gas',
  '镧系': 'Lanthanide',
  '锕系': 'Actinide',
}
