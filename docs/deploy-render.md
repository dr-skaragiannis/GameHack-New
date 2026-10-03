# Deploying HackForge to Render with a Blueprint

Everything needed to deploy lives in [`render.yaml`](../render.yaml) at the repo
root. Render reads that file, shows you what it will create, and then creates it —
you never fill in a form for build command or publish directory.

## What gets deployed

| | |
|---|---|
| Resource type | **Static Site** (`type: web` + `runtime: static`) |
| Plan | Free — static sites have no paid tier |
| Build command | `npm ci --include=dev && npm run build` |
| Publish directory | `./dist` |
| Node version | 22 (`.nvmrc`, also pinned as `NODE_VERSION` in the Blueprint) |
| Database / backend | None. The app is 100% client-side; progress and terminal state live in the browser's `localStorage` |
| Environment variables needed | None. `NODE_VERSION` is the only one set, and only at build time |

`vite-plugin-singlefile` inlines the JS and CSS, so `dist/` contains exactly one
file, `index.html` (1.48 MB, 438 KB gzipped). Render serves it from its CDN.

## Step 1 — Get the code onto GitHub

Render builds from your GitHub (or GitLab) repo, so the branch carrying
`render.yaml` must be pushed first.

```bash
git checkout arena/01a0fdeb-gamehack-new
git push -u origin arena/01a0fdeb-gamehack-new
```

The Blueprint defaults to the repository's **default branch**. Two options:

- **Merge to `main`** (recommended for a public deploy) — open a PR from
  `arena/01a0fdeb-gamehack-new` into `main`, merge it, and Render picks it up
  automatically from then on.
- **Deploy the feature branch** — add one line under the service in
  `render.yaml` and push again:

  ```yaml
      branch: arena/01a0fdeb-gamehack-new
  ```

## Step 2 — Create the Blueprint

1. Sign in at [dashboard.render.com](https://dashboard.render.com).
2. **New →** **Blueprint**.
3. Connect your GitHub account if asked. The first time, install Render's GitHub
   App and grant it access to `dr-skaragiannis/GameHack-New` (only that repo is
   enough).
4. Pick the repository.
5. Render parses `render.yaml` and shows a review screen. You should see exactly
   one resource:

   ```
   gamehack-new   Static Site
     Build Command      npm ci --include=dev && npm run build
     Publish Directory  ./dist
   ```

6. Optionally set a **Blueprint branch** if you did not merge to `main`.

   > **Already have a service on this name?** An `onrender.com` subdomain can only
   > belong to one service. If an earlier web service is holding
   > `gamehack-new.onrender.com`, delete it first (or the Blueprint deploy will
   > not be able to claim the address).

7. **Apply**.

Render creates the static site and immediately runs the first deploy. Watch the
build log; a successful run ends with a line like:

```
==> Building...
==> Installing dependencies...
==> Building static site...
==> Your site is live at https://gamehack-new.onrender.com
```

The first build takes roughly a minute. Later deploys are incremental.

## Step 3 — Verify

```bash
curl -I https://gamehack-new.onrender.com
```

Expect `HTTP/2 200`, `content-type: text/html`, and the four security headers the
Blueprint sets:

```
x-content-type-options: nosniff
x-frame-options: DENY
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(), microphone=(), camera=()
```

Then open the URL in a browser and check:

- [ ] Four campaign cards render — Intro, Raven, SSH, **Sudo_Run (Linux for Beginners)**
- [ ] Open Sudo_Run → click a mission (e.g. *The Boot Sequence*) → the terminal responds
- [ ] `ls -a` inside the lab shows `.bashrc`, `.profile`, `.bash_history`
- [ ] Complete a mission, reload the page → progress persists (localStorage)

## Later changes

Push to the tracked branch and Render redeploys automatically
(`autoDeploy: true`). Edits to `render.yaml` are applied on the same push — or
press **Manual Sync** on the Blueprint page. Deploys are also rollbackable from
the service's **Deploys** tab.

Pull-request previews are set to `generation: manual`, so no preview is built
unless you ask for one. Change it to `automatic` in `render.yaml` to get a URL
per PR.

Changes touching only `docs/**`, `*.md`, or `test/**` are ignored by
`buildFilter`, so documentation edits do not trigger a rebuild.

## Custom domain

Add under the service in `render.yaml`:

```yaml
    domains:
      - lab.example.com
```

Then create the DNS record Render shows you (an `A` or `CNAME` for your
provider) and wait for the certificate to issue. Render serves HTTPS
automatically.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Your build failed... vite: not found` | Dev dependencies were skipped | Keep `--include=dev` in `buildCommand`; Vite is a devDependency |
| Build fails with an unexpected Node version | Render's default Node changed | `.nvmrc` says `22`; to override per-deploy set `NODE_VERSION` in the Blueprint's `envVars` |
| Blank page, console shows a MIME error | Wrong publish directory | `staticPublishPath` must be `./dist`, not `.` or `build` |
| Blueprint sync error `services[0].routes is not allowed` | Known validator quirk on some accounts | Delete the `routes:` block, then add the rule in **Settings → Redirects/Rewrites**: Source `/*`, Destination `/index.html`, Action *Rewrite*. Render keeps routing rules that are not in the Blueprint |
| Deploy shows the old version | Browser cache | Hard-reload. The Blueprint deliberately sets no `Cache-Control` on `index.html`, because the single-file bundle has no content hash in its filename |
| Fonts look wrong | Google Fonts blocked | `index.html` loads JetBrains Mono and Inter from `fonts.googleapis.com`; the layout falls back to system fonts if that CDN is unreachable |
| Blueprint screen is empty | `render.yaml` not on the tracked branch | Push the file to the branch the Blueprint tracks |

## Rehearse the build locally

```bash
npm ci --include=dev && npm run build   # exactly what Render runs
npm run preview                         # serve dist/ on http://localhost:4173
npm run typecheck && npm test && npm run test:smoke   # the full check suite
```

## What a full Blueprint can add later

`render.yaml` also supports `databases`, `envVarGroups`, and additional services
(web services, workers, cron jobs). If HackForge ever grows a real backend —
shared leaderboards, saved runs — add a second entry under `services:` with
`runtime: node` and a `fromDatabase` env var; the static site entry stays as it
is. Spec reference: <https://render.com/docs/blueprint-spec>.
