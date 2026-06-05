import type { Category } from '../types/element';

export const categories: readonly Category[] = [
  { name: '碱金属', nameEn: 'Alkali Metal', color: '#ff5252' },
  { name: '碱土金属', nameEn: 'Alkaline Earth Metal', color: '#ffb142' },
  { name: '过渡金属', nameEn: 'Transition Metal', color: '#706fd3' },
  { name: '后过渡金属', nameEn: 'Post-transition Metal', color: '#33d9b2' },
  { name: '类金属', nameEn: 'Metalloid', color: '#34ace0' },
  { name: '非金属', nameEn: 'Nonmetal', color: '#ffda79' },
  { name: '卤素', nameEn: 'Halogen', color: '#218c74' },
  { name: '稀有气体', nameEn: 'Noble Gas', color: '#b33939' },
  { name: '镧系', nameEn: 'Lanthanide', color: '#f78fb3' },
  { name: '锕系', nameEn: 'Actinide', color: '#cd84f1' },
] as const;

export const categoryNameMap: Record<string, number> = {
  '碱金属': 0,
  '碱土金属': 1,
  '过渡金属': 2,
  '后过渡金属': 3,
  '类金属': 4,
  '非金属': 5,
  '卤素': 6,
  '稀有气体': 7,
  '镧系': 8,
  '锕系': 9,
};
