import { getState } from '../state';
import { getElectronData } from '../config/electron';
import { t } from '../i18n';

export function render3DAtom(
  Z: number,
  container: HTMLElement = document.getElementById('atomContainer')!,
  scale = 1
): number[] {
  container.textContent = '';

  const nucleus = document.createElement('div');
  nucleus.className = 'nucleus';
  if (scale !== 1) {
    nucleus.style.width = `${12 * scale}px`;
    nucleus.style.height = `${12 * scale}px`;
  }
  container.appendChild(nucleus);

  const state = getState();
  const element = state.elements[Z - 1];
  const shells = element?.shells?.length > 0 ? element.shells : getElectronData(Z).shells;

  shells.forEach((count, idx) => {
    if (count === 0) return;
    const isValence = idx === shells.length - 1;
    const baseSize = scale === 1 ? 40 : 80;
    const increment = scale === 1 ? 25 : 50;
    const size = baseSize + idx * increment;

    const orbit = document.createElement('div');
    orbit.className = 'orbit-ring';
    orbit.style.width = `${size}px`;
    orbit.style.height = `${size}px`;
    orbit.style.top = `calc(50% - ${size / 2}px)`;
    orbit.style.left = `calc(50% - ${size / 2}px)`;

    const rx = Math.random() * 360;
    const ry = Math.random() * 360;
    orbit.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

    const animDuration = 5 + idx * 2;
    orbit.animate(
      [
        { transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(0deg)` },
        { transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(360deg)` },
      ],
      { duration: animDuration * 1000, iterations: Infinity, easing: 'linear' }
    );

    for (let i = 0; i < count; i++) {
      const electron = document.createElement('div');
      electron.className = `electron ${isValence ? 'valence' : 'inner'}`;
      if (scale !== 1) electron.classList.add('expanded');
      const angle = (360 / count) * i;
      electron.style.transform = `rotate(${angle}deg) translateX(${size / 2}px)`;
      orbit.appendChild(electron);
    }
    container.appendChild(orbit);
  });

  return shells;
}

export function initDragControl(): void {
  const state = getState();
  const wrapper = document.getElementById('atomWrapper')!;
  const atomContainer = document.getElementById('atomContainer')!;

  wrapper.addEventListener('mousedown', (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('.expand-btn')) return;
    state.isDragging = true;
    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
  });

  window.addEventListener('mousemove', (e: MouseEvent) => {
    if (!state.isDragging) return;
    const dx = e.clientX - state.lastMouseX;
    const dy = e.clientY - state.lastMouseY;
    state.rotY += dx * 0.5;
    state.rotX -= dy * 0.5;
    atomContainer.style.transform = `rotateX(${state.rotX}deg) rotateY(${state.rotY}deg)`;
    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => { state.isDragging = false; });

  wrapper.addEventListener('touchstart', (e: TouchEvent) => {
    if ((e.target as HTMLElement).closest('.expand-btn')) return;
    state.isDragging = true;
    state.lastMouseX = e.touches[0].clientX;
    state.lastMouseY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e: TouchEvent) => {
    if (!state.isDragging) return;
    const dx = e.touches[0].clientX - state.lastMouseX;
    const dy = e.touches[0].clientY - state.lastMouseY;
    state.rotY += dx * 0.8;
    state.rotX -= dy * 0.8;
    atomContainer.style.transform = `rotateX(${state.rotX}deg) rotateY(${state.rotY}deg)`;
    state.lastMouseX = e.touches[0].clientX;
    state.lastMouseY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', () => { state.isDragging = false; });
}

export function initExpandedDragControl(): void {
  const state = getState();
  const wrapper = document.getElementById('expandedAtomWrapper')!;
  const expandedAtomContainer = document.getElementById('expandedAtomContainer')!;
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;

  wrapper.addEventListener('mousedown', (e: MouseEvent) => {
    state.isExpandedDragging = true;
    state.expandedLastMouseX = e.clientX;
    state.expandedLastMouseY = e.clientY;
    wrapper.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e: MouseEvent) => {
    if (!state.isExpandedDragging) return;
    const dx = e.clientX - state.expandedLastMouseX;
    const dy = e.clientY - state.expandedLastMouseY;
    state.expandedRotY += dx * 0.5;
    state.expandedRotX -= dy * 0.5;
    expandedAtomContainer.style.transform =
      `rotateX(${state.expandedRotX}deg) rotateY(${state.expandedRotY}deg) scale(${state.expandedScale})`;
    state.expandedLastMouseX = e.clientX;
    state.expandedLastMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    state.isExpandedDragging = false;
    wrapper.style.cursor = 'grab';
  });

  wrapper.addEventListener('wheel', (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    state.expandedScale = Math.max(0.5, Math.min(2, state.expandedScale + delta));
    expandedAtomContainer.style.transform =
      `rotateX(${state.expandedRotX}deg) rotateY(${state.expandedRotY}deg) scale(${state.expandedScale})`;
  }, { passive: false });

  wrapper.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length === 1) {
      state.isExpandedDragging = true;
      state.expandedLastMouseX = e.touches[0].clientX;
      state.expandedLastMouseY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e: TouchEvent) => {
    if (!state.isExpandedDragging || !expandedAtomModal.classList.contains('open')) return;
    const dx = e.touches[0].clientX - state.expandedLastMouseX;
    const dy = e.touches[0].clientY - state.expandedLastMouseY;
    state.expandedRotY += dx * 0.8;
    state.expandedRotX -= dy * 0.8;
    expandedAtomContainer.style.transform =
      `rotateX(${state.expandedRotX}deg) rotateY(${state.expandedRotY}deg) scale(${state.expandedScale})`;
    state.expandedLastMouseX = e.touches[0].clientX;
    state.expandedLastMouseY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchend', () => { state.isExpandedDragging = false; });
}

export function openExpandedAtom(): void {
  const state = getState();
  const expandedAtomContainer = document.getElementById('expandedAtomContainer')!;
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;

  state.expandedRotX = 0;
  state.expandedRotY = 0;
  state.expandedScale = 1;
  expandedAtomContainer.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';

  render3DAtom(state.currentElementZ, expandedAtomContainer, 1.8);
  updateExpandedAtomInfo();
  expandedAtomModal.classList.add('open');
}

export function updateExpandedAtomInfo(): void {
  const state = getState();
  const element = state.elements[state.currentElementZ - 1];
  const shells = element?.shells?.length > 0 ? element.shells : getElectronData(state.currentElementZ).shells;

  document.getElementById('expanded-symbol')!.textContent = element.sym;
  document.getElementById('expanded-symbol')!.style.color = element.cat.color;
  document.getElementById('expanded-name')!.textContent = `${element.name} ${element.enName}`;
  document.getElementById('expanded-hint')!.textContent = t('expanded-hint');

  const legendContainer = document.getElementById('expanded-shell-legend')!;
  legendContainer.textContent = '';

  shells.forEach((count, idx) => {
    if (count === 0) return;
    const isValence = idx === shells.length - 1;
    const item = document.createElement('div');
    item.className = `shell-legend-item ${isValence ? 'valence' : ''}`;

    const shellName =
      state.currentLanguage === 'zh'
        ? `${t('shell-prefix')}${idx + 1}${t('shell-suffix')}`
        : `${t('shell-prefix')}${idx + 1}`;

    const valenceText = isValence ? ` ${t('valence-shell')}` : '';

    const dot = document.createElement('span');
    dot.className = `shell-dot ${isValence ? 'valence' : 'inner'}`;
    const label = document.createElement('span');
    label.textContent = `${shellName}: ${count}${t('electrons-unit')}${valenceText}`;
    item.appendChild(dot);
    item.appendChild(label);
    legendContainer.appendChild(item);
  });
}

export function closeExpandedAtom(): void {
  const expandedAtomModal = document.getElementById('expandedAtomModal')!;
  const expandedAtomContainer = document.getElementById('expandedAtomContainer')!;
  expandedAtomModal.classList.remove('open');
  setTimeout(() => { expandedAtomContainer.textContent = ''; }, 300);
}
