/* Собирает демо-сайты клиентов в один узел под demo.narodniy-team.ru.
   Источник — рабочие папки в c:/autosait/clients, сюда копируется только
   то, что реально отдаётся: разметка, стили, скрипты и сжатые фотографии.
   Запуск: node sync.mjs */
import fs from 'fs';
import path from 'path';

const SRC = 'c:/autosait/clients';
const DST = 'c:/autosait/demo';

const SITES = [
  { from: 'arlet', to: 'arlett' },
  { from: 'atelier-volos', to: 'atelier' },
  { from: 'koko-studio', to: 'koko' },
  { from: 'lingostars', to: 'lingostars' },
  { from: 'harvard', to: 'harvard' },
  { from: 'yardclub', to: 'yardclub' },
];
/* что копируем: сайт без оригиналов фото и служебных скриптов */
const TAKE = ['index.html', '.nojekyll', 'assets/css', 'assets/js', 'assets/photo', 'docs/preview.png'];

function copy(from, to) {
  const st = fs.statSync(from);
  if (st.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const f of fs.readdirSync(from)) copy(path.join(from, f), path.join(to, f));
  } else {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

let total = 0;
for (const s of SITES) {
  const dir = path.join(DST, s.to);
  fs.rmSync(dir, { recursive: true, force: true });
  let n = 0;
  for (const t of TAKE) {
    const from = path.join(SRC, s.from, t);
    if (!fs.existsSync(from)) continue;
    copy(from, path.join(dir, t));
    n++;
  }
  const size = (function walk(d) {
    let b = 0;
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      const st = fs.statSync(p);
      b += st.isDirectory() ? walk(p) : st.size;
    }
    return b;
  })(dir);
  total += size;
  console.log('  ' + s.to.padEnd(9) + ' ← ' + s.from.padEnd(14) + (size / 1048576).toFixed(1) + ' МБ');
}
console.log('всего: ' + (total / 1048576).toFixed(1) + ' МБ');
