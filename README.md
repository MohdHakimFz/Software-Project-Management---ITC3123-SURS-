# SURS — Smart University Registration System

> **ITC3123 Software Project Management** · Universiti Poly-Tech Malaysia (UPTM)

A full-stack web application that digitises the student registration lifecycle — from account creation and course enrollment to **Stripe Test Mode** fee payment, receipt generation, and timetable management.

**Live demo:** [surs-uptm.vercel.app](https://surs-uptm.vercel.app) *(update after Vercel deploy)*

---

## Overview

SURS replaces manual, fragmented registration at UPTM with a single platform covering:

- Student self-registration across FABA, FCOM, FESSH, IPS & IGS programmes
- Real-time course enrollment with seat availability
- Semester fee payment (tuition + registration + resource fees)
- Academic timetable with conflict detection
- Role-based dashboards for **Student**, **Staff**, **Lecturer**, and **Admin**

> Enrollment is only **confirmed** after successful payment. Unpaid enrollments are auto-cancelled after 3 days.

---

## Team

| Name | Role |
|------|------|
| Mohd Hakim bin Mohd Fauzi | Project Manager |
| Aijaz bin Khairuddin | System Analyst |
| Muhammad Nureel Aqqwa bin Hisham | Frontend Developer |
| Erfan Danish bin Erwan | Backend Developer |

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Next.js API Routes, Supabase Auth |
| **Database** | PostgreSQL 15 (Supabase) |
| **Payments** | Stripe (Test Mode only) |
| **Deployment** | Vercel + Supabase |

---

## Features

### Student
- Browse & enroll in courses · track `pending` → `paid` → `confirmed`
- Fee summary · Stripe checkout · PDF receipt
- Personal timetable with conflict warnings

### Staff (Registrar)
- Manage students & enrollments · add/edit courses
- Set capacity, deadlines & fee structures

### Lecturer
- View assigned courses · student rosters · personal timetable

### Admin
- User management · academic calendar config · reports & CSV export

---

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com/) project
- [Stripe](https://stripe.com/) account (Test Mode)

### 1. Clone & install

```bash
git clone https://github.com/MohdHakimFz/Software-Project-Management---ITC3123-SURS-.git
cd Software-Project-Management---ITC3123-SURS-
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your keys:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (local) |

> **Never commit `.env.local`** — it is listed in `.gitignore`.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Windows tip:** if you see `MODULE_NOT_FOUND` or random 404/500 errors:

```bash
npm run dev:clean
```

---

## Demo Accounts

On the login page, expand **Demo accounts (presentation)** to auto-fill credentials:

| Role | Email | Password |
|------|-------|----------|
| Student | `student@uptm.edu.my` | `Student@123` |
| Staff | `staff@uptm.edu.my` | `Staff@123` |
| Lecturer | `lecturer@uptm.edu.my` | `Lecturer@123` |
| Admin | `admin@uptm.edu.my` | `Admin@123` |

**Stripe test card:** `4242 4242 4242 4242` · any future expiry · any CVC

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run dev:clean` | Clear `.next` cache + start dev (fixes Windows cache issues) |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |

---

## Deployment (Vercel)

1. Import this repo on [Vercel](https://vercel.com/)
2. Add all environment variables from `.env.example` (use production URL for `NEXT_PUBLIC_APP_URL`)
3. Deploy
4. Add Stripe webhook: `https://your-domain.vercel.app/api/payment/webhook` → event `checkout.session.completed`

---

## Security

- All secrets loaded via environment variables (`lib/env.ts`)
- Live Stripe keys (`sk_live_`) blocked in production builds
- Row-Level Security (RLS) on all Supabase tables
- Security headers configured in `next.config.mjs`
- `.env.local` excluded from version control

---

## Documentation

For full project documentation — database schema, payment flow, migrations, and scope — see **[SURS.md](./SURS.md)**.

---

## License

Academic project — ITC3123, Universiti Poly-Tech Malaysia © 2026
