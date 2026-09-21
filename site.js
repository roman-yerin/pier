// Страница показывает продукт на себе: если Pier установлен, эта же страница
// ставится приложением по кнопке. Ничего другого скрипту делать не нужно.
import { canInstallApp, launchApp, PIER_DOWNLOAD_URL } from './pier-launch.js';

const install = document.getElementById('install-self');
const fineprint = document.getElementById('fineprint');

if (install && canInstallApp()) {
  install.hidden = false;
  install.addEventListener('click', () => {
    install.disabled = true;
    launchApp({
      manifest: '/manifest.webmanifest',
      onLaunched: () => {
        install.textContent = 'Открыто в приложении';
      },
      onMissing: () => {
        // Pier не установлен — ссылка epwa:// никуда не ведёт, и это
        // единственный способ об этом узнать: молчание в течение секунды.
        install.hidden = true;
        fineprint.textContent = 'Сначала поставьте Pier — он и открывает такие ссылки.';
      },
    });
  });
}

// Вне macOS скачивать нечего: говорим об этом прямо, а не прячем кнопку.
if (!/Mac/.test(navigator.platform || '') && fineprint) {
  fineprint.textContent = 'Версия 0.5.0 · пока только macOS 14 и новее · Windows и Linux в плане';
  document.querySelectorAll('[data-download]').forEach((a) => a.classList.remove('primary'));
}
