import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  subtitle?: string;
  href?: string;
  className?: string;
  textClassName?: string;
  subtitleClassName?: string;
}

const SIZES = {
  sm: 32,
  md: 36,
  lg: 48,
} as const;

export function LogoMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 rounded-lg shadow-sm"
      aria-hidden
    >
      <rect width="48" height="48" rx="10" fill="#003366" />
      <path
        d="M30 14C30 14 26 12 20 14C14 16 14 20 18 22C22 24 28 23 28 26C28 29 24 31 18 29"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="24" cy="34" r="2" fill="#60A5FA" />
    </svg>
  );
}

export function Logo({
  size = "md",
  showText = true,
  subtitle = "UPTM Registration",
  href = "/",
  className,
  textClassName,
  subtitleClassName,
}: LogoProps) {
  const px = SIZES[size];

  const content = (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark size={px} />
      {showText && (
        <div>
          <p className={cn("text-sm font-bold leading-none", textClassName)}>SURS</p>
          {subtitle && (
            <p className={cn("text-[10px] text-muted-foreground", subtitleClassName)}>{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
