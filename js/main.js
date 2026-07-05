/* ============================================================
   ЛОГИКА САЙТА — этот файл редактировать НЕ нужно.
   Весь контент меняется в файле js/data.js.
   ============================================================ */

(function () {
  "use strict";

  var C = SITE.contacts;

  /* ---------- Вспомогательные ---------- */

  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slot(name) {
    return document.querySelector('[data-render="' + name + '"]');
  }

  function isPlaceholder(url) {
    return !url || url === "#" || url.indexOf("ВАШ") !== -1 || url.indexOf("example") !== -1;
  }

  /* ---------- Простые текстовые подстановки (data-bind) ---------- */

  document.querySelectorAll("[data-bind]").forEach(function (node) {
    var path = node.getAttribute("data-bind").split(".");
    var value = SITE;
    path.forEach(function (key) { value = value && value[key]; });
    if (typeof value === "string" && value) node.textContent = value;
  });

  /* Курсивный бордовый акцент на последнем слове манифеста */
  var manifesto = document.querySelector(".hero-manifesto");
  if (manifesto) {
    var words = manifesto.textContent.trim().split(" ");
    if (words.length > 1) {
      var last = words.pop();
      manifesto.innerHTML = esc(words.join(" ")) + " <em>" + esc(last) + "</em>";
    }
  }

  /* Выделение ключевых слов в описании первого экрана */
  var heroAccents = ["С 2011 года", "с 2011 года", "граждан и бизнеса", "индивидуальную стратегию"];
  document.querySelectorAll(".hero-sub").forEach(function (p) {
    var html = esc(p.textContent);
    heroAccents.forEach(function (phrase) {
      html = html.split(esc(phrase)).join('<strong class="hero-accent">' + esc(phrase) + "</strong>");
    });
    p.innerHTML = html;
  });

  /* ---------- Ссылки на телеграм и соцсети (data-link) ---------- */

  document.querySelectorAll("[data-link]").forEach(function (a) {
    var key = a.getAttribute("data-link");
    var url = C[key];
    a.href = isPlaceholder(url) ? "#consult" : url;
  });

  /* ---------- Практики: вкладки на десктопе, аккордеоны на мобильных ----------
     Первый уровень — название, короткое интро и ключевые направления.
     Полные списки открываются кнопкой «Раскрыть все направления». */

  var practicesSlot = slot("practices");

  function stripEnd(s) {
    return String(s).replace(/[;.]\s*$/, "");
  }

  if (practicesSlot) {
    var shell = el("div", "practices-shell reveal");
    var practiceTabs = el("div", "practice-tabs");
    var practicePanels = el("div", "practice-panels");
    var tabButtons = [];
    var panelBlocks = [];

    function activatePractice(index) {
      tabButtons.forEach(function (b, k) {
        b.classList.toggle("active", k === index);
        b.setAttribute("aria-pressed", String(k === index));
      });
      panelBlocks.forEach(function (p, k) {
        p.classList.toggle("active", k === index);
      });
    }

    SITE.practices.forEach(function (group, i) {
      var no = String(i + 1).padStart(2, "0");

      /* Вкладка в левой колонке (desktop) */
      var tab = el("button", "practice-tab");
      tab.type = "button";
      tab.innerHTML =
        '<span class="practice-no">' + no + "</span>" +
        '<span class="practice-tab-name">' + esc(group.title) + "</span>" +
        '<span class="practice-tab-arrow" aria-hidden="true">&rarr;</span>';
      tab.addEventListener("click", function () { activatePractice(i); });
      practiceTabs.appendChild(tab);
      tabButtons.push(tab);

      var panel = el("article", "practice-panel");

      /* Заголовок-аккордеон (mobile) */
      var head = el("button", "practice-panel-toggle");
      head.type = "button";
      head.setAttribute("aria-expanded", "false");
      head.innerHTML =
        '<span class="practice-no">' + no + "</span>" +
        '<span class="practice-panel-name">' + esc(group.title) + "</span>" +
        '<span class="practice-mark" aria-hidden="true">+</span>';
      head.addEventListener("click", function () {
        var open = !panel.classList.contains("open");
        panel.classList.toggle("open", open);
        head.setAttribute("aria-expanded", String(open));
      });
      panel.appendChild(head);

      var body = el("div", "practice-panel-body");
      body.appendChild(el("h3", "practice-title", esc(group.title)));
      if (group.intro) {
        body.appendChild(el("p", "practice-intro", esc(group.intro)));
      }

      /* Первый уровень: ключевые направления */
      var single = group.items.length === 1;
      var keys = el("ul", "practice-keys");
      var keyTitles = single
        ? group.items[0].points.slice(0, 4).map(stripEnd)
        : group.items.map(function (item) { return item.title; });
      keyTitles.forEach(function (t) {
        keys.appendChild(el("li", null, esc(t)));
      });
      body.appendChild(keys);

      /* Второй уровень: подробные списки */
      var detail = el("div", "practice-detail");
      detail.hidden = true;
      if (single) {
        var rest = el("ul", "practice-points");
        group.items[0].points.slice(4).forEach(function (point) {
          rest.appendChild(el("li", null, esc(point)));
        });
        detail.appendChild(rest);
      } else {
        group.items.forEach(function (item) {
          var d = el("details", "practice-sub");
          d.innerHTML =
            '<summary><span class="practice-sub-title">' + esc(item.title) +
            '</span><span class="practice-mark" aria-hidden="true">+</span></summary>';
          if (item.points && item.points.length) {
            var list = el("ul", "practice-points");
            item.points.forEach(function (point) {
              list.appendChild(el("li", null, esc(point)));
            });
            d.appendChild(list);
          } else if (item.text) {
            d.appendChild(el("p", null, esc(item.text)));
          }
          detail.appendChild(d);
        });
      }
      if (group.outro) {
        detail.appendChild(el("p", "practice-outro", esc(group.outro)));
      }

      var expand = el("button", "practice-expand");
      expand.type = "button";
      expand.setAttribute("aria-expanded", "false");
      expand.innerHTML =
        '<span class="practice-expand-label">Раскрыть все направления</span>' +
        '<span class="practice-mark" aria-hidden="true">+</span>';
      expand.addEventListener("click", function () {
        var open = detail.hidden;
        detail.hidden = !open;
        expand.setAttribute("aria-expanded", String(open));
        expand.classList.toggle("open", open);
        expand.querySelector(".practice-expand-label").textContent =
          open ? "Свернуть направления" : "Раскрыть все направления";
      });

      body.appendChild(expand);
      body.appendChild(detail);
      panel.appendChild(body);
      practicePanels.appendChild(panel);
      panelBlocks.push(panel);
    });

    activatePractice(0);
    shell.appendChild(practiceTabs);
    shell.appendChild(practicePanels);
    practicesSlot.appendChild(shell);
  }

  /* ---------- Конверсионный блок: раскрытие списка случаев ---------- */

  var demandList = document.querySelector(".demand-list");
  var demandMore = document.querySelector(".demand-more");
  if (demandList && demandMore) {
    demandMore.addEventListener("click", function () {
      var open = !demandList.classList.contains("expanded");
      demandList.classList.toggle("expanded", open);
      demandMore.setAttribute("aria-expanded", String(open));
      demandMore.textContent = open ? "Свернуть список" : "Показать все случаи";
    });
  }

  /* ---------- Кнопка «Связаться»: меню мессенджеров ---------- */

  var contactMenu = document.getElementById("contact-menu");
  var contactToggle = document.querySelector(".contact-toggle");
  if (contactMenu && contactToggle) {
    var messengers = C.messengers || {};
    [
      ["Telegram", messengers.telegram],
      ["MAX", messengers.max],
      ["WhatsApp", messengers.whatsapp]
    ].forEach(function (pair) {
      var a = el("a", null, esc(pair[0]));
      if (isPlaceholder(pair[1])) {
        a.href = "#";
      } else {
        a.href = pair[1];
        a.target = "_blank";
        a.rel = "noopener";
      }
      contactMenu.appendChild(a);
    });

    function closeContactMenu() {
      contactMenu.hidden = true;
      contactToggle.setAttribute("aria-expanded", "false");
    }

    contactToggle.addEventListener("click", function () {
      var open = contactMenu.hidden;
      contactMenu.hidden = !open;
      contactToggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (e) {
      if (!contactMenu.hidden && !contactMenu.contains(e.target) && e.target !== contactToggle) {
        closeContactMenu();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeContactMenu();
    });
  }

  /* ---------- Обо мне ---------- */

  var aboutSlot = slot("about-paragraphs");
  if (aboutSlot) {
    SITE.about.paragraphs.forEach(function (text) {
      aboutSlot.appendChild(el("p", null, esc(text)));
    });
  }

  var thesesSlot = slot("about-theses");
  if (thesesSlot && SITE.about.theses) {
    SITE.about.theses.forEach(function (t) {
      var card = el("div", "about-thesis");
      card.appendChild(el("h3", null, esc(t.title)));
      card.appendChild(el("p", null, esc(t.text)));
      thesesSlot.appendChild(card);
    });
  }

  /* Цифры: короткая подпись видна всегда, полная — по клику или наведению */
  var factsSlot = slot("facts");
  if (factsSlot) {
    SITE.about.facts.forEach(function (f, i) {
      var item = el("div", "fact reveal");
      item.style.setProperty("--reveal-delay", i * 0.1 + "s");
      item.appendChild(el("dt", null, esc(f.value)));
      item.appendChild(el("dd", "fact-short", esc(f.short || f.label)));
      if (f.short && f.label && f.short !== f.label) {
        item.appendChild(el("dd", "fact-full", esc(f.label)));
        item.classList.add("fact-more");
        item.tabIndex = 0;
        item.addEventListener("click", function () {
          item.classList.toggle("open");
        });
        item.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            item.classList.toggle("open");
          }
        });
      }
      factsSlot.appendChild(item);
    });
  }

  /* ---------- Видео: первые 6, остальные — по кнопке ---------- */

  var VISIBLE_VIDEOS = 6;
  var videosSlot = slot("videos");
  if (videosSlot) {
    SITE.videos.forEach(function (v, i) {
      var card = el("a", "media-card reveal");
      card.style.setProperty("--reveal-delay", (i % 4) * 0.1 + "s");
      if (i >= VISIBLE_VIDEOS) card.classList.add("row-hidden");
      if (isPlaceholder(v.link)) {
        card.href = "#media";
        card.setAttribute("aria-disabled", "true");
      } else {
        card.href = v.link;
        card.target = "_blank";
        card.rel = "noopener";
      }
      card.innerHTML =
        '<div class="media-cover"><img src="' + esc(v.cover) + '" alt="' + esc(v.title) + ' — стоп-кадр эфира Первого канала" loading="lazy"></div>' +
        "<h3>" + esc(v.title) + "</h3>" +
        '<span class="media-watch">Смотреть сюжет</span>';
      videosSlot.appendChild(card);
    });

    if (SITE.videos.length > VISIBLE_VIDEOS) {
      var videosWrap = el("div", "show-more-wrap");
      var videosMore = el("button", "show-more", "<span>Показать все эфиры</span>");
      videosMore.type = "button";
      videosMore.addEventListener("click", function () {
        videosSlot.querySelectorAll(".row-hidden").forEach(function (n) {
          n.classList.remove("row-hidden");
        });
        videosWrap.remove();
      });
      videosWrap.appendChild(videosMore);
      videosSlot.parentNode.insertBefore(videosWrap, videosSlot.nextSibling);
    }
  }

  /* ---------- Кейсы: первые 3, остальные — по кнопке ---------- */

  var VISIBLE_CASES = 3;
  var casesSlot = slot("cases");
  if (casesSlot) {
    SITE.cases.forEach(function (c, i) {
      var row = el("article", "case reveal");
      if (i >= VISIBLE_CASES) row.classList.add("row-hidden");
      var meta = (c.sum && c.sum.indexOf("ПРИМЕР") === -1)
        ? '<span class="case-result-label">' + esc(c.sum) + "</span>" : "";
      row.innerHTML =
        '<span class="case-no">' + String(i + 1).padStart(2, "0") + "</span>" +
        "<div>" +
          '<p class="case-area">' + esc(c.area) + "</p>" +
          "<h3>" + esc(c.title) + "</h3>" +
          '<p class="case-task">' + esc(c.task) + "</p>" +
        "</div>" +
        '<div class="case-result">' +
          '<span class="case-result-label">Результат</span>' +
          "<p>" + esc(c.result) + "</p>" + meta +
        "</div>";
      casesSlot.appendChild(row);
    });

    if (SITE.cases.length > VISIBLE_CASES) {
      var casesWrap = el("div", "show-more-wrap");
      var casesMore = el("button", "show-more", "<span>Показать ещё дела</span>");
      casesMore.type = "button";
      casesMore.addEventListener("click", function () {
        casesSlot.querySelectorAll(".row-hidden").forEach(function (n) {
          n.classList.remove("row-hidden");
        });
        casesWrap.remove();
      });
      casesWrap.appendChild(casesMore);
      casesSlot.appendChild(casesWrap);
    }
  }

  /* ---------- Вопросы и ответы ---------- */

  var faqSlot = slot("faq");
  if (faqSlot) {
    SITE.faq.forEach(function (item) {
      var d = el("details", "faq-item reveal");
      d.innerHTML =
        "<summary>" + esc(item.q) + '<span class="faq-mark">+</span></summary>' +
        "<p>" + esc(item.a) + "</p>";
      faqSlot.appendChild(d);
    });
  }

  /* ---------- Отзывы ---------- */

  var reviewsSlot = slot("testimonials");
  if (reviewsSlot) {
    SITE.testimonials.forEach(function (t, i) {
      var card = el("blockquote", "review reveal");
      card.style.setProperty("--reveal-delay", i * 0.14 + "s");
      var detail = String(t.detail || "").replace(/\s*·?\s*ПРИМЕР.*$/i, "");
      card.innerHTML =
        '<span class="review-mark">«</span>' +
        '<p class="review-text">' + esc(t.text) + "</p>" +
        '<footer><div class="review-author">' + esc(t.author) + "</div>" +
        (detail ? '<div class="review-detail">' + esc(detail) + "</div>" : "") +
        "</footer>";
      reviewsSlot.appendChild(card);
    });
  }

  /* ---------- Документы: доступ после подписки ---------- */

  var UNLOCK_KEY = "ab_docs_unlocked";
  var gateSlot = slot("documents-gate");
  var docsSlot = slot("documents");

  /* Модальное окно «подпишитесь на канал» при первом нажатии «Скачать» */
  var subscribeModal = null;
  var pendingDownload = null;

  function startDownload(file) {
    var a = document.createElement("a");
    a.href = file;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function closeSubscribeModal() {
    if (!subscribeModal) return;
    subscribeModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  function ensureSubscribeModal() {
    if (subscribeModal) return subscribeModal;

    subscribeModal = el("div", "modal-overlay");
    subscribeModal.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
        '<button class="modal-close" type="button" aria-label="Закрыть">&times;</button>' +
        '<div class="modal-head">' +
          '<span class="modal-head-clip" aria-hidden="true"><span class="modal-watermark">' + SOCIAL_ICONS.send + "</span></span>" +
          '<p class="modal-eyebrow">Телеграм-канал</p>' +
          '<span class="modal-icon">' + SOCIAL_ICONS.telegram + "</span>" +
        "</div>" +
        '<div class="modal-body">' +
          '<h3 id="modal-title">Документы — <em>подписчикам</em> канала</h3>' +
          '<p class="modal-text">Шаблоны и чек-листы открыты для подписчиков телеграм-канала: там выходят разборы дел и изменения в законах.</p>' +
          '<div class="modal-actions">' +
            '<a class="btn btn-wine modal-subscribe" href="#" target="_blank" rel="noopener">Подписаться на канал</a>' +
            '<button class="btn btn-line modal-confirm" type="button">Я подписался(ась) — открыть доступ</button>' +
          "</div>" +
          '<p class="modal-note">Доступ откроется сразу после подтверждения</p>' +
        "</div>" +
      "</div>";

    var subscribe = subscribeModal.querySelector(".modal-subscribe");
    if (isPlaceholder(C.telegramChannel)) {
      subscribe.href = "#consult";
      subscribe.removeAttribute("target");
    } else {
      subscribe.href = C.telegramChannel;
    }

    subscribeModal.querySelector(".modal-close").addEventListener("click", closeSubscribeModal);
    subscribeModal.addEventListener("click", function (e) {
      if (e.target === subscribeModal) closeSubscribeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSubscribeModal();
    });

    subscribeModal.querySelector(".modal-confirm").addEventListener("click", function () {
      localStorage.setItem(UNLOCK_KEY, "1");
      renderDocuments();
      document.querySelectorAll("#documents .reveal").forEach(function (n) {
        n.classList.add("visible");
      });
      closeSubscribeModal();
      if (pendingDownload) {
        startDownload(pendingDownload);
        pendingDownload = null;
      }
    });

    document.body.appendChild(subscribeModal);
    return subscribeModal;
  }

  function openSubscribeModal(file) {
    pendingDownload = file || null;
    ensureSubscribeModal();
    requestAnimationFrame(function () {
      subscribeModal.classList.add("open");
    });
    document.body.style.overflow = "hidden";
  }

  function renderDocuments() {
    if (!docsSlot) return;
    var unlocked = localStorage.getItem(UNLOCK_KEY) === "1";

    docsSlot.innerHTML = "";
    docsSlot.classList.toggle("locked", !unlocked);

    SITE.documents.forEach(function (d) {
      var li = el("li", "document-row reveal");
      li.innerHTML =
        '<span class="document-title">' + esc(d.title) + "</span>" +
        '<span class="document-type">' + esc(d.type) + "</span>" +
        '<a class="document-action" href="' + esc(d.file) + '" download>Скачать</a>';
      if (!unlocked) {
        li.querySelector(".document-action").addEventListener("click", function (e) {
          e.preventDefault();
          openSubscribeModal(d.file);
        });
      }
      docsSlot.appendChild(li);
    });

    if (!gateSlot) return;
    gateSlot.innerHTML = "";
    gateSlot.classList.toggle("unlocked", unlocked);

    if (unlocked) {
      gateSlot.innerHTML =
        '<div class="documents-gate-text"><strong>Доступ открыт</strong>' +
        "<p>Спасибо за подписку. Скачивайте документы — и оставайтесь в канале: там выходят разборы дел и изменения в законах.</p></div>";
      return;
    }

    var text = el("div", "documents-gate-text");
    text.innerHTML =
      "<strong>Документы — подписчикам канала</strong>" +
      "<p>Подпишитесь на телеграм-канал, вернитесь на эту страницу и нажмите «Я подписался» — доступ к скачиванию откроется.</p>";

    var actions = el("div", "documents-gate-actions");
    var subscribe = el("a", "btn btn-wine", "Подписаться на канал");
    subscribe.href = isPlaceholder(C.telegramChannel) ? "#consult" : C.telegramChannel;
    if (!isPlaceholder(C.telegramChannel)) {
      subscribe.target = "_blank";
      subscribe.rel = "noopener";
    }

    var confirm = el("button", "btn btn-line", "Я подписался(ась)");
    confirm.type = "button";
    confirm.addEventListener("click", function () {
      localStorage.setItem(UNLOCK_KEY, "1");
      renderDocuments();
      document.querySelectorAll("#documents .reveal").forEach(function (n) {
        n.classList.add("visible");
      });
    });

    actions.appendChild(subscribe);
    actions.appendChild(confirm);
    gateSlot.appendChild(text);
    gateSlot.appendChild(actions);
  }

  renderDocuments();

  /* ---------- Контакты (форма, подвал, мобильное меню) ---------- */

  function contactLink(url, label) {
    if (isPlaceholder(url)) return "";
    return '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(label) + "</a>";
  }

  var consultContacts = slot("consult-contacts");
  if (consultContacts) {
    var phoneHtml = "";
    if (C.phone && C.phone.indexOf("000") === -1) {
      phoneHtml = '<a href="tel:' + esc(C.phone.replace(/[^+\d]/g, "")) + '">' + esc(C.phone) + "</a>";
    }
    consultContacts.innerHTML =
      contactLink(C.telegramPersonal, "Написать в телеграм") +
      contactLink(C.telegramChannel, "Телеграм-канал") +
      phoneHtml +
      '<span class="muted">' + esc(C.city) + "</span>";
  }

  /* Иконки для контактов в подвале (стиль мессенджеров) */
  var SOCIAL_ICONS = {
    send: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.57 8.16c-.18 1.9-.96 6.5-1.36 8.63-.17.9-.5 1.2-.82 1.23-.7.06-1.23-.46-1.9-.9-1.06-.7-1.66-1.13-2.68-1.8-1.19-.79-.42-1.22.26-1.93.18-.18 3.25-2.98 3.31-3.23.01-.03.01-.15-.06-.21s-.17-.04-.25-.02c-.11.02-1.79 1.14-5.06 3.35-.48.33-.91.49-1.3.48-.43-.01-1.25-.24-1.87-.44-.75-.24-1.35-.37-1.3-.79.03-.22.33-.44.89-.66 3.5-1.53 5.83-2.53 7-3.02 3.33-1.39 4.03-1.63 4.48-1.64.1 0 .32.02.46.14.12.1.16.23.17.33.02.07.03.27.03.48z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.78 1.46 5.26 3.74 6.87L5 22l4.13-2.06c.91.22 1.87.34 2.87.34 5.52 0 10-3.94 10-8.8S17.52 2 12 2zM7.5 12.1a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm4.5 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6zm4.5 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12z"/></svg>'
  };

  function socialPill(url, label, icon) {
    if (isPlaceholder(url)) return "";
    return '<a class="social-pill" href="' + esc(url) + '" target="_blank" rel="noopener">' +
      SOCIAL_ICONS[icon] + "<span>" + esc(label) + "</span></a>";
  }

  var footerSocial = slot("footer-social");
  if (footerSocial) {
    footerSocial.innerHTML =
      socialPill(C.telegramPersonal, "Написать в телеграм", "send") +
      socialPill(C.telegramChannel, "Телеграм-канал", "telegram") +
      socialPill(C.telegramChat, "Телеграм-чат", "chat") +
      socialPill(C.instagram, "Инстаграм", "instagram") +
      socialPill(C.youtube, "Ютуб", "youtube");
    if (!footerSocial.innerHTML) {
      footerSocial.innerHTML = '<span class="muted">Ссылки на соцсети появятся после заполнения js/data.js</span>';
    }
  }

  var mobileContacts = slot("mobile-contacts");
  if (mobileContacts) {
    mobileContacts.innerHTML =
      contactLink(C.telegramChannel, "Телеграм-канал") +
      contactLink(C.telegramPersonal, "Написать мне");
  }

  /* ---------- Темы формы ---------- */

  var topicsSlot = slot("topics");
  if (topicsSlot) {
    SITE.consultTopics.forEach(function (t) {
      var opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      topicsSlot.appendChild(opt);
    });
    buildCustomSelect(topicsSlot);
  }

  /* Красивый выпадающий список вместо системного select */
  function buildCustomSelect(select) {
    var shell = el("div", "select-shell");
    select.parentNode.insertBefore(shell, select);
    shell.appendChild(select);

    var trigger = el("button", "select-trigger");
    trigger.type = "button";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.innerHTML =
      "<span>" + esc(select.options[0] ? select.options[0].textContent : "") + "</span>" +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
    shell.appendChild(trigger);

    var menu = el("ul", "select-menu");
    menu.setAttribute("role", "listbox");
    var items = [];
    Array.prototype.forEach.call(select.options, function (opt, i) {
      var li = el("li", i === select.selectedIndex ? "selected" : "");
      li.setAttribute("role", "option");
      li.textContent = opt.textContent;
      li.addEventListener("click", function () { choose(i); });
      menu.appendChild(li);
      items.push(li);
    });
    shell.appendChild(menu);

    var activeIndex = select.selectedIndex;

    function setOpen(state) {
      shell.classList.toggle("open", state);
      trigger.setAttribute("aria-expanded", String(state));
      if (state) setActive(select.selectedIndex);
    }

    function isOpen() { return shell.classList.contains("open"); }

    function setActive(i) {
      if (i < 0) i = items.length - 1;
      if (i >= items.length) i = 0;
      activeIndex = i;
      items.forEach(function (n, k) { n.classList.toggle("active", k === i); });
      var li = items[i];
      if (li.offsetTop < menu.scrollTop) {
        menu.scrollTop = li.offsetTop;
      } else if (li.offsetTop + li.offsetHeight > menu.scrollTop + menu.clientHeight) {
        menu.scrollTop = li.offsetTop + li.offsetHeight - menu.clientHeight;
      }
    }

    function choose(i) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      trigger.querySelector("span").textContent = items[i].textContent;
      items.forEach(function (n, k) { n.classList.toggle("selected", k === i); });
      setOpen(false);
      trigger.focus();
    }

    trigger.addEventListener("click", function () { setOpen(!isOpen()); });

    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen()) { setOpen(true); return; }
        setActive(activeIndex + (e.key === "ArrowDown" ? 1 : -1));
      } else if (e.key === "Enter" && isOpen()) {
        e.preventDefault();
        choose(activeIndex);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    });

    document.addEventListener("click", function (e) {
      if (!shell.contains(e.target)) setOpen(false);
    });

    var label = document.querySelector('label[for="' + select.id + '"]');
    if (label) {
      label.addEventListener("click", function (e) {
        e.preventDefault();
        trigger.focus();
      });
    }
  }

  /* ---------- Форма → телеграм-бот ---------- */

  var form = document.getElementById("consult-form");
  if (form) {
    var statusBox = form.querySelector(".form-status");
    var submitBtn = form.querySelector(".btn-submit");

    function setStatus(text, kind) {
      statusBox.textContent = text;
      statusBox.className = "form-status" + (kind ? " " + kind : "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.name.value.trim();
      var contact = form.contact.value.trim();
      var topic = form.topic.value;
      var message = form.message.value.trim();

      if (!name || !contact) {
        setStatus("Заполните, пожалуйста, имя и контакт для связи.", "error");
        return;
      }
      if (!form.consent.checked) {
        setStatus("Нужно согласие на обработку персональных данных.", "error");
        return;
      }

      var bot = SITE.telegramBot;
      if (!bot.botToken || !bot.chatId) {
        // Бот ещё не настроен — предлагаем написать напрямую
        var direct = isPlaceholder(C.telegramPersonal) ? C.telegramChannel : C.telegramPersonal;
        if (isPlaceholder(direct)) {
          setStatus("Отправка пока не настроена. Свяжитесь со мной по контактам слева.", "error");
        } else {
          setStatus("Отправка через сайт пока настраивается — открываю телеграм, напишите мне напрямую.", "error");
          window.open(direct, "_blank");
        }
        return;
      }

      var text =
        "Новая заявка с сайта\n" +
        "Имя: " + name + "\n" +
        "Контакт: " + contact + "\n" +
        "Тема: " + topic + "\n" +
        (message ? "Ситуация: " + message : "");

      submitBtn.disabled = true;
      setStatus("Отправляю…");

      fetch("https://api.telegram.org/bot" + bot.botToken + "/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: bot.chatId, text: text })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.ok) {
            form.reset();
            setStatus("Заявка отправлена. Отвечу вам в ближайшее время.", "ok");
          } else {
            throw new Error(data.description || "ошибка телеграма");
          }
        })
        .catch(function () {
          setStatus("Не получилось отправить. Напишите мне в телеграм напрямую — отвечаю быстро.", "error");
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

  /* ---------- Шапка и мобильное меню ---------- */

  var header = document.querySelector(".site-header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobile-menu");
  if (toggle && menu) {
    function closeMenu() {
      menu.hidden = true;
      toggle.textContent = "Меню";
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    toggle.addEventListener("click", function () {
      var open = menu.hidden;
      menu.hidden = !open;
      toggle.textContent = open ? "Закрыть" : "Меню";
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    var brandLink = document.querySelector(".brand");
    if (brandLink) brandLink.addEventListener("click", closeMenu);
  }

  /* ---------- Появление блоков при скролле ---------- */

  document.querySelectorAll(
    ".section-head, .about-grid > *, .reviews-cta, .documents-gate, .consult-grid > *, .interlude-quote, .demand-grid > *, .timely-inner"
  ).forEach(function (n) { n.classList.add("reveal"); });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  document.querySelectorAll(".reveal").forEach(function (n) { observer.observe(n); });

  /* ---------- Год в подвале ---------- */

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- SEO: микроразметка schema.org ---------- */

  function addJsonLd(obj) {
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(obj);
    document.head.appendChild(s);
  }

  addJsonLd({
    "@context": "https://schema.org",
    "@type": "Attorney",
    "name": C.name,
    "description": "Судебный юрист: банкротство физических и юридических лиц, субсидиарная ответственность, оспаривание сделок, семейные, налоговые, таможенные и корпоративные споры.",
    "areaServed": "Россия",
    "address": { "@type": "PostalAddress", "addressLocality": "Москва", "addressCountry": "RU" },
    "knowsAbout": SITE.practices.reduce(function (acc, group) {
      return acc.concat([group.title], group.items.map(function (item) { return item.title; }));
    }, [])
  });

  addJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": SITE.faq.map(function (item) {
      return {
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": { "@type": "Answer", "text": item.a }
      };
    })
  });

})();
