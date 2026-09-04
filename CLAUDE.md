# CLAUDE.md

Guidance for Claude Code (and the Dev Manager's roles) working in this repository. Setup,
structure, and deploy are in [README.md](./README.md); this file holds the rules.

## What this is

The static, pre-login marketing site of Loop Studio (`loopstudio.app`): start page, Impressum,
privacy policy, 404. It is **not** the app; the app is `loop-studio-frontend` (Nuxt) next to this
repo, reached at `app.loopstudio.app`. Cross-repo context (architecture, decisions, glossary)
lives in the workspace's `../knowledge-base/`; screen designs in `../design/`.

## Rules

- The HTML/CSS/JS here is the source of truth. It began as a Webflow export, but Webflow is
  retired (2026-09-04); never suggest re-exporting.
- Minified exported files (`css/*.min.css`, `js/webflow.js`) are generated artifacts: change
  behaviour or styling by adding a small hand-written file and linking it, unless the task is
  explicitly about the exported file. Keep such additions readable and commented.
- Every page must keep working when opened from `serve.ps1` (relative paths, no build step).
- Links into the app always use `https://app.loopstudio.app/...`.
- Copy is German first. Do not change legal pages without an explicit instruction.
- No third-party scripts, trackers, or fonts from external hosts without a recorded decision.
- Branch rule: never commit to `main` (that deploys to Netlify) or `dev`; work on `fix/` or
  `feature/` branches from `dev`.

## Checking a change

There is no test suite. A change is verified by:

1. `npx --yes html-validate@8 "*.html"` passes (or reports only pre-existing findings).
2. The affected page renders correctly from `.\serve.ps1` in a browser, on desktop and a phone
   width.
3. Links resolve (relative links to files in this repo, absolute links to the app).

Report these three explicitly in an implementation or test report.
