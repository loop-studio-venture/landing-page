---
task: 20260930-impressum-and-datenschutz-pages-for-the-landing-
company: loopstudio
status: ready
size: M
branch: feature/impressum-and-datenschutz-pages-for-the-landing-
design: needed (Legal text page template - Impressum + Datenschutz, /impressum.html + /datenschutz.html)
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

## Assumptions

- The company data in `impressum.html` today is current and is carried over unchanged: Loop Studio
  GmbH, Hansaring 79-81, 50670 Koeln, Amtsgericht Koeln HRB 126238, Geschaeftsfuehrer Christian
  Wenzel and Christian Arns, `contact@loopstudio.app`.
- No USt-IdNr. and no phone number go on the page (Christian's own instruction this turn). Section 5
  para. 1 no. 2 DDG's "second fast contact channel" is therefore covered by e-mail plus the
  Calendly booking only - flagged for the lawyer, not solved here.
- No Datenschutzbeauftragte(r) is appointed; the old privacy page's own section 2 says so and is
  carried over.
- The hosting provider is Netlify (`README.md`: "Netlify, from the `main` branch") and is named as a
  recipient with a third-country note. Unverified: whether Netlify Inc. or an EU entity is the
  contracting party - the page names "Netlify" and the Implementer does not invent a legal entity,
  address or DPA reference.
- The legal pages load the same Plausible snippet as `index.html:43-48` and today's legal pages, so
  their page views keep being counted. They load no Calendly, no GSAP/Lenis motion scripts and no
  form.
- German text, "du" register, matching `index.html` - the site's own convention (`CLAUDE.md`: "Copy
  is German first").
- Netlify's publish directory is the repository root, so a `_redirects` file at the root takes
  effect. Unverified (the deploy config is in the Netlify site settings, not in the repo) - which is
  why `privacy-policy.html` also stays on disk as a working fallback redirect page.
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
- `landing-page/404.html` - still the old Webflow export (two `webflow` occurrences); its footer
  links `impressum.html` and `privacy-policy.html`. Redesigning it is out of scope.
- `landing-page/CLAUDE.md` - the rules that bind this task: generated/minified exported files are
  not edited (add a small hand-written stylesheet instead), every page must work from `serve.ps1`
  with relative paths and no build step, links into the app use `https://app.loopstudio.app/...`,
  German copy first, no third-party scripts or fonts from external hosts without a recorded
  decision, and the three verification steps under "Checking a change".
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
rendered PNGs posted to `#design-loopstudio`.

Copy: both old pages are translated into German and adapted, section by section, keeping their own
structure. The Impressum's four disclaimer sections are carried over; only the statute reference
changes (TMG was replaced by the DDG on 2024-05-14), and USt-IdNr. and phone are simply absent.
The Datenschutz page keeps sections 1-4 and 7 of the old page, and changes exactly what is factually
wrong today: the cookie section (5) becomes a statement that the site sets no cookies and no web
storage; the contact-form section (6) becomes contact by e-mail and the Calendly booking; Plausible
is promoted from one preamble sentence to its own recipient section (cookieless, EU-hosted, purpose,
legal basis); Calendly and the hosting provider Netlify are added as recipients with a third-country
paragraph; the live heading typo "log files2" is fixed; the self-hosted fonts are stated so a reader
can see no font CDN is contacted.

Rejected: (a) renaming `privacy-policy.html` outright - that address is the current canonical, sits
in `sitemap.xml` and is linked from `404.html`, so it must keep resolving; instead the new page is
`datenschutz.html` (a German URL on a German site) and `privacy-policy.html` becomes a redirect,
with both a `_redirects` 301 for Netlify and a meta-refresh page on disk so it also works from
`serve.ps1` and on any host. (b) Keeping the new German text at the old `privacy-policy.html`
filename - fewer files, but leaves an English URL as the site's permanent privacy address.
(c) Writing the legal text from scratch - Christian asked for the existing text reworked, and a
fresh text would be harder for the lawyer to diff. (d) Touching the generated Webflow CSS or
`404.html`'s design - both forbidden or out of scope.

## Files to change

| File | Change | Why |
|---|---|---|
| `landing-page/web/recht.css` | New. Hand-written, commented stylesheet for long legal text: measure, `h2`/`h3` rhythm, list spacing, anchor scroll offset. Loaded last, only on the two legal pages | `CLAUDE.md`: style by adding a small hand-written file, never by editing the minified export |
| `landing-page/impressum.html` | Replaced. German page on the new template: section 5 DDG fields (name/legal form, address, Vertretungsberechtigte, e-mail, Registergericht + HRB) and the four disclaimer sections, reworked from the old English text. No USt-IdNr., no phone | Today it is the retired Webflow export in English and a different design |
| `landing-page/datenschutz.html` | New. German Datenschutzerklaerung on the same template, adapted per Approach | A German URL for the German site, and the text has to match what the site really loads |
| `landing-page/privacy-policy.html` | Replaced by a minimal redirect page: `<meta http-equiv="refresh">` to `datenschutz.html`, self-`canonical` pointing at `datenschutz.html`, one visible sentence and link, `noindex` | That address is today's canonical, is in `sitemap.xml` and is linked from `404.html`; it must not 404 |
| `landing-page/_redirects` | New, one line: `/privacy-policy.html /datenschutz.html 301!` | A real 301 on Netlify; the page above is the fallback if the publish root is not the repo root |
| `landing-page/index.html` | Line 579: the two `href="#"` legal links become `impressum.html` and `datenschutz.html` | The links are dead today |
| `landing-page/404.html` | Footer link `privacy-policy.html` -> `datenschutz.html`. Markup/design untouched | Point it at the real page instead of relying on the redirect |
| `landing-page/sitemap.xml` | `<loc>https://loopstudio.app/privacy-policy.html</loc>` -> `.../datenschutz.html`; `/impressum.html` stays | A sitemap must list canonical URLs, and the old one now redirects |
| `landing-page/README.md`, `landing-page/CLAUDE.md` | Update the file listing / page list: `datenschutz.html` is the privacy page, `privacy-policy.html` is a redirect, `web/recht.css` exists | Both files describe the repo's pages and are wrong the moment this ships |
| `design/draft/<screen>/round-1/` (workspace repo) | The Designer's round files and renders | The design round this task waits for |
| `design/STATUS.md` (workspace repo) | Round entry, and the handoff/implementation status when exported | The project's own design log |

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
   complain to a supervisory authority, and the right to withdraw consent.
9. `datenschutz.html` names, by name, every third party the site actually contacts: "Plausible"
   (cookieless, EU-hosted, with purpose and legal basis), "Calendly" (stating it is loaded only
   when the visitor clicks the booking button, per `index.html:574` and `web/bewegung.js:35-36`),
   and the hosting provider "Netlify".
10. `datenschutz.html` states that the site sets no cookies and no browser storage, and that fonts
    are served from the site's own server - and contains no passage describing analysis cookies, a
    cookie consent banner, or a contact form on the website.
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
17. `404.html`'s footer privacy link points at `datenschutz.html`; nothing else in that file changes.
18. `npx --yes html-validate@8 "*.html"` reports no finding on `impressum.html`, `datenschutz.html`
    or `privacy-policy.html`, and no new finding on `index.html` or `404.html` compared with the
    same command on the base branch.
19. Every relative link on both new pages resolves to a file that exists in the repo, and every
    absolute app link uses `https://app.loopstudio.app/...`.
20. No new external host is introduced: apart from the existing Plausible snippet copied from
    `index.html:43-48`, neither new page loads a script, stylesheet, font or image from a
    third-party domain.
21. `README.md` and `CLAUDE.md` in `landing-page/` describe the pages as shipped
    (`datenschutz.html` as the privacy page, `privacy-policy.html` as a redirect, `web/recht.css`).

## Test plan

There is no test suite in this repo; `CLAUDE.md`'s "Checking a change" is the contract, and all
three steps are reported explicitly in the implementation and test reports.

1. `npx --yes html-validate@8 "*.html"` from `landing-page/`, run once on the base branch and once
   on the task branch, both outputs pasted - criterion 18 is the diff of the two.
2. Render check from `.\serve.ps1`: `http://localhost:8843/impressum.html`,
   `/datenschutz.html`, `/privacy-policy.html` and `/index.html`, each at 1440 px and 390 px, with
   screenshots - criteria 2, 7, 13, 14.
3. Link check: every `href` on the two new pages, plus the footer of `index.html` and `404.html`,
   resolved against the repo (a relative target must exist as a file) - criteria 12, 17, 19.
4. Text assertions for criteria 4, 5, 6, 8, 9, 10, 11, 15, 16, 20: grep the built files for the
   required and the forbidden strings and paste the results. A forbidden-string grep that returns
   a match is a failure, not a note.
5. Network check for criterion 20: load both pages in a browser with devtools and list every
   request host; only `localhost`/the site's own origin and `plausible.io` may appear.

## What to click

1. Open the landing page, scroll to the dark footer, click "Impressum" and then "Datenschutz" -
   both open a page that looks like the same website, in German, and you can get back with the logo.
2. Read the Datenschutz page's recipients section - Plausible, Calendly and Netlify are all there,
   and nothing claims the site uses cookies or has a contact form.
3. Read the Impressum - address, both Geschaeftsfuehrer, Amtsgericht Koeln HRB 126238 and the mail
   address are there, and there is no USt-IdNr. and no phone number.
4. Open `/privacy-policy.html` directly - you land on the Datenschutz page.
5. Look at both pages on a phone - the text column is readable, headings are not cramped, nothing
   scrolls sideways.

## Verification and evidence

- The close-out shows the two `html-validate` outputs (base branch and task branch) side by side,
  not a summary of them.
- Screenshots: `impressum.html` and `datenschutz.html` at 1440 px and 390 px, full page, from
  `serve.ps1` - four images minimum, plus one of the `index.html` footer showing the two live links.
- The required/forbidden string greps from test-plan step 4, pasted with their exact command lines.
- The request-host list from test-plan step 5 for both pages.
- The design round is evidenced by the round folder, the rendered PNGs and the
  `#design-loopstudio` post; the handoff by `design/STATUS.md`'s entry and the exported folder.
- The PR description states in one line that the legal wording is a good-faith adaptation of the
  previous pages, pending the lawyer's review before `main` - so whoever reads the PR knows.

## Will not do

- No push or merge to `main` (that is the live Netlify deploy, and the lawyer reviews the `dev` PR
  first) and no change to the Netlify site settings.
- No edit to `css/*.min.css` or `js/webflow.js` - generated export artifacts.
- No redesign of `404.html` beyond the one footer href, and no change to `index.html` other than
  the two footer hrefs on line 579.
- No new dependency, no build step, no third-party script, font or CDN.
- No work in `loop-studio-frontend` or `loop-studio-backend`.
- No change to the workbook form's markup or behaviour.
- No claim anywhere in the code, the PR or the report that the pages are legally compliant.

## Stop conditions

- A required legal fact is not in the old pages or the repo (a register detail, a DPA, the hosting
  contracting party, a retention period, a processing purpose) - stop and ask; never invent it.
- The design round comes back with a direction that needs a new font, a new colour or a new external
  asset - stop; that is a separate decision (font licensing and the no-external-hosts rule).
- `html-validate` reports a pre-existing finding on `index.html` or `404.html` that the change would
  seem to "fix" by touching more than the hrefs above - report it, do not widen the change.
- The Plausible snippet cannot be copied verbatim from `index.html:43-48` (e.g. the site id differs
  from the one on the old legal pages) - stop and ask rather than guessing a site id.
- Any acceptance criterion would only pass by rewording it - stop and say so.

## Risks and open questions

- The legal wording is an adaptation by a non-lawyer. Criteria 7-10 are presence and consistency
  checks only; the lawyer's review of the merged `dev` PR is the real gate before `main`. This is
  explicitly how Christian asked for it (2026-09-30).
- Section 5 para. 1 no. 2 DDG asks for a fast electronic contact channel in addition to the e-mail
  address; with no phone number, the page offers e-mail plus the Calendly booking. Named here so the
  lawyer sees it; not solved by this task.
- Netlify as the contracting party is unverified (see Assumptions) - the page names "Netlify"
  without a legal entity or address.
- `_redirects` is the repo's first deploy-config file and its effect cannot be verified before the
  Netlify deploy; that is why `privacy-policy.html` stays on disk as a working fallback. Whether
  the 301 actually fires is checked on the deploy preview, not locally.
- Google may keep `/privacy-policy.html` in its index for a while after the 301; nothing to do
  beyond the sitemap change.
- `404.html` stays on the retired Webflow design, so its footer now links two pages in the new
  design. A visible inconsistency, deliberately not fixed here - a separate task.
- The old privacy text's own legal-basis choices (e.g. Art. 6 para. 1 lit. f for log files) are
  carried over as they stand; this task does not re-argue them.

## Out of scope

- A privacy notice on the workbook form at `index.html:502` and wiring that form to a backend.
- A cookie consent banner - the site sets no cookies and no web storage (verified).
- AGB, Widerrufsbelehrung, Preisangabenverordnung items - nothing is sold on the page; the CTAs are
  a Calendly call, a PDF and a link into the app.
- Redesigning `404.html`, or any other page of the landing page.
- The app's own privacy text and legal pages at `app.loopstudio.app` (`loop-studio-frontend`).
- A full compliance audit of the site (the `marketing-site-compliance` skill's 27 checks) - only the
  legal-page presence items this task's criteria name are covered.
- The 15 EUR / 20 EUR contradiction in `index.html`'s JSON-LD - it belongs to the open task
  `20260929-price-20-eur-everywhere-app-landing-page-knowled`.