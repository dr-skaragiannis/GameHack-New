# GameHack

## Local development

Use Node.js 22 or newer. Registration works without email delivery. Copy `.env.example` to `.env` and set SMTP values only if you want email-based password-reset links. Start the API and Vite together with:

```sh
npm ci
npm run dev
```

Vite serves the app on port 5173 and proxies `/api` requests to the local authentication API on port 3001. New player accounts are usable immediately and receive an account-specific recovery-key file. SMTP is only needed for the optional email-based password-reset flow; recovery-key login works without it.

## Production deployment

Deploy this as a Node web service, not as a static-only site:

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Node version: 22+

### Accounts must be on persistent storage

Every registered account, its scrypt password hash and its recovery-key hash — and the whole platform document: player progress, profiles, badges, tickets, messages, teams and the authored course overlay — live in one JSON file at `AUTH_DATA_FILE` (default `.data/accounts.json`). Nothing of it is kept in the browser any more; localStorage is only an offline cache, which is what lets one player see another's progress and lets a player return on a different device. The container filesystem is discarded on every deploy, so **if that path is not a mounted volume, every credential is lost on redeploy** and nobody can sign in any more.

The repo ships the deployment config that gets this right:

- `Dockerfile` — multi-stage build, non-root, `AUTH_DATA_FILE=/var/data/accounts.json`, `/api/health` healthcheck.
- `docker-compose.yml` — mounts the named volume `gamehack-accounts` at `/var/data`. A named volume survives `docker compose down`, rebuilds and redeploys; an anonymous volume or a bind mount into the repo does not.
- `render.yaml` — Render blueprint with a 1 GB disk at `/var/data`. Note that Render disks need a paid plan and can be mounted by only one instance.
- `fly.toml` — Fly.io config with a `gamehack_accounts` volume. Create it before the first deploy: `fly volumes create gamehack_accounts --size 1 --region ams`. A Fly volume is attached to one machine, so the app must stay at a single process.
- Railway: no extra file needed — it reads the `Dockerfile`. Attach a volume and mount it at `/var/data`.

On boot the server logs where the store resolved to, how many accounts it found, and whether the directory is writable. It warns loudly when the store is empty or when `AUTH_DATA_FILE` is unset and therefore inside the image layer. `GET /api/health` reports the same facts as JSON:

```json
{ "ok": true, "persistence": { "path": "/var/data/accounts.json", "writable": true, "persisted": true, "accounts": 12 }, "stableSessions": true }
```

`npm run test:persistence` proves the behaviour: it registers an account, kills the server, boots a fresh one against the same store path and requires the same password and recovery key to still work — then repeats against an unattached path and requires the login to fail, which is the reported bug.

The JSON store contains scrypt password hashes and hashes of recovery keys and expiring password-reset tokens; plaintext recovery keys are returned only when the key file is created or rotated. Never commit `.data/`.

### Environment variables

Configure these in the hosting dashboard; do not commit real credentials:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM` (must be an address/name authorized by the SMTP provider)
- `APP_ORIGIN` (the public HTTPS origin used in password-reset links)
- `AUTH_SESSION_SECRET` (a long random secret — without it every restart logs everyone out)
- `AUTH_DATA_FILE` (place this on persistent storage, for example `/var/data/accounts.json`)
- `EDUCATOR_EMAILS` (comma-separated addresses allowed to publish the shared collections — tickets, messages, teams and the course overlay; the two demo logins are provisioned on boot, and `educator@ionio.gr` already carries the role)

### What still lives in the browser

Learning progress, XP, badges, teams and the rest of the app data are stored in each user's browser localStorage, keyed per origin. Persisting the account store keeps credentials working across a redeploy, but progress does not follow a user to a new browser or a new origin. Use the profile's "Your data" download and the educator dashboard's import to move it.

For now, public registration activates @ionio.gr player accounts immediately without sending email. Users can sign in without a password using their recovery-key file, change their password in Profile, and rotate/download a replacement key there (which invalidates the previous file). Email-based password-reset links expire after one hour when SMTP is configured. Educator access remains limited to existing/demo educator accounts.
