# Loop Studio landing page

The public, pre-login marketing site of Loop Studio at **loopstudio.app**: start page, Impressum,
privacy policy, and the 404 page. Everything after login lives in the app
(`app.loopstudio.app`, repo `loop-studio-frontend`); this site only links to it
(`https://app.loopstudio.app/login` and the sign-up entry points).

Part of the Loop Studio workspace: clone it next to the app repos as described in the
workspace README (`../README.md`).

## What it is technically

A static site: plain HTML, CSS, JS, fonts, and images. It started as a **Webflow export**
(2026-08), and **Webflow is no longer the editor** (decided 2026-09-04): the files in this repo
are the source of truth and are maintained by hand. Do not re-export from Webflow; that would
overwrite edits made here.

```
index.html            start page
impressum.html        legal notice (German law requires it)
privacy-policy.html   privacy policy
404.html              not-found page (Netlify serves it for unknown paths)
css/                  loopstudio-app.webflow.shared.min.css + page styles (exported, minified)
js/                   webflow.js runtime (exported, minified) - interactions, no app logic
fonts/                Plus Jakarta Sans (self-hosted)
images/               exported assets; file names carry Webflow ids
serve.ps1             local preview server (PowerShell, no dependencies)
```

## Preview locally

```powershell
.\serve.ps1            # http://localhost:8843/
.\serve.ps1 -Port 9000
```

No build step, no `npm install`. Open the URL in a browser; edit files and reload.

## Deploy

**Netlify, from the `main` branch.** Every merge to `main` publishes the site. There is no
build command and no deploy configuration in the repo; the Netlify site settings hold the
domain and the branch.

## Branching

`main` is the live site and is never committed to directly. `dev` is the integration branch;
work happens on `fix/<slug>` or `feature/<slug>` branches cut from `dev`, merged into `dev` by
pull request, and `dev` is merged into `main` after a check of the preview. Same rule as the app
repos and every other Loop Studio repository.

## Conventions

- Copy is **German** first; keep the register of the existing pages.
- Links into the app go to `https://app.loopstudio.app/...` (never the dev domain).
- The exported CSS and `webflow.js` are minified and generated; prefer adding a small
  hand-written stylesheet or script over editing the minified files, and say so in the commit.
- Legal pages (`impressum.html`, `privacy-policy.html`) change only on Christian's instruction.
- No trackers, no third-party scripts without a decision recorded in the workspace knowledge
  base.
