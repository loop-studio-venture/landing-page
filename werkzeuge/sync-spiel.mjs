// Sync of the Loopi Run browser game into spiel/ (served at loopstudio.app/spiel/).
//
//   node werkzeuge/sync-spiel.mjs            fetch the pinned commit and replace spiel/
//   node werkzeuge/sync-spiel.mjs --check    offline consistency check of the committed spiel/
//
// Options: --source <git url or local path>   default https://github.com/loop-studio-venture/loopi-run.git
//          --pin-file <path>                  default werkzeuge/spiel-pin.txt
//          --out <dir>                        default spiel/
//
// This script is the only way the game gets into this repo. The pin file holds one full commit hash
// of loop-studio-venture/loopi-run. Exactly index.html, game.js and assets/ are copied from that
// commit, byte for byte, with one exception: index.html gets "?v=<id>" on its game.js and assets/
// references (<id> = the first 10 characters of the pin). game.js appends the same identifier to
// every asset it loads itself, so a new pin means new URLs for everything, which is what makes the
// long cache lifetime in _headers safe.
//
// The new tree is built and validated in a temporary folder next to the output; only then does it
// replace the output, so a refused or failed run leaves the output folder untouched.
// Plain Node (node: built-ins and the git executable only), no package.json, no dependency.
// It reads and prints no credential: git uses the developer's own credentials, and any URL that is
// printed has its user info stripped.

import { spawnSync } from 'node:child_process';
import {
  existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync,
  renameSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SOURCE = 'https://github.com/loop-studio-venture/loopi-run.git';
const PIN_LENGTH = 40; // a full SHA-1 commit hash, lowercase hex
const ID_LENGTH = 10; // the ?v= identifier: the first 10 characters of the pin
const GIT_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_GIT_OUTPUT = 512 * 1024 * 1024;

class Refusal extends Error {}
const refuse = (msg) => { throw new Refusal(msg); };

// ---- small helpers ----

// Remove user info from anything that looks like a URL before it is printed.
const clean = (text) => String(text).replace(/(\b[a-z][a-z0-9+.-]*:\/\/)[^@/\s]+@/gi, '$1');

function git(args, opts = {}) {
  const r = spawnSync('git', args, {
    encoding: opts.binary ? 'buffer' : 'utf8',
    input: opts.input,
    maxBuffer: MAX_GIT_OUTPUT,
    timeout: GIT_TIMEOUT_MS,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
  });
  if (r.error) refuse(`git could not be run: ${clean(r.error.message)}`);
  return r;
}

function readPin(pinFile) {
  let raw;
  try { raw = readFileSync(pinFile, 'utf8'); } catch { refuse(`pin file ${pinFile} cannot be read`); }
  const text = raw.endsWith('\n') ? raw.slice(0, -1) : raw;
  if (text === '') refuse('pin is empty');
  if (text.trim() === '') refuse('pin is only whitespace');
  if (text.includes('\n')) refuse('pin file holds more than one line');
  if (!new RegExp(`^[0-9a-f]{${PIN_LENGTH}}$`).test(text)) {
    refuse(`pin must be exactly ${PIN_LENGTH} lowercase hex characters (a full commit hash), got ${text.length} characters: no branch, tag or abbreviation`);
  }
  return text;
}

const isForbiddenName = (name) => name === '.DS_Store' || /\.md$/i.test(name) || name.startsWith('.git');

// ---- references in index.html ----
// One scan serves both modes. Every relative reference in src=/href=/url() must be game.js (script
// src) or below assets/; anything else is a structure the rewrite cannot handle.

function scanRefs(html) {
  const refs = [];
  const attr = /\b(src|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'<>`=]+))/gid;
  for (const m of html.matchAll(attr)) {
    const g = m[2] !== undefined ? 2 : m[3] !== undefined ? 3 : 4;
    refs.push({ kind: m[1].toLowerCase(), value: m[g], end: m.indices[g][1] });
  }
  const css = /url\(\s*(["']?)([^"')\s]*)\1\s*\)/gid;
  for (const m of html.matchAll(css)) refs.push({ kind: 'url', value: m[2], end: m.indices[2][1] });
  // Absolute (scheme or //host) and in-page (#) references are not ours.
  return refs.filter((r) => !/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(r.value));
}

function rewriteIndex(html, id) {
  if (html.split('src="game.js"').length - 1 !== 1) refuse('src="game.js" must occur exactly once in index.html');
  const refs = scanRefs(html);
  let scripts = 0;
  for (const r of refs) {
    if (r.value === 'game.js') {
      if (r.kind !== 'src') refuse('game.js is referenced from something other than src=');
      scripts++;
    } else if (r.value.startsWith('assets/')) {
      if (/[?#]/.test(r.value)) refuse(`reference ${r.value} already carries a query or fragment`);
    } else {
      refuse(`index.html has a relative reference the rewrite cannot handle: ${r.kind} ${r.value}`);
    }
  }
  if (scripts !== 1) refuse('game.js must be referenced exactly once in index.html');
  let out = html;
  for (const r of [...refs].sort((a, b) => b.end - a.end)) out = out.slice(0, r.end) + `?v=${id}` + out.slice(r.end);
  return out;
}

// ---- consistency check of a finished output folder (used by --check and before every swap) ----

function walk(dir, rel = '') {
  const entries = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const r = rel ? `${rel}/${name}` : name;
    const st = lstatSync(p);
    if (st.isSymbolicLink()) { entries.push({ rel: r, type: 'symlink' }); continue; }
    if (st.isDirectory()) { entries.push({ rel: r, type: 'dir' }); entries.push(...walk(p, r)); continue; }
    entries.push({ rel: r, type: st.isFile() ? 'file' : 'other', size: st.size });
  }
  return entries;
}

function checkTree(out, pin) {
  const id = pin.slice(0, ID_LENGTH);
  if (!existsSync(out)) refuse(`${out} does not exist`);
  const entries = walk(out);
  for (const e of entries) {
    const top = e.rel.split('/')[0];
    if (!['index.html', 'game.js', 'assets'].includes(top)) refuse(`unexpected entry ${e.rel} (only index.html, game.js and assets/ belong in the folder)`);
    if (e.type === 'symlink' || e.type === 'other') refuse(`${e.rel} is a ${e.type}`);
    if (e.rel.split('/').some(isForbiddenName)) refuse(`${e.rel} is a forbidden file (.md, .DS_Store or .git*)`);
  }
  const type = (rel) => entries.find((e) => e.rel === rel)?.type;
  if (type('index.html') !== 'file') refuse('index.html is missing');
  if (type('game.js') !== 'file') refuse('game.js is missing');
  if (type('assets') !== 'dir') refuse('assets/ is missing');

  const html = readFileSync(join(out, 'index.html'), 'latin1');
  let scripts = 0;
  for (const r of scanRefs(html)) {
    const q = r.value.indexOf('?');
    const path = q < 0 ? r.value : r.value.slice(0, q);
    const query = q < 0 ? '' : r.value.slice(q);
    if (path !== 'game.js' && !path.startsWith('assets/')) refuse(`index.html has a relative reference outside game.js and assets/: ${r.value}`);
    if (query !== `?v=${id}`) refuse(`reference ${r.value} does not carry exactly ?v=${id}`);
    if (path === 'game.js') {
      if (r.kind !== 'src') refuse('game.js is referenced from something other than src=');
      scripts++;
    }
    let file;
    try { file = decodeURIComponent(path); } catch { refuse(`reference ${r.value} is not a valid path`); }
    if (type(file) !== 'file') refuse(`referenced file ${file} is missing`);
  }
  if (scripts !== 1) refuse('game.js must be referenced exactly once in index.html');
  return entries;
}

// ---- fetch the pinned commit and list what to copy ----

function fetchPinned(source, pin, work) {
  const init = git(['-C', work, 'init', '-q']);
  if (init.status !== 0) refuse(`git init failed: ${clean(init.stderr)}`);
  const f = git(['-C', work, 'fetch', '-q', '--no-tags', '--depth', '1', source, pin]);
  if (f.status !== 0) refuse(`pinned commit ${pin} cannot be fetched from the source: ${clean(f.stderr).trim().split('\n').pop()}`);
  const t = git(['-C', work, 'cat-file', '-t', pin]);
  const kind = t.status === 0 ? t.stdout.trim() : 'missing';
  if (kind !== 'commit') refuse(`pin ${pin} is not a commit (it is: ${kind})`);
}

function listCopied(work, pin) {
  const r = git(['-C', work, 'ls-tree', '-r', '-z', pin], { binary: true });
  if (r.status !== 0) refuse(`ls-tree failed: ${clean(r.stderr)}`);
  const items = [];
  for (const rec of r.stdout.toString('utf8').split('\0')) {
    if (!rec) continue;
    const tab = rec.indexOf('\t');
    const [mode, kind, sha] = rec.slice(0, tab).split(' ');
    const path = rec.slice(tab + 1);
    if (path === 'index.html' || path === 'game.js' || path === 'assets' || path.startsWith('assets/')) items.push({ mode, kind, sha, path });
  }
  for (const want of ['index.html', 'game.js']) {
    if (!items.some((i) => i.path === want)) refuse(`pinned commit lacks ${want}`);
  }
  if (!items.some((i) => i.path.startsWith('assets/'))) refuse('pinned commit lacks assets/');
  for (const i of items) {
    if (i.kind === 'commit' || i.mode === '160000') refuse(`${i.path} is a submodule`);
    if (i.mode === '120000') refuse(`${i.path} is a symlink`);
    if (i.kind !== 'blob' || (i.mode !== '100644' && i.mode !== '100755')) refuse(`${i.path} is not a regular file`);
    if (i.path.split('/').some(isForbiddenName)) refuse(`${i.path} is a forbidden file (.md, .DS_Store or .git*)`);
  }
  if (items.some((i) => i.path === 'assets')) refuse('assets is a file, not a folder');
  return items;
}

// All blobs through one git process: exact bytes, no checkout filters (autocrlf, attributes).
function readBlobs(work, items) {
  const r = git(['-C', work, 'cat-file', '--batch'], { binary: true, input: Buffer.from(items.map((i) => i.sha).join('\n') + '\n') });
  if (r.status !== 0) refuse(`cat-file failed: ${clean(r.stderr)}`);
  const buf = r.stdout;
  const blobs = new Map();
  let pos = 0;
  for (const i of items) {
    const nl = buf.indexOf(0x0a, pos);
    const [sha, kind, size] = buf.subarray(pos, nl).toString('latin1').split(' ');
    if (sha !== i.sha || kind !== 'blob') refuse(`cannot read ${i.path} from the pinned commit`);
    const n = Number(size);
    blobs.set(i.path, buf.subarray(nl + 1, nl + 1 + n));
    pos = nl + 1 + n + 1;
  }
  return blobs;
}

function sync({ source, pinFile, out }) {
  const pin = readPin(pinFile);
  const id = pin.slice(0, ID_LENGTH);
  const tmp = mkdtempSync(join(tmpdir(), 'sync-spiel-'));
  const stage = `${out}.sync-new-${process.pid}`;
  const old = `${out}.sync-old-${process.pid}`;
  try {
    fetchPinned(source, pin, tmp);
    const items = listCopied(tmp, pin);
    const blobs = readBlobs(tmp, items);

    rmSync(stage, { recursive: true, force: true });
    for (const i of items) {
      const target = join(stage, ...i.path.split('/'));
      mkdirSync(dirname(target), { recursive: true });
      const data = i.path === 'index.html'
        ? Buffer.from(rewriteIndex(blobs.get(i.path).toString('latin1'), id), 'latin1')
        : blobs.get(i.path);
      writeFileSync(target, data, { mode: 0o644 });
    }
    checkTree(stage, pin);

    // Swap: the old folder is only moved aside after the new one is complete.
    if (existsSync(out)) renameSync(out, old);
    try {
      renameSync(stage, out);
    } catch (e) {
      if (existsSync(old)) renameSync(old, out);
      throw e;
    }
    rmSync(old, { recursive: true, force: true });
    console.log(`sync-spiel: ${out} now holds ${items.length} files from ${pin} (?v=${id})`);
  } finally {
    rmSync(stage, { recursive: true, force: true });
    rmSync(tmp, { recursive: true, force: true });
  }
}

// ---- command line ----

function parseArgs(argv) {
  const opts = {
    source: DEFAULT_SOURCE,
    pinFile: join(HERE, 'spiel-pin.txt'),
    out: resolve(HERE, '..', 'spiel'),
    check: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') opts.check = true;
    else if (a === '--source' || a === '--pin-file' || a === '--out') {
      const v = argv[++i];
      if (v === undefined) refuse(`${a} needs a value`);
      if (a === '--source') opts.source = v;
      else if (a === '--pin-file') opts.pinFile = resolve(v);
      else opts.out = resolve(v);
    } else refuse(`unknown option ${a}`);
  }
  return opts;
}

try {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.check) {
    const entries = checkTree(opts.out, readPin(opts.pinFile));
    console.log(`sync-spiel --check: ${opts.out} is consistent with the pin (${entries.filter((e) => e.type === 'file').length} files)`);
  } else {
    sync(opts);
  }
} catch (e) {
  if (!(e instanceof Refusal)) throw e;
  console.error(`sync-spiel: refused: ${clean(e.message)}`);
  process.exit(1);
}
