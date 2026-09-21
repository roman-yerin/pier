// Страница ничего не устанавливает: приложение из лендинга никому не нужно.
// Скрипт только честно говорит, на какой системе кнопка «Скачать» бесполезна.
const fineprint = document.getElementById('fineprint');

if (fineprint && !/Mac/.test(navigator.platform || '')) {
  fineprint.textContent = 'Версия 0.5.0 · пока только macOS 14 и новее · Windows и Linux в плане';
  document.querySelectorAll('[data-download]').forEach((a) => a.classList.remove('primary'));
}
