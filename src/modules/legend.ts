import { getState } from '../state';
import { categories } from '../config/categories';
import { getCategoryName } from '../i18n';
import { setMode } from './heatmap';

export function renderLegend(): void {
  const legend = document.getElementById('legend')!;
  legend.textContent = '';

  categories.forEach((c, i) => {
    const btn = document.createElement('div');
    btn.className = 'legend-item';

    const colorDot = document.createElement('div');
    colorDot.className = 'legend-color';
    colorDot.style.background = c.color;

    btn.appendChild(colorDot);
    btn.appendChild(document.createTextNode(getCategoryName(c)));
    btn.addEventListener('click', () => toggleCategory(i, btn));
    legend.appendChild(btn);
  });
}

export function toggleCategory(catId: number, btn: HTMLElement): void {
  const state = getState();

  if (document.querySelector('.periodic-table.heatmap-active')) {
    setMode('default');
  }

  const allElements = document.querySelectorAll<HTMLElement>('.element');
  const allBtns = document.querySelectorAll<HTMLElement>('.legend-item');

  if (state.currentActiveCategory === catId) {
    state.currentActiveCategory = null;
    allBtns.forEach(b => b.classList.remove('active'));
    allElements.forEach(el => {
      el.style.opacity = '1';
      el.style.filter = 'none';
    });
  } else {
    state.currentActiveCategory = catId;
    allBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    allElements.forEach(el => {
      if (el.dataset.idx) {
        const data = state.elements[Number(el.dataset.idx) - 1];
        if (data.catId === catId) {
          el.style.opacity = '1';
          el.style.filter = 'none';
        } else {
          el.style.opacity = '0.1';
          el.style.filter = 'grayscale(100%)';
        }
      } else if (el.classList.contains('placeholder')) {
        const nameEl = el.querySelector('.name');
        const text = nameEl?.textContent || '';
        const isRelated =
          (catId === 8 && (text.includes('镧') || text.includes('Lanthan'))) ||
          (catId === 9 && (text.includes('锕') || text.includes('Actin')));
        el.style.opacity = isRelated ? '1' : '0.3';
      }
    });
  }
}
