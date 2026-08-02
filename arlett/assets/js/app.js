/* Arlett — логика сайта. Всё содержимое из assets/js/data.js. */
(function () {
  'use strict';
  var D = window.AR;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (t, c, h) {
    var n = document.createElement(t);
    if (c) n.className = c;
    if (h != null) n.innerHTML = h;
    return n;
  };
  var NB = '\u00A0';
  var SVG = 'http://www.w3.org/2000/svg';

  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + '₽'; }
  function plural(n, one, few, many) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return one;
    if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return few;
    return many;
  }
  function mins(m) {
    if (m < 60) return m + NB + 'мин';
    var h = Math.floor(m / 60), r = m % 60;
    return h + NB + 'ч' + (r ? ' ' + r + NB + 'мин' : '');
  }
  function pad(n) { return 'p' + String(n).padStart(3, '0'); }
  function photo(n, w) { return 'assets/photo/' + pad(n) + '-' + (w || 620) + '.webp'; }

  /* ─── общие ссылки ────────────────────────────────────────── */
  function wire() {
    var tel = 'tel:+' + D.phoneRaw;
    var set = function (s, href, text) {
      var n = $(s); if (!n) return;
      n.href = href; if (text) n.textContent = text;
    };
    set('#footTel', tel, D.phone);
    set('#bookTel', tel);
    set('#footWa', D.wa); set('#dockWa', D.wa);
    set('#footTg', D.tg); set('#footVk', D.vk); set('#bookVk', D.vk);
    set('#footMaps', D.maps); set('#allReviews', D.mapsReviews); set('#bookYa', D.booking);
    $('#footAddr').textContent = D.address;
    $('#footHours').textContent = D.hours;
    $('#whereSub').textContent = D.landmark + '. ' + D.hours + '. Вход с торца дома, вывеска Arlett.';
  }

  /* число зон берём из прайса, а не из схемы: на схеме часть зон объединена */
  function epilRows() {
    for (var i = 0; i < D.price.length; i++) {
      if (D.price[i].group === 'Лазерная эпиляция') return D.price[i].items.length;
    }
    return D.zones.length;
  }
  function heroStats() {
    var r = D.rating;
    var rows = [
      ['Яндекс Карты', r.score, r.marks + ' ' + plural(r.marks, 'оценка', 'оценки', 'оценок') + ', ' + r.reviews + ' ' + plural(r.reviews, 'отзыв', 'отзыва', 'отзывов')],
      ['Награда', '2026', '«' + r.award.replace(' 2026', '') + '» от Яндекс Карт'],
      ['Эпиляция', epilRows() + NB + 'зон', 'От 400 ₽ за зону'],
      ['Персонал', '100%', 'Положительных отзывов о мастере'],
    ];
    var box = $('#heroStats');
    rows.forEach(function (x) {
      var d = el('div');
      d.appendChild(el('dt', null, x[0]));
      d.appendChild(el('dd', null, x[1] + '<small>' + x[2] + '</small>'));
      box.appendChild(d);
    });
  }

  /* ═══ КАРТА ЗОН ═══════════════════════════════════════════ */
  var picked = [];      /* выбранные варианты зон */
  var side = 'front';

  function optsOf(z) { return z.vars ? z.vars : [z]; }
  function opt(id) {
    for (var i = 0; i < D.zones.length; i++) {
      var z = D.zones[i], o = optsOf(z);
      for (var j = 0; j < o.length; j++) if (o[j].id === id) return { o: o[j], z: z };
    }
    return null;
  }
  function zoneState(z) {
    var o = optsOf(z);
    for (var i = 0; i < o.length; i++) if (picked.indexOf(o[i].id) >= 0) return i;
    return -1;
  }
  /* на схеме зона переключается по кругу: не выбрано → вариант 1 → вариант 2 → снять */
  function cycle(z) {
    var o = optsOf(z), i = zoneState(z);
    if (i >= 0) picked.splice(picked.indexOf(o[i].id), 1);
    if (i + 1 < o.length) picked.push(o[i + 1].id);
    paint();
  }
  /* в списке выбирается конкретный вариант */
  function pickOpt(id) {
    var f = opt(id);
    if (!f) return;
    var i = picked.indexOf(id);
    if (i >= 0) picked.splice(i, 1);
    else {
      optsOf(f.z).forEach(function (o) {
        var k = picked.indexOf(o.id);
        if (k >= 0) picked.splice(k, 1);
      });
      picked.push(id);
    }
    paint();
  }

  /* комплекты применяем жадно: сначала самые выгодные, зоны не пересекаются */
  function totals() {
    var rest = picked.slice(), sum = 0, time = 0, used = [];
    D.bundles
      .map(function (b) {
        var parts = 0, pm = 0, ok = true;
        b.z.forEach(function (id) {
          var f = opt(id);
          if (!f || picked.indexOf(id) < 0) { ok = false; return; }
          parts += f.o.p; pm += f.o.m;
        });
        return { b: b, ok: ok, save: parts - b.p, partsM: pm };
      })
      .filter(function (x) { return x.ok && x.save > 0; })
      .sort(function (x, y) { return y.save - x.save; })
      .forEach(function (x) {
        if (!x.b.z.every(function (id) { return rest.indexOf(id) >= 0; })) return;
        x.b.z.forEach(function (id) { rest.splice(rest.indexOf(id), 1); });
        sum += x.b.p; time += x.b.m; used.push(x);
      });
    rest.forEach(function (id) {
      var f = opt(id);
      sum += f.o.p; time += f.o.m;
    });
    return { sum: sum, time: time, used: used };
  }

  function buildMap() {
    var svg = $('#zmap');
    svg.innerHTML = '';
    D.outline.filter(function (o) { return o.s === side; }).forEach(function (o) {
      var r = document.createElementNS(SVG, 'rect');
      r.setAttribute('class', 'zo');
      r.setAttribute('x', o.r[0]); r.setAttribute('y', o.r[1]);
      r.setAttribute('width', o.r[2]); r.setAttribute('height', o.r[3]);
      r.setAttribute('rx', o.r[4]);
      svg.appendChild(r);
    });
    D.zones.filter(function (z) { return z.s === side; }).forEach(function (z) {
      var g = document.createElementNS(SVG, 'g');
      g.setAttribute('class', 'zg');
      g.dataset.id = z.id;
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      z.sh.forEach(function (r0) {
        var r = document.createElementNS(SVG, 'rect');
        r.setAttribute('class', 'z');
        r.setAttribute('x', r0[0]); r.setAttribute('y', r0[1]);
        r.setAttribute('width', r0[2]); r.setAttribute('height', r0[3]);
        r.setAttribute('rx', r0[4]);
        g.appendChild(r);
      });
      svg.appendChild(g);
    });
  }

  function capFor(z) {
    var o = optsOf(z), i = zoneState(z);
    if (i >= 0) return o[i].n + ' · ' + money(o[i].p) + ' · ' + mins(o[i].m);
    if (o.length > 1) return z.n + ' · от ' + money(o[o.length - 1].p) + ' · два варианта';
    return o[0].n + ' · ' + money(o[0].p) + ' · ' + mins(o[0].m);
  }
  var HINT = 'Схема условная: прямоугольники — зоны из прайса, не анатомия.';
  function setCap(t) { $('#zmapCap').textContent = t || HINT; }

  function buildChips() {
    var box = $('#zoneList');
    box.innerHTML = '';
    D.zones.forEach(function (z) {
      optsOf(z).forEach(function (o) {
        var b = el('button', 'zchip', o.n + '<b>' + money(o.p) + '</b>');
        b.type = 'button';
        b.dataset.id = o.id;
        b.setAttribute('aria-pressed', 'false');
        box.appendChild(b);
      });
    });
  }

  function paint() {
    Array.prototype.forEach.call(document.querySelectorAll('#zmap .zg'), function (g) {
      var z = D.zones.filter(function (x) { return x.id === g.dataset.id; })[0];
      var on = z && zoneState(z) >= 0;
      g.classList.toggle('is-on', !!on);
      g.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (z) g.setAttribute('aria-label', capFor(z));
    });
    Array.prototype.forEach.call(document.querySelectorAll('.zchip'), function (b) {
      var on = picked.indexOf(b.dataset.id) >= 0;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    var t = totals();
    $('#zsumEmpty').hidden = picked.length > 0;
    var list = $('#zsumList');
    list.innerHTML = '';
    picked.forEach(function (id) {
      var f = opt(id);
      var li = el('li', null, '<span>' + f.o.n + '</span><i></i><b>' + money(f.o.p) + '</b>');
      var x = el('button', null, '×');
      x.type = 'button';
      x.setAttribute('aria-label', 'Убрать: ' + f.o.n.toLowerCase());
      x.addEventListener('click', function () { pickOpt(id); });
      li.appendChild(x);
      list.appendChild(li);
    });

    var bn = $('#zsumBundle');
    if (t.used.length) {
      bn.hidden = false;
      bn.innerHTML = t.used.map(function (u) {
        return 'У студии есть <b>«' + u.b.n + '»</b> за ' + money(u.b.p) + ' — на ' +
          money(u.save) + ' дешевле, чем по отдельности. Уже учтено.';
      }).join('<br>');
    } else bn.hidden = true;

    $('#zsumPrice').textContent = money(t.sum);
    $('#zsumTime').textContent = picked.length
      ? 'Приём примерно ' + mins(t.time) + ' · ' + picked.length + ' ' + plural(picked.length, 'зона', 'зоны', 'зон')
      : '';

    var echo = $('#calcEcho');
    if (echo) echo.textContent = picked.length ? shortPick() : '— пока ничего не выбрано';
    $('#zsumWa').href = D.wa + '?text=' + encodeURIComponent(zoneMessage());
    $('#zsumTg').dataset.text = zoneMessage();
  }

  function shortPick() {
    if (!picked.length) return '';
    return picked.map(function (id) { return opt(id).o.n.toLowerCase(); }).join(', ') +
      ' — ' + money(totals().sum);
  }
  function zoneMessage() {
    if (!picked.length) return 'Здравствуйте! Пишу с сайта, хочу записаться на консультацию.';
    var t = totals();
    var s = 'Здравствуйте! Пишу с сайта.\nХочу лазерную эпиляцию, зоны: ' +
      picked.map(function (id) { return opt(id).o.n.toLowerCase(); }).join(', ') + '.\n';
    if (t.used.length) s += 'Похоже, подходит ваш комплект «' + t.used[0].b.n + '».\n';
    s += 'По вашему прайсу выходит ' + money(t.sum).replace(/\u00A0/g, ' ') +
      ', приём примерно ' + mins(t.time).replace(/\u00A0/g, ' ') + '.\n' +
      'Правильно посчитала? Когда можно записаться?';
    return s;
  }

  function zones() {
    buildMap(); buildChips(); setCap();
    var svg = $('#zmap');
    var byId = function (e) {
      var g = e.target.closest('.zg');
      if (!g) return null;
      return D.zones.filter(function (x) { return x.id === g.dataset.id; })[0] || null;
    };
    svg.addEventListener('click', function (e) { var z = byId(e); if (z) { cycle(z); setCap(capFor(z)); } });
    svg.addEventListener('keydown', function (e) {
      var z = byId(e);
      if (z && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); cycle(z); setCap(capFor(z)); }
    });
    svg.addEventListener('mouseover', function (e) { var z = byId(e); if (z) setCap(capFor(z)); });
    svg.addEventListener('focusin', function (e) { var z = byId(e); if (z) setCap(capFor(z)); });
    svg.addEventListener('mouseleave', function () { setCap(); });
    $('#zoneList').addEventListener('click', function (e) {
      var b = e.target.closest('.zchip');
      if (b) pickOpt(b.dataset.id);
    });
    Array.prototype.forEach.call(document.querySelectorAll('.seg__b'), function (b) {
      b.addEventListener('click', function () {
        side = b.dataset.side;
        Array.prototype.forEach.call(document.querySelectorAll('.seg__b'), function (x) {
          var on = x === b;
          x.classList.toggle('is-on', on);
          x.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        buildMap(); paint(); setCap();
      });
    });
    $('#zsumTg').addEventListener('click', function (e) { e.preventDefault(); toTelegram(this.dataset.text); });
    paint();
  }

  /* Telegram-ссылка не принимает готовый текст — кладём в буфер */
  function toTelegram(text) {
    var open = function () { window.open(D.tg, '_blank', 'noopener'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast('Сообщение скопировано — вставьте его в чат');
        open();
      }, open);
    } else open();
  }
  function toast(msg) {
    var t = el('div', 'toast', msg);
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-in'); });
    setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 400); }, 3200);
  }

  /* ─── направления ─────────────────────────────────────────── */
  function areas() {
    var box = $('#areasList');
    D.areas.forEach(function (a) {
      var n = el('article', 'area rise');
      n.innerHTML =
        '<img src="' + photo(a.photo, 1280) + '" alt="' + a.t + ' в студии Arlett" loading="lazy" decoding="async">' +
        '<div class="area__b"><h3 class="area__t">' + a.t + '</h3>' +
        '<p class="area__lead">' + a.lead + '</p>' +
        '<p class="area__body">' + a.body + '</p>' +
        '<ul class="area__f">' + a.facts.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul></div>';
      box.appendChild(n);
    });
  }

  /* ─── до и после + галерея ────────────────────────────────── */
  var lbList = [], lbI = 0;
  function openLb(list, n) {
    lbList = list;
    lbI = Math.max(0, list.indexOf(n));
    $('#lb').hidden = false;
    document.body.style.overflow = 'hidden';
    showLb();
  }
  function showLb() {
    var n = lbList[lbI];
    $('#lbImg').src = photo(n, 1280);
    $('#lbImg').alt = D.before.indexOf(n) >= 0
      ? 'Результат процедуры в студии Arlett: до и после'
      : ALT[catOf(n)];
    $('#lbCap').textContent = (lbI + 1) + ' из ' + lbList.length;
  }
  function closeLb() {
    $('#lb').hidden = true;
    $('#lbImg').removeAttribute('src');
    document.body.style.overflow = '';
  }
  function step(d) { lbI = (lbI + d + lbList.length) % lbList.length; showLb(); }

  function before() {
    var box = $('#beforeGrid');
    D.before.forEach(function (n) {
      var b = el('button');
      b.type = 'button';
      b.dataset.n = n;
      b.setAttribute('aria-label', 'Открыть фото крупно');
      b.innerHTML = '<img src="' + photo(n) + '" alt="Результат процедуры в студии Arlett: до и после" loading="lazy" decoding="async">';
      box.appendChild(b);
    });
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-n]');
      if (b) openLb(D.before.slice(), +b.dataset.n);
    });
  }

  var ALT = {
    work: 'Процедура в студии Arlett',
    room: 'Кабинет студии Arlett',
    house: 'Студия Arlett на Олимпийском бульваре',
  };
  var current = 'all';
  function galList() {
    if (current === 'all') {
      var all = [];
      Object.keys(D.gallery).forEach(function (k) { all = all.concat(D.gallery[k]); });
      return all;
    }
    return D.gallery[current].slice();
  }
  function catOf(n) {
    var out = 'work';
    Object.keys(D.gallery).forEach(function (k) { if (D.gallery[k].indexOf(n) >= 0) out = k; });
    return out;
  }
  function renderGrid() {
    var g = $('#grid');
    g.innerHTML = '';
    galList().forEach(function (n) {
      var b = el('button');
      b.type = 'button';
      b.dataset.n = n;
      b.setAttribute('aria-label', 'Открыть фото крупно');
      b.innerHTML = '<img src="' + photo(n) + '" alt="' + ALT[catOf(n)] + '" loading="lazy" decoding="async">';
      g.appendChild(b);
    });
  }
  function gallery() {
    var box = $('#filters');
    var mk = function (key, label, n) {
      var b = el('button', key === 'all' ? 'is-on' : '', label + ' <span>' + n + '</span>');
      b.type = 'button';
      b.addEventListener('click', function () {
        current = key;
        Array.prototype.forEach.call(box.children, function (x) { x.classList.toggle('is-on', x === b); });
        renderGrid();
      });
      box.appendChild(b);
    };
    var total = 0;
    Object.keys(D.gallery).forEach(function (k) { total += D.gallery[k].length; });
    mk('all', 'Все', total);
    Object.keys(D.galleryLabels).forEach(function (k) { mk(k, D.galleryLabels[k], D.gallery[k].length); });
    renderGrid();
    $('#grid').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-n]');
      if (b) openLb(galList(), +b.dataset.n);
    });
    $('#lbX').addEventListener('click', closeLb);
    $('#lbP').addEventListener('click', function () { step(-1); });
    $('#lbN').addEventListener('click', function () { step(1); });
    $('#lb').addEventListener('click', function (e) { if (e.target === this) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if ($('#lb').hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
  }

  /* ─── прайс, отзывы, студия ───────────────────────────────── */
  function price() {
    var box = $('#priceList');
    D.price.forEach(function (g) {
      var s = el('section', 'pgroup rise');
      s.innerHTML = '<h3 class="pgroup__t">' + g.group + '</h3>' +
        g.items.map(function (it) {
          return '<div class="pitem"><div class="pitem__r">' +
            '<span class="pitem__n">' + it.n + '</span><i class="pitem__dots"></i>' +
            '<span class="pitem__p">' + it.p + '</span></div>' +
            (it.d ? '<p class="pitem__d">' + it.d + '</p>' : '') + '</div>';
        }).join('');
      box.appendChild(s);
    });
  }
  function reviews() {
    var a = $('#aspects');
    D.rating.aspects.forEach(function (x) {
      var d = el('div', 'aspect rise');
      d.innerHTML = '<div class="aspect__r"><span class="aspect__n">' + x.name + '</span>' +
        '<span class="aspect__v"><b>' + x.pct + '%</b> · ' + x.n + ' ' + plural(x.n, 'отзыв', 'отзыва', 'отзывов') + '</span></div>' +
        '<div class="aspect__bar"><i style="width:' + x.pct + '%"></i></div>';
      a.appendChild(d);
    });
    var box = $('#revsList');
    D.reviews.forEach(function (r) {
      var c = el('article', 'rev rise');
      c.innerHTML = '<div class="rev__h"><span class="rev__n">' + r.name + '</span>' +
        '<span class="rev__d">' + r.date + '</span></div>' +
        '<span class="rev__s" aria-label="Оценка 5 из 5">★★★★★</span>' +
        '<p class="rev__t">' + r.text + '</p>';
      box.appendChild(c);
    });
  }
  function studio() {
    var m = $('#mastersList');
    D.masters.forEach(function (x) {
      m.appendChild(el('li', null, '<b>' + x.name + '</b><span>' + x.role + '</span>' + (x.note ? '<em>' + x.note + '</em>' : '')));
    });
    var pics = $('#studioPics');
    [38, 27, 9, 29, 4, 22].forEach(function (n, i) {
      var img = el('img');
      img.src = photo(n, i === 0 ? 1280 : 620);
      img.alt = 'Кабинет студии Arlett в Воронеже';
      img.loading = 'lazy';
      img.decoding = 'async';
      pics.appendChild(img);
    });
    var caps = ['Дом с улицы', 'Фасад и вход', 'Вывеска Arlett', 'Входная группа'];
    var w = $('#way');
    D.wayfinding.forEach(function (n, i) {
      var f = el('figure');
      f.innerHTML = '<img src="' + photo(n) + '" alt="' + caps[i] + ' — Arlett, Олимпийский бульвар 6" loading="lazy" decoding="async">' +
        '<figcaption>' + caps[i] + '</figcaption>';
      w.appendChild(f);
    });
  }

  /* ─── форма ───────────────────────────────────────────────── */
  function bookMessage() {
    var name = ($('#fName').value || '').trim();
    var when = ($('#fWhen').value || '').trim();
    var t = 'Здравствуйте! Пишу с сайта.\n';
    if (name) t += 'Меня зовут ' + name + '.\n';
    t += 'Интересует: ' + $('#fWhat').value + '.\n';
    if (when) t += 'Когда удобно: ' + when + '.\n';
    if ($('#fCalc').checked && picked.length) t += 'Выбранные зоны: ' + shortPick().replace(/\u00A0/g, ' ') + '.\n';
    t += 'Подскажите, пожалуйста, свободное время.';
    return t;
  }
  function form() {
    $('#form').addEventListener('submit', function (e) {
      e.preventDefault();
      window.open(D.wa + '?text=' + encodeURIComponent(bookMessage()), '_blank', 'noopener');
    });
    $('#toTg').addEventListener('click', function (e) { e.preventDefault(); toTelegram(bookMessage()); });
  }

  function rise() {
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(document.querySelectorAll('.rise'), function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    Array.prototype.forEach.call(document.querySelectorAll('.rise'), function (n) { io.observe(n); });
    setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.rise:not(.is-in)'), function (n) {
        if (n.getBoundingClientRect().top < window.innerHeight * 1.5) n.classList.add('is-in');
      });
    }, 2500);
  }

  wire(); heroStats(); areas(); zones(); before(); gallery(); price(); reviews(); studio(); form(); rise();
})();
