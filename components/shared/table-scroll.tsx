import { cn } from "@/lib/utils";

interface TableScrollProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}

/** Horizontal scroll wrapper for wide tables on phones and small tablets. */
export function TableScroll({
  children,
  className,
  minWidth = "36rem",
}: TableScrollProps) {
  return (
    <div
      className={cn(
        "-mx-4 overflow-x-auto overscroll-x-contain px-4 touch-pan-x sm:mx-0 sm:px-0",
        className
      )}
    >
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}
