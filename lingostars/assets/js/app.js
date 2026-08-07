/* English Stars Studio — интерактив страницы.
   Ванильный JS без библиотек: страница должна открываться мгновенно
   с телефона, а не тянуть фреймворк ради стены и калькулятора. */

(function () {
  "use strict";

  var PHONE = "79272085587"; // номер с карточки студии

  /* ---------- стена фраз ---------- */
  // Карточки classroom English висят у них в классе (см. фото класса).
  // Клик переворачивает карточку на русский — так родитель за пару
  // секунд понимает, что значит «занятие целиком на английском».

  document.querySelectorAll(".bubble").forEach(function (bubble) {
    bubble.addEventListener("click", function () {
      bubble.classList.toggle("flipped");
    });
  });

  /* ---------- калькулятор стоимости ---------- */

  var PRICE_PER_HOUR = 650; // опубликованная цена в карточке студии
  var WEEKS = 4;            // считаем по четырём учебным неделям

  function pick(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? Number(el.value) : 1;
  }

  function money(n) {
    // Разряды разделяем неразрывным пробелом, иначе сумма рвётся на две строки.
    return n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
  }

  function set(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function recalc() {
    var lessons = pick("week") * WEEKS * pick("kids");
    var hours = lessons * pick("len");
    set("out-lessons", lessons);
    set("out-hours", hours);
    set("out-total", money(hours * PRICE_PER_HOUR));
  }

  document.querySelectorAll('.calc input[type="radio"]').forEach(function (input) {
    input.addEventListener("change", recalc);
  });
  recalc();

  /* ---------- форма записи ---------- */
  // Слать форму некуда: бэкенда у студии нет. Собираем текст и открываем
  // WhatsApp на их номере — туда администратор и так отвечает родителям.

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
        "Здравствуйте! Хочу записать ребёнка на пробное занятие.",
        "",
        "Имя: " + name,
        "Возраст ребёнка: " + form.age.value
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
