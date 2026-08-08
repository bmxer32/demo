/* Сочи Ярдъ Клубъ — интерактив страницы.
   Ванильный JS без библиотек. */

(function () {
  "use strict";

  var PHONE = "79891983355"; // номер с карточки клуба

  /* ---------- клубный стол ----------
     Форматы и цены — с карточки, раздел «Товары и услуги», обновлён
     1 июня. Мест за столом столько, сколько человек в этом формате:
     это и есть их главное отличие, и показать его нагляднее, чем
     назвать. Формулировки прайса сохранены, включая то, что
     индивидуальные занятия взрослым идут только на английском. */

  var FORMATS = [
    {
      seats: 6,
      title: "Разговорный клуб",
      note: "Английский или французский",
      price: 500,
      cap: "Компания",
      text: "Приходят говорить, а не учиться. Без домашних заданий и оценок."
    },
    {
      seats: 4,
      title: "Дети, мини-группа",
      note: "Английский или французский · 2–4 человека",
      price: 600,
      cap: "2–4",
      text: "Столько, чтобы каждый успел сказать своё на каждом занятии."
    },
    {
      seats: 4,
      title: "Взрослые, мини-группа",
      note: "Английский или французский · 2–4 человека",
      price: 800,
      cap: "2–4",
      text: "Тот же размер группы, программа под взрослых."
    },
    {
      seats: 1,
      title: "Дети, индивидуально",
      note: "Английский или французский",
      price: 1200,
      cap: "Один",
      text: "Весь час — на одного ученика."
    },
    {
      seats: 1,
      title: "Взрослые, индивидуально",
      note: "Только английский",
      price: 1500,
      cap: "Один",
      text: "Темп и программа подстраиваются полностью под вас."
    }
  ];

  function money(n) {
    return n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
  }

  /* Стол сверху: круглая столешница и шесть стульев по кругу.
     Занятые места закрашиваются — видно формат, а не только цену. */
  function drawDesk(container) {
    var chairs = "";
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      var x = 100 + Math.cos(a) * 74;
      var y = 100 + Math.sin(a) * 74;
      chairs += '<circle class="chair" data-i="' + i + '" cx="' + x.toFixed(1) +
                '" cy="' + y.toFixed(1) + '" r="11"></circle>';
    }
    container.innerHTML =
      '<svg viewBox="0 0 200 200" role="img" aria-label="Схема стола: сколько человек занимается вместе">' +
        chairs +
        '<circle class="desk-top" cx="100" cy="100" r="46"></circle>' +
        '<text class="desk-num" x="100" y="114" id="desk-num">4</text>' +
      "</svg>";
  }

  var desk = document.getElementById("desk");
  var seatsBox = document.getElementById("seats");

  if (desk && seatsBox) {
    drawDesk(desk);

    FORMATS.forEach(function (f, i) {
      var b = document.createElement("button");
      b.className = "seat";
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-selected", i === 1 ? "true" : "false");
      b.innerHTML =
        '<span class="seat-n">' + f.cap + "</span>" +
        '<span class="seat-t">' + f.title + "<br><span class=\"seat-n\">" + f.note + "</span></span>" +
        '<span class="seat-p">' + money(f.price) + "</span>";
      b.addEventListener("click", function () { pick(i); });
      b.addEventListener("keydown", function (e) {
        var step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var next = (i + step + FORMATS.length) % FORMATS.length;
        seatsBox.children[next].focus();
        pick(next);
      });
      seatsBox.appendChild(b);
    });

    pick(1); // по умолчанию мини-группа — главный формат клуба
  }

  function pick(idx) {
    var f = FORMATS[idx];
    for (var i = 0; i < seatsBox.children.length; i++) {
      seatsBox.children[i].setAttribute("aria-selected", i === idx ? "true" : "false");
    }
    desk.querySelectorAll(".chair").forEach(function (c, i) {
      c.classList.toggle("on", i < f.seats);
    });
    var num = document.getElementById("desk-num");
    var lbl = document.getElementById("desk-lbl");
    if (num) {
      num.textContent = f.seats === 6 ? "клуб" : f.seats;
      num.setAttribute("font-size", f.seats === 6 ? "24" : "42");
    }
    if (lbl) lbl.textContent = f.text;
  }

  /* ---------- отзывы ----------
     Дословно с Яндекс.Карт. Клуб молодой, отзывов девять — берём те,
     где сказано что-то конкретное, а не «всё понравилось». */

  var REVIEWS = [
    {
      text: "Лучшее вложение в образование! Интересный и грамотный подход со стороны педагога, " +
            "ребёнок учится с удовольствием, небольшие группы онлайн. Ждёт каждого занятия, " +
            "домашку делает теперь сама. Хорошо подтянулась в школе.",
      who: "Евгения · июнь"
    },
    {
      text: "Занималась французским, и это был очень классный опыт. Всё проходило легко " +
            "и комфортно, без напряжения, при этом реально чувствуется результат.",
      who: "Ольга Макарова · июнь"
    },
    {
      text: "Очень понравился курс английского, будем продолжать обучение у Натальи. " +
            "Есть парковка, место где подождать ребёнка, чай, кофе, тёплая дружелюбная атмосфера.",
      who: "Евгений Панасюк · август 2025"
    },
    {
      text: "Мне очень нравится заниматься в этом клубе: весело, познавательно, " +
            "язык не внапряг, а в радость.",
      who: "Дмитрий Кремнев · июль"
    }
  ];

  var quotes = document.getElementById("quotes");
  if (quotes) {
    REVIEWS.forEach(function (r) {
      var d = document.createElement("article");
      d.className = "quote";
      d.innerHTML = "<p>«" + r.text + "»</p><p class=\"who\">" + r.who + "</p>";
      quotes.appendChild(d);
    });
  }

  /* ---------- форма записи ---------- */
  // Бэкенда у клуба нет: собираем текст и открываем WhatsApp.

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
        "Язык: " + form.lang.value,
        "Формат: " + form.fmt.value
      ];

      if (form.note.value.trim()) lines.push("Подробности: " + form.note.value.trim());

      window.open(
        "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(lines.join("\n")),
        "_blank",
        "noopener"
      );

      if (note) note.textContent = "Открыли WhatsApp — осталось нажать «отправить».";
    });
  }
})();
