/* =============================================================================
   Loop Studio — Legosteine fuers Web
   -----------------------------------------------------------------------------
   Port von  quelle/lego_bauen.py.  Dieselbe Geometrie, dieselben Lichtwerte,
   dieselbe Zeichenreihenfolge — damit ein Stein auf der Webseite und ein Stein
   im PDF derselbe Stein sind.

   Echte Lego-Masse (Quelle: brickowl.com/help/stud-dimensions):
       Rastermass (Noppenabstand)   8,0 mm  -> 1 U
       Steinhoehe ohne Noppe        9,6 mm  -> 1,20 U
       Plattenhoehe                 3,2 mm  -> 0,40 U
       Noppendurchmesser            4,8 mm  -> 0,60 U
       Noppenhoehe                  1,8 mm  -> 0,22 U

   Projektion: schiefwinklig (Kavalier), NICHT isometrisch. Die Frontflaeche
   bleibt achsenparallel, damit die Beschriftung unverzerrt lesbar ist.

   Die vier Sachen, an denen ein gezeichneter Stein sonst scheitert — alle
   im Render nachgemessen, ausfuehrlich in lego_bauen.py dokumentiert:
     1. Deckflaeche ZUERST, Noppen komplett darauf. Andersherum sieht man nur
        Scheiben hinter der Hinterkante hervorlugen: "aufgeklebt".
     2. Der Noppenzylinder ist EIN Pfad mit durchgehender Kontur, kein
        konturloses Rechteck mit Deckel drauf.
     3. Noppen-Ellipse 1 : 0,48 (= Stauchung der Deckflaeche), nicht die
        rechnerisch exakten 1 : 0,31. Rechnerisch korrekt sieht falsch aus.
     4. Fase: ein helles Band an jeder Oberkante. Ohne sie wirkt jeder
        Koerper wie Karton.

   Keine Filter, keine Verlaeufe, KEIN box-/text-/drop-shadow. Tiefe kommt
   ausschliesslich aus Flaechen und Kanten.

   Animation: FLIP (First-Last-Invert-Play) ueber die Web Animations API.
   Begruendung siehe web/README.md — kurz: die Seite ist komplett
   selbsttragend (keine einzige externe Ressource), und GSAP Flip koennte
   hier nichts, was 60 Zeilen WAAPI nicht auch koennen.

   Oeffentliche API siehe unten bei "return" bzw. web/README.md.
   ========================================================================== */
(function (global, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory(global);
  else global.Lego = factory(global);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (global) {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------------------------------------------------------------- Geometrie
     Alles in Vielfachen von U = Rastermass (Noppenmitte zu Noppenmitte). */
  var PX       = 0.46;   /* Tiefenvektor je Noppenreihe, x-Anteil (nach rechts) */
  var PY       = 0.48;   /* Tiefenvektor je Noppenreihe, y-Anteil (nach oben)   */
  var H_STEIN  = 1.20;   /* Koerperhoehe eines Steins   (9,6 / 8,0)             */
  var H_PLATTE = 0.40;   /* Koerperhoehe einer Platte   (3,2 / 8,0)             */
  var R_NOPPE  = 0.30;   /* Noppenradius                (4,8 / 2 / 8,0)         */
  var H_NOPPE  = 0.22;   /* Noppenhoehe                 (1,8 / 8,0)             */
  var FASE     = 0.055;  /* Breite der Abschraegung (echt: 0,3 mm von 8 mm)     */
  var KANTE    = 0.018;  /* Konturstaerke                                       */

  /* Noppen-Ellipse. Bewusste Abweichung von der Projektionsmathematik:
     exakt gerechnet kaeme 1 : 0,31 heraus — flache, schraeg liegende Tic-Tacs.
     In einer echten Ansicht von schraeg oben mit Hoehenwinkel a hat die Noppe
     das Verhaeltnis sin(a), bei 32-37 Grad also rund 1 : 0,55. Wir nehmen
     dieselbe Stauchung wie die Deckflaeche, dann bleibt ringsum genau der
     Rand von 0,2 U stehen, den ein echter Stein hat. */
  var RX_N  = 1.0;
  var RY_N  = PY;
  var ROT_N = -7.0;      /* Neigung in Grad, nimmt die Scherung nur an */

  /* Beruehrpunkt der senkrechten Tangente an die gedrehte Ellipse — dort
     sitzen die beiden Mantellinien des Noppenzylinders. */
  var _ph  = ROT_N * Math.PI / 180;
  var TX_N = Math.sqrt(Math.pow(RX_N * Math.cos(_ph), 2) +
                       Math.pow(RY_N * Math.sin(_ph), 2));
  var TY_N = (RY_N * RY_N - RX_N * RX_N) * Math.sin(_ph) * Math.cos(_ph) / TX_N;
  /* Halbe Hoehe der gedrehten Ellipse — fuer die Bounding-Box gebraucht. */
  var BY_N = Math.sqrt(Math.pow(RX_N * Math.sin(_ph), 2) +
                       Math.pow(RY_N * Math.cos(_ph), 2));

  /* ------------------------------------------------------------- Farbmischung
     Jede Grundfarbe bekommt einen HELL- und einen DUNKEL-Anker, zwischen denen
     alle Flaechentoene liegen. Nicht gegen reines Weiss/Schwarz mischen: das
     entsaettigt und macht aus Navy Grau und aus Sand Schlamm.
     `versatz` verschiebt die ganze Lichtkurve nach unten. Helle Grundfarben
     brauchen das: heller als Sand geht kaum noch, also wandert der Markenton
     auf die DECKFLAECHE und alles darunter wird abgestuft. Ohne den Versatz
     liegen Deck, Noppendeckel und Front bei Sand nur 3 bis 6 Stufen
     auseinander und die Noppen verschwinden als blasse Geister. */
  var WEISS = '#FFFFFF';

  var GRUND = {
    /*        Basis      hell       dunkel     Schrift    versatz */
    navy:  ['#243060', '#C6CDE8', '#0A0E22', '#FFFFFF', 0.00],
    blue:  ['#4D8EF7', '#DCEAFE', '#15295A', '#FFFFFF', 0.00],
    teal:  ['#74C19E', '#DFF2E9', '#1D4534', '#12301F', 0.04],
    sand:  ['#E9E0CE', '#FBF7EF', '#8A7A5C', '#5A503F', 0.30],
    creme: ['#F4EFE6', '#FFFFFF', '#A08E70', '#5A503F', 0.34],
    /* gold ist NICHT im Marken-Set. Steht hier nur, weil die Leads-Pillar auf
       consulting-entwurf.html sie bereits benutzt. Im Zweifel navy nehmen. */
    gold:  ['#D9A64A', '#F7E6C6', '#4A3208', '#3A2708', 0.14]
  };

  /* Lichtmodell: wie weit jede Flaeche vom Grundton weg liegt.
     positiv = Richtung hell-Anker, negativ = Richtung dunkel-Anker. */
  var LICHT = {
    seite:   -0.42,   /* rechte Seitenflaeche, dunkelste grosse Flaeche */
    front:    0.00,   /* Grundfarbe                                    */
    sockel:  -0.26,   /* dunkles Band an der Unterkante der Front      */
    fase:     0.24,   /* helles Band an jeder Oberkante                */
    rand:     0.13,   /* Rand der Deckflaeche, zwischen Front und Deck */
    deck:     0.42,   /* Deckflaechen-Plateau, hellste grosse Flaeche  */
    wand:    -0.10,   /* Noppen-Zylinderwand, steht senkrecht          */
    kopf:     0.58,   /* Noppen-Deckel, zeigt direkt ins Licht         */
    kontakt:  0.15,   /* Kontaktring der Noppe auf der Deckflaeche     */
    kante:   -0.66    /* Kontur                                        */
  };

  function hx(c) {
    c = c.replace('#', '');
    return [parseInt(c.substr(0, 2), 16),
            parseInt(c.substr(2, 2), 16),
            parseInt(c.substr(4, 2), 16)];
  }
  function rgb(t) {
    return '#' + t.map(function (v) {
      v = Math.max(0, Math.min(255, Math.round(v)));
      return ('0' + v.toString(16)).slice(-2);
    }).join('').toUpperCase();
  }
  function misch(a, b, f) {
    var ra = hx(a), rb = hx(b);
    return rgb([0, 1, 2].map(function (i) { return ra[i] + (rb[i] - ra[i]) * f; }));
  }

  var _palCache = {};
  function palette(farbe) {
    if (_palCache[farbe]) return _palCache[farbe];
    var g = GRUND[farbe] || GRUND.blue, p = {};
    for (var k in LICHT) {
      if (!Object.prototype.hasOwnProperty.call(LICHT, k)) continue;
      var v = LICHT[k] - g[4];
      p[k] = v >= 0 ? misch(g[0], g[1], Math.min(v, 1))
                    : misch(g[0], g[2], Math.min(-v, 1));
    }
    p.basis = g[0];
    p.schrift = g[3];
    _palCache[farbe] = p;
    return p;
  }

  function f(v) { return String(Math.round(v * 100) / 100); }

  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ----------------------------------------------------------------- Die Noppe
     Kontaktring, Mantel als EIN Pfad, Deckel obendrauf.
     cx, cy = Mitte des Noppenfusses auf der Deckflaeche. */
  function noppe(cx, cy, u, p, k) {
    var r  = R_NOPPE * u,
        h  = H_NOPPE * u,
        rx = RX_N * r, ry = RY_N * r,
        tx = TX_N * r, ty = TY_N * r,
        ct = cy - h,
        e  = f(rx) + ' ' + f(ry) + ' ' + f(ROT_N),
        kon = 'stroke="' + p.kante + '" stroke-width="' + f(k) +
              '" stroke-linejoin="round"',
        mx = cx + u * 0.010, my = cy + u * 0.012;

    return (
      /* Kontaktring: etwas groesser als der Fuss, minimal nach vorn versetzt.
         Er schaut nur als schmale Sichel vorn unter dem Zylinder hervor und
         setzt die Noppe auf die Flaeche — ohne einen einzigen Schatten. */
      '<ellipse cx="' + f(mx) + '" cy="' + f(my) + '" rx="' + f(rx * 1.07) +
        '" ry="' + f(ry * 1.10) + '" fill="' + p.kontakt +
        '" transform="rotate(' + f(ROT_N) + ' ' + f(mx) + ' ' + f(my) + ')"/>' +
      /* Mantel: linke Tangente hoch -> Deckelbogen -> rechte Tangente runter
         -> Bodenbogen. Alle Boegen im Uhrzeigersinn (sweep = 1). */
      '<path d="M' + f(cx - tx) + ',' + f(ct - ty) + ' A' + e + ' 0 1 ' +
        f(cx + tx) + ',' + f(ct + ty) + ' L' + f(cx + tx) + ',' + f(cy + ty) +
        ' A' + e + ' 0 1 ' + f(cx - tx) + ',' + f(cy - ty) + ' Z" fill="' +
        p.wand + '" ' + kon + '/>' +
      /* Deckel */
      '<ellipse cx="' + f(cx) + '" cy="' + f(ct) + '" rx="' + f(rx) +
        '" ry="' + f(ry) + '" fill="' + p.kopf + '" ' + kon +
        ' transform="rotate(' + f(ROT_N) + ' ' + f(cx) + ' ' + f(ct) + ')"/>' +
      /* Die Stirnflaeche ist gegen die Mantelkante minimal abgesetzt. Eine
         zweite, etwas hellere Ellipse bei 0,76 genuegt: ohne sie wirkt der
         Deckel wie eine aufgeklebte Scheibe, mit einem kraeftigen Ring wie
         ein Napf. Also nur eine Fuellung, keine Kontur. */
      '<ellipse cx="' + f(cx) + '" cy="' + f(ct - k * 0.3) + '" rx="' +
        f(rx * 0.76) + '" ry="' + f(ry * 0.72) + '" fill="' +
        misch(p.kopf, WEISS, 0.22) + '" transform="rotate(' + f(ROT_N) + ' ' +
        f(cx) + ' ' + f(ct) + ')"/>'
    );
  }

  /* ----------------------------------------------------------------- Der Stein
     Gibt ein SVG-Fragment zurueck (Pfade, kein <svg>-Rahmen).

     o.x, o.y     linke obere Ecke der FRONTFLAECHE
     o.noppen     Noppen in der Breite  (1x2 -> 2)
     o.tiefe      Noppenreihen in der Tiefe (2x4 -> noppen 4, tiefe 2)
     o.farbe      navy | blue | teal | sand | creme | gold
     o.text       Beschriftung auf der Frontflaeche
     o.u          Rastermass in px
     o.hoehe      Koerperhoehe in U (H_STEIN oder H_PLATTE)
     o.schrift    Schriftgroesse in px, sonst automatisch
     o.ohneNoppen fuer den obersten Stein eines Stapels ohne sichtbare Noppen

     Zeichenreihenfolge — die Haelfte der Wirkung steckt darin:
     Deckflaeche -> Noppen -> Seitenflaeche -> Frontflaeche -> Fasen.
     Beim Stapeln von unten nach oben zeichnen, dann deckt der obere Stein die
     Noppen des unteren ab. In der Reihe von links nach rechts, dann deckt der
     rechte Nachbar die Seitenflaeche des linken ab. */
  function svg(o) {
    o = o || {};
    var u      = o.u || 26,
        noppen = o.noppen || 2,
        tiefe  = o.tiefe || 1,
        hoehe  = (o.hoehe == null ? H_STEIN : o.hoehe),
        farbe  = o.farbe || 'blue',
        x      = o.x || 0,
        y      = o.y || 0,
        p      = palette(farbe),
        b      = noppen * u,
        hf     = hoehe * u,
        dx     = PX * u * tiefe, dy = PY * u * tiefe,
        dxe    = PX * u,         dye = PY * u,
        k      = KANTE * u,
        fase   = FASE * u,
        t      = [],
        kon    = 'stroke="' + p.kante + '" stroke-width="' + f(k) +
                 '" stroke-linejoin="miter"';

    /* 1 Deckflaeche: Rand + eingesetztes Plateau = die Fase oben */
    t.push('<path d="M' + f(x) + ',' + f(y) + ' l' + f(dx) + ',' + f(-dy) +
           ' h' + f(b) + ' l' + f(-dx) + ',' + f(dy) + ' Z" fill="' + p.rand +
           '" ' + kon + '/>');
    var hyp = Math.sqrt(PX * PX + PY * PY),
        ix  = fase * PX / hyp, iy = fase * PY / hyp;
    t.push('<path d="M' + f(x + fase + ix) + ',' + f(y - iy) + ' l' +
           f(dx - 2 * ix) + ',' + f(-(dy - 2 * iy)) + ' h' + f(b - 2 * fase) +
           ' l' + f(-(dx - 2 * ix)) + ',' + f(dy - 2 * iy) + ' Z" fill="' +
           p.deck + '"/>');

    /* 2 Noppen, hintere Reihe zuerst */
    if (!o.ohneNoppen) {
      for (var reihe = tiefe - 1; reihe >= 0; reihe--) {
        var bt = reihe + 0.5;
        for (var i = 0; i < noppen; i++) {
          t.push(noppe(x + (i + 0.5) * u + bt * dxe, y - bt * dye, u, p, k));
        }
      }
    }

    /* 3 Seitenflaeche rechts (dunkelste Flaeche) + Fase an ihrer Oberkante */
    t.push('<path d="M' + f(x + b) + ',' + f(y) + ' l' + f(dx) + ',' + f(-dy) +
           ' v' + f(hf) + ' l' + f(-dx) + ',' + f(dy) + ' Z" fill="' + p.seite +
           '" ' + kon + '/>');
    t.push('<path d="M' + f(x + b) + ',' + f(y) + ' l' + f(dx) + ',' + f(-dy) +
           ' v' + f(fase) + ' l' + f(-dx) + ',' + f(dy) + ' Z" fill="' +
           p.fase + '"/>');

    /* 4 Frontflaeche: Flaeche, Fase oben, Sockel unten, Kontur zum Schluss
       nochmal drueber, damit die Baender sie nicht anknabbern. */
    t.push('<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(b) +
           '" height="' + f(hf) + '" fill="' + p.front + '" ' + kon + '/>');
    t.push('<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(b) +
           '" height="' + f(fase) + '" fill="' + p.fase + '"/>');
    t.push('<rect x="' + f(x) + '" y="' + f(y + hf - fase * 0.8) + '" width="' +
           f(b) + '" height="' + f(fase * 0.8) + '" fill="' + p.sockel + '"/>');
    t.push('<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(b) +
           '" height="' + f(hf) + '" fill="none" ' + kon + '/>');

    /* 5 Beschriftung */
    if (o.text) {
      var gr = o.schrift || schriftgroesse(o.text, noppen, u);
      t.push('<text x="' + f(x + b / 2) + '" y="' + f(y + hf / 2 + gr * 0.36) +
             '" text-anchor="middle" font-family="' +
             (o.schriftFamilie || 'JetBrains Mono, ui-monospace, monospace') +
             '" font-size="' + f(gr) + '" font-weight="600" letter-spacing="' +
             f(gr * 0.07) + '" fill="' + p.schrift + '">' +
             escHtml(o.text) + '</text>');
    }
    return t.join('');
  }

  /* --------------------------------------------------------------------- Masse
     Bounding-Box eines Steins inklusive Noppen und Tiefe.
     Zurueck: {w, h, ox, oy, b, hf, ueber} — an (ox, oy) gezeichnet passt der
     Stein exakt in eine viewBox "0 0 w h". */
  function masse(o) {
    o = o || {};
    var u      = o.u || 26,
        noppen = o.noppen || 2,
        tiefe  = o.tiefe || 1,
        hoehe  = (o.hoehe == null ? H_STEIN : o.hoehe),
        pad    = KANTE * u * 1.5,
        b      = noppen * u,
        hf     = hoehe * u,
        deckOben = tiefe * PY * u,
        noppenOben = (tiefe - 0.5) * PY * u + H_NOPPE * u + BY_N * R_NOPPE * u,
        ueber  = o.ohneNoppen ? deckOben : Math.max(deckOben, noppenOben);

    return {
      u: u, b: b, hf: hf, ueber: ueber, pad: pad,
      w: b + tiefe * PX * u + 2 * pad,
      h: hf + ueber + 2 * pad,
      ox: pad,
      oy: pad + ueber
    };
  }

  /* Gesamtbreite / -hoehe wie in lego_bauen.py (ohne Randzugabe). */
  function breite(noppen, tiefe, u) {
    return noppen * (u || 26) + (tiefe || 1) * PX * (u || 26);
  }
  function hoeheGesamt(hoehe, tiefe, u) {
    u = u || 26;
    return ((hoehe == null ? H_STEIN : hoehe) + (tiefe || 1) * PY + H_NOPPE) * u;
  }

  /* Noppenzahl nach Wortlaenge — nachgerechnet an den Steinen auf Seite 4 des
     Consulting-PDFs (SKRIPTE 5, SHOTLISTE 6, CONTENT-PILLARS 8, B-ROLL 4).
     Die Zahl macht den Rhythmus, nicht die Textbreite: der Text fuellt den
     Stein bewusst nur zu rund einem Drittel. */
  function noppenFuerText(text) {
    var n = Math.round(2.4 + String(text || '').length * 0.36);
    return Math.max(4, Math.min(9, n));
  }

  /* Schriftgroesse: 0,30 U, kleiner nur wenn das Wort sonst anstossen wuerde. */
  function schriftgroesse(text, noppen, u) {
    var len = String(text || '').length || 1;
    return Math.min(u * 0.30, (noppen * u - 0.7 * u) / (len * 0.62));
  }

  /* ------------------------------------------------------- Fertiges <svg> ---- */
  function svgRahmen(o) {
    var m = masse(o);
    var inner = svg(assign({}, o, { x: m.ox, y: m.oy }));
    return '<svg xmlns="' + SVGNS + '" class="lego-svg" viewBox="0 0 ' +
           f(m.w) + ' ' + f(m.h) + '" width="' + f(m.w) + '" height="' + f(m.h) +
           '" role="img" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }

  /* Als echter Knoten — innerHTML ist auf SVG-Elementen nicht ueberall
     zuverlaessig, DOMParser schon. */
  function element(o) {
    var doc = new DOMParser().parseFromString(svgRahmen(o), 'image/svg+xml');
    return document.importNode(doc.documentElement, true);
  }

  /* Zeichnet einen Stein in ein beliebiges Element (leert es vorher). */
  function zeichne(ziel, o) {
    if (typeof ziel === 'string') ziel = document.querySelector(ziel);
    if (!ziel) return null;
    while (ziel.firstChild) ziel.removeChild(ziel.firstChild);
    var el = element(o);
    ziel.appendChild(el);
    return el;
  }

  function assign(z) {
    for (var i = 1; i < arguments.length; i++) {
      var q = arguments[i];
      if (!q) continue;
      for (var k in q) if (Object.prototype.hasOwnProperty.call(q, k)) z[k] = q[k];
    }
    return z;
  }

  /* =========================================================================
     ANIMATION

     Technik: FLIP (First - Last - Invert - Play) ueber die Web Animations API.
     Nur `transform` und `opacity` werden animiert, beides laeuft im Compositor.

     Warum nicht View Transitions: es kann immer nur EINE Transition gleich-
     zeitig laufen. Wer zwei Steine schnell hintereinander anklickt, bricht die
     erste ab und der Stein springt. Genau der Fall, den ein Baukasten dauernd
     produziert.
     Warum nicht GSAP: die Seite laedt keine einzige externe Datei. Der
     Mehrwert von Flip (absolute:true bei Flex/Grid-Reflow, nested, spin)
     kommt hier nicht vor — geflogen wird ein fixed positionierter Klon von
     Rechteck A nach Rechteck B.
     ====================================================================== */

  var RM = null;
  function reduziert() {
    if (RM === null && global.matchMedia) {
      RM = global.matchMedia('(prefers-reduced-motion: reduce)');
    }
    return RM ? RM.matches : false;
  }

  function kannAnimieren(el) {
    return !!(el && el.animate) && !reduziert();
  }

  /* Ein Klon fliegt von Rechteck a nach Rechteck b und rastet ein.
     Beide Steine haben dieselbe Noppenzahl, der Groessenunterschied ist also
     eine reine, verzerrungsfreie Skalierung. */
  function flug(markup, a, b, opt) {
    opt = opt || {};
    var huelle = document.createElement('div');
    huelle.className = 'lego-flug';
    huelle.setAttribute('aria-hidden', 'true');
    huelle.innerHTML = markup;
    huelle.style.left   = b.left + 'px';
    huelle.style.top    = b.top + 'px';
    huelle.style.width  = b.width + 'px';
    huelle.style.height = b.height + 'px';
    document.body.appendChild(huelle);

    var s0 = b.width ? a.width / b.width : 1,
        dx = (a.left + a.width / 2) - (b.left + b.width / 2),
        dy = (a.top + a.height / 2) - (b.top + b.height / 2),
        /* Bogen: der Stein wird auf halbem Weg angehoben, wie von Hand
           herausgenommen und hinuebergesetzt. */
        bogen = Math.min(46, Math.max(14, Math.abs(dx) * 0.10 + 14)),
        dreh  = opt.dreh == null ? (dx > 0 ? 4 : -4) : opt.dreh,
        dauer = opt.dauer || 540;

    var anim = huelle.animate([
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + s0 +
                   ') rotate(' + dreh + 'deg)',
        offset: 0, easing: 'cubic-bezier(.35,.02,.36,.62)' },
      { transform: 'translate(' + (dx * 0.42) + 'px,' +
                   (dy * 0.42 - bogen) + 'px) scale(' + ((s0 + 1) / 2) +
                   ') rotate(' + (dreh * 0.35) + 'deg)',
        offset: 0.5, easing: 'cubic-bezier(.5,0,.2,1)' },
      /* kurz ueber dem Ziel stehen bleiben ... */
      { transform: 'translate(0px,' + (-b.height * 0.14) +
                   'px) scale(1.015) rotate(0deg)',
        offset: 0.8, easing: 'cubic-bezier(.6,0,.9,1)' },
      /* ... und einrasten. */
      { transform: 'translate(0px,0px) scale(1) rotate(0deg)', offset: 1 }
    ], { duration: dauer, fill: 'forwards' });

    anim.finished.catch(function () {}).then(function () {
      if (huelle.parentNode) huelle.parentNode.removeChild(huelle);
      if (opt.fertig) opt.fertig();
    });
    return anim;
  }

  /* =========================================================================
     BAUKASTEN — Auswahl links, Stapel rechts
     ====================================================================== */

  var VORGABE = {
    u:            22,      /* Rastermass der Auswahl-Steine in px            */
    uStapel:      0,       /* 0 = automatisch aus der Kastengroesse          */
    uStapelMax:   30,
    uStapelMin:   9,
    hoeheMax:     430,     /* Bauhoehe des Kastens in px; darunter wird das
                              Rastermass kleiner statt der Turm hoeher.
                              Ueberschreibbar per data-lego-hoehe am Stapel.  */
    tiefe:        1,
    hoehe:        H_STEIN,
    /* Laeuferverband: Versatz zwischen zwei Lagen, in Noppen. 1 = eine
       ganze Noppe, wie eine gemauerte Wand und wie mauer() im PDF-Skript.
       0 = buendiger Turm wie die Paket-Tuerme auf Seite 4. Alles
       dazwischen legt nur einen Splitter der Deckflaeche frei und sieht
       nach Rendering-Fehler aus — entweder ganz oder gar nicht. */
    versatz:      1,
    /* Noppenzahl im Stapel. 'einheitlich' (Vorgabe) nimmt fuer JEDEN Stein
       die groesste Noppenzahl des Kastens — dann steht ein sauberer Turm wie
       die Paket-Tuerme auf Seite 4 des Consulting-PDFs, und kein schmaler
       Stein traegt einen breiten. 'eigen' laesst jedem Stein seine Breite,
       eine Zahl setzt sie fest. */
    stapelNoppen: 'einheitlich',
    maxSteine:    0,       /* 0 = unbegrenzt                                 */
    dauerFlug:    540,
    dauerSetzen:  340,
    schriftFamilie: 'JetBrains Mono, ui-monospace, monospace',
    aufAenderung: null,    /* function(zustand)                              */
    aufGrenze:    null     /* function(max) — wenn maxSteine erreicht ist    */
  };

  function initBaukasten(wurzel, opt) {
    if (typeof wurzel === 'string') wurzel = document.querySelector(wurzel);
    if (!wurzel) return null;

    var o = assign({}, VORGABE, opt || {});
    var kasten = wurzel.querySelector('[data-lego-auswahl]') || wurzel;
    var platte = wurzel.querySelector('[data-lego-stapel]');
    var leer   = wurzel.querySelector('[data-lego-leer]');
    if (!platte) return null;

    platte.classList.add('lego-stapel');
    if (!platte.getAttribute('aria-live')) platte.setAttribute('aria-live', 'polite');

    var steine = [];    /* alle waehlbaren Steine, in DOM-Reihenfolge */
    var stapel = [];    /* die gewaehlten, von unten nach oben        */
    var filter = 'alle';

    /* ------------------------------------------------ Steine aus dem DOM lesen */
    var knoepfe = kasten.querySelectorAll('[data-lego-stein]');
    Array.prototype.forEach.call(knoepfe, function (knopf, i) {
      var text   = knopf.getAttribute('data-text') || knopf.textContent.trim();
      var noppen = parseInt(knopf.getAttribute('data-noppen'), 10) ||
                   noppenFuerText(text);
      var s = {
        id:     knopf.getAttribute('data-id') || ('stein-' + i),
        text:   text,
        farbe:  knopf.getAttribute('data-farbe') || 'blue',
        gruppe: knopf.getAttribute('data-gruppe') || '',
        noppen: noppen,
        knopf:  knopf,
        kachel: null,   /* <div> im Stapel */
        an:     false
      };
      knopf.classList.add('lego-stein');
      knopf.setAttribute('type', 'button');
      knopf.setAttribute('aria-pressed', 'false');
      if (!knopf.getAttribute('aria-label')) knopf.setAttribute('aria-label', text);
      knopf.innerHTML = '';
      knopf.appendChild(element({
        noppen: s.noppen, farbe: s.farbe, text: s.text, u: o.u,
        tiefe: o.tiefe, hoehe: o.hoehe, schriftFamilie: o.schriftFamilie
      }));
      knopf.addEventListener('click', function (ev) {
        ev.preventDefault();
        umschalten(s);
      });
      steine.push(s);
    });

    /* --------------------------------------------------------------- Umschalten */
    function umschalten(s) {
      if (s.an) abwaehlen(s); else waehlen(s);
    }

    function waehlen(s) {
      if (s.an) return;
      if (o.maxSteine && stapel.length >= o.maxSteine) {
        if (o.aufGrenze) o.aufGrenze(o.maxSteine);
        return;
      }
      s.an = true;
      s.knopf.setAttribute('aria-pressed', 'true');
      var start = s.knopf.getBoundingClientRect();

      stapel.push(s);
      s.kachel = kachelBauen(s);
      platte.appendChild(s.kachel);

      zeichneStapel({ neu: s, startRechteck: start });
      melden();
    }

    function abwaehlen(s) {
      if (!s.an) return;
      s.an = false;
      s.knopf.setAttribute('aria-pressed', 'false');
      var von = s.kachel ? s.kachel.getBoundingClientRect() : null;
      var kachel = s.kachel;

      stapel.splice(stapel.indexOf(s), 1);
      s.kachel = null;

      if (kachel && kachel.parentNode) kachel.parentNode.removeChild(kachel);
      zeichneStapel();

      /* Rueckflug: erst nach dem Neuzeichnen messen, sonst zeigt der Knopf
         noch auf seine alte Position. */
      if (von && kannAnimieren(platte)) {
        var nach = s.knopf.getBoundingClientRect();
        if (sichtbar(nach) && sichtbar(von)) {
          s.knopf.classList.add('lego-stein--faehrt');
          /* Der Rueckflug traegt die AUSWAHL-Fassung des Steins (eigene
             Noppenzahl, Rastermass des Kastens): gelandet wird punktgenau,
             und genau dort schaut das Auge hin. Beim Abheben faellt der
             Unterschied nicht auf. */
          flug(svgRahmen({ noppen: s.noppen, farbe: s.farbe, text: s.text,
                           u: o.u, tiefe: o.tiefe, hoehe: o.hoehe,
                           schriftFamilie: o.schriftFamilie }), von, nach, {
            dauer: o.dauerFlug,
            dreh: -3,
            fertig: function () {
              s.knopf.classList.remove('lego-stein--faehrt');
            }
          });
        }
      }
      melden();
    }

    function kachelBauen(s) {
      var d = document.createElement('div');
      d.className = 'lego-kachel';
      d.setAttribute('data-lego-id', s.id);
      return d;
    }

    var letztesU = o.u;

    /* Noppenzahl, mit der ein Stein IM STAPEL gezeichnet wird. */
    var stapelNoppen = (function () {
      if (typeof o.stapelNoppen === 'number') return o.stapelNoppen;
      if (o.stapelNoppen === 'eigen') return 0;
      var max = 0;
      steine.forEach(function (s) { max = Math.max(max, s.noppen); });
      return max || 6;
    })();

    function noppenIm(s) { return stapelNoppen || s.noppen; }

    function steinMarkup(s, u) {
      return svgRahmen({
        noppen: noppenIm(s), farbe: s.farbe, text: s.text, u: u,
        tiefe: o.tiefe, hoehe: o.hoehe, schriftFamilie: o.schriftFamilie
      });
    }

    /* ------------------------------------------------------- Stapel zeichnen
       Jeder Stein ist ein eigenes, absolut positioniertes <div> mit eigenem
       <svg>. Vorteile gegenueber einem grossen SVG:
         · z-Reihenfolge kommt gratis aus der DOM-Reihenfolge (unten zuerst),
           dadurch deckt der obere Stein die Noppen des unteren ab;
         · FLIP rechnet in CSS-Pixeln statt in SVG-Nutzerkoordinaten;
         · jeder Stein laesst sich einzeln animieren.                        */
    function zeichneStapel(rein) {
      var n = stapel.length;
      if (leer) leer.hidden = n > 0;
      if (n === 0) { platte.style.height = ''; letztesU = o.u; return; }

      /* Die Hoehe des Stapels setzen wir selbst — clientHeight waere also
         unsere eigene Rechnung von eben. Die Obergrenze kommt darum aus der
         Option bzw. aus data-lego-hoehe, nicht aus dem Layout. */
      var kw = platte.clientWidth || 320;
      var kh = parseInt(platte.getAttribute('data-lego-hoehe'), 10) || o.hoeheMax;

      var maxNoppen = 0;
      for (var i = 0; i < n; i++) maxNoppen = Math.max(maxNoppen, noppenIm(stapel[i]));

      /* Rastermass so, dass der Turm in den Kasten passt. */
      var hProU = n * o.hoehe + (o.tiefe * PY + H_NOPPE + BY_N * R_NOPPE);
      var bProU = maxNoppen + o.tiefe * PX + Math.abs(o.versatz);
      var u = Math.min(o.uStapel || o.uStapelMax,
                       (kh - 6) / hProU,
                       (kw - 6) / bProU);
      u = Math.max(o.uStapelMin, u);
      var uWechsel = Math.abs(u - letztesU) > 0.01;
      letztesU = u;

      var hf    = o.hoehe * u;
      var pad   = KANTE * u * 1.5;
      var ueber = Math.max(o.tiefe * PY * u,
                           (o.tiefe - 0.5) * PY * u + H_NOPPE * u +
                           BY_N * R_NOPPE * u);
      /* Standlinie = Unterkante des Kastens + pad. Darueber n Steinhoehen,
         obendrauf ragen die Noppen des obersten Steins heraus. */
      platte.style.height = Math.ceil(n * hf + ueber + 2 * pad) + 'px';

      /* FIRST — wo steht gerade was */
      var vorher = [];
      for (var a = 0; a < n; a++) {
        vorher[a] = (stapel[a].kachel && stapel[a] !== (rein && rein.neu))
          ? stapel[a].kachel.getBoundingClientRect() : null;
      }

      /* LAST — neu setzen */
      var mitte = kw / 2;
      for (var j = 0; j < n; j++) {
        var s  = stapel[j],
            m  = masse({ noppen: noppenIm(s), tiefe: o.tiefe, hoehe: o.hoehe, u: u }),
            /* Laeuferverband: jede zweite Lage sitzt eine halbe Noppe
               versetzt, wie eine echte Mauer. */
            vx = (j % 2 ? -1 : 1) * o.versatz * 0.5 * u,
            li = Math.round(mitte - m.w / 2 + vx),
            bo = Math.round(j * hf);   /* j = 0 ist unten */

        s.kachel.style.left   = li + 'px';
        s.kachel.style.bottom = bo + 'px';
        s.kachel.style.width  = Math.round(m.w) + 'px';
        s.kachel.style.height = Math.round(m.h) + 'px';
        if (uWechsel || !s.kachel.firstChild) {
          s.kachel.innerHTML = steinMarkup(s, u);
        }
      }

      /* INVERT + PLAY — alles, was sich verschoben hat, gleitet zurueck.
         Von unten nach oben gestaffelt: der Turm setzt sich sichtbar. */
      if (kannAnimieren(platte)) {
        for (var b2 = 0; b2 < n; b2++) {
          var alt = vorher[b2];
          if (!alt) continue;
          var neu = stapel[b2].kachel.getBoundingClientRect();
          var ddx = alt.left - neu.left,
              ddy = alt.top - neu.top,
              ds  = neu.width ? alt.width / neu.width : 1;
          if (Math.abs(ddx) < 0.5 && Math.abs(ddy) < 0.5 &&
              Math.abs(ds - 1) < 0.005) continue;
          stapel[b2].kachel.animate([
            { transform: 'translate(' + ddx + 'px,' + ddy + 'px) scale(' + ds + ')' },
            { transform: 'translate(0,0) scale(1)' }
          ], {
            duration: o.dauerSetzen,
            delay: Math.min(b2 * 18, 120),
            easing: 'cubic-bezier(.22,.8,.3,1)',
            fill: 'backwards'
          });
        }
      }

      /* Der neue Stein fliegt aus der Auswahl herueber. */
      if (rein && rein.neu && rein.neu.kachel) {
        var kachel = rein.neu.kachel;
        var ziel = kachel.getBoundingClientRect();
        if (kannAnimieren(platte) && rein.startRechteck &&
            sichtbar(rein.startRechteck) && sichtbar(ziel)) {
          kachel.style.visibility = 'hidden';
          flug(steinMarkup(rein.neu, u), rein.startRechteck, ziel, {
            dauer: o.dauerFlug,
            fertig: function () {
              kachel.style.visibility = '';
              if (kachel.animate && !reduziert()) {
                kachel.animate([
                  { transform: 'scaleY(.94)', transformOrigin: '50% 100%' },
                  { transform: 'scaleY(1)',   transformOrigin: '50% 100%' }
                ], { duration: 180, easing: 'cubic-bezier(.3,1.6,.5,1)' });
              }
            }
          });
        } else if (kannAnimieren(platte)) {
          /* Ziel ausserhalb des Bildschirms: kein Flug quer durchs Nichts,
             der Stein faellt an Ort und Stelle ein. */
          kachel.animate([
            { transform: 'translateY(' + (-ueber - hf) + 'px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
          ], { duration: 380, easing: 'cubic-bezier(.22,.9,.3,1.05)' });
        }
      }
    }

    function sichtbar(r) {
      var h = global.innerHeight || document.documentElement.clientHeight;
      var w = global.innerWidth || document.documentElement.clientWidth;
      return r.bottom > -20 && r.top < h + 20 && r.right > -20 && r.left < w + 20;
    }

    /* ------------------------------------------------------------------ Filter */
    function filtern(gruppe) {
      filter = gruppe || 'alle';
      steine.forEach(function (s) {
        var aus = filter !== 'alle' && s.gruppe !== filter;
        s.knopf.classList.toggle('lego-stein--aus', aus);
        s.knopf.disabled = aus;
      });
    }

    /* ------------------------------------------------------------------ Melden */
    function zustand() {
      var gruppen = {};
      stapel.forEach(function (s) {
        gruppen[s.gruppe] = (gruppen[s.gruppe] || 0) + 1;
      });
      return {
        anzahl: stapel.length,
        gewaehlt: stapel.map(function (s) {
          return { id: s.id, text: s.text, farbe: s.farbe, gruppe: s.gruppe };
        }),
        gruppen: gruppen,
        filter: filter
      };
    }
    function melden() { if (o.aufAenderung) o.aufAenderung(zustand()); }

    /* --------------------------------------------------------- Fenstergroesse */
    var timer = null;
    function beiResize() {
      clearTimeout(timer);
      timer = setTimeout(function () { zeichneStapel(); }, 120);
    }
    global.addEventListener('resize', beiResize);

    zeichneStapel();
    melden();

    return {
      zustand:      zustand,
      filtern:      filtern,
      waehle:       function (id) {
        steine.forEach(function (s) { if (s.id === id) waehlen(s); });
      },
      entferne:     function (id) {
        steine.forEach(function (s) { if (s.id === id) abwaehlen(s); });
      },
      leeren:       function () {
        stapel.slice().reverse().forEach(abwaehlen);
      },
      zeichneNeu:   function () { zeichneStapel(); },
      steine:       function () { return steine.slice(); },
      zerstoere:    function () {
        global.removeEventListener('resize', beiResize);
        clearTimeout(timer);
      }
    };
  }

  /* ---------------------------------------------------------------- Oeffentlich */
  return {
    VERSION: '1.0.0',

    /* Zeichnen */
    svg:            svg,          /* Fragment an (x, y)                     */
    svgRahmen:      svgRahmen,    /* fertiges <svg> als Markup-String       */
    element:        element,      /* fertiges <svg> als Knoten              */
    zeichne:        zeichne,      /* Stein in ein Element setzen            */
    masse:          masse,
    breite:         breite,
    hoeheGesamt:    hoeheGesamt,
    noppenFuerText: noppenFuerText,
    schriftgroesse: schriftgroesse,
    palette:        palette,
    farben:         Object.keys(GRUND),

    /* Bewegen */
    flug:           flug,
    reduziert:      reduziert,

    /* Baukasten */
    init:           initBaukasten,

    /* Masse (falls jemand danebenrechnen muss) */
    MASS: {
      PX: PX, PY: PY, H_STEIN: H_STEIN, H_PLATTE: H_PLATTE,
      R_NOPPE: R_NOPPE, H_NOPPE: H_NOPPE, FASE: FASE, KANTE: KANTE
    }
  };
});
