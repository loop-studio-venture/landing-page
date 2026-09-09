/* ============================================================
   Fassung 5 — alles Bewegte. GSAP + ScrollTrigger + Lenis aus web/lib/.
   1 Lenis              6 Sequenz: Button fliegt sofort, Panel steigt,
   2 Wort-Einflug         vier Schritte laufen durchgehend mit dem Scroll
   3 Kasten             7 Monster füttern (Stein in den Mund, wird dicker)
   4 Szene (Maus)       8 Stationen-Rechner   9 Baukasten-Schleife
   5 Tool-Ablauf       10 Paket-Szenen       11 Story-Video, Zitate
   ============================================================ */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var sanft = !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gross = window.innerWidth > 900;
  var hatGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hatGsap) { gsap.registerPlugin(ScrollTrigger); document.documentElement.classList.add('gsap'); }
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var glatt = function (t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- 1 Lenis ---------- */
  var lenis = null;
  if (sanft && hatGsap && gross && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.05, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  var CALENDLY = 'https://calendly.com/christianarns/15min?hide_gdpr_banner=1&background_color=243060&text_color=ffffff&primary_color=74c19e';
  var kalenderOeffnen = function (e) {
    e.preventDefault();
    if (window.Calendly && Calendly.initPopupWidget) Calendly.initPopupWidget({ url: CALENDLY });
    else window.open(CALENDLY, '_blank', 'noopener');
  };
  $$('a[href="#gespraech"], #rufKnopf').forEach(function (a) { a.addEventListener('click', kalenderOeffnen); });
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2 || id === '#gespraech') return;
      var ziel = document.querySelector(id); if (!ziel) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(ziel, { offset: -84, duration: 1.2 });
      else ziel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- 2 Woerter ---------- */
  function teilen(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false), knoten = [];
    while (walker.nextNode()) knoten.push(walker.currentNode);
    knoten.forEach(function (t) {
      if (!t.nodeValue.trim()) return;
      if (t.parentNode.closest && t.parentNode.closest('.kasten,.w,.flieger')) return;
      var frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach(function (teil) {
        if (!teil) return;
        if (/^\s+$/.test(teil)) { frag.appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'w';
        var i = document.createElement('span'); i.className = 'w__i'; i.textContent = teil;
        w.appendChild(i); frag.appendChild(w);
      });
      t.parentNode.replaceChild(frag, t);
    });
    return $$('.w__i', el);
  }
  if (hatGsap && sanft) {
    $$('.held__titel, .lede .h2, .zeigen__t, .fuss__h2, .regeln__zeile').forEach(function (el) {
      var woerter = teilen(el); if (!woerter.length) return;
      gsap.set(woerter, { yPercent: 110 });
      gsap.to(woerter, { yPercent: 0, duration: .9, ease: 'power3.out', stagger: .05,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
  }

  /* ---------- 3 Kasten ---------- */
  var kasten = $('#kasten');
  if (kasten) {
    var ws = $$('.kasten__w', kasten), ki = 0;
    var setzen = function () { kasten.style.width = ws[ki].offsetWidth + 'px'; };
    setzen();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setzen);
    window.addEventListener('resize', setzen);
    if (sanft) setInterval(function () {
      ws[ki].classList.remove('kasten__w--an'); ws[ki].classList.add('kasten__w--weg');
      var alt = ki; ki = (ki + 1) % ws.length;
      ws[ki].classList.add('kasten__w--an'); setzen();
      setTimeout(function () { ws[alt].classList.remove('kasten__w--weg'); }, 600);
    }, 2600);
  }

  /* ---------- 4 Szene ---------- */
  var szene = $('#szene'), monster = $('#monsterHeld');
  if (szene && monster) {
    var held = $('.held'), ebenen = $$('[data-tiefe]', szene);
    var ziel = { x: 0, y: 0 }, ist = { x: 0, y: 0 }, laeuft = false;
    var schritt = function () {
      ist.x += (ziel.x - ist.x) * 0.08; ist.y += (ziel.y - ist.y) * 0.08;
      ebenen.forEach(function (el) {
        var t = parseFloat(el.dataset.tiefe) || .5;
        el.style.transform = el === monster
          ? 'translate(' + (ist.x * t * 64).toFixed(1) + 'px,' + (ist.y * t * 48).toFixed(1) + 'px) rotate(' + (ist.x * 6).toFixed(2) + 'deg)'
          : 'translate(' + (ist.x * t * 60).toFixed(1) + 'px,' + (ist.y * t * 46).toFixed(1) + 'px)';
      });
      if (Math.abs(ziel.x - ist.x) > .002 || Math.abs(ziel.y - ist.y) > .002) requestAnimationFrame(schritt); else laeuft = false;
    };
    var anstossen = function () { if (!laeuft) { laeuft = true; requestAnimationFrame(schritt); } };
    if (sanft) {
      held.addEventListener('mousemove', function (e) {
        var r = held.getBoundingClientRect();
        ziel.x = ((e.clientX - r.left) / r.width - .5) * 2; ziel.y = ((e.clientY - r.top) / r.height - .5) * 2; anstossen();
      });
      held.addEventListener('mouseleave', function () { ziel.x = 0; ziel.y = 0; anstossen(); });
    }
    if (window.Lego) {
      var st = $('#szeneSteine');
      [['blue', 4], ['teal', 3], ['gold', 2]].forEach(function (p) {
        var e = Lego.element({ noppen: p[1], farbe: p[0], text: '', u: 18 }); e.style.display = 'block'; st.appendChild(e);
      });
    }
    var bild = $('#monsterBildHeld');
    if (bild.dataset.auf) { var vor = new Image(); vor.src = bild.dataset.auf;
      monster.addEventListener('mouseenter', function () { bild.src = bild.dataset.auf; });
      monster.addEventListener('mouseleave', function () { bild.src = bild.dataset.zu; }); }
    monster.addEventListener('click', function () {
      if (hatGsap && sanft) {
        gsap.fromTo(bild, { y: 0 }, { y: -28, yoyo: true, repeat: 1, duration: .22, ease: 'power2.out' });
        gsap.fromTo(bild, { scaleX: 1 }, { scaleX: 1.05, yoyo: true, repeat: 1, duration: .22, transformOrigin: '50% 100%' });
      }
    });
  }

  /* ---------- 5 Tool: Inspiration -> Produktion -> Planung ---------- */
  var tool = $('#tool');
  if (tool && hatGsap && sanft) {
    var url = 'instagram.com/reel/C8xQ2LnpWq1', urlEl = $('#toolUrl'), neu = $('#toolNeu'), btn = $('#toolBtn');
    var screens = {}, navs = {};
    $$('.tool__screen', tool).forEach(function (e) { screens[e.dataset.s] = e; });
    $$('.tool__nav[data-s]', tool).forEach(function (e) { navs[e.dataset.s] = e; });
    var zS = $$('.tool__zeileS', screens.produktion), shots = $$('.tool__shot', screens.produktion);
    var kal = $('#toolKal'), chips = [];
    if (kal) {
      var termine = { 3: '#5 Team zeigen', 11: '#7 Aufbau vs. Ergebnis', 16: '#6 Preis erklärt', 22: '#8 Humor', 25: '#9 Frage aus der DM', 29: '#10 So entsteht es' };
      for (var d = 1; d <= 30; d++) {
        var z = document.createElement('div'); z.className = 'tool__tag2'; z.textContent = d;
        if (termine[d]) { var c = document.createElement('i'); c.className = 'tool__termin' + (d === 11 ? ' tool__termin--neu' : ''); c.textContent = termine[d]; z.appendChild(c); chips.push(c); }
        kal.appendChild(z);
      }
    }
    var screenZeigen = function (name) {
      Object.keys(screens).forEach(function (k) { screens[k].classList.toggle('tool__screen--an', k === name); });
      Object.keys(navs).forEach(function (k) { navs[k].classList.toggle('tool__nav--an', k === name); });
    };
    var letzte = $('#toolLetzte');
    var zuruecksetzen = function () {
      screenZeigen('inspiration');
      if (letzte) gsap.set(letzte, { clearProps: 'all' });
      gsap.set(neu, { height: 0, opacity: 0, paddingTop: 0, paddingBottom: 0, marginTop: -12, borderWidth: 0 });
      gsap.set(zS, { width: 0 }); gsap.set(shots, { opacity: 0, x: 12 }); gsap.set(chips, { scale: 0, opacity: 0 });
      proxy.n = 0; urlEl.textContent = '';
    };
    var proxy = { n: 0 };
    zuruecksetzen();
    var tl = gsap.timeline({ repeat: -1, repeatDelay: .8, paused: true });
    tl.timeScale(.85);
    tl.addLabel('inspiration').call(function () { screenZeigen('inspiration'); })
      .to(proxy, { n: url.length, duration: 1.6, ease: 'none', onUpdate: function () { urlEl.textContent = url.slice(0, Math.round(proxy.n)); } })
      .to(btn, { scale: .94, duration: .12, yoyo: true, repeat: 1 }, '+=.3')
      .to(letzte, { opacity: 0, duration: .35, ease: 'power1.out' }, '+=.2')
      .to(neu, { height: 'auto', paddingTop: 12, paddingBottom: 12, marginTop: 0, borderWidth: 1, duration: .9, ease: 'power3.inOut' }, '<')
      .to(letzte, { height: 0, paddingTop: 0, paddingBottom: 0, marginTop: -12, borderWidth: 0, duration: .9, ease: 'power3.inOut' }, '<')
      .to(neu, { opacity: 1, duration: .5, ease: 'power1.out' }, '-=.45')
      .to({}, { duration: 1.6 })
      .addLabel('produktion').call(function () { screenZeigen('produktion'); })
      .fromTo(screens.produktion, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5 })
      .to(zS, { width: function (i, el) { return el.style.getPropertyValue('--b'); }, duration: .5, stagger: .12, ease: 'power2.out' }, '-=.1')
      .to(shots, { opacity: 1, x: 0, duration: .4, stagger: .15 }, '-=.1')
      .to({}, { duration: 3.4 })
      .addLabel('planung').call(function () { screenZeigen('planung'); })
      .fromTo(screens.planung, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5 })
      .to(chips, { scale: 1, opacity: 1, duration: .35, stagger: .14, ease: 'back.out(2)' }, '-=.1')
      .to({}, { duration: 3.8 })
      .to(tool.querySelector('.tool__haupt'), { opacity: 0, duration: .35 })
      .call(zuruecksetzen)
      .to(tool.querySelector('.tool__haupt'), { opacity: 1, duration: .35 });
    Object.keys(navs).forEach(function (k) { navs[k].addEventListener('click', function () { tl.seek(k, false); tl.play(); }); });
    gsap.fromTo(tool, { y: 240, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: tool, start: 'top 100%', end: 'top 45%', scrub: .4 } });
    ScrollTrigger.create({ trigger: tool, start: 'top 85%', end: 'bottom 10%',
      onEnter: function () { tl.play(); }, onEnterBack: function () { tl.play(); }, onLeave: function () { tl.pause(); }, onLeaveBack: function () { tl.pause(); } });
  }

  /* ---------- 6 Sequenz ---------- */
  var zeigen = $('#zeigen');
  if (zeigen && hatGsap) {
    var panel = $('#zeigenPanel'), pin = $('.zeigen__pin', zeigen),
        schritte = $$('.schritt', zeigen), visuals = $$('.visual', zeigen), punkte = $$('.zeigen__punkte i', zeigen);

    /* Kalender fuer Schritt 4 bauen: 6 Reichweite, 4 Branding, 2 Leads auf 35 Tage */
    var grid = $('#v4grid'), SVGNS = 'http://www.w3.org/2000/svg';
    var belegung = { 2: 'r', 4: 'b', 8: 'r', 10: 'l', 12: 'b', 15: 'r', 18: 'r', 19: 'b', 23: 'r', 25: 'l', 29: 'r', 31: 'b' };
    var farben = { r: '#4D8EF7', b: '#74C19E', l: '#D9A64A' }, zellen = [];
    if (grid) for (var d = 0; d < 35; d++) {
      var r = document.createElementNS(SVGNS, 'rect'), sp = d % 7, ze = Math.floor(d / 7);
      r.setAttribute('x', 40 + sp * 70); r.setAttribute('y', 60 + ze * 50); r.setAttribute('width', 60); r.setAttribute('height', 40); r.setAttribute('rx', 8);
      r.setAttribute('fill', belegung[d] ? farben[belegung[d]] : 'rgba(255,255,255,.07)');
      grid.appendChild(r);
      if (belegung[d]) { zellen.push(r); gsap.set(r, { scale: 0, transformOrigin: '50% 50%' }); }
    }

    /* Vier innere Zeitleisten, pausiert — ihr Fortschritt haengt am Scroll */
    var v1 = gsap.timeline({ paused: true }), v2 = gsap.timeline({ paused: true }), v3 = gsap.timeline({ paused: true }), v4 = gsap.timeline({ paused: true });
    var weg = $('#v1weg'); if (weg) { var L = weg.getTotalLength(); gsap.set(weg, { strokeDasharray: L, strokeDashoffset: L }); }
    var punktAuf = function (t) { /* Punkt auf der Kurve M180 78 C260 40 300 200 360 210 */
      var p0 = [180, 78], p1 = [260, 40], p2 = [300, 200], p3 = [360, 210], u = 1 - t;
      return [u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]];
    };
    var kartePos = { t: 0 };
    v1.to('#v1markFill', { opacity: 1, duration: .2 })
      .to('#v1herz', { scale: 1.3, transformOrigin: '50% 50%', yoyo: true, repeat: 1, duration: .1 }, 0)
      .to(weg, { strokeDashoffset: 0, duration: .6 }, .15)
      .to('#v1karte', { opacity: 1, duration: .08 }, .15)
      .to(kartePos, { t: 1, duration: .6, ease: 'none', onUpdate: function () { var p = punktAuf(kartePos.t); gsap.set('#v1karte', { x: p[0], y: p[1], rotation: kartePos.t * 24 }); } }, .15)
      .to('#v1karte', { opacity: 0, scale: .4, duration: .12 }, .72)
      .to('.v1z', { opacity: 1, duration: .12, stagger: .1 }, .78)
      .to('#v1dm', { opacity: 1, duration: .15 }, 1.05);
    var zeilen = $$('.v2z'); gsap.set(zeilen, { scaleX: 0, transformOrigin: '0 50%' });
    gsap.set('#v2stift', { x: 84, y: 108 });
    zeilen.forEach(function (z, i) {
      var y = +z.getAttribute('y') + 4, x2 = +z.getAttribute('x') + +z.getAttribute('width');
      v2.to(z, { scaleX: 1, duration: .1, ease: 'none' }, i * .11)
        .to('#v2stift', { x: x2, y: y, duration: .1, ease: 'none' }, i * .11);
    });
    v2.to('#v2cta', { opacity: 1, duration: .1 }, zeilen.length * .11)
      .to('.v2s', { opacity: 1, duration: .1, stagger: .12 }, .5)
      .to('#v2stift', { opacity: 0, duration: .1 }, zeilen.length * .11 + .1);
    gsap.set('#drehWir', { rotationY: 90 });
    var hakenDu = $$('#drehDu li em'), hakenWir = $$('#drehWir li em');
    v3.to(hakenDu, { scale: 1, duration: .08, stagger: .07, ease: 'back.out(2)' }, 0)
      .to('#drehDu', { rotationY: -90, duration: .3, ease: 'power2.in' }, .42)
      .to('#drehKnopf', { '--k': '34px', duration: .3, ease: 'none' }, .42)
      .to('#drehWir', { rotationY: 0, duration: .3, ease: 'power2.out' }, .72)
      .to(hakenWir, { scale: 1, duration: .08, stagger: .07, ease: 'back.out(2)' }, .78);
    v4.to(zellen, { scale: 1, duration: .08, stagger: .06, ease: 'back.out(2)' }, 0)
      .to('#v4bars rect:nth-of-type(1)', { attr: { y: 404 - 72, height: 72 }, duration: .3, ease: 'power2.out' }, .78)
      .to('#v4bars rect:nth-of-type(2)', { attr: { y: 404 - 48, height: 48 }, duration: .3, ease: 'power2.out' }, .84)
      .to('#v4bars rect:nth-of-type(3)', { attr: { y: 404 - 24, height: 24 }, duration: .3, ease: 'power2.out' }, .9);
    var innen = [v1, v2, v3, v4];

    var aktiv = -1;
    function ablauf(p) {
      /* vier Schritte ueber den ganzen Weg, weiche Uebergaenge */
      var st = p * 4;
      for (var i = 0; i < 4; i++) {
        var lokal = st - i;
        var ein = i === 0 ? 1 : glatt(lokal / .14), aus = i < 3 ? glatt((lokal - .86) / .14) : 0;
        var sicht = ein - aus;
        gsap.set(schritte[i], { opacity: sicht, y: (1 - ein) * 30 - aus * 30 });
        gsap.set(visuals[i], { opacity: sicht, y: (1 - ein) * 26 - aus * 26, scale: .96 + .04 * sicht });
        innen[i].progress(clamp(i === 0 ? lokal / .82 : (lokal - .12) / .7, 0, 1));
        punkte[i].classList.toggle('an', lokal >= 0 && (lokal < 1 || i === 3));
      }
    }

    if (sanft && gross) {
      ScrollTrigger.create({ trigger: zeigen, start: 'top top', end: 'bottom bottom', scrub: .35, invalidateOnRefresh: true,
        onUpdate: function (self) { ablauf(self.progress); } });
      ablauf(0);
    } else {
      /* ohne Pinnen: alles sichtbar, innere Abläufe fertig */
      gsap.set(schritte, { opacity: 1, y: 0 }); gsap.set(visuals, { opacity: 1, position: 'relative', height: 300, marginBottom: 24 });
      innen.forEach(function (t) { t.progress(1); });
    }
  }

  /* ---------- 7 Monster füttern ---------- */
  var futtern = $('#futtern');
  if (futtern && hatGsap) {
    var buehne = $('#futterBuehne'), mon = $('#futterMonster'), steine = $('#futterSteine'), zahl = $('#futterZahl'), text = $('#futterText'), n = 0;
    ['auf', 'kaut'].forEach(function (k) { var i = new Image(); i.src = mon.dataset[k]; });
    var mundTimer = null, kauTimer = null, drueber = false, kaut = false;
    mon.addEventListener('mouseenter', function () { drueber = true; if (!kaut) mon.src = mon.dataset.auf; });
    mon.addEventListener('mouseleave', function () { drueber = false; if (!kaut) mon.src = mon.dataset.zu; });
    var FARBEN = ['blue', 'teal', 'gold', 'navy'];
    var SAETZE = [[0, 'Drück auf den Knopf. Schau, was passiert.'], [1, 'Es kaut. Und will mehr.'], [3, 'Merkst du? Es wird nicht satt.'], [6, 'Aber es fängt an, dich zu mögen.'], [10, 'So geht das: dranbleiben. Genau dafür sind wir da.']];
    var satz = function (k) { var s = SAETZE[0][1]; SAETZE.forEach(function (p) { if (k >= p[0]) s = p[1]; }); return s; };
    /* Es wird mit jedem Reel dicker, linear bis 50 Reels, danach nicht mehr (Ziel 1,8-fach). Die Geometrie begrenzt:
       links der Bildrand, rechts das Panel (rueckt so weit mit, wie es Platz hat), oben der Text — was nach oben
       nicht mehr passt, bekommt die Buehne unten dazu, die Fuesse bleiben stehen. Gemessen wird einmal im
       Ruhezustand (Skalierung 1); Drehpunkt 50 % / 92 % (CSS). */
    var MAX_N = 50, ZIEL = 1.8, panel = $('.futter__panel');
    var dick = { x: 1, y: 1 }, natur = null, refreshTimer = null;
    var messen = function () {
      var r = mon.getBoundingClientRect(), s = buehne.getBoundingClientRect(), p = panel.getBoundingClientRect();
      var lede = mon.closest('.wrap').querySelector('.lede'), cx = r.left + r.width / 2;
      var inhalt = $$(':scope > *', panel).reduce(function (m, k) { return Math.max(m, k.getBoundingClientRect().right); }, p.left);
      natur = { w: r.width, h: r.height, buehneH: s.height, boden: (s.bottom - r.bottom) / s.height, kopfLuft: lede ? Math.max(0, r.top - lede.getBoundingClientRect().bottom - 14) : 0,
        links: cx, rechts: window.innerWidth - cx, panelUnten: p.top >= r.bottom - 10,
        panelLuft: (p.left - 12) - cx, panelReserve: Math.max(0, p.right - inhalt - 8) };
    };
    var zielMass = function (k) {
      var t = Math.min(k, MAX_N) / MAX_N, halb = natur.w / 2;
      var capX = natur.panelUnten ? Math.min(natur.links, natur.rechts) / halb : Math.min(natur.links, natur.panelLuft + natur.panelReserve) / halb;
      var maxX = Math.max(1.05, Math.min(ZIEL, capX)), maxY = Math.min(ZIEL, maxX * 1.15);
      return { x: 1 + (maxX - 1) * t, y: 1 + (maxY - 1) * t };
    };
    var fuettern = function (vonKnopf) {
      n++; zahl.textContent = n; text.textContent = satz(n);
      if (!natur) messen();
      var b = buehne.getBoundingClientRect(), k = futtern.getBoundingClientRect(), m = mon.getBoundingClientRect(), ziel = zielMass(n);
      /* Klick aufs Monster: der Stein startet am Knopf, wenn der im Bild ist, sonst unten links auf der Buehne */
      var vomKnopf = vonKnopf || (k.bottom > 0 && k.top < window.innerHeight);
      var stein = window.Lego ? Lego.element({ noppen: 2 + Math.floor(Math.random() * 3), farbe: FARBEN[n % FARBEN.length], text: '', u: 16 }) : document.createElement('i');
      var start = vomKnopf ? { x: k.left + k.width / 2 - b.left, y: k.top + k.height / 2 - b.top } : { x: b.width * .08, y: b.height * .88 };
      /* Mund: mittig, 44 % der Bildhoehe von oben — waechst und wandert mit dem Bild */
      var mund = { x: m.left + m.width / 2 - b.left, y: m.top + m.height * .44 - b.top };
      steine.appendChild(stein);
      gsap.set(stein, { x: start.x - 24, y: start.y - 14, rotation: -20, scale: 1 });
      clearTimeout(mundTimer); clearTimeout(kauTimer); kaut = true; mon.src = mon.dataset.auf; /* Mund auf, solange der Stein fliegt */
      gsap.to(stein, { keyframes: [{ x: (start.x + mund.x) / 2 - 24, y: Math.min(start.y, mund.y) - 120, rotation: 20, duration: .32, ease: 'power1.out' }, { x: mund.x - 24, y: mund.y - 14, rotation: 60, scale: .3, opacity: .6, duration: .28, ease: 'power1.in' }],
        onComplete: function () { stein.remove();
          mon.src = mon.dataset.kaut;
          /* der Fuss steht bei bottom:6 % — waechst die Buehne um x, rutscht das Monster nur um 0,94 x nach unten */
          var anstieg = (ziel.y - 1) * natur.h * .92, extra = Math.max(0, (anstieg - natur.kopfLuft) / (1 - natur.boden));
          var schub = natur.panelUnten ? 0 : Math.max(0, Math.min(natur.panelReserve, ziel.x * natur.w / 2 - natur.panelLuft));
          gsap.timeline().to(mon, { scaleX: dick.x, scaleY: dick.y * .93, duration: .09, yoyo: true, repeat: 1, transformOrigin: '50% 92%' })
            .to(mon, { scaleX: ziel.x, scaleY: ziel.y, duration: .55, ease: 'back.out(1.4)', transformOrigin: '50% 92%' })
            .to(buehne, { height: natur.buehneH + extra, duration: .55, ease: 'power2.out' }, '<')
            .to(panel, { x: schub, duration: .55, ease: 'power2.out' }, '<');
          dick = ziel;
          if (extra > 0 && window.ScrollTrigger) { clearTimeout(refreshTimer); refreshTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 700); }
          kauTimer = setTimeout(function () { kaut = false; mon.src = drueber ? mon.dataset.auf : mon.dataset.zu; }, 900); } });
      if (sanft && vomKnopf) gsap.fromTo(futtern, { scale: 1 }, { scale: .95, yoyo: true, repeat: 1, duration: .1 });
    };
    futtern.addEventListener('click', function () { fuettern(true); });
    mon.addEventListener('click', function () { fuettern(false); });
  }

  /* ---------- 8 Stationen ---------- */
  var saeulen = $$('.saeule');
  if (saeulen.length) {
    var zustand = { idee: true, produktion: true, schnitt: true, posten: true };
    saeulen.forEach(function (b) { zustand[b.dataset.s] = b.classList.contains('saeule--an'); });
    var PAKETE = {
      soft: { label: 'Das reicht dir schon', name: 'NUR LOOP STUDIO', preis: '20 €', spanne: 'pro Monat · monatlich kündbar', txt: 'Ideen, Dreh, Schnitt und Plan machst du selbst. Dann reicht dir das Werkzeug — und genau das sagen wir dir auch im Gespräch.' },
      basis: { label: 'Dein Paket', name: 'BASIS', preis: '490 €', spanne: 'pro Monat · 3 Monate', txt: 'Du drehst und schneidest selbst, wir denken mit: Wochen-Call, Monatsanalyse, Technik-Call zum Start. Vier Reels im Monat.' },
      schnitt: { label: 'Dein Paket', name: 'EDITING', preis: '1.690 €', spanne: 'pro Monat · 3 Monate', txt: 'Du filmst selbst und lädst hoch, wir schneiden acht Reels im Monat. Erster Schnitt in 72 Stunden, zwei Korrekturrunden.' },
      prod: { label: 'Dein Paket', name: 'PRODUKTION', preis: '3.900 €', spanne: 'pro Monat · 3 Monate', txt: 'Ein bis zwei Drehtage im Monat bei dir vor Ort, 16 Reels geschnitten, Monatsreport. Kamera, Licht und Ton bringen wir mit.' }
    };
    var rechnen = function () {
      var k = (!zustand.produktion && !zustand.schnitt && !zustand.idee && !zustand.posten) ? 'soft' : zustand.produktion ? 'prod' : zustand.schnitt ? 'schnitt' : 'basis';
      var p = PAKETE[k];
      $('#ergLabel').textContent = p.label; $('#ergName').textContent = p.name; $('#ergPreis').textContent = p.preis; $('#ergSpanne').textContent = p.spanne;
      $('#ergTxt').textContent = p.txt;
    };
    saeulen.forEach(function (b) { b.addEventListener('click', function () {
      var an = !b.classList.contains('saeule--an'); b.classList.toggle('saeule--an', an); b.setAttribute('aria-pressed', an ? 'true' : 'false'); zustand[b.dataset.s] = an; rechnen(); }); });
    rechnen();
    if (hatGsap && sanft) {
      var takt2 = null, selbst = true, reihe = ['produktion', 'schnitt', 'produktion', 'schnitt'], ri = 0;
      var schalten = function () {
        if (!selbst) return;
        var b = saeulen.filter(function (x) { return x.dataset.s === reihe[ri % reihe.length]; })[0]; ri++;
        if (!b) return; var an = !b.classList.contains('saeule--an');
        b.classList.toggle('saeule--an', an); b.setAttribute('aria-pressed', an ? 'true' : 'false'); zustand[b.dataset.s] = an;
        b.classList.remove('saeule--tick'); void b.offsetWidth; b.classList.add('saeule--tick'); rechnen();
      };
      saeulen.forEach(function (b) { b.addEventListener('click', function () { selbst = false; clearInterval(takt2); }); });
      ScrollTrigger.create({ trigger: '#saeulen', start: 'top 70%', end: 'bottom 30%',
        onEnter: function () { if (selbst && !takt2) takt2 = setInterval(schalten, 2600); }, onEnterBack: function () { if (selbst && !takt2) takt2 = setInterval(schalten, 2600); },
        onLeave: function () { clearInterval(takt2); takt2 = null; }, onLeaveBack: function () { clearInterval(takt2); takt2 = null; } });
    }
  }

  /* ---------- 9 Baukasten-Schleife ---------- */
  var pool = $('#pool'), turm = $('#turm2');
  if (pool && turm && window.Lego) {
    var STEINE = [
      ['Humor', 'reichweite'], ['Trend-Sound', 'reichweite'], ['Schnelle Schnitte', 'reichweite'], ['Vorher / Nachher', 'reichweite'], ['Fail des Tages', 'reichweite'],
      ['Gründer-Alltag', 'branding'], ['Team zeigen', 'branding'], ['Baustelle', 'branding'], ['Warum wir das machen', 'branding'], ['So entsteht es', 'branding'], ['Ein Kunde erzählt', 'branding'],
      ['Häufigster Fehler', 'leads'], ['Preis erklärt', 'leads'], ['Mythos widerlegt', 'leads'], ['Frage aus der DM', 'leads'], ['Angebot direkt', 'leads']
    ];
    var FARBE = { reichweite: 'blue', branding: 'teal', leads: 'gold' };
    var bauen = function (name, p, u) {
      var w = document.createElement('div'); w.className = 'stein stein--' + FARBE[p]; w.dataset.p = p; w.dataset.name = name;
      var np = Math.max(3, Math.min(7, Math.ceil(name.length / 2.6))); if (np % 2 === 0) np++;
      var svg = Lego.element({ noppen: np, farbe: FARBE[p], text: '', u: u });
      var l = document.createElement('span'); l.className = 'stein__label'; l.textContent = name;
      w.appendChild(svg); w.appendChild(l); return w;
    };
    STEINE.forEach(function (s) { pool.appendChild(bauen(s[0], s[1], 24)); });
    var imTurm = [];
    var mixen = function () { var z = $('#stapelZahl'); if (z) z.textContent = imTurm.length; };
    /* Leiste unten im Handy: laeuft von Rundenstart bis zum Leeren, dann leer bis zur naechsten Runde */
    var leiste = $('.reel-rahmen__leiste i');
    var leisteStart = function (ms) { if (!leiste) return; leiste.style.animation = 'none'; leiste.style.width = '0'; void leiste.offsetWidth; leiste.style.animation = 'laeuft ' + (ms / 1000) + 's linear forwards'; };
    var leisteLeer = function () { if (!leiste) return; leiste.style.animation = 'none'; leiste.style.width = '0'; };
    var poolStein = function (name) { return $$('.stein', pool).filter(function (s) { return s.dataset.name === name; })[0]; };
    /* Stein-Geometrie bei u = 24: Hoehe (1,2 + 0,48 + 0,22) * u, Ueberlappung Deckflaeche + Noppen */
    var U = 24, STEIN_H = 1.9 * U, SCHRITT = STEIN_H - 0.78 * U, MAX = 5;
    /* feste Plaetze: der Stapel von 5 Steinen sitzt mittig, Platz i liegt bei basis + i * SCHRITT ueber dem Boden */
    var platzY = function (i) { var gesamt = STEIN_H + (MAX - 1) * SCHRITT, basis = Math.max(12, (turm.clientHeight - gesamt) / 2); return -(basis + i * SCHRITT); };
    var reinLegen = function (name, p, sofort) {
      var neu = bauen(name, p, U), quelle = poolStein(name), i = $$('.stein', turm).length;
      if (quelle) quelle.classList.add('stein--im-turm');
      turm.appendChild(neu); imTurm.push(p); mixen();
      neu.style.zIndex = 10 + i;
      gsap.set(neu, { bottom: 0, y: platzY(i) });
      if (sofort || !sanft || !quelle) return;
      /* Flug: ein Klon startet auf dem Stein im Haufen, fliegt nach rechts hinter das Handy;
         dort taucht der echte Stein von oben in seinen Platz */
      gsap.set(neu, { opacity: 0 });
      if (!pool.offsetParent) { /* Haufen ausgeblendet (Handy): kein Flug, nur von oben herein */
        gsap.fromTo(neu, { opacity: .35, y: platzY(i) - 300 }, { opacity: 1, y: platzY(i), duration: .85, ease: 'power2.out' }); return; }
      var buehne = pool.closest('.kasten2'), br = buehne.getBoundingClientRect();
      var a = quelle.querySelector('svg').getBoundingClientRect(), z = neu.querySelector('svg').getBoundingClientRect(), hr = turm.closest('.reel-rahmen').getBoundingClientRect();
      var k = neu.cloneNode(true); k.removeAttribute('style'); k.className = 'stein stein--' + FARBE[p] + ' flug'; buehne.appendChild(k);
      gsap.set(k, { left: a.left - br.left, top: a.top - br.top, width: z.width, height: z.height });
      gsap.to(k, { left: hr.left + hr.width * .35 - br.left, top: hr.top + 70 - br.top, duration: .8, ease: 'power2.in', onComplete: function () {
        k.remove();
        /* von oben herunter, nur leicht eingeblendet */
        gsap.fromTo(neu, { opacity: .35, y: platzY(i) - 300 }, { opacity: 1, y: platzY(i), duration: .85, ease: 'power2.out' });
      } });
    };
    var frei = function () { return STEINE.filter(function (st) { var q = poolStein(st[0]); return q && !q.classList.contains('stein--im-turm'); }); };
    var leeren = function (cb) {
      var kinder = $$('.stein', turm); if (!kinder.length) { cb(); return; }
      leisteLeer();
      gsap.to(kinder, { y: '+=320', opacity: 0, duration: .5, stagger: .05, ease: 'power2.in', onComplete: function () {
        kinder.forEach(function (k) { var q = poolStein(k.dataset.name); if (q) q.classList.remove('stein--im-turm'); k.remove(); });
        imTurm = []; mixen(); cb(); } });
    };
    var runde = function () {
      var n = 3 + Math.floor(Math.random() * 3), f = frei(), wahl = [];
      while (wahl.length < n && f.length) wahl.push(f.splice(Math.floor(Math.random() * f.length), 1)[0]);
      wahl.forEach(function (st, i) { setTimeout(function () { reinLegen(st[0], st[1]); }, i * 650); });
      var d = n * 650 + 1200; leisteStart(d + 3800);
      return d;
    };
    [STEINE[0], STEINE[5], STEINE[11], STEINE[2]].forEach(function (st) { reinLegen(st[0], st[1], true); });
    if (sanft) {
      var timer = null, rundeLaeuft = false;
      var lauf = function (erst) {
        if (!rundeLaeuft) return;
        if (erst) leisteStart(3800);
        timer = setTimeout(function () { leeren(function () { if (!rundeLaeuft) return; timer = setTimeout(function () { if (!rundeLaeuft) return; var d = runde(); timer = setTimeout(lauf, d); }, 1100); }); }, 3800);
      };
      ScrollTrigger.create({ trigger: '#lego', start: 'top 80%', end: 'bottom 20%',
        onEnter: function () { if (!rundeLaeuft) { rundeLaeuft = true; lauf(true); } }, onEnterBack: function () { if (!rundeLaeuft) { rundeLaeuft = true; lauf(true); } },
        onLeave: function () { rundeLaeuft = false; clearTimeout(timer); }, onLeaveBack: function () { rundeLaeuft = false; clearTimeout(timer); } });
    }
  }

  /* ---------- 10 Paket-Szenen ---------- */
  if (hatGsap && sanft && $('.pv')) {
    var p0 = gsap.timeline({ repeat: -1, repeatDelay: .6 });
    p0.fromTo('.pv0rec', { opacity: 1 }, { opacity: .2, duration: .5, yoyo: true, repeat: 5 })
      .fromTo('.pv0bubble', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4 }, 0)
      .fromTo('.pv0schere', { opacity: 0, rotation: -20, transformOrigin: '50% 80%' }, { opacity: 1, rotation: 0, duration: .5 }, 2.2)
      .to('.pv0schere', { rotation: 12, yoyo: true, repeat: 3, duration: .18 }, 2.8)
      .fromTo('.pv0call', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4 }, 3.6)
      .to({}, { duration: 1.2 });
    var p1 = gsap.timeline({ repeat: -1, repeatDelay: .5 });
    p1.fromTo('.pv1pfeil', { opacity: .3, x: -6 }, { opacity: 1, x: 4, duration: .6, yoyo: true, repeat: 1 })
      .fromTo('.pv1clip', { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: .35, stagger: .15 }, .8)
      .fromTo('.pv1cursor', { x: 0 }, { x: 80, duration: 1.4, ease: 'none' }, 1)
      .fromTo('.pv1fertig', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4 }, 2.6)
      .to({}, { duration: 1.4 });
    var p2 = gsap.timeline({ repeat: -1, repeatDelay: .5 });
    p2.fromTo('.pv2klappeOben', { rotation: -25, transformOrigin: '28px 28px' }, { rotation: 0, duration: .25, ease: 'power3.in' })
      .fromTo('.pv2licht', { opacity: .4 }, { opacity: 1, duration: .6, yoyo: true, repeat: 3 }, .3)
      .fromTo('.pv2person', { x: -8 }, { x: 8, duration: 1.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, .3)
      .fromTo('.pv2tag', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4 }, 2.6)
      .to({}, { duration: 1.2 });
  }

  /* ---------- 11 Story-Video, Zitate ---------- */
  var story = $('#storyVideo');
  if (story) {
    var player = $('#storyPlayer');
    var abspielen = function () {
      if (story.classList.contains('story__video--an')) return;
      story.classList.add('story__video--an'); player.hidden = false;
      player.play && player.play().catch(function () {});
    };
    story.addEventListener('click', abspielen);
    story.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abspielen(); } });
  }
  var zitate = $('#zitate');
  if (zitate && hatGsap && sanft) {
    gsap.from('.zitat', { y: 120, opacity: 0, rotation: function (i) { return i % 2 ? 3 : -3; }, stagger: .12, ease: 'none', scrollTrigger: { trigger: zitate, start: 'top 92%', end: 'top 30%', scrub: .5 } });
  }

  /* ---------- Termin-Kalender im Footer ---------- */
  var tg = $('.termin__grid');
  if (tg) {
    var jetzt = new Date(), jahr = jetzt.getFullYear(), monat = jetzt.getMonth(), heute = jetzt.getDate();
    var tage = new Date(jahr, monat + 1, 0).getDate(), erster = (new Date(jahr, monat, 1).getDay() + 6) % 7;
    var mn = $('#terminMonat'); if (mn) mn.textContent = jetzt.toLocaleDateString('de-DE', { month: 'long' });
    var freieTage = {}, kandidaten = [];
    for (var d = heute + 1; d <= tage; d++) { var wt = new Date(jahr, monat, d).getDay(); if (wt >= 1 && wt <= 5) kandidaten.push(d); }
    while (Object.keys(freieTage).length < Math.min(5, kandidaten.length)) freieTage[kandidaten[Math.floor(Math.random() * kandidaten.length)]] = 1;
    for (var e = 0; e < erster; e++) { var l = document.createElement('i'); l.className = 'leer'; tg.appendChild(l); }
    for (var d2 = 1; d2 <= tage; d2++) { var c = document.createElement('i'); c.textContent = d2; if (freieTage[d2]) c.className = 'frei'; if (d2 === heute) c.className = 'heute'; tg.appendChild(c); }
  }

  /* ---------- Preiskarte ---------- */
  if (hatGsap && sanft && $('#toolpreis')) {
    gsap.from('#toolpreis', { y: 90, opacity: 0, scale: .96, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#toolpreis', start: 'top 88%', once: true } });
  }

  /* ---------- Matrix ---------- */
  if (hatGsap && sanft && $('#matrix')) {
    gsap.from('#matrix .matrix__punkt--du, #matrix .matrix__punkt--wir', { scale: 0, duration: .5, stagger: .07, ease: 'back.out(2)', scrollTrigger: { trigger: '#matrix', start: 'top 80%', once: true } });
  }

  /* ---------- Reveal ---------- */
  if (hatGsap && sanft) {
    $$('.rv').forEach(function (el) { gsap.from(el, { y: 24, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }); });
    ScrollTrigger.refresh();
  }
})();
