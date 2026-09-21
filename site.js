// Страница ничего не устанавливает: приложение из лендинга никому не нужно.
// Скрипт только честно говорит, на какой системе кнопка «Скачать» бесполезна.
const fineprint = document.getElementById('fineprint');

if (fineprint && !/Mac/.test(navigator.platform || '')) {
  fineprint.textContent = '0.5.0, macOS 14 and later only — Windows and Linux are planned';
  document.querySelectorAll('[data-download]').forEach((a) => a.classList.remove('primary'));
}
