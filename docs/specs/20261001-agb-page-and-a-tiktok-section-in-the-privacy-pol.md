---
task: 20261001-agb-page-and-a-tiktok-section-in-the-privacy-pol
company: loopstudio
status: blocked
size: L
branch: feature/agb-page-and-a-tiktok-section-in-the-privacy-pol-2203
base: dev
design: handoff at design/handoff/legal-pages/
---

# An AGB page on the landing page, the interim Notion redirect removed, and a TikTok disclosure section

## Goal

Give `loopstudio.app` its own AGB as a real page in the repo (`agb.html`), German, formal "Sie", on
the already approved and already built legal-page template, carrying a visible "Entwurf" notice
until a lawyer has read it. The page states the draft positions for what Loop Studio actually
sells — the 20 €/month app subscription, the trial question of open question 4, minimum age 16,
Stripe payment, cancellation, deletion after contract end, liability, law and venue — plus one own section for
agencies. In the same change the two interim `/agb` lines that 302 to Notion are deleted from
`_redirects`, the three existing footers plus the new page point at the real page, and
`sitemap.xml`, `README.md`, `CLAUDE.md` and `web/recht.css` are brought in line. A clearly bounded
TikTok disclosure section is added to a privacy policy — **which one is open question 1**.

## Assumptions

- The lawyer has not reviewed any of this text; nothing here claims legal sufficiency, and the page
  ships with the "Entwurf" notice (LS-122-D6). Christian's sign-off at gate 1 is about facts and
  completeness, not about legal correctness.
- The 15-plus legal positions are draft positions. A later lawyer round rewrites wording; this task
  is done when the positions are on the page, truthful about the product, and the notice is visible.
- **The trial is not settled and is not decided by this spec** (open question 4). LS-122-D2 is
  Christian's own fact of 2026-10-01, repeated unchanged in the front-desk block of 2026-10-02:
  "there is NO free trial for the app". The code says otherwise, verified by the conductor on
  2026-10-02: `StripeSubscriptionServiceImpl.java:117-121` sets `trial_period_days = 7` for a
  `BASE` subscription when `user.usedTrial` is false, inside a Stripe Checkout session in
  `SUBSCRIPTION` mode (`:123-138`) that always collects a payment method, and
  `StripeEventServiceImpl.java:282` sets `usedTrial = true` afterwards — so the running product
  grants a 7-day trial **once per customer**. No message in this feature's record retracts D2, so
  the spec does not retract it either: the trial paragraph is written once Christian answers
  (CONCEPT.md LS-122-D12, LS-122-S1-Q6).
- Related code facts the answer has to cover either way: discount codes can grant a different trial
  length (`StripeSubscriptionServiceImpl.java:103-112`) and the `CONSULTING` type gets 30 days
  (`:113-116`) — so "7 Tage" alone would be incomplete, and "keine Testphase" would contradict the
  checkout.
- Q5 of the concept is answered by reading the code, not by asking: **there is no deletion of
  customer data when a contract ends.** `handleCustomerSubscriptionDeletedEvent`
  (`StripeEventServiceImpl.java:182-199`) deletes only the internal `StripeSubscription` row, which
  is what the access gate reads; the immediate hard delete of user data exists only on account
  deletion (`AccountDeletionServiceImpl.java:117-175`). The AGB therefore states the contractual
  rule of LS-122-D3 and the gap is named in the page source and in the close-out as its own app task.
- The footer links go to the **relative** `agb.html`, not to `/agb`, even though the front-desk note
  said "keep the footer link at `/agb`": `serve.ps1:35-50` serves files only, with no extensionless
  fallback, so `/agb` 404s in the local preview and would break `CLAUDE.md`'s "every page must keep
  working when opened from `serve.ps1`". `/agb` still has to serve the page on Netlify (pretty
  URLs), and that is checked on the deploy preview. CONCEPT.md §S1 bullet 5 asks for `agb.html` too.
- Netlify's pretty-URL behaviour (`/agb` → `agb.html` once no `_redirects` rule shadows it) is
  **unverified from the repo** — there is no `netlify.toml` and the site settings are not readable
  here. It is verified by clicking the deploy preview (gate 3 / "What to click" 1).
- Whether `TIKTOK_INTEGRATION_ENABLED` / `TIKTOK_PUBLISH_ENABLED` are switched on in production is
  **unverified**: both default to `false` (`application-live.properties:400,436`) and the wiring
  lives in `cloudbuild*.yaml` / k8s, which are denied paths. Every sentence of the TikTok section is
  therefore written conditionally ("wenn Sie Ihr TikTok-Konto verbinden"), which is true either way.
- LS-122-D1 is already live (`impressum.html:80` names the website **and** the app); this task
  verifies that line and does not rewrite the Impressum.
- Deploy stays gate 3: this branch is merged into `dev` by PR, nothing reaches `main` or Netlify
  production here.

Correct me at gate 1, otherwise I proceed with these.

## Open questions

1. Which privacy policy gets the TikTok section — `datenschutz.html`, or the app's own policy?
   - Recommendation: `datenschutz.html` now, as one clearly labelled, bounded section
     ("Verbindung zu TikTok in der Loop Studio App") whose first sentence says the rest of the app
     is covered by the app's own policy. It is the only legal surface in a repo that a TikTok
     reviewer can reach, and LS-114 can mirror the text into the app page later, after which this
     section shrinks to a pointer.
   - This amends LS-122-D11 / LS-112-D2 ("`datenschutz.html` covers the website only") and the
     standing repo rule in `CLAUDE.md:28-31` and `README.md:73-76` for TikTok only, so it needs
     your yes. If the answer is no, the section goes to the app's policy (Notion today, LS-114
     tomorrow), nothing TikTok-related ships in this repo, and criteria 22-26 below drop out.
2. Do these AGB cover the consulting packages, or only the app subscription and the agency use?
   - Recommendation: only the app subscription and agency use, with one sentence saying consulting
     packages are contracted separately by individual offer. The consulting price on the landing
     page ("ab 490 € im Monat", `index.html:7`) is contracted in a call, has no checkout, and
     `StripeSubscriptionServiceImpl.java:113-116` gives a `CONSULTING` subscription a 30-day trial —
     a second, different set of rules inside one document.
   - Saying "consulting in" adds one more full section (scope of services, term, cancellation
     notice, cooperation duties) and one more trial rule, and makes the section count 18.
3. Is the 20 €/month gross (incl. USt.) or net?
   - Recommendation: gross incl. USt. Minimum age 16 (LS-122-D4) means consumers are customers, and
     a price shown to consumers must be gross (PAngV); `index.html:406-412` says only "20 € /
     Monat", so today's copy is only correct if it is gross.
   - This is a money answer, not a wording one: if 20 € is meant net, the AGB say so **and** the
     landing-page price copy is wrong for consumers, which is LS-85's file, not this task's.
4. Is there a trial or not? Your AGB fact 1 says "NO free trial"; the live checkout grants a 7-day
   trial for the `BASE` subscription, once per customer (`StripeSubscriptionServiceImpl.java:117-121`,
   `StripeEventServiceImpl.java:282`), plus 30 days for `CONSULTING` and whatever a discount code
   carries. One of the two has to move; the AGB cannot be written against both.
   - Recommendation: the AGB describe the trial exactly as the code grants it (7 days at the start
     of a `BASE` subscription, payment method given at checkout, cancelling inside the 7 days costs
     nothing, once per customer, another length possible by individual agreement) — an AGB that
     denies a trial the checkout hands out is wrong on the day it ships.
   - If instead "no free trial" is the product decision, the AGB say exactly that, and switching the
     trial off in the checkout is filed as its own app task in the same breath — this task does not
     touch backend code (LS-122 §Non-goals).
   - Either way the consulting trial only matters if open question 2 puts consulting in scope.

## Context found

- Implements CONCEPT.md §S1 ("The AGB page, the interim redirect removed, and the TikTok section")
  of `C:\code\loopstudio\features\LS-122-agb-page-and-a-tiktok-section-in-the-pri\CONCEPT.md`;
  binding decisions LS-122-D1 … D12 from its decisions log. Nothing outside §S1 is built here, and
  every bullet of §S1 has at least one criterion below. D2 ("no free trial") stands; the code fact
  that contradicts it is LS-122-D12 and is decided by open question 4, not by this spec.
- `C:\code\loopstudio\CLAUDE.md` — three repos; pre-login legal pages belong to `landing-page/`.
- `CLAUDE.md` (this repo) — the binding rules: no edits to minified Webflow artifacts, every page
  works from `serve.ps1` with relative paths, app links use `https://app.loopstudio.app/...`,
  German copy, "Sie" on the legal pages, no new external host without a recorded decision, never
  commit to `main`/`dev`, and the three verification steps ("Checking a change", lines 36-45).
  Lines 21-23 say `web/recht.css` is loaded on "the three legal pages" — that sentence becomes four.
  Lines 28-31 carry the website-only rule that open question 1 touches.
- `impressum.html` — the template to copy from: head block 4-48 (title/description/og/canonical/
  og:image/twitter, Thunder preload at 18, the 19 stylesheets at 19-37, `web/recht.css` last at 39,
  three favicons at 40-42, the Plausible snippet at 43-48), `nav.nav` at 57-72, `main.recht` at 74,
  `header.recht__kopf` at 77-103 with `.recht__karte` and `.recht__hinweis`, `section.abschnitt`
  blocks at 107-132, `footer.fuss` at 141-149 with the `/agb` link and `aria-current="page"`.
  Line 80 already names website **and** app (LS-122-D1, verified live).
- `datenschutz.html` — the nine-section sibling: lead at 82 with the interim Notion link to the
  app's policy, `.recht__inhalt` table of contents at 88-101, section 01 scope text at 127-129
  ("Die Loop Studio App … ist nicht Gegenstand dieser Erklärung"), sections 02-09 at 132-268,
  Plausible/Calendly/Netlify at 197-202, footer at 281. It contains no occurrence of "TikTok".
- `index.html:406-412` — "Die Software für 20 € im Monat", the `Monatlich kündbar` badge and the
  20 €/Monat price card; `index.html:7` the consulting price; `index.html:581` the footer.
- `_redirects` — line 1 is the `privacy-policy.html` 301; lines 3-6 are the INTERIM comment block
  and lines 7-8 the two `302!` rules to the Notion Terms of Service that this task must delete
  (LS-122-D8).
- `sitemap.xml:3-11` — three `<url>` entries (`/`, `/impressum.html`, `/datenschutz.html`).
- `README.md:19-26` the file listing (line 24-25 documents the interim redirect), `:64-78` the
  conventions incl. the website-only rule.
- `web/recht.css` — the hand-written legal stylesheet: header comment 1-16 ("only on those three
  pages"), `.recht__hinweis` at 39 (a plain paragraph, no border), `.recht__karte` at 71 (white
  card, hairline, `var(--r)`), the table-of-contents grid at 80-86 — `grid-auto-flow:column` with
  `grid-template-rows:repeat(5,auto)` and two columns, i.e. tuned for 9-10 items, and
  `.fuss__links a[aria-current="page"]` at 102.
- `serve.ps1:35-50` — serves existing files only; no directory index beyond `/` → `/index.html`,
  no extensionless fallback. `/agb` is a 404 locally.
- `docs/specs/20260930-impressum-and-datenschutz-pages-for-the-landing-.md` (LS-89) — the carried
  research: the template decision, the "Sie" register, the html-validate / `serve.ps1` / link-check
  contract, the amendment of 2026-10-01 (website-only + "Sie"), and its own "Out of scope: AGB".
- `design/handoff/legal-pages/` + `design/STATUS.md:1752-1807` — variant A picked by Christian
  2026-09-30, handoff exported, built. No new design round (LS-122-D10).
- Backend, read-only, for the facts the text may state:
  `application-live.properties:391-455` (integration switch default `false` at 400, redirect URI
  406, scopes 409, user-info fields 417, video-list fields 418, native limit 421, token refresh
  424-426, publish switch default `false` at 436, inbox init/status 441-442, verified URL prefix
  447, 500 MB limit 449, content types 451);
  `model/tikTokConnection/TikTokConnection.java:48-99` (stored: handle, open_id, access and refresh
  token, both expiries, granted scopes, connected_at, status, oauth_state);
  `service/tiktok/TikTokConnectionServiceImpl.java:239-256` (disconnect revokes the token at TikTok
  best-effort and deletes the whole connection row);
  `service/socialMediaAccountScraping/TikTokNativeAccountScrapeServiceImpl.java:253,279` (video
  rows and account stat snapshots read via the Display API are **stored** in the app);
  `service/accountDeletion/AccountDeletionServiceImpl.java:117-175` (immediate hard delete on
  account deletion, TikTok send history then connection at 165-169);
  `service/stripe/StripeSubscriptionServiceImpl.java:103-138` (trial rules and the Checkout
  session), `service/stripe/events/StripeEventServiceImpl.java:182-199,282`,
  `service/stripe/StripeServiceImpl.java:150-167` (Stripe billing portal) and `:176-188`;
  `service/agency/AgencySeatBillingServiceImpl.java:100-117,176-186` plus
  `model/agency/AgencySeatBilling.java` (agency seats are billed as the Stripe subscription
  quantity, started/paused by an admin and re-synced when the seat count changes) — the one source
  for the agency section's billing sentence (criterion 18).

## Approach

One more page on the pattern that already exists, not a new pattern: `agb.html` is built as a copy
of `impressum.html`'s shell (head, nav, `main.recht`, `footer.fuss`) with `datenschutz.html`'s
`.recht__inhalt` table of contents, because the AGB has far too many sections to go without one.
Nothing is invented visually: the only new CSS is one commented rule block in `web/recht.css` for
the "Entwurf" notice (built from existing tokens — `var(--weiss)`, `var(--linie)`, `var(--r)`,
`var(--tinte)`) plus a table-of-contents modifier, because the existing grid is hard-coded to five
rows and two columns and would spill a 17-item list into an implicit third column.

The AGB text is written as draft positions, each one checked against the code (see Context found)
so the page never promises behaviour the product does not have. Where the contractual rule is ahead
of the code — deletion after contract end (LS-122-D3) — the rule is written **and** the gap is named
in an HTML comment next to it and in the close-out, so the next reader sees both. The same applies
to the §312k Kündigungsbutton, which stays an app task (LS-122-D7).

The interim redirect is removed in the same commit range as the page, as LS-122-D8 requires: a
`302!` wins over an existing file, so leaving those two lines in place would mean Netlify never
serves the new page. The footers switch from `/agb` to the relative `agb.html` (see Assumptions),
`sitemap.xml` gains the page, and the three docs that describe the repo (`README.md`, `CLAUDE.md`,
the `web/recht.css` header comment) stop describing an interim Notion redirect and a three-page
stylesheet.

Rejected: (a) copying the Notion Terms of Service text — it was never written against what Loop
Studio sells, and LS-122 exists to replace it; (b) keeping `/agb` in the footers — it breaks the
local preview (`serve.ps1:35-50`) and contradicts CONCEPT.md §S1; (c) a second AGB document for
agencies — LS-122-D5 wants one document with an agency section; (d) a new design round — the
template is approved and built (LS-122-D10); (e) splitting the page from the redirect removal —
either the page is never served or a footer link dies (CONCEPT.md §S1).

## Files to change

| File | Change | Why |
|---|---|---|
| `agb.html` | New. German AGB page, formal "Sie", on the `impressum.html` shell + `datenschutz.html` table of contents; visible "Entwurf" notice; the section list of criterion 12; an HTML `SOURCES` comment block citing the files each product fact came from | The deliverable: the AGB as a page in the repo instead of a Notion stand-in |
| `_redirects` | Delete lines 3-8: the INTERIM comment block and the two `/agb` `302!` rules. Line 1 (`privacy-policy.html` 301) stays byte-identical | LS-122-D8: the `!` forces the redirect even when the file exists, so `agb.html` would never be served |
| `index.html` | Line 581: `<a href="/agb">AGB</a>` → `<a href="agb.html">AGB</a>` | The real page, and a relative link that also works from `serve.ps1` |
| `impressum.html` | Line 145: same replacement | same |
| `datenschutz.html` | Line 281: same replacement. **If open question 1 is answered "here":** one new `section.abschnitt` (TikTok, id `tiktok`) after section 09 plus its table-of-contents row at 88-101 | The footer link, and the TikTok disclosure of CONCEPT.md §S1 |
| `web/recht.css` | Header comment 1-16: three pages → four, `agb.html` named. One new commented rule block for the "Entwurf" notice, one table-of-contents modifier for a list longer than ten items | The notice is the only new visual element; the existing grid is hard-coded to 5×2 |
| `sitemap.xml` | New `<url><loc>https://loopstudio.app/agb.html</loc></url>` after the `datenschutz.html` entry | A sitemap lists the site's canonical URLs |
| `README.md` | File listing: `agb.html` added; the `_redirects` line mentions only the privacy 301; the conventions bullet about the legal pages names `agb.html` | Lines 24-25 describe an interim redirect that no longer exists |
| `CLAUDE.md` | "What this is" names `agb.html`; the `web/recht.css` sentence says the four legal pages | Same: the file describes the repo and is wrong the moment this ships |
| `docs/specs/20261001-agb-page-and-a-tiktok-section-in-the-privacy-pol.md` | This spec | The plan ships with the change |

No other file is touched. No file in `loop-studio-backend`, `loop-studio-frontend`,
`knowledge-base/` or `design/` is edited by this task.

## Acceptance criteria

Criteria 22-26 depend on open question 1; criterion 14's second half (consulting) on open question
2; criterion 13's gross/net wording on open question 3; criterion 14's trial paragraph and the
"Testphase" part of criterion 12's section 04 on open question 4. The Dev Manager folds the answers
into those criteria before the build starts — an answer appended to the spec is not enough.

1. `agb.html` exists in the repository root and `http://localhost:8843/agb.html` returns HTTP 200
   with `Content-Type: text/html; charset=utf-8` from `.\serve.ps1`.
2. `agb.html` has `<!DOCTYPE html>` and `<html lang="de">`, a `<title>` containing both "AGB" and
   "Loop Studio", a non-empty `<meta name="description">`, `og:title`, `og:description`,
   `og:type`, `og:url` and `<link rel="canonical">` both exactly
   `https://loopstudio.app/agb.html`, the `og:image`/`twitter:card` block of `impressum.html:13-17`,
   the three favicon links of `impressum.html:40-42` and the Thunder preload of `impressum.html:18`.
3. `agb.html` links the same 19 `web/*.css` files in the same order as `impressum.html:19-37`, with
   `web/recht.css` last, and links no stylesheet from `css/` and no script from `js/`.
4. The only external host `agb.html` loads is `plausible.io`, with exactly the snippet of
   `impressum.html:43-48`; no other `http(s)` resource is loaded (fonts, CSS, JS, images are local).
5. `agb.html`'s `<nav class="nav">` block is identical in links, labels and `href`s to
   `impressum.html:57-72`.
6. `agb.html`'s `<footer class="fuss">` block matches `impressum.html:141-149` except that the AGB
   link reads `<a href="agb.html" aria-current="page">AGB</a>` and the Impressum link carries no
   `aria-current`.
7. The page body is `main.recht > .wrap` with `header.recht__kopf` (an `.eyebrow` reading
   "Rechtliches", exactly one `<h1>`, a `.recht__lead`, and a `.stand.recht__stand` line reading
   `Stand: <day>. <Monat> 2026` in German long form and naming the day the page was written),
   followed by `.recht__spalte` containing the `.recht__inhalt` table of contents and the
   `section.abschnitt` list.
8. Every `section.abschnitt` in `agb.html` has a unique `id`, exactly one `<h2>`, and a
   `p.abschnitt__nr` with a two-digit number; the numbers run from `01` upwards with no gap and in
   document order.
9. The table of contents lists every section of the page exactly once, in document order, with the
   same two-digit number and the same text as its `<h2>`, and every anchor resolves to an `id` that
   exists on the page.
10. The visible text of `agb.html` contains no "du"-form: a case-insensitive word search for `du`,
    `dein`, `deine`, `deinem`, `deinen`, `deiner`, `dich`, `dir` finds no match outside HTML
    comments, attributes and compound words (the text addresses the reader as "Sie"/"Ihr").
11. A visible draft notice sits after `header.recht__kopf` and before `.recht__inhalt`, in its own
    element, and says all three of: that the text is a draft ("Entwurf"), that it has **not** been
    reviewed by a lawyer, and that it is published for review and may still change.
12. `agb.html` contains one `section.abschnitt` per topic, in this order: 01 Geltungsbereich und
    Anbieter · 02 Vertragsgegenstand und Leistungsbeschreibung · 03 Vertragsschluss, Registrierung
    und Mindestalter · 04 Testphase, Preise und Zahlung · 05 Widerrufsrecht für Verbraucher ·
    06 Laufzeit und Kündigung · 07 Nutzerinhalte und Rechte · 08 Erlaubte Nutzung · 09 Verbindung
    von Social-Media-Konten · 10 KI-generierte Inhalte und Verantwortung · 11 Verfügbarkeit und
    Support · 12 Pflichten des Kunden · 13 Haftung · 14 Datenschutz und Löschung nach Vertragsende ·
    15 Besondere Bedingungen für Agenturen · 16 Änderungen dieser AGB · 17 Schlussbestimmungen
    (Streitbeilegung, anwendbares Recht, Gerichtsstand, Salvatorische Klausel).
13. Section 04 states the price as `20 €` per month **per the answer to open question 3** (gross
    incl. USt. or net plus USt.), names the monthly billing period, and names Stripe as the payment
    service provider through whose checkout the payment data is entered; it states that Loop Studio
    itself stores only the Stripe customer and subscription references, not card data.
14. **(open question 4)** Section 04's trial paragraph says what the answer to open question 4 says,
    and nothing else. If the answer is "the trial exists as the code grants it": a 7-day trial at
    the start of a subscription; a payment method must be given at checkout; cancelling within those
    7 days costs nothing and no payment is taken; the paid subscription starts after the 7 days; the
    trial is granted once per customer; another length can be agreed in an individual case — and
    **not** described as free of commitment or as possible without payment data. If the answer is
    "no trial" (LS-122-D2 as written): the section says plainly that no free trial period is granted,
    the word "Testphase" leaves the section 04 heading of criterion 12, and the close-out names the
    checkout's 7-day trial (`StripeSubscriptionServiceImpl.java:117-121`) as a product gap with its
    own app task — the page may not deny what the checkout does without that being on the record.
    Section 01 or 02 says whether the consulting packages are covered, per the answer to open
    question 2.
15. Section 03 states that registration and use require a minimum age of 16, and that a person
    under 16 may not conclude the contract.
16. Section 06 states that the subscription can be cancelled monthly, names cancellation by e-mail
    to `contact@loopstudio.app` as a route that always works, and makes **no** claim that a
    §312k BGB "Kündigungsbutton" exists in the app; an HTML comment above the section names the
    missing button as the open app task of LS-122-D7.
17. Section 14 states LS-122-D3 as the contractual rule — customer data is deleted immediately
    after the contract ends, except accounting records (invoices) kept for the statutory retention
    periods — and an HTML comment directly above the section names the verified gap: no code path
    deletes customer data when a contract ends (`StripeEventServiceImpl.java:182-199` deletes only
    the internal subscription row; the immediate hard delete exists only on account deletion,
    `AccountDeletionServiceImpl.java:117-175`), and that closing it is its own app task.
18. Section 15 is the agency section (LS-122-D5: one document, one section, no second AGB): it
    states that these same AGB apply to agencies, who the contracting party is, that the agency is
    responsible for the users and client accounts it creates and for having the rights to its
    clients' content, and that paid seats are billed per connected seat — the last point backed by
    `service/agency/AgencySeatBillingServiceImpl.java:100-117,176-186` (the Stripe subscription
    quantity is the seat count and is synced when it changes). It names no seat price, no client
    count and no billing cycle the code does not have.
19. No sentence anywhere in `agb.html` states an availability percentage, an uptime or a response-
    time SLA, and no sentence states that a deletion, cancellation or retention step happens
    automatically where the code has no such path (the only such claim is section 14's contractual
    rule, carrying the comment of criterion 17).
20. `agb.html` contains one HTML comment block headed `SOURCES` that cites, for each of sections 02,
    04, 06, 14, 15 (and the TikTok section where criterion 22 applies), the repo-relative file and
    line range the product facts in it were read from.
21. Section 09 states that connecting a social-media account is voluntary, that the respective
    platform's own terms and privacy rules apply to what happens on that platform, and that Loop
    Studio cannot guarantee a platform's availability or that a platform keeps granting access.
22. **(open question 1)** A `section.abschnitt` with `id="tiktok"` and an `<h2>` naming TikTok and
    the Loop Studio app exists on the page the answer names, immediately after that page's last
    existing section, with its table-of-contents row added and its number continuing the sequence.
23. **(open question 1)** That section's first sentence bounds it: it describes only the TikTok
    connection inside the Loop Studio app, every claim in it applies only if the reader connects
    their own TikTok account, and the rest of the app's processing is covered by the app's own
    privacy policy — linked with the same `href` as `datenschutz.html:82`.
24. **(open question 1)** That section names, each verifiably matching the cited source: the
    requested scopes verbatim `user.info.basic, user.info.profile, user.info.stats, video.list,
    video.upload` (`application-live.properties:409`) and that only the scopes TikTok actually
    grants are used; the profile fields read (`:417`) and the video fields read (`:418`); that
    access token, refresh token, their expiry times, the TikTok `open_id`, the account handle and
    the granted scopes are stored (`TikTokConnection.java:48-81`); that the tokens are refreshed
    automatically, including by a nightly job (`:424-426`); that video metadata and account metrics
    read from TikTok are stored in the app (`TikTokNativeAccountScrapeServiceImpl.java:253,279`);
    and that a connected account can have videos published to TikTok through TikTok's Content
    Posting API (`:436-451`).
25. **(open question 1)** That section states what ending the connection does: disconnecting
    revokes the token at TikTok and deletes the stored connection including both tokens
    (`TikTokConnectionServiceImpl.java:239-256`), and deleting the account additionally deletes the
    TikTok send history (`AccountDeletionServiceImpl.java:165-169`); it names TikTok as responsible
    for the processing on its own platform, links TikTok's own privacy policy, and names a legal
    basis for the connection.
26. **(open question 1)** If the section lands on `datenschutz.html`, that page's scope sentences
    (`datenschutz.html:82` and `:127-129`) are amended so the page does not first claim to cover the
    website only and then describe one app feature; `CLAUDE.md:28-31` and `README.md:73-76` are
    amended in the same change to name the TikTok section as the one recorded exception.
27. `_redirects` contains no line matching `^/agb` and no comment mentioning Notion or the Terms of
    Service; its first line is still exactly `/privacy-policy.html /datenschutz.html 301!`.
28. No `*.html` file in the repository contains `href="/agb"` any more; `index.html`,
    `impressum.html`, `datenschutz.html` and `agb.html` each contain exactly one footer link
    `href="agb.html"` with the label `AGB`.
29. `sitemap.xml` contains `<loc>https://loopstudio.app/agb.html</loc>` exactly once, after the
    `datenschutz.html` entry, and the file still parses as well-formed XML.
30. `README.md` lists `agb.html` in its file listing, describes `_redirects` as holding the
    `privacy-policy.html` 301 only, and contains no sentence describing an interim AGB redirect to
    Notion; its conventions section names `agb.html` among the legal pages.
31. `CLAUDE.md` names `agb.html` in "What this is" and says `web/recht.css` is loaded on the four
    legal pages; `web/recht.css`'s header comment (lines 1-16) names the same four pages.
32. The new rule block in `web/recht.css` for the draft notice is commented, introduces no literal
    colour value (no `#rrggbb`, no `rgb(`, no `hsl(`), no `font-family` other than an existing
    `var(--…)` token and no literal border-radius, and changes no existing declaration.
33. At 1440 px the table of contents of every page carrying one renders in two columns with no
    implicit third column: for a list of n entries the applicable `grid-template-rows` is
    `repeat(ceil(n/2),auto)`, and `datenschutz.html`'s existing 5×2 rendering is unchanged unless
    its section count changes.
34. `npx --yes html-validate@8 "*.html"` reports zero findings for `agb.html`, and its findings for
    every other page are identical to the findings the same command produces on `dev`.
35. Every relative `href`/`src` in `agb.html` resolves to a file that exists in the repository; the
    only absolute URLs in it are `https://app.loopstudio.app/…`, `mailto:contact@loopstudio.app` and
    `https://plausible.io/…` — plus, on the page carrying the TikTok section, the TikTok links of
    criterion 25.
36. `agb.html` renders from `.\serve.ps1` at 1440 px and at 390 px with the site's nav pill at the
    top, the dark `footer.fuss` as a static block at the end, no horizontal scrollbar at either
    width, and no element overflowing the viewport.
37. `git diff --name-only dev...HEAD` lists only the files named under "Files to change".

## Test plan

There is no automated test suite in this repo and nothing is written under test paths (the brief
says so explicitly). The Tester runs and reports these three checks, as `CLAUDE.md:36-45` requires:

1. **HTML validation.** `npx --yes html-validate@8 "*.html"` in the worktree root; the output is
   pasted into the report, and compared against the same command run on `dev` so "no new finding"
   is a fact and not a claim (criterion 34).
2. **Local render.** `.\serve.ps1`, then `http://localhost:8843/agb.html` at 1440 px and 390 px, plus
   `datenschutz.html`, `impressum.html` and `index.html` to confirm the footers and the unchanged
   table of contents (criteria 1, 33, 36).
3. **Links.** Every relative `href`/`src` of the new and the changed pages is resolved against the
   working tree, and the absolute links are listed (criteria 28, 35). `http://localhost:8843/agb`
   is expected to **404 locally** — that is `serve.ps1`, not a defect; `/agb` is checked on the
   Netlify deploy preview instead.

Mechanical text checks the Tester can run instead of reading: the "du"-form search (criterion 10),
the `href="/agb"` search (criterion 28), the `^/agb` search in `_redirects` (criterion 27), the
scope string of criterion 24 against `application-live.properties:409`, and the section list of
criterion 12 against the table of contents.

## What to click

1. On the Netlify deploy preview, open `/agb` **without** `.html`: the AGB page appears, not the
   Notion Terms of Service, and the address bar does not leave the preview domain.
2. The draft notice at the top of `agb.html` is impossible to miss on first look, at 1440 px and at
   390 px, and reads as "this is not yet legally reviewed" rather than as decoration.
3. The footer "AGB" link on the start page, the Impressum and the Datenschutz page each land on the
   AGB page, where the AGB link is the marked one (white with the turquoise hairline).
4. Read sections 04, 06 and 14 of `agb.html`: the trial, the cancellation and the deletion rule are
   what you actually sell and actually do.
5. The TikTok section reads as bounded to the app's TikTok connection — a reader cannot mistake it
   for the website doing something with TikTok (only if open question 1 lands it here).

## Verification and evidence

The close-out shows, in this order:

- The full output of the validator and the two runs it is compared against. Windows — PowerShell:
  `cd C:\ai\dev-worktrees\loopstudio\landing\20261001-agb-page-and-a-tiktok-section-in-the-privacy-pol; npx --yes html-validate@8 "*.html"`
  macOS — Terminal (zsh): not available (the worktree is on the Windows PC).
  What it does: validates every page in the repo root and prints one block per finding; the expected
  result is zero findings for `agb.html` and an otherwise unchanged finding list.
- Two screenshots of `agb.html` from the local preview, 1440 px and 390 px, with the draft notice
  visible in the 1440 px one. Windows — PowerShell:
  `powershell -NoProfile -ExecutionPolicy Bypass -File C:\ai\dev-worktrees\loopstudio\landing\20261001-agb-page-and-a-tiktok-section-in-the-privacy-pol\serve.ps1`
  macOS — Terminal (zsh): not available (the worktree is on the Windows PC).
  What it does: serves the repo at `http://localhost:8843/`; open `/agb.html` there. Stop it with
  Ctrl+C.
- The read-back of the removed redirect. Windows — PowerShell:
  `Select-String -Path C:\ai\dev-worktrees\loopstudio\landing\20261001-agb-page-and-a-tiktok-section-in-the-privacy-pol\_redirects -Pattern "agb"`
  macOS — Terminal (zsh): not available (the worktree is on the Windows PC).
  What it does: prints every `_redirects` line mentioning `agb`; the expected result is **no output**.
- The read-back of the footer links. Windows — PowerShell:
  `Select-String -Path C:\ai\dev-worktrees\loopstudio\landing\20261001-agb-page-and-a-tiktok-section-in-the-privacy-pol\*.html -Pattern 'href="/agb"'`
  macOS — Terminal (zsh): not available (the worktree is on the Windows PC).
  What it does: prints every remaining absolute `/agb` footer link; the expected result is **no
  output**.
- The section list of `agb.html` as printed from its own markup (criterion 12), next to the table of
  contents, so the two are shown to agree.
- The TikTok claims next to their sources: the scope line of `application-live.properties:409`, the
  two field lines, and the disconnect block of `TikTokConnectionServiceImpl.java:239-256`, quoted.
- One paragraph naming the deletion gap of criterion 17 as a proposed app task, in the PR
  description and in the close-out, so it is visible to the conductor and not only in the page
  source.
- The deploy-preview URL plus the result of "What to click" 1 (`/agb` without `.html`). If the
  preview cannot be reached, that criterion is reported as unverified, never as passed.

## Will not do

- No merge or push to `main` or to `dev`, no rebase, no touching the base branch; the branch is
  merged into `dev` by pull request and reaches `main` only at gate 3, after the lawyer has read it.
- No change to any Netlify setting, no `netlify.toml`, no DNS, no publish-directory change.
- No edit in `loop-studio-backend` or `loop-studio-frontend` — in particular no §312k
  Kündigungsbutton, no deletion-on-contract-end job and no consent checkbox; the backend is read
  for facts only.
- No edit to the Notion "Terms of Service" or "Privacy Policy" pages, and no copy of their text.
- No edit under `knowledge-base/` or `design/`, and no new design round.
- No change to `index.html`'s pricing copy (LS-85 owns it), to `impressum.html` beyond its footer
  link, or to `404.html`, `privacy-policy.html`, `robots.txt`, `css/*`, `js/*`.
- No new dependency, no build step, no third-party script and no new external host.
- No claim, anywhere in the page or the report, that the text is legally reviewed or compliant.

## Stop conditions

- Any of the four open questions is still unanswered when the build would start: stop and ask. The
  TikTok criteria cannot be written against two different files, and the trial/price wording cannot
  be guessed — least of all the trial, where a human decision and the running code disagree.
- A factual statement cannot be backed by a file in the repos (a retention period, an availability
  promise, a seat price, a deletion step): stop and ask instead of writing a plausible sentence.
- `html-validate` reports a finding on a page this task did not touch: stop and report it as
  pre-existing, do not fix it here.
- Removing the two `/agb` lines turns out not to be enough for `/agb` to serve the page on the
  deploy preview: stop — the next step would be a Netlify setting, which is outside this task.
- The draft notice would need a colour, a font or a radius that is not already a token: stop and
  ask in the design channel (LS-122-D10); do not invent a value.
- A gate-1 answer contradicts a criterion here: stop and have this spec amended, rather than
  building to the chat message.

## Risks and open questions

- **A human decision and the running code disagree about the trial.** LS-122-D2 ("no free trial",
  Christian 2026-10-01, repeated 2026-10-02) against `StripeSubscriptionServiceImpl.java:117-121`
  (7 days for `BASE`, once per customer). The conductor verified the code and recorded the fact as
  LS-122-D12 in CONCEPT.md with LS-122-S1-Q6; D2 is **not** retracted by the Architect, the
  Implementer or this spec. Whichever way it is answered, one side gets a change — a page or an app
  task — and the build waits for it (open question 4).
- **CONCEPT.md §S1 and the front-desk note disagree about the footer target** (`agb.html` vs
  `/agb`). This spec follows the concept, because `/agb` 404s under `serve.ps1:35-50`; `/agb` still
  has to work on Netlify and is checked on the preview.
- The deletion gap of criterion 17 is a real product gap, not a wording problem: once the AGB say
  data is deleted after the contract ends, the app has to do it. Filing that app task is the
  conductor's call; this task only names it.
- Minimum age 16 makes consumers customers, so a Widerrufsbelehrung belongs in the AGB (section 05)
  and the "immediate start" consent for a digital service is a checkbox the app does not have. Both
  are carried here as draft positions for the lawyer; the missing checkbox is an app task next to
  the Kündigungsbutton. Not a question Christian must answer before the build — but the lawyer will.
- Criteria 11, 19 and 21 are judgement calls on wording ("impossible to miss", "no promise the code
  does not have"). Criterion 11 is covered by "What to click" 2; 19 and 21 are checked by the
  Reviewer reading the page against the Context found list — they are not provable by a mechanical
  check, and that is the known soft spot of this task.
- Whether the TikTok integration is switched on in production is unverifiable here (denied paths),
  which is why every TikTok sentence is conditional. If it is in fact off everywhere, the section
  describes a feature a reader cannot yet use — truthful, but worth knowing.
- `agb.html` loads the Plausible snippet like the other legal pages. `datenschutz.html:198` already
  says the script is loaded "auch auf dieser Seite"; if the AGB page is meant to load nothing, say
  so and the snippet is dropped from this one page.
- 17 sections of German legal text is a lot of writing in one round. If the Implementer's output is
  thin in a section, that is a `spec`-free quality finding for the Reviewer, not a criterion — hence
  the explicit per-section topic list in criterion 12.

## Proposed split (Christian decides)

**No split.** This task is CONCEPT.md §S1 and ships whole: the page, the four footers, the
`sitemap.xml`/docs lines and the removal of the two `/agb` `302!` lines interlock — apart, either
Netlify never serves the page (the redirect wins) or a footer link dies. Re-slicing is the
conductor's call and the concept keeps one slice, so this spec proposes none.

What the open questions do instead of splitting: open question 1 decides whether the TikTok
criteria (22-26) are **in or out** of this one slice. Answered "datenschutz.html", they are built
here; answered "the app's own policy", they drop out, nothing TikTok-related is written in this
repo, and the AGB half ships unchanged — the slice stays complete either way, because the AGB page
never depends on the TikTok section and the TikTok section never depends on the AGB page.

## Out of scope

- The lawyer's review and any claim of legal compliance; the merge to `main`.
- The §312k BGB Kündigungsbutton, the deletion-on-contract-end job and the immediate-start consent
  checkbox — all app tasks (LS-122-D7 and criterion 17's gap), and switching the 7-day trial off in
  the Stripe checkout if open question 4 goes that way (LS-122-D12).
- A Widerrufsbelehrung that has been through legal review, and the Muster-Widerrufsformular as a
  separate downloadable document; section 05 carries the draft text only.
- A second AGB document for agencies (LS-122-D5: one document, one section).
- Terms for the consulting packages unless open question 2 says otherwise, and any change to the
  price copy on `index.html` (LS-85 owns it).
- The app's own privacy policy (LS-114) and mirroring the TikTok text into it.
- `404.html`'s redesign, `privacy-policy.html`, a cookie banner, a DE/EN switch on the legal pages,
  and a `Preisangabenverordnung` pass over the start page.
- Any refactor of `web/recht.css` beyond the two additions and the header comment, and any
  deduplication of the four now near-identical footers into a shared include (there is no build
  step; that would be a different task).
