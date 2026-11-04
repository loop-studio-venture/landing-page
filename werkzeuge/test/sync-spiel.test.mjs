// Tests of werkzeuge/sync-spiel.mjs. Run: node --test werkzeuge/test/
//
// One fixture git repo (built in a temp dir with git plumbing, so symlinks and submodule entries
// need no checkout) stands in for the private loopi-run repo; the script runs against it with
// --source, --pin-file and --out. No network, no dependency.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), '..', 'sync-spiel.mjs');
const root = mkdtempSync(join(tmpdir(), 'sync-spiel-test-'));
after(() => rmSync(root, { recursive: true, force: true }));

function git(repo, args, input) {
  const r = spawnSync('git', ['-C', repo, '-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { encoding: 'utf8', input });
  assert.equal(r.status, 0, `git ${args.join(' ')} failed: ${r.stderr}`);
  return r.stdout.trim();
}

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0xff, 0x0d, 0x0a, 0x0a]); // bytes a text filter would change
const INDEX = `<!doctype html>
<html><head>
<!-- the og image lives in /assets/ on the live host -->
<meta property="og:image" content="https://loopstudio.app/spiel/assets/vorschau.png">
<link rel="icon" href="assets/fav.png">
<style>@font-face{font-family:T;src:url(assets/font.woff2) format("woff2")}</style>
</head><body><img src="assets/lupi.png" alt="">
<a href="https://loopstudio.app">home</a>
<script src="game.js"></script></body></html>
`;
const GAME = 'const V = new URL(document.currentScript.src).search;\n';

// Build a commit from {path: {content, mode}} entries; returns the commit hash.
function commitOf(repo, files) {
  for (const [path, f] of Object.entries(files)) {
    const mode = f.mode ?? '100644';
    let sha = f.sha;
    if (!sha) {
      const r = spawnSync('git', ['-C', repo, 'hash-object', '-w', '--stdin'], { input: f.content });
      sha = r.stdout.toString().trim();
    }
    git(repo, ['update-index', '--add', '--cacheinfo', `${mode},${sha},${path}`]);
  }
  const tree = git(repo, ['write-tree']);
  const commit = git(repo, ['commit-tree', tree, '-m', 'fixture']);
  git(repo, ['read-tree', '--empty']);
  return commit;
}

const GOOD = {
  'index.html': { content: INDEX },
  'game.js': { content: GAME },
  'assets/fav.png': { content: PNG },
  'assets/font.woff2': { content: 'font' },
  'assets/lupi.png': { content: PNG },
  'assets/sub/deep.mp4': { content: Buffer.from([0, 1, 2, 3]) },
  'README.md': { content: 'not copied' },
  'werkzeuge/tool.mjs': { content: 'not copied' },
  'quellen/a.png': { content: 'not copied' },
};

let repo;
let pin;
let treeSha;
let blobSha;
let tagSha;
const refusedCommits = {};

before(() => {
  repo = join(root, 'fixture');
  mkdirSync(repo);
  git(repo, ['init', '-q']);
  pin = commitOf(repo, GOOD);
  git(repo, ['branch', '-f', 'dev', pin]);
  git(repo, ['tag', 'light', pin]);
  git(repo, ['tag', '-a', '-m', 'annotated', 'noted', pin]);
  tagSha = git(repo, ['rev-parse', 'noted']);
  treeSha = git(repo, ['rev-parse', `${pin}^{tree}`]);
  blobSha = git(repo, ['rev-parse', `${pin}:game.js`]);

  const without = (...paths) => Object.fromEntries(Object.entries(GOOD).filter(([p]) => !paths.includes(p)));
  const plus = (extra) => ({ ...GOOD, ...extra });
  const link = spawnSync('git', ['-C', repo, 'hash-object', '-w', '--stdin'], { input: 'fav.png' }).stdout.toString().trim();
  const cases = {
    'no index.html': without('index.html'),
    'no game.js': without('game.js'),
    'no assets': without('assets/fav.png', 'assets/font.woff2', 'assets/lupi.png', 'assets/sub/deep.mp4'),
    'symlink in assets': plus({ 'assets/link.png': { sha: link, mode: '120000' } }),
    'submodule in assets': plus({ 'assets/sub2': { sha: pin, mode: '160000' } }),
    'md file in assets': plus({ 'assets/notes.md': { content: 'x' } }),
    'DS_Store in assets': plus({ 'assets/.DS_Store': { content: 'x' } }),
    'game.js referenced twice': plus({ 'index.html': { content: INDEX.replace('</body>', '<script src="game.js"></script></body>') } }),
    'game.js not referenced': plus({ 'index.html': { content: INDEX.replace('src="game.js"', 'src="other.js"') } }),
    'relative reference outside assets': plus({ 'index.html': { content: INDEX.replace('</body>', '<img src="extra/x.png"></body>') } }),
  };
  for (const [name, files] of Object.entries(cases)) refusedCommits[name] = commitOf(repo, files);
});

// Run the script against the fixture; pinText is written to a pin file. Returns {r, out, outFile}.
function run(pinText, { out, extra = [] } = {}) {
  const dir = mkdtempSync(join(root, 'run-'));
  const pinFile = join(dir, 'pin.txt');
  writeFileSync(pinFile, pinText);
  const outDir = out ?? join(dir, 'spiel');
  const r = spawnSync('node', [SCRIPT, '--source', repo, '--pin-file', pinFile, '--out', outDir, ...extra], { encoding: 'utf8' });
  return { r, outDir, pinFile };
}

// A pre-existing output folder whose bytes must survive a refused run.
function sentinel() {
  const out = join(mkdtempSync(join(root, 'sentinel-')), 'spiel');
  mkdirSync(out);
  writeFileSync(join(out, 'index.html'), 'old page');
  return out;
}
const snapshot = (dir) => readdirSync(dir, { recursive: true }).sort().map((f) => `${f}:${statSync(join(dir, f)).isFile() ? readFileSync(join(dir, f), 'latin1') : ''}`).join('|');

function assertRefused(pinText, why) {
  const out = sentinel();
  const before = snapshot(out);
  const { r } = run(pinText, { out });
  assert.notEqual(r.status, 0, `${why}: expected a non-zero exit`);
  assert.match(r.stderr, /refused: .+/, `${why}: the reason is named`);
  assert.equal(snapshot(out), before, `${why}: output folder untouched`);
  assert.deepEqual(readdirSync(join(out, '..')), ['spiel'], `${why}: no temporary folder left next to the output`);
}

// ---- the happy path (criteria 2 to 5) ----

test('copies exactly index.html, game.js and assets/ and nothing else', () => {
  const { r, outDir } = run(pin + '\n');
  assert.equal(r.status, 0, r.stderr);
  const files = readdirSync(outDir, { recursive: true }).filter((f) => statSync(join(outDir, f)).isFile()).sort();
  assert.deepEqual(files, ['assets/fav.png', 'assets/font.woff2', 'assets/lupi.png', 'assets/sub/deep.mp4', 'game.js', 'index.html']);
});

test('game.js and assets are byte-identical to the blobs, index.html differs only by ?v=', () => {
  const { outDir } = run(pin);
  assert.deepEqual(readFileSync(join(outDir, 'assets/lupi.png')), PNG);
  assert.deepEqual(readFileSync(join(outDir, 'assets/sub/deep.mp4')), Buffer.from([0, 1, 2, 3]));
  assert.equal(readFileSync(join(outDir, 'game.js'), 'utf8'), GAME);
  const id = pin.slice(0, 10);
  const html = readFileSync(join(outDir, 'index.html'), 'utf8');
  assert.equal(html.split(`?v=${id}`).join(''), INDEX);
});

test('?v= is the first 10 characters of the pin on every local reference, absolute URLs stay', () => {
  const { outDir } = run(pin);
  const id = pin.slice(0, 10);
  const html = readFileSync(join(outDir, 'index.html'), 'utf8');
  assert.equal(html.split('<script src="game.js?v=' + id + '"></script>').length - 1, 1);
  assert.match(html, new RegExp(`href="assets/fav.png\\?v=${id}"`));
  assert.match(html, new RegExp(`url\\(assets/font.woff2\\?v=${id}\\)`));
  assert.match(html, new RegExp(`src="assets/lupi.png\\?v=${id}"`));
  assert.match(html, /content="https:\/\/loopstudio.app\/spiel\/assets\/vorschau.png"/);
  assert.equal(html.split('?v=').length - 1, 4);
});

test('a second run leaves no diff', () => {
  const { outDir, pinFile } = run(pin);
  const first = snapshot(outDir);
  const r = spawnSync('node', [SCRIPT, '--source', repo, '--pin-file', pinFile, '--out', outDir], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(snapshot(outDir), first);
});

test('a sync replaces what an older sync left, including files the new commit no longer has', () => {
  const out = sentinel();
  writeFileSync(join(out, 'stale.txt'), 'x');
  const { r } = run(pin, { out });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(existsSync(join(out, 'stale.txt')), false);
  assert.equal(existsSync(join(out, 'game.js')), true);
});

// ---- criterion 6: every kind of bad pin ----

const hex = (n) => 'a'.repeat(n);
const BAD_PINS = [
  ['empty file', () => ''],
  ['whitespace only', () => '  \n'],
  ['two lines', () => `${pin}\n${pin}\n`],
  ['7-character abbreviation', () => pin.slice(0, 7)],
  ['39 characters', () => pin.slice(0, 39)],
  ['41 characters', () => pin + '0'],
  ['uppercase hex', () => pin.toUpperCase()],
  ['non-hex characters', () => 'g' + pin.slice(1)],
  ['a branch name', () => 'dev'],
  ['a tag name', () => 'light'],
  ['a well-formed hash that does not exist', () => hex(40)],
  ['the hash of a tree', () => treeSha],
  ['the hash of a blob', () => blobSha],
  ['the hash of an annotated tag object', () => tagSha],
];
for (const [name, text] of BAD_PINS) {
  test(`refuses a pin that is ${name}`, () => assertRefused(text(), name));
}

test('accepts the same pin without a trailing newline and with one', () => {
  assert.equal(run(pin).r.status, 0);
  assert.equal(run(pin + '\n').r.status, 0);
});

// ---- criterion 7: refusals on the pinned commit ----

for (const name of [
  'no index.html', 'no game.js', 'no assets', 'symlink in assets', 'submodule in assets', 'md file in assets',
  'DS_Store in assets', 'game.js referenced twice', 'game.js not referenced', 'relative reference outside assets',
]) {
  test(`refuses a pinned commit with: ${name}`, () => assertRefused(refusedCommits[name], name));
}

// ---- criterion 9: --check ----

function syncedCopy() {
  const { outDir, pinFile } = run(pin);
  const copy = join(mkdtempSync(join(root, 'copy-')), 'spiel');
  cpSync(outDir, copy, { recursive: true });
  return { copy, pinFile };
}
const check = (copy, pinFile) => spawnSync('node', [SCRIPT, '--check', '--out', copy, '--pin-file', pinFile, '--source', join(root, 'no-such-source')], { encoding: 'utf8' });

test('--check passes on a synced folder without touching the source', () => {
  const { copy, pinFile } = syncedCopy();
  assert.equal(check(copy, pinFile).status, 0);
});

test('--check fails on a malformed pin', () => {
  const { copy, pinFile } = syncedCopy();
  writeFileSync(pinFile, pin.slice(0, 39));
  const r = check(copy, pinFile);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /pin must be exactly 40/);
});

test('--check fails on an entry outside index.html, game.js, assets/', () => {
  const { copy, pinFile } = syncedCopy();
  writeFileSync(join(copy, 'extra.txt'), 'x');
  assert.match(check(copy, pinFile).stderr, /unexpected entry extra.txt/);
});

for (const name of ['assets/notes.md', 'assets/.DS_Store', 'assets/sub/.gitkeep']) {
  test(`--check fails on a forbidden file (${name})`, () => {
    const { copy, pinFile } = syncedCopy();
    writeFileSync(join(copy, name), 'x');
    const r = check(copy, pinFile);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /forbidden file/);
  });
}

test('--check fails on a symlink', () => {
  const { copy, pinFile } = syncedCopy();
  symlinkSync('fav.png', join(copy, 'assets/link.png'));
  assert.match(check(copy, pinFile).stderr, /symlink/);
});

test('--check fails on a reference without the suffix', () => {
  const { copy, pinFile } = syncedCopy();
  const p = join(copy, 'index.html');
  writeFileSync(p, readFileSync(p, 'utf8').replace(/(href="assets\/fav.png)\?v=[0-9a-f]{10}"/, '$1"'));
  assert.match(check(copy, pinFile).stderr, /does not carry exactly \?v=/);
});

test('--check fails on a reference with another id', () => {
  const { copy, pinFile } = syncedCopy();
  const p = join(copy, 'index.html');
  writeFileSync(p, readFileSync(p, 'utf8').replace('game.js?v=' + pin.slice(0, 10), 'game.js?v=' + hex(10)));
  assert.match(check(copy, pinFile).stderr, /does not carry exactly \?v=/);
});

test('--check fails on a referenced asset that is missing', () => {
  const { copy, pinFile } = syncedCopy();
  rmSync(join(copy, 'assets/lupi.png'));
  assert.match(check(copy, pinFile).stderr, /referenced file assets\/lupi.png is missing/);
});

test('--check fails when the folder does not exist', () => {
  const { pinFile } = syncedCopy();
  assert.notEqual(check(join(root, 'absent'), pinFile).status, 0);
});

// ---- criterion 8: no network, no dependency, no credential ----

test('the script imports only node: built-ins and touches no package manifest', () => {
  const src = readFileSync(SCRIPT, 'utf8');
  const specs = [...src.matchAll(/^import[^;]*?from '([^']+)'/gms)].map((m) => m[1]);
  assert.ok(specs.length > 0);
  for (const s of specs) assert.match(s, /^node:/);
  assert.doesNotMatch(src, /\bfetch\(|https?\.request|node:https?|node:net/);
  const dir = join(dirname(SCRIPT), '..');
  for (const f of ['package.json', 'package-lock.json']) assert.equal(existsSync(join(dir, f)), false);
});

test('a URL with credentials in --source is never printed with them', () => {
  const dir = mkdtempSync(join(root, 'cred-'));
  const pinFile = join(dir, 'pin.txt');
  writeFileSync(pinFile, hex(40));
  const r2 = spawnSync('node', [SCRIPT, '--source', 'https://user:secret-token@127.0.0.1:9/x.git', '--pin-file', pinFile, '--out', join(dir, 'spiel')], { encoding: 'utf8' });
  assert.notEqual(r2.status, 0);
  assert.doesNotMatch(r2.stdout + r2.stderr, /secret-token/);
});
