import './css/styles.css';
import { getState } from './state';
import { processElementsData } from './data';
import { t, updateElementTranslations } from './i18n';
import { renderTable } from './modules/table';
import { renderLegend } from './modules/legend';
import { setMode } from './modules/heatmap';
import { initDragControl, initExpandedDragControl, openExpandedAtom, closeExpandedAtom, updateExpandedAtomInfo } from './modules/atom3d';
import { showModal, closeModal, switchTab } from './modules/modal';
import { loadElementImage, loadBohrImage } from './modules/media';
import { initSearch } from './modules/search';

function setLanguage(lang: 'zh' | 'en'): void {
  const state = getState();
  state.currentLanguage = lang;

  document.getElementById('lang-zh')!.classList.toggle('active', lang === 'zh');
  document.getElementById('lang-en')!.classList.toggle('active', lang === 'en');
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  updateUILanguage();
  renderTable();
  renderLegend();

  const modal = document.getElementById('modal')!;
  if (modal.classList.contains('open') && state.currentElementData) {
    showModal(state.currentElementData);
  }
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;
  if (expandedAtomModal.classList.contains('open')) {
    updateExpandedAtomInfo();
  }
}

function updateUILanguage(): void {
  updateElementTranslations({
    'main-title': 'periodic-table-title',
    'mode-standard': 'standard',
    'mode-radius': 'radius',
    'mode-electronegativity': 'electronegativity',
    'mode-ionization': 'ionization-energy',
    'mode-melting': 'melting-point',
    'mode-boiling': 'boiling-point',
    'mode-density': 'density',
    'rotate-hint': 'rotate-hint',
  });
  (document.getElementById('searchInput') as HTMLInputElement).placeholder = t('search-placeholder');
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode!));
  });

  document.getElementById('lang-zh')!.addEventListener('click', () => setLanguage('zh'));
  document.getElementById('lang-en')!.addEventListener('click', () => setLanguage('en'));

  document.querySelectorAll<HTMLElement>('.close-btn').forEach(btn => {
    if (btn.closest('.expanded-atom-overlay')) {
      btn.addEventListener('click', closeExpandedAtom);
    } else {
      btn.addEventListener('click', closeModal);
    }
  });

  document.querySelector('.expand-btn')?.addEventListener('click', openExpandedAtom);

  document.querySelectorAll<HTMLElement>('.tab-btn').forEach(btn => {
    const tabId = btn.id.replace('tab-', '');
    btn.addEventListener('click', () => switchTab(tabId));
  });

  document.getElementById('load-image-btn')!.addEventListener('click', loadElementImage);
  document.getElementById('load-bohr-image-btn')!.addEventListener('click', loadBohrImage);

  const modal = document.getElementById('modal')!;
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  expandedAtomModal.addEventListener('click', (e) => {
    if (e.target === expandedAtomModal) closeExpandedAtom();
  });
}

function initKeyboard(): void {
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (expandedAtomModal.classList.contains('open')) {
        closeExpandedAtom();
      } else {
        closeModal();
      }
    }
  });
}

function init(): void {
  const state = getState();
  state.elements = processElementsData();

  bindEvents();
  renderLegend();
  renderTable();
  initDragControl();
  initExpandedDragControl();
  initSearch();
  initKeyboard();
  updateUILanguage();
}

init();
