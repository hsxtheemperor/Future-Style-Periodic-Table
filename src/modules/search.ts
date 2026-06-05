import { getState } from '../state';

export function initSearch(): void {
  const state = getState();
  document.getElementById('searchInput')!.addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value.toLowerCase().trim();

    document.querySelectorAll<HTMLElement>('.element').forEach(el => {
      let match = false;

      if (el.classList.contains('placeholder')) {
        match = (el.textContent || '').toLowerCase().includes(val);
      } else if (el.dataset.idx) {
        const d = state.elements[Number(el.dataset.idx) - 1];
        match =
          d.name.includes(val) ||
          d.sym.toLowerCase().includes(val) ||
          String(d.idx) === val ||
          d.enName.toLowerCase().includes(val);
      }

      if (val === '') {
        el.style.opacity = '1';
        el.style.filter = 'none';
      } else {
        el.style.opacity = match ? '1' : '0.1';
        el.style.filter = match ? 'none' : 'grayscale(100%)';
      }
    });
  });
}
