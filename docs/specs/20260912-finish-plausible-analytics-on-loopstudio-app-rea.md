---
task: 20260912-finish-plausible-analytics-on-loopstudio-app-rea
company: loopstudio
status: blocked
size: M
branch: fix/finish-plausible-analytics-on-loopstudio-app-rea
base: dev
design: none
---

# Finish Plausible Analytics on loopstudio.app: real snippet on four pages, four events, privacy sentence, ADR 0008

## Goal
Actually ship what `20260911-add-plausible-analytics-to-loopstudio-app-landin` only specified. Put
the real per-site Plausible snippet into the four root pages (`index.html`, `impressum.html`,
`privacy-policy.html`, `404.html`), wire the four approved conversion events into a new
`web/messen.js` loaded by `index.html`, add the one English privacy sentence, and make sure ADR 0008
reaches `knowledge-base` instead of being dropped a second time. The design is the one already
approved at gate 1 on 2026-09-11; this task changes it only where noted under *Deviations*.

**This spec is `blocked` on exactly one fact: the per-site snippet itself.** It is not in this
task's brief, not in the repo, and cannot be derived — see *Risks and open questions*, first bullet.
Everything else below is decided and ready to run the moment that string is pasted at gate 1.

## Assumptions
- **The per-site snippet has not been supplied.** The brief says "check this task's
  constraints/notes for it"; the brief I received has no constraints/notes section, and
  `rg -i plausible` over the whole worktree matches only
  `docs/specs/20260911-add-plausible-analytics-to-loopstudio-app-landin.md`. The brief's own
  instruction for that case is "stop and ask rather than guessing or using the old generic script",
  so this spec stops.
- **The snippet is two elements, not one**: a `<script>` with a per-site `src` plus a small inline
  `<script>` that defines the `window.plausible` queue and calls something like `plausible.init()`.
  This is **unverified** — this role has no web access and Plausible's dashboard is not readable
  from here. Every criterion below is therefore written against the *supplied* string, not against a
  guessed URL. If the pasted snippet turns out to be a single `<script>` line, criteria 1–2 collapse
  to that one element and nothing else changes.
- **The brief's `calenderly.event_scheduled` is a typo for `calendly.event_scheduled`.** The
  approved 20260911 spec writes `calendly.event_scheduled` in all three places it names the message
  (Approach table, criterion 11, stop conditions), and `calendly.` is the prefix react-calendly's
  typings use. I proceed with `calendly.event_scheduled`. **Unverified** against Calendly's own docs.
- **`web/messen.js` does not exist yet** (confirmed: `web/` holds `bewegung.js`, `seite.js`,
  `lego.js` and the CSS only), and no Plausible tag is in any page. The 20260911 task really did
  produce nothing but its spec.
- **ADR 0008 was never written**: `knowledge-base/architecture/decisions/` holds 0001–0007 with no
  gap, and `knowledge-base/README.md` still reads "Index (18 documents)". So 0008 is free and the
  index goes 18 → 19.
- **The 20260911 spec's gate-1 approval stands.** Its four event names, its selectors, its 1000 ms
  navigation fallback, its "one new file, `bewegung.js`/`seite.js` untouched" split and its privacy
  sentence are treated as settled and are restated here verbatim rather than re-opened.
- **The html-validate baseline is whatever the merge-base actually reports**, not a number I trust
  from memory. The brief says 145 errors; that figure is documented nowhere in this repo (the
  20260904 and 20260908 specs name the *rules*, never a count). This role cannot run commands, so
  the Tester captures the baseline on the merge-base commit itself and compares. **Unverified.**
- **"Every page" means the four root pages.** `web/lego-demo.html` and `web/monster-buehne.html` are
  internal workbenches (`web/README.md`) and stay untouched.
- **The knowledge-base checkout is shared and sits on `main`.** ADR 0007's own Status section records
  the precedent: an ADR is "a second, independent commit" in that repo, not part of the landing
  branch's diff. I assume the Implementer may commit there but must not push, mirroring the landing
  no-push rule. **Unverified** which branch Christian wants it on if `main` is dirty.
- **"Done"** means the criteria below hold on the `serve.ps1` preview and on the PR's Netlify deploy
  preview, and that the ADR is either committed in `knowledge-base` or handed over verbatim in the
  PR description — never silently skipped.

Correct me at gate 1, otherwise I proceed with these.

## Context found
- `docs/specs/20260911-add-plausible-analytics-to-loopstudio-app-landin.md`: the approved spec this
  one finishes. Its research is reused, not redone; the line references below re-confirm it against
  the current worktree.
- `CLAUDE.md` (landing): no build step, no test suite; three verification checks (html-validate,
  `serve.ps1` preview at desktop and phone width, link check), reported explicitly. "No third-party
  scripts, trackers, or fonts from external hosts without a recorded decision" — ADR 0008 is that
  record. Legal pages change only on Christian's instruction; this brief is that instruction.
- `index.html:43` — `</head>`, preceded by `<link rel="apple-touch-icon" …>` at line 42. No CSP
  `<meta>` anywhere in the head, so nothing in-page blocks an external script.
- `index.html:579–584` — body scripts in order: `web/lib/gsap.min.js`, `ScrollTrigger.min.js`,
  `lenis.min.js`, `web/lego.js`, `web/seite.js`, `web/bewegung.js`. `web/messen.js` goes after 584.
- `index.html` CTAs, all re-read today:
  - booking: `a[href="#gespraech"]` at 58 (nav), 96 (hero `.held__cta`), 428 / 437 / 445 (the three
    `.paket2` cards), plus `<button id="rufKnopf">` at 562 — six triggers;
  - into the app: 59 `#navTool`, 71 (mobile menu), **97** `.held__cta a.btn--rand` ("Loop Studio
    ausprobieren"), **413** `.preiskarte a.btn` ("Jetzt starten", the only `<a>` inside
    `.preiskarte`), 573 (footer "Zum Tool") — all `https://app.loopstudio.app/login`;
  - `#dlForm` at 496–504: one `<input type="email" required>` and a submit button "PDFs schicken";
    line 505 comments that the form has no backend.
- `web/bewegung.js:90–98`: `kalenderOeffnen` is bound to `a[href="#gespraech"], #rufKnopf`, calls
  `preventDefault()`, lazy-loads Calendly on first click and falls back to `window.open` /
  `location.href` (`calAusweichen`, lines 42–52). Lines 99–107 bind smooth scroll to `a[href^="#"]`
  except `#gespraech`. Absolute app links are untouched by this file.
- `web/seite.js:45–46`: the `#dlForm` submit handler calls `preventDefault()` and sets the button to
  "Unterwegs ✓", disabled.
- `impressum.html`, `privacy-policy.html`, `404.html`: Webflow exports whose `</head>` sits at the
  end of **line 1**, right after `…_Frame%202.png" rel="apple-touch-icon"/></head>`. They load
  `js/jquery-3.5.1.min.js` and `js/webflow-legal.js`; neither contains a tracker.
- `privacy-policy.html:178`: the Preamble paragraph ends
  `… accessible under the domain <a href="https://loopstudio.app/"><strong>loopstudio.app</strong></a>.</p>`
  and is immediately followed by `<h2 class="heading-style-h3">1. Name and address of the person
  responsible</h2>`. That `</p>`/`<h2>` boundary is the insertion point. Section 5 ("Use of cookies")
  still describes analysis cookies and an info banner that do not exist — pre-existing, the lawyer's
  rewrite.
- `docs/specs/20260904-landing-html-validate-script-type-void-style.md`: html-validate's
  `script-type` rule flags a redundant `type="text/javascript"` on a `<script>`. An inline script
  with no `type` is clean. This matters for the pasted snippet (see *Stop conditions*).
- `knowledge-base/architecture/decisions/0007-landing-page-motion-stack-and-calendly-widget.md`:
  the format ADR 0008 copies (Status / Context / Decision / Rejected alternative / Consequences /
  Related) and the precedent that Calendly is "the only external host permitted on the page".
- `knowledge-base/README.md:13` reads `## Index (18 documents)`; line 32 is the 0007 index entry,
  the last under "**Decisions (ADRs)**".

## Approach
Same design as the approved 20260911 spec. Three edits to the landing repo plus one ADR, described
here in full so this document stands on its own.

**1. The snippet on four pages.** Paste the gate-1 string **verbatim** — attribute order,
whitespace, `defer`, everything — directly before `</head>`: in `index.html` after the
`apple-touch-icon` link on line 42; in the three Webflow exports at the end of line 1, after
`rel="apple-touch-icon"/>`. Nothing is retyped from memory, nothing is "tidied", no `data-domain`
script is invented. If both a `src` script and an inline init script are supplied, both go in, in
the supplied order, on all four pages.

**2. Events in one new file, `web/messen.js`, loaded only by `index.html`**, as the last script tag
after `web/bewegung.js`. `web/bewegung.js` and `web/seite.js` stay byte-identical — `messen.js`
attaches its own listeners beside theirs. Comments in German with ae/oe/ue, like its siblings. At
the top it defines Plausible's queueing wrapper **only if one is not already there** (the per-site
snippet very likely defines it in `<head>` already):

```js
window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
```

Every call reads `window.plausible` at fire time, never a cached reference, so a recorder installed
before load receives all calls.

| Event name | Fires when | Hooked where |
|---|---|---|
| `Book Call Click` | any of the six booking triggers is clicked, whether or not Calendly then loads | `click` on `a[href="#gespraech"], #rufKnopf` |
| `Call Booked` | window `message` with `origin === 'https://calendly.com'` and `data.event === 'calendly.event_scheduled'` | `message` listener |
| `App Start Click` | "Loop Studio ausprobieren" (`.held__cta a.btn--rand`) or "Jetzt starten" (`.preiskarte a.btn`) is clicked | `click` listener |
| `PDF Request` | `#dlForm` is submitted (native `required`/`type=email` blocks invalid submits first) | `submit` listener |

Not tracked: nav/mobile "Login", footer "Zum Tool", "Paket ansehen", in-page anchors, `mailto:`, the
monster toy button, the FAQ, the stations toggles.

**Navigating links.** `App Start Click` fires on a link that leaves the page. For a primary click
with no modifier key the handler (a) calls `preventDefault()`, (b) calls
`window.plausible('App Start Click', { callback: go })`, (c) starts a 1000 ms timer that also calls
`go`. `go` runs once and sets `window.location.href` to the link's own `href`. With Ctrl, Meta or
Shift held it only records the event and leaves the browser default alone. The timer is what
guarantees navigation, so an unhonoured `callback` option costs latency, never a broken link.

**3. One privacy sentence.** A new `<p>` at the `</p>`/`<h2>` boundary on `privacy-policy.html:178`,
exactly: *"To measure how this website is used, we use Plausible Analytics, an EU-hosted web
analytics service that sets no cookies and stores no personal data."* English, because this page is
English-only. Placed in the Preamble, not in the self-contradicting section 5. The PR flags it
"lawyer to confirm".

**4. ADR 0008 — the part that got dropped last time.** Two belts:
- **Belt 1, in this repo, already done**: the complete ADR body is in *Appendix A* below, so the text
  is committed to `dev` with this spec and cannot be lost, whatever happens in the other checkout.
- **Belt 2, in `knowledge-base`**: the Implementer runs `git -C C:\code\loopstudio\knowledge-base
  status --porcelain` and `… branch --show-current` first. Only if the output is empty and the
  branch is `main` does it write
  `architecture/decisions/0008-plausible-analytics-on-the-landing-page.md` from Appendix A (with the
  gate-1 values substituted), add the index line to `README.md`, bump "18 documents" to "19", and
  commit **without pushing**. Otherwise it writes nothing there.

Either way the PR description carries: the verbatim ADR text, the two `README.md` edits, and the
exact commands — so "hand it to Christian" is a paste, not a rewrite. A run that ends with neither
a knowledge-base commit nor that PR section fails criterion 27.

**Deviations from the approved 20260911 spec** (only these):
- Its criterion 2 offered the legacy `data-domain` script as the default. That option is gone: the
  per-site snippet is the only accepted input, and its absence blocks this spec.
- Its ADR step was a stop condition ("stop the ADR part only, put the full text in the report").
  That is what let the ADR vanish. It is now a hard criterion with the text pre-drafted in Appendix A.
- Its criterion 22 named the merge-base as `ded8462`. This branch has its own merge-base; the Tester
  reads it with `git merge-base HEAD origin/dev` and reports the SHA rather than reusing that one.

**Rejected:** editing `web/bewegung.js` / `web/seite.js` instead of adding `messen.js` (two large,
actively edited files for a two-line gain); Plausible's tagged-events CSS classes (needs another
script extension); tracking every app link (Login is not a conversion); a hostname guard in code
(that belongs in Plausible's own site settings); re-deriving the ADR text at implementation time
(that is exactly the step that failed).

## Files to change
| File | Change | Why |
|---|---|---|
| `index.html` | the supplied snippet before `</head>` (after line 42); `<script src="web/messen.js"></script>` after line 584 | script on every page; events |
| `impressum.html` | the supplied snippet before `</head>` (end of line 1) | script on every page |
| `privacy-policy.html` | the supplied snippet before `</head>`; one `<p>` after the Preamble paragraph on line 178 | script; privacy sentence |
| `404.html` | the supplied snippet before `</head>` (end of line 1) | script on every page |
| `web/messen.js` | new, ~40 lines, German comments: guarded queue wrapper, four listeners, navigation helper | events |
| `C:\code\loopstudio\knowledge-base\architecture\decisions\0008-plausible-analytics-on-the-landing-page.md` | new, from Appendix A (separate checkout, commit only, no push) | "recorded decision" rule |
| `C:\code\loopstudio\knowledge-base\README.md` | one index line after the 0007 entry; "Index (18 documents)" → "(19 documents)" | index rule |

## Acceptance criteria
1. Each of `index.html`, `impressum.html`, `privacy-policy.html` and `404.html`, as served by
   `serve.ps1`, contains the gate-1 snippet exactly once, inside `<head>`, character-for-character
   identical to the string supplied at gate 1 (including attribute order, quoting and `defer`).
2. If the supplied snippet contains an inline `<script>` beside the `src` script, that inline block
   also appears exactly once per page, in the supplied order, on all four pages.
3. No page contains a second Plausible script: the count of `<script` elements whose `src` points at
   the snippet's host is exactly 1 per page.
4. No file in the repo contains the legacy `data-domain="loopstudio.app"` script, a Plausible API
   key, the string `PLAUSIBLE_API_KEY`, a `data-api` attribute, or a proxy path for the script.
5. No page references `googletagmanager.com`, `google-analytics.com`, a `gtag(` call, or any
   consent-management script.
6. `web/lego-demo.html` and `web/monster-buehne.html` are unchanged and contain no Plausible
   reference.
7. On a fresh load of each of the four pages with no interaction, every request to a host other than
   the page's own origin goes to the snippet's host.
8. `index.html` loads `web/messen.js` exactly once, after `web/bewegung.js`. No other page loads it.
9. `web/messen.js` assigns the queue wrapper to `window.plausible` only when `window.plausible` is
   not already a function; when the snippet already defined one, that object is still the one in use
   after `messen.js` runs.
10. Every event call in `web/messen.js` reads `window.plausible` at fire time, so a recorder
    installed before page load receives all calls.
11. One click on any of the six booking triggers — `.nav__rechts a[href="#gespraech"]`,
    `.held__cta a[href="#gespraech"]`, each of the three `.paket2 a[href="#gespraech"]`, and
    `#rufKnopf` — makes exactly one call `window.plausible('Book Call Click')` with one argument.
    This holds whether `assets.calendly.com` loads or is blocked.
12. After a booking click, behaviour is unchanged from the merge-base: the Calendly popup opens, or,
    with `assets.calendly.com` blocked, the existing `window.open` fallback runs.
13. A window `message` with `origin === 'https://calendly.com'` and
    `data.event === 'calendly.event_scheduled'` makes exactly one call `window.plausible('Call Booked')`.
    A message from any other origin, or with any other `data.event` (e.g. `calendly.event_type_viewed`),
    makes no call.
14. A primary click without modifier keys on `.held__cta a.btn--rand` or `.preiskarte a.btn` makes
    exactly one call whose first argument is `'App Start Click'` and whose second is an object with a
    `callback` function. The same tab then navigates to `https://app.loopstudio.app/login`:
    immediately if the callback is invoked, and no later than 1000 ms after the click if it never is
    (test tolerance 1500 ms).
15. A Ctrl-, Meta- or Shift-click on those two links makes exactly one `'App Start Click'` call and
    does not call `preventDefault()`; the landing page stays on screen.
16. Clicking `#navTool`, the mobile-menu "Login", the footer "Zum Tool", "Paket ansehen", any
    in-page anchor or the `mailto:` link makes no `window.plausible` call.
17. Submitting `#dlForm` with a valid email makes exactly one call `window.plausible('PDF Request')`,
    and the button still shows "Unterwegs ✓" and is disabled. Submitting with an empty or invalid
    email makes no call.
18. A fresh load of `index.html` plus scrolling to the bottom, with no clicks, makes no
    `window.plausible` call from `web/messen.js`.
19. With the snippet's host blocked, every interaction in criteria 11–17 behaves as on the
    merge-base, the app links still navigate within 1000 ms, and the console shows no error from
    `web/messen.js`.
20. `web/bewegung.js` and `web/seite.js` are byte-identical to the merge-base.
21. After a fresh load of each page plus a booking click, a Ctrl-click on "Jetzt starten" and a valid
    `#dlForm` submit, `document.cookie` is empty and the browser context holds no cookie for the
    page's host or for the snippet's host. Cookies set by `calendly.com` inside its own popup are
    reported as pre-existing and do not fail this criterion.
22. `privacy-policy.html` contains, verbatim and as its own `<p>`, directly after the Preamble
    paragraph that ends "…under the domain loopstudio.app.": *To measure how this website is used,
    we use Plausible Analytics, an EU-hosted web analytics service that sets no cookies and stores no
    personal data.*
23. Against the merge-base, each page's diff contains only what this task adds: `impressum.html` and
    `404.html` the snippet alone; `privacy-policy.html` the snippet plus the one `<p>`; `index.html`
    the snippet plus the `web/messen.js` tag.
24. `npx --yes html-validate@8 "*.html"` reports no finding that is not already reported on the
    merge-base commit, both runs captured in the same session.
25. Every relative link and asset on the four pages resolves on the `serve.ps1` preview, with no new
    404 in the server window or the browser console.
26. The four pages look unchanged from the merge-base at 1440 px and 390 px, except for the new
    paragraph on `privacy-policy.html`.
27. ADR 0008 is delivered, provably, by **one** of these two routes, and the report names which:
    - **committed**: `knowledge-base/architecture/decisions/0008-plausible-analytics-on-the-landing-page.md`
      exists with the Appendix A text (gate-1 values substituted), `knowledge-base/README.md` has the
      0008 index line after the 0007 line and reads "Index (19 documents)", and the report shows the
      commit SHA and `git -C … show --stat`; or
    - **handed over**: the PR description contains the complete ADR text, both `README.md` edits, and
      the exact write+commit commands, and the report states why the checkout was not written to.
    A run in which neither holds fails this criterion.
28. ADR 0008's body has the sections Status, Context, Decision, Rejected alternative, Consequences,
    Related; names the snippet's host as a permitted external host alongside Calendly; lists the four
    event names; records that the 2026-09-08 "no off-origin request on load" rule now excludes that
    host; and links ADR 0007 under Related.

## Test plan
There is no test suite and no test directory in this repo, so the Test Writer writes no files. The
checks are the three from `CLAUDE.md`, reported by name, plus one ad hoc browser run:
1. `npx --yes html-validate@8 "*.html"` — first on `git merge-base HEAD origin/dev` to capture the
   baseline, then on the branch; diff the two outputs (criterion 24).
2. `.\serve.ps1`, then all four pages at 1440 px and 390 px (criteria 25, 26).
3. A link and asset check on the four pages (criterion 25).
4. A one-off Playwright script (`npx --yes playwright@1`, not committed) in two setups:
   - **Recorder setup** — abort every request to the snippet's host, and `page.addInitScript` a
     `window.plausible` that pushes its arguments into `window.__calls`. Criterion 9 means
     `messen.js` must keep that recorder. Criterion 14 needs two runs, one where the recorder invokes
     `arguments[1].callback()` and one where it never does. Criterion 13 dispatches
     `new MessageEvent('message', { origin: 'https://calendly.com', data: { event: 'calendly.event_scheduled' } })`
     plus two negative variants.
   - **Real-script setup** for criteria 7 and 21. On `localhost` and under WebDriver the Plausible
     script loads but drops events; that is expected — this setup proves requests and cookies, not
     delivery.

## What to click
1. Nav, hero, a package card and the footer calendar button: the Calendly popup opens exactly as on
   the live site.
2. "Loop Studio ausprobieren" and "Jetzt starten": each lands on the app login page with no
   noticeable delay.
3. Submit the PDF form with an email: the button turns into "Unterwegs ✓" as before.
4. Privacy page: the new Plausible sentence stands as its own paragraph under the preamble, in the
   page's normal text style.
5. Plausible's realtime view for `loopstudio.app` shows the preview visit plus `Book Call Click` and
   `App Start Click`.

## Verification and evidence
The close-out shows the evidence, not a claim:
- **1–3**: per page, `(Invoke-WebRequest http://localhost:8843/<page>).Content` with the matched
  element pasted in and a regex count of scripts pointing at the snippet's host; plus a
  character-level diff of the inserted block against the gate-1 string.
- **4–6**: the repo-wide grep commands with their empty output. `gtag\(` is searched **with** the
  parenthesis — a bare `gtag` also matches `Symbol.toStringTag` in `js/webflow-legal.js`.
- **7**: the Playwright request list per page on a fresh load, real-script setup.
- **9–19**: the `window.__calls` dump after each scripted interaction; navigation timestamps for
  criterion 14 in both callback modes; `defaultPrevented` for criterion 15; the console log for 19.
- **20**: `git diff <merge-base> -- web/bewegung.js web/seite.js`, empty.
- **21**: `document.cookie` and `context.cookies()` dumps after the interactions, with any
  `calendly.com` cookies listed separately; on the deploy preview, a DevTools screenshot of
  Application → Cookies after the same clicks.
- **22–23**: `git diff <merge-base> --` on the four pages, pasted.
- **24**: both html-validate outputs side by side, with the merge-base SHA named.
- **25–26**: the three `CLAUDE.md` checks reported by name, with before/after screenshots at 1440 px
  and 390 px.
- **27–28**: either the knowledge-base commit SHA plus `git -C … show --stat` and the README diff, or
  the PR-description section containing the full ADR text and the exact commands.
- **Deploy preview**: the snippet in view-source on each page, the network panel showing the script
  with status 200, and, in a normal (non-WebDriver) browser, a click that sends an event request. The
  preview URL is named. If deploy previews are off, the report says so rather than dropping the row.
- **PR description** carries: the merge-base SHA, "privacy sentence: lawyer to confirm", the ADR
  hand-off section (always), and the reminder that the four goals still have to be created in the
  Plausible UI.

## Will not do
- No `git checkout`, `rebase`, `merge` or `push` in any repo; `main` and `dev` are off limits; the
  knowledge-base commit is not pushed either.
- No cookie banner, no consent tool, no Google Analytics or Tag Manager, no other tracker.
- No proxy for the script or the event endpoint; no `netlify.toml`, `_headers` or `_redirects`.
- No Plausible API calls: no creating sites or goals, no API key anywhere in the repo.
- No retyping, shortening or "correcting" the supplied snippet, and no fallback to the legacy
  `data-domain` script if the paste is missing.
- No edits to `web/bewegung.js`, `web/seite.js`, any `web/*.css`, the minified Webflow CSS/JS, or
  `web/*.html`.
- No copy, layout, design or legal-text change beyond the one privacy sentence.
- No work in `loop-studio-frontend`, `loop-studio-backend` or `agent-cluster`.
- No new dependency, no `package.json`, no build step; the Playwright script is ad hoc and not
  committed.

## Stop conditions
- **The gate-1 snippet is missing or partial** (only a site id, only a screenshot description, only a
  "use the usual one"). Stop. Do not guess a `pa-<id>.js` URL and do not fall back to the legacy
  script — that is exactly how this task was born.
- The supplied snippet contains `type="text/javascript"`. "Verbatim" and criterion 24 then conflict
  (html-validate's `script-type` rule). Stop and ask; the likely answer is "drop just that redundant
  attribute", but it is Christian's call, not the Implementer's.
- The supplied snippet points at a host other than `plausible.io` (a custom or self-hosted domain).
  Stop and report before writing ADR 0008 — the ADR names the permitted host and the deploy-preview
  expectations change with it.
- The snippet's install page shows optional extensions enabled (outbound links, file downloads, 404s,
  hashed pages, revenue). Stop: those change the script file's behaviour and were not scoped here.
- The live custom-events API differs from `window.plausible(name, { callback })`. Stop and report the
  difference before writing `web/messen.js`.
- Calendly's docs or a real message capture show a different event name than
  `calendly.event_scheduled`, or a different origin than `https://calendly.com`. Stop and ask; do not
  silently rename or drop `Call Booked`.
- Any of criteria 12–19 shows a behaviour change against the merge-base. Stop instead of patching
  `web/bewegung.js` or `web/seite.js`.
- `git -C C:\code\loopstudio\knowledge-base status --porcelain` is non-empty, or the branch is not
  `main`. Write nothing there; take the hand-over route of criterion 27 and say why.
- The deploy preview blocks the snippet's host through a CSP set in Netlify's UI. Stop and report; do
  not add headers.
- The html-validate baseline cannot be captured (e.g. `npx` has no network). Stop — "no new finding"
  cannot be proven without it.

## Risks and open questions
- **blocks — the per-site Plausible snippet is missing.** Paste, verbatim, the whole block shown at
  Plausible → `loopstudio.app` → Site settings → General → Site installation: both the
  `<script … src="…">` line and any inline `<script>` shown next to it, exactly as displayed
  (attribute order, quoting, `defer`, whitespace). Nothing else in this spec is open, so one paste
  turns it `ready`. The same paste also answers, at no extra cost:
  - whether the block is one element or two (criteria 1–2);
  - whether it already defines `window.plausible` (criterion 9);
  - whether any optional extension is switched on in that page's toggles (stop condition 4);
  - which host it points at (criteria 3, 7, 19, 21, 28).
- **`calendly.event_scheduled` is unverified.** The brief spells it `calenderly.`; the approved
  20260911 spec spells it `calendly.`, and only a real booking on the live site would settle it,
  which would put an appointment in Christian Arns' calendar. The synthetic test proves the listener;
  the first real booking after deploy proves the name. **Does not block**; correct the spelling at
  gate 1 if I have it wrong.
- **The `callback` option may not exist in the per-site script's API.** Then criterion 14's first
  half (immediate navigation) never triggers and every app-CTA click waits the full 1000 ms. Not
  broken, but a perceptible delay. Resolvable only with the snippet's docs in hand. **Does not block.**
- **Preview and other hostnames count as `loopstudio.app`.** The script reports under the configured
  site from any host, so deploy-preview clicks — gate 3 included — land in the real stats. The fix is
  Plausible's own hostname allowlist in site settings (**unverified** feature name), which Christian
  sets in the UI. **Does not block.**
- **Ad blockers block Plausible**, so numbers undercount. A proxy would fix it; the brief excludes
  one. **Does not block.**
- **The privacy page contradicts itself** until the lawyer's rewrite: section 5 still claims analysis
  cookies and an info banner while the new sentence says cookieless. The sentence is correct, section
  5 is not. **Does not block**; the PR flags it.
- **The start page does not link to the privacy page** (`index.html:573`, footer "Datenschutz" is
  `href="#"`), so the new sentence is unreachable from the start page. Pre-existing; a
  one-attribute fix. **Does not block**; say the word at gate 1 and it goes in.
- **Criterion 26 (visual parity) is not machine-checkable** and is not a click-check either — it is
  the Tester's before/after screenshot comparison at 1440 px and 390 px, named here so it is not
  mistaken for an automated result.
- **The `145` html-validate baseline from the brief is not reproduced anywhere in this repo.** The
  Tester measures it instead of asserting it. **Does not block.**
- **The knowledge-base checkout is shared.** A concurrent session may have it dirty. Criterion 27's
  second route covers that, which is the whole point of the two belts. **Does not block.**

## Out of scope
- Adding `loopstudio.app` in Plausible, creating the four goals, setting a hostname allowlist —
  Christian does these in the UI.
- The digests that use `PLAUSIBLE_API_KEY` in `agent-cluster`.
- Outbound-link, file-download, 404, revenue and custom-property tracking.
- Analytics inside the app (`app.loopstudio.app`, `loop-studio-frontend`).
- The lawyer's rewrite of the privacy policy, a German Datenschutz page, translating the legal pages.
- Fixing the footer's `href="#"` Impressum and Datenschutz links.
- Connecting the PDF form to a backend.
- The internal workbenches `web/lego-demo.html` and `web/monster-buehne.html`.

---

## Appendix A — ADR 0008, full text

Write this to
`C:\code\loopstudio\knowledge-base\architecture\decisions\0008-plausible-analytics-on-the-landing-page.md`,
replacing `<PLAUSIBLE_SRC>` with the gate-1 script URL and `<PLAUSIBLE_HOST>` with its host
(everything else is final). It is reproduced here so the text is committed to `dev` with this spec
and survives even if the other checkout cannot be written.

```markdown
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
a spec and stopped for exactly that reason; this ADR is written from the real snippet.

## Decision

Load Plausible Analytics on the four root pages of `landing` — `index.html`, `impressum.html`,
`privacy-policy.html`, `404.html` — using the per-site snippet issued for `loopstudio.app`
(`<PLAUSIBLE_SRC>`), pasted verbatim into each `<head>`. The internal workbenches
`web/lego-demo.html` and `web/monster-buehne.html` stay untracked. There is no build step and no
include mechanism in this repo, so the four heads are maintained by hand.

`<PLAUSIBLE_HOST>` becomes the **second external host permitted on the page**, after Calendly
(ADR 0007). The "no off-origin request on a fresh load" rule recorded with the 2026-09-08 compliance
work is amended to "…other than `<PLAUSIBLE_HOST>`".

Four custom events are sent with `window.plausible(name)` from one new, hand-written file,
`web/messen.js`, loaded only by `index.html` after `web/bewegung.js`:

- `Book Call Click` — any of the six "Gespräch buchen" triggers is clicked.
- `Call Booked` — Calendly's popup reports a completed booking by `postMessage`.
- `App Start Click` — "Loop Studio ausprobieren" or "Jetzt starten" is clicked.
- `PDF Request` — the workbook form is submitted with a valid email.

`web/messen.js` attaches its own listeners beside the existing ones; `web/bewegung.js` and
`web/seite.js` are not modified. The matching goals are created by hand in the Plausible UI.

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

- A fresh page load now makes exactly one off-origin request, to `<PLAUSIBLE_HOST>`. Any future
  compliance check must expect it; the 2026-09-08 criterion is amended accordingly.
- No cookie is set by the site or by Plausible; the only cookies a visitor can collect come from
  Calendly's own popup, after they open it.
- The event names above are the contract between the page and the Plausible goals. Renaming one in
  `web/messen.js` without renaming the goal silently empties that goal.
- Plausible reports under the configured site from any host, so deploy-preview and staging clicks
  land in the same stats unless a hostname allowlist is set in the Plausible UI.
- Ad blockers block `<PLAUSIBLE_HOST>`, so absolute numbers undercount. Trends stay usable; the page
  itself keeps working — `web/messen.js` never blocks an interaction if the script fails to load.
- Any further tracker, pixel or external font on this page needs its own ADR; this one covers
  Plausible and nothing else.

## Related

- [0007 Landing-page motion stack and Calendly widget](0007-landing-page-motion-stack-and-calendly-widget.md) — Calendly, the first permitted external host
- [Deployment pattern](../deployment.md) — the landing page is the static Netlify exception
- [System overview](../system-overview.md) — the landing page's place next to the app
- [Landing page CLAUDE.md](../../../landing-page/CLAUDE.md) — the repo this decision changes
```

### The two `knowledge-base/README.md` edits

1. Line 13: `## Index (18 documents)` → `## Index (19 documents)`.
2. After the 0007 line (line 32), add:

```markdown
- [0008 Plausible Analytics on the landing page](architecture/decisions/0008-plausible-analytics-on-the-landing-page.md)
```
