import Link from "next/link";
import { ArrowLeft, GraduationCap, Shield, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Logo } from "@/components/shared/logo";
import { AuthBrandBackground } from "@/components/auth/auth-brand-background";
import { AuthActivityTicker } from "@/components/auth/auth-activity-ticker";
import { AuthFormBackground } from "@/components/auth/auth-form-background";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

function BackHomeLink({ variant = "light" }: { variant?: "light" | "default" }) {
  const isLight = variant === "light";

  return (
    <Link
      href="/"
      className={
        isLight
          ? "group inline-flex h-9 items-center gap-2 rounded-full border border-white/20 bg-white/10 pl-2.5 pr-4 text-sm font-medium text-white/90 backdrop-blur-sm transition-all hover:border-sky-400/50 hover:bg-white/15"
          : "group inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card pl-2.5 pr-4 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
      }
    >
      <span
        className={
          isLight
            ? "flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sky-300 transition-colors group-hover:bg-sky-400/20"
            : "flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20"
        }
      >
        <ArrowLeft className="h-3.5 w-3.5" />
      </span>
      Laman Utama
    </Link>
  );
}

const FEATURES = [
  { icon: Zap, text: "Real-time seat tracking", color: "text-sky-300" },
  { icon: Shield, text: "Secure Stripe payments", color: "text-emerald-300" },
  { icon: GraduationCap, text: "Auto timetable & conflicts", color: "text-amber-200" },
];

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-app">
      <header className="safe-top absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="hidden lg:block">
          <BackHomeLink variant="light" />
        </div>
        <div className="lg:hidden">
          <BackHomeLink variant="default" />
        </div>
        <ThemeToggle />
      </header>

      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-uptm-blue via-[#003d7a] to-[#001528] lg:flex lg:flex-col lg:justify-between lg:p-12 lg:pt-16">
        <AuthBrandBackground />

        <div className="relative flex flex-1 flex-col gap-10 lg:gap-14">
          <div className="animate-fade-in">
            <Logo
              size="lg"
              textClassName="text-xl text-white"
              subtitleClassName="text-xs text-white/60"
            />
          </div>

          <div className="max-w-lg animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Semester 2026/1 — Registration open
          </div>

          <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-white xl:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-white/70">{subtitle}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {FEATURES.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/85 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                {item.text}
              </div>
            ))}
          </div>

          <AuthActivityTicker />

          <div className="mt-8 flex gap-8 border-t border-white/10 pt-6">
            {[
              { val: "2.4k+", label: "Students" },
              { val: "40+", label: "Courses" },
              { val: "5", label: "Faculties" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-sky-200">{s.val}</p>
                <p className="text-[10px] uppercase tracking-wider text-white/45">{s.label}</p>
              </div>
            ))}
          </div>
          </div>
        </div>

        <p className="relative shrink-0 text-xs text-white/40">© 2026 Universiti Poly-Tech Malaysia</p>
      </div>

      {/* Form panel */}
      <div className="safe-bottom relative flex min-h-app flex-1 flex-col overflow-hidden pt-14">
        <AuthFormBackground />
        <div className="relative flex w-full flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-6 w-full max-w-xl lg:hidden">
            <Logo
              textClassName="text-xl text-uptm-blue dark:text-foreground"
              subtitleClassName="text-muted-foreground"
            />
          </div>
          <div className="animate-fade-in-up w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
