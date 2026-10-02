---
task: 20261001-agb-page-and-a-tiktok-section-in-the-privacy-pol
company: loopstudio
status: ready
size: L
branch: feature/agb-page-and-a-tiktok-section-in-the-privacy-pol-2203
base: dev
design: handoff at design/handoff/legal-pages/
---

# An AGB page on the landing page, with the interim Notion redirect removed

## Goal

Give `loopstudio.app` its own AGB as a real page in the repo (`agb.html`), German, formal "Sie", on
the already approved and already built legal-page template, carrying a visible "Entwurf" notice
until a lawyer has read it. The page states the draft positions for what Loop Studio actually sells
— the 20 €/month app subscription incl. USt., the 7-day trial that needs a payment method and can be
cancelled free of charge, minimum age 16, Stripe payment, monthly cancellation, deletion after
contract end, liability, law and venue — plus one own section for agencies, and one sentence saying
the consulting packages are contracted separately. In the same change the two interim `/agb` lines
that 302 to Notion are deleted from `_redirects`, the three existing footers plus the new page point
at the real page, and `sitemap.xml`, `README.md`, `CLAUDE.md` and `web/recht.css` are brought in
line. The TikTok disclosure section does **not** land in this repo: LS-122-D13 (Christian,
2026-10-02) puts it in the app's own privacy policy (LS-114).

## Assumptions

- The lawyer has not reviewed any of this text; nothing here claims legal sufficiency, and the page
  ships with the "Entwurf" notice (LS-122-D6). Christian's sign-off at gate 1 is about facts and
  completeness, not about legal correctness.
- The 15-plus legal positions are draft positions. A later lawyer round rewrites wording; this task
  is done when the positions are on the page, truthful about the product, and the notice is visible.
- **The trial is settled against the code** by Christian's correction of 2026-10-02, recorded as
  LS-122-D16, which supersedes AGB fact 1 / LS-122-D2 ("no free trial"): the app has a 7-day trial
  that requires a payment method and a subscription, cancellable free of charge inside those 7
  days. **This is the one gate-1 item to confirm out loud**, because it reverses a fact Christian
  stated twice (2026-10-01 and in the front-desk block of 2026-10-02) and it reached this task
  through the answer block rather than through the feature's decision log: one "no, D2 stands" and
  criterion 14 flips to "no trial is granted" plus an app task. Re-verified
  here: `StripeSubscriptionServiceImpl.java:117-121` sets `trial_period_days = 7` for a `BASE`
  subscription while `user.isUsedTrial()` is false, inside a Checkout session in `SUBSCRIPTION`
  mode (`:123-138`), and `StripeEventServiceImpl.java:282` sets `usedTrial = true` afterwards — so
  the trial is granted **once per customer**. The page is written against that, not against D2.
- That the Checkout session always collects a payment method is Stripe's default for
  `Mode.SUBSCRIPTION` (`payment_method_collection = always`): the code sets
  `SavedPaymentMethodOptions.paymentMethodSave = ENABLED` (`:130-134`) but never
  `setPaymentMethodCollection` (verified: no occurrence in the backend source). The default is
  **unverified against the live Stripe dashboard** and matches Christian's own statement, so the AGB
  states that a payment method is given at checkout.
- Two further trial facts the page must not contradict: a discount code can grant a different trial
  length (`StripeSubscriptionServiceImpl.java:103-112`) and a `CONSULTING` subscription gets 30 days
  (`:113-116`). Consulting is out of scope by LS-122-D14, so only the "another
  length by individual agreement" possibility has to stay open in the wording.
- LS-122-S1-Q5 is answered by reading the code, not by asking (LS-122-D17): **there is no
  deletion of customer data when a contract ends.** `handleCustomerSubscriptionDeletedEvent`
  (`StripeEventServiceImpl.java:182-199`) deletes only the internal `StripeSubscription` row, which
  is what the access gate reads; the immediate hard delete of user data exists only on account
  deletion (`AccountDeletionServiceImpl.java:117-175`). The AGB therefore states the contractual
  rule of LS-122-D3 and the gap is named in the page source and in the close-out as its own app task.
- The footer links go to the **relative** `agb.html`, not to `/agb`, even though the front-desk note
  said "keep the footer link at `/agb`": `serve.ps1:30-50` serves existing files only, with no
  extensionless fallback, so `/agb` 404s in the local preview and would break `CLAUDE.md:24`
  ("every page must keep working when opened from `serve.ps1`"). `/agb` still has to serve the page
  on Netlify (pretty URLs), and that is checked on the deploy preview. CONCEPT.md §S1 bullet 5 asks
  for `agb.html` too.
- Netlify's pretty-URL behaviour (`/agb` → `agb.html` once no `_redirects` rule shadows it) is
  **unverified from the repo** — there is no `netlify.toml` and the site settings are not readable
  here. It is verified by clicking the deploy preview (gate 3 / "What to click" 1).
- LS-122-D1 is already live (`impressum.html:80` names the website **and** the app); this task
  verifies that line and does not rewrite the Impressum.
- The word "TikTok" does not appear anywhere in this repo today and does not appear after this task
  either (LS-122-D13). Mirroring the TikTok text into the app's policy is LS-114's
  work; filing that follow-up is the conductor's call, not an action of this task.
- Deploy stays gate 3: this branch is merged into `dev` by PR, nothing reaches `main` or Netlify
  production here.

Correct me at gate 1, otherwise I proceed with these.

## Context found

- Implements CONCEPT.md §S1 ("The AGB page, the interim redirect removed, and the TikTok section")
  of `C:\code\loopstudio\features\LS-122-agb-page-and-a-tiktok-section-in-the-pri\CONCEPT.md`;
  binding decisions LS-122-D1 … D17 from its decisions log. Nothing outside §S1 is built here, and
  every remaining bullet of §S1 has at least one criterion below. §S1's TikTok bullet **left this
  slice** with LS-122-D13 (Christian, 2026-10-02) — the concept foresaw that outcome ("nothing
  TikTok-related ships in this repo") and has been amended to match; see "Risks and open questions".
- **Gate-1 answers, now recorded as decisions in the concept (Christian, 2026-10-02).** The
  `LS-122-S1-Qn` ids are the feature's own; where this spec earlier numbered its own list, the
  mapping is given:
  - LS-122-S1-Q1 → **LS-122-D13**: the TikTok section belongs in the **app** privacy policy
    (LS-114, `https://app.loopstudio.app/datenschutz`), because TikTok is connected inside the app,
    not on the website. This task adds no TikTok section to `datenschutz.html`. LS-122-D11 /
    LS-112-D2 (the landing privacy policy covers the website only) therefore stands unamended →
    criterion 23 and the `datenschutz.html` row of "Files to change".
  - LS-122-S1-Q2 → **LS-122-D14**: these AGB cover the app subscription and the agency use only.
    The consulting packages (490 / 1,690 / 3,900 € + Startblock) are consulting projects under
    their own offer/contract, which may reference these AGB but is not part of them → criterion 15.
  - LS-122-S1-Q4 (this spec's earlier "open question 3") → **LS-122-D15**: 20 €/month is the price
    the customer pays incl. USt. (tax behaviour inclusive, B2C) — independently on the record as
    LS-85-D3 (Christian, 2026-09-30) → criterion 13.
  - LS-122-S1-Q6 (this spec's earlier "open question 4") → **LS-122-D16**: the trial exists —
    7 days, payment method and subscription required, free cancellation inside the 7 days, then the
    paid subscription starts. Supersedes AGB fact 1 / LS-122-D2 → criterion 14.
  - LS-122-S1-Q5 → **LS-122-D17**: answered from the code, see the deletion bullet in Assumptions →
    criterion 18.
  - Still open and deliberately not blocking: LS-122-S1-Q3 (Widerrufsbelehrung and the
    immediate-start consent checkbox) — carried as draft positions for the lawyer, the checkbox as
    an app task.
- `C:\code\loopstudio\CLAUDE.md` — three repos; pre-login legal pages belong to `landing-page/`.
- `CLAUDE.md` (this repo) — the binding rules: no edits to minified Webflow artifacts (18-20), every
  page works from `serve.ps1` with relative paths (24), app links use `https://app.loopstudio.app/…`
  (25), German copy and "Sie" on the legal pages (26-27), `datenschutz.html` covers the website only
  (28-31), no new external host without a recorded decision (32), never commit to `main`/`dev` (33),
  and the three verification steps ("Checking a change", 36-45). Lines 21-23 say `web/recht.css` is
  loaded last and "only on the three legal pages (`impressum.html`, `datenschutz.html`,
  `privacy-policy.html`)" — that list becomes four.
- `impressum.html` — the template to copy from: head block 4-48 (title 6, description 7, og 8-11,
  canonical 12, og:image/twitter 13-17, Thunder preload 18, the 19 stylesheets 19-37, `web/recht.css`
  last at 39, three favicons 40-42, the Plausible snippet 43-48), `nav.nav` 57-72, `main.recht` 74,
  `header.recht__kopf` 77-103 with `.eyebrow`, `h1`, `.recht__lead`, `.stand.recht__stand` (81),
  `.recht__karte` (83-100) and `.recht__hinweis` (102), `.recht__spalte` 105, `section.abschnitt`
  blocks from 107, `footer.fuss` 141-149 with the `/agb` link (145) and `aria-current="page"`.
  Line 80 already names website **and** app (LS-122-D1, verified live).
- `datenschutz.html` — the nine-section sibling: lead at 82 with the interim Notion link to the
  app's policy, `.recht__inhalt` table of contents at 88-101, section 01 scope text at 127-129
  ("Die Loop Studio App … ist nicht Gegenstand dieser Erklärung"), sections 02-09 at 132-268,
  Plausible/Calendly/Netlify at 197-202, footer at 281. It contains no occurrence of "TikTok" and
  keeps none.
- `index.html:406-412` — "Die Software für 20 € im Monat", the `Monatlich kündbar` badge and the
  20 €/Monat price card; `index.html:7` the consulting price; `index.html:581` the footer.
- `_redirects` — line 1 is the `privacy-policy.html` 301; lines 3-6 are the INTERIM comment block
  and lines 7-8 the two `302!` rules to the Notion Terms of Service that this task must delete
  (LS-122-D8), verified verbatim in the worktree.
- `sitemap.xml:3-11` — three `<url>` entries (`/`, `/impressum.html`, `/datenschutz.html`).
- `README.md:18-35` the file listing (24-25 documents the interim redirect, 27-28 says `recht.css`
  is "only on the three legal pages"), `:64-78` the conventions incl. the "Sie" register list
  (66-68) and the website-only rule (73-76).
- `web/recht.css` — the hand-written legal stylesheet: header comment 1-16 ("only on those three
  pages"), `.recht__hinweis` at 39 (a plain paragraph, no border), `.recht__karte` at 71 (white
  card, hairline, `var(--r)`), the table-of-contents grid at 80-86 — `grid-auto-flow:column` with
  `grid-template-rows:repeat(5,auto)` and two columns, i.e. tuned for 9-10 items, one column below
  700 px (86) — and `.fuss__links a[aria-current="page"]` at 102.
- `serve.ps1:1-50` — port 8843, `.html` served as `text/html; charset=utf-8` (14), existing files
  only (38), `/` → `/index.html` (36), no extensionless fallback, everything else 404 (46-49).
  `/agb` is a 404 locally.
- `docs/specs/20260930-impressum-and-datenschutz-pages-for-the-landing-.md` (LS-89) — the carried
  research: the template decision, the "Sie" register, the html-validate / `serve.ps1` / link-check
  contract, the amendment of 2026-10-01 (website-only + "Sie"), and its own "Out of scope: AGB".
- `design/handoff/legal-pages/` + `design/STATUS.md` — variant A picked by Christian 2026-09-30,
  handoff exported, built. No new design round (LS-122-D10).
- Backend, read-only, for the facts the text may state:
  `service/stripe/StripeSubscriptionServiceImpl.java:103-138` (discount-code trial 103-112,
  `CONSULTING` 30 days 113-116, `BASE` 7 days while `!user.isUsedTrial()` 117-121, `SUBSCRIPTION`
  mode 127, `SavedPaymentMethodOptions` 130-134);
  `service/stripe/events/StripeEventServiceImpl.java:182-199` (a deleted subscription removes only
  the internal row) and `:282` (`setUsedTrial(true)`);
  `service/accountDeletion/AccountDeletionServiceImpl.java:117-175` (immediate hard delete on
  account deletion only);
  `service/stripe/StripeServiceImpl.java:150-167` (Stripe billing portal);
  `service/agency/AgencySeatBillingServiceImpl.java:100-117,176-186` plus
  `model/agency/AgencySeatBilling.java` (agency seats are billed as the Stripe subscription
  quantity, started/paused by an admin and re-synced when the seat count changes) — the one source
  for the agency section's billing sentence (criterion 19).

## Approach

One more page on the pattern that already exists, not a new pattern: `agb.html` is built as a copy
of `impressum.html`'s shell (head, nav, `main.recht`, `footer.fuss`) with `datenschutz.html`'s
`.recht__inhalt` table of contents, because the AGB has far too many sections to go without one.
Nothing is invented visually: the only new CSS is one commented rule block in `web/recht.css` for
the "Entwurf" notice (built from existing tokens — `var(--weiss)`, `var(--linie)`, `var(--r)`,
`var(--tinte)`) plus a table-of-contents modifier, because the existing grid is hard-coded to five
rows and two columns (`web/recht.css:82`) and would spill a 17-item list into an implicit third
column.

The AGB text is written as draft positions, each one checked against the code (see Context found)
so the page never promises behaviour the product does not have. The trial, the price and the scope
are written exactly as Christian's answers of 2026-10-02 state them, and those answers agree with
the code. Where the contractual rule is ahead of the code — deletion after contract end
(LS-122-D3) — the rule is written **and** the gap is named in an HTML comment next to it and in the
close-out, so the next reader sees both. The same applies to the §312k Kündigungsbutton, which stays
an app task (LS-122-D7).

The interim redirect is removed in the same commit range as the page, as LS-122-D8 requires: a
`302!` wins over an existing file, so leaving those two lines in place would mean Netlify never
serves the new page. The footers switch from `/agb` to the relative `agb.html` (see Assumptions),
`sitemap.xml` gains the page, and the three places that describe the repo (`README.md`, `CLAUDE.md`,
the `web/recht.css` header comment) stop describing an interim Notion redirect and a three-page
stylesheet.

The TikTok disclosure is not written here. By LS-122-D13 it belongs to the app's
own policy (LS-114); `datenschutz.html` keeps its website-only scope exactly as
`CLAUDE.md:28-31` / `README.md:73-76` state it, and this task touches only its footer link.

Rejected: (a) copying the Notion Terms of Service text — it was never written against what Loop
Studio sells, and LS-122 exists to replace it; (b) keeping `/agb` in the footers — it breaks the
local preview (`serve.ps1:30-50`) and contradicts CONCEPT.md §S1; (c) a second AGB document for
agencies — LS-122-D5 wants one document with an agency section; (d) a new design round — the
template is approved and built (LS-122-D10); (e) splitting the page from the redirect removal —
either the page is never served or a footer link dies (CONCEPT.md §S1); (f) a TikTok section in
`datenschutz.html` — recommended by the earlier draft, answered "app policy" on 2026-10-02.

## Files to change

| File | Change | Why |
|---|---|---|
| `agb.html` | New. German AGB page, formal "Sie", on the `impressum.html` shell + `datenschutz.html` table of contents; visible "Entwurf" notice; the 17 sections of criterion 12; an HTML `SOURCES` comment block citing the files each product fact came from | The deliverable: the AGB as a page in the repo instead of a Notion stand-in |
| `_redirects` | Delete lines 3-8: the INTERIM comment block and the two `/agb` `302!` rules. Line 1 (`privacy-policy.html` 301) stays byte-identical | LS-122-D8: the `!` forces the redirect even when the file exists, so `agb.html` would never be served |
| `index.html` | Line 581: `<a href="/agb">AGB</a>` → `<a href="agb.html">AGB</a>` | The real page, and a relative link that also works from `serve.ps1` |
| `impressum.html` | Line 145: same replacement | same |
| `datenschutz.html` | Line 281: same replacement, and nothing else | The footer link only — the TikTok section goes to the app's policy (LS-122-D13) |
| `web/recht.css` | Header comment 1-16: three pages → four, `agb.html` named. One new commented rule block for the "Entwurf" notice, one table-of-contents modifier for a list longer than ten items | The notice is the only new visual element; the existing grid is hard-coded to 5×2 |
| `sitemap.xml` | New `<url><loc>https://loopstudio.app/agb.html</loc></url>` after the `datenschutz.html` entry | A sitemap lists the site's canonical URLs |
| `README.md` | File listing: `agb.html` added; the `_redirects` line mentions only the privacy 301; `recht.css` named on four pages; the "Sie" conventions bullet (66-68) names `agb.html` | Lines 24-25 describe an interim redirect that no longer exists |
| `CLAUDE.md` | "What this is" (8-12) names `agb.html`; the `web/recht.css` sentence (21-23) names the four legal pages | Same: the file describes the repo and is wrong the moment this ships |
| `docs/specs/20261001-agb-page-and-a-tiktok-section-in-the-privacy-pol.md` | This spec | The plan ships with the change |

No other file is touched. No file in `loop-studio-backend`, `loop-studio-frontend`,
`knowledge-base/` or `design/` is edited by this task.

## Acceptance criteria

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
13. Section 04 states the price as `20 €` per month **gross, including USt.** (LS-122-D15,
    LS-85-D3) — the amount the customer pays, with no sentence adding USt. on top —
    names the monthly billing period, and names Stripe as the payment service provider through whose
    checkout the payment data is entered; it states that Loop Studio itself stores only the Stripe
    customer and subscription references, not card data.
14. Section 04's trial paragraph states the trial as LS-122-D16 (Christian's correction of
    2026-10-02) and the code have it, and nothing beyond it: a 7-day trial at the start of the app subscription; a
    payment method must be given and the subscription concluded at checkout; cancelling within those
    7 days costs nothing and no payment is taken; after the 7 days the paid subscription starts
    automatically; the trial is granted once per customer; a different length can be agreed in an
    individual case. The paragraph does **not** describe the trial as free of commitment, as
    available without payment data, or as repeatable for the same customer, and the page contains no
    sentence saying that no trial is granted.
15. Section 01 states the scope per LS-122-D14: these AGB govern the Loop Studio
    app subscription (including the agency use of section 15), and one sentence says that the
    consulting packages offered on the website are contracted separately by individual offer and are
    not governed by these AGB. The page names no consulting price, no consulting term and no
    consulting trial.
16. Section 03 states that registration and use require a minimum age of 16, and that a person
    under 16 may not conclude the contract.
17. Section 06 states that the subscription can be cancelled monthly, names cancellation by e-mail
    to `contact@loopstudio.app` as a route that always works, and makes **no** claim that a
    §312k BGB "Kündigungsbutton" exists in the app; an HTML comment above the section names the
    missing button as the open app task of LS-122-D7.
18. Section 14 states LS-122-D3 as the contractual rule — customer data is deleted immediately
    after the contract ends, except accounting records (invoices) kept for the statutory retention
    periods — and an HTML comment directly above the section names the verified gap: no code path
    deletes customer data when a contract ends (`StripeEventServiceImpl.java:182-199` deletes only
    the internal subscription row; the immediate hard delete exists only on account deletion,
    `AccountDeletionServiceImpl.java:117-175`), and that closing it is its own app task.
19. Section 15 is the agency section (LS-122-D5: one document, one section, no second AGB): it
    states that these same AGB apply to agencies, who the contracting party is, that the agency is
    responsible for the users and client accounts it creates and for having the rights to its
    clients' content, and that paid seats are billed per connected seat — the last point backed by
    `service/agency/AgencySeatBillingServiceImpl.java:100-117,176-186` (the Stripe subscription
    quantity is the seat count and is synced when it changes). It names no seat price, no client
    count and no billing cycle the code does not have.
20. No sentence anywhere in `agb.html` states an availability percentage, an uptime or a response-
    time SLA, and no sentence states that a deletion, cancellation or retention step happens
    automatically where the code has no such path (the only such claim is section 14's contractual
    rule, carrying the comment of criterion 18).
21. `agb.html` contains one HTML comment block headed `SOURCES` that cites, for each of sections 01,
    02, 04, 06, 14 and 15, the repo-relative file and line range the product facts in it were read
    from.
22. Section 09 states that connecting a social-media account is voluntary, that the respective
    platform's own terms and privacy rules apply to what happens on that platform, and that Loop
    Studio cannot guarantee a platform's availability or that a platform keeps granting access. It
    names no single platform's scopes, fields or tokens (that text belongs to the app's own privacy
    policy, LS-122-D13).
23. No file changed by this task contains the string `TikTok` (case-insensitive), and
    `git diff dev...HEAD -- datenschutz.html` shows exactly one changed line, the footer link of
    criterion 25; `datenschutz.html:82` and `:127-129` (the website-only scope) and
    `CLAUDE.md:28-31` / `README.md:73-76` are unchanged in substance.
24. `_redirects` contains no line matching `^/agb` and no comment mentioning Notion or the Terms of
    Service; its first line is still exactly `/privacy-policy.html /datenschutz.html 301!`.
25. No `*.html` file in the repository contains `href="/agb"` any more; `index.html`,
    `impressum.html`, `datenschutz.html` and `agb.html` each contain exactly one footer link
    `href="agb.html"` with the label `AGB`.
26. `sitemap.xml` contains `<loc>https://loopstudio.app/agb.html</loc>` exactly once, after the
    `datenschutz.html` entry, and the file still parses as well-formed XML.
27. `README.md` lists `agb.html` in its file listing, describes `_redirects` as holding the
    `privacy-policy.html` 301 only, contains no sentence describing an interim AGB redirect to
    Notion, and names `agb.html` both where `recht.css`'s pages are listed and in the "Sie"
    conventions bullet.
28. `CLAUDE.md` names `agb.html` in "What this is" and says `web/recht.css` is loaded on the four
    legal pages (`impressum.html`, `datenschutz.html`, `privacy-policy.html`, `agb.html`);
    `web/recht.css`'s header comment (lines 1-16) names the same four pages.
29. The new rule block in `web/recht.css` for the draft notice is commented, introduces no literal
    colour value (no `#rrggbb`, no `rgb(`, no `hsl(`), no `font-family` other than an existing
    `var(--…)` token and no literal border-radius, and changes no existing declaration.
30. At 1440 px the table of contents of every page carrying one renders in two columns with no
    implicit third column: for a list of n entries the applicable `grid-template-rows` is
    `repeat(ceil(n/2),auto)`, and `datenschutz.html`'s existing 5×2 rendering is unchanged.
31. `npx --yes html-validate@8 "*.html"` reports zero findings for `agb.html`, and its findings for
    every other page are identical to the findings the same command produces on `dev`.
32. Every relative `href`/`src` in `agb.html` resolves to a file that exists in the repository; the
    only absolute URLs in it are `https://app.loopstudio.app/…`, `mailto:contact@loopstudio.app` and
    `https://plausible.io/…`.
33. `agb.html` renders from `.\serve.ps1` at 1440 px and at 390 px with the site's nav pill at the
    top, the dark `footer.fuss` as a static block at the end, no horizontal scrollbar at either
    width, and no element overflowing the viewport.
34. `git diff --name-only dev...HEAD` lists only the files named under "Files to change".

## Test plan

There is no automated test suite in this repo and nothing is written under test paths (the brief
says so explicitly). The Tester runs and reports these three checks, as `CLAUDE.md:36-45` requires:

1. **HTML validation.** `npx --yes html-validate@8 "*.html"` in the worktree root; the output is
   pasted into the report, and compared against the same command run on `dev` so "no new finding"
   is a fact and not a claim (criterion 31).
2. **Local render.** `.\serve.ps1`, then `http://localhost:8843/agb.html` at 1440 px and 390 px, plus
   `datenschutz.html`, `impressum.html` and `index.html` to confirm the footers and the unchanged
   table of contents (criteria 1, 30, 33).
3. **Links.** Every relative `href`/`src` of the new and the changed pages is resolved against the
   working tree, and the absolute links are listed (criteria 25, 32). `http://localhost:8843/agb`
   is expected to **404 locally** — that is `serve.ps1`, not a defect; `/agb` is checked on the
   Netlify deploy preview instead.

Mechanical text checks the Tester can run instead of reading: the "du"-form search (criterion 10),
the `href="/agb"` search (criterion 25), the `^/agb` search in `_redirects` (criterion 24), the
`TikTok` search over the changed files plus the one-line `datenschutz.html` diff (criterion 23), and
the section list of criterion 12 against the table of contents.

## What to click

1. On the Netlify deploy preview, open `/agb` **without** `.html`: the AGB page appears, not the
   Notion Terms of Service, and the address bar does not leave the preview domain.
2. The draft notice at the top of `agb.html` is impossible to miss on first look, at 1440 px and at
   390 px, and reads as "this is not yet legally reviewed" rather than as decoration.
3. The footer "AGB" link on the start page, the Impressum and the Datenschutz page each land on the
   AGB page, where the AGB link is the marked one (white with the turquoise hairline).
4. Read sections 01, 04, 06 and 14 of `agb.html`: the scope (app subscription plus agencies,
   consulting separate), the 20 € incl. USt., the 7-day trial with payment method, the monthly
   cancellation and the deletion rule are what you actually sell and actually do.
5. The Datenschutz page is unchanged apart from its footer link — no TikTok text appeared on it.

## Verification and evidence

The close-out shows, in this order:

- The full output of the validator and the run it is compared against. Windows — PowerShell:
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
- The read-back for criterion 23. Windows — PowerShell:
  `cd C:\ai\dev-worktrees\loopstudio\landing\20261001-agb-page-and-a-tiktok-section-in-the-privacy-pol; git diff --stat dev...HEAD; Select-String -Path .\*.html -Pattern "TikTok"`
  macOS — Terminal (zsh): not available (the worktree is on the Windows PC).
  What it does: prints the per-file diff sizes (`datenschutz.html` must show 1 insertion /
  1 deletion) and every occurrence of "TikTok" in the pages; the expected result is **no output**
  for the second command.
- The section list of `agb.html` as printed from its own markup (criterion 12), next to the table of
  contents, so the two are shown to agree.
- The trial and price claims next to their sources: `StripeSubscriptionServiceImpl.java:117-121`
  and `:127-134` quoted, plus `StripeEventServiceImpl.java:282`, so the page's section 04 can be
  read against the code.
- One paragraph naming the deletion gap of criterion 18 as a proposed app task, in the PR
  description and in the close-out, so it is visible to the conductor and not only in the page
  source; plus one line naming the TikTok disclosure as LS-114's work (LS-122-D13).
- The deploy-preview URL plus the result of "What to click" 1 (`/agb` without `.html`). If the
  preview cannot be reached, that criterion is reported as unverified, never as passed.

## Will not do

- No merge or push to `main` or to `dev`, no rebase, no touching the base branch; the branch is
  merged into `dev` by pull request and reaches `main` only at gate 3, after the lawyer has read it.
- No change to any Netlify setting, no `netlify.toml`, no DNS, no publish-directory change.
- No edit in `loop-studio-backend` or `loop-studio-frontend` — in particular no §312k
  Kündigungsbutton, no deletion-on-contract-end job, no consent checkbox and no change to the
  7-day trial in the Stripe checkout; the backend is read for facts only.
- No TikTok text anywhere in this repo, and no edit to the app's own privacy policy (LS-114).
- No edit to the Notion "Terms of Service" or "Privacy Policy" pages, and no copy of their text.
- No edit under `knowledge-base/` or `design/`, and no new design round.
- No change to `index.html`'s pricing copy (LS-85 owns it), to `impressum.html` beyond its footer
  link, to `datenschutz.html` beyond its footer link, or to `404.html`, `privacy-policy.html`,
  `robots.txt`, `css/*`, `js/*`.
- No new dependency, no build step, no third-party script and no new external host.
- No claim, anywhere in the page or the report, that the text is legally reviewed or compliant.

## Stop conditions

- A factual statement cannot be backed by a file in the repos (a retention period, an availability
  promise, a seat price, a deletion step): stop and ask instead of writing a plausible sentence.
- The trial, the price or the scope as written would contradict the code: stop and report, rather
  than silently choosing one side — the answers of 2026-10-02 and the code agree today, and that is
  the premise of criteria 13-15.
- `html-validate` reports a finding on a page this task did not touch: stop and report it as
  pre-existing, do not fix it here.
- Removing the two `/agb` lines turns out not to be enough for `/agb` to serve the page on the
  deploy preview: stop — the next step would be a Netlify setting, which is outside this task.
- The draft notice would need a colour, a font or a radius that is not already a token: stop and
  ask in the design channel (LS-122-D10); do not invent a value.
- A gate-1 answer contradicts a criterion here: stop and have this spec amended, rather than
  building to the chat message.

## Risks and open questions

- **This slice is narrower than CONCEPT.md §S1 was when it was written**, by Christian's own answer
  and not by an Architect's choice: LS-122-S1-Q1 was answered "the app's privacy policy" on
  2026-10-02 (LS-122-D13), the concept foresaw that outcome ("nothing TikTok-related ships in this
  repo") and §S1 has been amended to match, so spec and concept agree. LS-122-D11 / LS-112-D2 stay
  intact. Carrying the TikTok text into LS-114 is a follow-up the conductor files; this task only
  names it. Criterion 23 is what makes the narrowing testable.
- **LS-122-D2 is superseded by LS-122-D16.** "There is NO free trial" (Christian 2026-10-01,
  repeated verbatim in the front-desk block of 2026-10-02) was corrected on 2026-10-02; the page
  follows the correction and the code (LS-122-D12). The correction reached the feature through the
  task's answer block, so it is the one item the Assumptions ask to be confirmed at gate 1: if D2
  is meant to stand after all, criterion 14 flips and the trial has to leave the Stripe checkout as
  its own app task — a spec amendment, not a build decision.
- The deletion gap of criterion 18 is a real product gap, not a wording problem: once the AGB say
  data is deleted after the contract ends, the app has to do it. Filing that app task is the
  conductor's call; this task only names it.
- Minimum age 16 makes consumers customers, so a Widerrufsbelehrung belongs in the AGB (section 05)
  and the "immediate start" consent for a digital service is a checkbox the app does not have. Both
  are carried here as draft positions for the lawyer; the missing checkbox is an app task next to
  the Kündigungsbutton. Not a question Christian must answer before the build — but the lawyer will.
- A discount code can grant a trial length other than 7 days
  (`StripeSubscriptionServiceImpl.java:103-112`). Criterion 14's "a different length can be agreed
  in an individual case" covers that truthfully without naming codes; if Christian wants discount
  codes described explicitly, that is one more sentence.
- Criteria 11, 20 and 22 are judgement calls on wording ("impossible to miss", "no promise the code
  does not have"). Criterion 11 is covered by "What to click" 2; 20 and 22 are checked by the
  Reviewer reading the page against the Context found list — they are not provable by a mechanical
  check, and that is the known soft spot of this task.
- `agb.html` loads the Plausible snippet like the other legal pages. `datenschutz.html:198` already
  says the script is loaded "auch auf dieser Seite"; if the AGB page is meant to load nothing, say
  so and the snippet is dropped from this one page.
- 17 sections of German legal text is a lot of writing in one round. If the Implementer's output is
  thin in a section, that is a quality finding for the Reviewer, not a criterion — hence the
  explicit per-section topic list in criterion 12.

## Proposed split (Christian decides)

**No split proposed, and why.** This task is CONCEPT.md §S1 minus the TikTok section, and what is
left ships whole: the page, the four footers, the `sitemap.xml`/docs lines and the removal of the
two `/agb` `302!` lines interlock — apart, either Netlify never serves the page (the redirect wins)
or a footer link dies. The one cut that would be independently mergeable is "page with sections
01-08 now, 09-17 later", and a half-written set of AGB on a live legal URL is worse than none.
Re-slicing is the conductor's call, and the conductor keeps one slice: a cut that lands the page
first and the `README.md` / `CLAUDE.md` / `web/recht.css` lines afterwards would leave the repo
describing a redirect that no longer exists for the length of a PR — the kind of leftover CONCEPT.md
§S1 exists to forbid. The docs lines are three sentences; they ship with the page.

## Out of scope

- The lawyer's review and any claim of legal compliance; the merge to `main`.
- The TikTok disclosure section: it belongs to the app's own privacy policy (LS-114), per
  LS-122-D13 — nothing TikTok-related is written in this repo.
- The §312k BGB Kündigungsbutton, the deletion-on-contract-end job and the immediate-start consent
  checkbox — all app tasks (LS-122-D7, LS-122-D17 / criterion 18's gap, LS-122-S1-Q3).
- A Widerrufsbelehrung that has been through legal review, and the Muster-Widerrufsformular as a
  separate downloadable document; section 05 carries the draft text only.
- A second AGB document for agencies (LS-122-D5: one document, one section).
- Terms for the consulting packages (LS-122-D14: their own offer/contract) and any
  change to the price copy on `index.html` (LS-85 owns it).
- `404.html`'s redesign, `privacy-policy.html`, a cookie banner, a DE/EN switch on the legal pages,
  and a `Preisangabenverordnung` pass over the start page.
- Any refactor of `web/recht.css` beyond the two additions and the header comment, and any
  deduplication of the four now near-identical footers into a shared include (there is no build
  step; that would be a different task).
