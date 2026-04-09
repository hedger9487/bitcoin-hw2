# Bitcoin Treasury Ledger

`Bitcoin Treasury Ledger` is a DAT.co dashboard centered on Strategy's `Premium to NAV`, then extended into a fuller product with:

- bilingual UI: English / Traditional Chinese
- multiple DAT.co indicators: `Premium to NAV`, `mNAV`, `NAV per share`, `Sats per share`, `BTC treasury value`
- chart crosshair for precise hover inspection
- SEC filing timeline cards with direct source links
- optional AI summary through `/api/summary`
- Vercel-ready deployment config with automatic dataset regeneration on build

The visual direction follows [Design.md](/home/imlab306/smile/CCnoCC/bitcoin/Design.md): warm parchment surfaces, serif-led hierarchy, rounded cards, and editorial pacing.

## Setup guide

### 1. Install dependencies

```bash
npm install
```

If you want local data refresh, also install Python dependencies:

```bash
pip3 install -r requirements.txt
```

### 2. Create your local env file

Copy [`.env.local.example`](/home/imlab306/smile/CCnoCC/bitcoin/.env.local.example) to `.env.local`:

```bash
cp .env.local.example .env.local
```

You do **not** need to fill every variable.

Use this rule:

- Base dashboard only: fill nothing
- AI summary: fill `OPENAI_API_KEY`
- Local testing for the redeploy endpoint: fill `CRON_SECRET` and `VERCEL_DEPLOY_HOOK_URL`

The local dev server now reads `.env.local` automatically through [scripts/load-env.js](/home/imlab306/smile/CCnoCC/bitcoin/scripts/load-env.js).

### 3. Start local development

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

`npm run dev` tries to refresh the dataset automatically before starting the local server. If Python dependencies are not installed yet, it falls back to the bundled dataset so the site still opens.

## Environment variables

There are now two example files:

- [`.env.local.example`](/home/imlab306/smile/CCnoCC/bitcoin/.env.local.example): for local development
- [`.env.example`](/home/imlab306/smile/CCnoCC/bitcoin/.env.example): generic deployment reference

### `OPENAI_API_KEY`

Optional.

Needed only if you want the AI summary button to work.

How to get it:

1. Open the OpenAI API key page in your account settings.
2. Create a new secret key.
3. Copy it once and paste it into `.env.local` or your Vercel environment variables.

Example:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini
```

Official references:

- OpenAI Help Center: https://help.openai.com/en/articles/4936850-how-to-create-and-use-an-api-key
- OpenAI API auth reference: https://platform.openai.com/docs/api-reference/introduction/api-keys

Important:

- Never put this key in frontend JavaScript.
- Never commit `.env.local`.
- Keep it server-side only.

### `OPENAI_MODEL`

Optional.

Default is already `gpt-5-mini`, so you can usually leave this alone.

### `CRON_SECRET`

Optional.

Needed only if you want to protect [api/redeploy.js](/home/imlab306/smile/CCnoCC/bitcoin/api/redeploy.js) for automatic post-deploy refresh.

This is **not** something you get from a provider. You generate it yourself.

Good options:

```bash
openssl rand -hex 32
```

or

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Then paste the generated value into `.env.local` or Vercel:

```bash
CRON_SECRET=your_random_secret_here
```

### `VERCEL_DEPLOY_HOOK_URL`

Optional.

Needed only if you want the deployed site to refresh automatically by triggering a new deployment.

How to get it:

1. Open your project in Vercel.
2. Go to `Settings`.
3. Open the `Git` section.
4. Find `Deploy Hooks`.
5. Create a new hook for the branch you deploy from.
6. Copy the generated URL and store it in `VERCEL_DEPLOY_HOOK_URL`.

Example:

```bash
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
```

Official reference:

- Vercel Deploy Hooks: https://vercel.com/docs/deploy-hooks

## Data refresh behavior

You do **not** need to refresh data manually every time.

- Local development: `npm run dev` attempts a refresh automatically.
- Manual refresh remains available with `npm run refresh:data`.
- Vercel deployments: `npm run build` regenerates the dataset automatically during the build.
- Optional daily refresh after deployment: a Vercel Cron Job can trigger a redeploy once per day, and that redeploy rebuilds the dataset.

If you want to refresh manually:

```bash
npm run refresh:data
```

## Do I need a backend?

For the assignment itself, **no traditional backend is required**.

The core dashboard works as a static site because the generated dataset is stored in [assets/data/strategy-premium-nav.json](/home/imlab306/smile/CCnoCC/bitcoin/assets/data/strategy-premium-nav.json).

You only need lightweight serverless functions for optional upgrades:

- [api/summary.js](/home/imlab306/smile/CCnoCC/bitcoin/api/summary.js): AI-generated summary
- [api/redeploy.js](/home/imlab306/smile/CCnoCC/bitcoin/api/redeploy.js): optional daily auto-refresh by triggering a new Vercel deployment

So the short version is:

- no backend needed for the base product
- tiny serverless backend only if you want AI or automatic post-deploy refresh

## Vercel deployment

This repository now includes [vercel.json](/home/imlab306/smile/CCnoCC/bitcoin/vercel.json).

### Standard deployment

1. Import the project into Vercel.
2. Keep the root directory as this folder.
3. Add environment variables in the Vercel dashboard if you need AI or auto-refresh.
4. Vercel will run:

```text
buildCommand: npm run build
```

That build command installs Python requirements and regenerates the dataset automatically.

### Vercel environment variables

Set these in `Project Settings` -> `Environment Variables`:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
CRON_SECRET=
VERCEL_DEPLOY_HOOK_URL=
```

### Daily auto-refresh on Vercel

If you want the deployed site to refresh itself once per day without manual redeploys:

1. Create a Vercel Deploy Hook for the project.
2. Copy the hook URL into `VERCEL_DEPLOY_HOOK_URL`.
3. Generate a random `CRON_SECRET`.
4. Add the cron block from [vercel.cron.example.json](/home/imlab306/smile/CCnoCC/bitcoin/vercel.cron.example.json) into your Vercel config.

Flow:

1. Vercel Cron calls `/api/redeploy` once per day.
2. `/api/redeploy` validates `CRON_SECRET`.
3. The function triggers a new deployment through the Deploy Hook.
4. The new deployment runs `npm run build`.
5. `npm run build` regenerates the dataset.

Official references:

- Vercel Deploy Hooks: https://vercel.com/docs/deploy-hooks
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
- Managing Vercel Cron Jobs and `CRON_SECRET`: https://vercel.com/docs/cron-jobs/manage-cron-jobs

This keeps the public site mostly static while still refreshing data automatically.

## Project structure

- [index.html](/home/imlab306/smile/CCnoCC/bitcoin/index.html): app shell and layout
- [server.js](/home/imlab306/smile/CCnoCC/bitcoin/server.js): local dev server for static files and API routes
- [vercel.json](/home/imlab306/smile/CCnoCC/bitcoin/vercel.json): Vercel deployment config
- [vercel.cron.example.json](/home/imlab306/smile/CCnoCC/bitcoin/vercel.cron.example.json): optional daily redeploy example
- [assets/css/main.css](/home/imlab306/smile/CCnoCC/bitcoin/assets/css/main.css): design system and responsive styles
- [assets/js/main.js](/home/imlab306/smile/CCnoCC/bitcoin/assets/js/main.js): app state, rendering, i18n switching
- [assets/js/insights.js](/home/imlab306/smile/CCnoCC/bitcoin/assets/js/insights.js): DAT.co indicator definitions, narrative builders, report helpers
- [assets/js/charts.js](/home/imlab306/smile/CCnoCC/bitcoin/assets/js/charts.js): Chart.js rendering and crosshair plugin
- [assets/js/i18n.js](/home/imlab306/smile/CCnoCC/bitcoin/assets/js/i18n.js): English / Traditional Chinese copy
- [assets/data/strategy-premium-nav.json](/home/imlab306/smile/CCnoCC/bitcoin/assets/data/strategy-premium-nav.json): generated dataset
- [scripts/generate_dataset.py](/home/imlab306/smile/CCnoCC/bitcoin/scripts/generate_dataset.py): SEC + market-data pipeline
- [scripts/dev.js](/home/imlab306/smile/CCnoCC/bitcoin/scripts/dev.js): local auto-refresh bootstrap
- [scripts/load-env.js](/home/imlab306/smile/CCnoCC/bitcoin/scripts/load-env.js): local `.env.local` loader
- [REPORT.md](/home/imlab306/smile/CCnoCC/bitcoin/REPORT.md): final assignment report draft

## Notes

- The assignment's formal selected indicator remains `Premium to NAV`.
- The extra indicator choices are product upgrades, not a change of the report's official selected indicator.
- `.env.local` is ignored by [`.gitignore`](/home/imlab306/smile/CCnoCC/bitcoin/.gitignore).
- The project is structured to deploy cleanly to Vercel with or without the optional serverless upgrades.
