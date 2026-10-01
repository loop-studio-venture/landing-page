---
task: 20260929-landing-page-critical-design-fixes-martin-henric
company: loopstudio
status: ready
size: L
branch: feature/landing-page-critical-design-fixes-martin-henric
base: dev
design: handoff at design/handoff/landing-page/ (Landing Page)
---

# Landing page: fix the five critical points from Martin Henrich's review (CTA pairing, hero frame alignment, step-headline accent, pricing explanation, offer-sequence clarity)

## Goal

Martin Henrich reviewed a recording of the live `loopstudio.app` landing page on 2026-09-29 and
flagged six points; five are accepted as work. This task delivers a design round for those five
points plus the implemented, verified fixes in repo `landing`: the primary-CTA colour pairing
reads clearly (≥ 4.5:1), the hero dashed frame shows all three rotating words optically aligned,
all four step-headline accent words are readable on the navy panel, the pricing block says in
German what exactly costs 20 €/month, and the software / four steps / three consulting packages
read as one offer sequence rather than three separate offers. It is a refinement pass on a live
page — sections, motion, mascot art, fonts and structure stay (LS-82-D4).

## Assumptions

- The design round is started by the Dev Manager once this task reaches `awaiting-design` — not by
  the Architect and not by whoever filed the task; this spec posts nothing itself
  (`design/README.md` is the round's process, LS-82-D5 its gate).
- Implementation starts only after the round's pick is exported into `design/handoff/landing-page/`
  (LS-82-D5). If Christian waives the round in the task thread, the Implementer works straight from
  the acceptance criteria below and the same criteria still apply.
- "Every primary CTA" means every element carrying `.btn--tuerkis` — 8 in `index.html`
  (lines 65 nav "Login", 77 mobile-menu "Login", 102 hero "Gespräch buchen", 292 "Mit Reels
  füttern", 375 "Paket ansehen", 419 "Jetzt starten", 443 Editing "Gespräch buchen", 508 "PDFs
  schicken"). The CSS rule cannot distinguish them, so all eight change together — the concept's
  §S1 was corrected to the same eight (LS-82-D7).
- Green stays the CTA colour family (round 1c, LS-82-D2). Only the exact pairing is open, and the
  round shows both readings of LS-82-S1-Q2 (dark label on a lighter green vs. light label on a
  darker green) for Martin to pick.
- Non-CTA uses of `--tuerkis` (eyebrow rule + bar, `.schritt__nr`, `.nav__tag`, `.hl` highlight,
  `.preiskarte__badge`, the check icons in `.preiskarte__liste li::before`, the navy-section focus
  ring) keep today's `#1BA17B` unless the design round explicitly decides otherwise — the review is
  about buttons, not about repainting the page.
- `--blau` `#273EA2` keeps its current value everywhere; the step-headline fix is a new accent value
  applied at `.schritt h3 em` only. Repointing `--blau` would change 35+ unrelated rules.
- The price stays **20 €** (it is what is live, what the review names, and what three visible spots
  on the page say). `knowledge-base/` is not edited by this task (LS-82-S1-Q4).
- The `"Was ist der Unterschied zur Software für 15 Euro?"` string in the JSON-LD `FAQPage`
  (`index.html:546` as read when this spec was written; the block now sits two lines lower, at
  `index.html:548`, after the pricing-copy edit) is **not** touched in this slice — it is structured
  data, not visible copy, and changing it depends on the same unanswered LS-82-S1-Q4 (the concept
  records this in-page contradiction, LS-82-D8). This is no longer this spec's default but a
  recorded decision: **82-S1-Q15 (2026-10-01, Dev Manager decision policy from the feature's
  DECISIONS.md)** — "this slice leaves the '15 Euro' string in the JSON-LD FAQPage at
  `index.html:546` unchanged; it becomes a one-string fix to 20 € once Christian answers
  LS-82-S1-Q4." AC 14 makes that testable; it is no longer a gate-1 offer to align it here.
- The pricing block is not moved; `#pakete` keeps its position between `#lego` and `#fuer-wen`
  (LS-82-D3). Criterion 5 is text/clarity only.
- Review point 4 ("Oder wir." / its header, ~1:54–2:13) is not implemented here (LS-82-S1-Q1); its
  accent word is step 03's `<em>` and is covered by the step-headline criterion anyway.
- Verification numbers in this spec that are marked *hand-computed* were calculated from the WCAG
  2.x relative-luminance formula against the hex values in the repo's CSS; this session could run no
  commands, so every one of them is **unverified** until the Tester re-measures.
Correct me at gate 1, otherwise I proceed with these.

## Context found

- Implements CONCEPT.md §S1 ("Landing page critical design fixes (Martin Henrich review)"),
  `C:\code\loopstudio\features\LS-82-landing-page-critical-design-fixes-marti\CONCEPT.md`; decisions
  LS-82-D1…D6 in that file's "Decisions log" are binding.
- `CLAUDE.md` (this repo): hand-maintained static site, no build step, German copy first, every page
  must work from `serve.ps1`, branch rule `fix/`/`feature/` off `dev`, and the three-step check
  (html-validate / preview at desktop + phone / links) that must be reported explicitly.
- `design/handoff/landing/README.md`: the approved colour round **1c** ("Light hybrid, green CTAs")
  from the former `loop-studio-venture/landing-page` repo, including its rule *"every button or chip
  that sits on a green or blue background uses dark text — never white"*, and its own token
  vocabulary (`--cta-bg`, `--cta-fg`) — the names this spec reuses. Its `--cta-bg #1ba17b` is round
  1c's value; this folder is **history and not this task's handoff** (round 2 exports to
  `design/handoff/landing-page/`, see the next bullet and AC 2).
- `design/README.md`: the current round format — `design/draft/<Screen>/round-<n>/` with
  `variant-<letter>.html` + `overview.html` + headless PNG renders, overview posted first to
  `#design-loopstudio`, approved round exported to `design/handoff/<route-slug>/` — for this screen
  `design/handoff/landing-page/`, the path this spec's `design:` frontmatter line and this task's
  brief both name. That file's "Handoff README template" also requires a **Design tokens** section
  ("Write every one of these sections"): the values tied to their real token names, not a hex dump.
- `design/draft/Landing Page/round-2/README.md` (committed in `C:\code\loopstudio`): the round-2
  decision table with the picked variant's token values and measured ratios (row 1 CTA
  `#111111` on `#22C194` = 8.20:1, row 3 step accent `#7FDCC0` = 7.74:1) and the note that hover
  keeps the rest-state surface colour, so the hover ratio equals the rest ratio.
- `design/handoff/landing-page/README.md`: the round-2 export. It was produced **mechanically** (no
  Designer session) and still lists "Design tokens" under "What this export could not fill in" —
  AC 2a is what closes that gap.
- `web/stil.css`: `:root` tokens (lines 24-60, including the 1c comment block at 33-35 that states
  the current pairings), `.btn--tuerkis` + `:hover` (116-117), `:focus-visible` (71-72).
- `web/fassung2.css:53-54`: re-declares `.btn--tuerkis` and its hover **after** `stil.css` — a change
  made only in `stil.css` would not take effect.
- `web/fassung10.css:38`: `.preiskarte .btn{background:var(--tuerkis);color:#111111;…}` (0,2,0) —
  the pricing-card CTA's real declaration site. Lines 27-35 hold the pricing card, its badge and the
  green check icons.
- `web/zugang.css:54`: `.mobmenu a.btn--tuerkis{color:#111111}` — restores the label colour in the
  mobile menu against `fassung2.css:74`; a fourth declaration site.
- `web/fassung4.css:112-113`: `.schritt h3` (white) and `.schritt h3 em{color:var(--blau)}` — one
  rule, all four step headlines. The panel behind it is `.zeigen__panel` (`fassung4.css:106`),
  `background:var(--tinte)` = `#243060` (`fassung2.css:8`).
- Hero frame cascade: `.kasten` is declared in `fassung4.css:30-33` (dashed `--blau` border,
  `overflow:hidden`, `box-sizing:content-box`), then overridden in `fassung5.css:15`,
  `fassung6.css:5-6`, **`fassung9.css:7-8`** (the last geometry owner: `display:inline-grid`,
  `align-items:baseline`, `height:auto`, `line-height:.9`, `padding:.07em .18em .09em`;
  `.kasten__w{grid-area:1/1;position:static}`) and `fassung10.css:7` (`justify-items:start`).
- `web/bewegung.js:138-151`: the rotation. It requires `#kasten`, reads `.kasten__w` children, sets
  **`kasten.style.width` inline** from the active word's `offsetWidth`, re-runs on `fonts.ready` and
  on resize, and swaps `kasten__w--an`/`--weg` every 2600 ms. Any frame fix must survive an inline
  `width` on the frame and must keep those class/id names.
- `index.html`: hero headline + frame (99), step articles (178-181), four-stations section
  `#saeulen` (320-379), Baukasten `#lego` (382-399), pricing + packages `#pakete` (402-455) with
  "Die Software für 20 € im Monat." (406), the 20 € card (408-420), the packages intro incl.
  *"Loop Studio ist in jedem Paket drin"* (422-426), the three package cards (427-453), visible FAQ
  (522-528, already says 20 €) and the JSON-LD block (532-553, says "15 Euro" at 546).
- `serve.ps1`: PowerShell static server, default port **8843**, root = the repo folder.
- Reference measurements, *hand-computed, unverified* — they are what makes the two colour criteria
  non-trivial: `#111111` on `#1BA17B` = 5.78:1 (today's CTA — passes AA, so this is a perceived-
  readability fix, not a WCAG failure); `#FFFFFF` on `#1BA17B` = 3.27:1 (fails); `#FFFFFF` on
  `--tuerkis-tief` `#18765B` ≈ 5.5:1 (the concept says ≈5.2 — re-measure before quoting);
  `#273EA2` on `#243060` = 1.38:1 (today's step accent); **`#1BA17B` on `#243060` = 3.86:1**, i.e.
  brand green alone does *not* clear 4.5:1 on the navy panel — the accent has to be a lighter step
  (e.g. `--tuerkis-zart` `#DFF2ED` on navy ≈ 10.8:1), which is a real constraint for the round.

## Approach

**Colour changes are expressed as tokens, applied at every declaration site.** The CTA pairing gets
two new custom properties in `web/stil.css`'s `:root` — `--cta-bg` and `--cta-fg`, the exact names
the approved round-1c handoff already uses — seeded with the approved round-2 values and a dated
comment in the same style as the existing 1c block (`stil.css:33-35`). Every rule that currently
sets a `.btn--tuerkis` background or label colour then references those tokens instead of a literal:
`stil.css:116-117`, `fassung2.css:53-54`, `fassung10.css:38`, `zugang.css:54`. This is the pattern
the 1c round already established (tokens in `:root`, fixes recorded at the site that owns them with
a comment explaining the specificity, as `zugang.css:44-54` does) and it makes the pairing a
one-place edit afterwards. **Rejected:** repointing `--tuerkis` itself — it paints eyebrows, check
icons, badges, step numbers, the highlight and the navy focus ring, none of which Martin reviewed;
and a new `web/theme-live.css` / `fassung20.css` — a 20th override layer for something the token
system can already express.

The step accent gets its own named token (one light-on-navy accent value) in the same `:root` block,
used at `fassung4.css:113` only. **Rejected:** changing `--blau`, which 35+ unrelated rules use on
light grounds where it measures ~8:1 and is fine.

The hero frame is fixed in `web/fassung9.css:7-8`, the file that owns its current geometry, by
deriving the frame's vertical insets from the font's cap-height/baseline rather than from the line
box — so the word without a descender ("Shotlisten.", "Content.") no longer leaves the descender gap
open at the bottom while "Skripte." fills it. The exact treatment is the design round's to pick
(padding/`line-height` on the frame, a baseline shift on `.kasten__w`, or a fixed cap-height-derived
`height`); whatever is picked must keep `overflow:hidden` from clipping any of the three words, keep
`#kasten`/`.kasten__w` intact for `bewegung.js`, and survive the inline `width` that script sets.
Markup at `index.html:99` changes only if the picked treatment needs a wrapper or modifier class.
**Rejected:** dropping the rotation, or hard-coding a per-word height — both change behaviour Martin
called "sehr cool".

Criteria 5 and 6 are **copy only**, inside `#pakete` (and, where the round asks for it, the intro
lines of `#zeigen` / `#saeulen`). The 20 € card gains a short German line naming what the 20 € buys
(the software alone); the packages intro at `index.html:422-426` already carries *"Loop Studio ist in
jedem Paket drin"* and is the natural place to make the sequence explicit: software → the four steps
the software runs → optional consulting packages that include the software rather than adding to it.
The word "Basis" must not be used for the software tier, because the 490 € consulting package is
already called "Basis" (`index.html:431`). No block moves (LS-82-D3); no price changes. The JSON-LD
`FAQPage` question string is not part of this copy pass (82-S1-Q15, 2026-10-01).

## Files to change

| File | Change | Why |
|---|---|---|
| `web/stil.css` | `:root`: add `--cta-bg` / `--cta-fg` and one light step-accent token with the approved values + a dated comment next to the 1c block (33-35); `.btn--tuerkis` and `:hover` (116-117) reference `--cta-bg`/`--cta-fg` | AC 3, 4, 7 |
| `web/fassung2.css` | `.btn--tuerkis` and `.btn--tuerkis:hover` (53-54) reference the CTA tokens instead of literals | AC 3, 4 — this file overrides `stil.css` |
| `web/fassung10.css` | `.preiskarte .btn` (38) references the CTA tokens | AC 3 — pricing-card CTA declaration site |
| `web/zugang.css` | `.mobmenu a.btn--tuerkis` (54) references `--cta-fg` | AC 3 — mobile-menu Login |
| `web/fassung4.css` | `.schritt h3 em` (113) uses the new step-accent token | AC 7 |
| `web/fassung9.css` | `.kasten` / `.kasten__w` (7-8): the approved frame/baseline treatment, with a dated comment | AC 5, 6 |
| `index.html` | Pricing section `#pakete` (404-426): the "what costs 20 €" line and the offer-sequence clarity copy; hero frame markup (99) **only** if the approved treatment needs a wrapper/modifier class. The JSON-LD `FAQPage` block is **not** edited — its "15 Euro" question string stays as it is (82-S1-Q15) | AC 8, 9, 10, 5, 14 |
| `design/handoff/landing-page/README.md` (design workspace `C:\code\loopstudio`, **not this repo**; written there by **this task's Implementer step** — Christian, 2026-09-30, answered the Tester's two `spec` verdicts with **code**: the export is what is wrong, not the criteria) | Record the round-2 pick: round 2 and the picked variant, the token values with their measured contrast ratios copied from `design/draft/Landing Page/round-2/README.md` (rows 1 and 3 of its decision table: `--cta-bg #22C194` with `--cta-fg #111111` = **8.20:1**, step accent `#7FDCC0` on the navy panel `#243060` = **7.74:1**, and the other values that README names — hover keeps the rest-state surface so the hover ratio equals the rest ratio, focus ring `#273EA2` on `#F4EFE6` = 7.98:1), and whether the 1c "dark text on green, never white" rule still holds — i.e. write the **Design tokens** section the mechanical export left empty and remove its "Design tokens" bullet from "What this export could not fill in" (line 62 of that file today) | AC 1, 2, 2a |
| `design/handoff/landing-page/` (design workspace `C:\code\loopstudio`, **not this repo**) | `git add` the whole folder and commit it there, so it is tracked (Christian, 2026-09-30: "commit `design/handoff/landing-page/` on the task branch so it is tracked"). Which branch that workspace has checked out is **unverified** from this session — no commands could be run; the Implementer commits on whatever branch is checked out there and names it in the report | AC 2c |
| `design/handoff/landing/README.md` | **not changed** — round 1c, kept as history | AC 2d |

Both design-workspace rows above are a write **outside this worktree**. If the acting role's path
guard refuses `C:\code\loopstudio\design\handoff\landing-page\…`, that role does not route around
the guard (82-S1-Q14, closed 2026-10-01 as a technical note with nothing for a human to decide): it
reports the refused path and the guard's own message, and the write is carried out by the role that
already has write range in the design workspace — the design step / Dev Manager that wrote
`design/draft/Landing Page/round-2/` — from the same round-2 decision table. AC 2a and AC 2c are
unchanged either way; only which role performs them may move.

## Acceptance criteria

1. A design round for the Landing Page exists under `design/draft/Landing Page/round-2/` with an
   `overview` plus one `variant-<letter>` per direction, covering: the CTA pairing (both readings of
   LS-82-S1-Q2), the dashed-frame treatment, the step-headline accent, and the pricing/steps/packages
   clarity — and is posted to `#design-loopstudio` with the overview as the thread root.
2. The picked direction is exported at **`design/handoff/landing-page/`** in the design workspace
   `C:\code\loopstudio` — that path and no other is this task's handoff (`design/README.md`'s
   `handoff/<route-slug>/` rule, this spec's `design:` frontmatter line and the task brief all name
   it). Specifically:
   a. `design/handoff/landing-page/README.md` names round 2 and the picked variant, and states that
      variant's token values — the `--cta-bg` and `--cta-fg` hex values and the `.schritt h3 em`
      accent hex — each with its measured contrast ratio against its own ground (the values may be
      copied from the committed `design/draft/Landing Page/round-2/README.md`, rows 1 and 3 of its
      decision table). No token value and no ratio is left under "What this export could not fill
      in".
   b. That export exists **before any CSS in this repo is edited**: the export README's own round-2
      draw line and the commit date of `design/draft/Landing Page/round-2/` in `C:\code\loopstudio`
      are both earlier than the first commit on this branch that touches a file under `web/`.
   c. `design/handoff/landing-page/` is tracked and committed in `C:\code\loopstudio` before this
      task reports done — `git -C C:\code\loopstudio status --porcelain design/handoff/landing-page/`
      prints nothing. An untracked export does not satisfy this criterion.
   d. The pre-existing `design/handoff/landing/` (colour round 1c, from the former
      `loop-studio-venture/landing-page` repo) is untouched: not updated, not deleted, and not read
      as this task's handoff. Its `--cta-bg #1ba17b` is round 1c's value, not round 2's.
3. Every element carrying `.btn--tuerkis` in `index.html` (the 8 listed under Assumptions) renders
   the approved pairing, and the pairing is declared exactly once as `--cta-bg`/`--cta-fg` in
   `web/stil.css`'s `:root`; no literal CTA background or label hex remains in `stil.css:116-117`,
   `fassung2.css:53-54`, `fassung10.css:38` or `zugang.css:54`.
4. The approved CTA pairing measures **≥ 4.5:1**, and the `:hover` and `:focus-visible` states of the
   same buttons measure **≥ 4.5:1** as well; each ratio is stated with its two hex values in the
   implementation report.
5. The hero frame shows `Content.`, `Skripte.` and `Shotlisten.` optically aligned in all three
   rotation states at 1440 px and at 390 px: no word sits visibly high or low inside the dashed
   frame, and no glyph (including the descender of "Skripte.") is clipped by `overflow:hidden`.
6. The word rotation still works after the change: `web/bewegung.js` is unmodified, `#kasten` and the
   three `.kasten__w` children are unchanged in count and class names, and the frame still resizes to
   each word (no visual jump or leftover width).
7. All four step headlines' accent words (`.schritt h3 em`, one rule, steps 01-04) measure **≥ 4.5:1**
   against the navy panel `#243060`; the ratio is stated in the implementation report, and `--blau`
   keeps its current value `#273EA2`.
8. The pricing section `#pakete` contains a visible German line stating that the 20 €/month covers
   the software alone; `#pakete` still sits between `#lego` and `#fuer-wen` in the document and the
   pricing card keeps its current position and structure.
9. That line does not use the word "Basis" as the name of the software tier, and it does not
   contradict `index.html:425` *"Loop Studio ist in jedem Paket drin"* — i.e. it must not read as
   "20 € on top of the package price".
10. `#pakete` states, in visible German copy, that the three consulting packages are optional add-ons
    on top of the same software and that the software is included in each package price; a
    first-time reader of `#zeigen` → `#saeulen` → `#pakete` can say what the software does, what the
    four steps are, and that software + steps + packages are one offer (gate-3 read-through).
11. Non-CTA greens are unchanged unless the exported handoff explicitly records the decision:
    `.eyebrow`/`.eyebrow::before`, `.schritt__nr`, `.nav__tag`, `.hl`, `.preiskarte__badge`,
    `.preiskarte__liste li::before`, `.sec--navy :focus-visible` still resolve to `#1BA17B`.
12. `npx --yes html-validate@8 "*.html"` reports no finding that is not already present on the base
    commit (the Tester records both runs).
13. The page renders correctly from `.\serve.ps1` at 1440 px and 390 px, and every link in the
    changed sections resolves (relative links to files in this repo, `https://app.loopstudio.app/...`
    for app links).
14. Untouched: `impressum.html`, `privacy-policy.html`, `404.html`, every `bilder/` asset, every
    font, all JS, the section order, and all prices (20 € / 490 € / 1.690 € / 3.900 € / 590 €). The
    JSON-LD `FAQPage` block in `index.html` is untouched too: its question string still reads
    *"Was ist der Unterschied zur Software für 15 Euro?"* on this branch, byte-identical to the base
    commit — `git diff` shows no change inside the `application/ld+json` block (82-S1-Q15).

## Test plan

There is no test suite in this repo and none is added (`CLAUDE.md`: "There is no test suite"); the
Test Writer has nothing to write under a test path. The Tester runs the repo's own three checks and
reports all three explicitly, plus the contrast measurements:

```
Windows — PowerShell:
powershell -NoProfile -Command "Set-Location 'C:\ai\dev-worktrees\loopstudio\landing\20260929-landing-page-critical-design-fixes-martin-henric'; npx --yes html-validate@8 '*.html'"

macOS — Terminal (zsh): not available (the cluster runs on the Windows PC)

What it does: validates all four top-level HTML pages. Expect the same findings as on the base
commit and no new ones; it prints a per-file list and exits non-zero if it finds errors.
```

```
Windows — PowerShell:
powershell -NoProfile -ExecutionPolicy Bypass -File C:\ai\dev-worktrees\loopstudio\landing\20260929-landing-page-critical-design-fixes-martin-henric\serve.ps1

macOS — Terminal (zsh): not available (the cluster runs on the Windows PC)

What it does: serves the worktree on http://localhost:8843/ and prints "Serving … on
http://localhost:8843/". Open that URL, check at 1440 px and 390 px, Ctrl+C to stop.
```

End to end the Tester verifies: the hero frame in all three rotation states (the words swap every
2.6 s — take three screenshots, or toggle `kasten__w--an` in devtools, at both widths); the four step
headlines by scrolling the pinned `#zeigen` sequence through all four; every one of the 8
`.btn--tuerkis` buttons in default, hover and keyboard-focus state; the pricing section read
top-to-bottom; and the link list of the changed sections.

## What to click

1. Hero, desktop and phone width: watch the dashed frame cycle Content. / Skripte. / Shotlisten. —
   no word sits high or low, nothing is cut off, the frame still resizes smoothly.
2. Nav "Login" and hero "Gespräch buchen": the label reads clearly at a glance, and still does on
   hover and with a keyboard focus ring.
3. Scroll the pinned "So läuft es" sequence through steps 01-04: every accent phrase ("Wir holen es
   rein.", "In deinem Stil.", "Oder wir.", "auswerten.") is comfortably readable on the navy panel.
4. Read the pricing block cold: "what exactly costs 20 €?" is answered in the visible copy, and
   nothing suggests the 20 € is charged on top of a consulting package.
5. Read `#zeigen` → `#saeulen` → `#pakete` in order as a first-time visitor: software, then its four
   steps, then optional packages that include the software — one offer, not three.

## Verification and evidence

- **AC 1:** the Slack permalink of the round's overview post in `#design-loopstudio`, plus the file
  list of `design/draft/Landing Page/round-2/`.
- **AC 2:** four read-backs in the close-out, one per sub-point — (a) the token and ratio lines
  quoted verbatim from `design/handoff/landing-page/README.md`, and one grep over that file showing
  `#22C194`, `#111111` and `#7FDCC0` present and no "Design tokens" bullet left under "What this
  export could not fill in"; (b) the output of
  `git -C C:\code\loopstudio log -1 --date=iso -- "design/draft/Landing Page/round-2"` next to
  `git log --date=iso --diff-filter=M --name-only -- web/` on this branch, the former earlier than
  the first `web/` commit; (c) `git -C C:\code\loopstudio status --porcelain design/handoff/landing-page/`
  printing nothing, and `git -C C:\code\loopstudio log -1 --oneline -- design/handoff/landing-page/`
  naming the commit that landed it — that commit is made by this task's Implementer step, and the
  report names the branch it landed on; (d) `git -C C:\code\loopstudio status --porcelain design/handoff/landing/`
  printing nothing and no diff for that folder. Folder mtimes are not evidence for any of the four.
  If a role's path guard refused the design-workspace write, the close-out quotes the refused path
  and the guard message and names the role that landed it instead (82-S1-Q14) — the four read-backs
  above are still what proves AC 2.
- **AC 3:** `rg "btn--tuerkis|--cta-bg|--cta-fg" web/` output in the report, showing the four
  declaration sites referencing the tokens, and one `grep -c 'btn--tuerkis' index.html` = 8.
- **AC 4, 7:** a table in the implementation report: pairing → both hex values → measured ratio →
  how it was measured (browser devtools contrast readout or the WCAG 2.x formula, named). Every row
  ≥ 4.5:1. The hand-computed figures in "Context found" are re-measured, not copied.
- **AC 5, 6:** six screenshots from the `serve.ps1` preview — the hero at 1440 px and 390 px in each
  of the three rotation states — plus one line confirming `web/bewegung.js` is unchanged
  (`git diff --stat` shows no entry for it).
- **AC 8-10:** the rendered pricing section at 1440 px and 390 px as a screenshot, and the new/changed
  copy quoted verbatim in the report.
- **AC 11:** `git diff` of `web/` in the report; any line touching a non-CTA green is either absent or
  points at the recorded handoff decision.
- **AC 12-13:** both html-validate runs (base commit and branch) pasted with their exit codes; the
  desktop + phone screenshots; the checked link list with each target's result.
- **AC 14:** `git diff --stat` for the whole branch, showing only the files in "Files to change", plus
  `git diff -U0 -- index.html` in the report showing no hunk inside the `application/ld+json` block
  and one grep over `index.html` on the branch still printing the *"Software für 15 Euro"* question
  string once (82-S1-Q15).

## Will not do

- Not post the design round, and not reply in the `#design-loopstudio` review thread, from this task's
  Architect step — the Dev Manager starts the round when the task reaches `awaiting-design`.
- Not push, merge or rebase; never touch `main` (Netlify) or `dev` (LS-82-D6). No PR merge by an agent.
- Not move the pricing block, not change any price, not restructure or reorder any section.
- Not edit the JSON-LD `FAQPage` block in `index.html` — the "15 Euro" string stays as it is in this
  slice (82-S1-Q15, 2026-10-01); aligning it to 20 € is a later one-string change once LS-82-S1-Q4
  is answered.
- Not edit `impressum.html`, `privacy-policy.html`, `404.html`, `web/bewegung.js`, any image, any font,
  or the Lenis/GSAP motion.
- Not edit `knowledge-base/`, `loop-studio-frontend`, `loop-studio-backend`, or any other repo. The
  one exception is the design workspace `C:\code\loopstudio`, and there only
  `design/handoff/landing-page/`, `design/draft/Landing Page/round-2/` and `design/STATUS.md`. The
  round's own files are written and committed by the design step (Dev Manager / Designer); filling in
  and committing `design/handoff/landing-page/` is this task's Implementer step (Christian,
  2026-09-30) and is the Implementer's only write outside this worktree. The Tester edits nothing
  outside this worktree, and nobody edits `design/handoff/landing/`.
- Not route around a path guard, a denied tool or a read/write confinement to reach the design
  workspace — no copying through a scratch path, no shell redirect, no `git -C` write trick
  (82-S1-Q14, closed 2026-10-01: the Implementer declining was correct). The refusal is reported and
  the write moves to a role that has the range.
- Not fold in `design/DETAILS.md`'s open consolidation round (D-1…D-25) — it stays its own thread.
- Not add a dependency, a build step, a tracker or an externally hosted font.
- Not restart any process; nothing here runs under PM2.

## Stop conditions

- The design round picks a pairing that breaks round 1c's rule *"dark text on green or blue — never
  white"* (LS-82-S1-Q2's option b): stop, get Martin's and Christian's confirmation recorded in the
  `#design-loopstudio` thread, and update `design/handoff/landing-page/README.md` plus the `:root`
  comment in `web/stil.css` in the same change before implementing.
- A criterion's 4.5:1 cannot be reached without changing a token used beyond the CTAs or beyond
  `.schritt h3 em`: stop and ask rather than repainting the page.
- The frame fix cannot be made without editing `web/bewegung.js` or changing `#kasten`/`.kasten__w`:
  stop — that is behaviour, not styling, and needs its own decision.
- Christian answers LS-82-S1-Q4 with 15 € (or any price change): stop, the pricing copy and the
  numbers on the page need re-specifying before the copy lands. Until he answers, the JSON-LD "15
  Euro" string is simply left alone (82-S1-Q15) — that is not a stop.
- html-validate reports a finding on the branch that is not on the base commit and is not explained by
  the diff: stop and report it rather than "fixing" unrelated markup.
- Implementation is about to start and `design/draft/Landing Page/round-2/` is missing, or carries no
  picked variant with token values and ratios, and there is no waiver from Christian in the task
  thread: stop (LS-82-D5). Do not fall back to `design/handoff/landing/` — that folder is round 1c
  and its values are the ones this task is changing. If the round-2 draft is there but the export at
  `design/handoff/landing-page/README.md` is missing the token values and ratios, that is **not** a
  stop: the Implementer writes them into the export from the draft's decision table and commits the
  folder (Christian, 2026-09-30 — code, not spec).
- A path guard refuses the design-workspace write for AC 2a / AC 2c: stop that write, report the
  refused path and the guard message in the task thread, and hand the export fill-in and the commit
  to the role that has write range there (the design step / Dev Manager) — do not route around the
  guard and do not drop AC 2a or AC 2c (82-S1-Q14, 2026-10-01). Work in this repo may continue
  meanwhile only if the round-2 draft itself already carries the picked variant's token values and
  ratios (AC 2b's ordering is about the draft and the export, not about who typed them).

## Risks and open questions

- **The 15 €/20 € contradiction also sits inside the page.** Beyond the knowledge-base line
  LS-82-S1-Q4 names, `index.html:546` — inside the JSON-LD `FAQPage` — asks *"Was ist der
  Unterschied zur Software für 15 Euro?"* while the visible pricing headline, card, meta description
  and visible FAQ all say 20 €. Invisible to a reader, but it is what Google may surface. Verified
  in this worktree; folded back into the concept's LS-82-S1-Q4 (LS-82-D8). **Decided for this slice:
  leave it** (82-S1-Q15, 2026-10-01) — AC 14 now pins it as untouched, and it becomes a one-string
  fix to 20 € once Christian answers LS-82-S1-Q4. The contradiction stays live on the page until
  then; that is a known, accepted state, not an oversight.
- The JSON-LD `FAQPage` block (532-553) and the visible FAQ (522-528) contain different questions
  altogether — pre-existing, unrelated to this review, not touched here.
- The round-2 handoff at `design/handoff/landing-page/` was written by the mechanical exporter, with
  no Designer session: it links the variants but leaves "Design tokens" (and three other template
  sections) under "What this export could not fill in". AC 2a therefore needs a hand edit in the
  design workspace; it is not produced by the export step on its own, and no change in this repo can
  satisfy it. Christian assigned that hand edit — and the commit of the folder — to this task's
  Implementer step (2026-09-30), with the values taken from the round-2 decision table; the three
  non-token sections stay as the exporter left them, since AC 2a covers token values and ratios only.
- **AC 2a / AC 2c may need a role swap, not a spec change.** The Implementer's write guard refused
  `C:\code\loopstudio\design\handoff\landing-page\…` and it declined to route around the guard;
  82-S1-Q14 was closed on 2026-10-01 as a technical note with nothing for a human to decide. The
  criteria stand unchanged; "Files to change" and the last stop condition now say what happens when
  the guard refuses (report it, hand the write to the design step / Dev Manager). If that role's
  range also turns out to exclude the path, the task reports a blocked AC 2a/2c rather than
  silently closing out — AC 2a is then undertested by nobody's fault but still unmet.
- Two handoff folders exist for this one screen — `landing/` (round 1c, the former repo) and
  `landing-page/` (round 2, the `<route-slug>` convention). AC 2 fixes which one this task uses;
  consolidating or archiving the older folder is a design-workspace housekeeping item, not part of
  this task.
- Criterion 5 ("optically aligned") and criterion 10 ("reads as one offer") are not machine-provable.
  Both are covered by "What to click" lines 1 and 5 and by the screenshot evidence above; there is no
  automated check for either, and gate 3 is where they are actually decided.
- Brand green `#1BA17B` on the navy step panel measures ≈ 3.86:1 (hand-computed) — below the 4.5:1
  the concept requires. The step accent therefore needs a *lighter* step than any token in today's
  `:root` except `--tuerkis-zart`. If the round wants to reuse an existing token rather than add one,
  that is a design decision to record, not an implementation shortcut.
- The frame words swap every 2600 ms and the script writes an inline `width`; a purely CSS fix that
  looks right in a static screenshot can still jump during the transition. Check it moving, not only
  frozen.
- LS-82-S1-Q1 (review point 4, "Oder wir." and its header) is still unanswered; nobody in this chain
  has video access. It stays out of this task; if Martin says something remains, it becomes S2.
- `index.html` inline SVGs hardcode `#1BA17B` and `#273EA2` (e.g. lines 90, 93, 186-193). They are
  illustrations, not text, and are untouched — but if the round changes the CTA green to a visibly
  different hue, the hero and step illustrations will still show the old green. Flag it to the round;
  do not silently recolour them.

## Out of scope

- Any redesign of layout, sections, motion, mascot art or fonts (LS-82-D4).
- Repositioning the pricing block (LS-82-D3) and any change to prices or package names.
- Review point 4 (LS-82-S1-Q1) and anything in `design/DETAILS.md`'s consolidation round.
- `knowledge-base/domains/consulting-offer.md`'s 15 € line — owned elsewhere.
- The in-page JSON-LD `FAQPage` "15 Euro" string (`index.html:546`, now 548) — deliberately left as
  it is in this slice (82-S1-Q15); it is a one-string follow-up to LS-82-S1-Q4, not work here.
- Legal pages, the 404 page, the Webflow-era `css/*.min.css` artefacts, and the demo pages
  `web/lego-demo.html` / `web/monster-buehne.html`.
- Refactoring the 19-file `fassung*.css` override stack into one stylesheet — tempting while in
  there, and a separate task.
- Rewriting, merging or archiving `design/handoff/landing/` (round 1c) — history, left as it is.
- The four non-token sections the mechanical export left open in
  `design/handoff/landing-page/README.md` ("About the design files", "Fidelity", "Interactions &
  behavior", "State management") — only the **Design tokens** gap is closed here (AC 2a).
- Splitting this into smaller slices. The feature is cut as **one** slice (CONCEPT.md §Slices): one
  design round decides the CTA pairing, the frame treatment and the offer-sequence copy together,
  and a partial landing would put a reviewed page half on the old pairing. Size L is expected here.


## Review answers (Christian, 2026-09-30)

Question from the Tester round:
still a `spec` verdict after the Architect's amend round
What to decide:
1. "Export README names round 2 + picked variant and states the token values with their ratios; nothing left unde…" fails (fail — line 62 still reads "Design tokens" was not written by this export; #22C194, #111111, #7FDCC0 appear nowhere in the file). Should the spec change (A), the test (B) or the code (C)? *Recommendation:* A (the spec is wrong), the Tester's own verdict.
2. "`design/handoff/landing-page/` tracked and committed" fails (fail — prints ?? design/handoff/landing-page/; git log -1 -- design/handoff/landing-page/ is empty). Should the spec change (A), the test (B) or the code (C)? *Recommendation:* A (the spec is wrong), the Tester's own verdict.
• criterion: Export README names round 2 + picked variant **and states the token values with their ratios**; nothing left under "What this export could not fill in"
  test: read `C:\code\loopstudio\design\handoff\landing-page\README.md`
  result: fail — line 62 still reads "Design tokens" was not written by this export; #22C194, #111111, #7FDCC0 appear nowhere in the file
  Tester's verdict: spec
• criterion: `design/handoff/landing-page/` tracked and committed
  test: `git -C C:\code\loopstudio status --porcelain design/handoff/landing-page/`
  result: fail — prints ?? design/handoff/landing-page/; git log -1 -- design/handoff/landing-page/ is empty
  Tester's verdict: spec

Answer: code (C) for both (Christian Wenzel, 2026-09-30, terminal front desk): 1. write the token values with their ratios (#22C194, #111111, #7FDCC0 and the others the export names) into design/handoff/landing-page/README.md and close the "What this export could not fill in" gap; 2. commit design/handoff/landing-page/ on the task branch so it is tracked. No spec change.

**Folded in (Architect amend, 2026-10-01):** AC 2a and AC 2c are unchanged — Christian's answer is
"code", so the criteria stand and the artefact is what must change. The amend only moves the work:
"Files to change" now assigns filling in the export's **Design tokens** section (with the round-2
values `#22C194` / `#111111` = 8.20:1 and `#7FDCC0` on `#243060` = 7.74:1, and the removal of the
"Design tokens" bullet at line 62) and committing `design/handoff/landing-page/` to this task's
Implementer step; "Will not do" allows that one write outside this worktree; and the last stop
condition no longer fires on a token-less export — the Implementer fills it in from
`design/draft/Landing Page/round-2/README.md` instead of stopping.

**Folded in (Architect amend 2, 2026-10-01)** — the two decisions recorded on 2026-10-01 (Dev
Manager decision policy, night):

- **82-S1-Q14** ("AC 2a has no actor with write range"; closed as a technical note, nothing for a
  human to choose): AC 2a and AC 2c are **unchanged**. The spec now says what happens when the
  acting role's path guard refuses `C:\code\loopstudio\design\handoff\landing-page\…` — a note under
  "Files to change", a "Will not do" line against routing around a guard, a new last stop condition
  (report the refused path and hand the write to the design step / Dev Manager), an evidence line
  under AC 2, and a risk bullet. No criterion was added, removed or weakened.
- **82-S1-Q15** (the JSON-LD "15 Euro" string stays unchanged in this slice): the Assumptions bullet
  now cites the recorded decision instead of offering the change at gate 1; AC 14 pins the JSON-LD
  block as untouched and byte-identical to the base commit, with a read-back under "Verification and
  evidence"; "Approach", "Files to change" (`index.html` row), "Will not do", the LS-82-S1-Q4 stop
  condition, the first risk bullet and "Out of scope" say the same thing once each. The alignment to
  20 € remains a one-string follow-up to LS-82-S1-Q4, outside this slice.

Everything else in this spec is unchanged, and it stays `status: ready`, `size: L`.
