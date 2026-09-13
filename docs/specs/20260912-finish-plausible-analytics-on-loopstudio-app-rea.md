---
task: 20260912-finish-plausible-analytics-on-loopstudio-app-rea
company: loopstudio
status: ready
size: M
branch: fix/finish-plausible-analytics-on-loopstudio-app-rea
base: dev
design: none
---

# Finish Plausible Analytics on loopstudio.app: the real per-site snippet on four pages, four events, privacy sentence, ADR 0008

## Goal
Actually ship what `20260911-add-plausible-analytics-to-loopstudio-app-landin` only specified. Paste
the real per-site Plausible snippet (supplied with this brief) into the four root pages
(`index.html`, `impressum.html`, `privacy-policy.html`, `404.html`), wire the four approved
conversion events into a new `web/messen.js` loaded by `index.html`, add the one English privacy
sentence, and make sure ADR 0008 reaches `knowledge-base` instead of being dropped a second time.
The design is the one approved at gate 1 on 2026-09-11; this task changes it only where the real
snippet forces it (see *Deviations*).

**The snippet that blocked the earlier run is now in hand**, verbatim from Plausible → Site settings
→ General → Site installation:

```html
<!-- Privacy-friendly analytics by Plausible -->
<script async src="https://plausible.io/js/pa-qSPICwq-9lY3y-6CiZuOi.js"></script>
<script>
  window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
  plausible.init()
</script>
```

Three elements — an HTML comment, an `async` external script, and an inline script that defines the
`window.plausible` queue and calls `plausible.init()`. This block is called **the snippet** below.
It is public by nature (it ships in every visitor's page source) and is not a credential.

## Assumptions
- **The snippet above is complete and final**, copied from the brief's constraints section without
  reformatting. It is `async`, not `defer`; its host is `plausible.io`; no optional extension
  (outbound links, file downloads, 404s, hashed pages, revenue) is switched on for this site, per
  Christian. **Unverified** by me: I have no web access and cannot fetch
  `https://plausible.io/js/pa-qSPICwq-9lY3y-6CiZuOi.js` to see what it instruments.
- **The snippet already defines `window.plausible`**, so `web/messen.js` only needs a guarded
  fallback, never a redefinition, and must never call `plausible.init()` a second time (that would
  risk a duplicate pageview).
- **Script order inside the block does not matter.** The inline block runs at parse time, a few bytes
  after the `async` tag is seen, so in practice it defines the queue first; and if the external
  script ever won the race, its own `window.plausible` survives the inline `||` guard. Either order
  leaves one working queue. **Unverified** against the script's source, but true of both branches of
  the `||`.
- **A pre-installed test recorder survives the snippet.** `window.plausible=window.plausible||…`
  keeps a `window.plausible` installed by `page.addInitScript`; `plausible.init` is then attached to
  that recorder function and `plausible.init()` merely sets `recorder.o = {}`. So the recorder setup
  in the *Test plan* observes every call. **Unverified** only in the sense that I could not run it.
- **The brief's `calenderly.event_scheduled` is a typo for `calendly.event_scheduled`.** The approved
  20260911 spec spells it `calendly.` in all three places, and that is the prefix react-calendly's
  typings use. **Unverified** against Calendly's own docs.
- **`web/messen.js` does not exist yet** and no page carries a Plausible reference: `web/` holds
  `bewegung.js`, `seite.js`, `lego.js`, the CSS and the two workbench HTML files, and a repo-wide
  search for `plausible` matches only the two spec files under `docs/specs/`. The 20260911 task
  really did produce nothing but its spec.
- **ADR 0008 was never written**: `knowledge-base/architecture/decisions/` holds 0001–0007 with no
  gap, and `knowledge-base/README.md:13` still reads `## Index (18 documents)`. So 0008 is free and
  the index goes 18 → 19.
- **The 20260911 gate-1 approval stands.** Its four event names, selectors, 1000 ms navigation
  fallback, "one new file, `bewegung.js`/`seite.js` untouched" split and privacy sentence are settled
  and are restated here verbatim rather than re-opened.
- **The html-validate baseline is whatever the merge-base actually reports.** The brief says 145
  errors; that figure appears nowhere in this repo (the 20260904 and 20260908 specs name the *rules*,
  never a count). The Tester captures it on the merge-base commit and compares. **Unverified.**
- **"Every page" means the four root pages.** `web/lego-demo.html` and `web/monster-buehne.html` are
  internal workbenches (`web/README.md`) and stay untouched.
- **The knowledge-base checkout is shared and sits on `main`.** ADR 0007's precedent: an ADR is a
  second, independent commit in that repo, not part of the landing branch's diff. The Implementer may
  commit there but must not push, mirroring the landing no-push rule. **Unverified** which branch
  Christian wants it on if `main` is dirty — criterion 27 covers both outcomes.
- **"Done"** means the criteria below hold on the `serve.ps1` preview and on the PR's Netlify deploy
  preview, and that the ADR is either committed in `knowledge-base` or handed over verbatim in the PR
  description — never silently skipped.

Correct me at gate 1, otherwise I proceed with these.

## Context found
- **Gate 1 on this spec: approved by Christian via the front desk on 2026-09-13**, handled directly
  there instead of him searching the full Notion board. The approval carried no correction: no
  assumption above was overturned and no criterion, file or scope line below was changed, so the
  design stands exactly as written and this is the approved version the Implementer builds from.
- `docs/specs/20260911-add-plausible-analytics-to-loopstudio-app-landin.md`: the approved spec this
  one finishes. Its research is reused, not redone; every line reference below was re-confirmed
  against the current worktree today.
- `CLAUDE.md` (landing): no build step, no test suite; three verification checks (html-validate,
  `serve.ps1` preview at desktop and phone width, link check), reported explicitly. "No third-party
  scripts, trackers, or fonts from external hosts without a recorded decision" — ADR 0008 is that
  record. Legal pages change only on Christian's instruction; this brief is that instruction.
- `index.html:40–43` — `<link rel="icon">`, `<link rel="icon" sizes="32x32">`,
  `<link rel="apple-touch-icon">`, then `</head>` on line 43. No CSP `<meta>` in the head, so nothing
  in-page blocks an external script.
- `index.html:579–584` — body scripts in order: `web/lib/gsap.min.js`, `web/lib/ScrollTrigger.min.js`,
  `web/lib/lenis.min.js`, `web/lego.js`, `web/seite.js`, `web/bewegung.js`, then `</body>` on 585.
  `web/messen.js` goes after 584.
- `index.html` CTAs, all re-read today:
  - booking: `a[href="#gespraech"]` at 58 (nav `.nav__rechts`), 96 (hero `.held__cta`), 428 / 437 /
    445 (the three `.paket2` cards), plus `<button type="button" id="rufKnopf">` at 562 inside the
    footer `<footer class="fuss" id="gespraech">` (552) — six triggers;
  - into the app: 59 `#navTool`, 71 (mobile menu), **97** `.held__cta a.btn--rand` ("Loop Studio
    ausprobieren"), **413** the only `<a>` inside `.preiskarte` (402, `id="toolpreis"`) — "Jetzt
    starten" — and 573 (footer "Zum Tool"); all five point at `https://app.loopstudio.app/login`;
  - `#dlForm` at 496: one `<input type="email" required>` and a submit button "PDFs schicken"; the
    markup comment just after says the form has no backend.
- `web/bewegung.js:90–98`: `kalenderOeffnen` is bound to `a[href="#gespraech"], #rufKnopf`, calls
  `preventDefault()`, lazy-loads `assets.calendly.com` on first click (8 s timeout, lines 54–88) and
  falls back to `window.open` / `location.href` (`calAusweichen`, 42–52). Lines 99–107 bind smooth
  scroll to `a[href^="#"]` except `#gespraech`. Absolute app links are untouched by this file.
- `web/seite.js:45–46`: the `#dlForm` submit handler calls `preventDefault()` and sets the button to
  `Unterwegs ✓`, disabled.
- `impressum.html`, `privacy-policy.html`, `404.html`: Webflow exports whose `</head>` sits at the end
  of **line 1**, directly after `…_Frame%202.png" rel="apple-touch-icon"/></head>` (confirmed: exactly
  one match of `apple-touch-icon…/></head>` in each of the three files, all on line 1). They load
  `js/jquery-3.5.1.min.js` and `js/webflow-legal.js`, both with a redundant
  `type="text/javascript"` — a pre-existing html-validate `script-type` finding, part of the baseline.
  Neither file contains a tracker.
- `privacy-policy.html:178` — a single very long line. It carries the end of the page `<style>`, the
  nav, and the whole rich-text body. The Preamble paragraph ends
  `… accessible under the domain <a href="https://loopstudio.app/"><strong>loopstudio.app</strong></a>.</p>`
  and is immediately followed, on the same line, by
  `<h2 class="heading-style-h3">1. Name and address of the person responsible</h2>`. That `</p><h2`
  boundary, inside `<div class="rich-text-block w-richtext">`, is the insertion point. Section 5
  ("Use of cookies") still describes analysis cookies and an info banner that do not exist —
  pre-existing, the lawyer's rewrite.
- No `.htmlvalidate.json` / `.htmlvalidaterc*` anywhere in the worktree, so `html-validate@8` runs its
  bundled default config (`docs/specs/20260904-…`, which also documents that a `<script>` with no
  `type` is clean and a `type="text/javascript"` is not). The snippet's inline block has no `type`.
- `knowledge-base/architecture/decisions/0007-landing-page-motion-stack-and-calendly-widget.md`: the
  format ADR 0008 copies (Status / Context / Decision / Rejected alternative / Consequences /
  Related) and the precedent that Calendly is "the only external host permitted on the page".
- `knowledge-base/README.md:13` reads `## Index (18 documents)`; line 32 is the 0007 entry, the last
  under "**Decisions (ADRs)**"; rule 5 (line 11) requires the index entry and a `## Related` section.

## Approach
Same design as the approved 20260911 spec, now written against the real snippet. Three edits to the
landing repo plus one ADR, described here in full so this document stands on its own.

**1. The snippet on four pages.** Paste the block **verbatim** — comment line, `async`, attribute
order, quoting, indentation, the missing semicolon after `plausible.init()` — directly before
`</head>`:
- `index.html`: on its own lines between line 42 (`apple-touch-icon`) and line 43 (`</head>`).
- `impressum.html`, `privacy-policy.html`, `404.html`: at the end of line 1, immediately before the
  `</head>` that closes it.

Nothing is retyped from memory, nothing is minified, nothing is "tidied", and the legacy
`data-domain` script is not used anywhere.

*Consequence to expect, not to fix:* inserting a multi-line block into the three one-line exports
turns their line 1 into several lines, so `git diff` shows one huge line replaced by one huge line
plus the block. That is cosmetic. The mechanical check is criterion 23: delete the inserted block
again and the file must be byte-identical to the merge-base. Do **not** collapse the block to one
line to keep the diff pretty — "verbatim" wins.

**2. Events in one new file, `web/messen.js`, loaded only by `index.html`**, as the last script tag
after `web/bewegung.js` (line 584). `web/bewegung.js` and `web/seite.js` stay byte-identical —
`messen.js` attaches its own listeners beside theirs. Comments in German with ae/oe/ue, like its
siblings. At the top, a guarded fallback only (the head snippet has already defined the real one):

```js
window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
```

`messen.js` never calls `plausible.init()` — the head snippet owns initialisation and the pageview.
Every event call reads `window.plausible` at fire time, never a cached reference, so a recorder
installed before load receives all calls.

| Event name | Fires when | Hooked where |
|---|---|---|
| `Book Call Click` | any of the six booking triggers is clicked, whether or not Calendly then loads | `click` on `a[href="#gespraech"], #rufKnopf` |
| `Call Booked` | window `message` with `origin === 'https://calendly.com'` and `data.event === 'calendly.event_scheduled'` | `message` listener |
| `App Start Click` | "Loop Studio ausprobieren" (`.held__cta a.btn--rand`) or "Jetzt starten" (`.preiskarte a.btn`) is clicked | `click` listener |
| `PDF Request` | `#dlForm` is submitted (native `required` / `type=email` blocks invalid submits first) | `submit` listener |

Not tracked: nav and mobile "Login", footer "Zum Tool", "Paket ansehen", in-page anchors, `mailto:`,
the monster toy button, the FAQ, the stations toggles.

**Navigating links.** `App Start Click` fires on a link that leaves the page. For a primary click
with no modifier key the handler (a) calls `preventDefault()`, (b) calls
`window.plausible('App Start Click', { callback: go })`, (c) starts a 1000 ms timer that also calls
`go`. `go` runs once and sets `window.location.href` to the link's own `href`. With Ctrl, Meta or
Shift held it only records the event and leaves the browser default alone. **The timer, not the
callback, is what guarantees navigation**: if the per-site script ignores the `callback` option, the
click costs up to a second of latency but never a broken link.

**3. One privacy sentence.** A new `<p>` at the `</p><h2` boundary on `privacy-policy.html:178`,
exactly: *"To measure how this website is used, we use Plausible Analytics, an EU-hosted web
analytics service that sets no cookies and stores no personal data."* English, because this page is
English-only. Placed in the Preamble, not inside the self-contradicting section 5. The PR flags it
"lawyer to confirm".

**4. ADR 0008 — the part that got dropped last time.** Two belts:
- **Belt 1, in this repo, already done**: the complete ADR body is in *Appendix A* below, with the
  real URL and host already substituted, so the text is committed to `dev` with this spec and cannot
  be lost whatever happens in the other checkout.
- **Belt 2, in `knowledge-base`**: the Implementer runs `git -C C:\code\loopstudio\knowledge-base
  status --porcelain` and `git -C C:\code\loopstudio\knowledge-base branch --show-current` first.
  Only if the output is empty and the branch is `main` does it write
  `architecture/decisions/0008-plausible-analytics-on-the-landing-page.md` from Appendix A, add the
  index line to `README.md`, bump "18 documents" to "19", and commit **without pushing**. Otherwise
  it writes nothing there.

Either way the PR description carries the verbatim ADR text, the two `README.md` edits and the exact
commands — so "hand it to Christian" is a paste, not a rewrite. A run that ends with neither a
knowledge-base commit nor that PR section fails criterion 27.

**Deviations from the approved 20260911 spec** (only these):
- Its criterion 1 required `defer`; the real snippet uses `async`. Verbatim wins: `async` it is.
- Its criterion 2 offered the legacy `data-domain` script as the default. That option is gone.
- Its criterion 8 had `messen.js` define the queue wrapper. The head snippet defines it now, so
  `messen.js` only guards, and must not re-init.
- Its ADR step was a stop condition ("stop the ADR part only, put the full text in the report"). That
  is what let the ADR vanish. It is now a hard criterion with the text pre-drafted in Appendix A.
- Its criterion 22 named the merge-base as `ded8462`. This branch has its own; the Tester reads it
  with `git merge-base HEAD origin/dev` and reports the SHA rather than reusing that one.

**Rejected:** editing `web/bewegung.js` / `web/seite.js` instead of adding `messen.js` (two large,
actively edited files for a two-line gain); Plausible's tagged-events CSS classes (needs another
script extension); tracking every app link (Login is not a conversion); a hostname guard in code
(that belongs in Plausible's own site settings); re-deriving the ADR text at implementation time
(exactly the step that failed last time); collapsing the snippet to one line for a tidier diff.

## Files to change
| File | Change | Why |
|---|---|---|
| `index.html` | the snippet between lines 42 and 43; `<script src="web/messen.js"></script>` after line 584 | script on every page; events |
| `impressum.html` | the snippet at the end of line 1, before `</head>` | script on every page |
| `privacy-policy.html` | the snippet at the end of line 1; one `<p>` at the `</p><h2` boundary on line 178 | script; privacy sentence |
| `404.html` | the snippet at the end of line 1, before `</head>` | script on every page |
| `web/messen.js` | new, ~40 lines, German comments: guarded queue fallback, four listeners, navigation helper | events |
| `C:\code\loopstudio\knowledge-base\architecture\decisions\0008-plausible-analytics-on-the-landing-page.md` | new, from Appendix A (separate checkout, commit only, no push) | "recorded decision" rule |
| `C:\code\loopstudio\knowledge-base\README.md` | one index line after the 0007 entry; "Index (18 documents)" → "(19 documents)" | index rule |

## Acceptance criteria
1. Each of `index.html`, `impressum.html`, `privacy-policy.html` and `404.html`, as served by
   `serve.ps1`, contains the snippet exactly once, inside `<head>`, character-for-character identical
   to the block quoted in *Goal* (comment line, `async`, attribute order, quoting, indentation,
   line breaks).
2. In all four pages the count of `<script>` elements whose `src` is
   `https://plausible.io/js/pa-qSPICwq-9lY3y-6CiZuOi.js` is exactly 1, and the count of inline scripts
   containing `plausible.init()` is exactly 1.
3. No file in the repo contains a `data-domain="loopstudio.app"` script, a Plausible API key, the
   string `PLAUSIBLE_API_KEY`, a `data-api` attribute, or a proxy path for the script.
4. No page references `googletagmanager.com`, `google-analytics.com`, a `gtag(` call, or any
   consent-management script.
5. `web/lego-demo.html` and `web/monster-buehne.html` are unchanged and contain no Plausible
   reference.
6. On a fresh load of each of the four pages with no interaction, every request to a host other than
   the page's own origin goes to `plausible.io`.
7. `index.html` loads `web/messen.js` exactly once, after `web/bewegung.js`. No other page loads it.
8. `web/messen.js` assigns to `window.plausible` only when `window.plausible` is not already a
   function. With the snippet present, the function object in `window.plausible` before
   `web/messen.js` runs is the same object after it runs.
9. `web/messen.js` never calls `plausible.init`, and a fresh load of `index.html` produces exactly one
   pageview request to `plausible.io` (not two).
10. Every event call in `web/messen.js` reads `window.plausible` at fire time, so a recorder installed
    before page load receives all calls.
11. One click on any of the six booking triggers — `.nav__rechts a[href="#gespraech"]`,
    `.held__cta a[href="#gespraech"]`, each of the three `.paket2 a[href="#gespraech"]`, and
    `#rufKnopf` — makes exactly one call `window.plausible('Book Call Click')` with one argument.
    This holds whether `assets.calendly.com` loads or is blocked.
12. After a booking click, behaviour is unchanged from the merge-base: the Calendly popup opens, or,
    with `assets.calendly.com` blocked, the existing `window.open` fallback runs.
13. A window `message` with `origin === 'https://calendly.com'` and
    `data.event === 'calendly.event_scheduled'` makes exactly one call
    `window.plausible('Call Booked')`. A message from any other origin, or with any other
    `data.event` (e.g. `calendly.event_type_viewed`), makes no call.
14. A primary click without modifier keys on `.held__cta a.btn--rand` or `.preiskarte a.btn` makes
    exactly one call whose first argument is `'App Start Click'` and whose second is an object with a
    `callback` function. The same tab then navigates to `https://app.loopstudio.app/login`:
    immediately if the callback is invoked, and no later than 1000 ms after the click if it never is
    (test tolerance 1500 ms).
15. A Ctrl-, Meta- or Shift-click on those two links makes exactly one `'App Start Click'` call and
    does not call `preventDefault()`; the landing page stays on screen.
16. Clicking `#navTool`, the mobile-menu "Login", the footer "Zum Tool", "Paket ansehen", any in-page
    anchor or the `mailto:` link makes no `window.plausible` call.
17. Submitting `#dlForm` with a valid email makes exactly one call `window.plausible('PDF Request')`,
    and the button still shows `Unterwegs ✓` and is disabled. Submitting with an empty or invalid
    email makes no call.
18. A fresh load of `index.html` plus scrolling to the bottom, with no clicks, makes no
    `window.plausible` call from `web/messen.js`.
19. With `plausible.io` blocked, every interaction in criteria 11–17 behaves as on the merge-base, the
    app links still navigate within 1000 ms, and the console shows no error from `web/messen.js`.
20. `web/bewegung.js` and `web/seite.js` are byte-identical to the merge-base.
21. After a fresh load of each page plus a booking click, a Ctrl-click on "Jetzt starten" and a valid
    `#dlForm` submit, `document.cookie` is empty and the browser context holds no cookie for the
    page's host or for `plausible.io`. Cookies set by `calendly.com` inside its own popup are reported
    as pre-existing and do not fail this criterion.
22. `privacy-policy.html` contains, verbatim and as its own `<p>`, directly after the Preamble
    paragraph that ends "…under the domain loopstudio.app." and before the
    `<h2 class="heading-style-h3">1. Name and address of the person responsible</h2>`:
    *To measure how this website is used, we use Plausible Analytics, an EU-hosted web analytics
    service that sets no cookies and stores no personal data.*
23. Removing exactly the inserted text from each branch file yields a file byte-identical to the same
    file at the merge-base: for `impressum.html` and `404.html` the snippet alone; for
    `privacy-policy.html` the snippet plus the one `<p>`; for `index.html` the snippet plus the
    `web/messen.js` script tag. No other file in the repo differs from the merge-base except the new
    `web/messen.js` and this spec.
24. `npx --yes html-validate@8 "*.html"` reports no finding that is not already reported on the
    merge-base commit, both runs captured in the same session and both counts stated.
25. Every relative link and asset on the four pages resolves on the `serve.ps1` preview, with no new
    404 in the server window or the browser console.
26. The four pages look unchanged from the merge-base at 1440 px and 390 px, except for the new
    paragraph on `privacy-policy.html`.
27. ADR 0008 is delivered, provably, by **one** of these two routes, and the report names which:
    - **committed**: `knowledge-base/architecture/decisions/0008-plausible-analytics-on-the-landing-page.md`
      exists with the Appendix A text, `knowledge-base/README.md` has the 0008 index line after the
      0007 line and reads "Index (19 documents)", and the report shows the commit SHA and
      `git -C … show --stat`; or
    - **handed over**: the PR description contains the complete ADR text, both `README.md` edits and
      the exact write+commit commands, and the report states why the checkout was not written to.
    A run in which neither holds fails this criterion.
28. ADR 0008's body has the sections Status, Context, Decision, Rejected alternative, Consequences,
    Related; names `plausible.io` as a permitted external host alongside Calendly; lists the four
    event names; records that the 2026-09-08 "no off-origin request on load" rule now excludes
    `plausible.io`; and links ADR 0007 under Related.

## Test plan
There is no test suite and no test directory in this repo, so the Test Writer writes no files. The
checks are the three from `CLAUDE.md`, reported by name, plus one ad hoc browser run:
1. `npx --yes html-validate@8 "*.html"` — first on `git merge-base HEAD origin/dev` to capture the
   baseline, then on the branch; diff the two outputs (criterion 24).
2. `.\serve.ps1`, then all four pages at 1440 px and 390 px (criteria 25, 26).
3. A link and asset check on the four pages (criterion 25).
4. A one-off Playwright script (`npx --yes playwright@1`, not committed) in two setups:
   - **Recorder setup** — abort every request to `plausible.io`, and `page.addInitScript` a
     `window.plausible` that pushes its arguments into `window.__calls`. The head snippet's
     `window.plausible||…` keeps that recorder, and its `plausible.init()` only sets `.o` on it, so
     the recorder sees every call; criteria 8 and 10 make that a requirement, not a coincidence.
     Criterion 14 needs two runs, one where the recorder invokes `arguments[1].callback()` and one
     where it never does. Criterion 13 dispatches
     `new MessageEvent('message', { origin: 'https://calendly.com', data: { event: 'calendly.event_scheduled' } })`
     plus two negative variants.
   - **Real-script setup** for criteria 6, 9 and 21. On `localhost` and under WebDriver the Plausible
     script loads but may drop events; that is expected — this setup proves requests and cookies, not
     delivery. Criterion 9 counts requests to `plausible.io` that are not the script file itself.

## What to click
1. Nav, hero, a package card and the footer calendar button: the Calendly popup opens exactly as on
   the live site.
2. "Loop Studio ausprobieren" and "Jetzt starten": each lands on the app login page with no
   noticeable delay.
3. Submit the PDF form with an email: the button turns into `Unterwegs ✓` as before.
4. Privacy page: the new Plausible sentence stands as its own paragraph under the preamble, in the
   page's normal text style.
5. Plausible's realtime view for `loopstudio.app` shows the preview visit plus `Book Call Click` and
   `App Start Click`.

## Verification and evidence
The close-out shows the evidence, not a claim:
- **1–2**: per page, `(Invoke-WebRequest http://localhost:8843/<page>).Content` with the matched block
  pasted in, plus a character-level comparison of the inserted block against the string in *Goal*, and
  the two counts.
- **3–5**: the repo-wide grep commands with their empty output. `gtag\(` is searched **with** the
  parenthesis — a bare `gtag` also matches `Symbol.toStringTag` in `js/webflow-legal.js`.
- **6, 9**: the Playwright request list per page on a fresh load, real-script setup, with the
  non-script `plausible.io` requests counted.
- **8, 10–19**: the `window.__calls` dump after each scripted interaction; the identity check for
  criterion 8 (`window.plausible` captured before and after `messen.js`); navigation timestamps for
  criterion 14 in both callback modes; `defaultPrevented` for criterion 15; the console log for 19.
- **20, 23**: `git diff <merge-base> --stat` for the whole repo, plus
  `git diff <merge-base> -- web/bewegung.js web/seite.js` (empty), plus, for each of the four pages,
  the strip-and-compare result (the block removed again and the file hashed against the merge-base
  blob).
- **22**: the pasted paragraph in its context on line 178.
- **24**: both html-validate outputs side by side, with the merge-base SHA and both finding counts
  named. If the merge-base count is not 145, say so rather than quietly adopting the brief's number.
- **25–26**: the three `CLAUDE.md` checks reported by name, with before/after screenshots at 1440 px
  and 390 px.
- **27–28**: either the knowledge-base commit SHA plus `git -C … show --stat` and the README diff, or
  the PR-description section containing the full ADR text and the exact commands.
- **Deploy preview**: the snippet in view-source on each page, the network panel showing
  `pa-qSPICwq-9lY3y-6CiZuOi.js` with status 200, and, in a normal (non-WebDriver) browser, a click
  that sends an event request. The preview URL is named. If deploy previews are off, the report says
  so rather than dropping the row.
- **PR description** carries: the merge-base SHA, "privacy sentence: lawyer to confirm", the ADR
  hand-off section (always), and the reminder that the four goals still have to be created in the
  Plausible UI.

## Will not do
- No `git checkout`, `rebase`, `merge` or `push` in any repo; `main` and `dev` are off limits; the
  knowledge-base commit is not pushed either.
- No cookie banner, no consent tool, no Google Analytics or Tag Manager, no other tracker.
- No proxy for the script or the event endpoint; no `netlify.toml`, `_headers` or `_redirects`.
- No Plausible API calls: no creating sites or goals, no API key anywhere in the repo.
- No retyping, minifying, reformatting or "correcting" the supplied snippet, and no fallback to the
  legacy `data-domain` script.
- No edits to `web/bewegung.js`, `web/seite.js`, any `web/*.css`, the minified Webflow CSS/JS, or
  `web/*.html`.
- No copy, layout, design or legal-text change beyond the one privacy sentence.
- No work in `loop-studio-frontend`, `loop-studio-backend` or `agent-cluster`.
- No new dependency, no `package.json`, no build step; the Playwright script is ad hoc and not
  committed.

## Stop conditions
- The served `pa-qSPICwq-9lY3y-6CiZuOi.js` visibly instruments things this task did not scope — an
  extra event on an outbound-link click, a file download or a 404. Stop and report; Christian said no
  extensions are switched on, so a mismatch means the site settings changed.
- `window.plausible('Name')` from the queue produces no request at all on the deploy preview in a
  normal browser, i.e. the per-site script's custom-event API differs from the queue the snippet
  itself installs. Stop and report before rewriting `web/messen.js`.
- Adding the snippet introduces an html-validate finding that is not on the merge-base (criterion 24).
  Stop and report the rule and line rather than editing the snippet to satisfy the linter — the block
  is verbatim by instruction, and dropping or changing an attribute is Christian's call.
- Calendly's docs or a real message capture show a different event name than
  `calendly.event_scheduled`, or a different origin than `https://calendly.com`. Stop and ask; do not
  silently rename or drop `Call Booked`.
- Any of criteria 12–19 shows a behaviour change against the merge-base. Stop instead of patching
  `web/bewegung.js` or `web/seite.js`.
- `git -C C:\code\loopstudio\knowledge-base status --porcelain` is non-empty, or the branch is not
  `main`. Write nothing there; take the hand-over route of criterion 27 and say why.
- The deploy preview blocks `plausible.io` through a CSP set in Netlify's UI. Stop and report; do not
  add headers.
- The html-validate baseline cannot be captured (e.g. `npx` has no network). Stop — "no new finding"
  cannot be proven without it.

## Risks and open questions
- **The `callback` option may not exist in the per-site script's API.** Then criterion 14's first half
  (immediate navigation) never triggers and every app-CTA click waits the full 1000 ms before leaving
  the page. Not broken, but perceptible. The recorder test proves the argument is passed; only the
  real script proves it is honoured. **Does not block.**
- **`calendly.event_scheduled` is unverified.** The brief spells it `calenderly.`; the approved
  20260911 spec spells it `calendly.`, and only a real booking on the live site would settle it —
  which would put an appointment in Christian Arns' calendar. The synthetic test proves the listener;
  the first real booking after deploy proves the name. **Does not block**; gate 1 passed without a
  correction to the spelling, so `calendly.` stands.
- **The script id in the snippet is site-specific.** If `loopstudio.app` is ever removed and re-added
  in Plausible, the URL changes and the four pages must be edited again. There is no include
  mechanism in this repo to avoid that. **Does not block**; ADR 0008 records it.
- **Preview and other hostnames count as `loopstudio.app`.** The script reports under the configured
  site from any host, so deploy-preview clicks — gate 3 included — land in the real stats. The fix is
  Plausible's own hostname allowlist in site settings (**unverified** feature name), which Christian
  sets in the UI. **Does not block.**
- **Ad blockers block `plausible.io`**, so numbers undercount. A proxy would fix it; the brief excludes
  one. **Does not block.**
- **The privacy page contradicts itself** until the lawyer's rewrite: section 5 still claims analysis
  cookies and an info banner while the new sentence says cookieless. The sentence is correct, section
  5 is not. **Does not block**; the PR flags it.
- **The start page does not link to the privacy page** (`index.html:573`, footer "Datenschutz" is
  `href="#"`), so the new sentence is unreachable from the start page. Pre-existing; a one-attribute
  fix. **Does not block**; gate 1 passed without asking for it, so it stays out of scope.
- **Criterion 26 (visual parity) is not machine-checkable** and is not a click-check either — it is the
  Tester's before/after screenshot comparison at 1440 px and 390 px, named here so it is not mistaken
  for an automated result.
- **The `145` html-validate baseline from the brief is not reproduced anywhere in this repo.** The
  Tester measures it instead of asserting it. **Does not block.**
- **The knowledge-base checkout is shared.** A concurrent session may have it dirty. Criterion 27's
  second route covers that — the whole point of the two belts. **Does not block.**

## Out of scope
- Creating the four goals in Plausible and setting a hostname allowlist — Christian does these in the
  UI. (Adding the site itself is done; the snippet above is the proof.)
- The digests that use `PLAUSIBLE_API_KEY` in `agent-cluster`.
- Outbound-link, file-download, 404, revenue and custom-property tracking.
- Analytics inside the app (`app.loopstudio.app`, `loop-studio-frontend`).
- The lawyer's rewrite of the privacy policy, a German Datenschutz page, translating the legal pages.
- Fixing the footer's `href="#"` Impressum and Datenschutz links.
- Connecting the PDF form to a backend.
- The internal workbenches `web/lego-demo.html` and `web/monster-buehne.html`.

---

## Appendix A — ADR 0008, full text

Write this, unchanged, to
`C:\code\loopstudio\knowledge-base\architecture\decisions\0008-plausible-analytics-on-the-landing-page.md`.
It is reproduced here so the text is committed to `dev` with this spec and survives even if the other
checkout cannot be written. (The outer fence below is four backticks; the file's own content starts
at `# 0008.` and ends after the last `## Related` bullet.)

````markdown
# 0008. Plausible Analytics on the landing page

## Status

**Implemented** (on branch `fix/finish-plausible-analytics-on-loopstudio-app-rea` in `landing`,
task `20260912-finish-plausible-analytics-on-loopstudio-app-rea`, which finished the design
approved in task `20260911-add-plausible-analytics-to-loopstudio-app-landin`). This ADR lives in
`knowledge-base`, a separate git repository/checkout from `landing`, so it is a second,
independent commit — not part of that branch's diff, exactly as ADR 0007 was handled.

## Context

`landing` (loopstudio.app) had no analytics at all: nobody could say how many people reached the
page, or how many of them clicked "Gespräch buchen" before booking. At the same time
`landing/CLAUDE.md` forbids third-party scripts and trackers "without a recorded decision", and the
compliance work of 2026-09-08 had just established that a fresh page load makes no request to any
host other than the page's own origin. Adding any analytics therefore needed a decision on the
record, not a quiet script tag.

The constraints were set by Christian: a hosted, EU-based, cookieless service; no cookie banner and
no consent tool; no Google Analytics or Tag Manager; no API key in the site; no self-hosting and no
proxy. Plausible is the service Venture Labs already uses.

One implementation detail shaped the work: since October 2025 Plausible issues a **per-site**
tracking snippet instead of the generic `data-domain` script, and that snippet only exists once the
site has been added in the Plausible dashboard. The first attempt at this task (2026-09-11) produced
a spec and stopped for exactly that reason; the site was then added and this ADR is written from the
real snippet.

## Decision

Load Plausible Analytics on the four root pages of `landing` — `index.html`, `impressum.html`,
`privacy-policy.html`, `404.html` — using the per-site snippet issued for `loopstudio.app`:

```html
<!-- Privacy-friendly analytics by Plausible -->
<script async src="https://plausible.io/js/pa-qSPICwq-9lY3y-6CiZuOi.js"></script>
<script>
  window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
  plausible.init()
</script>
```

pasted verbatim into each `<head>`. No optional extension (outbound links, file downloads, 404s,
hashed pages, revenue) is enabled for this site. The internal workbenches `web/lego-demo.html` and
`web/monster-buehne.html` stay untracked. There is no build step and no include mechanism in this
repo, so the four heads are maintained by hand.

`plausible.io` becomes the **second external host permitted on the page**, after Calendly
(ADR 0007). The "no off-origin request on a fresh load" rule recorded with the 2026-09-08 compliance
work is amended to "…other than `plausible.io`".

Four custom events are sent with `window.plausible(name)` from one new, hand-written file,
`web/messen.js`, loaded only by `index.html` after `web/bewegung.js`:

- `Book Call Click` — any of the six "Gespräch buchen" triggers is clicked.
- `Call Booked` — Calendly's popup reports a completed booking by `postMessage`.
- `App Start Click` — "Loop Studio ausprobieren" or "Jetzt starten" is clicked.
- `PDF Request` — the workbook form is submitted with a valid email.

`web/messen.js` attaches its own listeners beside the existing ones and never calls
`plausible.init()`; `web/bewegung.js` and `web/seite.js` are not modified. The matching goals are
created by hand in the Plausible UI.

`privacy-policy.html` gains one sentence naming Plausible as an EU-hosted, cookieless analytics
service, in English (that page is English-only), pending the lawyer's rewrite of the page.

## Rejected alternative

**Google Analytics 4 / Google Tag Manager with a consent-management platform.** Rejected: it sets
cookies, so it needs a consent banner on a page whose whole pitch is speed and clarity, it adds a
third-party consent vendor, and it moves visitor data to the US. Plausible's cookieless, EU-hosted
model needs no banner at all.

**Self-hosting Plausible, or proxying its script and event endpoint through Netlify.** Proxying
would beat ad blockers and self-hosting would remove the vendor, but both add infrastructure to a
repo whose defining property is that it has no build step and no server. The undercount caused by
ad blockers is accepted instead.

**Plausible's outbound-link and file-download extensions.** They would add their own
delayed-navigation handling on top of the explicit `App Start Click` handler, and the site has no
downloadable files. Explicit events on the two CTAs that matter were preferred over automatic
coverage of links that are not conversions.

## Consequences

- A fresh page load now makes exactly one off-origin request, to `plausible.io`. Any future
  compliance check must expect it; the 2026-09-08 criterion is amended accordingly.
- No cookie is set by the site or by Plausible; the only cookies a visitor can collect come from
  Calendly's own popup, after they open it.
- The script URL carries a site-specific id. If `loopstudio.app` is ever removed and re-added in
  Plausible, the id changes and all four `<head>`s must be edited again by hand.
- The event names above are the contract between the page and the Plausible goals. Renaming one in
  `web/messen.js` without renaming the goal silently empties that goal.
- Plausible reports under the configured site from any host, so deploy-preview and staging clicks
  land in the same stats unless a hostname allowlist is set in the Plausible UI.
- Ad blockers block `plausible.io`, so absolute numbers undercount. Trends stay usable; the page
  itself keeps working — `web/messen.js` never blocks an interaction if the script fails to load.
- Any further tracker, pixel or external font on this page needs its own ADR; this one covers
  Plausible and nothing else.

## Related

- [0007 Landing-page motion stack and Calendly widget](0007-landing-page-motion-stack-and-calendly-widget.md) — Calendly, the first permitted external host
- [Deployment pattern](../deployment.md) — the landing page is the static Netlify exception
- [System overview](../system-overview.md) — the landing page's place next to the app
- [Landing page CLAUDE.md](../../../landing-page/CLAUDE.md) — the repo this decision changes
````

### The two `knowledge-base/README.md` edits

1. Line 13: `## Index (18 documents)` → `## Index (19 documents)`.
2. After the 0007 line (line 32), add:

```markdown
- [0008 Plausible Analytics on the landing page](architecture/decisions/0008-plausible-analytics-on-the-landing-page.md)
```
