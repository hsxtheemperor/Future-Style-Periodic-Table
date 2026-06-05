import { getState } from '../state';
import { t } from '../i18n';

const LOAD_TIMEOUT = 5000;

export function resetMediaContainers(): void {
  const imageBtn = document.getElementById('load-image-btn')!;
  const img = document.getElementById('element-image') as HTMLImageElement;

  img.onload = null;
  img.onerror = null;
  img.src = '';
  imageBtn.style.display = 'flex';
  imageBtn.classList.remove('loading', 'error', 'disabled');
  document.getElementById('image-display')!.style.display = 'none';

  const bohrBtn = document.getElementById('load-bohr-image-btn')!;
  const bohrImg = document.getElementById('bohr-image') as HTMLImageElement;

  bohrImg.onload = null;
  bohrImg.onerror = null;
  bohrImg.src = '';
  bohrBtn.style.display = 'flex';
  bohrBtn.classList.remove('loading', 'error', 'disabled');
  document.getElementById('bohr-image-display')!.style.display = 'none';
}

export function updateMediaButtonState(
  btnId: string,
  textId: string,
  resourceUrl: string | null,
  defaultText: string
): void {
  const btn = document.getElementById(btnId)!;
  const textSpan = document.getElementById(textId)!;
  if (!resourceUrl) {
    btn.classList.add('disabled');
    textSpan.textContent = t('no-resource');
  } else {
    btn.classList.remove('disabled');
    textSpan.textContent = defaultText;
  }
}

function setButtonError(btn: HTMLElement, textSpan: HTMLElement, message: string): void {
  btn.classList.remove('loading');
  btn.classList.add('error');
  textSpan.textContent = message;
}

export function loadElementImage(): void {
  const state = getState();
  const imageUrl = state.currentElementData?.image?.url;
  if (!imageUrl) return;

  const btn = document.getElementById('load-image-btn')!;
  const textSpan = document.getElementById('load-image-text')!;
  const display = document.getElementById('image-display')!;
  const img = document.getElementById('element-image') as HTMLImageElement;
  const caption = document.getElementById('image-caption')!;

  if (btn.classList.contains('disabled') || btn.classList.contains('loading')) return;

  btn.classList.remove('error');
  textSpan.textContent = t('loading');
  btn.classList.add('loading');

  state.currentImageUrl = imageUrl;

  if (state.imageTimeout) {
    clearTimeout(state.imageTimeout);
  }

  state.imageTimeout = setTimeout(() => {
    if (state.currentImageUrl === imageUrl && btn.classList.contains('loading')) {
      img.onload = null;
      img.onerror = null;
      img.src = '';
      setButtonError(btn, textSpan, t('load-timeout'));
    }
  }, LOAD_TIMEOUT);

  img.onload = () => {
    if (state.currentImageUrl !== imageUrl) return;
    if (state.imageTimeout) {
      clearTimeout(state.imageTimeout);
      state.imageTimeout = null;
    }
    btn.style.display = 'none';
    display.style.display = 'block';
    caption.textContent = state.currentElementData?.image?.title || '';
  };

  img.onerror = () => {
    if (state.currentImageUrl !== imageUrl) return;
    if (state.imageTimeout) {
      clearTimeout(state.imageTimeout);
      state.imageTimeout = null;
    }
    setButtonError(btn, textSpan, t('load-failed'));
  };

  img.src = imageUrl;
}

export function loadBohrImage(): void {
  const state = getState();
  const bohrUrl = state.currentElementData?.bohrModelImage;
  if (!bohrUrl) return;

  const btn = document.getElementById('load-bohr-image-btn')!;
  const textSpan = document.getElementById('load-bohr-image-text')!;
  const display = document.getElementById('bohr-image-display')!;
  const img = document.getElementById('bohr-image') as HTMLImageElement;

  if (btn.classList.contains('disabled') || btn.classList.contains('loading')) return;

  btn.classList.remove('error');
  textSpan.textContent = t('loading');
  btn.classList.add('loading');

  state.currentBohrImageUrl = bohrUrl;

  if (state.bohrImageTimeout) {
    clearTimeout(state.bohrImageTimeout);
  }

  state.bohrImageTimeout = setTimeout(() => {
    if (state.currentBohrImageUrl === bohrUrl && btn.classList.contains('loading')) {
      img.onload = null;
      img.onerror = null;
      img.src = '';
      setButtonError(btn, textSpan, t('load-timeout'));
    }
  }, LOAD_TIMEOUT);

  img.onload = () => {
    if (state.currentBohrImageUrl !== bohrUrl) return;
    if (state.bohrImageTimeout) {
      clearTimeout(state.bohrImageTimeout);
      state.bohrImageTimeout = null;
    }
    btn.style.display = 'none';
    display.style.display = 'block';
  };

  img.onerror = () => {
    if (state.currentBohrImageUrl !== bohrUrl) return;
    if (state.bohrImageTimeout) {
      clearTimeout(state.bohrImageTimeout);
      state.bohrImageTimeout = null;
    }
    setButtonError(btn, textSpan, t('load-failed'));
  };

  img.src = bohrUrl;
}
