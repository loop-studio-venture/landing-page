// Tests of the Apple association file on loopstudio.app. Run: node --test werkzeuge/test/
//
// Pins what a later edit could break silently: the JSON of .well-known/apple-app-site-association,
// the exact-path Content-Type rule in _headers, the /spiel/ rules next to it, and that no _redirects
// rule can answer for the path. Offline: reads the repo files only; the checks run on strings so
// the edge cases (BOM, applinks, second app, wildcard path, shadowing rule) are tested on mutations.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const AASA_PATH = '/.well-known/apple-app-site-association';
const EXPECTED = { webcredentials: { apps: ['2WUWZ23URN.app.loopstudio.ios'] } };

const read = (name) => readFileSync(join(ROOT, name), 'utf8');

// Returns the problems found in the raw text of the association file (empty = fine).
function aasaProblems(text) {
  if (text.charCodeAt(0) === 0xfeff) return ['byte-order mark'];
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return [`not JSON: ${e.message}`];
  }
  try {
    assert.deepEqual(parsed, EXPECTED);
  } catch {
    return [`content differs: ${JSON.stringify(parsed)}`];
  }
  return [];
}

// Netlify _headers: a path line at column 0, then indented "Name: value" lines; # starts a comment.
function parseHeaders(text) {
  const rules = [];
  for (const raw of text.split(/\r?\n/)) {
    if (raw.trim() === '' || raw.trim().startsWith('#')) continue;
    if (/^\s/.test(raw)) {
      const i = raw.indexOf(':');
      rules.at(-1).headers.push([raw.slice(0, i).trim().toLowerCase(), raw.slice(i + 1).trim()]);
    } else {
      rules.push({ path: raw.trim(), headers: [] });
    }
  }
  return rules;
}

// A Netlify path pattern: * is a splat, :name a one-segment placeholder.
function matches(pattern, path) {
  const re = pattern.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:[A-Za-z_]+/g, '[^/]+'));
  return new RegExp(`^${re.join('.*')}$`).test(path);
}

// Returns the problems found in the _headers text for the association file (empty = fine).
function headerProblems(text) {
  const rules = parseHeaders(text);
  const exact = rules.filter((r) => r.path === AASA_PATH);
  if (exact.length !== 1) return [`expected one exact-path rule, found ${exact.length}`];
  const problems = [];
  const types = rules
    .filter((r) => matches(r.path, AASA_PATH))
    .flatMap((r) => r.headers.filter(([name]) => name === 'content-type').map(([, value]) => value));
  if (types.length !== 1) problems.push(`${types.length} Content-Type values apply to the path`);
  else if (types[0] !== 'application/json') problems.push(`Content-Type is ${types[0]}`);
  return problems;
}

// Returns the _redirects rules whose source can match the path.
function redirectsMatching(text, path) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '' && !l.startsWith('#'))
    .filter((l) => matches(l.split(/\s+/)[0], path));
}

test('the association file is exactly the webcredentials entry of the iPhone app', () => {
  const text = read('.well-known/apple-app-site-association');
  assert.deepEqual(aasaProblems(text), []);
  assert.deepEqual(Object.keys(JSON.parse(text)), ['webcredentials']);
});

// True when a .gitignore pattern (no negations, no character classes) would ignore the path.
function ignoredBy(gitignore, path) {
  const parts = path.split('/');
  return gitignore
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== '' && !l.startsWith('#') && !l.startsWith('!'))
    .some((l) => {
      const pattern = l.replace(/^\//, '').replace(/\/$/, '');
      const anchored = l.slice(0, -1).includes('/');
      const targets = anchored ? [path] : parts; // an unanchored pattern may match any path segment
      return targets.some((t) => matches(pattern, t)) || parts.some((_, i) => matches(pattern, parts.slice(0, i + 1).join('/')));
    });
}

test('the association file is not ignored by .gitignore', () => {
  const path = '.well-known/apple-app-site-association';
  assert.equal(ignoredBy(read('.gitignore'), path), false);
});

test('the ignore check sees a rule for the folder, the file name or a wildcard', () => {
  const path = '.well-known/apple-app-site-association';
  assert.equal(ignoredBy('.well-known/\n', path), true);
  assert.equal(ignoredBy('/.well-known\n', path), true);
  assert.equal(ignoredBy('apple-app-site-*\n', path), true);
  assert.equal(ignoredBy('.*\n', path), true);
  assert.equal(ignoredBy('/docs/specs/\nwerkzeuge/og-bild/node_modules/\n', path), false);
});

test('a trailing newline still parses to the same object', () => {
  assert.deepEqual(aasaProblems(`${JSON.stringify(EXPECTED)}\n`), []);
});

test('a BOM, an applinks key, a second app id or a wrong team id fail the file check', () => {
  const json = JSON.stringify(EXPECTED);
  assert.notDeepEqual(aasaProblems(`\ufeff${json}`), []);
  assert.notDeepEqual(aasaProblems(JSON.stringify({ ...EXPECTED, applinks: { details: [] } })), []);
  assert.notDeepEqual(aasaProblems(JSON.stringify({ webcredentials: { apps: ['2WUWZ23URN.app.loopstudio.ios', 'ABCDE12345.other.app'] } })), []);
  assert.notDeepEqual(aasaProblems(JSON.stringify({ webcredentials: { apps: ['ABCDE12345.app.loopstudio.ios'] } })), []);
  assert.notDeepEqual(aasaProblems('{"webcredentials":'), []);
});

test('_headers sets application/json for the exact path', () => {
  assert.deepEqual(headerProblems(read('_headers')), []);
});

test('the /spiel/ rules in _headers are unchanged', () => {
  const spiel = parseHeaders(read('_headers')).filter((r) => r.path.startsWith('/spiel/'));
  assert.deepEqual(spiel, [
    { path: '/spiel/', headers: [['cache-control', 'no-cache']] },
    { path: '/spiel/index.html', headers: [['cache-control', 'no-cache']] },
    { path: '/spiel/game.js', headers: [['cache-control', 'public, max-age=31536000, immutable']] },
    { path: '/spiel/assets/*', headers: [['cache-control', 'public, max-age=31536000, immutable']] },
  ]);
});

test('a wildcard path, a missing rule or a shadowing Content-Type rule fails the header check', () => {
  const ok = `${AASA_PATH}\n  Content-Type: application/json\n`;
  assert.deepEqual(headerProblems(ok), []);
  assert.notDeepEqual(headerProblems('/.well-known/*\n  Content-Type: application/json\n'), []);
  assert.notDeepEqual(headerProblems('/spiel/\n  Cache-Control: no-cache\n'), []);
  assert.notDeepEqual(headerProblems(`${AASA_PATH}\n  Content-Type: text/plain\n`), []);
  assert.notDeepEqual(headerProblems(`${ok}\n/.well-known/*\n  Content-Type: text/plain\n`), []);
  assert.notDeepEqual(headerProblems(`${ok}\n/*\n  Content-Type: text/html\n`), []);
});

test('no _redirects rule matches the association path', () => {
  assert.deepEqual(redirectsMatching(read('_redirects'), AASA_PATH), []);
});

test('the redirect check sees a catch-all or a .well-known rule', () => {
  assert.equal(redirectsMatching('/* /index.html 200\n', AASA_PATH).length, 1);
  assert.equal(redirectsMatching('/.well-known/* /x 301\n', AASA_PATH).length, 1);
  assert.equal(redirectsMatching('/spiel /spiel/ 301\n', AASA_PATH).length, 0);
});
