export interface ElementImage {
  title: string;
  url: string;
  attribution: string;
}

export interface Isotope {
  m: number;
  s: boolean;
}

export interface RawElement {
  name: string;
  name_en: string;
  symbol: string;
  number: number;
  atomic_mass: number;
  period: number;
  group: number | null;
  block: string;
  xpos: number;
  ypos: number;
  category: string;
  category_en: string;
  category_ui_name: string;
  color_hex: string | null;
  phase: string;
  phase_en: string;
  appearance: string | null;
  appearance_en: string | null;
  density: number | null;
  melt: number | null;
  boil: number | null;
  molar_heat: number | null;
  radius: number | null;
  electronegativity_pauling: number | null;
  electron_affinity: number | null;
  ionization_energies: number[];
  shells: number[];
  electron_configuration: string;
  electron_configuration_semantic: string;
  discovered_by: string | null;
  discovered_by_en: string | null;
  named_by: string | null;
  named_by_en: string | null;
  summary: string;
  summary_en: string;
  source: string;
  source_en: string;
  bohr_model_image: string | null;
  bohr_model_3d: string | null;
  image: ElementImage | null;
  valence: string[];
  isotopes: Isotope[];
  'cpk-hex': string | null;
}

export interface Element {
  idx: number;
  sym: string;
  name: string;
  enName: string;
  mass: number;
  cat: Category;
  catId: number;
  colorHex: string;

  period: number;
  group: number | null;
  block: string;
  xpos: number;
  ypos: number;

  radius: number;
  density: number;
  melt: number;
  boil: number;
  molarHeat: number;
  phase: string;
  phaseEn: string;
  appearance: string | null;
  appearanceEn: string | null;

  en: number;
  electronAffinity: number;
  ip: number;
  ionizationEnergies: number[];
  valence: string[];

  shells: number[];
  electronConfig: string;
  electronConfigSemantic: string;

  isotopes: Isotope[];

  category: string;
  categoryEn: string;

  discoveredBy: string | null;
  discoveredByEn: string | null;
  namedBy: string | null;
  namedByEn: string | null;

  summary: string;
  summaryEn: string;

  source: string;
  sourceEn: string;
  bohrModelImage: string | null;
  bohrModel3d: string | null;
  image: ElementImage | null;
  cpkHex: string | null;
}

export interface Category {
  name: string;
  nameEn: string;
  color: string;
}
