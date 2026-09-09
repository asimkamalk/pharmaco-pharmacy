# Deploy Pharmaco to Vercel + Neon

## 1. Create a Neon database

1. Sign up / sign in at [https://console.neon.tech](https://console.neon.tech)
2. Create a project (e.g. `pharmaco`)
3. Open **Connection details** and copy:
   - **Pooled** connection string → `DATABASE_URL` (hostname includes `-pooler`)
   - **Direct** connection string → `DIRECT_URL` (no `-pooler`)
4. Ensure both URLs include `?sslmode=require`

Paste both into local `.env` (see `.env.example`).

## 2. Push schema + seed admin

```bash
npm install
npx prisma db push
npm run db:seed
```

Admin login after seed:

- Email: `pharmacopharmacy24@gmail.com`
- Password: `Tryhard123`

## 3. Deploy on Vercel

1. Push this repo to GitHub (already: `asimkamalk/pharmaco-pharmacy`)
2. Go to [https://vercel.com/new](https://vercel.com/new) → Import that repo
3. Add **Environment Variables** (Production + Preview):

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon pooled URL |
| `DIRECT_URL` | Neon direct URL |
| `AUTH_SECRET` | long random string |
| `AUTH_URL` | `https://YOUR-PROJECT.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | same as `AUTH_URL` (or custom domain) |
| `ADMIN_EMAIL` | `pharmacopharmacy24@gmail.com` |
| `ADMIN_PASSWORD` | `Tryhard123` |

4. Deploy. The build runs `prisma generate && prisma db push && next build`.
5. After first deploy, run seed once against Neon (from your machine with Neon URLs in `.env`):

```bash
npm run db:seed
```

## 4. Optional: custom domain

Vercel → Project → Settings → Domains → add `pharmaco.pk` (or your domain), then update `AUTH_URL` and `NEXT_PUBLIC_SITE_URL`.

## Notes

- Local SQLite (`file:./dev.db`) is no longer used — Neon Postgres is required.
- Uploaded files are stored on disk locally. On Vercel the filesystem is ephemeral, so later add **Vercel Blob** if you need persistent prescription/product image uploads in production.
