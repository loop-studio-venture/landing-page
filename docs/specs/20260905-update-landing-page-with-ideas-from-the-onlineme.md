---
task: 20260905-update-landing-page-with-ideas-from-the-onlineme
company: loopstudio
status: ready
size: S
branch: feature/update-landing-page-with-ideas-from-the-onlineme
base: dev
design: none
---

# Bring the onlinemedianer.de example's copy discipline into index.html's feature grid, how-it-works slider, and footer

## Goal
Christian Arns shared a full redesign of the Loop Studio landing page, live at onlinemedianer.de
and snapshotted in `knowledge-base/references/landing-page-example-onlinemedianer-2026-09-05/`,
and asked to update this repo's landing page with the ideas from that example rather than
replace it wholesale. This spec adopts the one idea from that example that is safe to apply
without a new product/branding/pricing decision and without a new screen: **the whole page reads
in one consistent, benefit-led German voice, with no leftover placeholder or duplicated text per
section.** It rewrites the two places in `index.html` where that is currently broken (the
"So funktioniert Loop Studio" feature-card grid and the `#how-it-works` slider both contain
English, duplicated, or mismatched copy) and adds two missing, already-published contact/pricing
links to the footer. It deliberately does not adopt the example's visual redesign, mascot,
animation framework, Calendly booking, or consulting-pricing restructure — see "Out of scope" and
"Risks and open questions" for why and what a follow-up task would need.

## Context found
- `index.html` (repo root of this worktree; single hand-maintained former Webflow export, no
  `landing-page/` subfolder in this worktree) — the file the task touches. Content is packed onto
  a few very long lines per section rather than one line per tag; edits must be scoped to exact
  substrings, not line ranges.
- `index.html`, `#features` section, `.feature-cards_grid` (five `.feature-card_wrap` blocks) —
  every card has **two** `<p>` elements with **identical text**, and three of the five are in
  English while the rest of the page (`#path-to-content`, the tabs above this grid, `#pricing`)
  is German:
  - Card 1 "AI-Powered Script Writing" — both `<p>`s read "Generate scripts based on your saved
    video ideas."
  - Card 2 "Save and Organize Ideas" — both `<p>`s read "Save Reels that inspire you — we import
    everything automatically. Pick an inspiration and start your own project."
  - Card 3 "Voice Memos" — both `<p>`s wrongly read "Generate scripts based on your saved video
    ideas" (copy-pasted from card 1, unrelated to voice memos).
  - Card 4 — its `<h3>` has **no class** (unlike the other four, which carry
    `class="heading-style-h3"`), reads "Content Pillars", and both `<p>`s also just repeat
    "Content Pillars" / "Get a personalized script and shot list" (mismatched, not a real
    description).
  - Card 5 "Calendar" — both `<p>`s read "Plan your videos in the calendar and post
    consistently."
- `index.html`, `#how-it-works` section, `fs-slider-2_slide` (four slides) — entirely in English,
  and slide 4 has two bugs: its progress label reads `<p class="text-size-tiny
  text-color-secondary">Step 1/4</p>` (should be 4/4, duplicating slide 1's label) and its
  `<h3>We get to know you</h3>` duplicates slide 1's heading verbatim, even though its body text
  is actually about a "Done-With-You" consulting offer.
- `index.html`, `#pricing` section — the existing, verified German copy for the paid tiers:
  Loop Studio tool "15€/month", "7 Tage Kostenlos", feature bullets ("Unbegrenzter Reel-Import",
  "KI-generierte Skripte", "Shotlisten für jedes Video", "Content-Kalender & Planung",
  "Personalisiert auf deinen Account"); Consulting tier "Auf Anfrage", "Für Creator, die mehr
  Unterstützung brauchen", bullets ("Alles aus Loop Studio", "Persönliche Betreuung",
  "Social-Media-Strategie", "Hilfe beim Content-Einstieg"). This is the grounding for rewriting
  `#how-it-works` slide 4 without inventing a new consulting offer.
- `index.html`, `#path-to-content` section and the tabs inside `#features` — already-published,
  verified German phrasing to reuse rather than invent new wording, e.g. "Speichere Reels, die
  dich inspirieren — wir importieren alles automatisch", "Reel entdecken", "Skript & Shotliste",
  "Planen & Posten".
- `knowledge-base/domains/content-pillars.md` — the real content-pillar model: a questionnaire
  produces three pillar types, `REACH`, `BRANDING`, `LEADS`. Used to write card 4's real
  description instead of the current placeholder duplicate.
- `impressum.html` — the published, real contact address `contact@loopstudio.app` (Loop Studio
  GmbH, Hansaring 79-81, 50670 Köln). Used for the new footer `mailto:` link; this task does not
  edit `impressum.html` itself.
- `index.html`, `.footer-links_wrapper` — currently three links: `Home`, `Impressum`,
  `Datenschutz`. The example's footer (`knowledge-base/references/.../source/index.html`,
  `.fuss__links`) adds direct links to pricing and contact info next to the legal links — the one
  structural idea from the footer that is a plain link addition, not a redesign.
- `landing-page/CLAUDE.md` / this worktree's root `CLAUDE.md` — rules honored here: copy is
  German first; legal pages (`impressum.html`, `privacy-policy.html`) change only on Christian's
  explicit instruction (not given for this task, so left untouched, as is `404.html`); no new
  third-party scripts/trackers without a recorded decision; prefer a small hand-written
  addition over editing the minified CSS — not needed here since only text and one class
  attribute change, no new styling.
- `knowledge-base/references/landing-page-example-onlinemedianer-2026-09-05/source/README.md` —
  the reference's own changelog (19 CSS revisions). It documents this is Christian's experimental
  redesign of `onlinemedianer.de`, structured around a "Software + Consulting" pitch with a
  mascot, GSAP/Lenis-driven scroll storytelling, and Calendly booking — a different visual
  language and, in places, a different pricing model (20 €/month tool, 490 €/1.690 €/3.900 €
  consulting packages) than what is currently published on `loopstudio.app` (15 €/month tool,
  "Auf Anfrage" consulting). Adopting that wholesale is exactly what the task brief says not to
  do; the mismatches also mean several of its ideas need a Christian decision before any code
  changes (see "Risks and open questions").

## Approach
Treat "bring the example's ideas in, don't replace wholesale" as picking the one idea that is
purely editorial, needs no new dependency, no pricing/branding decision, and no new screen: a
landing page should read as one voice, in one language, with no repeated or mismatched
boilerplate per section — which is true throughout the onlinemedianer.de example and currently
false in two places in `index.html`. Fix exactly those two places with German copy grounded in
facts already published elsewhere on this same page or in the knowledge base (no invented
numbers, features, or claims), and extend the footer's existing link list with two more plain
links using the same markup pattern already used for `Home`/`Impressum`/`Datenschutz`.

Rejected alternative: porting the example's visual structure (floating pill nav, hero word
rotation, pinned "so läuft's" scroll sequence, mascot, FAQ, founder-story video section, Calendly
CTA). Rejected for this task because each of those requires at least one of: a new third-party
script or host (Calendly widget, Lenis) needing a recorded decision per `CLAUDE.md`; a changed
layout needing a Designer draft per the architect workflow; or content that doesn't exist yet
verified anywhere in this repo or the knowledge base (FAQ answers, founder-story script, mascot
brand asset, real consulting price points matching `loopstudio.app`). Guessing at any of those
would produce a spec "built on guesses," which the process explicitly says is worse than no spec.
They are listed as follow-up candidates below, not silently dropped.

## Files to change
| File | Change | Why |
|---|---|---|
| `index.html` | Rewrite the two `<p>` texts in each of the five `.feature-card_wrap` blocks under `#features` to distinct, German, benefit-led sentences (see Acceptance criteria 1–3 for exact target copy); add `class="heading-style-h3"` to card 4's `<h3>` | Removes English/duplicated/mismatched copy; matches the sibling cards' markup |
| `index.html` | Rewrite all English text in the four `.fs-slider-2_slide` slides under `#how-it-works` into German; fix slide 4's progress label from "Step 1/4" to "Schritt 4/4" and its heading from a duplicate of slide 1 to a heading describing the Done-for-you/consulting offer, grounded in the existing `#pricing` Consulting-tier copy; relabel slides 1–3's "Step X/4" to "Schritt X/4" | Removes English copy and the two duplicate-label/heading bugs; keeps one consistent voice across the page, the idea taken from the reference |
| `index.html` | In `.footer-links_wrapper`, add two links after `Home`: `<a href="index.html#pricing" class="text-style-link">Preise</a>` and `<a href="mailto:contact@loopstudio.app" class="text-style-link">Kontakt</a>`, before the existing `Impressum`/`Datenschutz` links | Gives visitors a direct path to pricing and contact from the footer, the one plain-link idea from the reference's footer that needs no redesign |

## Acceptance criteria
1. In `#features` `.feature-cards_grid`, no `.feature-card_wrap` contains two `<p>` elements with
   identical text; every card has two distinct German sentences (a description and a one-line
   benefit), for example (implementer may polish wording slightly but must stay factually
   grounded in the Context found above and keep the "du" form, no "Sie"/"Ihnen"):
   - Card 1 (script writing): e.g. "Aus deinem gespeicherten Reel wird automatisch ein Skript in
     deinem Stil – Hook, Story und CTA inklusive." / "Kein leeres Blatt mehr vor dem Dreh."
   - Card 2 (save/organize ideas): e.g. "Speichere Reels, die dich inspirieren – Loop Studio
     importiert sie automatisch und hält sie für dich bereit." / "Nichts geht mehr im Feed
     verloren."
   - Card 3 (voice memos): e.g. "Sprich deine Gedanken einfach ein, statt sie zu tippen." /
     "Loop Studio macht daraus den Ausgangspunkt für dein nächstes Skript."
   - Card 4 (content pillars): e.g. "Ein kurzer Fragebogen genügt: Loop Studio leitet daraus
     deine Content-Säulen ab – Reichweite, Branding, Leads." / "Jedes Skript ist auf eine dieser
     Säulen gerechnet."
   - Card 5 (calendar): e.g. "Plane deine Videos im Kalender und poste regelmäßig." / "Der
     Rhythmus bleibt sichtbar – für dich und dein Team."
2. Card 4's `<h3>` carries `class="heading-style-h3"` (matching cards 1, 2, 3, 5) and its text is
   a real heading (e.g. "Content-Pillars"), not a repeat of a paragraph.
3. No English-language sentence remains inside `#features` `.feature-cards_grid` or inside
   `#how-it-works` `.fs-slider-2_slide` (spot-check: the strings "We get to know you",
   "Inspiration in", "Your script + shot list", "Done-With-You", "Step 1/4" through "Step 4/4",
   and "Result" no longer appear anywhere in `index.html`).
4. The four `.fs-slider-2_slide` progress labels read, in order, "Schritt 1/4", "Schritt 2/4",
   "Schritt 3/4", "Schritt 4/4" — no duplicate label.
5. Slide 4's `<h3>` no longer duplicates slide 1's heading; it names the consulting/Done-for-you
   offer (e.g. "Mehr Unterstützung, wenn du sie willst") and its body copy stays consistent with
   the existing `#pricing` Consulting tier (mentions personal guidance/planning support, not new
   claims or prices not already on the page).
6. `.footer-links_wrapper` in `index.html` contains, in order: a link to `index.html` labeled
   "Home", a link to `index.html#pricing` labeled "Preise", a `mailto:contact@loopstudio.app`
   link labeled "Kontakt", a link to `impressum.html` labeled "Impressum", and a link to
   `privacy-policy.html` labeled "Datenschutz".
7. `404.html`, `impressum.html`, and `privacy-policy.html` are byte-for-byte unchanged.
8. No CSS file, JS file, image, or other asset is added, removed, or modified; no `<script>` or
   `<link>` tag is added to `index.html`'s `<head>` or elsewhere.
9. `npx --yes html-validate@8 "*.html"` run from the worktree root reports no new finding for
   `index.html` versus a baseline run taken before the change (findings for the other three files
   must be identical to the baseline, since they are untouched).
10. `index.html` still renders correctly when served via `.\serve.ps1` and opened in a browser at
    a desktop width and a phone width: nav, hero, "Kennst du das?", "Weg zum Content", the
    "So funktioniert Loop Studio" tabs and feature-card grid, pricing, the `#how-it-works` slider
    (arrows/pagination/auto-advance still functional), and the footer all render with no visual
    overflow or clipping introduced by the longer German sentences.
11. All existing relative links and anchors in the touched sections (`index.html#pricing`,
    `impressum.html`, `privacy-policy.html`, and all `href`/`src` values not listed for change in
    "Files to change") are unchanged and still resolve.

## Test plan
No automated test suite exists for this static site (per `CLAUDE.md`). The Tester must run and
report, explicitly, the three checks the repo defines, plus a targeted text/diff check for this
task:
1. **Lint**: capture a baseline with `npx --yes html-validate@8 "*.html"` before the change, then
   run it again after and diff the two outputs — confirm no new finding appears for `index.html`
   and the other three files' findings are unchanged (criterion 9).
2. **Preview**: `.\serve.ps1`, open `index.html` at a desktop width and a phone width; visually
   confirm every section listed in criterion 10 renders and the slider still auto-advances and
   responds to clicks (this section has an existing inline progress-bar script that must keep
   working unmodified).
3. **Link check**: confirm `index.html#pricing`, `mailto:contact@loopstudio.app`,
   `impressum.html`, and `privacy-policy.html` all resolve from the new/kept footer links, and
   that no other `href`/`src` in the file changed.
4. **Content diff**: diff `index.html` against its pre-change version and confirm the only
   changes are: the feature-card text and the one added class attribute (criteria 1–2), the
   how-it-works slider text and labels (criteria 3–5), and the two new footer links (criterion
   6) — nothing else. Confirm `404.html`, `impressum.html`, `privacy-policy.html` are unchanged
   (`git -C <worktree> diff --stat` should show only `index.html`).

## Risks and open questions
- Not a blocker for this spec, but flagged for whoever scopes the next landing-page task: the
  onlinemedianer.de example's larger ideas each need a decision this task cannot make on its own
  before they can get a spec:
  - **Visual redesign** (floating/shrinking pill nav, hero word-rotation box, pinned scroll
    sequence for "so läuft's", the "Social Media Monster" mascot) — each is a changed layout and
    would need a Designer draft (`design: needed`) before an Implementer builds it, per the
    architect workflow.
  - **Calendly booking widget and Lenis smooth-scroll** — both are third-party scripts/hosts not
    currently used by this site; `CLAUDE.md` requires "no third-party scripts... without a
    recorded decision." No such decision exists yet in `knowledge-base/architecture/decisions/`.
  - **Consulting pricing restructure** (example shows 20 €/month tool + 490 €/1.690 €/3.900 €
    consulting packages vs. this site's current 15 €/month + "Auf Anfrage" consulting) — a
    pricing decision only Christian can make; guessing at numbers would be exactly the kind of
    invented fact the process forbids.
  - **A dedicated founder-story section with a self-hosted video, and an FAQ section** — both
    need real content (a founder-story video/script, verified FAQ answers about cancellation,
    guarantees, etc.) that doesn't exist yet in this repo or the knowledge base.
- Low risk: German sentences generally run longer than the English placeholders they replace,
  which could shift feature-card or slider-slide heights. The preview check (criterion 10 / test
  plan step 2) is there specifically to catch any resulting overflow or clipping; if found, the
  Implementer may shorten the wording (staying within the same facts) but must not add new CSS
  for this task — that would turn an S copy fix into a design change requiring its own spec.

## Out of scope
- Any visual/layout change to the nav, hero, `#path-to-content`, `#pricing`, or footer beyond the
  two plain links specified above.
- The mascot, Calendly integration, Lenis/GSAP scroll-storytelling redesign, consulting-pricing
  restructure, founder-story section, and FAQ section from the example — see "Risks and open
  questions" for why, and each would be its own follow-up task once the underlying decision or
  content exists.
- `404.html`, `impressum.html`, `privacy-policy.html` — untouched; legal pages change only on
  Christian's explicit instruction, which this task does not have.
- Any new CSS, JS, image, or font file, or any change to `css/loopstudio-app.webflow.shared.min.css`
  or the `js/` files.
- Fixing any other html-validate finding not related to this task's text changes.
