---
task: 20260905-update-landing-page-with-ideas-from-the-onlineme
company: loopstudio
status: ready
size: L
branch: feature/update-landing-page-with-ideas-from-the-onlineme
base: dev
design: none
---

# Bring the onlinemedianer.de example's nav, hero, scroll sequence and mascot into loopstudio.app, on one motion stack

## Goal

Update the Loop Studio marketing site (`landing-page`, this repo) with ideas from the
onlinemedianer.de example version Christian Arns shared (live site + `Arnswald/loop-studio-webseite`,
snapshotted at `knowledge-base/references/landing-page-example-onlinemedianer-2026-09-05/`):
adopt the example's navigation, hero, scroll-driven "how it works" sequence, and mascot artwork
as visual/structural ideas — not a wholesale replacement of the current site. Retire the page's
Webflow interaction runtime (`js/webflow.js` + achunks, IX2 fade-ins) in favour of a single
Lenis + GSAP/ScrollTrigger motion stack, record that plus the approved Calendly booking widget
as an ADR, keep the currently published pricing (15 €/month, Consulting "Auf Anfrage") and the
currently self-hosted Plus Jakarta Sans font, and wire the real Calendly link
(`calendly.com/christianarns/15min`) as the booking CTA. FAQ and founder-story copy are carried
over from the example as a draft, explicitly flagged for Christian's review before promotion to
`main`.

## Context found

- `index.html` — the entire page; built by Webflow (2026-08) and hand-maintained since Webflow
  was retired (2026-09-04). Structure today: pill-less top nav (`.nav_component`, Webflow's
  `.w-nav`, mobile burger driven by `js/webflow.js`), hero (`#hero`, static headline + YouTube
  iframe demo, `data-w-id`/`style="opacity:0"` IX2 fade-in), a static 5-icon "Weg zum Content"
  row (`#path-to-content`), a "Kennst du das?" 3-card grid, a "So funktioniert Loop Studio"
  Webflow-native tab player (`.w-tabs`/`.w-tab-link`/`.w-tab-pane`, custom progress-bar script
  that relies on Webflow's tab-click handler), a Finsweet CMS-slider block
  (`#how-it-works`/`.fs-slider-2_instance`, driven by `js/finsweetcomponentsconfig-1.0.3.js` +
  `js/fs-components.js`, loaded as an ES module — independent of Webflow's own runtime), the
  pricing section (`#pricing`, 15 €/month + Consulting "Auf Anfrage", the Consulting CTA
  currently mis-points to `https://app.loopstudio.app/login` instead of a contact path), and a
  short footer.
- `js/webflow.js` + 19 `js/webflow.achunk.*.js` files — the Webflow-exported IX2/interaction
  runtime: nav collapse, native tab switching, and the `data-w-id` fade-ins (hero content/video,
  the `#how-it-works` wrapper). Confirmed (grep) these are referenced **only** from `index.html`;
  `impressum.html`, `privacy-policy.html`, and `404.html` load only `js/jquery-3.5.1.min.js` +
  `js/webflow-legal.js` and carry no nav — removing the achunks/`webflow.js` cannot break the
  legal pages or 404.
- `js/gsap.min.js`, `js/ScrollTrigger.min.js` — already vendored in this repo, but their
  provenance/version is unverified here (they ship as part of the Webflow export bundle, not
  added deliberately for hand-written motion code); not currently referenced by any
  hand-written script.
- `js/finsweetcomponentsconfig-1.0.3.js`, `js/fs-components.js` — loaded on every page
  (`type="module"`), pre-existing, unrelated to Webflow's own IX2 runtime. Out of scope for this
  task; flagged as a risk to re-check visually once `webflow.js` is gone (see Risks).
- `fonts/plusjakartasans.css`, `fonts/*.woff2` — the only self-hosted font today (Plus Jakarta
  Sans, Google/OFL, free for commercial use). Per `landing-page/CLAUDE.md`: "No third-party
  scripts, trackers, or fonts from external hosts without a recorded decision."
- `knowledge-base/references/landing-page-example-onlinemedianer-2026-09-05/` — full snapshot of
  the example: `source/index.html` (Fassung 19, the final/live version) plus `source/web/*.css`
  (19 cascading override files, one per design round — a change history, not a stylesheet to
  copy), `source/web/bewegung.js`/`seite.js`/`lego.js` (the example's own hand-rolled motion/UI
  code), `source/web/lib/{gsap.min.js,ScrollTrigger.min.js,lenis.min.js}` (GSAP/ScrollTrigger
  3.12.5, GreenSock standard license, free; Lenis 1.1.18, MIT — versions/licenses per that
  folder's own `source/web/README.md`), `source/bilder/` (mascot/monster artwork, own Loop
  Studio corporate-design material per `source/BILDHERKUNFT.md`), and `source/README.md`
  (a "Fassung 1…19" changelog documenting every design round, useful for understanding *why* a
  given element looks the way it does, not something to port verbatim).
- `knowledge-base/architecture/decisions/0006-passkey-webauthn-library-choice.md` — precedent
  for recording a cross-repo decision as an ADR that lives in `knowledge-base` "as a second,
  independent commit — not part of that feature branch's diff", i.e. the ADR for this task is a
  separate commit against the `knowledge-base` repo, not part of this branch's diff.
- Requester's constraints (Christian, 2026-09-05, both channel messages): adopt nav / hero /
  scroll sequence / mascot assets from `source/`; GSAP+Lenis and Calendly approved, record an
  ADR; pricing copy stays exactly as published; FAQ/founder copy usable as a draft pending
  review; skip the Designer round (the example is the design); use the exact Calendly link as
  the real booking link; retire Webflow's motion/interaction engine entirely in favour of one
  Lenis+GSAP stack; keep Plus Jakarta Sans, no font that needs a commercial license (rules out
  Thunder unless separately verified free — not attempted here, so it is not used); run as one
  L-size task, no split, single Implementer round.

## Approach

Curate, don't clone: the example is 19 rounds of design iteration layered as cascading CSS
overrides (`fassung2.css` … `fassung19.css`) plus three purpose-built JS modules
(`bewegung.js`, `seite.js`, `lego.js`). Copying those files verbatim would import dead CSS
history and UI modules (the Lego-Baukasten builder, the growing/feeding monster mini-game, the
multi-tier Consulting pricing cards, the PDF downloads section) that Christian did not ask for
and that would contradict "pricing stays as published." Instead: preview the example locally
(it is a static site — `python3 -m http.server` or open `source/index.html` directly) to see the
*rendered* result, then hand-author one new stylesheet (`css/site.css`) and one new script
(`js/site.js`) for **only** the four adopted ideas, following this repo's existing convention of
adding a small hand-written file next to the generated/minified ones rather than editing them.

1. **Motion stack.** Vendor `js/lenis.min.js` from the knowledge-base reference's
   `source/web/lib/`. Replace the repo's existing (unverified-provenance) `js/gsap.min.js` and
   `js/ScrollTrigger.min.js` with the same-named files from that same `source/web/lib/` (verified
   version/license). Delete `js/webflow.js` and all 19 `js/webflow.achunk.*.js` files and their
   `<script>` tags in `index.html` — confirmed safe (see Context found: no other page depends on
   them). Reimplement, in `js/site.js`, the behaviours `webflow.js` used to provide for
   `index.html`: mobile nav open/close (new markup, see below), the tab-pane switching for the
   existing "So funktioniert Loop Studio" player (the pane must still change on click without
   `.w-tabs` runtime), and a GSAP-driven reveal for the hero content/video and the
   `#how-it-works` wrapper (both currently `style="opacity:0"`, invisible forever once
   `webflow.js` no longer runs the IX2 timeline that used to reveal them). Wrap
   scroll-linked/animated behaviour in a `prefers-reduced-motion` check that falls back to plain
   CSS visibility and native scroll. This is the part of the task that is not "an idea from the
   example" but is required by Christian's explicit instruction not to mix two motion libraries.
2. **Nav** (idea from the example). Replace `.nav_component`/`.w-nav` with a floating pill nav
   (own markup/classes in `index.html`, styled in `css/site.css`) that narrows and gains a
   translucent background once scrolled, following the *pattern* in `source/index.html`'s
   `<nav class="nav">`. Keep this site's existing anchors (`#path-to-content` renamed in-place to
   host the new sequence, see point 3; `#features`; `#pricing`) and existing CTA
   ("Kostenlos testen" → `https://app.loopstudio.app/login`, unchanged), and add a second CTA,
   "Gespräch buchen", that opens the Calendly popup (point 5). Add `#faq` to the nav once the FAQ
   section exists (point 4).
3. **Hero** (idea from the example). Keep the current headline/sub-headline copy and the
   existing YouTube demo embed unchanged (Christian did not ask for new hero copy — only FAQ and
   founder-story copy were approved as draft). Add the Loop Studio mascot artwork
   (`images/monster-web.png`, optionally `images/monster-mund-auf.png` for a hover state) as a
   decorative element beside/behind the hero content, following the *layout idea* (mascot +
   floating content) from `source/index.html`'s `<div class="szene">`, not its interactive
   feeding/growth mechanics (out of scope, see below).
4. **Scroll sequence** (idea from the example). Replace the static 5-icon `#path-to-content` row
   with a pinned, scroll-driven sequence (GSAP ScrollTrigger `pin`/`scrub` + Lenis), following
   the structural idea of `source/index.html`'s `#zeigen` section, but keeping this site's
   existing five steps and copy verbatim (Reel entdecken → Per DM senden → Import & Transkription
   → Skript & Shotliste → Planen & Posten) — no new claims, no step count change. Below ~900px,
   turn pinning off and stack the steps normally (same responsive fallback the example uses).
   Add a new, short "Gründer-Story" text section afterwards, using the founder narrative from
   `source/index.html`'s `#story` section as a **draft** (marked with an HTML comment,
   `<!-- DRAFT: Text aus dem Beispiel, von Christian noch nicht freigegeben -->`) — without
   re-embedding a second copy of the same YouTube video already used in the hero (the example's
   `#story` video is the identical video ID, `RoZh2NASzNE`; duplicating the same embed lower on
   the page would be redundant, not "an idea," so this task adds the story as text only). Add a
   new `#faq` accordion section, adapting (not copying verbatim) the example's five FAQ entries:
   drop or rewrite any entry that references Consulting details not published on this site
   (fixed package names, 490 €/1.690 €/3.900 € prices) since pricing stays exactly as currently
   published; mark this section with the same draft comment.
5. **Calendly** (approved, ADR required). Load Calendly's official `widget.js`/`widget.css` from
   `assets.calendly.com` (the one third-party, external-host script this task adds — recorded in
   the ADR per the "no third-party scripts without a recorded decision" rule). Wire every
   "Gespräch buchen" control (nav, hero if present, footer, and the Consulting pricing card,
   whose CTA currently wrongly points at the app login) to open Calendly's popup widget for
   `https://calendly.com/christianarns/15min` — the exact link Christian named as the real
   booking link, not a placeholder.
6. **Fonts.** No new font is introduced. Everything continues to use the self-hosted Plus
   Jakarta Sans (`fonts/plusjakartasans.css`); the example's Thunder/Inter/JetBrains Mono are not
   used (Thunder's commercial license was not verified — per Christian's instruction, it is
   therefore not used at all; JetBrains-Mono-style label styling, if wanted for small UPPERCASE
   labels, is approximated with a system monospace stack (`ui-monospace, SFMono-Regular, Menlo,
   monospace`), which needs no font file or license).

**Rejected alternative:** copying the example's `web/fassung*.css` files wholesale and loading
them after the current stylesheet. Rejected because (a) it imports 19 rounds of cascading,
sometimes-contradictory overrides instead of a clean stylesheet, (b) it pulls in CSS for
features explicitly out of scope (Lego-Baukasten, monster-feeding game, multi-tier Consulting
cards, PDF downloads), and (c) this repo's own convention is "prefer adding a small hand-written
stylesheet... over editing the minified files" — the same principle argues for one clean,
purpose-built `css/site.css` here rather than 8+ imported override layers.

**Design round:** skipped on Christian's explicit instruction ("the example is the design");
the knowledge-base snapshot plus this spec's scoping (point 1–6 above) stand in for a
`design/handoff/` folder. No `design/` artifact is produced by this task.

**No split:** Christian decided (2026-09-05, dev channel) to run this as one L-size task with a
single Implementer round rather than slicing it — see the brief's clarifications. This spec
therefore covers the whole goal above, not a narrowed slice.

## Files to change

| File | Change | Why |
|---|---|---|
| `index.html` | Rewrite nav to a floating pill nav (new markup/classes, existing anchors + new `#faq`, add "Gespräch buchen" CTA); keep hero copy/video, add mascot artwork; replace the `#path-to-content` icon row with a pinned GSAP/Lenis scroll sequence using the existing 5 steps' copy; add a new "Gründer-Story" text section (draft copy, marked) and a new `#faq` accordion (draft copy, adapted, marked); fix the Consulting CTA to open Calendly instead of `app.loopstudio.app/login`; remove `js/webflow.js`/achunk `<script>` tags and now-dead `data-w-id`/IX2 `opacity:0` styles; add `<link>`/`<script>` tags for the Calendly widget and for `js/lenis.min.js`/`css/site.css`/`js/site.js`. | Carries every adopted idea; central page. |
| `css/site.css` (new) | Hand-written stylesheet (pill nav, hero mascot layout, scroll-sequence panel, founder-story, FAQ accordion, Calendly popup override), loaded after `css/loopstudio-app.webflow.shared.min.css`; Plus Jakarta Sans only. | New visual language, added the way this repo already adds hand-written CSS instead of editing the generated file. |
| `js/site.js` (new) | Lenis init + GSAP ticker sync; nav scroll-shrink + mobile menu toggle (replaces `.w-nav` behaviour); tab-pane switch for the existing "So funktioniert Loop Studio" player (replaces `.w-tabs` behaviour); GSAP reveal for hero content/video and the `#how-it-works` wrapper (replaces the removed IX2 fade-ins); ScrollTrigger pin/scrub for the sequence section; FAQ accordion; Calendly popup wiring for every "Gespräch buchen" control; `prefers-reduced-motion` guard disabling all of the above. | Single hand-written motion/interaction layer replacing the retired Webflow runtime. |
| `js/lenis.min.js` (new) | Vendor from `knowledge-base/references/landing-page-example-onlinemedianer-2026-09-05/source/web/lib/lenis.min.js` (1.1.18, MIT). | Approved dependency (Christian, 2026-09-05); no CDN per repo rule. |
| `js/gsap.min.js`, `js/ScrollTrigger.min.js` (replace) | Replace the repo's existing, unverified-provenance copies with the same-named files from the same `source/web/lib/` (3.12.5, GreenSock standard license, free). | One verified, documented version instead of an unverified Webflow-bundle copy. |
| `js/webflow.js`, `js/webflow.achunk.*.js` (19 files) — delete | Remove entirely; confirmed used only by `index.html`. | Retires the Webflow interaction/IX2 engine, per Christian's instruction not to mix motion libraries. |
| `images/monster-web.png`, `images/monster-mund-auf.png` (new) | Copy from `knowledge-base/.../source/bilder/` (Loop Studio's own corporate-design mascot artwork, per that folder's `BILDHERKUNFT.md`). | Mascot assets Christian named explicitly. |
| `knowledge-base/architecture/decisions/0007-landing-page-motion-stack-and-calendly-widget.md` (new; separate repo/commit, not part of this branch's diff) | ADR recording: (1) GSAP + ScrollTrigger + Lenis as the landing page's motion stack, replacing Webflow's IX2 runtime, versions/licenses as vendored; (2) Calendly's hosted widget/popup script as an approved external-host third-party embed, with the real link `https://calendly.com/christianarns/15min`. | Required by Christian; follows the existing ADR convention (`0006-passkey-webauthn-library-choice.md`). |

## Acceptance criteria

1. `npx --yes html-validate@8 "*.html"` run from the repo root reports no new errors on
   `index.html` beyond any pre-existing, already-documented findings.
2. `js/webflow.js` and every `js/webflow.achunk.*.js` file are deleted from the repo and no
   `<script>` tag in `index.html` references them.
3. `index.html` contains no `data-w-id`, `data-collapse`, `data-easing`, `data-duration`,
   `data-animation` (Webflow IX2/nav attributes) and no element is left permanently invisible
   (no orphaned `style="opacity:0"` without a corresponding GSAP reveal in `js/site.js`).
4. Opening `index.html` via `.\serve.ps1` at desktop width shows a floating pill nav with links
   to the scroll-sequence section, `#features`, `#pricing`, and `#faq`, plus a "Gespräch buchen"
   button and the existing "Kostenlos testen" button; the nav visibly narrows/gains a translucent
   background after scrolling down.
5. The mobile burger menu (below the nav's collapse breakpoint) opens and closes the mobile menu
   using `js/site.js`, with no console errors, and without `js/webflow.js` present.
6. The hero section still shows the existing headline, sub-headline, and YouTube demo embed
   unchanged in wording, plus the Loop Studio mascot artwork copied into `images/`.
7. The "So funktioniert Loop Studio" tab player still switches panes on click (five tabs,
   matching today's copy) without `js/webflow.js` present.
8. The former `#path-to-content` icon row is replaced by a pinned, scroll-driven sequence
   presenting the same five existing steps, unchanged in wording and order; below ~900px width
   the section is not pinned and the steps stack and remain readable top to bottom.
9. A new "Gründer-Story" text section and a new `#faq` accordion (at least five items) are
   present, each carrying an HTML comment marking the copy as a draft pending Christian's review;
   the FAQ contains no reference to a Consulting price or package name not published on this site
   (no 490 €/1.690 €/3.900 €, no fixed package names).
10. Every "Gespräch buchen" control on the page (nav, footer, Consulting pricing card) opens
    Calendly's popup widget for `https://calendly.com/christianarns/15min`; the Consulting
    pricing card's CTA no longer links to `https://app.loopstudio.app/login`.
11. The pricing section is unchanged in numbers and copy: Loop Studio 15 €/month with today's
    feature list, Consulting "Auf Anfrage" with today's feature list.
12. With the browser's `prefers-reduced-motion: reduce` emulation on, the sequence section does
    not pin/scrub, Lenis smooth-scroll easing is off (native scroll), and all content is visible
    without relying on a scroll-triggered reveal.
13. `index.html` continues to use only `fonts/plusjakartasans.css` for typography; no new
    `@font-face`, Google Fonts/Adobe Fonts `<link>`, or additional font files are added.
14. `js/lenis.min.js`, `js/gsap.min.js`, and `js/ScrollTrigger.min.js` are loaded from this
    repo's own `js/` folder (no CDN `<script src>` for any of the three).
15. `impressum.html`, `privacy-policy.html`, and `404.html` are byte-for-byte unchanged.
16. All internal anchors used by the new/kept nav (`#faq`, `#pricing`, `#features`, and the
    scroll-sequence section's id) resolve to an element that exists in `index.html`; all links to
    `https://app.loopstudio.app/...` remain unchanged and unbroken.
17. `knowledge-base/architecture/decisions/0007-landing-page-motion-stack-and-calendly-widget.md`
    exists, names the motion-stack and Calendly decisions, states the vendored versions/licenses,
    and is committed as a separate commit against the `knowledge-base` repo (not part of this
    branch's diff), per the `0006` ADR's own stated convention.

## Test plan

There is no automated test suite for this static site (per `landing-page/CLAUDE.md`). The Tester
must run and report, explicitly, the three checks that repo defines, plus the behaviour checks
below that this task specifically requires:

1. `npx --yes html-validate@8 "*.html"` — report pass/fail and any findings.
2. `.\serve.ps1` local preview — check `index.html` at a desktop width and a phone width (per
   repo rule); additionally verify, at both widths and with a plain click-through:
   - nav shrink-on-scroll, mobile burger open/close, "Gespräch buchen" opens the Calendly popup
     with the correct link, "Kostenlos testen" still goes to `https://app.loopstudio.app/login`;
   - the hero renders with the mascot artwork and unchanged copy/video;
   - the "So funktioniert Loop Studio" tab player still switches panes;
   - the scroll sequence pins and scrubs at desktop width and stacks (unpinned) at phone width;
   - the FAQ accordion opens/closes each item;
   - the Consulting pricing card's CTA opens Calendly, not the app login;
   - the pre-existing `#how-it-works` Finsweet slider block still renders (flagged as a risk,
     see below — confirm it isn't silently broken by removing `webflow.js`);
   - `prefers-reduced-motion: reduce` (DevTools emulation) turns off pinning/scrub and smooth
     scroll, with all content still visible;
   - the browser console shows no JavaScript errors on load or during the above interactions.
3. Link check — every internal anchor and every `https://app.loopstudio.app/...` link resolves;
   the Calendly link matches `https://calendly.com/christianarns/15min` exactly.

Report all three checks explicitly in the implementation/test report, per repo convention; there
is nothing to add under a `test/` directory for this static site.

## Risks and open questions

- **Finsweet slider (`#how-it-works`/`fs-slider-2`) after removing `webflow.js`.** This component
  is loaded independently of Webflow's own runtime (`js/finsweetcomponentsconfig-1.0.3.js` +
  `js/fs-components.js`, an ES module), so it is expected to keep working, but this is
  unverified — the Tester must specifically confirm this section still renders/behaves correctly
  in the local preview. Not blocking; if it breaks, the fix is scoped to this section only.
- **Decorative Lottie loaders** (`data-animation-type="lottie"` inside the feature-card grid,
  `images/...skeleton%20loader.json`) are rendered today by Webflow's own runtime. Removing
  `js/webflow.js` will likely stop these from playing (the divs will just sit empty/static). This
  is a minor, decorative regression, not a page-breaking one; out of scope to reimplement a
  Lottie player for this task unless the Tester finds it materially degrades the page — flagged
  here rather than silently accepted. Not blocking.
- **Founder-story factual claim.** The adapted founder-story draft copy (from the example) states
  "10 Jahre Videoproduktion" (10 years of video production experience). This is a factual claim
  about Christian's background that this spec cannot verify. It is shipped as an explicitly
  marked draft per Christian's own instruction ("use as a draft to be reviewed"); it must be
  confirmed accurate before the `dev`→`main` promotion, but does not block this task or this
  branch's merge to `dev`. Not blocking for this task.
- **`jquery-3.5.1.min.js` retained on `index.html`.** Kept in place (not removed) because it is
  unverified whether the Finsweet slider bundle expects a global `jQuery`; removing it is a
  low-value, higher-risk cleanup outside this task's scope. Not blocking.
- **Exact rotating/adopted hero wording, if the Implementer chooses to add a rotating word to the
  existing headline** as part of "hero visual language": Christian approved the *visual pattern*,
  not new hero copy. If a rotating word is added, it must be built only from words already used
  on this page (e.g. "Skripte." / "Shotlisten." / "Content." / "Planung."), not new claims. Not
  blocking, but the Reviewer should check no new marketing claim was introduced this way.

## Out of scope

- The example's interactive "Monster füttern" feeding/growth mini-game, the Lego-Baukasten
  builder module, the multi-tier Consulting pricing cards (Basis/Editing/Produktion with fixed
  prices), the "Zitate"/testimonial-quotes section, and the PDF-downloads section are not part of
  this task (pricing and Consulting stay exactly as currently published; these modules are the
  example's own bespoke, unapproved additions).
- `impressum.html`, `privacy-policy.html`, and `404.html` are not touched — they currently carry
  no top nav and are explicitly excluded ("legal pages change only on Christian's instruction").
  Their visual language will remain the old Webflow style until a separate task addresses them;
  this inconsistency is accepted for this task.
- Introducing Thunder, Inter, or JetBrains Mono (or any other new font) — not attempted, per
  Christian's font constraint; if a future task wants Thunder specifically, its commercial
  license needs to be verified first.
- Reimplementing the decorative Lottie skeleton-loader animations with an independent
  Lottie player.
- Any change to `js/finsweetcomponentsconfig-1.0.3.js`, `js/fs-components.js`, or the
  `#how-it-works` Finsweet slider's own configuration.
- Deploying/publishing to `onlinemedianer.de`, or anything about that domain — this task only
  changes `loopstudio.app` (this repo), merged to `dev`, not `main`.
