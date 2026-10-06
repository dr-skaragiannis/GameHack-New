# HACKFORGE

## Local development

Use Node.js 22 or newer. Copy `.env.example` to `.env`, then set SMTP values from a verified sender account. Start the API and Vite together with:

```sh
npm ci
npm run dev
```

Vite serves the app on port 5173 and proxies `/api` requests to the local authentication API on port 3001. Registration and password recovery require a working SMTP configuration.

## Production deployment

Deploy this as a Node web service, not as a static-only site:

- Build command: `npm ci && npm run build`
- Start command: `npm start`
- Node version: 22+

Configure these environment variables in the hosting dashboard; do not commit real credentials:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM` (must be an address/name authorized by the SMTP provider)
- `APP_ORIGIN` (the public HTTPS origin used in activation and password-reset links)
- `AUTH_SESSION_SECRET` (a long random secret)
- `AUTH_DATA_FILE` (place this on persistent storage, for example `/var/data/accounts.json`)

The JSON account store contains scrypt password hashes and hashed, expiring activation/reset tokens. Attach persistent storage to the configured data path or account records will be lost when an ephemeral host restarts. Learning progress and the rest of the demo app data continue to be stored in each user's browser localStorage.

Activation links expire after 24 hours; password-reset links expire after one hour. Public registration creates player accounts only. Educator access remains limited to existing/demo educator accounts.
