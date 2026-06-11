"use client";

import { useEffect, useState } from "react";
import { printReceiptPdf } from "@/lib/print-receipt-pdf";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, Printer } from "lucide-react";

interface PrintReceiptOnLoadProps {
  paymentId: string;
}

export function PrintReceiptOnLoad({ paymentId }: PrintReceiptOnLoadProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openedTab, setOpenedTab] = useState(false);

  async function runPrint() {
    setLoading(true);
    setError(null);
    const result = await printReceiptPdf(paymentId);
    setLoading(false);
    setOpenedTab(result.openedTab ?? false);
    if (!result.ok) {
      setError(result.error ?? "Print failed");
    }
  }

  useEffect(() => {
    runPrint();
  }, [paymentId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-8 text-center">
      {loading ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-uptm-blue" />
          <p className="text-sm text-slate-600">Opening receipt PDF...</p>
        </>
      ) : (
        <>
          {openedTab && !error && (
            <p className="max-w-sm text-sm text-slate-700">
              The <strong>same PDF</strong> as Download opened in a new tab. Print dialog should
              appear — use <strong>100% scale</strong> and <strong>A4</strong> for identical output.
            </p>
          )}
          {error && <p className="max-w-sm text-sm text-amber-700">{error}</p>}
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={runPrint}>
              <Printer className="mr-2 h-4 w-4" />
              Open PDF & Print Again
            </Button>
            <Button variant="outline" asChild>
              <a
                href={`/api/payment/receipt?id=${paymentId}&inline=1`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View PDF Only
              </a>
            </Button>
          </div>
          <p className="max-w-md text-xs text-slate-500">
            Tip: For guaranteed identical output, use <strong>Download PDF</strong> then print that
            file from Edge/Adobe — same file, same layout.
          </p>
        </>
      )}
    </div>
  );
}
