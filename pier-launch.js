// Pier: кнопка «Открыть в приложении» для любого сайта. ES-модуль без зависимостей —
// скопируйте на свой сайт (канонический — mac-web-runtime/Web/pier-launch.js).
//
// Сайт открывает ссылку epwa://launch: Pier ставит (или открывает) приложение сайта
// и передаёт ему состояние страницы в `start_url?pier-handoff=…`. Нет Pier — ссылка
// никуда не ведёт, и сайт предлагает его скачать.

/** Постоянная ссылка на последний выпуск Pier. */
export const PIER_DOWNLOAD_URL = 'https://github.com/roman-yerin/pier/releases/latest/download/Pier.dmg';

/** Предлагать приложение можно: это Mac и не сам Pier. iPad выдаёт себя за Mac,
 *  но у Mac сенсорного экрана нет — любое касание значит «не Mac». */
export function canInstallApp() {
  if (window.epwa) return false;
  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  return /mac/i.test(platform) && !navigator.maxTouchPoints;
}

/** Любое JSON-значение → base64url (компактно и безопасно для ссылки). */
export function encodeHandoff(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeHandoff(text) {
  try {
    const base64 = text.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))));
  } catch {
    return null;
  }
}

/** Состояние, переданное сайтом при переходе в приложение; параметр убирается из адреса. */
export function takeHandoff(param = 'pier-handoff') {
  const url = new URL(location.href);
  const raw = url.searchParams.get(param);
  if (raw === null) return null;
  url.searchParams.delete(param);
  history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  return decodeHandoff(raw);
}

/**
 * Открыть сайт в приложении Pier (Pier сам поставит его, если нужно).
 *
 * - `manifest` — адрес web app manifest сайта (относительный — от страницы);
 * - `handoff` — состояние страницы (любое JSON-значение), придёт приложению;
 * - `onLaunched` — страница ушла в фон: Pier открылся;
 * - `onMissing` — за `timeout` мс ничего не произошло: скорее всего, Pier не установлен.
 *   Браузер может сначала спросить «Открыть Pier?» — тогда `onLaunched` придёт позже
 *   (слушаем до минуты), и подсказку об установке стоит спрятать.
 * - `navigate` — как открыть ссылку (для тестов); по умолчанию — переход по ней.
 */
export function launchApp({
  manifest, handoff, timeout = 1500, onLaunched, onMissing,
  navigate = (url) => { location.href = url; },
} = {}) {
  const link = new URL('epwa://launch');
  link.searchParams.set('manifest', new URL(manifest, location.href).href);
  if (handoff !== undefined) link.searchParams.set('handoff', encodeHandoff(handoff));

  let launched = false;
  const onVisibility = () => { if (document.hidden) done(); };
  const cleanup = () => {
    window.removeEventListener('blur', done);
    document.removeEventListener('visibilitychange', onVisibility);
  };
  function done() {
    if (launched) return;
    launched = true;
    cleanup();
    onLaunched?.();
  }
  window.addEventListener('blur', done);
  document.addEventListener('visibilitychange', onVisibility);
  setTimeout(() => { if (!launched) onMissing?.(); }, timeout);
  setTimeout(cleanup, 60_000);
  navigate(link.href);
}
