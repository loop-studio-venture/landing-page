---
task: 20260905-landing-live-colour-theme
company: loopstudio
status: ready
size: M
branch: feature/adopt-onlinemedianer-site
base: dev
design: needed
---

# Adapt the adopted example site's colours to the live loopstudio.app theme

## Goal
Branch `feature/adopt-onlinemedianer-site` (PR loop-studio-venture/landing-page#5) is the
onlinemedianer.de example taken 1:1 as the new landing page. Christian (2026-09-05): "check that
version once with the designer and see if he can adopt the colours of this version a bit more
with the colour theme that is currently live." Keep the example's layout, sections, typography
rhythm, motion and mascot; move its palette toward the brand colours that are live on
loopstudio.app today. Design first (canvas, Christian approves a round), then an Implementer
applies the approved round to `web/stil.css` (one override file, not the 19 `fassung*.css`).

## Design
Screen: the landing page, route `/` (`index.html` of repo `landing`, branch
`feature/adopt-onlinemedianer-site`). Live preview of the current state:
https://feature-adopt-onlinemedianer-site--loopstudioapp.netlify.app
Functions the screen must keep showing (unchanged, colour only): pill nav with "Gespräch buchen"
(Calendly) and "Kostenlos testen"/login CTA, mascot hero with rotating headline word, the
"Social Media Monster" problem section, the pinned "so läuft's" sequence, the tool showcase,
the four-stations section, the Baukasten, pricing cards, testimonials, FAQ, founder story,
footer with calendar button.

Live theme tokens (from `css/loopstudio-app.webflow.shared.min.css`, what loopstudio.app shows
today): brand primary `#1ba17b` (green), brand secondary `#273ea2` (blue), background `#fafafa`,
neutrals `#111 #222 #444 #666 #aaa #ccc #eee #fff`, accents blue-light `#d9e5ff`, pink
`#dd23bb` / `#ffaefe` / `#3c043b`. Font on the live site: Plus Jakarta Sans (self-hosted).

Example palette (from `web/stil.css` and the `fassung*.css` overrides): creme `#F4EFE6` /
`#FBF8F2` / `#EDE4D3`, papier `#FAF7F1`, navy/tinte `#243060` / `#1A2450` / `#37477F`, text
`#2B3557` / `#5A6795`, blau `#4D8EF7` / `#3567C9` / `#E4EDFE`, türkis `#74C19E` / `#4C9A78` /
`#E2F2EA`, sand `#CBBDA2` / `#DFD4BE`, weiss `#FFFFFF`. Fonts in the example: Thunder (display),
Inter, JetBrains Mono (`web/fonts/`, self-hosted).

Design task: 2 to 4 directions for the colour system only — e.g. (a) live brand applied fully
(green primary, blue secondary, #fafafa ground, neutral text), (b) example structure kept but its
navy/türkis swapped for the live blue/green with the creme ground kept warm, (c) a light hybrid
that keeps the example's creme/paper surfaces and uses the live green only for CTAs and accents.
Each artboard: the hero, one content section (monster or sequence), the pricing cards, and the
footer, so contrast on buttons, cards and text is visible. Note per direction which tokens in
`web/stil.css` change. Christian approves one round; nothing is exported before that.

## Acceptance criteria (for the Implementer, after the approved handoff)
1. Only `web/stil.css` (and, if unavoidable, a new small `web/theme-live.css` loaded last) changes
   colour values; layout, motion, copy and assets stay as in commit 034be86.
2. Every text/background pair in nav, hero, sections, pricing cards, FAQ, footer meets WCAG AA
   contrast (4.5:1 body, 3:1 large text/UI).
3. Buttons and links use the approved brand colours consistently (primary CTA one colour
   everywhere).
4. `npx --yes html-validate@8 "*.html"` unchanged versus the branch before the change.
5. Legal pages (`impressum.html`, `privacy-policy.html`, `404.html`) untouched.

## Out of scope
Pricing content, legal links, third-party assets, typography changes (fonts stay as in the
example for this task), any layout change.
