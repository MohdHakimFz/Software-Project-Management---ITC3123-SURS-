import { requireRole } from "@/lib/auth";
import { PrintReceiptOnLoad } from "@/components/payment/print-receipt-on-load";

export default async function ReceiptPrintPage({ params }: { params: { id: string } }) {
  await requireRole(["student"]);
  return <PrintReceiptOnLoad paymentId={params.id} />;
}
