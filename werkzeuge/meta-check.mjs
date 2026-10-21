// Pre-deploy check of the share/meta tags of the landing page.
//
//   node werkzeuge/meta-check.mjs [repo-root]
//
// Zero dependencies (node: built-ins only, Node 18+). Reads every *.html directly in the repo
// root. A page whose robots meta contains "noindex" is exempt; every other page must carry the
// whole checklist below, each tag exactly once with non-empty content. The OG image is judged on
// the file itself (header type and dimensions, size), never on the width/height attributes.
// Prints FAIL / WARN lines and one summary line; exit code 1 on any FAIL, or when no page is found.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '..'));
const ORIGIN = 'https://loopstudio.app/';
const IMG_W = 1200;
const IMG_H = 630;
const MAX_IMG_BYTES = 307200; // 300 KB
const THEME = '#F4EFE6';

let fails = 0;
let warns = 0;
const fail = (page, msg) => { fails++; console.log(`FAIL ${page}: ${msg}`); };
const warn = (page, msg) => { warns++; console.log(`WARN ${page}: ${msg}`); };

// ---- HTML head parsing (regex based, tolerant of attribute order, quote style, self-closing) ----

function parseAttrs(src) {
  const attrs = {};
  const re = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(src))) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return attrs;
}

function parseHead(html) {
  const clean = html.replace(/<!--[\s\S]*?-->/g, '');
  const m = clean.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i);
  if (!m) return null;
  const head = m[1];
  const tags = [];
  const re = /<(meta|link)\b([^>]*?)\/?>/gi;
  let t;
  while ((t = re.exec(head))) tags.push({ tag: t[1].toLowerCase(), ...parseAttrs(t[2]) });
  const titles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)].map((x) => x[1].trim());
  return { tags, titles };
}

// ---- The checklist: [label, matcher, attribute holding the value] ----
const meta = (name) => (t) => t.tag === 'meta' && t.name === name;
const prop = (p) => (t) => t.tag === 'meta' && t.property === p;
const link = (rel, extra = () => true) => (t) =>
  t.tag === 'link' && (t.rel ?? '').toLowerCase().split(/\s+/).includes(rel) && extra(t);

const CHECKLIST = [
  ['meta description', meta('description'), 'content'],
  ['link canonical', link('canonical'), 'href'],
  ['meta robots', meta('robots'), 'content'],
  ['og:type', prop('og:type'), 'content'],
  ['og:site_name', prop('og:site_name'), 'content'],
  ['og:title', prop('og:title'), 'content'],
  ['og:description', prop('og:description'), 'content'],
  ['og:url', prop('og:url'), 'content'],
  ['og:locale', prop('og:locale'), 'content'],
  ['og:image', prop('og:image'), 'content'],
  ['og:image:type', prop('og:image:type'), 'content'],
  ['og:image:width', prop('og:image:width'), 'content'],
  ['og:image:height', prop('og:image:height'), 'content'],
  ['og:image:alt', prop('og:image:alt'), 'content'],
  ['twitter:card', meta('twitter:card'), 'content'],
  ['twitter:title', meta('twitter:title'), 'content'],
  ['twitter:description', meta('twitter:description'), 'content'],
  ['twitter:image', meta('twitter:image'), 'content'],
  ['twitter:image:alt', meta('twitter:image:alt'), 'content'],
  ['meta theme-color', meta('theme-color'), 'content'],
  ['link icon (svg)', link('icon', (t) => (t.type ?? '').toLowerCase() === 'image/svg+xml'), 'href'],
  ['link icon (32x32)', link('icon', (t) => (t.sizes ?? '') === '32x32'), 'href'],
  ['link apple-touch-icon', link('apple-touch-icon'), 'href'],
  ['link manifest', link('manifest'), 'href'],
];

// ---- Image header ----

function imageInfo(buf) {
  if (buf.length > 24 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { type: 'image/png', w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xff) { i++; continue; }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      const len = buf.readUInt16BE(i + 2);
      const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
      if (isSof) return { type: 'image/jpeg', h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      i += 2 + len;
    }
    return { type: 'image/jpeg', w: 0, h: 0 };
  }
  return null;
}

// Maps an absolute https URL on the site's own origin to a path inside the repo root.
function localPath(url) {
  if (!url.startsWith(ORIGIN)) return null;
  const rel = decodeURIComponent(url.slice(ORIGIN.length).split(/[?#]/)[0]);
  const full = resolve(ROOT, rel);
  return full.startsWith(ROOT + sep) ? full : null;
}

// ---- Per-page check ----

function checkPage(page, html, state) {
  const parsed = parseHead(html);
  if (!parsed) { fail(page, 'no <head> found'); return false; }
  const { tags, titles } = parsed;

  const robots = tags.find(meta('robots'));
  if (robots && /noindex/i.test(robots.content ?? '')) {
    return true;
  }

  const val = {};
  let complete = true;

  if (titles.length === 0 || titles[0] === '') { fail(page, 'missing <title>'); complete = false; }
  else if (titles.length > 1) { fail(page, 'duplicate <title>'); complete = false; }
  else if (titles[0].length < 50 || titles[0].length > 60) warn(page, `<title> is ${titles[0].length} characters (guideline 50-60)`);

  for (const [label, match, attr] of CHECKLIST) {
    const found = tags.filter(match);
    if (found.length === 0) { fail(page, `missing ${label}`); complete = false; continue; }
    if (found.length > 1) { fail(page, `duplicate ${label}`); complete = false; continue; }
    const v = (found[0][attr] ?? '').trim();
    if (v === '') { fail(page, `empty ${label}`); complete = false; continue; }
    val[label] = v;
  }

  const description = val['meta description'];
  if (description && (description.length < 120 || description.length > 160)) {
    warn(page, `meta description is ${description.length} characters (guideline 120-160)`);
  }
  if (!complete) return false;

  // Values the checklist pins down.
  const robotsValue = val['meta robots'];
  if (!/max-image-preview:large/i.test(robotsValue) || !/\bindex\b/i.test(robotsValue)) {
    fail(page, `robots is "${robotsValue}", must be index,follow,max-image-preview:large`);
  }
  if (val['og:type'] !== 'website') fail(page, `og:type is "${val['og:type']}", must be website`);
  if (val['twitter:card'] !== 'summary_large_image') fail(page, `twitter:card is "${val['twitter:card']}", must be summary_large_image`);
  if (val['meta theme-color'] !== THEME) fail(page, `theme-color is "${val['meta theme-color']}", must be ${THEME}`);
  state.themes.add(val['meta theme-color']);

  for (const label of ['link canonical', 'og:url', 'og:image', 'twitter:image']) {
    if (!val[label].startsWith('https://')) fail(page, `${label} is not an absolute https URL: ${val[label]}`);
  }
  if (val['link canonical'] !== val['og:url']) fail(page, `og:url (${val['og:url']}) differs from canonical (${val['link canonical']})`);
  for (const [a, b] of [['twitter:title', 'og:title'], ['twitter:description', 'og:description'], ['twitter:image', 'og:image'], ['twitter:image:alt', 'og:image:alt']]) {
    if (val[a] !== val[b]) fail(page, `${a} differs from ${b}`);
  }
  if (val['og:image:alt'].split(/\s+/).length < 3) fail(page, `og:image:alt is not a sentence: "${val['og:image:alt']}"`);

  // The image file itself.
  const file = localPath(val['og:image']);
  if (!file) { fail(page, `og:image is not a file of this site (${ORIGIN}...): ${val['og:image']}`); return; }
  if (!existsSync(file) || !statSync(file).isFile()) { fail(page, `og:image file does not exist: ${val['og:image']}`); return; }
  const buf = readFileSync(file);
  const info = imageInfo(buf);
  if (!info) { fail(page, `og:image ${val['og:image']} is not PNG or JPEG`); return; }
  if (info.w !== IMG_W || info.h !== IMG_H) fail(page, `og:image ${val['og:image']} is ${info.w}x${info.h}, must be ${IMG_W}x${IMG_H}`);
  if (buf.length > MAX_IMG_BYTES) fail(page, `og:image ${val['og:image']} is ${buf.length} bytes, limit is ${MAX_IMG_BYTES} (300 KB)`);
  if (val['og:image:type'] !== info.type) fail(page, `og:image:type type mismatch: tag says ${val['og:image:type']}, file is ${info.type}`);
  if (val['og:image:width'] !== String(info.w) || val['og:image:height'] !== String(info.h)) {
    fail(page, `og:image:width/height attribute/header mismatch: tags say ${val['og:image:width']}x${val['og:image:height']}, file is ${info.w}x${info.h}`);
  }

  const manifestHref = val['link manifest'];
  if (/^https?:/.test(manifestHref) || !existsSync(resolve(ROOT, manifestHref))) {
    fail(page, `manifest link ${manifestHref} does not point at a file in the repo root`);
  }
}

// ---- Manifest, icons ----

function checkManifest(state) {
  const page = 'site.webmanifest';
  const path = join(ROOT, 'site.webmanifest');
  if (!existsSync(path)) { fail(page, 'file does not exist'); return; }
  let manifest;
  try { manifest = JSON.parse(readFileSync(path, 'utf8')); } catch (e) { fail(page, `is not valid JSON: ${e.message}`); return; }
  for (const key of ['name', 'short_name', 'theme_color', 'background_color', 'start_url']) {
    if (!manifest[key]) fail(page, `missing ${key}`);
  }
  for (const key of ['theme_color', 'background_color']) {
    if (manifest[key] && manifest[key] !== THEME) fail(page, `${key} is ${manifest[key]}, must be ${THEME}`);
  }
  for (const t of state.themes) {
    if (manifest.theme_color && manifest.theme_color !== t) fail(page, `theme_color ${manifest.theme_color} differs from the pages' theme-color ${t}`);
  }
  if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) { fail(page, 'missing icons'); return; }
  for (const icon of manifest.icons) {
    const file = resolve(ROOT, icon.src ?? '');
    if (!icon.src || !file.startsWith(ROOT + sep) || !existsSync(file)) { fail(page, `manifest icon ${icon.src} does not exist`); continue; }
    const info = imageInfo(readFileSync(file));
    if (!info) { fail(page, `manifest icon ${icon.src} is not PNG or JPEG`); continue; }
    if (icon.sizes !== `${info.w}x${info.h}`) fail(page, `manifest icon ${icon.src} says ${icon.sizes}, file is ${info.w}x${info.h}`);
  }
}

// ---- Run ----

if (!existsSync(ROOT)) { console.log(`FAIL ${ROOT}: no such directory`); process.exit(1); }
const pages = readdirSync(ROOT).filter((f) => f.toLowerCase().endsWith('.html')).sort();
if (pages.length === 0) {
  fail(ROOT, 'no *.html found');
} else {
  const state = { themes: new Set() };
  for (const page of pages) {
    const before = fails;
    const exempt = checkPage(page, readFileSync(join(ROOT, page), 'utf8'), state);
    if (exempt) console.log(`SKIP ${page}: exempt (robots noindex)`);
    else if (fails === before) console.log(`OK   ${page}`);
  }
  checkManifest(state);
  if (!existsSync(join(ROOT, 'favicon.ico'))) fail('favicon.ico', 'file does not exist');
}

console.log(`meta-check: ${pages.length} page(s), ${fails} failure(s), ${warns} warning(s)`);
process.exit(fails > 0 ? 1 : 0);
