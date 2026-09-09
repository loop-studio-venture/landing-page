# Loop Studio — Webseite (Consulting)

Statische Seite, kein Build, keine Abhängigkeiten. `index.html` im Browser öffnen, fertig.

Ziel-URL: `loopstudio.app/consulting`

## Struktur

| | |
|---|---|
| `index.html` | die Seite — Thunder-Schrift inline als base64, alles andere relativ |
| `web/lego.js`, `web/lego.css` | Legostein-Baukasten (Anleitung in `web/README.md`) |
| `web/fonts/` | Inter, JetBrains Mono |
| `web/monster-buehne.html`, `web/lego-demo.html` | Bausteine zum Abgucken, nicht eingebunden |
| `bilder/monster-web.png` | einziges Bild — aus `01_Corporate Design/Monster/`, eigenes Material |

## Herkunft

Fassung 1 (03.09.2026) ist der Stand aus `PDFs/Consulting/consulting-entwurf.html`,
dorthin nach dem Angebots-PDF gebaut und fürs Web überarbeitet. Die Dateien wurden
hierher **verschoben**, nicht kopiert. `consulting-entwurf.VOR-WEB-UEBERARBEITUNG.html`
im Consulting-Ordner ist ein eingefrorener Schnappschuss und findet `web/` seit dem
Umzug nicht mehr — er ist nur noch zum Nachlesen da.

## Marke

Creme `#F4EFE6` · Navy `#243060` · Blau `#4D8EF7` · Türkis `#74C19E`
Thunder (Headlines) · Inter (Text) · JetBrains Mono (Labels)

## Fassung 2 (03.09.2026) — was sich geändert hat

Neuer Look nach der Methode aus dem Video (Referenz wählen, Elemente abgucken,
Text entschlacken): warmes Creme-Editorial statt Navy-Hero, große Thunder-Typo,
Linien statt Schatten, schwebende Nav-Pille, Fakten-Streifen, echter Footer.
Die drei Interaktiv-Module (Monster, Stationen-Rechner, Lego-Baukasten) sind
unverändert aus Fassung 1 übernommen — nur ihr Kleid ist neu.

| Datei | Rolle |
|---|---|
| `web/stil.css` | Basis aus Fassung 1 (aus der HTML herausgelöst) |
| `web/fassung2.css` | das Override, das den neuen Look macht — hier wird gestaltet |
| `web/seite.js` | die Seitenlogik aus Fassung 1, herausgelöst |
| `web/bewegung.js` | Fassung 3: rotierendes Hero-Wort, Parallaxe der Reels, gepinnte Paket-Bühne |
| `bilder/reels/` | sechs Kundenreels von outreel.de, 8-s-Schleifen, stumm, 540×960 (Herkunft: `BILDHERKUNFT.md`) |
| `bilder/logo/` | Farblogo (Nav) und Weißlogo (Footer) |
| `werkzeuge/scrollshots.mjs` | Screenshots an echten Scroll-Positionen über das DevTools-Protokoll — siehe unten |
| `web/fonts/Thunder-BoldLC.woff2` | war vorher base64 in der HTML |

Referenzen: `refero.design` / `styles.refero.design` (Stilrichtung „warm cream
editorial"), Sammlung `design-inspo-bay.vercel.app`, Text-Check
`github.com/ItsssssJack/SlopMonster` (nur englisch, hier nicht eingesetzt).

## Offene Punkte (vorher „Notizen für Martin" auf der Seite)

- Hero rechts: drei Platzhalter statt echter Reels — die Hochformat-Wand ist der wichtigste Beweis.
- Kalender im Schluss-CTA ist Attrappe. Echtes Booking-Tool einbetten.
- Download-Formular ohne Anbindung (Mail-Tool: Martin / Wenzel).
- Impressum und Datenschutz sind leere Links.
- Kundenlogos und ein echter Case (Jansen, Vorher/Nachher mit Zahl) fehlen.
- Foto von Christian bei der Arbeit statt Ziffern-Personas, sobald ein Kunde ein Zitat freigibt.
- Leads-Gold `#D9A64A` im Baukasten steht nicht in der Markenpalette — klären.
- Content-Day Eifel verdient eine eigene Seite.

## Fassung 3 (03.09.2026) — Christians Feedback eingebaut

Vorbild ist `impilo.health` (Refero-Style `b44b0bb2…`): rotierendes Wort im Hero,
Sektionen schieben sich wie Blätter übereinander, eine gepinnte Bühne, in der beim
Scrollen der Inhalt wechselt, ruhiger Schluss. Das Kleid bleibt Loop Studio.

- Nav: Farblogo, kein weißes Hover mehr, beim Scrollen wird die Pille schmaler (860 px) und durchsichtiger.
- Hero: ein Satz statt drei, drei echte Kundenreels als Video, das letzte Wort rotiert (helfen / planen / schneiden / drehen).
- Zahlen-Streifen und Dreier-Kasten sind raus — die Pakete leben in der Paket-Bühne.
- Paket-Bühne (`#pak`): 300 vh hoch, die Bühne bleibt stehen, drei Marken schalten Basis → Editing → Produktion. Rechts ein Handy mit Reel und zwei Schildern „Wer dreht / Wer schneidet", die von Du auf Wir springen. Unter 900 px kein Pinnen, die drei Pakete stehen untereinander.
- Baukasten: Steine kleiner (u = 15), Text darunter statt darauf, sie schweben leicht, Hinweis „Klick die Steine an".
- Footer: klein, ein Strich, liegt hinter der Seite (`position: sticky; bottom: 0`) und wird beim Scrollen aufgedeckt. Dafür ist `body` navy und `.blatt` (alles zwischen Hero und Footer) liegt mit `z-index: 2` davor.

### Falle: Screenshots von sticky/fixed-Seiten

`chrome --headless --screenshot` malt nach einem `scrollTo` sticky- und fixed-Elemente
versetzt — auch bei einer Mini-Testseite mit einem einzigen sticky-Div. Das sieht aus,
als wäre die Seite kaputt; sie ist es nicht. Prüfen deshalb nur so:

```bash
node werkzeuge/scrollshots.mjs http://127.0.0.1:8765/index.html /tmp/shots 1440 900 400 "sel:#pak:1.5" max
```

Positionen: Pixelzahl · `sel:#id:0.5` (Element-Oberkante + halbe Viewporthöhe) · `ende` · `max`.
Server vorher: `python3 -m http.server 8765 --bind 127.0.0.1` im Projektordner.

## Fassung 4 (03.09.2026) — Landingpage fürs ganze Tool

Nicht mehr nur Consulting: die Seite ist das Rebranding von `loopstudio.app`. Struktur eng an
`impilo.health`, Kleid bleibt Loop Studio.

| Datei | Rolle |
|---|---|
| `web/fassung4.css` | Hero-Szene, Tool-Interface, „Lass uns zeigen"-Sequenz, Tool-Preis, Layout-Korrekturen |
| `web/bewegung.js` | komplett neu: Lenis (weiches Scrollen), GSAP + ScrollTrigger, Wort-Einflug, Kasten, Szene, Tool-Ablauf, Sequenz, Paket-Bühne |
| `web/lib/` | `gsap.min.js` 3.12.5 + `ScrollTrigger.min.js` (GreenSock-Standardlizenz, kostenlos), `lenis.min.js` 1.1.18 (MIT). Lokal, kein CDN. |
| `bilder/tool/` | die fünf Screenshots der echten App (aus `Landingpage/assets/screenshots`), Vorlage für den Nachbau |
| `bilder/monster-neugier.png`, `-satt.png`, `-portrait.png` | weitere Posen der Figur, 900 px |

**Was die Seite tut**

1. Hero: links die Szene (Monster + Reel-, Skript-, Kalender-Karte + Steine), alles folgt der Maus in Ebenen, das Monster kippt mit. Klick: es hüpft, beim dritten Klick ist es kurz „satt". Rechts die Headline mit dem gestrichelten Kasten, in dem das letzte Wort wechselt (Skripte / Shotlisten / Content / gepostet) — der Kasten fährt auf die Wortbreite.
2. Darunter das nachgebaute Tool-Interface: URL tippt sich ein, Import, neue Zeile, Skript-Karte schiebt rein, Shotliste, Kalendertermin — Schleife, läuft nur im Sichtfeld.
3. „Lass uns zeigen, [Gespräch buchen] wie das läuft." — gepinnt über 5,6 Bildschirmhöhen: der Button fliegt nach oben rechts, das Navy-Panel steigt, vier Schritte wechseln mit Scroll-Fortschritt (Video, Skript, zwei Handys, Kalender + Balken). Unter 900 px ohne Pinnen, alles untereinander.
4. Dann das Consulting wie in Fassung 3: Monster, Spielregeln, Stationen, Baukasten, Preise (jetzt mit Tool-Karte 15 € davor), Für wen, Downloads, FAQ (+2 Tool-Fragen), Schluss, Footer.

Alle Überschriften fliegen Wort für Wort ein (GSAP, einmalig). `prefers-reduced-motion` schaltet alles ab.

**Prüfen:** `node werkzeuge/scrollshots.mjs http://127.0.0.1:8765/index.html /tmp/shots 1440 900 0 "sel:#zeigen:1.3" "sel:#zeigen:3.2" max` — das Werkzeug meldet jetzt auch JS-Fehler. Die Sequenz ist 5,6 Bildschirmhöhen hoch: Positionen als Vielfache davon wählen, sonst sieht man nur den Anfang.

## Fassung 5 (04.09.2026) — Christians zweite Runde

`web/fassung5.css` liegt zuoberst, `web/seite.js` ist auf Nav, FAQ, Slots und Formular geschrumpft,
alles Bewegte steckt in `web/bewegung.js`.

- Hero: Headline in zwei festen Zeilen (`.zeile`, ab 900 px `nowrap`), springt nicht mehr. Monster ist wieder die Block-Pose.
- Nav: der alte `backdrop-filter` auf der ganzen Leiste war das „Blur" links — weg. Die Pille wird nur noch auf Inhaltsbreite schmaler.
- Tool-Interface: Logo `align-self:flex-start` (war vom Flex-Container gestreckt), mehr Luft.
- Sequenz „Vom gespeicherten Reel [Button] zum fertigen Post.": 520 vh, alles hängt am Scroll-Fortschritt, nichts steht. Button fliegt ab dem ersten Pixel, Satz blendet vor dem Panel aus. Vier Schritte mit eigenen Zeitleisten, die per `.progress()` gescrubbt werden (Reel wandert auf einer Bezier-Kurve ins Tool, Skript schreibt sich mit Stift, Schalter Du→Wir, Kalender 6·4·2 mit Balken in denselben Proportionen). Kein Kasten rechts mehr.
  **Falle:** `transform: translateY(106%)` im CSS plus `yPercent` in GSAP addieren sich — GSAP liest den CSS-Wert als Pixel. Deshalb `.gsap .zeigen__panel{transform:none}` und `gsap.set(panel,{y:0,yPercent:…})`.
- Neu: Gründer-Story mit YouTube-Video (`RoZh2NASzNE`, nocookie, lädt erst beim Klick).
- Monster füttern: Stein fliegt vom Knopf in den Mund (50 % / 47 % des Bildes), Monster kaut und wird pro Stein 1,2 % dicker (max 14). Texte wechseln mit dem Zähler.
- Spielregeln: zwei Spalten Thunder-Zeilen, kein Fließtext. „Und das machen wir nicht" raus.
- Stationen ohne Mengenwahl; das Paket ergibt sich aus den Schaltern.
- Baukasten als Schleife: alle 2,8 s fällt unten ein Stein raus, ein freier fliegt aus dem Pool oben drauf. Text steht auf dem Stein (HTML-Label über der Frontfläche). Neue Namen: „Ein Kunde erzählt", „So entsteht es", „Fail des Tages".
- Preise: Tool-Karte, dann drei Karten mit animierten Linienszenen (Handy + Schere, Schnitt-Timeline, Kamera + Licht + Klappe). Startblock, Tabelle, Hinweise raus.
- Drei Zitate treiben (CSS), keine Preise. „Erste Woche" raus. FAQ auf fünf Fragen, zentriert.
- Seite endet mit abgerundeten Ecken (`.blatt>.sec:last-of-type`, nicht `last-child` — das JSON-LD-Skript ist das letzte Kind), der Footer mit „Der nächste Schritt" wird dahinter aufgedeckt.

## Fassung 6 (04.09.2026) — Christians Handy-Runde

`web/fassung6.css` zuoberst. Preis 20 € statt 15 €, keine Testwoche mehr; der Tool-Button heißt überall
„Loop Studio ausprobieren", „Gespräch buchen" ist der Haupt-CTA (Calendly-Link folgt von Christian).
Kleingedrucktes raus (Hero-Zeile, Kreditkarte, Seitenzahlen, Formular-Untertext), Hero-Eyebrow in die Footer-Zeile.

- Hero: Kasten mit Luft (1,18 em hoch, Wort bei .09 em), Szene bewegt sich auch ohne Maus (`.schwebt` 18 px mit Drehung, Monster `.wippt`, Kreis atmet), Maus-Parallaxe 60 % stärker.
- Tool mobil: `min-width:0` auf den Grid-Kindern, Import-Leiste umbrechend, Skript-Karte darunter in voller Breite.
- Sequenz: Button mobil ausgeblendet, Bindestrich weg, `height:auto` unter 900 px (war der tote Raum).
- Story: Play-Knopf weiß-transparent.
- Monster füttern: drei Frames (`monster-web`, `monster-mund-auf`, `monster-kaut` — FLUX Kontext aus der Block-Pose). Mund geht auf, sobald der Stein fliegt, kaut 0,9 s nach der Landung. Der Stein schrumpft auf 30 % und wird beim Reinfliegen durchsichtig.
- Stationen mobil: Icon und Titel nebeneinander, Schalter rechts oben, Wer-macht-was ausgeblendet, Ergebnis direkt darunter.
- Baukasten: Steine ohne Überlappung.
- Preise: die drei SVG-Szenen sind durch generierte Szenen mit dem Monster ersetzt (`bilder/szene-*.png`).
- Zitate mit den Persona-Fotos aus dem Personas-PDF (Pexels), Rollen statt Größenklassen.
- Downloads: Cover unter dem Text. Footer mobil ohne Aufdecken (der Footer ist höher als der Bildschirm, sticky zeigte nur die untere Hälfte), ohne Logo, zentriert.

Bilder der Runde: `01_Corporate Design/Monster/README.md`, Nachtrag 04.09.

## Fassung 7 (04.09.2026) — Desktop-Runde

`web/fassung7.css` zuoberst. Mehr Luft im Hero, Import-Leiste fest (300 px, nichts springt).

- **Tool-Interface mit drei Screens** (`.tool__screen[data-s]`): Inspiration (URL tippt, neue Zeile), Produktion (Projektansicht nach dem echten App-Screenshot: Projektname, Pillar, Basierend-auf, Skript füllt sich, Shotliste), Planung (Kalender September mit sechs Terminen, der neue hervorgehoben). Die Sidebar wechselt mit. Schleife in `bewegung.js` Abschnitt 5.
  **Falle:** im selben Closure gab es `var zeigen = $('#zeigen')` — die gleichnamige Funktion im Tool-Block wurde überschrieben (`zeigen is not a function`, erst zur Laufzeit der Timeline). Funktion heißt jetzt `screenZeigen`.
- Sequenz: Satz „Du speicherst Reels. Wir machen Posts daraus.", Button darunter, fliegt exakt in den Nav-Button `#navTool` (Lage relativ zur Bühne einmal gemessen, Ziel live aus dem fixed Nav) und blendet beim Andocken aus. Schritt-1-Kachel und Schritt-2-Kästen breiter, Schritt 3 neu (Handy auf Stativ mit REC; Crew mit Kinokamera, Softbox, Tonangel und dem Kunden davor), Schritt 4 Balken unter dem Kalender.
- Story-Video: eingebettet nur über http(s); von `file://` und aus der Vorschau öffnet sich YouTube (Fehler 153 = Player ohne gültigen Referrer).
- Monster: Frames auf gleiche Figurhöhe normiert, Wachsen 0,6 % pro Stein, pulsierender Ring und „← hier klicken" am Knopf.
- Spielregeln ohne Grafik (Trennlinie). Stationen: Produktion startet aus, Hinweiszeile „Klick auf eine Station".
- Baukasten: Text zentriert, Steine mit 3/5/7 Noppen greifen ineinander (`margin-bottom:-7px`), Label tiefer.
- Preise ohne Zwischenzeilen. Fünf Zitate mit Foto unten links und Vornamen (Fabian, Katrin, Harald, Mara, Werner). Downloads: Handbuch links, Workbook rechts, Cover als Seitenstapel mit Loop-Icon und Sticker. Footer: Kontaktkarte mit Christians Foto statt Chips, kürzerer Text.

`werkzeuge/scrollshots.mjs` kennt jetzt `wait:3000` (nur warten, dann Bild) — für Abläufe, die Zeit brauchen.

## Fassung 8 (04.09.2026)

`web/fassung8.css` zuoberst. Hero noch luftiger. Der Satz mit dem fliegenden Button ist raus, die Sequenz
beginnt direkt mit dem Panel (`ablauf(p)` verteilt vier Schritte über den ganzen Scrollweg, 440 vh).

- Tool: `timeScale(.85)`, Labels `inspiration / produktion / planung`; Klick auf die Sidebar springt per `tl.seek(label,false)` dorthin (Callbacks feuern, Screens bleiben konsistent).
- Schritt 3 als HTML-Karten (`.dreh`): „Du drehst" mit Haken, Flip (rotationY) zu „Wir drehen" — Kamera, Licht, Ton, Skripte vorher, du nur vor der Kamera. Der Schalter läuft mit.
- Schritt 4: Kalenderzeilen 50 px, Balken max 72 px unter 404 — keine Überlappung mehr.
- Spielregeln als Wer-macht-was-Matrix (`.matrix`, 9 Zeilen, Punkte poppen beim Scrollen). „Drehen, wenn du willst" halb Du, ganz Wir.
- Stationen: kein Hinweis; ab Sichtbarkeit schalten Produktion und Schnitt alle 2,6 s selbst um, bis der erste Klick kommt.
- Baukasten: Überschrift „Bausteine, die zu dir passen", rechts ein Reel-Rahmen (9:16, Fortschrittsleiste, Herz/Kommentar/Teilen) mit dem Turm mittig drin, u = 24, `margin-bottom:-17px` = Deckfläche + Noppen des Steins darunter → Steine greifen ineinander. Takt 4,2 s, Flug 1,3 s. Balken und Rezept-Text raus.
- „Aussagen, die wir kennen." — Downloads: gleiche Kartenstruktur (Titel, Text, Cover unten), Cover in DIN A4 (210:297), Icon klein oben links in der Gradient-Version. Footer-Satz gekürzt.

## Fassung 9 (04.09.2026)

`web/fassung9.css` zuoberst.

- Nav: „So funktioniert es", „Angebot", Button „Login".
- Kasten: drei Wörter (Content, Skripte, Shotlisten). Der Kasten ist jetzt `inline-grid` mit `align-items:baseline` — das Wort steht auf derselben Grundlinie wie „werden", unabhängig von der Bildschirmgröße. Breite setzt weiter das JS.
- Tool: fährt beim Scrollen von unten hoch (scrub), feste Höhe 640 px; in der Inspiration blendet die letzte Zeile aus, wenn die neue reinkommt; Planung mit 1–30 in 6 × 5 Feldern.
- Sequenz: Panel ohne Seitenrand, oben und unten rund, dickere Punkte. Schritt 3 ohne Fußzeilen, „Upload und Analyse", Schalter transparent.
- Story: Video selbst gehostet (`bilder/story.mp4`, aus dem YouTube-Original per yt-dlp, 720p). Klick spielt direkt in der Seite. Die `YouTube Intro.mov` im Landingpage-Ordner ist nur ein 10-s-Intro, nicht die Story.
- Monster: „Das Social Media / Monster wird nie satt.", Monster in Türkis, Zurücksetzen weg.
- Matrix ohne „Jede Woche anrufen" und „DMs beantworten". Baukasten-Titel zweizeilig, Text kürzer, Steine fallen nach unten raus. Zitate in einer Größe, drei Texte neu. Downloads: Cover näher am Text, Blätter und Sticker bewegen sich leicht, Hover fächert.
- Hero noch etwas luftiger.

Vorschau-Bündel: das Video bleibt draußen (16-MB-Grenze), dort öffnet der Klick YouTube.

## Fassung 10 (04.09.2026)

`web/fassung10.css` zuoberst. Sektionen ohne Trennlinie oben.

- Hero: Monster höher, Titel etwas kleiner; Kasten mit `justify-items:start`, damit die Wortbreite wieder gemessen wird (im Grid waren alle Wörter gleich breit).
- Tool: neue Zeile fährt weich rein (erst Ausblenden der letzten, dann beide Höhen gleichzeitig), Produktion und Planung stehen länger, „Basierend auf" hochkant mit anderem Bild.
- Instagram-Handle überall `@loopstudio.app`. Dreh-Karte „1–2 Tage". Knopf „Mit Reels füttern", weiter links und tiefer.
- Matrix mit Loop-Icon oben links. Stationen: Ergebnisbox `min-height`, Texte gleich lang, Puffer rechts.
- Baukasten in Runden: 3–5 Steine fliegen nacheinander aus dem Pool, 3 s stehen, alle fallen nach unten raus, neue Runde. Flag heißt `rundeLaeuft` (Kollision mit `laeuft` der Hero-Parallaxe).
- Preise: Tool-Karte wie auf der alten Landingpage (Badge, 20 €/Monat, Häkchen, Knopf „Jetzt starten"), dann Trenner „Wenn du mehr willst als das Tool — Drei Consulting-Pakete".
- Aussagen kleiner, treiben leicht, fliegen scrollgetrieben (scrub) ein.
- Mitnehmen: Blätter kommen beim Hover seitlich raus, unten mehr Luft.
- **Calendly:** „Gespräch buchen" (Nav, Hero, Pakete) öffnet das Popup `calendly.com/christianarns/15min`; im Footer steckt das Inline-Widget statt der Termin-Attrappe, mit Link-Knopf als Ersatz, falls das Widget nicht lädt (Vorschau, Blocker). Widget-Skript und -CSS im `<head>`.

**Falle:** Chrome-Profil `/tmp/cdp-profil` hat CSS/HTML aus dem Cache gezeigt — Renders sahen alt aus. `scrollshots.mjs` und `mess.mjs` schalten den Cache jetzt per `Network.setCacheDisabled` ab.

## Fassung 11 (04.09.2026)

`web/fassung11.css` liegt **nach** dem Calendly-CSS, damit die Overrides greifen.

- Calendly-Popup ohne weißen Kasten: Overlay fast deckend Navy, Widget-Hintergrund über URL-Parameter ebenfalls Navy (`background_color=243060&text_color=ffffff&primary_color=74c19e`), sichtbar bleibt nur die Karte. Im Footer statt der Einbettung ein Rufknopf: pulsierende Ringe, rotierender Text „Gespräch buchen · 15 Minuten · kein Pitch", Christians Foto, Klick öffnet das Popup.
- Hero-Monster zeigt beim Hover den offenen Mund. Nav startet größer (68 px), schrumpft nur in Höhe und Breite mit langer Kurve — Texte und Knöpfe bleiben gleich groß, deshalb kein Ruckeln mehr.
- Dreh-Karte: „Shotliste aus dem Tool", „1-2 Tage", „Professionelles Equipment bringen wir mit". Story: „10 Jahre Videoproduktion", ohne Schlusssatz. Fütter-Knopf bündig.
- Stationen: Produktion mit kurzen Badges „Du · Wir filmen · Du filmst" in einer Reihe.
- Baukasten: Steine absolut positioniert (`anordnen()`: Höhe 1,9 u, Schritt Höhe minus 0,7 u), Turm mittig, keine Klone mehr — die neuen Steine fahren von links rein, Takt 240 ms, kein Flackern. Handy mit pulsierendem türkisen Rand (`outline`, weil `box-shadow` global aus ist).
  **Falle:** beim Ersetzen des Blocks war `var frei` mit rausgefallen — `frei is not defined` erst beim ersten Rundenwechsel. Der Screenshot-Lauf mit `wait:` fängt so etwas.
- Preise: Titel „Die Software für 20 € im Monat.", alles zentriert, Karte fliegt beim Scrollen ein, Paketlisten mit Punkten.
- Aussagen: Hover vergrößert leicht, stärkeres Treiben. PDF-Stapel mit fünf Blättern, die beim Hover nacheinander links und rechts rauskommen.

## Fassung 12 (04.09.2026)

`web/fassung12.css` zuoberst. Favicon: SVG-Icon plus 32-px-PNG und Apple-Touch-Icon (gerendert per `qlmanage -t -s 512`, das kann SVG mit Transparenz).

- FAQ: Antwort zu „niemand vor die Kamera" neu (Content-Day statt Inhouse-Workshop), Frage „Produziert ihr auch deutschlandweit?" mit Ja ohne 75-km-Regel.
- Schritt 3: „Professionelles Equipment", „Wir helfen dir bei den Skripten".
- Baukasten: Steine kommen von links und von oben auf den Stapel, Überlappung 0,78 u — lückenlos (im vergrößerten Ausschnitt geprüft).
- Empfehlung-Badge mittig am oberen Rand wie beim Tool. PDF-Blätter alle mit 1,5 s, gestaffelt.
- Footer: statt des Rings ein kleiner Kalender als Knopf (`.termin`): Monat, Wochentage, 28 Tage mit fünf pulsierenden freien Tagen, Fußleiste „Termin wählen →" — der ganze Kalender öffnet das Calendly-Popup.

## Fassung 13 (04.09.2026)

`web/fassung13.css` zuoberst.

- Hero ohne „Klick mich". Schritt 3: „30 Min pro Reel". Fütter-Knopf bündig — die Ursache war ein leerer `.futter__ring`-Span als erstes Flex-Kind, der den `gap` von 28 px vor den Knopf setzte. Ring blendet früher aus.
- **Baukasten, die eigentliche Ursache:** absolut positionierte Steine mit `left:50%` bekommen nur die halbe Containerbreite als verfügbaren Platz; `svg{max-width:100%}` aus stil.css staucht dann 7-Noppen-Steine von 180 auf 162 px — nur horizontal, die Noppen sitzen schief, es sieht nach falschem Abstand aus. Jetzt `left:0;right:0;width:max-content;margin:auto` und `svg{max-width:none}`; gemessen: Breite = viewBox-Breite. Steine fliegen von links, der unterste zuerst.
- PDF-Blätter ohne Dauerbewegung, damit der Hover-Übergang von der Ruhelage startet (der erste Zettel sprang vorher aus der Keyframe-Animation).
- Footer-Kalender mit weißem Rand und weichem Außenring, Fußleiste hellere Navy mit Linie.
- Nachtrag: die Regel `.stein+.stein{margin:0}` aus Fassung 11 hatte die Automargins der oberen Steine genullt — nur der unterste war mittig. Jetzt alle auf 162 von 324 gemessen.

## Fassung 14 (04.09.2026)

`web/fassung14.css` zuoberst.

- Monster unten: Hover zeigt den offenen Mund (Flag `drueber`, während des Kauens hat die Fütter-Sequenz Vorrang).
- Baukasten: fünf feste Plätze im Handy (`platzY(i)`), nichts wird nachträglich umsortiert. Jeder Stein fliegt als Klon vom ausgegrauten Stein im Haufen zu seinem Platz (0,75 s, kleiner Bogen), der echte Stein wird beim Landen sichtbar. Reihenfolge: unten zuerst.
  **Falle Nr. 3 dieser Art:** `var frei` (Funktion im Baukasten) wurde vom Kalender-Code (`var frei = {}`) überschrieben — dieselbe IIFE, dieselben Variablennamen. Kalender-Variable heißt jetzt `freieTage`. Merken: in `bewegung.js` keine kurzen Allerweltsnamen auf oberster Ebene.
- Footer: ohne E-Mail, Impressum und Datenschutz in der Link-Reihe, rechts nur „© 2026 Loop Studio GmbH". Kalender heller umrandet, zeigt den echten Monat mit Wochentag-Versatz, heutiger Tag markiert, fünf zufällige freie Werktage nach heute.
- Nachtrag 14b: der Flugklon nahm die Inline-Styles des echten Steins mit (`bottom:0` + Verschiebung); als `position:fixed` streckte er sich bis zum Bildschirmrand, die Schrift hing weit darunter, die Landung war versetzt. Jetzt `removeAttribute('style')`, feste Breite/Höhe vom Ziel, 0,9 s Flug mit Bogen. Takt: 520 ms zwischen Steinen, 3,8 s stehen, 1,1 s Pause nach dem Fallen.

## Fassung 15 (04.09.2026)

`web/fassung15.css` zuoberst.

- PDF-Blätter beim Hover: erst die zweite Reihe direkt hinter dem Blatt, dann die hinteren.
- Footer-Kalender kleiner (300 px), Rand fast deckend weiß, Hover nur noch anheben, keine Türkis-Färbung.
- Calendly-Popup auf 880 × 660 begrenzt. **Der graue Rand um die Calendly-Karte ist die Seite im iframe von Calendly selbst.** Die Farbparameter (`background_color` …) werden übergeben, aber vom kostenlosen Calendly-Plan ignoriert — erst ab dem Standard-Plan lassen sich Farben und Branding anpassen. Mit Overlay und Größe ist das Maximum erreicht, das von außen geht.
- Baukasten: der Klon fliegt vom Haufen nach rechts hinter das Handy (`.flug` liegt jetzt in `.kasten2`, z-index 3, Handy z-index 5), der echte Stein kommt anschließend von oben in seinen Platz (aus dem beschnittenen Bereich, mit Einblenden). Takt 650 ms.

## Fassung 16 (04.09.2026)

`web/fassung16.css` zuoberst.

- **Baukasten, die eigentliche Ursache des „Hochrutschens":** `.stein` hatte seit Fassung 5 `transition: transform .3s, opacity .3s`. Jedes `gsap.set` auf Position und Deckkraft wurde dadurch vom Browser animiert — der Stein rutschte sichtbar von unten in seinen Platz und blendete dabei aus. Für Turm und Flugklon jetzt `transition:none`. Spur geprüft: Stein wartet unsichtbar am Platz, Klon fliegt hinter das Handy (oben rein), dann kommt der Stein von oben (−300 px) mit leichtem Einblenden.
- PDF-Blätter: alle starten beim Hover sofort, hintere brauchen länger (1,0 → 2,2 s).
- Footer-Kalender: Leiste beim Hover wieder türkis, Rand bleibt weiß. Calendly-Popup zurück auf Originalgröße.

## Fassung 17 (04.09.2026) — Christians Handy-Runde

`web/fassung17.css` zuoberst, alles unter 900 px.

- Nav ist auf dem Handy von Anfang an schmal (58 px, Logo 28 px, kein Schrumpfen), Logo 32 px vom linken Rand.
- Hero: Szene 300 px und direkt unter der Nav, Abstände enger — der Titel „Gespeicherte Reels werden …" steht im ersten Bild.
- Nicht gezeigt auf dem Handy: Tool-Attrappe (`#tool`), Aussagen (`#fuer-wen`), FAQ (`#faq`) samt Links im Menü und Footer, der Stein-Haufen im Baukasten (`.kasten2__pool`).
- Monster füttern jetzt auch per Klick aufs Monster (Desktop und Handy): `fuettern(vonKnopf)` in `bewegung.js`; der Stein startet am Knopf, wenn der im Bild ist, sonst unten links auf der Bühne. Futter-Monster mobil 340 px.
- Baukasten: ist der Haufen ausgeblendet (`!pool.offsetParent`), entfällt der Klon-Flug, der Stein kommt nur von oben.
- **Statusleiste unten im Handy läuft im Takt:** `leisteStart(ms)` setzt die Animation `laeuft` inline neu (Rundendauer + 3,8 s Halten), `leisteLeer()` beim Leeren; beim Betreten der Sektion `lauf(true)` für die erste Halte-Phase. Vorher lief sie als CSS-Endlosschleife (6 s) unabhängig von den Runden.
- Geprüft headless (CDP, 390 × 844 und 1440 × 900): Sektionen weg, Klick zählt hoch, Leiste 0 → 100 % genau bis zum Leeren, leer in der Pause, Neustart mit der nächsten Runde. Keine JS-Fehler.
- **Falle:** Der Browser-Pane der Desktop-App liegt oft im Hintergrund — dort laufen weder `requestAnimationFrame` noch ScrollTrigger, Runden und Leiste stehen scheinbar still. Für Zeitverläufe immer headless messen (`mess2.mjs` im Scratchpad: URL, JS, Breite, Höhe).

## Fassung 18 (04.09.2026) — Textcheck, Nav, dickes Monster

- **Ganze Seite auf Du-Form geprüft:** kein „Sie/Ihnen/Ihr" im HTML und in den JS-Texten (Tool-Attrappe, Futter-Sätze, Preiskarte). Die Seite duzt durchgehend.
- Nav und Handy-Menü: „So funktioniert's" · „Warum Social Media" (statt „Angebot", zeigt aufs Monster) · „Leistungen" (statt „Vier Stationen"). Passt bis 1024 px in eine Zeile, darunter greift ohnehin das Burger-Menü.
- **Monster wird dick:** `maxDick()` misst einmal im Ruhezustand und rechnet, bei welcher Skalierung der Kopf 14 px unter dem Text (`.lede`) steht; zweite Grenze ist die Bühnenbreite plus 110 px, Deckel 1,9. Pro Reel nähert es sich der Grenze an (`1 + (max − 1) · (1 − 0,9ⁿ)`), in die Breite 1,3-mal so stark wie in die Höhe. Drehpunkt 50 % / 92 % — es wächst nach oben und zu den Seiten, die Füße bleiben stehen. Der Mund-Zielpunkt der Steine wandert mit. Kau-Stauchung und Wachstum laufen in einer Timeline (vorher überschrieb `scaleY:1` das Wachstum).
- Gemessen headless: Desktop 1440 → 470 px auf 618 × 584 px, Kopf 16 px unter dem Text, 58 px Luft zum Panel; Handy 390 → 369 × 350 px, 10 px Rand. Keine JS-Fehler.

## Fassung 19 (04.09.2026) — Monster wird richtig dick

`web/fassung19.css` zuoberst.

- **Linear bis 50 Reels, danach Stillstand:** `zielMass(n)` rechnet `1 + (max − 1) · min(n, 50) / 50`, Ziel 1,8-fach. Die Geometrie begrenzt (`messen()`, einmal im Ruhezustand): links der Bildrand, rechts das Panel — das rückt per `x` so weit mit, wie rechts davon noch Platz ist (`panelReserve`) — und die Höhe darf höchstens 1,15-mal die Breite sein, damit es dick wird und nicht dünn.
- **Die Bühne wächst mit:** Was der Kopf nach oben nicht mehr schafft (14 px unter dem Text), bekommt `.futter__buehne` unten als Höhe dazu; die Füße bleiben stehen, die Sektion wird länger, danach `ScrollTrigger.refresh()` (700 ms entprellt). Der Fuß steht bei `bottom:6 %`, deshalb `extra = Rest / (1 − Bodenanteil)` — ohne den Faktor saß der Kopf genau auf dem Text. Der Kreis ist jetzt unten verankert (`inset:auto 8% 8% 8%; aspect-ratio:1`), damit er bei der höheren Bühne rund bleibt; `#monster{overflow:clip}` gegen Querscroll.
- Mund-Ziel der Steine: mittig, 44 % der Bildhöhe von oben, live aus dem Bild gemessen.
- Gemessen headless (55 Klicks): Desktop 1440 → 847 × 847 px (1,8), 12 px zum linken Rand, 12 px zum Panel (69 px gerückt), Bühne 560 → 815 px; Handy 390 → 390 × 449 px, volle Breite. Klick 51–55 ändert nichts mehr. Keine JS-Fehler.
- Footer: „Gründer und dein Ansprechpartner".

### Veröffentlichen auf onlinemedianer.de

`werkzeuge/deploy.sh` sichert den Live-Stand nach `Landingpage/_sicherung-onlinemedianer-<Datum>/`, lädt die
Seite per lftp (FTPS) hoch, räumt dabei die alte Landingpage (`css/`, `js/`, `assets/`) weg und prüft zum Schluss
per curl, ob onlinemedianer.de die neuen Dateien wirklich ausliefert. Login aus `~/.config/loopstudio-deploy.env`
(`FTP_HOST`, `FTP_USER`, `FTP_PASS`, chmod 600), nichts wird ausgegeben.

```bash
werkzeuge/deploy.sh --zeigen               # welche Ordner sieht der FTP-User?
werkzeuge/deploy.sh                        # sichern, hochladen, Gegenprobe
DEPLOY_ZIEL=/ordner werkzeuge/deploy.sh    # falls die Landingpage in einem Unterordner liegt
```

**Falle (04.09.2026, hat eine Runde gekostet):** Der Outreel-Zugang in `~/.config/outreel-deploy.env` ist ein
KAS-**Zusatz-FTP-User** (`f…`), keine Konto-Wurzel. Er sieht nur den Outreel-Bereich (`wordpress/`, `www/`,
`index.htm`). Das `/www/` darin ist **nicht** das Docroot von onlinemedianer.de: der erste Deploy landete dort,
die Domain lieferte weiter die alte Seite (`web/stil.css` → 404, Titel unverändert). onlinemedianer.de läuft zwar
auf demselben Server (85.13.164.90 = w01a5044.kasserver.com, gleicher MX), ihr Ordner liegt aber außerhalb dieses
FTP-Users. Lösung: in KAS (kas.all-inkl.com → FTP) einen eigenen FTP-Zugang mit Pfad = Ordner der Domain anlegen
(der Pfad steht unter Domain → onlinemedianer.de) und in `~/.config/loopstudio-deploy.env` eintragen. Das Skript
stoppt seitdem, wenn das Ziel nicht nach der Landingpage aussieht, und meldet „NICHT LIVE", wenn die Domain nach
dem Upload nicht die neuen Dateien zeigt. Der Fehl-Upload im `www/` des Outreel-Users ist harmlos: dort lag nur
eine verwaiste `wp-content/themes/outreel/assets/js/main.js` (gesichert in `_sicherung-onlinemedianer-20260904-1651/`),
outreel.de war nie betroffen und wurde geprüft.

**Gelöst, live seit 04.09.2026 17:19:** KAS zeigt unter Domain → onlinemedianer.de den Webspace `/loopstudio/`
(voll: `/www/htdocs/w01a5044/loopstudio/`, PHP 8.1). Dafür gibt es jetzt den FTP-Zusatz-User `f018b99d` mit genau
diesem Pfad, Zugang in `~/.config/loopstudio-deploy.env`. Erster Versuch mit dem User zeigte ein altes
Onlinemedianer-WordPress von 2022 (Theme Rouben, WooCommerce) — der User war zunächst auf dessen Ordner angelegt;
nach Umstellen des Pfads in KAS dauerte es unter einer Minute, bis FTP den neuen Ordner zeigte. Die alte
Landingpage liegt vollständig in `Landingpage/_sicherung-onlinemedianer-20260904-1719/` (16 Dateien, index.html
byteidentisch mit dem Repo); auf dem Server liegen nur noch `index.html`, `web/`, `bilder/`. Gegenprobe: alle
Assets 200 mit richtigem Content-Type (woff2, mp4, js), keine JS-Fehler auf Desktop 1440 und Mobil 390.
