export enum VisualizationMode {
  Default = 'default',
  Radius = 'radius',
  Electronegativity = 'en',
  Ionization = 'ip',
  Melting = 'melt',
  Boiling = 'boil',
  Density = 'density',
}

export enum TabId {
  Basic = 'basic',
  Physical = 'physical',
  Chemical = 'chemical',
  History = 'history',
  Media = 'media',
}

export type Language = 'zh' | 'en';

export type HeatmapProperty = 'radius' | 'en' | 'ip' | 'melt' | 'boil' | 'density';
