/* Loop Studio landing page — non-motion UI logic.
   Nav scroll-shrink + mobile menu, FAQ accordion, tool-showcase tab switching,
   four-stations toggle (qualitative result, no price), footer's real month/day
   grid, and Calendly popup wiring for every "Gespräch buchen"/"Kontakt
   aufnehmen" control. Nothing here depends on GSAP/Lenis or on
   prefers-reduced-motion — see js/motion.js for the animated layer.
   Replaces the retired Webflow (data-w-id/IX2) and Finsweet slider behaviour. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Calendly ---------- */
  var CALENDLY_URL = 'https://calendly.com/christianarns/15min';
  function openCalendly(e) {
    if (e) e.preventDefault();
    if (window.Calendly && Calendly.initPopupWidget) {
      Calendly.initPopupWidget({ url: CALENDLY_URL });
    } else {
      window.open(CALENDLY_URL, '_blank', 'noopener');
    }
  }
  $$('[data-calendly], a[href="#gespraech"]').forEach(function (el) {
    el.addEventListener('click', openCalendly);
  });

  /* Smooth in-page scroll for nav/footer anchor links that are not the
     Calendly trigger (js/motion.js hands this to Lenis when it is active;
     this is the plain fallback so links still work without motion.js). */
  $$('a[href^="#"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href.length < 2 || href === '#gespraech' || a.hasAttribute('data-calendly')) return;
    a.addEventListener('click', function (e) {
      var target = document.querySelector(href);
      if (!target || window.__lsLenisHandlesAnchors) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- Nav shrink-on-scroll ---------- */
  var nav = $('#nav');
  if (nav) {
    var checkNav = function () { nav.classList.toggle('ls-nav--fest', window.scrollY > 40); };
    checkNav();
    window.addEventListener('scroll', checkNav, { passive: true });
  }

  /* ---------- Mobile burger menu ---------- */
  var burger = $('#burger'), mobmenu = $('#mobmenu');
  if (burger && mobmenu) {
    burger.addEventListener('click', function () {
      var open = mobmenu.classList.toggle('ls-mobmenu--auf');
      burger.classList.toggle('ls-burger--auf', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', mobmenu).forEach(function (a) {
      a.addEventListener('click', function () {
        mobmenu.classList.remove('ls-mobmenu--auf');
        burger.classList.remove('ls-burger--auf');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  $$('#faqListe .ls-faq-item').forEach(function (item) {
    var q = $('.ls-faq-q', item), a = $('.ls-faq-a', item), inner = $('.ls-faq-a__in', item);
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('ls-faq-item--auf');
      $$('#faqListe .ls-faq-item').forEach(function (other) {
        other.classList.remove('ls-faq-item--auf');
        $('.ls-faq-a', other).style.height = '0px';
        $('.ls-faq-q', other).setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('ls-faq-item--auf');
        a.style.height = inner.offsetHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });
  window.addEventListener('resize', function () {
    var open = $('#faqListe .ls-faq-item--auf');
    if (open) $('.ls-faq-a', open).style.height = $('.ls-faq-a__in', open).offsetHeight + 'px';
  });

  /* ---------- Tool showcase: Inspiration / Produktion / Planung ---------- */
  var tool = $('#tool');
  if (tool) {
    var screens = {}, navs = {};
    $$('.ls-tool__screen', tool).forEach(function (el) { screens[el.dataset.s] = el; });
    $$('.ls-tool__nav[data-s]', tool).forEach(function (el) { navs[el.dataset.s] = el; });
    var showScreen = function (name) {
      Object.keys(screens).forEach(function (k) { screens[k].classList.toggle('ls-tool__screen--an', k === name); });
      Object.keys(navs).forEach(function (k) { navs[k].classList.toggle('ls-tool__nav--an', k === name); });
    };
    Object.keys(navs).forEach(function (k) { navs[k].addEventListener('click', function () { showScreen(k); }); });
  }

  /* ---------- Vier Stationen: qualitative Ergebnis, kein Preis ---------- */
  var saeulen = $$('.ls-saeule');
  if (saeulen.length) {
    var zustand = {};
    saeulen.forEach(function (b) { zustand[b.dataset.s] = b.classList.contains('ls-saeule--an'); });
    var ERGEBNIS = {
      keine: { name: 'Nur das Werkzeug', txt: 'Ideen, Dreh, Schnitt und Planen machst du komplett selbst mit Loop Studio. Dafür reicht dir das Tool schon — Preise dazu findest du weiter unten.' },
      idee: { name: 'Ideen & Planen mit uns', txt: 'Die Software übernimmt Ideenfindung und Planung, den Rest machst du selbst.' },
      mitte: { name: 'Dein Fokus: Produktion & Schnitt', txt: 'Du willst bei Dreh und/oder Schnitt Unterstützung? Genau dafür gibt es Consulting „Auf Anfrage" — wir sprechen im Gespräch über deinen genauen Zuschnitt.' },
      alle: { name: 'Rundum-Unterstützung', txt: 'Von der Idee bis zum Posten willst du begleitet werden — auch das ist Teil von Consulting „Auf Anfrage". Kein Paketpreis hier, sondern ein Gespräch über deinen Bedarf.' }
    };
    var ergName = $('#ergName'), ergTxt = $('#ergTxt');
    var rechnen = function () {
      var mitte = zustand.produktion || zustand.schnitt;
      var alle = zustand.idee && zustand.produktion && zustand.schnitt && zustand.posten;
      var keine = !zustand.idee && !zustand.produktion && !zustand.schnitt && !zustand.posten;
      var r = keine ? ERGEBNIS.keine : alle ? ERGEBNIS.alle : mitte ? ERGEBNIS.mitte : ERGEBNIS.idee;
      if (ergName) ergName.textContent = r.name;
      if (ergTxt) ergTxt.textContent = r.txt;
    };
    saeulen.forEach(function (b) {
      b.addEventListener('click', function () {
        var an = !b.classList.contains('ls-saeule--an');
        b.classList.toggle('ls-saeule--an', an);
        b.setAttribute('aria-pressed', an ? 'true' : 'false');
        zustand[b.dataset.s] = an;
        rechnen();
      });
    });
    rechnen();
  }

  /* ---------- Footer: echter Monat/Tag, keine erfundene Verfügbarkeit ---------- */
  var kalGrid = $('#terminGrid');
  if (kalGrid) {
    var jetzt = new Date(), jahr = jetzt.getFullYear(), monat = jetzt.getMonth(), heute = jetzt.getDate();
    var tageImMonat = new Date(jahr, monat + 1, 0).getDate();
    var ersterWochentag = (new Date(jahr, monat, 1).getDay() + 6) % 7; /* Montag = 0 */
    var monatLabel = $('#terminMonat');
    if (monatLabel) monatLabel.textContent = jetzt.toLocaleDateString('de-DE', { month: 'long' });
    for (var e = 0; e < ersterWochentag; e++) {
      var leer = document.createElement('i'); leer.className = 'leer'; kalGrid.appendChild(leer);
    }
    for (var d = 1; d <= tageImMonat; d++) {
      var zelle = document.createElement('i'); zelle.textContent = String(d);
      if (d === heute) zelle.className = 'heute';
      kalGrid.appendChild(zelle);
    }
  }
})();
