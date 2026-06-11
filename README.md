# Software Project Management — ITC3123 SURS

**SURS** (Smart University Registration System) — full-stack web app for UPTM student registration, course enrollment, fee payment (Stripe Test Mode), and academic scheduling.

## Tech stack

- Next.js 14 (App Router) · React · TypeScript · Tailwind CSS · shadcn/ui
- Supabase (Auth + PostgreSQL)
- Stripe (Test Mode)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your own keys — never commit .env.local
npm run dev
```

Use `npm run dev:clean` if the dev server shows cache errors on Windows.

## Documentation

See **[SURS.md](./SURS.md)** for features, database schema, demo accounts, and deployment.

## Team

ITC3123 — Universiti Poly-Tech Malaysia (UPTM)
