# Legosteine fuers Web — Einbau-Anleitung

Modul, das dieselben Steine zeichnet wie die PDFs, plus die Bewegung:
anheben beim Ueberfahren, fliegen beim Klick, einrasten im Stapel.

| Datei | Was drin ist |
|---|---|
| `lego.js` | Steinzeichner (Port von `quelle/lego_bauen.py`) **und** der Baukasten mit Animation. Keine Abhaengigkeit, kein Build. ~19 kB. |
| `lego.css` | Nur die Zustaende: waehlbar, gewaehlt, ausgefiltert, im Stapel, im Flug. Keine Seitentypografie. ~4 kB. |
| `lego-demo.html` | Eigenstaendige Demoseite. Zum Ansehen und zum Abgucken der Markup-Struktur. |

Beides sind normale Dateien ohne Modulsystem: `<script src>` und
`<link rel=stylesheet>` genuegen. `lego.js` haengt `window.Lego` an (UMD, in
Node `module.exports`). Es laedt **nichts** nach — kein CDN, keine Schrift,
kein Bild. Damit funktioniert es auch aus `file://` heraus und in
Chrome headless.

---

## 1 · Einbauen

### Markup

```html
<div id="baukasten" class="lego">

  <div data-lego-auswahl>
    <button data-lego-stein data-text="HUMOR"  data-farbe="blue" data-gruppe="reichweite"></button>
    <button data-lego-stein data-text="TEAM ZEIGEN" data-farbe="teal" data-gruppe="branding"></button>
    <!-- ... -->
  </div>

  <div class="bau">
    <div data-lego-stapel data-lego-hoehe="420"></div>
    <p data-lego-leer>Noch nichts gestapelt.</p>
  </div>

</div>
```

Die Knoepfe duerfen leer sein — `lego.js` setzt das `<svg>` selbst hinein und
ueberschreibt vorhandenen Inhalt. `data-text` ist Pflicht (sonst wird der
Textinhalt genommen).

### Aufruf

```html
<link rel="stylesheet" href="web/lego.css">
<script src="web/lego.js"></script>
<script>
  var kasten = Lego.init('#baukasten', {
    u: 21,
    aufAenderung: function (z) {
      document.getElementById('zahl').textContent = z.anzahl;
      /* z.gruppen = {reichweite: 3, branding: 2, ...} */
    }
  });
</script>
```

`Lego.init(wurzel, optionen)` — `wurzel` ist ein Element oder ein Selektor.
Gibt `null` zurueck, wenn kein `[data-lego-stapel]` darin liegt.

### data-Attribute

| Attribut | Wo | Bedeutung |
|---|---|---|
| `data-lego-auswahl` | Container | Darin wird nach Steinen gesucht. Fehlt er, gilt die Wurzel. |
| `data-lego-stapel` | Container | Hier waechst der Turm. Wird `position:relative` und bekommt eine gerechnete `height`. |
| `data-lego-leer` | beliebig | Platzhalter; wird automatisch per `hidden` ein- und ausgeblendet. |
| `data-lego-hoehe` | am Stapel | Bauhoehe in px (Vorgabe 420). Wird der Turm hoeher, schrumpft das Rastermass statt der Kasten zu wachsen. |
| `data-lego-stein` | `<button>` | Macht das Element zum Stein. |
| `data-text` | Stein | Beschriftung auf der Frontflaeche. |
| `data-farbe` | Stein | `navy` · `blue` · `teal` · `sand` · `creme` (`gold` existiert nur, weil die Leads-Pillar sie heute benutzt — nicht im Marken-Set). |
| `data-gruppe` | Stein | Frei waehlbar, z. B. die Content-Pillar. Steuert `filtern()` und taucht in `zustand().gruppen` auf. |
| `data-noppen` | Stein | Noppenzahl von Hand. Ohne das rechnet `noppenFuerText()` sie aus der Wortlaenge — dieselbe Kurve wie auf Seite 2 des Baukasten-PDFs. |
| `data-id` | Stein | Eigene ID fuer `waehle()` / `entferne()`. Ohne das `stein-0`, `stein-1`, … |

### Optionen

| Option | Vorgabe | Wirkung |
|---|---|---|
| `u` | `22` | Rastermass der **Auswahl**-Steine in px. Ein Stein ist `noppen * u` breit. |
| `uStapel` | `0` | Rastermass im Stapel fest vorgeben. `0` = aus Kastenbreite und `data-lego-hoehe` rechnen. |
| `uStapelMax` / `uStapelMin` | `30` / `9` | Grenzen dieser Rechnung. |
| `hoeheMax` | `430` | Bauhoehe, falls kein `data-lego-hoehe` gesetzt ist. |
| `stapelNoppen` | `'einheitlich'` | `'einheitlich'` gibt jedem Stein im Turm die groesste Noppenzahl des Kastens — sauberer Turm wie die Paket-Tuerme auf Seite 4. `'eigen'` laesst jedem seine Breite (dann traegt aber ein schmaler Stein einen breiten, was nach Fehler aussieht). Oder eine Zahl. |
| `versatz` | `1` | Laeuferverband: Versatz zwischen zwei Lagen in Noppen. `0` = buendiger Turm. **Werte dazwischen nicht nehmen** — sie legen nur einen Splitter der Deckflaeche frei und sehen nach Rendering-Fehler aus. |
| `tiefe` | `1` | Noppenreihen in der Tiefe. |
| `hoehe` | `1.20` | `Lego.MASS.H_STEIN` (Stein) oder `Lego.MASS.H_PLATTE` (Platte). |
| `maxSteine` | `0` | Obergrenze, `0` = keine. Beim Ueberschreiten laeuft `aufGrenze(max)`. |
| `dauerFlug` / `dauerSetzen` | `540` / `340` | Millisekunden. |
| `schriftFamilie` | `'JetBrains Mono, ui-monospace, monospace'` | Landet als `font-family` im `<text>` des SVG. |
| `aufAenderung` | — | `function(zustand)` nach jeder Aenderung, auch beim Start. |
| `aufGrenze` | — | `function(maxSteine)` |

### Was `init` zurueckgibt

```js
kasten.zustand()      // {anzahl, gewaehlt:[{id,text,farbe,gruppe}], gruppen:{}, filter}
kasten.filtern('leads')   // andere Steine ausgrauen und stilllegen; 'alle' hebt auf
kasten.waehle(id)     // programmatisch waehlen (mit Flug)
kasten.entferne(id)   // programmatisch abwaehlen (mit Rueckflug)
kasten.leeren()       // alles zurueck in den Kasten
kasten.zeichneNeu()   // Stapel neu vermessen, z. B. nach einem Layout-Wechsel
kasten.steine()       // alle Steine als Objekte
kasten.zerstoere()    // resize-Listener abmelden
```

---

## 2 · Einzelne Steine zeichnen (ohne Baukasten)

```js
Lego.svgRahmen({noppen: 6, farbe: 'blue', text: 'SKRIPTE', u: 26})  // -> Markup-String
Lego.element({noppen: 6, farbe: 'blue', text: 'SKRIPTE', u: 26})    // -> <svg>-Knoten
Lego.zeichne('#platz', {noppen: 4, farbe: 'teal', u: 20})           // setzt ihn ein
Lego.svg({x: 0, y: 0, noppen: 4, farbe: 'sand'})                    // nur die Pfade
```

Weitere Parameter: `tiefe`, `hoehe`, `schrift` (px, sonst automatisch),
`ohneNoppen` (fuer den obersten Stein eines Stapels), `schriftFamilie`.

Hilfsfunktionen: `Lego.masse(o)` (Bounding-Box inklusive Noppen: `{w,h,ox,oy,b,hf,ueber,pad}`),
`Lego.breite(noppen,tiefe,u)`, `Lego.hoeheGesamt(hoehe,tiefe,u)`,
`Lego.noppenFuerText(text)`, `Lego.palette(farbe)`, `Lego.farben`, `Lego.MASS`.

**Zeichenreihenfolge beachten**, wenn mehrere Steine in EIN SVG sollen:
von unten nach oben und links nach rechts. Nur so deckt der obere Stein die
Noppen des unteren ab und der rechte Nachbar die Seitenflaeche des linken.
Der Baukasten umgeht das, indem jeder Stein ein eigenes `<svg>` in einem
absolut positionierten `<div>` bekommt — die DOM-Reihenfolge macht dann die
Ueberdeckung.

---

## 3 · CSS

Klassen, die `lego.js` selbst vergibt: `.lego-stein`, `.lego-stein--aus`,
`.lego-stein--faehrt`, `.lego-stapel`, `.lego-kachel`, `.lego-flug`,
`.lego-svg`. Dazu `aria-pressed` am Knopf — daran haengt der Zustand
„liegt im Stapel, hier bleibt die Luecke".

Stellschrauben als Custom Properties auf `.lego` (oder `:root`):

```css
.lego {
  --lego-hebung: -5px;                     /* Hub beim Ueberfahren        */
  --lego-tempo: .18s;
  --lego-kurve: cubic-bezier(.2,.8,.3,1);
  --lego-fuge: rgba(255,255,255,.30);      /* Umriss der leeren Stelle    */
  --lego-fuge-fuellung: rgba(255,255,255,.05);
  --lego-flug-z: 9999;
}
```

Auf hellem Grund `class="lego lego--hell"` setzen — das dreht die Fuge auf
Navy statt Weiss.

---

## 4 · Die Animation, und warum genau diese

Gewaehlt: **FLIP (First–Last–Invert–Play) ueber die Web Animations API**,
ohne Bibliothek. Animiert werden ausschliesslich `transform` und `opacity`,
beides laeuft im Compositor.

* **Anheben beim Ueberfahren** — reines CSS, `transform: translateY()`.
* **Flug in den Stapel** — beim Klick wird die Position des Auswahl-Steins
  gemessen, der Stein in den Stapel einsortiert, die Zielposition gemessen,
  und ein `position:fixed`-Klon fliegt von A nach B: Bogen nach oben, leichte
  Drehung, kurz ueber dem Ziel stehen bleiben, einrasten, dazu ein 180-ms-Stauchen
  beim Aufsetzen. Der Klon traegt die **Ziel**-Fassung des Steins, damit die
  Landung pixelgenau ist; die Skalierung ist verzerrungsfrei, weil beide
  Fassungen dieselbe Noppenzahl haben.
* **Stapel setzt sich** — beim Einfuegen ruecken alle vorhandenen Steine hoch
  (und werden kleiner, wenn der Turm waechst). Vorher/nachher messen, Differenz
  als Starttransform setzen, wegtweenen, von unten nach oben um je 18 ms
  versetzt. Das ist die Welle, die den Turm „sich setzen" laesst.
* **Rueckflug** — spiegelbildlich; der Klon traegt hier die Auswahl-Fassung.

Verworfen, mit Grund:

* **View Transitions API** (`document.startViewTransition`) — same-document
  ist inzwischen ueberall da (Chrome 111+, Safari 18+, Firefox 144+), aber es
  kann immer nur **eine** Transition gleichzeitig laufen. Wer zwei Steine kurz
  hintereinander anklickt, bricht die erste ab und der Stein springt. Genau
  das produziert ein Baukasten dauernd. Ausserdem laesst sich eine Gruppe
  nicht sauber staffeln.
* **GSAP + Flip-Plugin** — kann das alles und mehr, aber: die Seite laedt
  heute **keine einzige** externe Datei. Ein CDN-Script wuerde in `file://`
  und in Chrome headless still nicht laden (dieselbe Falle wie bei
  Google-Fonts-Imports), und 70 kB mitzuliefern lohnt fuer vier Uebergaenge
  nicht. Der Mehrwert von Flip (`absolute:true` bei Flex/Grid-Reflow,
  `nested`, `spin`) kommt hier nicht vor: geflogen wird ein fixed
  positionierter Klon von Rechteck A nach Rechteck B.
  Sollte die Seite spaeter ohnehin GSAP laden, ist `flug()` in `lego.js` die
  einzige Stelle, die man tauschen muesste.

### prefers-reduced-motion

Wird respektiert, und zwar in beiden Ebenen: `lego.css` schaltet die
Transitions ab, `lego.js` legt gar keinen Flugklon erst an — der Stein steht
sofort an seinem Platz. Nachgemessen mit
`--force-prefers-reduced-motion`: 0 Klone, Kachel sofort sichtbar.

---

## 5 · Einbau in `consulting-entwurf.html`

Der Abschnitt `<section id="lego">` hat heute zwei Baustellen:

1. **Die Auswahl** (`.bloecke` / `.block`, CSS um Zeile 291) sind flache
   Kaestchen mit zwei Quadraten obendrauf. Die CSS-Regeln `.block`,
   `.block::before/::after`, `.block--an`, `.block--aus` fallen weg;
   die `<button class="block">` bekommen `data-lego-stein`, `data-text`,
   `data-farbe`, `data-gruppe` (aus dem heutigen `data-p`).
2. **Der Stapel** (`#stapel`) benutzt bereits einen inline eingebauten Port
   desselben Python-Skripts (`var LG = (function(){…})()`, um Zeile 1206) samt
   `svgGruppe()` und der Stapel-Zeichenroutine. Das kann komplett raus —
   `lego.js` ersetzt es. `#stapel` bekommt `data-lego-stapel`, der
   `<p class="stapel__leer">` bekommt `data-lego-leer`.

Die vorhandene Auswertung (`#blockZahl`, die drei `.mix__bar`, der Text in
`#rezept`) haengt sich an `aufAenderung(z)` und liest `z.anzahl` und
`z.gruppen`. Die Pillar-Tabs rufen `kasten.filtern(…)`.

Farbzuordnung wie bisher: `reichweite → blue`, `branding → teal`,
`leads → gold`. Wenn `gold` raus soll (es steht nicht im Marken-Set),
ist `navy` der naheliegende Ersatz.

**Zwei Fallen beim Einbau:**

* Auf schmalen Schirmen muss die Spalte, in der die Auswahl liegt,
  `minmax(0,1fr)` sein und nicht `1fr` — sonst waechst die Grid-Spalte auf die
  Breite des breitesten Steins, zieht den Container mit und der Stapel daneben
  laeuft aus dem Bild. (`lego.css` deckelt die Steine zusaetzlich mit
  `max-width:100%`.)
* Steht der Stapel auf dem Handy **unter** der Auswahl, ist das Ziel beim
  Klick oft ausserhalb des Bildschirms. Dann laesst `lego.js` den Flug
  bewusst weg und der Stein faellt an Ort und Stelle ein — ein Klon, der quer
  durchs Nichts fliegt, hilft niemandem. Wer mehr will, scrollt vor dem
  `waehle()` den Stapel in den Blick.

---

## 6 · Nachpruefen

```bash
cd "/Users/christianarns/Projekte/03_Loop Studio/PDFs/Consulting/web"
python3 -m http.server 8731            # Schriften laden nur ueber http oder file://
open http://127.0.0.1:8731/lego-demo.html
```

Die Demo kennt `?fuellen=N` — setzt N Steine ohne Klick, praktisch fuer
Screenshots.

Chrome headless klemmt Fenster unter 500 px auf 500 px hoch. Ein echter
390-px-Test geht nur ueber die Geraeteemulation, nicht ueber
`--window-size=390`.

Vergleichsbilder: `Loop_Studio_Consulting.pdf` Seite 4 und
`../../Baukasten/Baukasten.pdf` Seite 2 — dieselben Steine in gedruckt.

## monster-buehne.html — Werkbank fuer die Monster-Bühne

Steht neben der Demo und baut dieselbe Bühne wie die Sektion `#monster` in
`consulting-entwurf.html`: Monster links, Mauer rechts, Messlatte, Geistermauer,
Linie SATT. Zweck ist, die Bühne in voller Auflösung zu bauen, **ohne die
Kundenseite anzufassen** — ist sie fertig, wandern nur das `<svg>` und der
Zeichenteil hinüber.

```bash
open "http://localhost:8081/web/monster-buehne.html?n=8"
```

`?n=8` setzt acht gefütterte Reels ohne Animation — für Screenshots.

Warum eine Werkbank: die Seite scrollt mit `scroll-behavior:smooth`, deshalb
kommt `chrome --headless --screenshot` nie an einer Sektion weiter unten an.
Die Werkbank zeigt die Bühne ganz oben, also braucht es gar keinen Scroll.

**Achtung:** Die Bühne in `consulting-entwurf.html` benutzt den dort *inline*
eingebauten Port `LG.stein(x, y, noppen, farbe, text, u)`, die Werkbank das
Modul `Lego.svg({x, y, noppen, farbe, u})`. Gleicher Renderer, andere Signatur —
beim Übertragen umschreiben.
