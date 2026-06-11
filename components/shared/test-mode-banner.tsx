import { CreditCard, ShieldAlert } from "lucide-react";
import { STRIPE_TEST_CARD } from "@/lib/demo-accounts";
import { cn } from "@/lib/utils";

interface TestModeBannerProps {
  className?: string;
  compact?: boolean;
  showCardHint?: boolean;
}

export function TestModeBanner({
  className,
  compact = false,
  showCardHint = true,
}: TestModeBannerProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800/50 dark:from-amber-950/50 dark:to-orange-950/30",
        compact ? "p-3" : "p-4",
        className
      )}
      role="status"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-amber-900 dark:text-amber-200">
          Stripe Test Mode
        </p>
        <p className="mt-0.5 text-sm text-amber-800/80 dark:text-amber-300/80">
          No real money is charged. For demo and evaluation only.
        </p>
        {showCardHint && (
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-amber-900/70 dark:text-amber-200/70">
            <CreditCard className="h-3.5 w-3.5 shrink-0" />
            Test card:{" "}
            <code className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-[11px]">
              {STRIPE_TEST_CARD}
            </code>
            · any future expiry · any CVC
          </p>
        )}
      </div>
    </div>
  );
}
