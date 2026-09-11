---
task: 20260911-add-plausible-analytics-to-loopstudio-app-landin
company: loopstudio
status: ready
size: M
branch: feature/add-plausible-analytics-to-loopstudio-app-landin
base: dev
design: none
---

# Add Plausible Analytics (hosted, EU, cookieless) and four conversion events to loopstudio.app

## Goal
Load Plausible Analytics on every page of the static loopstudio.app site so pageviews are counted.
The account is the one Venture Labs uses; no API key goes into the site. On the start page, send
Plausible custom events for the few real conversion actions the page offers. The four proposed
below are for gate-1 approval. The privacy page gets one sentence naming Plausible, marked
"lawyer to confirm". Nothing else is added: no cookie banner, no Google Analytics or Tag Manager,
no consent tool, no proxy.

## Assumptions
- **Base is `dev`, and `dev` already contains the redesign.** The task branch's reflog reads
  `branch: Created from origin/dev` at `ded8462`, and `origin/dev` is at `ded8462`. The worktree's
  `index.html` is the onlinemedianer redesign (`web/stil.css`, `web/fassung*.css`) and already has
  the 2026-09-08 compliance fixes (canonical, `web/zugang.css`, Calendly loading on click).
  `origin/feature/adopt-onlinemedianer-site` was pruned at the 2026-09-10 fetch, which suggests
  PR #5 has merged. If so, the brief's worry about a conflict-prone diff against the redesign no
  longer applies. **Unverified**: I cannot run `git log`, so the Implementer confirms it with
  `git merge-base` and says so in the PR.
- **"Every page" means the four root pages**: `index.html`, `impressum.html`,
  `privacy-policy.html`, `404.html`. `web/lego-demo.html` and `web/monster-buehne.html` are internal
  workbenches (`web/README.md`) and get no tag.
- **There is no shared head, partial or template.** There is no build step and no include
  mechanism. Each page has its own `<head>`, and three of them are one-line Webflow exports. So the
  tag goes into each of the four heads by hand. The only alternative would be to introduce a build
  step, which `CLAUDE.md` rules out.
- **Snippet variant: the legacy `data-domain` script, as the brief states:**
  `<script defer data-domain="loopstudio.app" src="https://plausible.io/js/script.js"></script>`.
  I could not read the live `https://plausible.io/docs`, because this role has no web access. I
  could not read the Venture Labs repo either (outside the workspace). **This is unverified**, and
  the brief asks for exactly this check. From memory (not a source): Plausible also offers a newer
  per-site script (`https://plausible.io/js/pa-<id>.js` plus an inline `plausible.init()` snippet).
  Its URL only exists once the site has been added in the Plausible UI. The Implementer's first
  step is to read the live docs (see *Stop conditions*).
- **No outbound-link or file-download extension.** The site has no downloadable files: the PDF form
  delivers nothing. The outbound links that matter (the two "start" CTAs into the app) get an
  explicit event. The outbound-links extension would add its own delayed-navigation handler to those
  same links, on top of ours; I have not verified how the two interact. What we lose is automatic
  counting of "Login", "Zum Tool" and `mailto:` clicks, which are not conversions.
- **No custom properties**, only event names. Goals in Plausible match on the name alone. I have not
  verified whether custom properties are included in the account's plan.
- **The event names are my proposal**, in English and Plausible's own title-case style ("Outbound
  Link: Click"). Whether Venture Labs follows a naming convention is **unverified**; if it does, the
  names can be renamed at gate 1.
- **Christian adds `loopstudio.app` to the Plausible account and creates the goals in the UI**, as
  the brief says. Until then Plausible drops the events. The code does not depend on that step.
- **The brief is Christian's explicit instruction to change `privacy-policy.html`.** `CLAUDE.md`
  allows legal-page changes only on his instruction. The "recorded decision" that `CLAUDE.md` and
  `README.md` require before any tracker is ADR 0008, written in this task (see *Approach*).
- **The privacy page exists but is in English** ("Privacy policy"; only the footer label reads
  "Datenschutz"). So the sentence is English. There is no German Datenschutz page on this site.
- **Only two CTAs count as "start" intent**: "Loop Studio ausprobieren" and "Jetzt starten". The nav
  and mobile "Login" and the footer "Zum Tool" go to the same URL but serve returning users, so they
  are not tracked.
- **The longest delay I allow on a tracked app link is 1000 ms** before the browser navigates
  anyway.
- **"Done"** means the criteria below hold on the `serve.ps1` preview and on the PR's Netlify deploy
  preview.

Correct me at gate 1, otherwise I proceed with these.

## Context found
- `CLAUDE.md` / `README.md` (landing): static site, no build step, no test suite. Verification is
  three checks: html-validate, a `serve.ps1` preview at desktop and phone width, and a link check.
  Prefer a small hand-written JS file over editing large or generated ones. Rule: "No third-party
  scripts, trackers, or fonts from external hosts without a recorded decision". Legal pages change
  only on Christian's instruction.
- `C:\code\loopstudio\CLAUDE.md`: a new vendor gets an ADR under
  `knowledge-base/architecture/decisions/`. `knowledge-base/README.md` is the index; every document
  ends with `## Related`.
- `knowledge-base/architecture/decisions/0007-landing-page-motion-stack-and-calendly-widget.md`: the
  precedent. It records Calendly as "the only external host permitted on the page". It lives in a
  separate checkout from `landing` and was committed independently. ADR 0008 follows the same
  format and path.
- `index.html`: the German redesign. `<head>` ends at line 43 (`apple-touch-icon`). Body scripts
  (lines 579–584): `web/lib/gsap.min.js`, `ScrollTrigger.min.js`, `lenis.min.js`, `web/lego.js`,
  `web/seite.js`, `web/bewegung.js`. The real CTAs:
  - **Booking**: `a[href="#gespraech"]` appears in the nav (`.nav__rechts .btn--rand-hell`, line 58),
    the hero (`.held__cta .btn--tuerkis`, line 96) and the three `.paket2` cards (lines 428, 437,
    445). The footer has the button `#rufKnopf` (line 562). The mobile menu has no booking link.
  - **Into the app**: all go to `https://app.loopstudio.app/login`. Nav "Login" `#navTool` (59), mobile
    "Login" (71), hero "Loop Studio ausprobieren" `.held__cta .btn--rand` (97), price card "Jetzt
    starten" `.preiskarte .btn` (413), footer "Zum Tool" (573).
  - **PDF form**: `#dlForm`, a `required` email input plus the submit "PDFs schicken" (496–504). The
    markup comment at line 505 says it is not connected to anything.
  - **Other**: `mailto:contact@loopstudio.app` (559); in-page anchors such as "Paket ansehen" →
    `#pakete` (369); the footer "Impressum"/"Datenschutz" links are `href="#"` (573).
- `web/bewegung.js:90–98`: `kalenderOeffnen` is bound to `a[href="#gespraech"], #rufKnopf`. It calls
  `preventDefault` and then opens the Calendly popup, loading `assets.calendly.com` on the first
  click. If Calendly fails to load, it falls back to `window.open(CALENDLY)` (`calAusweichen`).
  Lines 99–107 bind smooth scrolling to `a[href^="#"]` except `#gespraech`; absolute app links are
  not touched. The popup is served from `calendly.com`.
- `web/seite.js:45–46`: the `#dlForm` submit handler calls `preventDefault()` and sets the button to
  "Unterwegs ✓", disabled. Nothing is sent anywhere.
- `impressum.html`, `privacy-policy.html`, `404.html`: one-line Webflow exports. Each `<head>` ends
  with the two `images/…Frame%20*.png` icon links followed by `</head>`. They load
  `js/jquery-3.5.1.min.js` and `js/webflow-legal.js`. I grepped `webflow-legal.js` for cookie,
  storage, gtag, analytics and plausible: the only hit is `Symbol.toStringTag`, so it contains no
  tracker.
- `privacy-policy.html`: the Preamble paragraph ends "…This statement applies to the websites
  accessible under the domain loopstudio.app." Section 5 ("Use of cookies") describes analysis
  cookies and an info banner, neither of which exists. That text is pre-existing and is the lawyer's
  rewrite (see *Risks*).
- `serve.ps1`: serves the repo root on `http://localhost:8843/`, `.js` as
  `application/javascript`. No change needed.
- `docs/specs/20260908-fix-loopstudio-app-compliance-audit-findings-seo.md`: its criterion 13 ("no
  request to any host other than the page's own origin on a fresh load") is intentionally narrowed
  by this task to "…other than `plausible.io`". ADR 0008 records that.
- Existing JS naming is German (`bewegung.js`, `seite.js`, `zugang.css`), with comments in German
  and umlauts written as ae/oe/ue.

## Approach
This extends two existing patterns: a small hand-written file per concern (`zugang.css`,
`seite.js`), and ADR 0007's way of recording a permitted third-party host.

**1. The script on four pages.** Insert the Plausible `<script>` into each `<head>` by hand, directly
before `</head>` (in `index.html`, after the `apple-touch-icon` link). The default is the legacy
snippet quoted in *Assumptions*. Before writing it, the Implementer reads the live Plausible docs
(the page describing the script snippet and the custom-events page):
- If the docs still offer the `data-domain` script, use it as quoted.
- If they mark it deprecated or unsupported, follow *Stop conditions*.

**2. Events in one new file, `web/messen.js`, loaded only by `index.html`.** It goes after
`web/bewegung.js`. `web/bewegung.js` and `web/seite.js` stay byte-identical; `messen.js` attaches
its own listeners next to theirs. At the top it defines Plausible's documented queueing wrapper:

```js
window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
```

`messen.js` is a classic script at the end of `<body>`, so it runs before the deferred Plausible
script. Calls made before that script arrives are queued, and Plausible replays them. A second
inline `<script>` in `<head>` would do the same job, so it is not added. Every call looks up
`window.plausible` when it fires, never a cached reference.

**Proposed events (gate 1 approves, renames or drops each row):**

| Event name | Fires when | Hooked where |
|---|---|---|
| `Book Call Click` | Any booking trigger is clicked: `a[href="#gespraech"]` (nav, hero, 3 × `.paket2`) or `#rufKnopf`. Fires once per click, whether or not Calendly then loads. | `click` listener in `web/messen.js`, same selectors as `web/bewegung.js:98` |
| `Call Booked` | The Calendly popup reports a completed booking: a window `message` with `origin === 'https://calendly.com'` and `data.event === 'calendly.event_scheduled'`. This is the actual consulting conversion; the Calendly message name is **unverified** (see *Risks*). | `message` listener in `web/messen.js` |
| `App Start Click` | "Loop Studio ausprobieren" (`.held__cta a.btn--rand`) or "Jetzt starten" (`.preiskarte a.btn`) is clicked. | `click` listener in `web/messen.js` |
| `PDF Request` | `#dlForm` is submitted with a valid email. Native `required`/`type=email` validation blocks invalid submits before any `submit` event. The form delivers nothing today, so this measures demand, not delivery. | `submit` listener in `web/messen.js` |

Not tracked: nav and mobile "Login", footer "Zum Tool", "Paket ansehen", in-page anchors, `mailto:`,
the monster "Mit Reels füttern" toy button, the FAQ, the four-stations toggles.

**Navigating links.** `App Start Click` fires on a link that leaves the page in the same tab, where a
plain call can be lost on unload. For a primary click without modifier keys, the handler:
1. calls `preventDefault()`;
2. calls `window.plausible('App Start Click', { callback: go })`;
3. starts a 1000 ms timer that also calls `go`.

`go` runs once and sets `window.location.href` to the link's own `href`. With Ctrl, Meta or Shift
held, the handler only records the event and leaves the browser default (new tab or window) alone.
The booking triggers and the form never leave the page, so they need no callback.

**3. One privacy sentence.** Add a new `<p>` directly after the Preamble paragraph of
`privacy-policy.html`, exactly: *"To measure how this website is used, we use Plausible Analytics,
an EU-hosted web analytics service that sets no cookies and stores no personal data."* I put it in
the Preamble rather than section 5 so it does not sit inside the pre-existing (and wrong) cookie
text. The PR flags it "lawyer to confirm".

**4. ADR 0008** in `knowledge-base/architecture/decisions/`, in the same shape as 0007. Its content:
- Plausible (hosted, EU, cookieless, no key in the site) is chosen for the landing page.
- `plausible.io` becomes the second permitted external host after Calendly.
- The four event names, and that goals are created in the Plausible UI.
- Rejected alternatives: GA/GTM, a consent tool, self-hosting or proxying.
- Consequence: the 2026-09-08 "no off-origin request on load" rule now excludes `plausible.io`.

It is indexed in `knowledge-base/README.md` (the index count goes 18 → 19). It is committed
separately in the knowledge-base checkout, as 0007 was.

**Rejected:**
- Adding the calls inside `kalenderOeffnen` and the `#dlForm` handler. That touches two large,
  actively edited files; `messen.js` keeps the diff to one new file plus one tag.
- Plausible's "tagged events" CSS classes. They need another script extension, and the brief asks
  for `window.plausible(name)`.
- Tracking every app link. Login clicks are not conversions.
- A hostname guard in code to keep preview traffic out of the stats. Plausible's own settings are
  the place for that (see *Risks*).

## Files to change
| File | Change | Why |
|---|---|---|
| `index.html` | Insert the Plausible `<script>` before `</head>`. Insert `<script src="web/messen.js"></script>` after the `web/bewegung.js` tag. | Script on every page; events |
| `impressum.html` | Insert the Plausible `<script>` before `</head>` | Script on every page |
| `privacy-policy.html` | Insert the Plausible `<script>` before `</head>`, plus one `<p>` after the Preamble paragraph | Script; privacy sentence |
| `404.html` | Insert the Plausible `<script>` before `</head>` | Script on every page |
| `web/messen.js` | New, about 40 lines, commented in German like its siblings: the queueing wrapper, the four listeners, the navigation helper | Events |
| `C:\code\loopstudio\knowledge-base\architecture\decisions\0008-plausible-analytics-on-the-landing-page.md` | New ADR (separate checkout) | "Recorded decision" rule |
| `C:\code\loopstudio\knowledge-base\README.md` | Add one index line under Decisions; count 18 → 19 | Index rule |

## Acceptance criteria
1. Each of `index.html`, `impressum.html`, `privacy-policy.html` and `404.html`, as served by `serve.ps1`, contains exactly one `<script>` element whose `src` starts with `https://plausible.io/js/`. It is inside `<head>` and carries `defer`.
2. In the default variant, that element has exactly `data-domain="loopstudio.app"` and `src="https://plausible.io/js/script.js"`. If *Stop conditions* switches to the per-site variant, the rule becomes: `src` is the URL copied from the Plausible site settings, and the docs' inline init snippet appears exactly once per page.
3. `web/lego-demo.html` and `web/monster-buehne.html` are unchanged and contain no Plausible reference.
4. No file in the repo contains a Plausible API key, the string `PLAUSIBLE_API_KEY`, a `data-api` attribute or a proxy path for the script.
5. No page references `googletagmanager.com`, `google-analytics.com`, a `gtag(` call, or any consent-management script.
6. On a fresh load of each of the four pages with no interaction, every request to a host other than the page's own origin goes to `plausible.io`.
7. `index.html` loads `web/messen.js` exactly once, after `web/bewegung.js`. No other page loads it.
8. `web/messen.js` defines `window.plausible` with the queueing wrapper, and only if it is not already defined. Every event call reads `window.plausible` when it fires, so a recorder installed before page load receives all calls.
9. One click on any of the six booking triggers makes exactly one call, `window.plausible('Book Call Click')`, with one argument. The triggers are `.nav__rechts a[href="#gespraech"]`, `.held__cta a[href="#gespraech"]`, each of the three `.paket2 a[href="#gespraech"]`, and `#rufKnopf`. This holds whether `assets.calendly.com` loads or is blocked.
10. After a booking click, behaviour is unchanged from the base branch. The Calendly popup opens, or, with `assets.calendly.com` blocked, the existing `window.open` fallback runs.
11. A window `message` event with `origin` `https://calendly.com` and `data.event` `calendly.event_scheduled` makes exactly one call, `window.plausible('Call Booked')`. A message from any other origin, or with any other `data.event` (for example `calendly.event_type_viewed`), makes no call.
12. A primary click without modifier keys on `.held__cta a.btn--rand` or `.preiskarte a.btn` makes exactly one call. Its first argument is `'App Start Click'` and its second is an object with a `callback` function. The same tab then navigates to `https://app.loopstudio.app/login`: immediately if the callback is invoked, and no later than 1000 ms after the click if it never is (test tolerance 1500 ms).
13. A Ctrl-, Meta- or Shift-click on those two links makes exactly one `'App Start Click'` call and does not call `preventDefault`. The landing page stays on screen.
14. Clicking `#navTool`, the mobile-menu "Login", the footer "Zum Tool", "Paket ansehen", any in-page anchor, or the `mailto:` link makes no `window.plausible` call.
15. Submitting `#dlForm` with a valid email makes exactly one call, `window.plausible('PDF Request')`, and the button still shows "Unterwegs ✓" and is disabled. Submitting with an empty or invalid email makes no call.
16. A fresh load of `index.html` followed by scrolling to the bottom, with no clicks, makes no `window.plausible` call from `web/messen.js`.
17. With `plausible.io` blocked, every interaction in criteria 9–15 still behaves as on the base branch, the app links navigate within 1000 ms, and the console shows no error from `web/messen.js`.
18. `web/bewegung.js` and `web/seite.js` are byte-identical to the base branch.
19. Setup: the real Plausible script is allowed to load. Actions: a fresh load of each page, then on `index.html` a booking click, a Ctrl-click on "Jetzt starten" and a valid `#dlForm` submit. Result: `document.cookie` is empty, and the browser context holds no cookie for the page's host or for `plausible.io`. Cookies set by `calendly.com` inside its popup are listed in the report as pre-existing and do not fail this criterion.
20. `privacy-policy.html` contains the sentence from *Approach* §3 verbatim, as its own `<p>`, directly after the Preamble paragraph that ends "…under the domain loopstudio.app.".
21. Against the base branch, each page's diff is only what this task adds:
    - `impressum.html` and `404.html`: the one inserted script element each;
    - `privacy-policy.html`: that element plus the one `<p>`;
    - `index.html`: the two script tags.
22. `npx --yes html-validate@8 "*.html"` reports no finding that is not already reported on the base branch (`ded8462`).
23. Every relative link and asset on the four pages resolves on the `serve.ps1` preview, with no new 404 in the server window or browser console.
24. The four pages look unchanged from the base branch at 1440 px and 390 px, except for the new paragraph on `privacy-policy.html`.
25. ADR 0008 exists at `knowledge-base/architecture/decisions/0008-plausible-analytics-on-the-landing-page.md`.
    - Sections: Status, Context, Decision, Rejected alternative, Consequences, Related.
    - It names `plausible.io` as a permitted external host alongside Calendly.
    - It lists the four event names as approved at gate 1.
    - It links ADR 0007 under Related.
    - It appears in `knowledge-base/README.md`'s index, and the count there reads 19.

## Test plan
There is no test suite and there are no test directories, so the Test Writer writes no files here. The checks are the repo's three from `CLAUDE.md`, reported explicitly, plus an ad hoc browser run:
1. `npx --yes html-validate@8 "*.html"`: run once on the base (`ded8462`) to capture the baseline, then on the branch.
2. `.\serve.ps1`, then `http://localhost:8843/` in a browser for all four pages, at desktop and 390 px.
3. A link and asset check on the four pages.
4. A one-off Playwright script (`npx --yes playwright@1`, not committed) with two setups:
   - **Recorder setup.** Abort every request to `plausible.io`; otherwise the real script replaces the recorder. `page.addInitScript` installs `window.plausible = function(){ (window.__calls = window.__calls || []).push([].slice.call(arguments)); }`. Criterion 8 means `messen.js` keeps this recorder. Criterion 12 needs two runs: one where the recorder invokes `arguments[1].callback()`, and one where it never does. Criterion 11 dispatches `new MessageEvent('message', { origin: 'https://calendly.com', data: { event: 'calendly.event_scheduled' } })` on `window`, plus two negative variants.
   - **Real-script setup** for criteria 6 and 19. On `localhost` and under WebDriver, the Plausible script loads but ignores events. That is expected: this setup proves the requests and the cookies, not delivery.

## What to click
1. On the deploy preview, click "Gespräch buchen" in the nav, the hero and a package card, and the footer calendar button. The Calendly popup opens exactly as it does on the live site.
2. Click "Loop Studio ausprobieren" and "Jetzt starten". Each lands on the app's login page with no noticeable delay.
3. Submit the PDF form with an email address. The button turns into "Unterwegs ✓" as before.
4. Open the privacy page. The new Plausible sentence stands as its own paragraph under the preamble, in the page's normal text style.
5. Once `loopstudio.app` is added in Plausible, its realtime view shows the preview visit plus `Book Call Click` and `App Start Click`.

## Verification and evidence
The close-out shows the evidence itself, not a claim:
- **Criteria 1–3**: for each of the four pages, the count of Plausible `src` matches in the served HTML and the matched element pasted in. Command: `(Invoke-WebRequest http://localhost:8843/<page>).Content`, with a regex count of `<script[^>]*src="https://plausible\.io/js/`. Plus `git diff --stat` showing `web/*.html` untouched.
- **Criteria 4–5**: the repo-wide grep commands with their empty output. `gtag\(` is searched with the parenthesis, because a plain `gtag` also matches `Symbol.toStringTag` in `js/webflow-legal.js`.
- **Criterion 6**: the Playwright request list per page, fresh load, real-script setup: only same-origin requests plus `plausible.io`.
- **Criteria 8–17**: the recorder's `window.__calls` dump after each scripted interaction; the navigation timestamps for criterion 12 in both callback modes; `defaultPrevented` for criterion 13; the console log for criterion 17.
- **Criterion 18**: `git diff <base> -- web/bewegung.js web/seite.js` with empty output.
- **Criterion 19**: `document.cookie` and `context.cookies()` dumps after the interactions. Any `calendly.com` cookies are listed separately. On the deploy preview, a DevTools screenshot of Application → Cookies for the preview origin after the same clicks.
- **Criteria 20–21**: `git diff <base> --` on the four pages, pasted.
- **Criterion 22**: html-validate output from the base and from the branch, side by side.
- **Criteria 23–24**: the three `CLAUDE.md` checks reported by name, with before/after screenshots at 1440 px and 390 px.
- **Deploy preview**: the Plausible tag in view-source on each page, and the network panel showing `plausible.io/js/…` with status 200. In a normal (non-WebDriver) browser, a click that sends `/api/event`. The preview URL is named. If deploy previews are not enabled, the report says so and does not skip the row silently.
- **PR description** carries three flags:
  - the base-branch finding (redesign already in `dev`, or not, from `git merge-base`);
  - "privacy sentence: lawyer to confirm";
  - the reminder that Christian adds the site and the goals in the Plausible UI.

## Will not do
- No `git checkout`, `rebase`, `merge` or `push`. `main` and `dev` are off limits; work stays on `feature/add-plausible-analytics-to-loopstudio-app-landin`. The knowledge-base commit is not pushed either.
- No cookie banner, no consent tool, no Google Analytics or Tag Manager, no other tracker.
- No server-side proxy for the script or the event endpoint, and no `netlify.toml`, `_headers` or `_redirects`.
- No Plausible API calls: no creating goals or sites. No API key anywhere in the repo.
- No edits to `web/bewegung.js`, `web/seite.js`, any `web/*.css`, the minified Webflow CSS or JS, or `web/*.html`.
- No copy, layout, design or legal-text change beyond the one privacy sentence.
- No work in `loop-studio-frontend`, `loop-studio-backend` or `agent-cluster`, and no reading of its `.env`.
- No new dependency, no `package.json`, no build step. The Playwright script is run ad hoc and not committed.

## Stop conditions
- The live Plausible docs no longer offer the `data-domain` `script.js` snippet, or mark it deprecated, and no per-site script URL has been provided. Stop and ask Christian for the snippet from the Plausible site settings. Do not guess a `pa-<id>` URL.
- The live Plausible custom-events docs show a different queueing wrapper, or a different `callback` option, from the one in *Approach*. Stop and report the difference before writing `messen.js`.
- Calendly's documentation or a real message capture shows a different event name than `calendly.event_scheduled`, or a different origin than `https://calendly.com`. Stop and ask. Do not silently drop or rename `Call Booked`.
- The deploy preview blocks `plausible.io` through a Content-Security-Policy set in Netlify's UI. Stop and report; do not add headers.
- Any criterion from 10 to 17 shows a behaviour change against the base branch (Calendly, the form mock, smooth scrolling, app navigation). Stop instead of patching `web/bewegung.js` or `web/seite.js`.
- `git merge-base` shows the redesign is **not** in `dev`, or `index.html` conflicts with an incoming change. Stop and report before continuing.
- The knowledge-base checkout is not writable, or it is unclear which branch its ADR commit belongs on. Stop the ADR part only, put the full ADR text in the report, and finish the landing part.
- The html-validate baseline cannot be captured (for example, `npx` has no network). Stop; "no new finding" cannot be proven without it.

## Risks and open questions
- **The snippet variant is unverified** against the live docs (no web access in this role). The default and the stop condition above cover it. **Does not block.**
- **Preview and other hostnames count as loopstudio.app.** The `data-domain` script reports under `loopstudio.app` from any host, so deploy-preview clicks, including gate 3 itself, land in the real stats. `localhost` and WebDriver sessions are ignored by the script. The fix is Plausible's own hostname allowlist in the site settings (**unverified** feature name), which Christian can set in the UI. **Does not block.**
- **Ad blockers** often block `plausible.io`, so the numbers undercount. A proxy would fix that, and the brief excludes it. **Does not block.**
- **The privacy page contradicts itself** until the lawyer's rewrite. Section 5 still claims analysis cookies and an info banner; the new sentence says the analytics is cookieless. The sentence is correct, section 5 is not. Already tracked as the lawyer's rewrite (see 20260908 spec, *Out of scope*). **Does not block**; the PR flags it.
- **The start page does not link to the privacy page.** Its footer "Datenschutz" link is `href="#"` (`index.html:573`), so the new sentence is not reachable from the start page. This is pre-existing. Fixing it is a one-attribute change, but it is not part of this brief. **Does not block**; say the word at gate 1 and it goes in.
- **`Call Booked` rests on Calendly's `postMessage` API**, which I have not verified from the repo. It can only be proven synthetically here: a real test booking would put an appointment in Christian Arns' calendar. The first real booking after deploy confirms it in Plausible. **Does not block**; gate 1 can drop the row.
- **`PDF Request` counts submits of a form that delivers nothing.** Visitors who submit receive no PDFs. The event is still real demand, and it is the evidence for building the form's backend. **Does not block**; gate 1 can drop the row.
- **The ADR lives in a second checkout** (`C:\code\loopstudio\knowledge-base`) that this task's brief does not list. ADR 0007 set the precedent of a separate, independent commit. **Does not block**: the stop condition keeps the landing part shippable either way.

## Out of scope
- Adding `loopstudio.app` to the Plausible account, creating the four goals, and setting a hostname allowlist. Christian does these in the Plausible UI.
- The digests that use `PLAUSIBLE_API_KEY` in `agent-cluster`.
- Outbound-link, file-download, 404, revenue or custom-property tracking.
- Analytics in the app (`app.loopstudio.app`, `loop-studio-frontend`).
- The lawyer's rewrite of the privacy policy, a German Datenschutz page, and translating the legal pages.
- Fixing the footer's `href="#"` Impressum and Datenschutz links.
- Connecting the PDF form to a backend.
- The internal workbenches `web/lego-demo.html` and `web/monster-buehne.html`.
