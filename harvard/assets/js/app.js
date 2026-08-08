/* Harvard, Сочи — интерактив страницы.
   Ванильный JS без библиотек. */

(function () {
  "use strict";

  var PHONE = "79184081038"; // номер с карточки школы

  /* ---------- лестница программ ----------
     Данные — с карточки школы, раздел «Товары и услуги», обновлён 2 июля.
     Тексты сокращены, но не переписаны: формулировки школы сохранены.
     Абонемент указан только там, где школа его назвала: у детского
     индивидуального его в прайсе нет, и придумывать цену нельзя. */

  var PROGRAMS = [
    {
      short: "Дошколята",
      title: "Группа для дошколят",
      hour: 663,
      pass: 5300,
      text: "Занятия по коммуникативной методике: говорение, чтение, аудирование, письмо. " +
            "Системный курс по чтению — фониксам. Зарубежные программы Oxford и Cambridge."
    },
    {
      short: "Младшая школа",
      title: "Группа для младшей школы",
      hour: 663,
      pass: 5300,
      text: "Программа «на шаг впереди школьной». Восполняем пробелы, учим читать быстро " +
            "и правильно, говорить на базовые темы, слышать и понимать иностранную речь."
    },
    {
      short: "Средняя школа",
      title: "Группа для средней школы",
      hour: 663,
      pass: 5300,
      text: "Та же программа «на шаг впереди школьной», но под возраст: больше говорения " +
            "и работы с текстом, меньше игры."
    },
    {
      short: "10–11 класс",
      title: "Группа для 10–11 классов",
      hour: 663,
      pass: 5300,
      text: "Помогаем старшеклассникам с разными уровнями дойти до цели: поступление в вуз, " +
            "сдача экзаменов, разговорный и деловой английский."
    },
    {
      short: "Ребёнок, один",
      title: "Индивидуально, ребёнок",
      hour: 1350,
      pass: null,
      text: "Закрываем пробелы по всем аспектам языка: говорение, чтение, аудирование, письмо. " +
            "Подтягиваем по школьной программе и усиливаем то, что уже есть."
    },
    {
      short: "Взрослый, один",
      title: "Индивидуально, взрослый",
      hour: 1650,
      pass: 13200,
      text: "Программа под запрос: английский с нуля, разговорный, бизнес, туризм, узкие сферы, " +
            "интенсив перед собеседованием, эмиграция."
    },
    {
      short: "ОГЭ и ЕГЭ",
      title: "Подготовка к ОГЭ и ЕГЭ",
      hour: 2000,
      pass: 16000,
      text: "Готовим к экзаменам результативно и без стресса. При регулярной посещаемости " +
            "и выполнении домашних заданий гарантируем 80+ баллов."
    }
  ];

  function money(n) {
    return n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
  }

  // Доля цены от 0 до 1. Саму длину столбика рисует CSS: на широком
  // экране это высота, на телефоне — ширина. Иначе на узком экране
  // вертикальные столбики рассыпаются и рост цены перестаёт читаться.
  function ratio(hour) {
    var lo = PROGRAMS[0].hour, hi = PROGRAMS[PROGRAMS.length - 1].hour;
    return ((hour - lo) / (hi - lo)).toFixed(3);
  }

  var stairs = document.getElementById("stairs");
  var panels = document.getElementById("stair-panels");

  if (stairs && panels) {
    PROGRAMS.forEach(function (p, i) {
      var b = document.createElement("button");
      b.className = "stair";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.setAttribute("aria-controls", "prog-" + i);
      b.style.setProperty("--p", ratio(p.hour));
      b.innerHTML =
        '<span class="stair-bar"></span>' +
        '<span class="stair-p">' + money(p.hour) + "</span>" +
        '<span class="stair-l">' + p.short + "</span>";
      b.addEventListener("click", function () { select(i); });
      b.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var next = (i + step + PROGRAMS.length) % PROGRAMS.length;
        stairs.children[next].focus();
        select(next);
      });
      stairs.appendChild(b);

      var panel = document.createElement("div");
      panel.className = "stair-panel" + (i === 0 ? " on" : "");
      panel.id = "prog-" + i;
      panel.setAttribute("role", "tabpanel");
      panel.innerHTML =
        "<div><h3>" + p.title + "</h3><p>" + p.text + "</p></div>" +
        '<div class="stair-nums">' +
          '<div class="stair-num"><span>Час занятия</span><b>' + money(p.hour) + "</b></div>" +
          '<div class="stair-num"><span>Абонемент, 8 занятий</span><b>' +
            (p.pass ? money(p.pass) : "уточнить") + "</b></div>" +
          '<div class="stair-num"><span>Ритм</span><b>2 раза в неделю</b></div>' +
        "</div>";
      panels.appendChild(panel);
    });
  }

  function select(idx) {
    for (var i = 0; i < stairs.children.length; i++) {
      stairs.children[i].setAttribute("aria-selected", i === idx ? "true" : "false");
      panels.children[i].classList.toggle("on", i === idx);
    }
  }

  /* ---------- форма записи ---------- */
  // Бэкенда у школы нет: собираем текст и открываем WhatsApp на их номере.

  var form = document.getElementById("book-form");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var note = document.getElementById("form-note");

      if (!name) {
        form.name.focus();
        if (note) note.textContent = "Напишите имя — чтобы знать, как к вам обращаться.";
        return;
      }

      var lines = [
        "Здравствуйте! Хочу записаться на пробное занятие.",
        "",
        "Имя: " + name,
        "Интересует: " + form.prog.value
      ];

      if (form.when.value.trim()) lines.push("Удобное время: " + form.when.value.trim());
      if (form.note.value.trim()) lines.push("Вопрос: " + form.note.value.trim());

      window.open(
        "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(lines.join("\n")),
        "_blank",
        "noopener"
      );

      if (note) note.textContent = "Открыли WhatsApp — осталось нажать «отправить».";
    });
  }
})();
