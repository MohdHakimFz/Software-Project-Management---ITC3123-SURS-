import { cn } from "@/lib/utils";

interface PageBannerProps {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageBanner({ title, subtitle, badge, className, children }: PageBannerProps) {
  return (
    <div
      className={cn(
        "relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-uptm-blue via-[#004080] to-[#001a33] p-5 text-white shadow-lg shadow-uptm-blue/20 sm:mb-8 sm:p-6 md:p-8",
        className
      )}
    >
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sky-500/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/5 blur-xl" />
      <div className="relative">
        {badge && (
          <span className="mb-3 inline-block rounded-full bg-sky-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
            {badge}
          </span>
        )}
        <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-sm text-white/80 md:text-base">{subtitle}</p>}
        {children && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}
