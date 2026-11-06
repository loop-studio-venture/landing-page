// Tests of the Lupi appearances on the start page. Run: node --test werkzeuge/test/
//
// Pins what a later edit could break silently: the old smooth monster stays off the shipped
// pages, every Lupi picture on index.html is a file in bilder/lupi/ with a row in BILDHERKUNFT.md,
// Lupi is never mirrored, cropped or recoloured, the end state is the markup (motion only
// arms from JS) and nothing new is loaded from outside. Offline: reads the repo files only.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const read = (name) => readFileSync(join(ROOT, name), 'utf8');

const OLD_FILES = [
  'szene-basis.png', 'szene-editing.png', 'szene-produktion.png',
  'monster-kaut.png', 'monster-mund-auf.png', 'monster-neugier.png',
  'monster-portrait.png', 'monster-satt.png', 'monster-web.png',
].map((f) => `bilder/${f}`);
const NEW_FILES = [
  'lupi_ansicht_T2_seite.webp', 'lupi_gefuehl_15_daumen_hoch.webp',
  'lupi_gefuehl_14_stolz.webp', 'lupi_pose_P2_zeigt.webp',
].map((f) => `bilder/lupi/${f}`);

const html = read('index.html');
const css = read('web/fassung20.css');
const herkunft = read('BILDHERKUNFT.md');
const bewegung = read('web/bewegung.js');

// every <img> tag of a page, as { src, tag }
const images = (text) => [...text.matchAll(/<img\b[^>]*>/g)].map((m) => ({
  tag: m[0],
  src: (m[0].match(/\ssrc="([^"]+)"/) || [])[1],
}));

// the shipped text files outside spiel/ (the game is synced from its own repo)
function shippedTextFiles(dir = '') {
  const out = [];
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (['.git', '.shots', 'node_modules', 'spiel', 'docs', 'werkzeuge'].includes(e.name)) continue;
      out.push(...shippedTextFiles(rel));
    } else if (/\.(html|css|js|mjs|json|md|txt|svg|xml)$/.test(e.name) || e.name === '_headers' || e.name === '_redirects') {
      out.push(rel);
    }
  }
  return out;
}

test('the old smooth monster files are gone and nothing outside spiel/ points at them', () => {
  for (const f of OLD_FILES) assert.equal(existsSync(join(ROOT, f)), false, `${f} is still there`);
  for (const f of shippedTextFiles()) {
    const text = read(f);
    for (const old of OLD_FILES) assert.ok(!text.includes(old.slice('bilder/'.length)), `${f} still names ${old}`);
  }
});

test('every Lupi picture on the start page is a file in bilder/lupi/ with a BILDHERKUNFT.md row', () => {
  const lupis = images(html).filter((i) => i.src && i.src.startsWith('bilder/lupi/'));
  for (const f of NEW_FILES) assert.ok(lupis.some((i) => i.src === f), `${f} is not used on index.html`);
  for (const i of lupis) {
    assert.ok(existsSync(join(ROOT, i.src)), `${i.src} does not exist`);
    assert.ok(herkunft.includes(i.src.slice('bilder/lupi/'.length)) || herkunft.includes('bilder/lupi/*.webp'),
      `${i.src} has no row in BILDHERKUNFT.md`);
  }
  for (const f of NEW_FILES) assert.ok(herkunft.includes(f.slice('bilder/lupi/'.length)), `${f} has no row`);
});

test('every image under bilder/ named on the page exists, and BILDHERKUNFT.md has no row for a deleted file', () => {
  for (const i of images(html)) {
    if (i.src && i.src.startsWith('bilder/')) assert.ok(existsSync(join(ROOT, i.src)), `${i.src} is missing`);
  }
  for (const old of OLD_FILES) assert.ok(!herkunft.includes(old.slice('bilder/'.length)), `row for deleted ${old}`);
});

test('the new Lupi images have alt text and size, and are only scaled uniformly', () => {
  for (const i of images(html).filter((x) => NEW_FILES.includes(x.src))) {
    assert.match(i.tag, /\salt="[^"]+"/, `${i.src} has no alt`);
    assert.match(i.tag, /\swidth="\d+"/, `${i.src} has no width`);
    assert.match(i.tag, /\sheight="\d+"/, `${i.src} has no height`);
  }
  // CSS side: no mirror, no crop, no recolour on the new stages
  assert.doesNotMatch(css, /scaleX\(\s*-|scale\(\s*-|rotateY|object-fit|filter\s*:|mix-blend-mode|clip-path/);
  assert.doesNotMatch(bewegung.slice(bewegung.indexOf('laufLupi')), /scaleX\s*:\s*-|scale\s*:\s*-/);
});

test('the markup is the end state: motion arms from JS only, with GSAP and without reduced motion', () => {
  // seven filled marks, the thumbs-up and its line are in the static markup
  assert.equal((html.match(/streak__tag streak__tag--da/g) || []).length, 7);
  assert.match(html, /id="streakLupi"/);
  assert.match(html, /id="streakFertig"/);
  assert.match(html, /id="laufLupi"/);
  // CSS carries no initial hidden state for the animated parts
  assert.doesNotMatch(css, /streak__lupi[^}]*opacity\s*:\s*0/);
  assert.doesNotMatch(css, /streak__fertig[^}]*opacity\s*:\s*0/);
  // the JS block is guarded by both conditions
  assert.match(bewegung, /if \(hatGsap && sanft && laufLupi && laufBand\)/);
  assert.match(bewegung, /if \(hatGsap && sanft && streak\)/);
  // the run goes once, right to left: starts to the right of the viewport, ends at x 0
  assert.match(bewegung, /fromTo\(laufLupi, \{ x: laufWeg \}, \{ x: 0,/);
  assert.match(bewegung, /laufBand, start: 'top 80%', once: true/);
});

test('the stylesheet resets its transitions for prefers-reduced-motion', () => {
  const m = css.match(/@media\(prefers-reduced-motion:reduce\)\{([^}]*)\}/);
  assert.ok(m, 'no reduced-motion block in fassung20.css');
  assert.match(m[1], /\.streak__tag/);
  assert.match(m[1], /transition:none/);
});

test('fassung20.css is linked after fassung19.css and no new script or host came in', () => {
  assert.ok(html.indexOf('web/fassung20.css') > html.indexOf('web/fassung19.css'));
  assert.doesNotMatch(css, /url\(|@import|https?:\/\//);
  const scripts = [...html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
  for (const s of scripts) assert.ok(!/^https?:\/\//.test(s) || /plausible\.io/.test(s), `new external script ${s}`);
  assert.ok(!scripts.some((s) => /fassung20|loopi/i.test(s)), 'a new script file was added for Loopi');
});
