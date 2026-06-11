import { LogoMark } from "@/components/shared/logo";
import { formatDateTime } from "@/lib/utils";

interface ReceiptHeaderProps {
  receiptNumber: string;
  paidAt: string;
}

export function ReceiptHeader({ receiptNumber, paidAt }: ReceiptHeaderProps) {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-uptm-blue via-[#003d7a] to-[#004080] px-6 py-6 text-white sm:px-8 sm:py-7 print:px-8">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-sky-400/10"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between print:flex-row print:items-center print:justify-between">
        <div className="flex items-center gap-4">
          <div className="shrink-0 rounded-xl bg-white p-1.5 shadow-lg shadow-black/20 ring-1 ring-white/40">
            <LogoMark size={48} />
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight sm:text-[1.65rem]">SURS</p>
            <p className="mt-0.5 text-sm text-white/85">Smart University Registration System</p>
            <p className="text-xs text-white/60">Universiti Poly-Tech Malaysia (UPTM)</p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Official Payment Receipt
          </p>
          <p className="mt-1.5 font-mono text-base font-bold tracking-wide sm:text-lg">{receiptNumber}</p>
          <p className="mt-1 text-xs text-white/70">{formatDateTime(paidAt)}</p>
        </div>
      </div>
    </div>
  );
}
