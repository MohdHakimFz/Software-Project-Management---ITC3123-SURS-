# 🎓 SURS — Smart University Registration System

> A full-stack web application for managing student registration, course enrollment, fee payment, and academic scheduling at Universiti Poly-Tech Malaysia (UPTM).

---

## 📋 Project Information

| Field | Details |
|-------|---------|
| **System Name** | Smart University Registration System (SURS) |
| **Course** | Software Project Management (ITC3123) |
| **Institution** | Universiti Poly-Tech Malaysia (UPTM) |
| **Submission Date** | 19th June 2026 |
| **Project Type** | Extra Effort Contribution — Full Web Application |

---

## 👥 Team Members

| Name | Role | Responsibility |
|------|------|---------------|
| Mohd Hakim bin Mohd Fauzi | Project Manager | Project setup, Supabase schema, deployment |
| Aijaz bin Khairuddin | System Analyst | Auth + student registration flows |
| Muhammad Nureel Aqqwa bin Hisham | Frontend Developer | All UI pages — dashboards, enrollment, timetable |
| Erfan Danish bin Erwan | Backend Developer | API routes, payment logic, admin panel, reports |

---

## 📝 Description

SURS is a web-based platform designed to automate and centralise the entire student registration lifecycle at UPTM. It replaces manual and fragmented registration processes with a structured digital workflow that covers:

- Student account registration and profile management
- Programme and course enrollment with real-time seat availability
- Online fee payment via **Stripe Test Mode** (tuition, registration, and resource fees)
- Academic timetable generation and conflict detection
- Administrative dashboard for registrar staff and lecturers
- In-app success feedback and payment receipts
- Reporting and data export features for management

The system supports four user roles: **Student**, **Staff (Registrar)**, **Lecturer**, and **Admin**, each with their own dedicated dashboard and access controls.

> **Note:** Payment is a core business rule in SURS — enrollment is only **confirmed** after successful fee payment. Unpaid enrollments are automatically cancelled after 3 days.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 14 (App Router) | Full-stack React framework |
| [React](https://react.dev/) | 18 | UI component library |
| [Tailwind CSS](https://tailwindcss.com/) | 3 | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Latest | Pre-built accessible UI components |
| [Lucide React](https://lucide.dev/) | Latest | Icon library |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | 14 | Server-side API endpoints |
| [Supabase](https://supabase.com/) | Latest | Backend-as-a-Service (Auth + Database + Storage) |
| [Stripe](https://stripe.com/) | Latest | Payment gateway (Test Mode) |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| [PostgreSQL](https://www.postgresql.org/) | 15 (via Supabase) | Primary relational database |

### Authentication
| Technology | Purpose |
|------------|---------|
| [Supabase Auth](https://supabase.com/docs/guides/auth) | User authentication, session management, role-based access |

### Deployment
| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com/) | Frontend + API deployment |
| [Supabase](https://supabase.com/) | Hosted PostgreSQL database |

---

## 🚀 Deployment

| Environment | URL |
|-------------|-----|
| **Production** | `https://surs-uptm.vercel.app` *(update after deploy)* |
| **Supabase Dashboard** | `https://supabase.com/dashboard` |
| **Stripe Dashboard** | `https://dashboard.stripe.com/test` |

---

## ✨ Features

### 🔐 Authentication & Access Control
- [x] Student self-registration with email verification
- [x] Login / logout with session management
- [x] Role-based access control (Student / Staff / Lecturer / Admin)
- [x] Demo accounts panel on login (presentation mode)
- [x] Password reset via email
- [x] Protected routes per role

### 👨‍🎓 Student Portal
- [x] Student profile management (personal info, programme)
- [x] Browse available courses with real-time seat availability
- [x] Course enrollment and drop functionality
- [x] Enrollment status tracking (`pending` → `paid` → `confirmed`)
- [x] Academic timetable view with conflict detection
- [x] Fee summary and payment status
- [x] Payment confirmation page with downloadable receipt (PDF)

### 💳 Fee Payment Module
- [x] Automatic fee calculation based on enrolled courses
- [x] Fee breakdown — Tuition + Registration + Resource fees
- [x] **Stripe Test Mode** payment integration with on-screen test-mode banner
- [x] Payment receipt generation (PDF)
- [x] Payment history and status tracking
- [x] Auto-cancel unpaid enrollments after 3 days

### 🗓️ Timetable Module
- [x] Auto-generated timetable based on enrolled courses
- [x] Conflict detection (overlapping class times)
- [x] Weekly calendar view

### 🏢 Staff / Registrar Dashboard
- [x] View and manage all student registrations
- [x] Approve or reject enrollment requests
- [x] Manage course listings (add, edit, deactivate)
- [x] Set enrollment deadlines and seat limits

### 👨‍🏫 Lecturer Portal
- [x] View assigned courses and student rosters
- [x] Personal timetable view

### ⚙️ Admin Dashboard
- [x] Full user management (students, staff)
- [x] System configuration (academic calendar, fee structure)
- [x] Reports and data export (CSV)
- [x] Audit logs

### 🔒 Security & Compliance
- [x] PDPA 2010 compliant data handling
- [x] Row-Level Security (RLS) on all Supabase tables
- [x] HTTPS enforced on all routes
- [x] Input validation and sanitisation

---

## 💳 Payment Flow

The payment module handles **semester fee collection** from students upon course enrollment.

### Fee Structure

| Fee Type | Description | Amount (Example) |
|----------|-------------|-----------------|
| **Tuition Fee** | RM 150 × total credit hours enrolled | RM 150 × 18 = RM 2,700 |
| **Registration Fee** | Fixed per-semester administrative fee | RM 50 |
| **Resource Fee** | Lab, library, and IT access | RM 100 |
| **Total Semester Fee** | Sum of all fees above | ~RM 2,850 |

### Payment Status

| Status | Meaning |
|--------|---------|
| `pending` | Student enrolled but payment not yet made |
| `paid` | Payment successful — enrollment confirmed |
| `failed` | Payment attempt failed — student must retry |
| `refunded` | Student dropped course after payment |
| `cancelled` | Enrollment cancelled due to non-payment after 3 days |

### Payment Flow Diagram

```
Student selects courses to enroll
            ↓
System calculates total semester fee
(Tuition + Registration + Resource)
            ↓
Student clicks "Proceed to Payment"
            ↓
Stripe Checkout page loads
(Test card: 4242 4242 4242 4242)
            ↓
     Payment successful?
        ↙         ↘
      YES           NO
       ↓             ↓
Enrollment        Status = failed
confirmed         Student retries
Status = paid
Timetable auto-generated
Email receipt sent
```

### Stripe Test Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Payment success |
| `4000 0000 0000 0002` | Payment declined |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |

> Use any future expiry date, any 3-digit CVC, and any 5-digit ZIP code.

---

## 🗄️ Database Schema

### Tables Overview

| Table | Description |
|-------|-------------|
| `profiles` | Extended user profiles linked to Supabase Auth |
| `programmes` | Academic programmes offered by UPTM |
| `courses` | Individual courses with credits, capacity, schedule |
| `enrollments` | Student course enrollment records |
| `timetables` | Generated timetable slots per course |
| `fee_structures` | Fee configuration per programme (tuition rate, registration, resource) |
| `payments` | Stripe payment transaction records |
| `notifications` | Reserved for future in-app notifications (schema only) |
| `audit_logs` | System-level activity logs |

> Full schema with SQL migration scripts available in `/supabase/migrations/`

---

## 📁 Project Structure

```
surs/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, register, reset)
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (student)/                # Student portal pages
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── enrollment/
│   │   ├── timetable/
│   │   ├── fees/
│   │   │   ├── page.tsx          # Fee summary page
│   │   │   └── payment/          # Stripe checkout
│   │   └── notifications/
│   ├── (staff)/                  # Staff/Registrar pages
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── courses/
│   │   └── notifications/
│   ├── (admin)/                  # Admin pages
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── config/
│   │   └── reports/
│   ├── api/                      # Next.js API routes
│   │   ├── enrollment/
│   │   ├── payment/
│   │   │   ├── create-session/   # Stripe checkout session
│   │   │   └── webhook/          # Stripe webhook handler
│   │   ├── timetable/
│   │   └── notifications/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable UI components
│   ├── ui/                       # shadcn/ui base components
│   ├── auth/                     # Auth-related components
│   ├── dashboard/                # Dashboard widgets
│   ├── enrollment/               # Enrollment components
│   ├── payment/                  # Stripe payment components
│   ├── timetable/                # Timetable components
│   └── shared/                   # Shared layout components
├── lib/                          # Utility functions
│   ├── supabase/                 # Supabase client setup
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server client
│   ├── stripe.ts                 # Stripe client setup
│   ├── utils.ts                  # General utilities
│   └── validations.ts            # Zod validation schemas
├── types/                        # TypeScript type definitions
│   └── database.ts               # Supabase generated types
├── supabase/                     # Supabase config
│   └── migrations/               # SQL migration files
├── public/                       # Static assets
│   └── uptm-logo.png
├── .env.local                    # Environment variables (not committed)
├── .env.example                  # Environment variables template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier)
- Stripe account (free — test mode only)
- Vercel account (for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/surs-uptm.git
cd surs-uptm
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env.local
```

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Supabase Database

```bash
npx supabase db push
```

Or manually run each `.sql` file in the Supabase SQL Editor.

### 5. Set Up Stripe Webhook (Local)

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/payment/webhook
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Add all environment variables (same as `.env.local`)
4. Click **Deploy**

### 3. Set Up Stripe Webhook (Production)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://surs-uptm.vercel.app/api/payment/webhook`
3. Select event: `checkout.session.completed`
4. Copy the webhook secret → update `STRIPE_WEBHOOK_SECRET` in Vercel

---

## 🧪 Test Accounts

After running migrations and seed data. On the login page, expand **Demo accounts (presentation)** to auto-fill credentials:

| Role | Email | Password | Portal |
|------|-------|----------|--------|
| Admin | `admin@uptm.edu.my` | `Admin@123` | `/admin/*` |
| Staff (Registrar) | `staff@uptm.edu.my` | `Staff@123` | `/staff/*` — manages courses & students |
| Lecturer | `lecturer@uptm.edu.my` | `Lecturer@123` | `/lecturer/*` — my courses, roster, timetable only |
| Student | `student@uptm.edu.my` | `Student@123` | `/student/*` |

After creating `lecturer@uptm.edu.my` in Auth, run `014_lecturer_test_accounts.sql` in Supabase SQL Editor.

---

## 📊 Project Scope

### ✅ In Scope
- Student account registration and profile management
- Programme and course enrollment with real-time seat availability
- Online fee payment via Stripe Test Mode (tuition, registration, resource fees)
- Academic timetable generation and conflict detection
- Administrative dashboard for registrar staff and lecturers
- Basic reporting and data export features

### ❌ Out of Scope
- Mobile application (React Native) — web responsive only
- Learning Management System (LMS) features
- Library management or hostel booking integrations
- Integration with third-party academic accreditation bodies
- Legacy data migration from previous manual records
- Real money / live payment processing

---

## 🔗 Related Documents

| Document | Description |
|----------|-------------|
| `SURS_ITC3123_FULL_REPORT.docx` | Full Software Project Management Documentation (Parts A–E) |
| `SURS_ITC3123_PartD.docx` | Gantt Chart + PERT Network Diagram |
| `SURS_ITC3123_PartE.docx` | Risk Register + Risk Matrix |

---

## 📄 License

This project is developed for academic purposes as part of ITC3123 Software Project Management at Universiti Poly-Tech Malaysia (UPTM). All rights reserved © 2026.

---

<div align="center">
  <p>Built with ❤️ by Team SURS — UPTM 2026</p>
  <p><strong>Mohd Hakim</strong> · <strong>Aijaz</strong> · <strong>Nureel Aqqwa</strong> · <strong>Erfan Danish</strong></p>
</div>
