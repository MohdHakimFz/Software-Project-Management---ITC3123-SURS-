import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RegistrationDemo } from "@/components/landing/registration-demo";
import { CourseMarquee } from "@/components/landing/course-marquee";
import { CountdownBanner } from "@/components/landing/countdown-banner";
import { RoleTabs } from "@/components/landing/role-tabs";
import { FaqSection } from "@/components/landing/faq-section";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { HeroBackground } from "@/components/landing/hero-background";
import { MobileNav } from "@/components/landing/mobile-nav";
import { ArrowRight, MapPin } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#002244] dark:bg-[#000d1a]">
        <HeroBackground />

        <header className="safe-top relative z-10 border-b border-white/10">
          <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
            <Logo
              subtitle="UPTM · ITC3123"
              textClassName="text-white"
              subtitleClassName="hidden text-white/50 min-[400px]:block"
              className="min-w-0"
            />
            <nav className="hidden items-center gap-6 text-sm text-white/60 md:flex">
              <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
              <a href="#portals" className="transition-colors hover:text-white">Portals</a>
              <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
            </nav>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <MobileNav />
              <ThemeToggle variant="on-dark" />
              <Button asChild size="sm" variant="ghost" className="px-2 text-white/80 hover:bg-white/10 hover:text-white sm:px-3">
                <Link href="/login">
                  <span className="hidden min-[380px]:inline">Log masuk</span>
                  <span className="min-[380px]:hidden">Login</span>
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-white px-2 font-semibold text-uptm-blue hover:bg-white/90 sm:px-4">
                <Link href="/register">Daftar</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="relative z-10 container mx-auto grid items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
          <div>
            <CountdownBanner />

            <h1 className="mt-6 text-3xl font-black leading-[1.1] tracking-tight text-white sm:mt-8 sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              Daftar kursus.
              <br />
              Bayar yuran.
              <br />
              <span className="text-blue-200">Satu platform.</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-white/65">
              SURS replaces manual registration at UPTM — enroll across FABA, FCOM, FESSH, IPS and IGS programmes,
              pay semester fees, and get your timetable without queuing at the registrar.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 bg-white px-7 font-bold text-uptm-blue hover:bg-white/90">
                <Link href="/register">
                  Mula Pendaftaran
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 border-white/25 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Log Masuk</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 border-t border-white/10 pt-8">
              {[
                { val: "30", label: "Programmes" },
                { val: "5", label: "Faculties" },
                { val: "40+", label: "Courses" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-blue-200">{s.val}</p>
                  <p className="text-xs text-white/45">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <RegistrationDemo />
          </div>
        </div>
      </section>

      <CourseMarquee />

      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-12 max-w-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Aliran Pendaftaran</p>
            <h2 className="mt-2 text-2xl font-black text-uptm-blue dark:text-foreground sm:text-3xl">From account to confirmed enrollment</h2>
            <p className="mt-3 text-muted-foreground">Four steps. Payment gates confirmation — that&apos;s the core rule of SURS.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-6 md:grid-rows-2">
            <div className="interactive-card step-card step-card--01 col-span-2 row-span-2 flex flex-col justify-between !bg-uptm-blue p-8 text-white md:col-span-2 dark:!bg-[#001a33]">
              <div>
                <p className="step-num text-6xl font-black text-white/20">01</p>
                <h3 className="mt-4 text-xl font-bold">Create Account</h3>
                <p className="mt-2 text-sm text-white/65">Register from Foundation to Postgraduate — accountancy, IT, education, business and more.</p>
              </div>
              <Link href="/register" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-blue-200 transition-gap hover:gap-2">
                Register now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="interactive-card step-card step-card--02 col-span-2 p-6 md:col-span-2">
              <p className="step-num text-3xl font-black text-slate-300 dark:text-slate-600">02</p>
              <h3 className="mt-2 font-bold text-uptm-blue dark:text-foreground">Enroll in Courses</h3>
              <p className="mt-1 text-sm text-muted-foreground">Real-time seat count. Conflict detection before you commit.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["ITC312", "CYS201", "ACC301"].map((c) => (
                  <span key={c} className="rounded-md bg-secondary px-2 py-1 text-xs font-mono font-semibold text-uptm-blue dark:text-blue-300">{c}</span>
                ))}
              </div>
            </div>

            <div className="interactive-card step-card step-card--03 col-span-2 bg-slate-50 p-6 dark:bg-slate-900/40 md:col-span-2">
              <p className="step-num text-3xl font-black text-slate-300 dark:text-slate-600">03</p>
              <h3 className="mt-2 font-bold text-uptm-blue dark:text-foreground">Pay Fees</h3>
              <p className="mt-1 text-sm text-muted-foreground">Tuition + registration + resource. Stripe test mode.</p>
              <p className="mt-3 font-mono text-lg font-bold text-uptm-blue dark:text-blue-300">
                ~RM 2,850<span className="text-sm font-normal text-muted-foreground"> / sem</span>
              </p>
            </div>

            <div className="interactive-card step-card step-card--04 col-span-4 flex items-center gap-6 p-6 md:col-span-4">
              <p className="step-num text-5xl font-black text-slate-300 dark:text-slate-600">04</p>
              <div>
                <h3 className="font-bold text-uptm-blue dark:text-foreground">Timetable Generated</h3>
                <p className="text-sm text-muted-foreground">Weekly schedule built from your confirmed enrollments. Conflicts flagged in red.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="portals" className="border-y border-border bg-card py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-10 max-w-lg">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Portal Akses</p>
            <h2 className="mt-2 text-2xl font-black text-uptm-blue dark:text-foreground sm:text-3xl">Built for every role</h2>
            <p className="mt-3 text-muted-foreground">Click each tab to see what students, staff, and admins can do.</p>
          </div>
          <RoleTabs />
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="container mx-auto grid gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Soalan Lazim</p>
            <h2 className="mt-2 text-2xl font-black text-uptm-blue dark:text-foreground sm:text-3xl">Got questions?</h2>
            <p className="mt-3 text-muted-foreground">Common questions from UPTM students about SURS registration.</p>
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Universiti Poly-Tech Malaysia</p>
                <p className="mt-0.5">ITC3123 Software Project Management — Final Project 2026</p>
              </div>
            </div>
          </div>
          <FaqSection />
        </div>
      </section>

      <section className="bg-uptm-blue py-16 dark:bg-[#001428]">
        <div className="container mx-auto flex flex-col items-start justify-between gap-8 px-4 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-black text-white sm:text-2xl md:text-3xl">Ready for Semester 2026/1?</h2>
            <p className="mt-2 text-slate-200">Create your account and start enrolling today.</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button asChild size="lg" className="h-12 bg-white font-bold text-uptm-blue hover:bg-white/90">
              <Link href="/register">Daftar Sekarang</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-white/40 bg-transparent px-7 text-white hover:bg-white/15 hover:text-white">
              <Link href="/login">Log Masuk</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-muted py-8">
        <div className="safe-bottom container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-2 text-sm text-muted-foreground sm:px-6 md:flex-row">
          <p>© 2026 UPTM — Team SURS (Hakim · Aijaz · Nureel · Erfan)</p>
          <p className="font-mono text-xs">ITC3123 · Extra Effort Contribution</p>
        </div>
      </footer>
    </div>
  );
}
