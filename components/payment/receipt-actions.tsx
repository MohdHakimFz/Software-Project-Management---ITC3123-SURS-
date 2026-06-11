"use client";

import { useState } from "react";
import { Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { printReceiptPdf } from "@/lib/print-receipt-pdf";

interface ReceiptActionsProps {
  paymentId: string;
}

export function ReceiptActions({ paymentId }: ReceiptActionsProps) {
  const [printing, setPrinting] = useState(false);
  const [printMessage, setPrintMessage] = useState<string | null>(null);

  async function handlePrint() {
    setPrinting(true);
    setPrintMessage(null);
    const result = await printReceiptPdf(paymentId);
    setPrinting(false);
    if (!result.ok) {
      setPrintMessage(result.error ?? "Print failed");
    } else {
      setPrintMessage("Same PDF as download opened — confirm A4 & 100% scale in print dialog.");
    }
  }

  return (
    <div className="space-y-2 border-t pt-6 print:hidden">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="h-11 flex-1 bg-uptm-blue hover:bg-uptm-blue/90">
          <a href={`/api/payment/receipt?id=${paymentId}`}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF (A4)
          </a>
        </Button>
        <Button
          variant="outline"
          className="h-11 flex-1"
          onClick={handlePrint}
          disabled={printing}
        >
          {printing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Opening PDF...
            </>
          ) : (
            <>
              <Printer className="mr-2 h-4 w-4" />
              Print PDF (A4)
            </>
          )}
        </Button>
      </div>
      {printMessage && (
        <p className="text-center text-xs text-muted-foreground">{printMessage}</p>
      )}
      <p className="text-center text-[11px] text-muted-foreground">
        Both buttons use the <strong>same PDF file</strong>. Download → print that file for best
        consistency on Windows.
      </p>
    </div>
  );
}
