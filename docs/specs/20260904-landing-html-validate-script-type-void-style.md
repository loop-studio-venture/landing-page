---
task: 20260904-landing-html-validate-script-type-void-style
company: loopstudio
status: ready
size: S
branch: fix/landing-html-validate-script-type-void-style
base: dev
design: none
---

# Remove redundant script type attributes and self-closing void elements in index.html

## Goal
In `index.html`, remove the unnecessary `type="text/javascript"` attribute from `<script>` tags
and rewrite void elements (`<meta>`, `<link>`, `<img>`, `<br>`) without the trailing self-closing
slash, so that `npx --yes html-validate@8 index.html` no longer reports any `script-type` or
`void-style` findings. No copy, layout, CSS, or other markup structure changes.

## Context found
- `index.html` (repo root of this worktree — there is no `landing-page/` subfolder in this
  worktree and no `CLAUDE.md` was found anywhere under it; the site is a hand-maintained former
  Webflow export served statically): a single hand-formatted, mostly single-line-per-section
  HTML document.
- `index.html:1` — the `<head>` contains one inline `<script type="text/javascript">...</script>`
  (the Webflow touch/js-mod bootstrap snippet) plus 10 self-closed `<meta .../>` tags and 4
  self-closed `<link .../>` tags.
- `index.html:178` and `index.html:259` — the `<body>` contains ~30 self-closed `<img .../>` tags
  and 3 self-closed `<br/>` tags across the nav, hero, features grid, path-to-content steps,
  tabbed feature showcase, pricing cards, how-it-works slider, and footer.
- `index.html:259` (end of `<body>`) — 4 external `<script>` tags each carry
  `type="text/javascript"`: `js/jquery-3.5.1.min.js`, `js/webflow.js`, `js/gsap.min.js`,
  `js/ScrollTrigger.min.js`.
- `index.html:1` — one `<script src="js/finsweetcomponentsconfig-1.0.3.js" type="module" ...>`
  and one inline `<script>...</script>` (the tab-progress-bar snippet inside `.code-embed-3`) do
  **not** carry `type="text/javascript"` already and must stay untouched — `type="module"` is a
  meaningful, non-default type and is out of scope for the `script-type` rule.
- Other void elements checked and confirmed absent from `index.html`: no `<hr>`, `<input>`,
  `<source>`, `<area>`, `<col>`, `<embed>`, or `<wbr>` tags in this file.
- `404.html`, `impressum.html`, `privacy-policy.html` have the same two issues (1 script-type hit
  in `404.html`; 2 each in `impressum.html`/`privacy-policy.html`) but the task brief and goal
  scope this fix to `index.html` only — left untouched per Out of scope below.
- No `.htmlvalidate.json`/`.htmlvalidaterc*` config file exists anywhere in this worktree, so
  `html-validate@8` runs with its bundled default config. Unverified assumption (not read from
  source, inferred from the brief naming `script-type` and `void-style` as the two rule
  categories to clear): the default config enables `script-type` (flag a `type` attribute on
  `<script>` that isn't needed, e.g. `text/javascript`, since JS is the implied default type) and
  `void-style` with its default style `"omit"` (flag a trailing `/` on a void element as
  disallowed). The fix below removes every instance of both patterns from `index.html`, which
  satisfies either the assumed defaults or any equivalent strict configuration.
- `serve.ps1` — a small static file server (maps extensions to a `$mime` table, serves
  `index.html` for `/`). No changes needed; used only to preview the page after edits.

## Approach
Do a pure, mechanical two-part attribute edit on `index.html`, extending no new pattern — just
removing redundant markup the Webflow exporter left in:

1. **`script-type`**: delete the ` type="text/javascript"` attribute from every `<script>` tag
   in `index.html` that carries it (the one inline bootstrap script in `<head>` and the four
   external `<script src="js/...">` tags at the end of `<body>`). Leave `<script src="...js"
   type="module" ...>` and the type-less inline `<script>` in `.code-embed-3` exactly as they
   are — they already pass the rule and are not part of this fix.
2. **`void-style`**: delete the trailing `/` from every self-closing void element in
   `index.html` — every `<meta .../>`, `<link .../>`, `<img .../>`, and `<br/>` — leaving the
   tag closed with a bare `>` (e.g. `<br/>` → `<br>`, `<img src="..." alt=""/>` →
   `<img src="..." alt="">`). Do not touch any non-void element's closing style, attribute
   order, attribute values, quoting, or the surrounding whitespace/line structure — the file
   must diff as attribute/character-level removals only, nothing reflowed or reformatted.

Rejected alternative: reformatting `index.html` with a formatter (e.g. Prettier) to fix these
rules as a side effect — rejected because it would also touch unrelated whitespace/attribute
ordering across the whole file, making the diff much larger than the two rule violations the
task asks for, and risking incidental layout/behavior changes in a file with no test coverage.

## Files to change
| File | Change | Why |
|---|---|---|
| `index.html` | Remove `type="text/javascript"` from all 5 `<script>` tags that carry it; remove the self-closing `/` from all `<meta>`, `<link>`, `<img>`, and `<br>` tags | Clears the `script-type` and `void-style` html-validate findings without altering rendered output |

## Acceptance criteria
1. `index.html` contains zero occurrences of the substring `type="text/javascript"`.
2. `index.html`'s `<script src="js/finsweetcomponentsconfig-1.0.3.js" ...>` tag still has
   `type="module"` and is otherwise unchanged (attribute values, `async`, `siteId`, `finsweet`
   attributes intact).
3. `index.html` contains zero occurrences of a `/>`-style self-closing void element (no
   `<meta ... />`, `<link ... />`, `<img ... />`, or `<br/>`/`<br />` remaining); every such tag
   ends in a bare `>`.
4. `index.html` contains no other diff versus the pre-fix version: no changed text content, no
   changed `class`/`href`/`src`/`alt`/`id`/other attribute values, no added/removed/reordered
   elements, no CSS file changes.
5. Running `npx --yes html-validate@8 index.html` from the worktree root reports no error or
   warning whose rule id is `script-type` or `void-style` for `index.html`.
6. `404.html`, `impressum.html`, and `privacy-policy.html` are byte-for-byte unchanged.
7. The page still loads and renders visually the same (nav, hero, features, pricing, slider,
   footer all present and unchanged) when served locally via `serve.ps1` and opened at
   `http://localhost:8843/` (or the script's chosen port) in a browser.

## Test plan
No automated test suite exists for this static site. The Tester must run and report, explicitly,
each of these three checks:
1. **Lint**: `npx --yes html-validate@8 index.html` (and, to confirm no regression elsewhere,
   `npx --yes html-validate@8 "*.html"` — expect `404.html`, `impressum.html`,
   `privacy-policy.html` to still show their pre-existing `script-type`/`void-style` findings,
   unchanged in count, since those files are out of scope) — confirm zero `script-type` and
   `void-style` results for `index.html` specifically.
2. **Preview**: run `serve.ps1`, load `index.html` in a browser, and visually confirm the nav,
   hero, features grid, path-to-content steps, tabbed feature showcase (including the auto-
   advancing tab-progress-bar script), pricing cards, how-it-works slider, and footer all render
   and behave as before (no visible regression from removing the self-closing slashes or the
   script `type` attributes).
3. **Link check**: confirm the in-page anchors and relative asset links (`css/...`, `fonts/...`,
   `images/...`, `js/...`, and the `index.html#section` in-page links) still resolve — no path
   was touched, so this should be unchanged from before the fix.

## Risks and open questions
- Assumption (unverified): html-validate@8 with no config file in this repo enables
  `script-type` and `void-style` by default at a severity that fails the run; this is inferred
  directly from the task brief naming those exact two rule ids as what the run currently
  reports. Does not block — the fix removes every instance of both patterns regardless of the
  exact default severity.
- Risk: this file is single-line-per-section and hand-edited; a careless find/replace on `/>`
  could accidentally strip a slash from something that is not a void element (there are none in
  this file's current content, per the Context found survey above, but the Implementer should
  still restrict the edit to the four void tag names `meta`, `link`, `img`, `br` rather than a
  blind global `/>`→`>` replace).

## Out of scope
- `404.html`, `impressum.html`, `privacy-policy.html` — same `script-type`/`void-style` findings
  exist there but are not part of this task's goal, which names `index.html` only.
- Any other html-validate rule category (e.g. anything unrelated to `script-type`/`void-style`)
  that may already be failing or start failing for unrelated reasons.
- Any reformatting, reflowing, or line-wrapping of `index.html`.
- Adding an `.htmlvalidate.json` config file to pin rule behavior — not requested and not needed
  to satisfy the stated acceptance criteria.
