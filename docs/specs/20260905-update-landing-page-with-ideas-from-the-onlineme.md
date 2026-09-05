---
task: 20260905-update-landing-page-with-ideas-from-the-onlineme
company: loopstudio
status: ready
size: L
branch: feature/update-landing-page-with-ideas-from-the-onlineme
base: dev
design: none
---

# Rebuild loopstudio.app's landing page to match the onlinemedianer.de example nearly exactly, on one motion stack, within current pricing/fonts/founders

## Goal

Update `index.html` (this repo, `landing-page`, deploys to `loopstudio.app` via Netlify from
`main`, base `dev`) so it is **nearly exactly** the onlinemedianer.de example Christian Arns
shared (live reference + `Arnswald/loop-studio-webseite`, snapshotted at
`knowledge-base/references/landing-page-example-onlinemedianer-2026-09-05/`): its navigation,
hero, mascot, scroll-driven sequence, founder story, "monster" problem framing, four-station
mechanism, building-block explainer, testimonials and FAQ — not a curated subset of ideas.
Three published facts stay fixed regardless of what the example shows: pricing (Loop Studio
15 €/month, Consulting "Auf Anfrage" — no invented consulting tiers or computed prices), fonts
(self-hosted Plus Jakarta Sans only, no font that isn't free to license), and the real Calendly
booking link (`calendly.com/christianarns/15min`). The page must run on a single motion stack
(Lenis + GSAP/ScrollTrigger); Webflow's interaction runtime (`js/webflow.js` + its achunks, the
`data-w-id`/IX2 fade-ins, and the Finsweet CMS-slider it ships next to) is retired from
`index.html` entirely, and every function it used to provide there is rebuilt on the new stack.
The founder story keeps Christian Arns's real "10 Jahre Videoproduktion" line and adds Christian
Wenzel (co-founder, 20 years software development, 10 years AI/algorithm development). FAQ copy
(and any other copy adapted rather than kept verbatim) is shipped as an explicitly marked draft
for Christian's review. The GSAP/Lenis motion stack and the Calendly widget are approved
dependencies; both are recorded in an ADR.

## Context found

- `index.html` — today: Webflow nav (`.nav_component`/`.w-nav`, IX2-driven burger), a hero with
  static headline + YouTube iframe demo (`data-w-id`, `style="opacity:0"` — invisible without
  Webflow's IX2 timeline), a static 3-card "Kennst du das?" grid, a static 5-icon
  `#path-to-content` row, a Webflow-native tab player (`#features`, `.w-tabs`) plus a
  `feature-cards_grid` with Webflow-Lottie skeleton loaders, a Finsweet CMS-slider
  (`#how-it-works`, `.fs-slider-2_instance`, driven by `js/finsweetcomponentsconfig-1.0.3.js` +
  `js/fs-components.js`, ES module, independent of `webflow.js`'s own runtime), the pricing
  section (`#pricing`, 15 €/month + Consulting "Auf Anfrage", Consulting CTA currently
  mis-points to `https://app.loopstudio.app/login`), and a short footer.
- `js/webflow.js` + 19 `js/webflow.achunk.*.js` — the Webflow IX2/interaction runtime: nav
  collapse, native tab switching, `data-w-id` fade-ins. Confirmed (grep) referenced **only** from
  `index.html`; `impressum.html`, `privacy-policy.html`, `404.html` load only
  `js/jquery-3.5.1.min.js` + `js/webflow-legal.js` and carry no nav — deleting the achunks/
  `webflow.js` cannot break the legal pages or 404.
- `js/finsweetcomponentsconfig-1.0.3.js` — loaded (as an ES module) by **all four** HTML pages
  (`index.html`, `impressum.html`, `privacy-policy.html`, `404.html`); `js/fs-components.js` and
  `js/webfont.js` are not referenced by any page today (already-dead files, pre-existing, out of
  scope). This task removes only `index.html`'s own `<script>` tag for
  `finsweetcomponentsconfig-1.0.3.js`, together with the `#how-it-works` slider markup it drives —
  the file itself stays for the legal pages.
- `js/gsap.min.js` (3.15.0), `js/ScrollTrigger.min.js` — already vendored in this repo (shipped
  as part of the Webflow export bundle), not currently referenced by any hand-written script.
  3.15.0 is newer than the version in the example (3.12.5, GreenSock standard/no-charge license
  per that folder's own README) — reused as-is, no replacement needed.
- `fonts/plusjakartasans.css`, `fonts/*.woff2` — the only self-hosted font today (Plus Jakarta
  Sans, OFL, free for commercial use). Per `landing-page/CLAUDE.md`: "No third-party scripts,
  trackers, or fonts from external hosts without a recorded decision."
- `css/loopstudio-app.webflow.shared.min.css` — defines this brand's actual design tokens as CSS
  custom properties (`--base-color-brand--primary:#1ba17b`, `--base-color-brand--secondary:#273ea2`,
  `--background-color--background-primary:#fafafa`, neutrals, spacing/utility classes such as
  `.container-large`, `.padding-global`, `.padding-section-medium`). Loaded by all four pages
  (index + the three legal/404 pages) — stays linked on `index.html` for its reset and tokens;
  the example's own creme/navy/blue/turquoise palette is **not** introduced as a second, competing
  token set (see Approach).
- `knowledge-base/references/landing-page-example-onlinemedianer-2026-09-05/` — full snapshot:
  `source/index.html` (Fassung 19, final/live), `source/web/*.css` (19 cascading per-round
  override files — a design changelog, not a stylesheet to import), `source/web/{bewegung.js,
  seite.js,lego.js}` (the example's own hand-rolled motion/UI/baukasten code),
  `source/web/lib/{gsap.min.js,ScrollTrigger.min.js,lenis.min.js}` (3.12.5 GreenSock
  standard/free; Lenis 1.1.18, MIT), `source/bilder/` (mascot artwork — Loop Studio's own
  corporate-design material per `source/BILDHERKUNFT.md` — plus `bilder/reels/*` which is
  **third-party Outreel client video/thumbnails**, `bilder/personas/*.jpg` which is
  Pexels-licensed stock, and `bilder/szene-*.png` used only by the example's 3-tier Consulting
  cards), and `source/README.md` (the Fassung 1…19 changelog — background, not something to port
  verbatim).
- `knowledge-base/architecture/decisions/0006-passkey-webauthn-library-choice.md` — precedent:
  the ADR for a cross-repo decision lives in `knowledge-base` "as a second, independent commit —
  not part of that feature branch's diff."
- `knowledge-base/domains/content-pillars.md` — content pillars are user-defined via a
  questionnaire; there is no fixed taxonomy named "Reichweite/Branding/Leads" in the product. The
  example's pillar-style labels used in its baukasten module are illustrative marketing copy, not
  a real product taxonomy — treated as draft copy here (see Risks).
- Requester's constraints, latest first (Christian, 2026-09-05, dev channel — supersedes the
  earlier "adopt ideas, not wholesale" framing): "the landing page should be nearly exactly like
  the new website example"; remove Webflow parts and take over what they covered; founder story
  for Christian Arns ("10 Jahre Videoproduktion") is real; add Christian Wenzel (co-founder, 20
  years software development, 10 years AI/algorithm development). Still-valid constraints from
  earlier answers: pricing stays exactly as published (15 €/month tool, Consulting "Auf
  Anfrage" — so the example's 3-tier Consulting prices and its package price-calculator stay out
  or are re-expressed without invented numbers); keep Plus Jakarta Sans, no font that needs a
  commercial license (rules out Thunder as used in the example; Inter/JetBrains Mono are not
  introduced either — one font family, matching "keep the fonts we currently have"); the exact
  Calendly link `calendly.com/christianarns/15min` is the real booking link; one motion stack
  (Lenis + GSAP/ScrollTrigger), Webflow's interaction runtime fully removed from `index.html`;
  FAQ copy remains a draft for review; skip the Designer round (the example is the design); run
  as one L-size task, no split, single Implementer round.

## Approach

Rebuild `index.html` section-by-section against the example's `source/index.html`, keeping three
fixed facts (pricing, fonts, the real Calendly link) and reusing this brand's own design tokens
instead of importing the example's separate color system. Vendor only what's genuinely new
(Lenis) and reuse what's already here and already newer/equivalent (this repo's own
`js/gsap.min.js`/`js/ScrollTrigger.min.js`). Do not import the example's 19 cascading
`fassung*.css` override files or its `bewegung.js`/`seite.js` verbatim — write one clean,
purpose-built stylesheet and two purpose-built scripts instead (this repo's own convention:
"prefer adding a small hand-written file... over editing the minified files"), reusing the
example's proven **module boundaries** (a UI-logic file, a motion file, the self-contained
baukasten engine) rather than its literal per-round file history.

**Design-token decision (why the example's palette is not adopted wholesale):** the example is a
from-scratch visual system (Creme `#F4EFE6` / Navy `#243060` / Blue `#4D8EF7` / Turquoise
`#74C19E`) built for a *different* subsite (`onlinemedianer.de`). This brand's actual tokens
already live in `css/loopstudio-app.webflow.shared.min.css`
(`--base-color-brand--primary:#1ba17b`, `--base-color-brand--secondary:#273ea2`,
`--background-color--background-primary:#fafafa`, neutrals). Rejected: importing the example's
literal hex palette, because that is an uninstructed rebrand (Christian asked for the example's
*structure, sections, mascot, motion and copy* to be adopted — a color-system change was not
asked for and would compound this task's risk). Adopted: reuse the section rhythm, spacing scale,
type scale, card/section patterns and motion **from** the example, painted with this brand's
existing tokens. Flagged for the Reviewer, not blocking (see Risks).

**Third-party asset decision:** the example's `bilder/reels/*.{mp4,jpg}` are Outreel client
videos, not Loop Studio's; they are not copied into this repo. Anywhere the example uses them
(the hero/tool-interface "Inspiration" screen's reel thumbnails), this task uses Loop Studio's
own existing product screenshots already in `images/` (`...1.Inspiration_page...png`,
`...2.example_inspiration_video...png`, `...3.use_this_idea...png`,
`...4.generated_script...png`, `...5.Planung...png`) instead. `bilder/personas/*.jpg`
(Pexels-licensed, commercial-free, no attribution required) and the mascot artwork in
`bilder/monster-*.png` (Loop Studio's own corporate-design material) are copied as-is.

**Section-by-section plan** (old → new; "kept" = wording unchanged, "adapted" = reworded/adapted
from the example and therefore a draft, "new" = doesn't exist on this site today):

1. **Motion stack (infrastructure, not "an idea").** Vendor `js/lenis.min.js` from
   `knowledge-base/.../source/web/lib/lenis.min.js` (1.1.18, MIT). Keep this repo's own
   `js/gsap.min.js`/`js/ScrollTrigger.min.js` (newer than the example's, no CDN). Delete
   `js/webflow.js` and all 19 `js/webflow.achunk.*.js` files and their `<script>` tags (confirmed
   unused elsewhere). Remove `index.html`'s `js/jquery-3.5.1.min.js` and
   `js/finsweetcomponentsconfig-1.0.3.js` `<script>` tags (the new page has no jQuery-dependent or
   Finsweet-dependent markup left — see point 6). Write `js/site.js` (non-motion UI: nav
   open/close, FAQ accordion, tab/screen switching, footer month-grid rendering, Calendly
   wiring) and `js/motion.js` (Lenis init + every GSAP/ScrollTrigger behaviour: hero mouse-parallax
   scene, rotating headline word, the pinned scroll sequence, scroll-reveal for `.rv` elements,
   the monster-feed animation, the baukasten flight animation hookup). Both scripts check
   `matchMedia('(prefers-reduced-motion: reduce)')`: `motion.js` no-ops all pin/scrub/parallax
   and Lenis falls back to native scroll; `site.js`'s own non-scroll interactions (accordion,
   tabs, Calendly) are unaffected by that flag.
2. **Nav** (adopted). Floating pill nav (own markup/classes, replaces `.nav_component`/`.w-nav`)
   that narrows and gains a translucent background on scroll, following `source/index.html`'s
   `<nav class="nav">` pattern. Links: to the scroll sequence, the monster/problem section, the
   four-stations section, pricing, FAQ. CTAs: "Gespräch buchen" (opens the Calendly popup) and the
   existing "Kostenlos testen" → `https://app.loopstudio.app/login` (kept, unchanged destination).
   Mobile burger menu rebuilt in `js/site.js`.
3. **Hero** (adopted, restructured). Replace the static headline + hero-embedded YouTube iframe
   with the example's mascot-scene hero (`images/monster/monster-web.png`, decorative floating
   "Gespeichert / Skript / Geplant" cards drawn as inline SVG, no new image assets needed for
   those). Headline: adapt the existing hero claim into the example's rotating-last-word pattern,
   built only from words already used on this site (e.g. "Content." / "Skripte." / "Shotlisten.")
   — no new product claim introduced this way. Sub-copy: keep this site's existing hero sentence
   (kept, not draft). Two CTAs: "Gespräch buchen" (Calendly) and "Loop Studio ausprobieren" (→
   `https://app.loopstudio.app/login`). The YouTube demo video moves out of the hero into the new
   Gründer-Story section (point 5) instead of being duplicated.
4. **"Kennst du das?" 3-card grid** — kept as-is (existing copy), restyled only.
5. **Scroll sequence + tool showcase + Gründer-Story** (adopted, and this replaces three legacy
   components at once: the static `#path-to-content` row, the `#features` Webflow tab
   player/`feature-cards_grid`, and the Finsweet `#how-it-works` slider). New pinned,
   scroll-driven sequence (GSAP ScrollTrigger `pin`/`scrub` + Lenis) presenting this site's
   existing five steps (kept copy: Reel entdecken → Per DM senden → Import & Transkription →
   Skript & Shotliste → Planen & Posten), following the structural idea of `source/index.html`'s
   `#zeigen` panel. Below ~900px, pinning turns off and steps stack normally (same fallback the
   example uses). Immediately after it, a tool-interface showcase adapted from the example's
   `.tool` mockup (sidebar with Inspiration/Produktion/Planung, tab-switching, `js/site.js`) but
   populated with this site's own real screenshots (not Outreel's client thumbnails — see Approach)
   instead of a from-scratch fake UI. Then a new Gründer-Story section: Christian Arns's real "10
   Jahre Videoproduktion" line (kept) plus the moved YouTube demo video, and a short two-founder
   block introducing Christian Wenzel (new copy: co-founder, 20 years software development, 10
   years AI/algorithm development — no photo available for Wenzel, text-only, see Risks).
6. **"Social Media Monster" problem framing + click-to-feed interaction** (new). Adopt
   `source/index.html`'s `#monster` section and its feed-the-monster interaction (click a button,
   the mascot image swaps through `monster-web.png` → `monster-mund-auf.png` →
   `monster-kaut.png` and a small counter/text updates), using the copied mascot assets. Purely
   illustrative; introduces no pricing or product claim.
7. **"Was du machst. Was wir machen." matrix** (new, adopted). Static Du/Wir comparison rows,
   adapted copy consistent with this site's own division of labor (tool vs. Consulting), marked
   as a draft alongside FAQ/founder copy since it is adapted rather than kept verbatim.
8. **"Vier Stationen" mechanism, re-expressed without a price calculator** (new, adapted).
   Adopt the four-station idea-finding/production/schnitt/posten toggle UI, but its result panel
   shows a qualitative summary ("Dein Fokus: ...") and a "Kontakt aufnehmen" CTA to Consulting
   "Auf Anfrage" (opens Calendly) — **no computed € amount**, and no 490/1.690/3.900 €
   package names. This is the "re-expressed with the published pricing" option Christian named,
   chosen over dropping the section outright because the underlying idea (you choose which
   stations you want help with) carries no invented number.
9. **Baukasten (building-block explainer)** (new, vendored + adapted). Vendor
   `source/web/lego.js` and `source/web/lego.css` (self-contained, no dependency, per that
   folder's own `web/README.md`) as `js/lego.js`/`css/lego.css`, adapted only for: brand color
   mapping (map the example's `navy/blue/teal/sand` block colors onto this brand's own tokens
   instead of introducing new hex values) and copy (pillar-style block labels are illustrative,
   not a real product taxonomy — marked as draft, see Risks).
10. **Pricing** (kept exactly). Loop Studio 15 €/month + today's feature list, Consulting "Auf
    Anfrage" + today's feature list — restyled in the new visual language only, no number or
    package change. Fix the long-standing bug where the Consulting CTA points at
    `https://app.loopstudio.app/login`: it now opens the Calendly popup instead.
11. **Testimonials ("Aussagen, die wir kennen")** (new, adopted). Five quotes using the copied
    Pexels persona photos; text adapted to this product (tool + optional Consulting), marked
    draft.
12. **FAQ** (new, adapted, explicit draft). Adapt the example's five FAQ entries: every reference
    to a specific consulting price/package name or to a specific service-area radius is rewritten
    to match only what is actually published today (15 €/month; Consulting "Auf Anfrage" with no
    fixed packages) or is dropped. Marked with an HTML comment,
    `<!-- DRAFT: Copy adapted from the example, pending Christian's review -->`.
13. **Downloads (PDF lead magnets)** — **not built**. The example offers a "Content-Handbuch" and
    a "Workbook", neither of which exists as content for Loop Studio; building a download section
    with no PDF behind it (or a fabricated one) would be worse than omitting it. This is a content
    gap, not a constraint-based exclusion — flagged under Risks as a follow-up, not attempted here.
14. **Footer** (adopted, adjusted). "Der nächste Schritt" framing, Christian Arns's contact card
    (kept — he is already the site's stated contact), and a calendar-styled button that opens the
    Calendly popup. Unlike the example, the calendar grid renders only the real current month/day
    (via `js/site.js`, no network call to Calendly's availability) and does **not** fabricate
    "N free days" — Calendly's own popup is the only place real availability is shown, avoiding a
    misleading UI (see Risks).
15. **Structured data (JSON-LD).** Adapt the example's `Organization`/`FAQPage` schema to this
    site's real FAQ; the `Service`/`Offer` block with 590/490/1690/3900 € is not carried over
    (would publish invented prices).

**Rejected alternative:** loading the example's `web/fassung2.css` … `web/fassung19.css` files
directly. Rejected because they are 19 rounds of cascading, sometimes-contradictory overrides (a
change history, not a stylesheet) built for a different color system, and they would drag in the
now-excluded Consulting-tier and third-party-asset markup along with everything else.

**Design round:** skipped on Christian's explicit instruction ("the example is the design"); this
spec's section-by-section plan stands in for a `design/handoff/` folder. No `design/` artifact is
produced by this task.

## Proposed split (Christian decides)

Christian already decided (2026-09-05, dev channel) to run this as one L-size task with a single
Implementer round rather than slicing it. Recorded here per the L-size spec format, not as an open
decision: had it been split, the natural cuts would have been (1) motion-stack swap + nav + hero +
scroll sequence (infrastructure-heavy, no new copy), (2) monster/matrix/four-stations/baukasten
(the bulk of new interactive markup), (3) pricing-CTA fix + Gründer-Story + testimonials + FAQ +
footer (the copy-heavy, review-needed slice), (4) the knowledge-base ADR (separate repo/commit
regardless of slicing). If this single round runs over budget or surfaces more risk than expected,
slice (3) is the one most likely to still need a second pass (draft copy pending review) — but per
Christian's instruction, this spec covers the whole goal in one pass.

## Files to change

| File | Change | Why |
|---|---|---|
| `index.html` | Full rewrite per the 15-point plan above: new pill nav, mascot hero with rotating headline word, scroll sequence, tool showcase (own screenshots), Gründer-Story (two founders), monster interaction, matrix, four-stations (no price calc), baukasten, pricing (unchanged numbers, fixed Consulting CTA), testimonials, FAQ (draft), footer with Calendly-wired calendar button, adapted JSON-LD; removes `js/webflow.js`/achunk/`js/jquery-3.5.1.min.js`/`js/finsweetcomponentsconfig-1.0.3.js` `<script>` tags and all `data-w-id`/IX2 attributes and `.fs-slider-2`/`.w-tabs` markup; adds `<link>`/`<script>` tags for the Calendly widget, `js/lenis.min.js`, `css/site.css`, `css/lego.css`, `js/site.js`, `js/motion.js`, `js/lego.js`. | Carries the whole rebuild; central page. |
| `css/site.css` (new) | Hand-written stylesheet for every new/adopted section, built on this brand's existing CSS custom properties from `css/loopstudio-app.webflow.shared.min.css` (loaded first, kept for reset/tokens); Plus Jakarta Sans only. | New visual language, added the way this repo already adds hand-written CSS instead of editing the generated file. |
| `css/lego.css` (new, vendored + adapted) | From `knowledge-base/.../source/web/lego.css`; recolor its custom properties onto this brand's tokens. | Reuses the baukasten module's own proven CSS boundary. |
| `js/site.js` (new) | Nav scroll-shrink + mobile menu; FAQ accordion; tool-showcase tab/screen switching; footer real month/day grid; Calendly popup wiring for every "Gespräch buchen"/"Kontakt aufnehmen" control. | Non-motion UI layer, replaces the retired Webflow/Finsweet behaviours. |
| `js/motion.js` (new) | Lenis init + GSAP ticker sync; hero mouse-parallax scene + rotating headline word; ScrollTrigger pin/scrub for the sequence; scroll-reveal (`.rv`) utility; monster-feed animation timeline; baukasten flight-animation hookup into `js/lego.js`; `prefers-reduced-motion` guard disabling all of the above. | Single hand-written motion layer replacing the retired Webflow IX2 runtime. |
| `js/lego.js` (new, vendored + adapted) | From `knowledge-base/.../source/web/lego.js`; adapt only color-token mapping. | Self-contained baukasten engine, no dependency (per its own README). |
| `js/lenis.min.js` (new) | Vendor from `knowledge-base/.../source/web/lib/lenis.min.js` (1.1.18, MIT). | Approved dependency (Christian, 2026-09-05); no CDN per repo rule. |
| `js/webflow.js`, `js/webflow.achunk.*.js` (19 files) — delete | Remove entirely; confirmed used only by `index.html`. | Retires the Webflow interaction/IX2 engine, per Christian's instruction. |
| `images/monster/monster-web.png`, `monster-mund-auf.png`, `monster-kaut.png` (new; `monster-neugier.png`/`monster-satt.png`/`monster-portrait.png` optional, only if the Implementer uses the extra poses) | Copy from `knowledge-base/.../source/bilder/` (Loop Studio's own corporate-design mascot artwork, per `BILDHERKUNFT.md`). | Mascot assets for hero + monster-feed interaction. |
| `images/personas/persona-1.jpg` … `persona-5.jpg` (new) | Copy from `knowledge-base/.../source/bilder/personas/` (Pexels licensed, commercial-free). | Testimonial photos. |
| `knowledge-base/architecture/decisions/0007-landing-page-motion-stack-and-calendly-widget.md` (new; separate repo/commit, not part of this branch's diff — see Risks) | ADR recording: (1) GSAP + ScrollTrigger + Lenis as the landing page's motion stack, replacing Webflow's IX2 runtime; (2) Calendly's hosted widget/popup as an approved external-host third-party embed, real link `https://calendly.com/christianarns/15min`. | Required by Christian; follows the `0006` ADR's own convention. |

## Acceptance criteria

1. `npx --yes html-validate@8 "*.html"` run from the repo root reports no new errors on
   `index.html` beyond any pre-existing, already-documented findings.
2. `js/webflow.js` and every `js/webflow.achunk.*.js` file are deleted from the repo; no
   `<script>` tag anywhere references them.
3. `index.html` contains no `data-w-id`, `data-collapse`, `data-easing`, `data-duration`,
   `data-animation` (Webflow IX2/nav attributes), no `.w-tabs`/`.fs-slider-2*` markup, and no
   element left permanently invisible (no orphaned `style="opacity:0"` without a corresponding
   GSAP reveal in `js/motion.js`).
4. `index.html` no longer has a `<script>` tag for `js/jquery-3.5.1.min.js` or
   `js/finsweetcomponentsconfig-1.0.3.js`.
5. Opening `index.html` via `.\serve.ps1` at desktop width shows the floating pill nav (links to
   the scroll sequence, the monster section, the four-stations section, pricing, FAQ; both CTAs),
   which visibly narrows/gains a translucent background after scrolling.
6. The mobile burger menu opens/closes via `js/site.js` with no console errors and without
   `js/webflow.js` present.
7. The hero shows the mascot artwork, the existing hero sub-copy unchanged, and a headline whose
   rotating last word is built only from words already used on this page.
8. The former `#path-to-content` row, the `#features` tab player, and the `#how-it-works`
   Finsweet slider are gone, replaced by: (a) a pinned, scroll-driven sequence with this site's
   existing five steps unchanged in wording/order, unpinned and stacked below ~900px width; (b) a
   tool-interface showcase using this repo's own existing product screenshots (no Outreel
   asset — no file under `bilder/reels/` is present anywhere in the repo).
9. A Gründer-Story section shows Christian Arns's "10 Jahre Videoproduktion" line, the moved
   YouTube demo video (present exactly once on the page, not duplicated), and a text block
   introducing Christian Wenzel as co-founder with "20 Jahre Softwareentwicklung" and "10 Jahre
   KI-/Algorithmen-Entwicklung".
10. The monster-feed interaction is present: clicking its button swaps the mascot image through
    at least two of the copied frames and updates a visible counter/text; it makes no pricing or
    product claim.
11. The "Was du machst. Was wir machen." matrix and the four-stations section are present; the
    four-stations result panel shows no € amount and no package name (Basis/Editing/Produktion or
    any numeric price) anywhere in its markup or script output.
12. The baukasten section is present and interactive (clicking/selecting a block moves it into a
    stack via `js/lego.js`), using this brand's existing color tokens (no new hex values
    introduced solely for this module).
13. The pricing section is unchanged in numbers and copy — Loop Studio 15 €/month with today's
    feature list, Consulting "Auf Anfrage" with today's feature list — and its Consulting CTA now
    opens the Calendly popup instead of `https://app.loopstudio.app/login`.
14. A testimonials section with five quotes and the five copied persona photos is present.
15. An FAQ accordion (at least five items) opens/closes per item, contains an HTML comment marking
    it as draft copy pending review, and contains no reference to a Consulting price or package
    name not published on this site.
16. No downloads/PDF-lead-magnet section is present anywhere in `index.html`.
17. Every "Gespräch buchen"/"Kontakt aufnehmen" control on the page (nav, hero, four-stations,
    pricing Consulting card, footer) opens Calendly's popup widget for exactly
    `https://calendly.com/christianarns/15min`.
18. The footer's calendar button shows the real current month/day grid and does not display any
    fabricated "N free days" indicator; clicking it opens the Calendly popup.
19. With the browser's `prefers-reduced-motion: reduce` emulation on: the scroll sequence does not
    pin/scrub, Lenis smooth-scroll easing is off (native scroll), the hero has no mouse-parallax,
    the monster-feed and baukasten animations complete instantly (no motion), and all content
    remains visible without depending on a scroll-triggered reveal.
20. `index.html` continues to use only `fonts/plusjakartasans.css` for typography; no new
    `@font-face`, Google/Adobe Fonts `<link>`, or additional font file (no Thunder, no Inter, no
    JetBrains Mono) is added anywhere in the repo.
21. `js/lenis.min.js`, `js/gsap.min.js`, and `js/ScrollTrigger.min.js` are loaded from this repo's
    own `js/` folder; the Calendly `widget.js`/`widget.css` are the only external-host `<link>`/
    `<script>` on `index.html`.
22. `impressum.html`, `privacy-policy.html`, and `404.html` are byte-for-byte unchanged.
23. All internal anchors used by the nav resolve to an element that exists in `index.html`; every
    `https://app.loopstudio.app/...` link is unchanged and unbroken.
24. `knowledge-base/architecture/decisions/0007-landing-page-motion-stack-and-calendly-widget.md`
    exists, names both decisions, states vendored versions/licenses, and is committed as a
    separate commit against the `knowledge-base` repo (not part of this branch's diff) — or, if
    the Implementer's environment has no write access to that repo, this is reported explicitly
    to the Manager rather than silently skipped (see Risks).

## Test plan

There is no automated test suite for this static site (per `landing-page/CLAUDE.md`). The Tester
must run and report, explicitly, the three checks that repo defines, plus the behaviour checks
this task specifically requires:

1. `npx --yes html-validate@8 "*.html"` — report pass/fail and any findings.
2. `.\serve.ps1` local preview at a desktop width and a phone width (per repo rule); additionally,
   click through and verify:
   - nav shrink-on-scroll, mobile burger open/close;
   - hero mascot scene, mouse parallax (desktop), rotating headline word;
   - the scroll sequence pins/scrubs at desktop width and stacks unpinned at phone width;
   - the tool showcase switches Inspiration/Produktion/Planung and shows this repo's own
     screenshots (not third-party reel thumbnails);
   - the Gründer-Story video plays and both founders' text is present;
   - the monster-feed button visibly changes the mascot and a counter/text;
   - the four-stations toggle changes its result text and shows no € amount;
   - the baukasten section: clicking a block moves it into the stack;
   - pricing numbers/copy unchanged; Consulting CTA opens Calendly, not the app login;
   - testimonials render with the five persona photos;
   - FAQ accordion opens/closes each item;
   - footer calendar button shows the real month and opens Calendly on click;
   - every "Gespräch buchen"/"Kontakt aufnehmen" control opens
     `https://calendly.com/christianarns/15min` in the popup;
   - `prefers-reduced-motion: reduce` (DevTools emulation) turns off pinning/scrub/parallax and
     smooth scroll, with all content still visible and no animation left half-run;
   - the browser console shows no JavaScript errors on load or during the above interactions.
3. Link check — every internal anchor and every `https://app.loopstudio.app/...` link resolves;
   the Calendly link matches `https://calendly.com/christianarns/15min` exactly; no reference to
   `bilder/reels/` or any onlinemedianer.de/Outreel asset exists anywhere in the repo.

Report all three checks explicitly in the implementation/test report, per repo convention; there
is nothing to add under a `test/` directory for this static site.

## Risks and open questions

- **Scope size.** This is a full rebuild of `index.html`'s markup, styling, and motion in a
  single Implementer round. Christian explicitly decided against slicing it (2026-09-05); flagged
  here as a real risk (a large single diff is harder to review and more likely to need a second
  pass on the draft-copy sections) but not blocking — per instruction, this spec covers the whole
  goal in one pass.
- **Design-token reuse instead of the example's palette.** This spec paints the example's
  structure/motion with this brand's existing CSS custom properties rather than the example's own
  creme/navy/blue/turquoise system (see Approach). Not blocking, but the Reviewer should confirm
  this reading of "adopt the example's ideas" is what Christian meant, versus a full color-system
  change (which would be a separate, larger decision this spec did not make).
- **Christian Wenzel has no photo asset.** The founder block ships text-only for him (see point
  5). Not blocking; a photo can be added later without restructuring the section.
- **Draft copy.** FAQ, the Du/Wir matrix, testimonials, and the baukasten's illustrative
  pillar-style labels are adapted from the example and marked as drafts pending Christian's
  review before `dev` → `main` promotion. Not blocking for this task or its merge to `dev`.
- **Downloads/PDF lead magnets are not built** — the underlying content (a "Content-Handbuch" and
  a "Workbook") does not exist for Loop Studio. Flagged as a follow-up task, not attempted here.
- **ADR filed in a different repo.** `knowledge-base` is not one of this task's assigned
  repositories/worktrees. If the Implementer's environment cannot commit there, they must say so
  explicitly in the implementation report rather than skip the ADR silently, so the Manager can
  file it separately. Not blocking this branch's own acceptance.
- **Legal-page visual inconsistency.** `impressum.html`, `privacy-policy.html`, and `404.html`
  keep today's Webflow-exported look (untouched, per instruction); `index.html` will look visually
  distinct from them until a separate task addresses the legal pages. Accepted for this task.
- **`js/finsweetcomponentsconfig-1.0.3.js` removal from `index.html` only.** The file itself is
  untouched (still used by the three legal/404 pages); only `index.html`'s own `<script>` tag and
  the markup it drove are removed.

## Out of scope

- Any change to `impressum.html`, `privacy-policy.html`, or `404.html`.
- A brand-wide color-system change (adopting the example's creme/navy/blue/turquoise palette as
  this brand's new tokens) — this task reuses the existing tokens instead (see Risks).
- Introducing Thunder, Inter, or JetBrains Mono (or any other new font).
- Copying `bilder/reels/*` (third-party Outreel client assets) into this repo in any form.
- Building the Downloads/PDF-lead-magnet section (no content exists yet).
- Reintroducing Webflow's Lottie skeleton-loader animation or any other Webflow-runtime-only
  visual effect that is not explicitly rebuilt above.
- Any change to `js/finsweetcomponentsconfig-1.0.3.js`, `js/fs-components.js`, or
  `js/webfont.js`.
- Deploying/publishing to `onlinemedianer.de`, or anything about that domain — this task only
  changes `loopstudio.app` (this repo), merged to `dev`, not `main`.
