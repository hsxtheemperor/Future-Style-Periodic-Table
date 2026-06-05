import { getState } from '../state';
import { formatValue } from '../utils/dom';
import type { HeatmapProperty } from '../types/app';

export function setMode(mode: string): void {
  const state = getState();
  const table = document.getElementById('table')!;

  state.currentActiveCategory = null;
  document.querySelectorAll<HTMLElement>('.legend-item').forEach(b => b.classList.remove('active'));

  const domElements = document.querySelectorAll<HTMLElement>('.element');
  const btns = document.querySelectorAll<HTMLElement>('.mode-btn');

  btns.forEach(b => b.classList.remove('active'));
  document.querySelector<HTMLElement>(`.mode-btn[data-mode="${mode}"]`)?.classList.add('active');

  if (mode === 'default') {
    table.classList.remove('heatmap-active');
    domElements.forEach(el => {
      if (el.classList.contains('placeholder')) {
        el.style.background = 'rgba(255,255,255,0.01)';
        el.style.opacity = '1';
        return;
      }
      const data = state.elements[Number(el.dataset.idx) - 1];
      el.style.background = 'var(--card-bg)';
      el.style.borderColor = data.cat.color;
      el.querySelector<HTMLElement>('.symbol')!.style.color = data.cat.color;
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.querySelector<HTMLElement>('.detail-val')!.textContent = '';
    });
    return;
  }

  table.classList.add('heatmap-active');

  const prop = mode as HeatmapProperty;
  let maxVal = -Infinity;
  let minVal = Infinity;

  state.elements.forEach(e => {
    const val = e[prop] as number;
    if (val > 0) {
      if (val > maxVal) maxVal = val;
      if (val < minVal) minVal = val;
    }
  });

  domElements.forEach(el => {
    if (el.classList.contains('placeholder')) {
      el.style.opacity = '0.1';
      return;
    }

    const data = state.elements[Number(el.dataset.idx) - 1];
    const val = data[prop] as number;
    const displayDiv = el.querySelector<HTMLElement>('.detail-val')!;

    el.style.opacity = '1';
    el.style.filter = 'none';

    if (!val || val === 0) {
      el.style.background = '#222';
      el.style.borderColor = '#444';
      displayDiv.textContent = '-';
    } else {
      const ratio = (val - minVal) / (maxVal - minVal);
      const hue = 240 - ratio * 240;
      el.style.background = `hsla(${hue}, 70%, 40%, 0.8)`;
      el.style.borderColor = `hsla(${hue}, 100%, 70%, 1)`;
      el.querySelector<HTMLElement>('.symbol')!.style.color = '#fff';
      displayDiv.textContent = formatValue(val);
    }
  });
}
