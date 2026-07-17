# Rentaly — Property & Tenant Management System

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · Convex · Convex Auth · Convex file storage

## Setup

```bash
bun install
npx convex dev
```

`npx convex dev` provisions your Convex deployment, generates `convex/_generated/`, and prints `NEXT_PUBLIC_CONVEX_URL` / `CONVEX_DEPLOYMENT`. Copy `.env.local.example` to `.env.local` and fill those in (plus `NEXT_PUBLIC_CONVEX_SITE_URL`, same deployment but `.convex.site` instead of `.convex.cloud`):

```bash
cp .env.local.example .env.local
```

### Auth setup (one-time, per deployment)

Convex Auth needs three things beyond the code itself:

1. **`SITE_URL`** on your Convex deployment:
   ```bash
   npx convex env set SITE_URL http://localhost:3000
   ```
2. **A signing key pair** (`JWT_PRIVATE_KEY` + `JWKS`), generated locally and set as Convex env vars — either via the Convex dashboard (**Settings → Environment Variables**) or `npx convex env set`:
   ```bash
   node -e "import('jose').then(async({exportJWK,exportPKCS8,generateKeyPair})=>{const k=await generateKeyPair('RS256',{extractable:true});const priv=await exportPKCS8(k.privateKey);const pub=await exportJWK(k.publicKey);console.log('JWT_PRIVATE_KEY='+JSON.stringify(priv.trimEnd().replace(/\n/g,' ')));console.log('JWKS='+JSON.stringify({keys:[{use:'sig',...pub}]}));})"
   ```
   Generate a **fresh** pair for any real production deployment — don't reuse local/dev keys.
3. **`convex/http.ts` and `convex/auth.config.ts` must exist** — they register Convex Auth's HTTP routes and tell Convex which token issuer to trust. Both are already in this repo; if sign-in ever starts failing with `AuthProviderDiscoveryFailed` or 404s on `/api/auth`, check these two files exist and `npx convex dev` is actually running.

Then:

```bash
bun run dev
```

### Provisioning the first Admin

Admin has no self-signup path (by design — anyone signing up can only pick Owner, Tenant, or Manager). To get your first admin:
1. Sign up normally as anyone.
2. Convex dashboard → `users` table → edit that row's `role` to `"admin"`.
3. From then on, promote/demote everyone else from **Admin → Users** in the app itself.

## Design system

Vibrant indigo/violet/emerald palette (`tailwind.config.ts`), Plus Jakarta Sans for headings, Inter for body text. Colors/components are named generically (`brass` = primary indigo accent, `forest`/`amber`/`rust` = success/warning/danger) - the names are legacy from an earlier design pass, only the values changed, so don't read into the naming.

## Build order this was built in
Auth/Users -> Properties -> Leases -> Payments -> Maintenance -> Notifications -> Reporting -> Admin console -> design pass -> bug-fix/polish pass.