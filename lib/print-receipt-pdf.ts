/**
 * Opens the exact same PDF bytes as Download, in a new tab (native PDF viewer),
 * then triggers print. Avoids iframe / HTML — output matches downloaded PDF.
 */
export async function printReceiptPdf(
  paymentId: string
): Promise<{ ok: boolean; error?: string; openedTab?: boolean }> {
  try {
    const res = await fetch(
      `/api/payment/receipt?id=${encodeURIComponent(paymentId)}&inline=1`
    );
    if (!res.ok) {
      return { ok: false, error: "Receipt not found" };
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, "_blank", "noopener,noreferrer");

    if (!printWindow) {
      URL.revokeObjectURL(url);
      return {
        ok: false,
        error: "Popup blocked — allow popups, or use Download PDF then print that file",
      };
    }

    const revoke = () => URL.revokeObjectURL(url);
    printWindow.addEventListener("beforeunload", revoke, { once: true });

    // Native PDF viewer needs a moment before print() works (especially on Windows)
    return new Promise((resolve) => {
      window.setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
          resolve({ ok: true, openedTab: true });
        } catch {
          revoke();
          resolve({
            ok: false,
            openedTab: true,
            error: "PDF opened — press Ctrl+P in that tab to print",
          });
        }
      }, 1200);
    });
  } catch {
    return { ok: false, error: "Could not load receipt" };
  }
}
