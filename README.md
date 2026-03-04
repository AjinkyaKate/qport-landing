# QPort Cinematic Landing Page (Vite + React)

This is a standalone landing-page app built from your business docs and the v2.0 cinematic blueprint.

## Run Locally

```bash
cd qport-landing
npm install
npm run dev
```

Note: Vercel Serverless Functions in `api/` do not run under `vite dev`. To test the demo form locally, use Vercel CLI:

```bash
vercel dev
```

If you only need to test the demo form *UI/animations* (send -> success) under `vite dev`, add this to `.env.local`:

```bash
VITE_DEMO_MOCK=1
```

## Demo Request Form

The "Request a demo" form posts to `POST /api/demo-request`.

### Email (Resend)

Set these environment variables in Vercel (Project -> Settings -> Environment Variables) and redeploy:

- `RESEND_API_KEY` (required)
- `RESEND_FROM` (optional, defaults to `QPort <onboarding@resend.dev>`)
- `DEMO_TEAM_TO` (optional, defaults to `ajinkyakate2001@gmail.com`)

### Lead Persistence (Recommended)

To ensure demo requests are never lost (even if email delivery fails), attach a **Postgres database** to the project (recommended: **Neon** via Vercel integration) and create the table:

- SQL: `docs/demo_requests.sql`

## Notes

- The Business Intelligence layer is embedded at the top of `index.html` as a `<!-- BRAND BRAIN -->` comment.
- Animations respect `prefers-reduced-motion` (GSAP + Three.js motion is reduced or disabled).
