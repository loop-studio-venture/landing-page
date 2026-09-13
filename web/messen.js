/* ============================================================
   Messen — die vier Plausible-Ereignisse der Startseite.
   Laeuft nach bewegung.js und haengt eigene Listener daneben:
   bewegung.js und seite.js bleiben unveraendert.
   1 Warteschlange nur als Rueckfall   3 App Start Click
   2 Book Call Click                   4 Call Booked   5 PDF Request
   ============================================================ */
(function () {
  'use strict';
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  /* ---------- 1 Warteschlange nur als Rueckfall ----------
     Der Schnipsel im <head> hat window.plausible schon definiert. Hier wird
     nichts ueberschrieben — das wuerfe eine bereits gefuellte Warteschlange
     weg. plausible.init() ruft diese Datei nie auf: die Initialisierung und
     der Seitenaufruf gehoeren dem Schnipsel, sonst zaehlt er doppelt. */
  if (typeof window.plausible !== 'function') {
    window.plausible = function () {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };
  }

  /* window.plausible wird bei jedem Ereignis frisch gelesen und nie gemerkt:
     so bekommt auch ein Rekorder, der vor dem Laden gesetzt wurde, jeden
     Aufruf — und ein spaeter ausgetauschtes window.plausible greift sofort. */
  var melden = function (name, optionen) {
    if (typeof window.plausible !== 'function') return;
    if (optionen) window.plausible(name, optionen);
    else window.plausible(name);
  };

  /* ---------- 2 Book Call Click ----------
     Alle sechs Buchen-Ausloeser: Nav, Hero, die drei Paketkarten und der
     Kalenderknopf im Fuss. Faellt an, egal ob Calendly danach laedt oder
     die Notbremse in bewegung.js greift. */
  $$('a[href="#gespraech"], #rufKnopf').forEach(function (el) {
    el.addEventListener('click', function () { melden('Book Call Click'); });
  });

  /* ---------- 3 App Start Click ----------
     Die zwei Links, die zur App fuehren: "Loop Studio ausprobieren" im Hero
     und "Jetzt starten" auf der Preiskarte. Login und "Zum Tool" sind keine
     Conversion und bleiben ungezaehlt.
     Mit Ctrl, Meta oder Shift oeffnet der Browser selbst einen neuen Tab —
     dann nur melden und den Klick in Ruhe lassen. Sonst: Klick abfangen,
     melden und spaetestens nach 1000 ms gehen. Die Uhr ist die Absicherung,
     nicht der callback: ignoriert das Skript die Option, kostet der Klick
     bis zu eine Sekunde, bricht aber nie. */
  var GEHZEIT = 1000;
  var appStart = function (e) {
    var ziel = e.currentTarget.getAttribute('href');
    if (e.ctrlKey || e.metaKey || e.shiftKey) { melden('App Start Click'); return; }
    e.preventDefault();
    var gegangen = false;
    var gehen = function () {
      if (gegangen) return;
      gegangen = true;
      window.location.href = ziel;
    };
    melden('App Start Click', { callback: gehen });
    window.setTimeout(gehen, GEHZEIT);
  };
  $$('.held__cta a.btn--rand, .preiskarte a.btn').forEach(function (a) {
    a.addEventListener('click', appStart);
  });

  /* ---------- 4 Call Booked ----------
     Calendly meldet den fertigen Termin per postMessage aus seinem Popup.
     Nur die eigene Herkunft und nur dieses eine Ereignis zaehlen. */
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://calendly.com') return;
    var d = e.data;
    if (!d || typeof d !== 'object' || d.event !== 'calendly.event_scheduled') return;
    melden('Call Booked');
  });

  /* ---------- 5 PDF Request ----------
     Die Browser-Pruefung (required, type=email) haelt leere und falsche
     Adressen vorher auf; submit kommt also nur mit gueltiger Mail an. */
  var dl = document.getElementById('dlForm');
  if (dl) dl.addEventListener('submit', function () { melden('PDF Request'); });
})();
