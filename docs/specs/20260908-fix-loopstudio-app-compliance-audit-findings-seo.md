---
task: 20260908-fix-loopstudio-app-compliance-audit-findings-seo
company: loopstudio
status: ready
size: M
branch: fix/fix-loopstudio-app-compliance-audit-findings-seo
base: feature/adopt-onlinemedianer-site
design: handoff at design/handoff/landing/ (approved round 1c, owned by task 20260907-apply-colour-direction-1c; this task builds no screen and only reads that handoff for A4/A5 colour decisions)
---

# Fix the developer-fixable findings of the 2026-09-08 site-compliance audit, re-verified against the redesign branch

## Goal
The site-compliance audit of 2026-09-08 ran against production (`main`, the old hand-maintained
Webflow export). This task runs on `feature/adopt-onlinemedianer-site`, the redesign that replaces
that site, so each audit finding is first re-verified against this branch and then only the ones
still present are fixed: robots.txt and sitemap.xml (S1, S2), canonical URLs (S3), per-page
title/description (S4), Open Graph and Twitter card (S5), `lang` (A1), image alt texts (A2),
focus visibility (A4), CTA contrast (A5), and third-party embeds loading before any consent (L6),
plus three small notes (the `http://` self-link on the privacy page, the footer brand spelling, and
prices marked up as headings). No cookie banner is added, the legal wording is not touched beyond
the `http://` → `https://` self-link, and the colour palette stays the one the approved 1c handoff
defines.

## Assumptions
- The base branch is `feature/adopt-onlinemedianer-site`, as the brief states. I could not read
  `companies.json` (outside this worktree), so *which* base `companies.json` configures for repo
  `landing` is **unverified**; `design/STATUS.md` (2026-09-07 note) says the repo's configured base
  is `dev` and that `feature/adopt-onlinemedianer-site` is an unmerged draft PR (#5) on top of it.
  The worktree I read is on the redesign, which is what every finding below was re-verified against.
- I could not read the audit document or its evidence folder (`C:/ai/agent-cluster/...` is outside
  the workspace and the read was denied). Every audit id, symptom and threshold below is taken from
  the task brief's own summary, **unverified against the audit text itself**. Where my re-verification
  disagrees with the brief's description of a finding, I say so in *Step 0* rather than silently
  following either one.
- **The three legacy pages are in English, not German.** `impressum.html` ("Imprint of LoopStudio"),
  `privacy-policy.html` ("Privacy policy of LoopStudio", "1. Name and address of the person
  responsible") and `404.html` ("Page Not Found") carry English body copy on this branch. A1 asks
  for `lang="de"` "on every page" and S4 for German titles; declaring `lang="de"` on an English page
  is itself a WCAG 3.1.1 failure. So the rule I apply is **`lang` and metadata match the page's
  actual content language**: `de` + German metadata for `index.html` (already German), `en` +
  English metadata for the three legacy pages. Translating them is the lawyer's job for the legal
  pages and a separate copy task for the 404 — both out of scope here. If Christian wants German
  metadata on those pages regardless, that is a one-line correction at gate 1.
- "German copy in du-form" therefore applies only to the new German strings this task adds, which
  are: the consent note under the booking button. `index.html`'s existing title/description stay
  untouched.
- The brand spelling is **"Loop Studio"** (two words). I could not find the Loop Studio
  content-style skill anywhere under `C:\code\loopstudio` (**unverified**); two words is what
  `index.html`, `README.md`, `CLAUDE.md`, the knowledge base and the design handoff all use, and
  "LoopStudio" appears only in the two legacy pages. I change it **only in the footer copyright
  line** of those pages, not in their headings or body text (that would be legal wording).
- The canonical host is the apex `https://loopstudio.app` without `www`, and `www` redirects to it.
  The legacy pages carry `data-wf-domain="www.loopstudio.app"` from Webflow; the audit and the brief
  both use the apex. The redirect itself is a Netlify setting I cannot read — **unverified**.
- Canonical and sitemap URLs use the `.html` form (`/impressum.html`), because those files provably
  exist. Whether Netlify also serves them at `/impressum` (its pretty-URL behaviour) is
  **unverified**; a self-referencing canonical on the `.html` form resolves that duplicate either way.
- Netlify publishes the repo root as-is (there is no `netlify.toml`, no build command) and serves
  `robots.txt` as `text/plain` and `sitemap.xml` as `application/xml` from its own MIME table —
  **unverified**, hence the deploy-preview check in *Verification and evidence*.
- The five feature screenshots the audit's A2 names (`bilder/tool/*.png`, 2352–2560 px) are **not
  referenced by any page on this branch**; the tool showcase is hand-built HTML. A2 is therefore a
  report, not a change (see *Step 0*).
- `A5`'s two named buttons ("Kostenlos testen", "Mehr erfahren") **do not exist on this branch**.
  I hand-computed today's CTA pairings from the CSS and they pass (see *Step 0*), but I cannot run a
  browser — the Tester re-measures and only then is A5 closed as "already fixed" or reopened.
- Removing the unused Finsweet script tag from the three legacy pages is treated as part of L6 (it
  fetches from `cdn.jsdelivr.net` on every page view, before any consent) and not as a licence
  decision; the licence question becomes moot because nothing uses the component.
- "Done" for this task = the acceptance criteria below hold on a local preview and on the PR's
  Netlify deploy preview, and every finding re-verified as "already fixed" is listed with its
  evidence in the close-out report.

Correct me at gate 1, otherwise I proceed with these.

## Context found
- `CLAUDE.md`, `README.md`: static site, no build step, no test suite; a change is verified by
  `npx --yes html-validate@8 "*.html"`, a `serve.ps1` preview on desktop + phone width, and a link
  check, all three reported explicitly. Prefer a small hand-written CSS/JS file over editing a
  generated/minified one. No third-party scripts without a recorded decision. German copy first.
- `index.html` (577 lines, hand-written redesign): `<html lang="de">`, a unique German
  `<title>` and `<meta name="description">`, `og:title` / `og:description` / `og:type` / `og:url`.
  **No** `<link rel="canonical">`, **no** `og:image`, **no** `twitter:card`.
  Lines 23–24 load `https://assets.calendly.com/assets/external/widget.css` and `widget.js` in
  `<head>`, i.e. on every page view before any interaction. Line 253–258: the founder-story video is
  a **self-hosted** `<video src="bilder/story.mp4" poster="bilder/story.jpg">` behind a poster +
  play button — the click-to-load pattern L6 asks for already exists there. Line 563: the footer's
  "Impressum" and "Datenschutz" links are `href="#"`.
- `web/bewegung.js:28–34`: `CALENDLY` URL + `kalenderOeffnen()`; every `a[href="#gespraech"]` and
  `#rufKnopf` opens `Calendly.initPopupWidget`, with `window.open(...)` as the existing fallback.
  Self-contained — the only insertion point needed for L6.
- `web/stil.css:68–69`: a global `:focus-visible{outline:3px solid var(--blau);outline-offset:3px}`
  already exists, plus a dark-section variant using `var(--tuerkis)`. No `outline:none` anywhere in
  `web/*.css`. `--blau` is `#4D8EF7` (line 33) and, hand-computed against the creme ground
  `#F4EFE6`, gives ≈2.6:1 — below the 3:1 A4 asks for. `--navy` `#243060` on the same ground is
  ≈11:1 and is **unchanged by the 1c handoff**.
- `web/stil.css:113` `.btn--tuerkis{background:var(--tuerkis);color:#12301F}` is overridden by
  `web/fassung2.css:47` `.btn--tuerkis,.btn--blau{background:var(--tinte);color:#fff}` (navy
  `#243060` + white ≈12.6:1) and, inside `.sec--navy`, by `fassung2.css:49` (türkis `#74C19E` +
  `#12301F` ≈6.7:1). `.btn--rand` is `#243060` on creme ≈11:1. All hand-computed, not measured.
- `web/fassung12.css:19` `.termin:focus-visible{outline:2px solid var(--tuerkis);outline-offset:4px}`
  wins over `fassung13/15.css`'s decorative `.termin{outline:…}` on specificity; the ring lands on
  the navy footer (≈5.9:1 today, ≈3.9:1 after 1c).
- `web/fassung11.css:4–8`, `fassung15.css:21`, `fassung16.css:17`: overrides of Calendly's own
  `.calendly-overlay` / `.calendly-popup` classes, almost all `!important`. `fassung11.css`'s header
  comment says it is deliberately placed *after* the Calendly stylesheet.
- `impressum.html`, `privacy-policy.html`, `404.html`: untouched Webflow export, one long line each.
  `<html data-wf-domain=… data-wf-page=… data-wf-site=…>` with **no `lang`**; English
  `<title>`s ("Impressum", "Privacy Policy", "Not Found"); **no description, no canonical**;
  `404.html` additionally has `og:title`/`twitter:title` = "Not Found". All three load
  `js/finsweetcomponentsconfig-1.0.3.js`, which contains `https://cdn.jsdelivr.net`. Their favicon
  `<link>`s point at `images/69bc25b5…Frame%203.png` / `images/69bc25c9…Frame%202.png`, which do not
  exist in `images/` (only three SVGs do) — pre-existing 404s, see *Risks*.
- `privacy-policy.html:178`: `<a href="http://loopstudio.app">` self-link; both legacy pages'
  footers read `LoopStudio © 2026 - All rights reserved`.
- No `fs-*` attribute exists in any HTML file in the repo — the Finsweet component is loaded but
  **not used**.
- `serve.ps1:13–26`: the MIME table has no `.txt` and no `.xml` entry, so unknown extensions fall
  back to `application/octet-stream` — the local preview would serve both new files with the wrong
  content type.
- No `robots.txt`, no `sitemap.xml`, no `netlify.toml`, no `.htmlvalidate.json` in the repo.
- `docs/specs/20260904-landing-html-validate-script-type-void-style.md`: `script-type` and
  `void-style` findings were cleared for `index.html` only; the three legacy pages still carry them.
  That is the html-validate baseline this task must not add to.
- `design/handoff/landing/README.md` + `design/STATUS.md`: round 1c approved 2026-09-07. Its target
  files are `web/stil.css` and, if unavoidable, a new `web/theme-live.css`. Palette: green `#1ba17b`,
  blue `#273ea2`, navy/creme unchanged, "dark text on green or blue, never white".
- **CTA surfaces on `index.html`, read for criterion 20** (amend pass): `.btn--tuerkis` /
  `.btn--blau` are `--tinte` `#243060` with `#fff` (`fassung2.css:47`), except inside `.sec--navy`,
  `.schluss` and `.dl__form`, where they are `--tuerkis` `#74C19E` with `#12301F`
  (`fassung2.css:49`); `.preiskarte .btn` is `--tinte` with `#fff` (`fassung10.css:36`).
  `.btn--rand` and `.btn--rand-hell` are **`background:transparent`** with `color:var(--tinte)`
  (`fassung2.css:51`), so their computed `background-color` is `rgba(0,0,0,0)` and a ratio only
  exists against the surface behind them: `.held{background:var(--creme)}` `#F4EFE6`
  (`fassung4.css:26`) for the hero pair, `.paket2{background:var(--papier)}` `#FAF7F1`
  (`fassung5.css:107`) for the package cards. `.nav` itself has **no background at any scroll
  position** — `stil.css:126` sets none, `stil.css:137` gives `.nav--fest`
  `rgba(255,255,255,.96)` but `fassung5.css:5` overrides it back to `background:transparent
  !important` — so the two nav CTAs sit over whatever section scrolls underneath.
  `fassung2.css:76` hides `.nav__rechts .btn--rand-hell` below 1000 px, and
  `.mobmenu .btn--blau` (`index.html:71`) only renders while the mobile menu is open.
  Button type scale: `.btn` `.95rem` (`fassung2.css:45`), `.btn--sm` `.88rem`, `.btn--gross`
  `1.1rem` (`fassung5.css:66`), `.preiskarte .btn` `1rem`, weight 600–700 — every one below the
  WCAG large-text threshold, so the size exception is not expected to apply anywhere.

## Step 0 — re-verify every finding before changing anything
This is the first work item, not a formality: the audit ran against a different site. The
Implementer re-runs each row below on a `serve.ps1` preview of this branch and records "still
present" / "already fixed" with the evidence in the implementation report. My own re-verification,
read from source (no browser), is the starting point:

| id | State on this branch (read from source, 2026-09-08) | Action |
|---|---|---|
| S1 | Still present — no `robots.txt` in the repo | Fix |
| S2 | Still present — no `sitemap.xml` in the repo | Fix |
| S3 | Still present — no `<link rel="canonical">` on any of the four pages | Fix |
| S4 | **Partly fixed** — `index.html` has a unique German title + description; the English Webflow default string is gone from the repo. The three legacy pages still have English Webflow titles and no description | Fix the three legacy pages only |
| S5 | **Partly fixed** — `index.html` has `og:title/description/type/url`. No `og:image` anywhere, no `twitter:card` on `index.html`; `404.html` has only `og:title`/`twitter:title` | Fix |
| A1 | **Partly fixed** — `index.html` has `lang="de"`; the three legacy pages have no `lang` at all. Their content is English (see *Assumptions*) | Fix with `lang="en"` on the three |
| A2 | **Already fixed / not applicable** — the five `bilder/tool/*.png` screenshots are referenced by no page; the tool showcase is hand-built markup. The 16 remaining `alt=""` images are decorative (mascot inside an `aria-hidden` stage, mock-UI thumbnails, the video poster inside a `role="button"` with an `aria-label`, persona avatars whose name and role stand in adjacent text, logo icons) | Report only, no change |
| A4 | **Partly fixed** — a `:focus-visible` ring exists (`stil.css:68`) and nothing sets `outline:none`; but its colour `--blau` `#4D8EF7` on the creme ground is ≈2.6:1, under 3:1 | Fix the colour |
| A5 | **Likely already fixed** — the two named buttons no longer exist; today's pairings hand-compute to ≈12.6:1, ≈6.7:1 and ≈11:1 | Re-measure in a browser; change only if a measured pair is <4.5:1 |
| L6 | **Partly fixed, partly still present** — no YouTube iframe anywhere; the founder video is self-hosted behind a poster + play button already. Still present: `index.html:23–24` load `assets.calendly.com` on every page view; the three legacy pages load the Finsweet script, which fetches `cdn.jsdelivr.net` | Fix both |
| note: `http://` self-link | Still present — `privacy-policy.html:178` | Fix |
| note: brand spelling | Still present — footer line of `impressum.html` and `privacy-policy.html` | Fix (footer line only) |
| note: prices as `h3` | **Already fixed** — `<p class="preiskarte__preis">` / `<p class="paket2__preis">`; the `h3`s next to them are the package *names*, which are correct headings | Report only |
| Finsweet licence | Loaded on the three legacy pages, **used nowhere** (zero `fs-*` attributes in the repo) | Report + remove the tag (see L6) |

If a row's re-verification disagrees with mine, the Implementer follows the re-verification and says
so in the report — the table above is evidence-based but read from source, not from a browser.

## Approach
Nine small, independent edits plus two new files, extending patterns the branch already has rather
than introducing new ones. Nothing is added that needs a build step or a dependency.

**Metadata (S3, S4, S5, A1).** Hand-edit the four pages' `<head>`s. `index.html` only gains what it
lacks (`canonical`, `og:image` + `og:image:width/height/alt`, `twitter:card`); its existing German
title, description and `og:*` stay byte-identical. The three legacy pages gain `lang`, a unique
title and description, `canonical`, the same `og:*`/`twitter:card` set, and — for `404.html` only —
`<meta name="robots" content="noindex">`, because a soft-404 must not be indexed even though it
carries a self-referencing canonical like every other page. New tags are written **without** a
trailing slash, matching the `void-style` fix already made for `index.html`, so no new html-validate
finding appears.

**og:image (S5).** One default image for all four pages,
`https://loopstudio.app/bilder/og-default.png`, 1200×630. Rejected: reusing an existing asset
(none is 1200×630 and a wrong-ratio card crops badly), and an SVG (the OG scrapers do not accept
it). The file is produced once from an existing brand asset — the suggested dependency-free route on
this machine is a throwaway PowerShell script using `System.Drawing` (draw the creme ground
`#F4EFE6`, centre `bilder/logo/loop-studio-dunkel.png`, save as PNG) — the script is not committed,
the PNG is, and the command used goes in the implementation report. If that is not possible without
adding a dependency, stop and ask (see *Stop conditions*) rather than shipping a wrong-size image.

**robots.txt / sitemap.xml (S1, S2).** Two new files at the repo root, plus two lines in
`serve.ps1`'s MIME table (`.txt` → `text/plain; charset=utf-8`, `.xml` →
`application/xml; charset=utf-8`) so the local preview can actually prove the content types the
Tester must show. The sitemap lists the three public routes; `404.html` is deliberately absent, and
`web/lego-demo.html` / `web/monster-buehne.html` are internal workbenches (see *Risks*). No
`lastmod`/`changefreq`/`priority`: a hand-maintained `lastmod` goes stale and the other two are
ignored by search engines.

**Focus visibility (A4).** A new, small, commented `web/zugang.css` linked **last** on every page,
rather than editing `web/stil.css:68` — `stil.css` is the declared target file of the in-flight 1c
task, and this keeps the two tasks off the same lines. It restates the same two-rule pattern
`stil.css` already uses, with a colour that is safe on both grounds and that 1c does not change:

```css
:focus-visible{outline:3px solid var(--navy,#243060);outline-offset:3px;border-radius:6px}
.sec--navy :focus-visible,.fuss :focus-visible,.hero :focus-visible,.schluss :focus-visible,.footer :focus-visible{outline-color:var(--tuerkis,#74C19E)}
```

The literal fallbacks make the file work on the legacy pages too, which do not load the token file.
Navy on creme ≈11:1; türkis on navy ≈5.9:1 today and ≈3.9:1 after 1c lands — both stay ≥3:1. The
dark-surface rule is **not optional**: the footer's class is `.fuss`, which `stil.css:69` does not
list, so a navy-only ring would be invisible there. No new brand colour is introduced.

**CTA contrast (A5).** No code change is planned. The 1c handoff owns the palette and its rule is
"dark text on green or blue, never white"; today's CTAs are navy-on-white and dark-on-türkis, both
already above 4.5:1 by hand calculation. The Tester measures the computed foreground/background of
every CTA and reports the ratios; if one measures below 4.5:1, the fix is the darker tone the
handoff allows (`--tuerkis-tief` / `--blau-tief`, or `#111111` text on green per the handoff's token
table) applied in `web/zugang.css`, never a new colour — and the report says which of the two
routes (colour vs. the size exception of criterion 20c) was used. Criterion 20 fixes what "every
CTA", "background" and "the exception" mean, because three of the CTAs are transparent-background
buttons whose ratio only exists against the surface behind them, and the fixed nav bar has no
background of its own at any scroll position.

**Consent before embeds (L6).** Two independent halves:
1. *Calendly, `index.html`.* Delete the two `<head>` tags. In `web/bewegung.js`, `kalenderOeffnen`
   first injects `widget.css` and `widget.js` and opens the popup in the script's `onload`; a second
   click reuses the already-loaded widget; the existing `window.open(CALENDLY)` stays as the failure
   and timeout fallback. The stylesheet is inserted with
   `document.head.insertBefore(link, document.querySelector('link[href="web/fassung11.css"]'))` so
   the branch's `.calendly-overlay` overrides keep winning the cascade exactly as they do today
   (`fassung11.css`'s own comment documents that ordering; most of its rules are `!important`, but
   `border-radius`/`overflow` are not). A one-line German note in du-form goes directly under the
   booking button — the same "loads on click" disclosure L6 asks for under the video poster.
   This is click-to-load, not a cookie banner: with it, nothing third-party is requested before the
   user asks for the booking widget.
2. *Finsweet, the three legacy pages.* Delete the `<script src="js/finsweetcomponentsconfig-1.0.3.js" …>`
   tag. It is loaded on every view, reaches `cdn.jsdelivr.net`, and drives nothing (no `fs-*`
   attribute exists). `js/finsweetcomponentsconfig-1.0.3.js` itself stays in the repo untouched, so
   Christian's buy/drop decision is not pre-empted.

**The three notes.** `http://loopstudio.app` → `https://loopstudio.app/` in `privacy-policy.html`;
`LoopStudio © 2026` → `Loop Studio © 2026` in the footer line of the two legal pages; prices are
already `<p>`, nothing to do.

Rejected overall: a consent banner (the brief forbids it and, once the embeds are click-to-load,
nothing non-essential loads before consent); editing `web/stil.css` or `index.html`'s inline SVGs
(1c's files); translating the legacy pages (the lawyer's, and a separate copy task); and touching
the minified Webflow CSS.

## Files to change
| File | Change | Why |
|---|---|---|
| `robots.txt` | New. `User-agent: *`, `Allow: /`, blank line, `Sitemap: https://loopstudio.app/sitemap.xml` | S1 |
| `sitemap.xml` | New. `urlset` with the three public routes as absolute `https://loopstudio.app` URLs | S2 |
| `bilder/og-default.png` | New. 1200×630 PNG, Loop Studio wordmark on the brand creme ground | S5 |
| `web/zugang.css` | New. The two `:focus-visible` rules above, commented, ~10 lines | A4 |
| `index.html` | Add `canonical`, `og:image` (+ `:width`/`:height`/`:alt`), `twitter:card`; link `web/zugang.css` last; delete the two `assets.calendly.com` tags (lines 23–24); add the German consent note under `#rufKnopf` | S3, S5, A4, L6 |
| `impressum.html` | `lang="en"`; unique title + description; `canonical`; `og:title/description/type/url/image*`; `twitter:card`; link `web/zugang.css`; delete the Finsweet script tag; footer `LoopStudio` → `Loop Studio` | A1, S3, S4, S5, L6, note |
| `privacy-policy.html` | Same as `impressum.html`, plus `http://loopstudio.app` → `https://loopstudio.app/` on line 178 | A1, S3, S4, S5, L6, notes |
| `404.html` | Same as `impressum.html` (minus the footer line, which has none), plus `<meta name="robots" content="noindex">`; replace the "Not Found" `og:title`/`twitter:title` | A1, S3, S4, S5, L6 |
| `web/bewegung.js` | Rewrite `kalenderOeffnen` (lines 29–33) as click-to-load with the stylesheet inserted before `fassung11.css`, keeping the `window.open` fallback | L6 |
| `serve.ps1` | Add `.txt` and `.xml` to the `$mime` table | Makes the S1/S2 content-type evidence possible locally |

## Acceptance criteria
1. Every audit id in the *Step 0* table is re-verified on a preview of this branch and recorded as
   "still present" or "already fixed", with the evidence, in the implementation report — before any
   file is changed.
2. `GET /robots.txt` returns HTTP 200 with a non-empty body containing `User-agent: *`, an allow-all
   rule, and the line `Sitemap: https://loopstudio.app/sitemap.xml`.
3. `GET /sitemap.xml` returns HTTP 200, is well-formed XML in the
   `http://www.sitemaps.org/schemas/sitemap/0.9` namespace, and contains exactly these three `<loc>`
   values: `https://loopstudio.app/`, `https://loopstudio.app/impressum.html`,
   `https://loopstudio.app/privacy-policy.html`. No `404.html`, no `web/` page.
4. On the local preview, `robots.txt` is served with a `text/plain` content type and `sitemap.xml`
   with `application/xml`.
5. Each of `index.html`, `impressum.html`, `privacy-policy.html`, `404.html` contains exactly one
   `<link rel="canonical" href="…">` whose value is the absolute `https://loopstudio.app` URL of
   that same page (`/`, `/impressum.html`, `/privacy-policy.html`, `/404.html`).
6. Each of the four pages has a `<title>` that is non-empty, ≤70 characters, unique across the four,
   and not the Webflow default "A platform for creating and sharing AI-powered content".
7. Each of the four pages has a non-empty `<meta name="description">`, and the four values are
   unique across the four pages. The **50–160 character window applies to the three descriptions
   this task writes** — `impressum.html`, `privacy-policy.html` and `404.html` — each of which must
   describe that page and state nothing the page does not contain. **`index.html` is exempt from the
   window**: criterion 8 freezes its description byte-identical to the base branch, where it is 223
   characters; 50–160 is a search-result display convention, not a validity rule, and shortening
   that string is a marketing-copy change *Will not do* excludes (see *Risks*). Length is measured
   on the decoded `content` value exactly as written, untrimmed, counted in UTF-16 code units
   (JavaScript `String.length`, so `ü` and `€` count as one each).
8. `index.html`'s `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:type`
   and `og:url` are byte-identical to their values on the base branch.
9. Each of the four pages has `og:image` = `https://loopstudio.app/bilder/og-default.png`, an
   `og:url` equal to that page's canonical, an `og:title` and `og:description`, and
   `<meta name="twitter:card" content="summary_large_image">`.
10. `bilder/og-default.png` exists, is a PNG of exactly 1200×630 pixels, under 300 kB, and shows the
    Loop Studio wordmark on the brand ground.
11. `<html>` carries `lang="de"` on `index.html` and `lang="en"` on the three legacy pages, matching
    each page's actual body language. (If gate 1 rules otherwise, `lang` and metadata language move
    together — never one without the other.)
12. `404.html` additionally carries `<meta name="robots" content="noindex">`.
13. On a fresh load of every one of the four pages, with no interaction, the browser makes **no**
    request to any host other than the page's own origin — specifically none to `calendly.com`,
    `assets.calendly.com`, `cdn.jsdelivr.net`, `youtube.com`, `youtube-nocookie.com`,
    `googlevideo.com`, `google.com`, `fonts.googleapis.com` or `fonts.gstatic.com`.
14. Clicking any "Gespräch buchen" trigger (nav, hero, the three package cards, `#rufKnopf`) loads
    the Calendly widget and opens its popup; the network log then shows the `assets.calendly.com`
    requests, and only then. A second click does not re-inject the script.
15. If the Calendly script cannot load, the click still reaches the booking page via the existing
    `window.open(CALENDLY, '_blank', 'noopener')` fallback.
16. The open Calendly popup looks unchanged from the base branch (the branch's `.calendly-overlay` /
    `.calendly-popup` overrides still apply), evidenced by a before/after screenshot pair.
17. A one-line German note in du-form sits directly under the booking button in the footer, saying
    that Calendly loads on click and that this contacts `calendly.com`.
18. No page loads `js/finsweetcomponentsconfig-1.0.3.js` any more; the file itself is still in the
    repo, unmodified.
19. Tabbing through each page shows a clearly visible focus ring on every focusable element; on the
    nav links, the nav CTAs, the hero CTAs, the footer booking button and the download-form input,
    the ring colour measures ≥3:1 against the surface directly behind it.
20. **CTA contrast on `index.html`.** Measured in the default state (no `:hover`, `:focus` or
    `:active`), at 1440 px and at 390 px viewport width, with each CTA scrolled into view:
    - **20a — the set.** Exactly these elements count as a CTA, addressed by selector:
      `.nav__rechts .btn--rand-hell` (nav "Gespräch buchen"), `#navTool`, `.held__cta .btn--tuerkis`,
      `.held__cta .btn--rand`, `#futtern`, the "Paket ansehen" `.btn` in `#saeulen`,
      `.preiskarte .btn`, the three `.paket2 .btn`, the `.dl__form` submit button, and the footer
      booking button `#rufKnopf` — for `#rufKnopf`, its two text-bearing parts `.termin__kopf` and
      `.termin__fuss` are measured separately, because they sit on different backgrounds.
      `.mobmenu .btn--blau` is measured only with the mobile menu open. A CTA that is not rendered
      at a width (`.nav__rechts .btn--rand-hell` is `display:none` below 1000 px, `fassung2.css:76`)
      is recorded as "not rendered at this width" — that is neither a pass nor a failure.
    - **20b — what "background" means.** Foreground is the computed `color` of the element that
      renders the text. Background is that element's computed `background-color`; when it is fully
      transparent (`rgba(…, 0)`, which is the case for `.btn--rand` and `.btn--rand-hell`,
      `fassung2.css:51`), it is the nearest ancestor with a non-transparent `background-color`,
      composited with any partially transparent layer in between. The report gives both colour
      values and the ratio to two decimals, computed with the WCAG 2.x relative-luminance formula.
      A CTA whose background reads as transparent is not reported as unmeasurable.
    - **20c — the threshold.** ≥4.5:1, unless the same measurement shows WCAG large text — computed
      `font-size` ≥24 px, or ≥18.66 px at computed `font-weight` ≥700 — in which case ≥3:1. The
      exception may be claimed only from those two measured values, quoted in the report; naming it
      in prose without them does not satisfy this criterion. On today's type scale no CTA is
      expected to qualify (see *Context found*).
    - **20d — the fixed nav bar is report-only.** `.nav` has no background of its own at any scroll
      position (`stil.css:126`; `fassung5.css:5` forces the scrolled `.nav--fest` transparent
      again), so the two nav CTAs sit over whatever section scrolls underneath. Their ratio is
      measured and reported over each surface they can overlap — `.held` `#F4EFE6`, `.sec--weiss`,
      `.sec--creme-hell` and `.sec--navy` `#243060` — but only the value at scroll position 0 (over
      the hero) is pass/fail for this task. A low value over a dark section is recorded as a
      finding for the palette task and does **not** fail this one: making the nav opaque is a
      `web/*.css` change *Will not do* forbids here (see *Risks*).
    - **20e** No colour outside the 1c handoff's palette is introduced.
21. `privacy-policy.html` contains no `http://loopstudio.app` link; the self-link is
    `https://loopstudio.app/`.
22. The footer copyright line of `impressum.html` and `privacy-policy.html` reads "Loop Studio", and
    the headings and body text of both pages are otherwise byte-identical to the base branch.
23. `npx --yes html-validate@8 "*.html"` reports no finding that is not already present on the base
    branch; the report lists the base-branch baseline and the after-change output side by side.
24. Every relative link and asset reference on the four pages resolves on the preview (no new 404 in
    the server log or the browser console beyond the pre-existing legacy-favicon 404s named in
    *Risks*).
25. `index.html` renders unchanged from the base branch at desktop (≥1440 px) and phone (390 px)
    width apart from the new consent note and focus rings, evidenced by before/after screenshots.

## Test plan
This repo has **no test suite** and no test directories — the Test Writer writes no test files here
(the brief says so explicitly). The equivalent of "the tests" is the repo's own three checks from
`CLAUDE.md`, run and reported explicitly, plus the browser measurements the criteria above name:

1. `npx --yes html-validate@8 "*.html"` — run once on the base branch first to capture the baseline,
   then after the change (criterion 23).
2. `.\serve.ps1` and a browser at `http://localhost:8843/` — all four pages, desktop and 390 px.
3. Link and asset check on all four pages.
4. A one-off Playwright script (`npx --yes playwright@1`, run ad hoc, **nothing added to the repo**)
   for criteria 13–15: load each page with a request listener, assert no off-origin request, click
   the booking trigger, assert the `assets.calendly.com` requests appear and the popup opens. If
   `npx` Playwright is unavailable, the fallback is the DevTools network panel with a screenshot of
   the request list before and after the click, stated as such in the report.
5. Contrast: for each focus ring (criterion 19) and each CTA in the criterion 20a set, read
   `getComputedStyle` `color`, `background-color`, `font-size` and `font-weight`; where the
   background is transparent, walk up to the nearest ancestor with a non-transparent
   `background-color` and composite (criterion 20b); compute the ratio and report the numbers, not
   "looks fine". Runs ad hoc in Playwright or DevTools; nothing is added to the repo.

## Tests to write
No automated test can be written in this repo, so every row is a manual check with the exact command
or measurement that proves the criterion.

| # | Kind | File | Under test | Fixtures / mocks |
|---|---|---|---|---|
| 1 | manual (report) | — | the *Step 0* table, page by page on a `serve.ps1` preview | none |
| 2, 3 | manual (curl) | `robots.txt`, `sitemap.xml` | `curl -s http://localhost:8843/robots.txt` and `…/sitemap.xml`; XML well-formedness via `[xml](Get-Content sitemap.xml)` in PowerShell | none |
| 4 | manual (curl) | `serve.ps1` MIME table | `curl -sI http://localhost:8843/robots.txt` and `…/sitemap.xml`, read the `Content-Type` header | none |
| 5–12 | manual (served HTML) | the four pages' `<head>` | `curl -s http://localhost:8843/<page>` and grep for `rel="canonical"`, `<title>`, `name="description"`, `og:image`, `og:url`, `twitter:card`, `<html lang`, `name="robots"` | none |
| 7 | manual (length check) | the four pages' `<meta name="description">` | one-off `node -e` over the served HTML, `String.length` of the decoded `content`; the 50–160 window is asserted for `impressum.html`, `privacy-policy.html`, `404.html` only, `index.html`'s value is recorded and compared against criterion 8, not against the window; uniqueness across all four | none; the `node -e` snippet is ad hoc and not committed |
| 8 | manual (git) | `index.html` | `git diff <base> -- index.html` shows no change to the title/description/`og:*` lines | none |
| 10 | manual | `bilder/og-default.png` | PowerShell `System.Drawing.Image::FromFile(...)` → `.Width`/`.Height`; file size from `Get-Item` | none |
| 13–15 | Playwright, ad hoc (not committed) | `index.html` + the three legacy pages; `web/bewegung.js` `kalenderOeffnen` | `page.on('request')` listener asserting off-origin hosts before the click; `page.click('#rufKnopf')`; assert the Calendly overlay element exists after the click; block `assets.calendly.com` once to prove the `window.open` fallback | Playwright's own request interception; no repo fixture |
| 16, 25 | manual (screenshots) | `index.html`, the Calendly popup | before/after screenshots at 1440 px and 390 px | none |
| 17 | manual (served HTML) | the note element under `#rufKnopf` | grep the served `index.html`; read the German wording for du-form | none |
| 18 | manual (grep + network) | the three legacy pages | `grep finsweet *.html` returns no `<script src=…>` hit; `git status` shows `js/finsweetcomponentsconfig-1.0.3.js` unmodified | none |
| 19 | manual (DevTools) | `web/zugang.css` rules | Tab through each page; `getComputedStyle` `outline-color` against the surface directly behind the element; compute the ratio; screenshot of a focused header link | none |
| 20 | Playwright or DevTools, ad hoc (not committed) | the eleven CTA selectors named in criterion 20a on `index.html` | at 1440 px and 390 px, in the default state: read `color`, `background-color`, `font-size`, `font-weight`; for a transparent `background-color` walk up to the nearest ancestor with a non-transparent one and composite (20b); compute the ratio; assert ≥4.5:1, or ≥3:1 with the measured large-text values (20c); for the two nav CTAs, repeat over `.held`, `.sec--weiss`, `.sec--creme-hell` and `.sec--navy` and report all four, with only the scroll-0 value asserted (20d); a not-rendered CTA is logged as such, not failed | none; the script is ad hoc and not committed |
| 21, 22 | manual (grep + git) | `privacy-policy.html`, `impressum.html` | `grep "http://loopstudio.app"` returns nothing; `git diff <base>` shows only the two intended one-line changes per file | none |
| 23 | manual (command) | all root `*.html` | `npx --yes html-validate@8 "*.html"` before and after | none |
| 24 | manual | the four pages | browser console + `serve.ps1` window, one page at a time | none |

## Verification and evidence
The close-out must show, per item, the artefact — not a claim:

- **Step 0 (criterion 1)**: the filled-in re-verification table, with what was observed for each id.
- **S1/S2 (2–4)**: the two `curl -sI` outputs (status + `Content-Type`) and the two `curl -s` bodies.
- **S3/S4/S5/A1 (5–12)**: for each of the four pages, the grepped `<head>` lines from the **served**
  HTML (not the file on disk), pasted into the report; the four measured description lengths listed
  next to each other, with `index.html`'s marked "exempt, frozen by criterion 8"; plus the
  `git diff` proving `index.html`'s existing metadata is untouched; plus the og-image dimensions
  read back from the file.
- **L6 (13–18)**: the Playwright (or DevTools) request list before the click — showing only
  same-origin requests — and after the click, showing `assets.calendly.com`; the before/after popup
  screenshots; the fallback demonstrated with the script blocked.
- **A4 (19)**: a screenshot of a focused header link and of the focused footer booking button, plus
  the measured `outline-color` / background pair and its ratio for each surface (light and navy).
- **A5 (20)**: one table with a row per CTA of the 20a set × viewport, each row carrying the
  selector, the computed `color`, the background used and where it came from (own
  `background-color`, or the composited ancestor named), `font-size`, `font-weight`, the ratio to
  two decimals, and pass / fail / "not rendered at this width". The two nav CTAs get their extra
  per-surface rows from 20d, marked "report-only" except the scroll-0 row. If any asserted row is
  below 4.5:1, the table also names which handoff-allowed remedy was applied and why.
- **Build check (23)**: the html-validate output from the base branch and from the branch, side by
  side, so "no new finding" is visible rather than asserted.
- **Preview + links (24, 25)**: the three `CLAUDE.md` checks reported explicitly, with the
  desktop/phone screenshots.
- **Deploy preview**: every check above repeated against the PR's Netlify deploy preview URL, with
  that URL named. If deploy previews are not enabled for this repo, the report says so explicitly
  and names the local preview as the only evidence — it does not silently skip the row.

## Will not do
- No `git checkout`, `rebase`, `merge` or `push` of `main`, `dev` or `feature/adopt-onlinemedianer-site`;
  work stays on `fix/fix-loopstudio-app-compliance-audit-findings-seo`.
- No cookie or consent banner, and no consent-management library.
- No change to the Datenschutz or Impressum wording beyond the `http://` → `https://` self-link and
  the footer brand-spelling line.
- No edit to `web/stil.css`, `web/fassung*.css`, or `index.html`'s inline SVG colours — those belong
  to task 20260907-apply-colour-direction-1c.
- No new brand colour, and no change to any colour token value.
- No new dependency, no `package.json`, no build step, no `netlify.toml`; the Playwright check is run
  ad hoc via `npx` and nothing from it is committed.
- No edit to the minified `css/loopstudio-app.webflow.shared.min.css` or the exported `js/*.js`.
- No layout, section, motion, font or copy change beyond the one consent note.
- No work in any other repository, and no re-export from Webflow.
- No deletion of `js/finsweetcomponentsconfig-1.0.3.js` itself (Christian's buy/drop decision).

## Stop conditions
- Step 0 finds a listed finding in a materially different shape than the table above (for example a
  YouTube embed that does exist, or a CTA measuring below 4.5:1 on an asserted row of criterion 20)
  → report the measurement and ask before inventing a fix, since A5's remedy is the 1c handoff's to
  give. A nav CTA measured over a dark section under the transparent nav bar is the report-only case
  of criterion 20d, not a stop.
- A 1200×630 PNG cannot be produced without adding a dependency → stop and ask; do not ship a
  differently sized image and do not add a package.
- Any `fs-*` attribute turns up in the HTML (i.e. Finsweet *is* used somewhere) → stop; removing the
  script would break a component and the licence question becomes real again.
- Task 20260907-apply-colour-direction-1c lands on this base while the work is in flight and changes
  any CTA or focus colour → stop, re-measure, and report before touching a colour.
- A description or title cannot be written without asserting a fact the page does not contain
  (especially on the legal pages) → stop and ask.
- gate 1 rejects the "metadata language follows the page language" assumption → stop before writing
  any title/description; `lang` and the copy must change together.
- The html-validate baseline on the base branch cannot be captured (command fails, no network for
  `npx`) → stop; "no new finding" is unprovable without it.

## Risks and open questions
- **The footer's Impressum and Datenschutz links are `href="#"`** (`index.html:563`). The sitemap
  this task adds lists two pages that the site itself never links to — orphan pages. Fixing it is a
  two-attribute change (`impressum.html`, `privacy-policy.html`), but it is not one of the notes the
  brief enumerated and the footer may be touched by 1c. **Does not block**: default is to leave it;
  say the word at gate 1 and it goes in.
- **`index.html`'s description is 223 characters**, about 60 over what a search result renders
  before truncating. It is not a validity error and criterion 8 (approved at gate 1) freezes the
  string; shortening it is a marketing-copy decision on German copy that carries the price claims,
  which *Will not do* excludes here. **Does not block**: one word from Christian turns it into a
  small copy task, and the trailing "Und wenn du willst…" sentence is the obvious cut.
- **The nav bar has no background at any scroll position** (`stil.css:126`, `fassung5.css:5`), so
  the two nav CTAs are dark navy text over whatever section scrolls beneath them — over
  `.sec--navy` `#243060` that approaches 1:1. Criterion 20d makes this measured and reported but
  not pass/fail, because the only fixes (an opaque nav, or a lighter nav CTA colour) are
  `web/*.css` and palette changes that belong to task 20260907-apply-colour-direction-1c. **Does
  not block**: the numbers land in the close-out so the palette task can pick it up.
- **`web/lego-demo.html` and `web/monster-buehne.html`** are internal workbenches that Netlify
  publishes. An allow-all `robots.txt` invites them to be indexed. I follow the brief (allow all) and
  leave them out of the sitemap. **Does not block**: a `Disallow: /web/` line would fix it if wanted.
- **Pre-existing 404s on the legacy pages**: their favicon `<link>`s point at two `images/…Frame%20*.png`
  files that are not in the repo. Out of scope, but the Tester's link check will see them — hence
  criterion 24 names them as the known baseline. **Does not block.**
- **The legacy pages are still the old Webflow design** while `index.html` is the redesign; the
  metadata this task adds is correct either way and survives whenever those pages are rebuilt.
  **Does not block.**
- Netlify's serving of `robots.txt`/`sitemap.xml` content types and the `www` → apex redirect are
  unverified from the repo; the deploy-preview evidence is what settles both. **Does not block.**
- The audit document itself was unreadable from this workspace, so every audit id, symptom and
  threshold is taken from the brief. **Does not block** — the *Step 0* re-verification is the
  authority for what actually gets changed.

## Out of scope
- The Datenschutz text itself (names none of the loaded third parties, describes a banner and cookies
  that do not exist) — a lawyer rewrites it, tracked on the board.
- The DNS blocker (no MX, no SPF, malformed DMARC) — Christian, board item
  `20260908-loopstudio-mx-blocker`.
- The Finsweet licence buy/drop decision — Christian's; this task only stops loading an unused script.
- The AGB / pricing note — Christian Arns and the lawyer.
- Translating `impressum.html`, `privacy-policy.html` or `404.html` into German (and the
  corresponding `lang="de"` + German metadata that would follow).
- Applying colour direction 1c — task 20260907-apply-colour-direction-1c owns it.
- Rebuilding the legacy pages in the redesign's markup, and the broken legacy favicon references.
- A consent banner, a consent-management platform, or any analytics decision.
