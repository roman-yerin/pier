// Страница ничего не устанавливает: приложение из лендинга никому не нужно.
// Скрипт только честно говорит, на какой системе кнопка «Скачать» бесполезна,
// и подсвечивает два примера кода.
const fineprint = document.getElementById('fineprint');

if (fineprint && !/Mac/.test(navigator.platform || '')) {
  fineprint.textContent = '0.5.0, macOS 14 and later only — Windows and Linux are planned';
  document.querySelectorAll('[data-download]').forEach((a) => a.classList.remove('primary'));
}

// Подсветка своя, на двух регулярках: на странице ровно два языка и десяток
// строк кода — библиотека с CDN стоила бы дороже, чем всё остальное на ней.
const GRAMMAR = {
  json: /(?<key>"(?:[^"\\]|\\.)*")(?=\s*:)|(?<str>"(?:[^"\\]|\\.)*")|(?<num>-?\d+(?:\.\d+)?)|(?<lit>\b(?:true|false|null)\b)/g,
  js: /(?<com>\/\/[^\n]*)|(?<str>'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(?<kw>\b(?:import|from|export|const|let|var|function|return|new|await|async|if|else)\b)|(?<num>\b\d+(?:\.\d+)?\b)/g,
};

/** Текст → HTML: совпадения в <span>, всё остальное экранировано. */
function paint(text, grammar) {
  const escape = (chunk) => chunk
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let out = '';
  let last = 0;
  grammar.lastIndex = 0;
  for (let m = grammar.exec(text); m; m = grammar.exec(text)) {
    const [token] = Object.entries(m.groups).find(([, value]) => value !== undefined);
    out += escape(text.slice(last, m.index));
    out += `<span class="t-${token}">${escape(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + escape(text.slice(last));
}

for (const [language, grammar] of Object.entries(GRAMMAR)) {
  document.querySelectorAll(`code.lang-${language}`).forEach((code) => {
    code.innerHTML = paint(code.textContent, grammar);
  });
}
