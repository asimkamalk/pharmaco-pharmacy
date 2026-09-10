# DVAGO → Pharmaco catalog import

DVAGO product pages are client-rendered, so this importer uses DVAGO’s public
`AppAPIV3/GetProductByAlphabetV1` API (same data the website loads), then POSTs
each product to your production API. The script never touches your database URL.

## 1. Install deps (already in package.json if you pulled latest)

```bash
npm install
```

## 2. Set `ADMIN_SECRET_KEY`

Generate a secret:

```bash
openssl rand -base64 32
```

Add it to:

1. Local `.env` (for running the script):
   ```
   ADMIN_SECRET_KEY=paste-the-secret-here
   ```
2. Vercel → Project → Settings → Environment Variables → Production (+ Preview):
   - Key: `ADMIN_SECRET_KEY`
   - Value: same secret
3. Redeploy after adding the env var (or wait for the next git push).

## 3. Deploy the API routes

Push / deploy so these exist on production:

- `POST /api/admin/clear-catalog`
- `POST /api/admin/import-product`

Both require header: `x-api-secret: <ADMIN_SECRET_KEY>`

## 4. Clear existing catalog + import

Test with 20 products first:

```bash
# PowerShell
$env:ADMIN_SECRET_KEY="your-secret"
npx tsx scripts/import-dvago.ts --clear --limit=20
```

Full catalog (A–Z + 0–9, resumable via `scripts/progress.json`):

```bash
npx tsx scripts/import-dvago.ts --clear
# later / resume after interrupt:
npx tsx scripts/import-dvago.ts
```

Optional:

- `DELAY_MS=800` — pause between requests (default 400)
- `IMPORT_API_BASE=https://pharmaco-pharmacy.vercel.app`
- `--sitemap` — also log sitemap slug counts (coverage check)

## What gets imported

Per product: title, slug, price, brand, category, image URL, stock, prescription flag.
Purchase price is set to ~80% of sell price as a placeholder — adjust later in admin.
