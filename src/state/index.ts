import type { Element } from '../types/element';
import type { Language } from '../types/app';

export interface AppState {
  elements: Element[];
  currentLanguage: Language;
  currentActiveCategory: number | null;
  currentTab: string;

  rotX: number;
  rotY: number;
  isDragging: boolean;
  lastMouseX: number;
  lastMouseY: number;

  expandedRotX: number;
  expandedRotY: number;
  expandedScale: number;
  isExpandedDragging: boolean;
  expandedLastMouseX: number;
  expandedLastMouseY: number;

  currentElementZ: number;
  currentElementData: Element | null;

  currentImageUrl: string | null;
  currentBohrImageUrl: string | null;
  imageTimeout: ReturnType<typeof setTimeout> | null;
  bohrImageTimeout: ReturnType<typeof setTimeout> | null;
}

const state: AppState = {
  elements: [],
  currentLanguage: 'zh',
  currentActiveCategory: null,
  currentTab: 'basic',

  rotX: 0,
  rotY: 0,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,

  expandedRotX: 0,
  expandedRotY: 0,
  expandedScale: 1,
  isExpandedDragging: false,
  expandedLastMouseX: 0,
  expandedLastMouseY: 0,

  currentElementZ: 1,
  currentElementData: null,

  currentImageUrl: null,
  currentBohrImageUrl: null,
  imageTimeout: null,
  bohrImageTimeout: null,
};

export function getState(): AppState {
  return state;
}
