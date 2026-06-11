import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  href: string;
  accent?: "blue" | "sky" | "green" | "amber";
  className?: string;
}

const ACCENT_STYLES = {
  blue: "from-sky-500/15 to-sky-500/5 text-sky-700 dark:text-sky-400",
  sky: "from-sky-500/15 to-sky-500/5 text-sky-700 dark:text-sky-400",
  green: "from-emerald-500/15 to-emerald-500/5 text-emerald-700 dark:text-emerald-400",
  amber: "from-orange-500/15 to-orange-500/5 text-orange-700 dark:text-orange-400",
};

export function StatCard({ label, value, icon: Icon, href, accent = "blue", className }: StatCardProps) {
  return (
    <Link href={href} className={cn("group block", className)}>
      <div className="interactive-card relative overflow-hidden p-4 sm:p-6">
        <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className={cn("mb-4 inline-flex rounded-xl bg-gradient-to-br p-3", ACCENT_STYLES[accent])}>
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</p>
      </div>
    </Link>
  );
}
