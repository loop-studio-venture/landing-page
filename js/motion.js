/* Loop Studio landing page — the one motion layer: Lenis smooth scroll +
   every GSAP/ScrollTrigger behaviour. Replaces the retired Webflow IX2
   runtime entirely. Everything here checks prefers-reduced-motion: reduce
   and no-ops (Lenis falls back to native scroll, ScrollTrigger pin/scrub is
   skipped, all content is set to its fully visible end-state). Non-motion UI
   (nav, FAQ, tabs, footer calendar, Calendly wiring) lives in js/site.js. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduceMotion) document.documentElement.classList.add('ls-reduced-motion');
  var wide = window.innerWidth > 900;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var sanft = !reduceMotion && hasGsap; /* "sanft" = smooth/animated allowed */
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- 1. Lenis ---------- */
  var lenis = null;
  if (sanft && wide && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.05, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    window.__lsLenisHandlesAnchors = true;
    $$('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.length < 2 || href === '#gespraech' || a.hasAttribute('data-calendly')) return;
      a.addEventListener('click', function (e) {
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -84, duration: 1.1 });
      });
    });
  }

  /* ---------- 2. Hero: rotating last word ---------- */
  var kasten = $('#kasten');
  if (kasten) {
    var words = $$('.ls-kasten__w', kasten), i = 0;
    var setWidth = function () { kasten.style.width = words[i].getBoundingClientRect().width + 'px'; };
    setWidth();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setWidth);
    window.addEventListener('resize', setWidth);
    if (sanft) {
      setInterval(function () {
        words[i].classList.remove('ls-kasten__w--an');
        var next = (i + 1) % words.length;
        words[next].classList.add('ls-kasten__w--an');
        i = next;
        setWidth();
      }, 2600);
    }
  }

  /* ---------- 3. Hero: mouse-parallax scene ---------- */
  var scene = $('#heroScene');
  if (scene && sanft) {
    var layers = $$('[data-tiefe]', scene);
    var target = { x: 0, y: 0 }, current = { x: 0, y: 0 }, running = false;
    var step = function () {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      layers.forEach(function (el) {
        var t = parseFloat(el.dataset.tiefe) || 0.5;
        el.style.transform = 'translate(' + (current.x * t * 22).toFixed(1) + 'px,' + (current.y * t * 16).toFixed(1) + 'px)';
      });
      if (Math.abs(target.x - current.x) > 0.002 || Math.abs(target.y - current.y) > 0.002) requestAnimationFrame(step);
      else running = false;
    };
    var kick = function () { if (!running) { running = true; requestAnimationFrame(step); } };
    scene.addEventListener('mousemove', function (e) {
      var r = scene.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      kick();
    });
    scene.addEventListener('mouseleave', function () { target.x = 0; target.y = 0; kick(); });
  }

  /* ---------- 4. Scroll-driven Ablauf (pinned) ---------- */
  var ablauf = $('#ablauf');
  if (ablauf && hasGsap) {
    var schritte = $$('.ls-schritt', ablauf), visuals = $$('.ls-visuell', ablauf), punkte = $$('.ls-punkte i', ablauf);
    var showStep = function (idx) {
      schritte.forEach(function (el, k) { el.classList.toggle('ls-schritt--an', k === idx); });
      visuals.forEach(function (el, k) { el.classList.toggle('ls-schritt--an', k === idx); });
      punkte.forEach(function (el, k) { el.classList.toggle('an', k === idx); });
    };
    if (sanft && wide) {
      var n = schritte.length;
      ScrollTrigger.create({
        trigger: ablauf,
        pin: '.ls-ablauf__pin',
        start: 'top top',
        end: '+=' + (n * 90) + '%',
        scrub: 0.4,
        onUpdate: function (self) {
          var idx = clamp(Math.floor(self.progress * n), 0, n - 1);
          showStep(idx);
        }
      });
      showStep(0);
    } else {
      /* Below ~900px, or without motion: unpinned and stacked, all visible. */
      schritte.forEach(function (el) { el.classList.add('ls-schritt--an'); });
      visuals.forEach(function (el) { el.classList.add('ls-schritt--an'); });
    }
  }

  /* ---------- 5. Monster füttern ---------- */
  var futternBtn = $('#futtern'), futterMon = $('#futterMonster');
  if (futternBtn && futterMon) {
    var zahlEl = $('#futterZahl'), textEl = $('#futterText'), n = 0;
    ['auf', 'kaut'].forEach(function (k) { if (futterMon.dataset[k]) { var img = new Image(); img.src = futterMon.dataset[k]; } });
    var SAETZE = [[0, 'Drück auf den Knopf. Schau, was passiert.'], [1, 'Es kaut. Und will mehr.'], [3, 'Merkst du? Es wird nicht satt.'], [6, 'Aber es fängt an, dich zu mögen.'], [10, 'So geht das: dranbleiben. Genau dafür sind wir da.']];
    var satzFuer = function (k) { var s = SAETZE[0][1]; SAETZE.forEach(function (p) { if (k >= p[0]) s = p[1]; }); return s; };
    var kauTimer = null;
    var feed = function () {
      n++;
      if (zahlEl) zahlEl.textContent = String(n);
      if (textEl) textEl.textContent = satzFuer(n);
      clearTimeout(kauTimer);
      if (sanft) {
        futterMon.src = futterMon.dataset.auf || futterMon.src;
        if (hasGsap) {
          gsap.fromTo(futterMon, { y: 0 }, { y: -16, yoyo: true, repeat: 1, duration: 0.16, ease: 'power2.out' });
        }
        kauTimer = setTimeout(function () {
          futterMon.src = futterMon.dataset.kaut || futterMon.src;
          kauTimer = setTimeout(function () { futterMon.src = futterMon.dataset.zu || futterMon.dataset.web || futterMon.src; }, 500);
        }, 220);
      } else {
        /* Reduced motion: swap through the frames instantly, no timeline. */
        futterMon.src = futterMon.dataset.kaut || futterMon.src;
      }
    };
    futternBtn.addEventListener('click', feed);
    futterMon.addEventListener('click', feed);
  }

  /* ---------- 6. Baukasten: Lego.init hookup ---------- */
  var legoRoot = $('#lego-baukasten');
  if (legoRoot && window.Lego && typeof window.Lego.init === 'function') {
    window.Lego.init(legoRoot, {
      u: 22,
      aufAenderung: function (zustand) {
        var zahl = $('#stapelZahl');
        if (zahl) zahl.textContent = String(zustand.anzahl);
      }
    });
  }

  /* ---------- 7. Reveal (.ls-rv) ---------- */
  var revealEls = $$('.ls-rv');
  if (revealEls.length) {
    if (sanft) {
      revealEls.forEach(function (el) { el.setAttribute('data-rv-ready', ''); });
      revealEls.forEach(function (el) {
        gsap.fromTo(el, { y: 24, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true }
        });
      });
    } else {
      revealEls.forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
    }
  }

  if (hasGsap && sanft) ScrollTrigger.refresh();
})();
