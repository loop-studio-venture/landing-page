---
task: 20260917-landing-page-colour-round-1c-green-main-ctas-blu
company: loopstudio
status: ready
size: M
branch: feature/landing-page-colour-round-1c-green-main-ctas-blu
design: handoff at design/handoff/landing/
base: dev
---

# Landing page colour round 1c: green main CTAs with dark text, blue #273EA2

## Goal
Apply the approved colour round 1c ("Heller Hybrid, grüne CTAs", Martin Henrich + Christian, 2026-09-07) to the landing page `index.html`. Cream/paper ground and navy ink stay exactly as they are. Every türkis (`#74C19E`) becomes Loop Studio green `#1BA17B` everywhere, and this explicitly includes the main CTA buttons, which must render green with dark `#111111` text in every section. Every light blue (`#4D8EF7`) becomes Loop Studio blue `#273EA2`. This is a colour-only pass: layout, copy, section order, motion, fonts and artwork do not change.

## Assumptions
- The task branch is cut from `dev`, and `dev` already carries the onlinemedianer.de page structure (`web/stil.css`, `web/fassung2.css`…`fassung19.css`, `web/zugang.css`). This matches the workspace checkout at `C:\code\loopstudio\landing-page`; which branch that checkout is on was not verified.
- Thunder (`web/stil.css:22`, `web/fonts/Thunder-BoldLC.woff2`) stays unchanged. Christian, 2026-09-17, in the desk thread: "use the Thunder font. It's free." This matches `licensed-fonts.md` row "Thunder" (Martin, 2026-09-11, case A: keep as is). No font file, `@font-face` or `--display` value is touched by this task.
- Contrast rule, measured with the WCAG relative-luminance formula rather than the handoff's blanket "never white": `#111111` on `#1BA17B` is ≈5.8:1 (pass), white on `#1BA17B` is ≈3.3:1 (fail), white on `#273EA2` is ≈9.1:1 (pass), `#111111` on `#273EA2` is ≈2.1:1 (fail), white on `#18765B` is ≈5.6:1 (pass). So text on a green fill is `#111111`, text on a blue fill stays white, and text on the dark green `--tuerkis-tief` stays white.
- Derived shades that were not separately approved come from the handoff's own token table: `--blau-tief` `#18306E`, `--blau-zart` `#E3E7F5`, `--tuerkis-tief` `#18765B`, `--tuerkis-zart` `#DFF2ED`.
- Button hover keeps the existing lift (`.btn:hover{transform:translateY(-1px)}`), and a green button keeps its green background and `#111111` text on hover. No new hover colour is invented; the old light-türkis hover literal `#8BD0AE` goes away.
- The mobile-menu Login (`index.html:77`, currently `.btn--blau`) should look like the desktop nav Login (`index.html:65`, `.btn--tuerkis`), because the handoff draws the nav Login green. So its class becomes `btn--tuerkis`. This is the only markup change.
- In `web/lego.js` `GRUND`, only the base colour, the light anchor and the text colour of `blue`/`teal` change. The dark anchors (`#15295A`, `#1D4534`) stay, because they are still darker steps of the new colours.
- The demo files `web/lego-demo.html` and `web/monster-buehne.html` are not linked from the live page and are left untouched.
Correct me at gate 1, otherwise I proceed with these.

## Context found
- `web/stil.css:24-57` `:root` holds the brand tokens: `--blau:#4D8EF7` (33), `--blau-tief:#3567C9` (34), `--blau-zart:#E4EDFE` (35), `--tuerkis:#74C19E` (36), `--tuerkis-tief:#4C9A78` (37), `--tuerkis-zart:#E2F2EA` (38). `--creme*`, `--navy*`, `--sand*` must stay.
- `web/stil.css:108,113-114`: `.btn--blau{background:var(--blau);color:#fff}`, `.btn--tuerkis{background:var(--tuerkis);color:#12301F}`, `.btn--tuerkis:hover{background:var(--tuerkis-tief);color:#fff}`.
- `web/fassung2.css:47-50` is the reason the main CTAs are navy today: `.btn--tuerkis,.btn--blau{background:var(--tinte);color:#fff}`, hover `var(--navy-tief)`. Green applies only in `.sec--navy`, `.schluss` and `.dl__form` (49), with a hover literal `#8BD0AE` (50). `--tinte` is navy `#243060` (`fassung2.css:8`).
- `web/fassung10.css:36`: `.preiskarte .btn{background:var(--tinte);color:#fff;…}` (specificity 0,2,0, loaded after fassung2) also forces the pricing "Jetzt starten" button (`index.html:419`) to navy.
- `web/fassung2.css:74`: `.mobmenu a{color:var(--tinte)}` (0,1,1) beats the button colour. `web/zugang.css:51` `.mobmenu a.btn--blau{color:#fff}` restores it for the mobile Login (`index.html:77`).
- `.btn--tuerkis` usages in `index.html`: 65 (nav Login, `#navTool`), 102 (hero "Gespräch buchen"), 292 (`#futtern` "Mit Reels füttern", in a `.sec--navy`? unverified), 375 ("Paket ansehen"), 419 (pricing "Jetzt starten", `.preiskarte`), 443 (Editing card "Gespräch buchen"), 508 (`.dl__form` "PDFs schicken").
- Text on a green fill written as `#12301F`: `stil.css:232` `.i-wir`, `:263` `.w-wir`, `:428` `.slot--an`, `:464` `.wds__wer--wir`; `fassung4.css:124` `.v-badge`; `fassung5.css:48` `.story__play`; `fassung7.css:99` `.stapel__sticker`; `fassung10.css:28` `.preiskarte__badge`; `fassung12.css:6` `.paket2__fahne`, `:29` `@keyframes frei`, `:32` `.termin:hover .termin__fuss`; `fassung16.css:13` same; `fassung2.css:49`. Other `#12301F`: `fassung8.css:28` (check-mark border), `fassung11.css:67` `.ruf__mitte b`, `stil.css:444-445` `.martin__btn`/`.martin__box`.
- White text on blue fills that stay white (they pass at ≈9.1:1): `stil.css:66` `::selection`, `:231` `.i-du`, `:261` `.w-soft`, `:346` `.paket__fahne`, `:413-414` `.f-plus`; `fassung7.css:100` `.stapel__sticker--gruen`. White on `--tuerkis-tief` stays too (≈5.6:1): `fassung4.css:75` `.tool__btn`, `fassung7.css:26` `.tool__hinweis b`.
- Literal old hex outside `:root`: `stil.css:297-300` (legacy `.block--an[data-p]`), `fassung4.css:67` `.tool__avatar` gradient, `fassung7.css:35` `.tool__termin` border, `zugang.css:31` fallback `var(--tuerkis,#74C19E)`, `rgba(116,193,158,…)` at `fassung11.css:26-27`, `fassung13.css:17`, `stil.css:445`.
- `index.html`: inline SVGs hard-code 34 occurrences of `#4D8EF7`/`#74C19E` (lines 87, 90, 93, 186-214, 245, 330, 339, 348, 357) and one `#12301F` (207). None use CSS variables.
- `web/lego.js:93-94`: `GRUND.blue ['#4D8EF7','#DCEAFE','#15295A','#FFFFFF',0.00]`, `GRUND.teal ['#74C19E','#DFF2E9','#1D4534','#12301F',0.04]`. `blue` is the default brick colour (`lego.js:137,223,510`), used in the `#lego` section (`index.html:382`).
- `web/bewegung.js:262`: `farben = { r:'#4D8EF7', b:'#74C19E', l:'#D9A64A' }` fills the calendar cells of the pinned "zeigen" sequence.
- Green used as text: `.eyebrow` uses `--tuerkis-tief` on cream (`stil.css:83`, ≈4.9:1 after the change). `.sec--navy .eyebrow` uses `--tuerkis` on navy (`stil.css:85`, `fassung2.css:36`).
- `landing-page/CLAUDE.md`: no test suite. Verification is `npx --yes html-validate@8 "*.html"`, a `serve.ps1` preview at desktop and phone width, and a link check. Never commit to `main`/`dev`.

## Approach
Extend the existing token cascade and change colour values only.
1. **Tokens:** set the six brand tokens in `web/stil.css` `:root` to the round-1c values. Every `var(--blau…)`/`var(--tuerkis…)` consumer in all `fassung*.css` files follows automatically.
2. **Main CTAs green everywhere:** in `web/fassung2.css:47-50`, split the shared rule:
   - `.btn--tuerkis` becomes `background:var(--tuerkis);color:#111111` in every context, with a hover that keeps the same pair.
   - `.btn--blau` becomes `background:var(--blau);color:#fff`, with hover `var(--blau-tief)`.
   - Line 49 becomes redundant, and the `#8BD0AE` hover is removed.
   - In `web/fassung10.css:36`, change only `.preiskarte .btn`'s `background`/`color` to `var(--tuerkis)`/`#111111`.
   - In `web/stil.css:113-114`, set text to `#111111` and hover to the same green/`#111111` pair.
3. **Mobile Login:** change `index.html:77` class `btn--blau` → `btn--tuerkis`, and change `web/zugang.css:51` to `.mobmenu a.btn--tuerkis{color:#111111}`. Only the selector and value change; the comment is updated to match.
4. **Dark text on green:** replace `#12301F` with `#111111` in every file listed under Context found, including `index.html:207`.
5. **Blue fills keep white text**, and `--tuerkis-tief` fills keep white text. No change to those rules beyond the token swap.
6. **Literal hex:** do a direct find/replace of `#4D8EF7`→`#273EA2` and `#74C19E`→`#1BA17B` in `index.html`, `web/*.css`, `web/lego.js` and `web/bewegung.js`. Also replace `rgba(116,193,158,` → `rgba(27,161,123,`. Set the `lego.js` light anchors to `#E3E7F5` (blue) and `#DFF2ED` (teal) and the teal text colour to `#111111`.
Rejected: a new `web/theme-live.css` loaded last. It would re-override the same rules a second time instead of fixing the single source, and the resulting diff would be harder to audit. Also rejected: moving blue badges to pale fills, as the previous spec did. That was based on wrong contrast maths, because white on `#273EA2` already passes.

## Files to change
| File | Change | Why |
|---|---|---|
| `web/stil.css` | 6 `:root` token values; `.btn--tuerkis` + hover text `#111111`; `#12301F`→`#111111`; literal old hex and `rgba(116,193,158,…)` swapped | Token source; base button; dark-on-green |
| `web/fassung2.css` | Split lines 47-50: `.btn--tuerkis` green/`#111111` everywhere, `.btn--blau` blue/white, remove `#8BD0AE` | Main CTAs are navy today because of this rule |
| `web/fassung10.css` | Line 36 `.preiskarte .btn` background/color → `var(--tuerkis)`/`#111111`; line 28 `#12301F`→`#111111` | Pricing CTA is forced navy |
| `web/zugang.css` | Line 51 selector `.btn--blau`→`.btn--tuerkis`, colour `#111111`; line 31 fallback `#74C19E`→`#1BA17B`; comments updated | Mobile Login contrast; fallback hex |
| `web/fassung4.css`, `fassung5.css`, `fassung7.css`, `fassung8.css`, `fassung11.css`, `fassung12.css`, `fassung13.css`, `fassung16.css` | `#12301F`→`#111111`, old hex / rgba literals swapped | Dark-on-green; literal colours |
| `index.html` | 34 inline-SVG hex swaps, `#12301F`→`#111111` (207), class `btn--blau`→`btn--tuerkis` on line 77 | SVGs hard-code hex; mobile Login |
| `web/lego.js` | `GRUND.blue` / `GRUND.teal` base, light anchor, teal text colour | Brick colours in the Baukasten section |
| `web/bewegung.js` | Line 262 `farben.r`/`farben.b` | Calendar cells in the pinned sequence |

## Acceptance criteria
1. `web/stil.css` `:root` defines `--blau:#273EA2`, `--blau-tief:#18306E`, `--blau-zart:#E3E7F5`, `--tuerkis:#1BA17B`, `--tuerkis-tief:#18765B`, `--tuerkis-zart:#DFF2ED` (case-insensitive). `--creme`, `--creme-hell`, `--creme-tief`, `--weiss`, `--navy`, `--navy-tief`, `--navy-hoch`, `--sand`, `--sand-linie` are unchanged.
2. `index.html`, `web/*.css`, `web/lego.js` and `web/bewegung.js` contain zero case-insensitive occurrences of `#4D8EF7`, `#74C19E`, `#3567C9`, `#4C9A78`, `#E4EDFE`, `#E2F2EA`, `#12301F`, `#8BD0AE` and `rgba(116,193,158`.
3. At 1440px, the computed `background-color` of each of these is `rgb(27, 161, 123)` and its computed `color` is `rgb(17, 17, 17)`: `#navTool` (index.html:65), hero "Gespräch buchen" (102), `#futtern` (292), "Paket ansehen" (375), `.preiskarte .btn` (419), the Editing card button (443), and the `.dl__form` submit button (508).
4. At 390px with the mobile menu open, the Login link in `.mobmenu` has class `btn--tuerkis`, computed background `rgb(27, 161, 123)` and computed colour `rgb(17, 17, 17)`.
5. While hovered, each button from criteria 3-4 keeps background `rgb(27, 161, 123)` and text `rgb(17, 17, 17)`.
6. No rule in `web/*.css` pairs white text (`#fff`/`#ffffff`/`rgb(255,255,255)`) with a `var(--tuerkis)` background. No rule pairs `#111111` text with a `var(--blau)` or `var(--blau-tief)` background.
7. `.btn--blau` in `web/fassung2.css` declares `background:var(--blau);color:#fff`.
8. `web/lego.js` `GRUND.blue` is `['#273EA2','#E3E7F5','#15295A','#FFFFFF',0.00]` and `GRUND.teal` is `['#1BA17B','#DFF2ED','#1D4534','#111111',0.04]`. `web/bewegung.js` `farben` is `{ r: '#273EA2', b: '#1BA17B', l: '#D9A64A' }`.
9. Thunder is unchanged: `web/stil.css:22` `@font-face`, the `--display` value, `index.html:18` preload and `web/fonts/Thunder-BoldLC.woff2` are byte-identical to the base.
10. The diff touches only the files in "Files to change". Every changed line is a colour value, a colour-bearing selector/declaration listed in Approach, a CSS comment, or the single class change on `index.html:77`. `impressum.html`, `privacy-policy.html`, `404.html`, `web/lego-demo.html`, `web/monster-buehne.html`, images and fonts are unchanged.
11. `npx --yes html-validate@8 "*.html"` reports the same findings (rule ids, counts, files) before and after the change.

## Test plan
There is no automated test suite (`landing-page/CLAUDE.md`). The Tester runs and reports:
- `npx --yes html-validate@8 "*.html"` before and after, compared (criterion 11).
- A case-insensitive grep for every old literal in criterion 2 across `index.html web/*.css web/lego.js web/bewegung.js`, expecting zero hits.
- A read-back of the `:root` block, `fassung2.css:47-50`, `fassung10.css:36`, `zugang.css:51`, `lego.js:93-94` and `bewegung.js:262` (criteria 1, 7, 8).
- `.\serve.ps1` and a Playwright run at 1440px and 390px: read `getComputedStyle` background/colour for the elements in criteria 3-5 (hover via `page.hover`), with the mobile menu opened through the burger.
- A `git diff --stat` and `git diff` review against criteria 9-10, plus a link check (no href changed).

## What to click
1. Desktop: the nav Login, hero "Gespräch buchen", pricing "Jetzt starten" and Editing "Gespräch buchen" are green with dark text, including on hover.
2. Phone width: open the burger menu. Login is green with dark text and readable.
3. Scroll the whole page. Accents that were türkis are now green, accents that were light blue are now #273EA2, and cream/navy look unchanged.
4. Baukasten section and the pinned "so läuft's" sequence: bricks and calendar cells use the new blue/green, and brick text is readable.
5. Footer calendar card: "frei" days pulse pale green, and the hover footer strip is green with dark text.

## Verification and evidence
- The close-out shows the html-validate output before and after, and the grep command with its zero-hit output.
- It shows the computed-style values printed by the Playwright script for every element in criteria 3-5.
- It includes a desktop and a phone screenshot of the hero, the pricing section and the open mobile menu.
- The Reviewer checks `git diff --stat` against "Files to change" and confirms that the Thunder files are untouched (criterion 9).

## Will not do
- No commits to `main` or `dev`, no merges, no Netlify deploy triggers.
- No edits to other repos, the design folder, or the font-licensing registry.
- No font, layout, copy, spacing, motion or image changes, and no new CSS file.
- No new colour values beyond those named in this spec.

## Stop conditions
- Stop if `dev` does not contain `web/stil.css` and `web/fassung2.css` with the rules cited above: the base branch is wrong.
- Stop if making a listed CTA green requires changing layout or markup beyond `index.html:77`, for example a later override not listed here that needs a structural change.
- Stop if html-validate reports a new finding that a colour value cannot explain.
- Do not stop for Thunder: Christian confirmed on 2026-09-17 that it is free and stays. If the font check flags it, report it as pre-existing and confirmed, not as a block.

## Risks and open questions
- `.sec--navy .eyebrow` (`stil.css:85`, `fassung2.css:36`) and other small green text on navy drop from ≈5.9:1 (old türkis) to ≈3.9:1 (green `#1BA17B`), which is below AA for small text. This follows the approved "türkis → green everywhere" rule. It is not changed here, but the Tester lists every green-text-on-navy spot found so Christian can decide on a follow-up.
- `.stapel__sticker--gruen` (`fassung7.css:100`) is blue despite its name. The name is left as is.
- `--blau-tief`/`--blau-zart` use the handoff's derived values, which were not separately signed off.
- Whether `#futtern` (index.html:292) sits inside a `.sec--navy` is unverified. Criterion 3 holds either way after the `fassung2.css` split.

## Out of scope
- Any change to layout, copy, section order, fonts (Thunder stays), motion or artwork.
- Legal pages (`impressum.html`, `privacy-policy.html`, `404.html`) and the demo files `web/lego-demo.html`, `web/monster-buehne.html`.
- Removing dead selectors (`.block--an[data-p]`, `.paket__fahne`, `.tool__termin`, `.martin__*`) or renaming misnamed classes. Only their colour literals change.
- Raising green-on-navy small text to AA (see Risks).