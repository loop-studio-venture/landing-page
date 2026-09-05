---
task: 20260905-update-landing-page-with-ideas-from-the-onlineme
company: loopstudio
status: ready
size: L
branch: feature/update-landing-page-with-ideas-from-the-onlineme
base: dev
design: none
---

# Bring the onlinemedianer.de example's structure, motion, and copy ideas into the Loop Studio landing page

## Goal
Christian Arns posted a new example version of the Loop Studio landing page, live at
onlinemedianer.de and snapshotted in the knowledge base, and asked to update this repo's
landing page with the ideas from that example rather than replacing it wholesale. Per
Christian's own follow-up answers (2026-09-05): adopt the example's nav, hero, scroll
sequence, and mascot assets (visual language), add GSAP/Lenis-driven scroll motion and a
Calendly booking widget (recording that as an ADR), keep the currently published pricing
unchanged (15 €/month tool, consulting "Auf Anfrage"), treat the example's FAQ and
founder-story copy as a draft for Christian to review, and skip the Designer round because
the example itself is the design source.

## Context found
- `index.html` (repo root — this worktree has no `landing-page/` subfolder; root **is** the
  landing-page repo): single-file static page. Nav is a plain Webflow `nav_component`; hero
  has a headline + sub-headline + YouTube (`RoZh2NASzNE`, nocookie) embed, no mascot; the
  "So funktioniert Loop Studio" section (`#features`) is 5 tabs (Inspiration, Analyse, Idee
  nutzen, Skript, Planung) auto-advanced by a hand-written inline `<script>` timer (not GSAP);
  pricing (`#pricing`) has two cards, Loop Studio `15€`/month with `7 Tage Kostenlos` and
  Consulting `Auf Anfrage`, both real published values; footer has Home/Impressum/Datenschutz
  only. `js/gsap.min.js` and `js/ScrollTrigger.min.js` are already vendored and linked at the
  end of `<body>` but nothing in `index.html` currently drives them — likely leftover from the
  Webflow export's own IX2 tooling. No FAQ, no founder-story section, no Calendly, no Lenis.
- `CLAUDE.md` / `README.md` (repo root): source of truth is the hand-maintained HTML/CSS/JS
  (Webflow retired); prefer a small hand-written file over editing `css/*.min.css` /
  `js/webflow.js`; no build step, must work from `serve.ps1`; German copy, Du/Sie register
  matches existing pages; links into the app always `https://app.loopstudio.app/...`; legal
  pages (`impressum.html`, `privacy-policy.html`) change only on explicit instruction (none
  given here); no third-party scripts/fonts without a recorded decision; branch from `dev`,
  never commit to `main`/`dev`.
- `docs/specs/20260904-landing-html-validate-script-type-void-style.md`: `index.html` was
  just cleaned of `script-type`/`void-style` html-validate findings (no `type="text/javascript"`,
  no self-closing void elements) — new markup must keep that style, not reintroduce it.
- `knowledge-base/references/landing-page-example-onlinemedianer-2026-09-05/source/` — the
  approved reference, per Christian: `index.html` (final, "Fassung 19") plus
  `README.md`/`BILDHERKUNFT.md` documenting 19 iterative CSS override files
  (`web/fassung2.css` … `web/fassung19.css` layered over `web/stil.css`), `web/bewegung.js`
  (GSAP + ScrollTrigger + Lenis motion), `web/seite.js` (nav/FAQ/slot logic), `web/lego.js`
  (a "Baukasten" Lego-brick builder, its own module), `web/lib/{gsap,ScrollTrigger,lenis}.min.js`
  (vendored, no CDN), fonts (`Thunder-BoldLC.woff2`, Inter, JetBrains Mono, all self-hosted),
  and `bilder/` assets (mascot "monster" PNGs, logo files, customer-reel videos, Pexels persona
  photos, tool screenshots, Christian's photo). `BILDHERKUNFT.md` confirms the mascot PNGs are
  "eigenes Material" (Loop Studio's own), safe to copy into this repo; the Pexels persona
  photos and outreel.de customer-reel videos are third-party-licensed for that site, not ours
  to reuse for fabricated quotes.
- The example is **not** just a restyle: it changes the business model shown on the page —
  a 3-tier consulting price ladder (Basis 490 €/Editing 1.690 €/Produktion 3.900 €), a
  toggleable "Vier Stationen" package calculator, a "Spielregeln" Du/Wir matrix, a Lego
  "Baukasten" content-pillar builder, a monster-feeding mini-game, 5 fabricated customer
  quotes with stock photos, and an unwired PDF-download lead form. Christian's explicit
  instruction ("Pricing stays as currently published") keeps our page on the current
  15 €-tool / Auf-Anfrage-consulting model, which does not need any of that machinery — see
  Out of scope.
- `knowledge-base/architecture/decisions/0006-passkey-webauthn-library-choice.md`: precedent
  for how an ADR is recorded when the decision belongs to `knowledge-base` (its own git
  checkout, separate from the repo doing the implementation) rather than to the feature
  branch's diff — same pattern applies here for the GSAP/Lenis/Calendly decision.
- `design/STATUS.md`: no landing-page screen design is in flight there; consistent with
  Christian's instruction to skip the Designer round for this task.

## Approach
Extend the existing pattern (hand-written override file + hand-written script, vendored local
JS, no build step) rather than introducing a build tool or rewriting the page wholesale.
Concretely:

1. **Visual language, not a rebuild.** Add one new hand-written stylesheet,
   `css/loopstudio-onlinemedianer.css`, linked *after* `css/loopstudio-app.webflow.shared.min.css`
   so its rules override cleanly, carrying the example's palette (Creme `#F4EFE6`, Navy
   `#243060`, Blau `#4D8EF7`, Türkis `#74C19E`) and a Thunder display-font treatment for
   headlines. Body copy stays in the already-self-hosted Plus Jakarta Sans (`fonts/plusjakartasans.css`)
   rather than switching to Inter — extends the existing font pattern instead of replacing it;
   flagged as an assumption below, reversible if Christian wants the full Inter pairing too.
2. **Nav**: rebuild as a floating pill (matches the example's `.nav`), keeping the existing
   in-page links plus a new `#faq` link, the existing `https://app.loopstudio.app/login` CTA,
   and a new "Gespräch buchen" CTA that opens the Calendly popup.
3. **Hero**: keep the current headline's message and sub-headline copy, add the mascot
   (`images/monster-web.png`, copied from the reference's `bilder/`) and a rotating-word box
   cycling through words describing the output ("Content." / "Skripte." / "Shotlisten."),
   built in a new hand-written script `js/loopstudio-motion.js`. The existing YouTube embed
   moves out of the hero into the new founder-story section (below) instead of being
   duplicated.
4. **Scroll sequence**: replace the current inline-`<script>` tab auto-rotator in `#features`
   with a GSAP + ScrollTrigger pinned sequence styled like the example's `#zeigen`, but keeping
   our own 5 existing steps and our own 5 existing screenshots already in `images/`
   (`…Inspiration_page…`, `…example_inspiration_video…`, `…use_this_idea…`,
   `…generated_script…`, `…Planung…`) — not the example's fictional tool mockups. This is the
   "ideas in, not replaced wholesale" line: we borrow the scroll-driven presentation, not the
   example's invented screens.
5. **Founder story** (new section): short copy adapted from the example's "Warum es Loop
   Studio gibt", reusing the existing `RoZh2NASzNE` YouTube embed (click-to-play) instead of
   self-hosting a new video file we don't have distribution rights confirmed for in this repo.
6. **FAQ** (new section, `id="faq"`): accordion adapted from the example's FAQ, trimmed to the
   questions that make sense under our unchanged pricing model (drop every question that only
   exists because of the example's 3-tier consulting ladder — see Out of scope). Marked in an
   HTML comment as draft copy pending Christian's review, per his own instruction.
7. **Pricing**: visual restyle only via the new stylesheet; the two cards keep their exact
   current copy and numbers. The Consulting card's "Kontakt aufnehmen" button changes from
   linking to `/login` (today's placeholder behavior) to opening the Calendly popup — a real
   fix enabled by the same widget, not a pricing change.
8. **Motion library decision**: keep the already-vendored `js/gsap.min.js` /
   `js/ScrollTrigger.min.js` (no new dependency there) and add `js/lenis.min.js` (vendored
   locally, MIT, copied from the reference's `web/lib/lenis.min.js` — not a CDN, matching this
   repo's existing vendoring style) for smooth scrolling. Add the Calendly `widget.js`/
   `widget.css` from `assets.calendly.com` — the one CDN exception, because Calendly does not
   support self-hosting its embeddable widget. Record both as one ADR in `knowledge-base/`,
   following the `0006-*.md` precedent (separate commit there, not part of this branch's diff).
9. **Accessibility**: every new animation (mascot motion, word rotation, pinned sequence, nav
   shrink) must no-op under `prefers-reduced-motion: reduce`, matching the example's own stated
   convention (`web/README.md`, Fassungen 4/19 notes).

Rejected alternatives:
- **Copying the example's `index.html` and CSS cascade wholesale** — rejected per Christian's
  own framing ("update our current landing page with the ideas ... rather than replacing it
  wholesale") and because it would import a different, unapproved consulting pricing model,
  fabricated customer quotes, and an unwired lead-generation form.
- **Adopting the example's 19-layer CSS-override cascade (`fassung2.css` … `fassung19.css`)
  as-is** — that history is the example project's own iteration log; this repo gets one clean
  override stylesheet reflecting the final state, not the iteration trail.
- **Self-hosting `bilder/story.mp4`** — rejected; the existing YouTube embed already serves
  the same video and needs no new asset or hosting decision.
- **View Transitions API instead of GSAP/Lenis** for the scroll sequence — not evaluated
  further here since Christian already approved GSAP/Lenis specifically.

## Files to change
| File | Change | Why |
|---|---|---|
| `index.html` | Rebuild nav (pill, +Calendly CTA, +FAQ link); hero (+mascot, +rotating word, remove duplicate video embed); replace `#features` tab auto-rotator markup with pinned scroll-sequence markup; add founder-story section; add FAQ section (`id="faq"`); restyle pricing markup hooks (classes only, copy/numbers unchanged) and repoint Consulting CTA to Calendly; add new `<link>`/`<script>` tags for the new CSS/JS files, `fonts/thunder.css`, and Calendly's CDN widget | Carries the example's structure/visual-language ideas into the real page without a rewrite |
| `css/loopstudio-onlinemedianer.css` (new) | Palette tokens, Thunder headline treatment, pill nav, hero mascot layout, rotating-word box, scroll-sequence panel, founder-story layout, FAQ accordion, pricing card refresh, Calendly popup overlay tweak | Hand-written override file per repo convention; keeps the minified Webflow CSS untouched |
| `fonts/thunder.css` (new) + `fonts/Thunder-BoldLC.woff2` (new, copied from the reference) | `@font-face` for the headline display font | Self-hosted, follows the existing `fonts/plusjakartasans.css` pattern; no external font host |
| `images/monster-web.png` (new, copied from the reference's `bilder/`) | Mascot artwork for hero + founder-story visual language | Explicitly approved by Christian ("mascot assets from bilder/"); confirmed own material in `BILDHERKUNFT.md` |
| `js/lenis.min.js` (new, vendored copy v1.1.18, MIT, from the reference's `web/lib/lenis.min.js`) | Smooth-scroll library | Approved by Christian; vendored locally, consistent with how `gsap.min.js`/`ScrollTrigger.min.js` are already vendored |
| `js/loopstudio-motion.js` (new, hand-written, commented) | Lenis init; nav shrink-on-scroll; hero mascot motion + word rotator; pinned scroll-sequence (GSAP ScrollTrigger) driving the existing 5 steps/screenshots; FAQ accordion open/close; Calendly popup open handlers; `prefers-reduced-motion` guard throughout | Replaces the ad hoc inline `<script>` tab timer with one readable, vendored-library-driven file |
| `knowledge-base/architecture/decisions/000X-landing-page-scroll-motion-and-booking-widget.md` (new, separate commit in the `knowledge-base` checkout) | ADR recording the Lenis + Calendly (+ continued use of already-vendored GSAP/ScrollTrigger) decision, alternatives rejected | Required by Christian ("record the decision as an ADR"); follows the `0006-*.md` precedent for cross-cutting decisions living outside the implementing repo's branch |

## Acceptance criteria
1. `npx --yes html-validate@8 "*.html"` reports no new findings for `index.html` beyond
   whatever the pre-change baseline already had (no reintroduced `script-type`/`void-style`
   issues); `404.html`, `impressum.html`, and `privacy-policy.html` are byte-for-byte
   unchanged.
2. `index.html`'s `<nav>` renders as a floating pill containing the existing in-page anchors,
   a new `#faq` link, the unchanged `https://app.loopstudio.app/login` CTA, and a "Gespräch
   buchen" CTA that opens the Calendly popup widget.
3. The hero shows `images/monster-web.png` and a rotating-word element cycling through at
   least three words describing Loop Studio's output; the hero's message/sub-headline keeps
   its current meaning (copy may be lightly adapted, not replaced with the example's unrelated
   claims).
4. The former `#features` tab auto-rotator is replaced by a GSAP-ScrollTrigger-pinned scroll
   sequence that presents the same 5 existing steps (Inspiration, Analyse, Idee nutzen,
   Skript, Planung) using the same 5 screenshots already present under `images/` — no new
   fictional tool-screenshot images are added.
5. A new founder-story section exists with adapted copy and the existing `RoZh2NASzNE`
   YouTube (nocookie) embed, click-to-play; no new video file is added to the repo.
6. A new `id="faq"` section exists with an accordion of questions adapted from the example,
   containing no question tied to the example's 3-tier consulting price ladder; the section
   carries an HTML comment marking the copy as draft pending Christian's review.
7. The pricing section's two cards keep their exact current text and numbers (`15 €`/month,
   `7 Tage Kostenlos`, the five existing feature bullets; Consulting `Auf Anfrage`) — visual
   classes may change, wording/numbers must not; the Consulting card's CTA opens the Calendly
   popup instead of linking to `/login`.
8. `impressum.html` and `privacy-policy.html` are not modified.
9. All newly added scroll/motion effects (mascot motion, word rotation, nav shrink, pinned
   sequence, FAQ accordion transition) are inert when the browser/OS is set to
   `prefers-reduced-motion: reduce`, verified in the local preview.
10. `js/gsap.min.js`, `js/ScrollTrigger.min.js`, and the newly added `js/lenis.min.js` are all
    loaded from local files under `js/`, not a CDN. The only new CDN resources are Calendly's
    `widget.js`/`widget.css` from `assets.calendly.com`.
11. An ADR file exists under `knowledge-base/architecture/decisions/` documenting the
    Lenis + Calendly decision, in the same format as the existing ADRs in that folder (Status,
    Context, Decision, Rejected alternative, Consequences).
12. The page opens and works from `.\serve.ps1` with no build step; every relative asset path
    (`css/…`, `fonts/…`, `images/…`, `js/…`) resolves; every link into the app still points to
    `https://app.loopstudio.app/...`.
13. All new copy on `index.html` is German, Du-form, matching the existing site's register.

## Test plan
No automated test suite exists for this static site (per `CLAUDE.md`). The Tester must run and
report, explicitly, these checks:
1. **Lint**: `npx --yes html-validate@8 "*.html"` from the worktree root — confirm `index.html`
   introduces no new finding versus the pre-change baseline, and the three untouched pages are
   unaffected.
2. **Preview**: `.\serve.ps1`, open `index.html` at desktop width and a phone width (per
   `CLAUDE.md`'s existing convention); additionally: (a) toggle `prefers-reduced-motion:
   reduce` (DevTools rendering emulation) and confirm nav/hero/sequence/FAQ still render
   correctly with motion suppressed; (b) open DevTools console and scroll the full page,
   confirming no JS errors from Lenis/GSAP/ScrollTrigger/Calendly; (c) click the "Gespräch
   buchen" CTAs and confirm the Calendly popup opens (report explicitly if this fails in an
   offline/sandboxed preview environment, since it depends on reaching `assets.calendly.com`);
   (d) exercise the FAQ accordion by mouse and keyboard (Enter/Space on the focused question).
3. **Link check**: confirm every relative link/asset path resolves and every app link is
   `https://app.loopstudio.app/...`.

## Risks and open questions
- **Calendly account/link is assumed, not confirmed.** The reference example uses
  `calendly.com/christianarns/15min`; this spec assumes reusing the same handle as a
  placeholder. Does not block the Implementer/Tester round (the popup structurally works
  regardless of which Calendly account it points to), but Christian must confirm the correct
  Loop Studio booking link before this branch is merged toward `main`.
- **Lenis vs. the existing Webflow IX2 fade-ins.** The current hero markup has
  `style="opacity:0"` elements with `data-w-id` attributes that Webflow's own `js/webflow.js`
  fades in on load/scroll via IX2. Lenis intercepts native scroll and could interact oddly
  with IX2's scroll-position assumptions. Not blocking — this is a known integration point
  (Lenis's documented `lenis.on('scroll', ScrollTrigger.update)` pattern) the Implementer must
  verify visually and adjust if the fade-in double-fires or fails to fire.
- **Font-pairing scope is an assumption.** Only the Thunder headline font is added; body copy
  stays Plus Jakarta Sans rather than switching to Inter, and JetBrains Mono (used for small
  labels in the example) is not adopted. This extends the existing font pattern rather than
  replacing it wholesale, per the task's own framing — but if Christian wants the full
  Thunder/Inter/JetBrains-Mono pairing, that is a small follow-up, not a blocker here.
- **FAQ and founder-story copy are explicitly drafts** (Christian's own instruction) — the
  Reviewer should check structure/testability, not final wording precision.
- **Mascot's other poses** (`monster-neugier.png`, `monster-satt.png`, `monster-portrait.png`,
  `monster-mund-auf.png`, `monster-kaut.png`) exist in the reference and could support a future
  "monster feeding" interaction, but only the base `monster-web.png` pose is copied in for this
  task — see Out of scope.

## Proposed split (Christian decides)
This is sized L because it touches the whole public marketing page and adds two new
dependencies (Lenis, Calendly). It can run as one Implementer round, or as four independently
mergeable slices:

1. **Foundation** — vendor `js/lenis.min.js`, add `fonts/Thunder-BoldLC.woff2` +
   `fonts/thunder.css`, copy `images/monster-web.png`, add
   `css/loopstudio-onlinemedianer.css` with palette/font tokens only (not yet widely applied),
   and write the ADR. No visible page change beyond a possible headline-font accent. Cheapest
   to verify (html-validate + preview) and everything else depends on it.
2. **Nav + hero** — floating pill nav, Calendly popup wiring, hero mascot + rotating-word
   headline.
3. **Scroll sequence + founder story** — replace the tab auto-rotator with the pinned GSAP
   sequence (reusing existing steps/screenshots); add the founder-story section reusing the
   existing YouTube embed.
4. **FAQ + pricing + footer** — new FAQ accordion (draft copy), pricing cards reskinned
   (values unchanged), Consulting CTA repointed to Calendly.

Recommended first slice: **Foundation** — it carries all the new-dependency risk (Lenis
vendoring, ADR, new font/asset licensing) in one small, low-visual-risk change, so any
integration surprise (e.g. the Lenis/Webflow-IX2 interaction noted above) surfaces before the
larger, harder-to-revert markup changes in slices 2–4.

## Out of scope
- Any change to `impressum.html`, `privacy-policy.html`, or `404.html`.
- Adopting the example's 3-tier consulting price ladder (Basis 490 €/Editing 1.690 €/
  Produktion 3.900 €) or its toggleable "Vier Stationen" package calculator and "Spielregeln"
  Du/Wir matrix — Christian's instruction keeps pricing exactly as currently published.
- The example's Lego "Baukasten" content-pillar builder module (`web/lego.js`/`lego.css`) and
  its own animated brick-stacking demo.
- The interactive "monster feeding" mini-game (click-to-feed counter, growth animation) —
  only the static mascot pose is adopted this round.
- The example's 5 fabricated customer quotes with stock Pexels persona photos — not real Loop
  Studio customers, not ours to publish as testimonials.
- The example's downloadable Content-Handbook/Workbook PDFs and their unwired email-capture
  form — no backend exists to receive or send them.
- Self-hosting the founder-story video file (`bilder/story.mp4`); the existing YouTube embed
  is reused instead.
- Any backend/API/CRM wiring for Calendly beyond the client-side popup embed.
- A full Inter/JetBrains-Mono body-copy font swap — only a Thunder headline accent is added.
