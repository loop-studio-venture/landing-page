# Loop Studio landing page

The public, pre-login marketing site of Loop Studio at **loopstudio.app**: start page, Impressum,
Datenschutzerklärung, AGB, and the 404 page. Everything after login lives in the app
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
impressum.html        legal notice (German law requires it), German, current design
datenschutz.html      privacy policy for THIS WEBSITE (loopstudio.app) only, German,
                      current design; it links to the app's own policy for app.loopstudio.app
claude-connector.html documentation of the Loop Studio connector for Claude (setup, permissions,
                      disconnect, the rule), German "du" first, then English; built on the legal-page
                      skeleton and recht.css, but not a legal page
agb.html              general terms and conditions (AGB) for the app subscription, German,
                      current design; a draft until a lawyer has read it, and the page says so
privacy-policy.html   redirect to datenschutz.html (the old canonical address)
_redirects            Netlify rule: /privacy-policy.html -> /datenschutz.html (301)
404.html              not-found page (Netlify serves it for unknown paths)
site.webmanifest      web app manifest (name, icons, theme colour)
favicon.ico           icon fetched by convention at /favicon.ico (generated)
icon-192.png          manifest icons (generated from bilder/logo/favicon-512.png)
icon-512.png
web/                  the current design: hand-written CSS/JS (stil, lego, fassung*, zugang),
                      recht.css only on the four legal pages and claude-connector.html, fonts/ self-hosted
bilder/               images of the current design; og-lupi.png is the share preview
                      image (1200x630, generated)
css/                  loopstudio-app.webflow.shared.min.css + page styles (exported, minified)
js/                   webflow.js runtime (exported, minified) - interactions, no app logic
fonts/                Plus Jakarta Sans (self-hosted)
images/               exported assets; file names carry Webflow ids
serve.ps1             local preview server (PowerShell, no dependencies)
werkzeuge/            tools: meta-check.mjs (share-tag check), og-bild/ (generator of the
                      preview image and icons), scrollshots.mjs, deploy.sh
```

`404.html` is still the retired Webflow export; only `index.html`, the three legal pages
(`impressum.html`, `datenschutz.html`, `agb.html`) and `claude-connector.html` are on the current design.

## Preview locally

```powershell
.\serve.ps1            # http://localhost:8843/
.\serve.ps1 -Port 9000
```

No build step, no `npm install` for the site itself. Open the URL in a browser; edit files and
reload. Only regenerating the derived images (`bilder/og-lupi.png`, `icon-*.png`, `favicon.ico`)
needs `npm --prefix werkzeuge/og-bild install`, then `node werkzeuge/og-bild/erzeugen.mjs`.

## Deploy

**Netlify, from the `main` branch.** Every merge to `main` publishes the site. There is no
build command; the Netlify site settings hold the domain and the branch. The only deploy
configuration in the repo is `_redirects` (the 301 from the old privacy address), and it only
takes effect if the publish directory is the repository root - `privacy-policy.html` stays on
disk as a working fallback either way.

## Branching

`main` is the live site and is never committed to directly. `dev` is the integration branch;
work happens on `fix/<slug>` or `feature/<slug>` branches cut from `dev`, merged into `dev` by
pull request, and `dev` is merged into `main` after a check of the preview and after
`node werkzeuge/meta-check.mjs` exits 0. Same rule as the app repos and every other Loop Studio
repository.

## Conventions

- Copy is **German** first; keep the register of the existing pages: "du" on the marketing
  pages, the formal "Sie" on the legal pages (`impressum.html`, `datenschutz.html`, `agb.html`,
  `privacy-policy.html`; Christian, 2026-09-30). `claude-connector.html` is not a legal page: it
  uses "du".
- Links into the app go to `https://app.loopstudio.app/...` (never the dev domain).
- The exported CSS and `webflow.js` are minified and generated; prefer adding a small
  hand-written stylesheet or script over editing the minified files, and say so in the commit.
- Legal pages (`impressum.html`, `datenschutz.html`, `agb.html`) change only on Christian's
  instruction. `agb.html` is a draft until a lawyer has read it and carries a visible notice
  saying so; removing that notice is Christian's call.
- `datenschutz.html` describes the **website** only (Christian, 2026-09-30). The logged-in
  product at `app.loopstudio.app` has its own privacy policy, which this page links to; never
  describe app processing here, and when the app gains a processor, that other notice is the
  one to change.
- No trackers, no third-party scripts without a decision recorded in the workspace knowledge
  base.
