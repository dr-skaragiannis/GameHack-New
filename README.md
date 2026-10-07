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

Configure these environment variables in the hosting dashboard; do not commit real credentials:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM` (must be an address/name authorized by the SMTP provider)
- `APP_ORIGIN` (the public HTTPS origin used in password-reset links)
- `AUTH_SESSION_SECRET` (a long random secret)
- `AUTH_DATA_FILE` (place this on persistent storage, for example `/var/data/accounts.json`)

The JSON account store contains scrypt password hashes and hashes of recovery keys and expiring password-reset tokens; plaintext recovery keys are returned only when the key file is created or rotated. Attach persistent storage to the configured data path or account records will be lost when an ephemeral host restarts. Learning progress and the rest of the demo app data continue to be stored in each user's browser localStorage.

For now, public registration activates @ionio.gr player accounts immediately without sending email. Users can sign in without a password using their recovery-key file, change their password in Profile, and rotate/download a replacement key there (which invalidates the previous file). Email-based password-reset links expire after one hour when SMTP is configured. Educator access remains limited to existing/demo educator accounts.
