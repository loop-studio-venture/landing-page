---
task: 20260930-impressum-and-datenschutz-pages-for-the-landing-
company: loopstudio
status: ready
size: M
branch: feature/impressum-and-datenschutz-pages-for-the-landing-
design: handoff at design/handoff/legal-pages/ (Legal Pages)
base: dev
---

# Impressum and Datenschutz pages for the landing page, in the current design

## Goal

Give the public landing page (`loopstudio.app`) working Impressum and Datenschutz pages in the
design the site actually has today, in German. The two files that exist are the retired Webflow
export (English, old Webflow CSS, a different visual site), and in today's footer both links are
dead (`index.html:579`: `<a href="#">Impressum</a><a href="#">Datenschutz</a>`). The existing legal
copy is reworked and adapted to what the site really does - not rewritten from scratch and not
invented. Christian, in the filing thread (2026-09-30): "ueberarbeite die Texte aus den beiden
alten Seiten und passe sie an so gut du kannst", "USt-IdNr. und telefon gibt es nicht mehr.
Rausnehmen", and the merged `dev` PR is shown to a lawyer before anything reaches `main`.
**Amended 2026-09-30 (D1, Christian: "die App sollte auch mit abgedeckt sein. Also bitte fuer
beide"):** the Datenschutzerklaerung's scope covers `loopstudio.app` **and** `app.loopstudio.app`,
so the same page describes the app's processing as well - the app's own code is not touched.

**Amended again 2026-10-01 - supersedes D1 (Christian's review answers of 2026-09-30, binding):**
(a) the Datenschutzerklaerung covers the **website `loopstudio.app` only**; the lead says so, the
page has **no app section**, and it carries a clearly visible, underlined link to the Loop Studio
app's own privacy policy. That policy is built by task
`20260930-in-app-privacy-policy-datenschutzerklaerung-for-` (LS-112), whose spec agrees the public
route `https://app.loopstudio.app/datenschutz` (LS-112-D2); until that task ships, the link points
at this agreed route and is marked as a placeholder in an HTML comment - no app privacy text is
written here. (b) Both legal pages use the formal **"Sie"**; the rest of the site keeps "du".
(c) The Impressum keeps the sentence offering e-mail plus the Calendly booking as the second fast
contact channel. (d) Thunder is free for commercial use (font-licensing `free-fonts.md`, since
2026-09-17) - not an issue. (e) Inline links in the legal text are underlined. Wherever a passage
below still describes D1's "two surfaces" / "app part", this amendment wins; the acceptance
criteria below are already rewritten to it.

## Assumptions

- The company data in `impressum.html` today is current and is carried over unchanged: Loop Studio
  GmbH, Hansaring 79-81, 50670 Koeln, Amtsgericht Koeln HRB 126238, Geschaeftsfuehrer Christian
  Wenzel and Christian Arns, `contact@loopstudio.app`.
- No USt-IdNr. and no phone number go on the page (Christian's own instruction this turn). Section 5
  para. 1 no. 2 DDG's "second fast contact channel" is therefore covered by e-mail plus the
  Calendly booking only - flagged for the lawyer, not solved here.
- No Datenschutzbeauftragte(r) is appointed; the old privacy page's own section 2 says so and is
  carried over.
- The landing page's hosting provider is Netlify (`README.md`: "Netlify, from the `main` branch")
  and is named as a recipient **for the landing page only**. Unverified: whether Netlify Inc. or an
  EU entity is the contracting party - the page names "Netlify" and the Implementer does not invent
  a legal entity, address or DPA reference (D2, Christian 2026-09-30: the open point is only which
  Netlify company is the contracting party, readable in the Netlify invoice / Team settings ->
  Billing; until then the third-country paragraph stays generic).
- The app (`app.loopstudio.app`) does **not** run on Netlify (D2, Christian 2026-09-30: "die App
  loop studio.app hat kein Netlify"). It runs on Google Cloud / GKE in `europe-west3` with Cloud SQL
  and Google Cloud Storage (`knowledge-base/architecture/deployment.md:5-20`,
  `knowledge-base/architecture/system-overview.md:11-26`).
- The app part of the text is written at exactly the level the knowledge base documents, and no
  deeper: the processors named there (Google Cloud, Stripe, Brevo, OpenAI, Sentry, Apify) and the
  purposes those documents state. Exact data categories per feature, retention periods and DPA
  references are **unverified** from the landing repo and the knowledge base - they are not invented
  (see Stop conditions); the lawyer's review after the `dev` merge is where they get filled in.
- The app uses JWT auth (`knowledge-base/architecture/system-overview.md:19`), so a logged-in
  session necessarily keeps a token in the browser. Whether that is a cookie or web storage is
  **unverified** from the readable sources, so the page says "technisch notwendige Speicherung im
  Browser, damit du angemeldet bleibst" without asserting the mechanism.
- The legal pages load the same Plausible snippet as `index.html:43-48` and today's legal pages, so
  their page views keep being counted. They load no Calendly, no GSAP/Lenis motion scripts and no
  form.
- German text in the formal **"Sie"** register on both legal pages (Christian, 2026-09-30, binding;
  amendment 2026-10-01 above) - the rest of the site keeps its "du". (Originally: "du", matching
  `index.html`.)
- Netlify's publish directory is the repository root, so a `_redirects` file at the root takes
  effect. Unverified (the deploy config is in the Netlify site settings, not in the repo) - which is
  why `privacy-policy.html` also stays on disk as a working fallback redirect page.
- The approved design round is built as drawn (D3, Christian 2026-09-30: radius, spacing, hairline,
  tokens and shared patterns stay "wie gezeichnet"). D1 changes copy only - one more section group
  of the same kind on the same template - so it needs no new design round.
- "Done" means both pages exist, render, are linked and pass the repo's own three checks. Whether
  the wording is legally sufficient is the lawyer's call after the `dev` merge, not an acceptance
  criterion here.

Correct me at gate 1, otherwise I proceed with these.

## Context found

- `landing-page/index.html` - the current landing page. `lang="de"`, head at lines 3-49
  (title/description/og/canonical, favicons at 40-42, self-hosted Thunder preload at 18, the 19
  stylesheets at 19-39, the Plausible snippet at 43-48), the real `nav.nav` at 53-69, the real
  `footer.fuss` at 558-583. The footer's legal links are dead at line 579. The workbook form at
  502-510 has no backend (`index.html:511`: "Formular ohne Anbindung: siehe README").
- `landing-page/impressum.html` - the page to replace. Retired Webflow export: `lang="en"`,
  `css/loopstudio-app.webflow.shared.min.css`, the `nav_component w-nav` navigation, English
  headings ("Information according to section 5 Telemedia Act (TMG)"), and four disclaimer sections
  (content, links, copyright/trademark, validity). Carries the company data listed under
  Assumptions. Canonical already `https://loopstudio.app/impressum.html`.
- `landing-page/privacy-policy.html` - the second page to replace. Same Webflow shell, `lang="en"`.
  Sections: preamble (already mentions Plausible in one sentence), 1 Verantwortlicher, 2 no DPO,
  3 general processing, 4 "log files2" (a typo in the live heading), 5 cookies incl. an info banner,
  6 contact form, 7 data-subject rights. Canonical `https://loopstudio.app/privacy-policy.html`.
- `landing-page/web/stil.css` - the current design's base. `@font-face` at lines 3-8 and 22: Inter,
  JetBrains Mono and Thunder-BoldLC, all `src:url("fonts/...")`, i.e. self-hosted; no remote font
  host is contacted. No new font is introduced by this task.
- `landing-page/web/bewegung.js:28,35-36` - Calendly is loaded only on click:
  `https://assets.calendly.com/assets/external/widget.css` / `widget.js`, booking URL
  `https://calendly.com/christianarns/15min?hide_gdpr_banner=1...`. `index.html:574` already tells
  the visitor this in plain German.
- No cookies and no web storage anywhere on the site: a grep for `localStorage|sessionStorage|
  document.cookie` over `landing-page/web/` returns no match. Plausible is loaded cookieless
  (`index.html:44`).
- `landing-page/sitemap.xml` - three `<loc>`s: `/`, `/impressum.html`, `/privacy-policy.html`.
- `landing-page/404.html` - still the retired Webflow export (two `webflow` occurrences), a single
  minified line. **Corrected 2026-09-30 after the Tester's finding:** the file has no footer and no
  legal link at all. Its only `<a>` is `<a href="index.html" class="button w-button">Go Home</a>`
  inside `.utility-page_wrapper`; the strings `impressum` and `datenschutz` do not occur in it, and
  neither does `privacy-policy`. There is therefore nothing in it to repoint, and this task does not
  touch it. (The earlier version of this bullet claimed its footer linked `impressum.html` and
  `privacy-policy.html` - that was wrong.)
- `landing-page/CLAUDE.md` - the rules that bind this task: generated/minified exported files are
  not edited (add a small hand-written stylesheet instead), every page must work from `serve.ps1`
  with relative paths and no build step, links into the app use `https://app.loopstudio.app/...`,
  German copy first, no third-party scripts or fonts from external hosts without a recorded
  decision, and the three verification steps under "Checking a change".
- `knowledge-base/architecture/system-overview.md:4-30` - **the only source for the app part of the
  text, together with the file below.** The app is Nuxt 3 (`loop-studio-frontend`) plus Spring Boot
  (`loop-studio-backend`), both on GKE; MySQL via JPA/Liquibase; JWT auth; GCS for file storage;
  Stripe for billing; Apify for social-platform scraping/import; Brevo for e-mail; OpenAI for
  content-pillar generation, post-project scripts and descriptions/titles. Line 4-6 also states the
  landing page makes no API calls - which is what lets the two surfaces be described separately on
  one page.
- `knowledge-base/architecture/deployment.md:3` - the landing page is the exception: Netlify, no
  Cloud Build, no GKE, domain `loopstudio.app`, "the app is `app.loopstudio.app`". Lines 9-20: the
  app's clusters, Cloud SQL and storage buckets are all in `europe-west3`. Lines 46-54: Sentry is in
  use in both app repos (error tracking, `loopstudio-backend` / `loopstudio-frontend`). This is the
  evidence base for criteria 24-26 and for D2's "the app has no Netlify".
- `design/handoff/legal-pages/README.md` (workspace repo) - the approved round's export. Its
  "Open questions" 3 says the draft's scope sentence claims the declaration covers `loopstudio.app`
  and that `app.loopstudio.app` is **not** its subject. **D1 reverses exactly that sentence**; the
  layout, tokens and section rhythm of the round are untouched (D3). Question 4 (Netlify's
  contracting party) is answered by D2 only in part - still generic, see Assumptions.
- `C:\ai\skills\_shared\skills\marketing-site-compliance\references\legal-pages-de.md` - the field
  lists this spec's criteria 4 and 8 are taken from (section 5 DDG; Art. 13 DSGVO section list).
  Presence checks only - the skill's own rule is that it never judges wording.

## Approach

One reusable legal-text page template, two pages built on it, drawn by the Designer first.

The template extends the existing pattern rather than inventing one: each page is a plain static
HTML file that loads the same `web/*.css` chain as `index.html`, reuses `index.html`'s real
`nav.nav` markup (with the in-page anchors pointing back at `index.html#...`, since the anchors do
not exist on a legal page) and its real `footer.fuss` markup, and adds exactly one new
hand-written stylesheet, `web/recht.css`, loaded last - the `CLAUDE.md` rule for styling changes.
`recht.css` holds only what long legal text needs and the marketing page does not have: a readable
measure, heading rhythm for `h2`/`h3`, ordered/unordered list spacing, and scroll offset for
in-page anchors under the fixed nav. No token, colour or font is invented; the existing design's
variables are used.

The Designer round is about that template, not about the copy: how a 3000-word legal text reads on
this design (measure, heading scale, whether a table of contents at the top earns its place, how
the dark footer meets a long light text column, phone width). One round covers both pages because
they are the same template - the round is drafted with the real German text in place, so it is
judged as it will ship. Per `design/STATUS.md`'s current convention the round is image-first:
`design/draft/<Screen>/round-1/` with self-contained `variant-*.html`, an `overview.html` and
rendered PNGs posted to `#design-loopstudio`. The round is built as drawn (D3); D1's extra sections
reuse the same `h2`/`h3` rhythm and need no new round.

Copy: both old pages are translated into German and adapted, section by section, keeping their own
structure. The Impressum's four disclaimer sections are carried over; only the statute reference
changes (TMG was replaced by the DDG on 2024-05-14), and USt-IdNr. and phone are simply absent.
The Datenschutz page keeps sections 1-4 and 7 of the old page, and changes exactly what is factually
wrong today: the cookie section (5) becomes a statement that the **landing page** sets no cookies and
no web storage; the contact-form section (6) becomes contact by e-mail and the Calendly booking;
Plausible is promoted from one preamble sentence to its own recipient section (cookieless, EU-hosted,
purpose, legal basis); Calendly and the landing page's hosting provider Netlify are added as
recipients with a third-country paragraph; the live heading typo "log files2" is fixed; the
self-hosted fonts are stated so a reader can see no font CDN is contacted.

**Scope: two surfaces on one page (D1).** The Datenschutzerklaerung opens with a Geltungsbereich
sentence naming both `loopstudio.app` (this website) and `app.loopstudio.app` (the app), and is then
split into two clearly headed parts: everything above stays the website part, and a second part
("Nutzung der App") describes the app. The app part is written from the two knowledge-base files
named under Context found and from nothing else: account/registration and login (with the technically
necessary browser storage that keeps a session alive), hosting and database at Google Cloud in
`europe-west3` (Frankfurt), file storage for uploaded content, payment processing via Stripe,
transactional e-mail via Brevo, AI processing of user content via OpenAI, error diagnostics via
Sentry, and import/analysis of social-media content via Apify. Netlify appears only in the website
part - the app has no Netlify (D2). The third-country paragraph is written once, generically, for
the providers that can transfer outside the EU (OpenAI, Stripe, Sentry, and the hosting providers),
naming standard contractual clauses without asserting a specific entity or DPA. Splitting by surface
rather than interleaving is deliberate: a reader of the landing page must still be able to see in
one block that the page they are on sets no cookies, and the lawyer can diff the app part as one
unit.

Rejected: (a) renaming `privacy-policy.html` outright - that address is the current canonical and
sits in `sitemap.xml`, so it must keep resolving; instead the new page is `datenschutz.html` (a
German URL on a German site) and `privacy-policy.html` becomes a redirect, with both a `_redirects`
301 for Netlify and a meta-refresh page on disk so it also works from `serve.ps1` and on any host.
(b) Keeping the new German text at the old `privacy-policy.html`
filename - fewer files, but leaves an English URL as the site's permanent privacy address.
(c) Writing the legal text from scratch - Christian asked for the existing text reworked, and a
fresh text would be harder for the lawyer to diff. (d) Touching the generated Webflow CSS or
`404.html` - the CSS is a generated artifact, and `404.html` carries no legal link to repoint and
no footer to add one to without redesigning it, which is a separate task. (e) A second, separate
privacy page for the app, or a copy of the text inside `loop-studio-frontend` - D1 asks for one
declaration covering both, and a second copy would drift from this one the first time it is edited.

## Files to change

| File | Change | Why |
|---|---|---|
| `landing-page/web/recht.css` | New. Hand-written, commented stylesheet for long legal text: measure, `h2`/`h3` rhythm, list spacing, anchor scroll offset. Loaded last, only on the two legal pages | `CLAUDE.md`: style by adding a small hand-written file, never by editing the minified export |
| `landing-page/impressum.html` | Replaced. German page on the new template: section 5 DDG fields (name/legal form, address, Vertretungsberechtigte, e-mail, Registergericht + HRB) and the four disclaimer sections, reworked from the old English text. No USt-IdNr., no phone | Today it is the retired Webflow export in English and a different design |
| `landing-page/datenschutz.html` | New. German Datenschutzerklaerung on the same template, adapted per Approach, in two headed parts: the website (`loopstudio.app`) and the app (`app.loopstudio.app`) | A German URL for the German site; the text has to match what the site really loads, and per D1 it also has to cover the app |
| `landing-page/privacy-policy.html` | Replaced by a minimal redirect page: `<meta http-equiv="refresh">` to `datenschutz.html`, self-`canonical` pointing at `datenschutz.html`, one visible sentence and link, `noindex` | That address is today's canonical and is in `sitemap.xml`; it must not 404 |
| `landing-page/_redirects` | New, one line: `/privacy-policy.html /datenschutz.html 301!` | A real 301 on Netlify; the page above is the fallback if the publish root is not the repo root |
| `landing-page/index.html` | Line 579: the two `href="#"` legal links become `impressum.html` and `datenschutz.html` | The links are dead today |
| `landing-page/sitemap.xml` | `<loc>https://loopstudio.app/privacy-policy.html</loc>` -> `.../datenschutz.html`; `/impressum.html` stays | A sitemap must list canonical URLs, and the old one now redirects |
| `landing-page/README.md`, `landing-page/CLAUDE.md` | Update the file listing / page list: `datenschutz.html` is the privacy page and covers both `loopstudio.app` and `app.loopstudio.app`, `privacy-policy.html` is a redirect, `web/recht.css` exists | Both files describe the repo's pages and are wrong the moment this ships; the next reader must know the page is not landing-page-only |
| `design/draft/<screen>/round-1/` (workspace repo) | The Designer's round files and renders | The design round this task waits for |
| `design/STATUS.md` (workspace repo) | Round entry, and the handoff/implementation status when exported | The project's own design log |

`landing-page/404.html` is deliberately **not** in this table: it has no footer and no legal link
(see Context found), so there is nothing in it to repoint. Criterion 17 asserts it stays unchanged.
No file in `loop-studio-frontend` or `loop-studio-backend` is touched: D1 changes what this page
says about the app, not the app.

## Acceptance criteria

1. `landing-page/impressum.html` and `landing-page/datenschutz.html` exist, both start with
   `<!DOCTYPE html>` and `<html lang="de">`, and neither references
   `css/loopstudio-app.webflow.shared.min.css` or any `w-nav`/`w-richtext` Webflow class.
2. Both pages load the same stylesheet chain as `index.html` (`web/stil.css`, `web/lego.css`, the
   `web/fassung*.css` files present in `index.html`, `web/zugang.css`) plus `web/recht.css` last,
   all as relative paths, and both render with the site's own nav and dark `footer.fuss` from
   `.\serve.ps1` at 1440 px and at 390 px with no horizontal scrollbar.
3. Both pages carry a self-referencing absolute `<link rel="canonical">`, a unique `<title>` and
   `<meta name="description">`, `og:title`/`og:description`/`og:image`/`og:url`,
   `twitter:card`, and the same three favicon links as `index.html:40-42`.
4. `impressum.html` contains, as readable text: "Loop Studio GmbH", the full postal address
   "Hansaring 79-81" and "50670 Koeln", both Geschaeftsfuehrer ("Christian Wenzel", "Christian
   Arns"), "contact@loopstudio.app" as a `mailto:` link, "Amtsgericht Koeln" and "HRB 126238".
5. `impressum.html` cites the DDG (e.g. "Angaben gemaess Paragraph 5 DDG") and contains no
   occurrence of "TMG" or "Telemedia".
6. `impressum.html` contains no USt-IdNr. field and no phone number - no "USt", "Umsatzsteuer-
   Identifikationsnummer", "Telefon" or "Tel." label anywhere on the page.
7. Both pages are German throughout: no English heading or body sentence remains from the old
   files (checked by reading the rendered text, not only by grep).
8. `datenschutz.html` has a section for each of: Verantwortlicher (identical company data to
   `impressum.html`), no Datenschutzbeauftragte(r), purposes and legal bases, Server-Logfiles,
   recipients, third-country transfer, storage period, data-subject rights incl. the right to
   complain to a supervisory authority, and the right to withdraw consent - all of them about
   this website only.
9. `datenschutz.html` names, by name, every third party the landing page itself contacts:
   "Plausible" (cookieless, EU-hosted, with purpose and legal basis), "Calendly" (stating it is
   loaded only when the visitor clicks the booking button, per `index.html:574` and
   `web/bewegung.js:35-36`), and the hosting provider "Netlify".
10. `datenschutz.html` states that this website sets no cookies and no browser storage, and that
    fonts are served from the site's own server - and contains no passage describing analysis
    cookies, a cookie consent banner, or a contact form on the website.
11. The workbook form at `index.html:502` is not described in `datenschutz.html` as a processing
    activity, and no privacy notice is added to it - it has no backend (`index.html:511`).
12. `index.html:579`'s footer links resolve: the Impressum link points at `impressum.html`, the
    Datenschutz link at `datenschutz.html`, and no `href="#"` remains in `nav.fuss__links`.
13. Both legal pages' own footers use the same `footer.fuss` link list, with the current page's link
    marked `aria-current="page"`, so Impressum and Datenschutz are reachable from each other and
    from `index.html` in one click.
14. `landing-page/privacy-policy.html` still returns a page when opened from `serve.ps1`: it
    redirects to `datenschutz.html` (meta refresh), its `canonical` points at `datenschutz.html`,
    it carries `<meta name="robots" content="noindex">`, and it shows one visible sentence with a
    working link for a visitor whose browser does not follow the refresh.
15. `landing-page/_redirects` exists and contains exactly the line
    `/privacy-policy.html /datenschutz.html 301!`.
16. `landing-page/sitemap.xml` lists `https://loopstudio.app/`,
    `https://loopstudio.app/impressum.html` and `https://loopstudio.app/datenschutz.html`, and no
    longer lists `privacy-policy.html`.
17. `landing-page/404.html` is byte-for-byte identical to the same file on the base branch `dev`
    (`git diff dev...HEAD -- 404.html` is empty). The file contains no `footer` element, no
    `impressum`, `datenschutz` or `privacy-policy` string, and exactly one `<a>`, whose `href` is
    `index.html` - so no link in it needed repointing.
18. `npx --yes html-validate@8 "*.html"` reports no finding on `impressum.html`, `datenschutz.html`
    or `privacy-policy.html`, and no new finding on `index.html` or `404.html` compared with the
    same command on the base branch.
19. Every relative link on both new pages resolves to a file that exists in the repo, and every
    absolute app link uses `https://app.loopstudio.app/...`.
20. No new external host is introduced: apart from the existing Plausible snippet copied from
    `index.html:43-48`, neither new page loads a script, stylesheet, font or image from a
    third-party domain. The link to the app's privacy policy (criterion 23) is an `href` only - it
    adds no request.
21. `README.md` and `CLAUDE.md` in `landing-page/` describe the pages as shipped
    (`datenschutz.html` as the privacy page for the website `loopstudio.app` only, pointing to the
    app's own privacy policy; `privacy-policy.html` as a redirect; `web/recht.css`; the legal pages'
    "Sie" register).
22. The lead of `datenschutz.html` (`.recht__lead`) says the declaration applies only to this
    website (`loopstudio.app`) and does not claim to cover `app.loopstudio.app`; section 01 says
    the app is not the subject of this declaration. The page has no app section: none of "Google
    Cloud", "Stripe", "Brevo", "OpenAI", "Sentry", "Apify", "europe-west3" appears on it, and
    "Netlify" is never connected with the app. (Supersedes D1's criteria 22-27, amendment
    2026-10-01.)
23. The page links the app's own privacy policy at `https://app.loopstudio.app/datenschutz` (the
    route agreed in task `20260930-in-app-privacy-policy-datenschutzerklaerung-for-`, LS-112-D2),
    from the lead and from section 01, and an HTML comment next to it marks it as a placeholder
    until that task ships the page. No app privacy text is written here.
24. Every inline link inside the legal text of both pages (`.recht p a`, `.recht ul li a`,
    `.recht dd a`) carries a persistent underline (a bottom border) and the teal link colour, so it
    is distinguishable from body text by more than colour; the table of contents keeps its own
    hairline rows.
25. Both legal pages and the `privacy-policy.html` transition page address the reader with the
    formal "Sie": no "du", "dich", "dir", "dein*", "kannst", "hast" and similar du-forms remain in
    their visible text or meta descriptions. `index.html` is unchanged and keeps "du".
26. `impressum.html` keeps one sentence offering e-mail as the fastest contact and the Calendly
    booking (via the booking button on the home page, linked to `index.html#gespraech`) as the
    alternative - the second fast contact channel under section 5 (1) 2 DDG, pending the lawyer.
27. The third-country paragraph stays generic: it names no legal entity, company address or DPA
    reference for any provider, Netlify included (D2).

## Test plan

There is no test suite in this repo; `CLAUDE.md`'s "Checking a change" is the contract, and all
three steps are reported explicitly in the implementation and test reports.

1. `npx --yes html-validate@8 "*.html"` from `landing-page/`, run once on the base branch and once
   on the task branch, both outputs pasted - criterion 18 is the diff of the two.
2. Render check from `.\serve.ps1`: `http://localhost:8843/impressum.html`,
   `/datenschutz.html`, `/privacy-policy.html` and `/index.html`, each at 1440 px and 390 px, with
   screenshots - criteria 2, 7, 13, 14, 23.
3. Link check: every `href` on the two new pages, plus the footer of `index.html`, resolved against
   the repo (a relative target must exist as a file) - criteria 12, 19. For criterion 17,
   `git diff dev...HEAD -- 404.html` must print nothing, and a grep of `404.html` for
   `footer|impressum|datenschutz|privacy-policy` must return no match.
4. Text assertions for criteria 4, 5, 6, 8, 9, 10, 11, 15, 16, 20 and 22-27: grep the built files
   for the required and the forbidden strings and paste the results. A forbidden-string grep that
   returns a match is a failure, not a note. Forbidden on `datenschutz.html` (criterion 22):
   `Google Cloud`, `Stripe`, `Brevo`, `OpenAI`, `Sentry`, `Apify`, `europe-west3`.
   Required: `https://app.loopstudio.app/datenschutz` twice (criterion 23). Forbidden on the three
   legal pages: the du-forms of criterion 25.
5. Network check for criterion 20: load both pages in a browser with devtools and list every
   request host; only `localhost`/the site's own origin and `plausible.io` may appear - naming a
   processor in the text must not add a request.

## What to click

1. Open the landing page, scroll to the dark footer, click "Impressum" and then "Datenschutz" -
   both open a page that looks like the same website, in German, and you can get back with the logo.
2. Read the Datenschutz page top to bottom - it speaks to you as "Sie", the first paragraph says it
   covers this website only and has an underlined link to the Loop Studio app's own privacy policy;
   the page lists Plausible, Calendly and Netlify, says this website sets no cookies, and has no
   app section and no contact-form passage.
3. Read the Impressum - address, both Geschaeftsfuehrer, Amtsgericht Koeln HRB 126238 and the mail
   address are there, and there is no USt-IdNr. and no phone number.
4. Open `/privacy-policy.html` directly - you land on the Datenschutz page.
5. Look at both pages on a phone - the text column is readable, headings are not cramped, nothing
   scrolls sideways, and the underlined links are easy to spot.

## Verification and evidence

- The close-out shows the two `html-validate` outputs (base branch and task branch) side by side,
  not a summary of them.
- Screenshots: `impressum.html` and `datenschutz.html` at 1440 px and 390 px, full page, from
  `serve.ps1` - four images minimum, plus one of the `index.html` footer showing the two live links.
- The required/forbidden string greps from test-plan step 4, pasted with their exact command lines,
  including the app-scope set and the Netlify/app cross-check for criterion 26.
- The close-out quotes the Geltungsbereich sentence and the App part's headings verbatim, so
  criteria 22 and 23 can be read without opening the file.
- The empty output of `git diff dev...HEAD -- 404.html`, pasted, as the evidence for criterion 17.
- The request-host list from test-plan step 5 for both pages.
- The design round is evidenced by the round folder, the rendered PNGs and the
  `#design-loopstudio` post; the handoff by `design/STATUS.md`'s entry and the exported folder.
- The PR description states in one line that the legal wording is a good-faith adaptation of the
  previous pages **and now also describes the app (D1)**, pending the lawyer's review before `main` -
  so whoever reads the PR knows.

## Will not do

- No push or merge to `main` (that is the live Netlify deploy, and the lawyer reviews the `dev` PR
  first) and no change to the Netlify site settings.
- No edit to `css/*.min.css` or `js/webflow.js` - generated export artifacts.
- No change to `404.html` at all - not its design, not its markup, not a link: it has none to
  repoint. No change to `index.html` other than the two footer hrefs on line 579.
- No new dependency, no build step, no third-party script, font or CDN.
- No work in `loop-studio-frontend` or `loop-studio-backend` - not even a link from the app to the
  new page.
- No description of an app processing activity, data category, recipient or retention period that is
  not documented in `knowledge-base/architecture/system-overview.md` or
  `knowledge-base/architecture/deployment.md`.
- No change to the workbook form's markup or behaviour.
- No claim anywhere in the code, the PR or the report that the pages are legally compliant.

## Stop conditions

- A required legal fact is not in the old pages or the repo (a register detail, a DPA, the hosting
  contracting party, a retention period, a processing purpose) - stop and ask; never invent it.
- A fact needed for the app part (a data category, a retention period, a recipient, where a
  processor stores data) is not in the two knowledge-base files named above - stop and ask; do not
  infer it from the app's UI, from the other repos, or from how such apps usually work.
- The design round comes back with a direction that needs a new font, a new colour or a new external
  asset - stop; that is a separate decision (font licensing and the no-external-hosts rule).
- `html-validate` reports a pre-existing finding on `index.html` or `404.html` that the change would
  seem to "fix" by touching more than the hrefs above - report it, do not widen the change.
- The Plausible snippet cannot be copied verbatim from `index.html:43-48` (e.g. the site id differs
  from the one on the old legal pages) - stop and ask rather than guessing a site id.
- Any acceptance criterion would only pass by rewording it - stop and say so.

## Risks and open questions

- The legal wording is an adaptation by a non-lawyer. Criteria 7-10 and 22-27 are presence and
  consistency checks only; the lawyer's review of the merged `dev` PR is the real gate before `main`.
  This is explicitly how Christian asked for it (2026-09-30).
- The app part is the thinnest-evidenced part of the page: it is written from two architecture
  documents, not from the app's own code or its data model, so data categories, retention periods
  and the consent/legal-basis choice per feature are the lawyer's to complete. Named here so nobody
  reads criteria 24-25 as "the app's processing is fully documented".
- `loop-studio-backend/README.md` (webhook section) also mentions **Instagram/Meta** and
  **CloudConvert** as integrations. They are not in the knowledge-base files the Implementer works
  from, and whether they are live for users is not established here, so they are deliberately not in
  criterion 25 - flagged for the lawyer and for Christian; if either is live, the page needs one
  more recipient passage and that is a small follow-up, not a rewrite.
- Whether the app keeps its session token in a cookie or in web storage is unverified (see
  Assumptions); the wording avoids the claim, which a lawyer may want sharpened once someone reads
  the frontend.
- Section 5 para. 1 no. 2 DDG asks for a fast electronic contact channel in addition to the e-mail
  address; with no phone number, the page offers e-mail plus the Calendly booking. Named here so the
  lawyer sees it; not solved by this task.
- Netlify as the contracting party is unverified (see Assumptions) - the page names "Netlify"
  without a legal entity or address. D2 answered only that the app is not on Netlify; the entity
  question stays open and keeps the third-country paragraph generic (criterion 27).
- `_redirects` is the repo's first deploy-config file and its effect cannot be verified before the
  Netlify deploy; that is why `privacy-policy.html` stays on disk as a working fallback. Whether
  the 301 actually fires is checked on the deploy preview, not locally.
- Google may keep `/privacy-policy.html` in its index for a while after the 301; nothing to do
  beyond the sitemap change.
- The app now has a privacy notice living on the landing-page repo. Nothing links to it from inside
  the app, and nothing keeps the two repos in sync when the app gains a new processor - worth a
  follow-up (an app footer link plus a note in the app repos' CLAUDE.md), deliberately not done here.
- `404.html` has no footer and no Impressum/Datenschutz link at all (Tester finding, 2026-09-30).
  The Impressum is therefore not reachable in one click from a 404 page - a pre-existing gap, not
  one this task creates, and it cannot be closed without giving `404.html` a footer, i.e. a
  redesign of a page still on the retired Webflow design. Named for the lawyer's review and for a
  separate task; deliberately not fixed here.
- The old privacy text's own legal-basis choices (e.g. Art. 6 para. 1 lit. f for log files) are
  carried over as they stand; this task does not re-argue them.

## Out of scope

- A privacy notice on the workbook form at `index.html:502` and wiring that form to a backend.
- A cookie consent banner on the landing page - the landing page sets no cookies and no web storage
  (verified). A consent mechanism inside the app is not built or changed here either.
- AGB, Widerrufsbelehrung, Preisangabenverordnung items - nothing is sold on the page; the CTAs are
  a Calendly call, a PDF and a link into the app.
- Redesigning `404.html`, or any other page of the landing page - including adding a footer with
  legal links to `404.html`.
- Any change inside `loop-studio-frontend` or `loop-studio-backend`: a link from the app to this
  page, an in-app privacy notice, a consent dialog, or a second copy of the text. The app's
  processing is *described* on `datenschutz.html` (criteria 22-27); the app itself is untouched.
- A full compliance audit of the site (the `marketing-site-compliance` skill's 27 checks) - only the
  legal-page presence items this task's criteria name are covered.
- The 15 EUR / 20 EUR contradiction in `index.html`'s JSON-LD - it belongs to the open task
  `20260929-price-20-eur-everywhere-app-landing-page-knowled`.


## Review answers (Christian, 2026-10-01)

Review loop cap reached, Reviewer still requested changes:
1. [blocking] datenschutz.html:125 — The external product-policy link substitutes for the app-processing disclosures explicitly required by the amended spec.
   Scenario: An app user reads this declaration and finds no App section, account/session explanation or required processor disclosures; sections 03–08 explicitly cover only the website despite the lead claiming both domains.
   Suggested fix: Implement the app section from the two authorised knowledge-base sources, retain shared disclosures for both surfaces, and escalate only genuinely missing facts rather than replacing the required section with an external notice.
2. [blocking] impressum.html:18 — font licence needed: Thunder.
   Scenario: The new legal pages preload and render Thunder, but the supplied Fonts report is truncated before its licence evidence, no Review answers record an exception, and the licence register was inaccessible.
   Suggested fix: Provide the complete free/licensed status and applicable validity evidence for Thunder before approval.
3. [should-fix] datenschutz.html:125 — The product privacy-policy link is visually indistinguishable from surrounding body text.
   Scenario: A sighted reader looking for the product notice sees ordinary paragraph text: the link has the same colour and weight and no underline or border.
   Suggested fix: Apply a persistent underline to inline legal-text links, rather than styling only mailto and company-card links.
4. [should-fix] README.md:21 — The documentation omits the required dual-domain scope.
   Scenario: A maintainer consulting README.md or CLAUDE.md sees only a pre-login site's privacy page and has no indication that changes must also account for app processing.
   Suggested fix: Once the app section is implemented, document both covered domains in README.md and CLAUDE.md as criterion 21 requires.
5. [should-fix] design/STATUS.md:1741 — The design status and handoff still describe an unapproved, unexported round despite the implemented template.
   Scenario: The next designer reads 'awaiting a pick' and 'no handoff exported' and cannot distinguish pending design work from the implemented variant.
   Suggested fix: Have the design-record owner reconcile STATUS.md and the handoff with the actual recorded approval and implementation state without inventing a pick.

Answer: fix 20260930-impressum-and-datenschutz-pages-for-the-landing-: Christian's answers to the review (2026-09-30, terminal front desk):
1. [blocking, app section] Option B: the landing-page Datenschutzerklaerung covers the WEBSITE only. Rewrite the lead so it no longer claims to cover the app, and add a clearly visible (underlined) link to the Loop Studio app's own privacy policy. Do NOT add an app section here. The app gets its own privacy page in a separate task (20260930-in-app-privacy-policy-datenschutzerklaerung-for-); until its URL exists, link to the app's planned legal page as a placeholder route agreed in that task or leave a clearly marked TODO in the spec, never an invented text.
2. [blocking, font] Thunder (Thunder-BoldLC) is FREE for commercial use: it is on C:\ai\skills\_shared\skills\font-licensing\references\free-fonts.md since 2026-09-17 (Christian Wenzel: "I have the Thunder font, and it's free for commercial use"); licensed-fonts.md row says "free - lives on the free list since 2026-09-17". Answer: free. No change needed.
3. [should-fix] underline inline legal-text links: yes, fix it.
4. [should-fix] README/CLAUDE.md scope: document that the Datenschutz page covers the website only and points to the app policy (not dual-domain).
5. [should-fix] design/STATUS.md + handoff: reconcile with the recorded pick (Legal Pages variant A by Christian, 2026-09-30) - do not invent anything.
Continue the build.
