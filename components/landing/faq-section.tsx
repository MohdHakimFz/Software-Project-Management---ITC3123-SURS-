"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Siapa yang boleh guna SURS?",
    a: "All UPTM students can register and enroll. Staff manage enrollments through the registrar portal, and admins handle system configuration.",
  },
  {
    q: "Bila tarikh akhir pendaftaran?",
    a: "Enrollment deadline for Semester 2026/1 is 30 June 2026. Unpaid enrollments are automatically cancelled after 3 days.",
  },
  {
    q: "How much are the semester fees?",
    a: "Fees depend on your programme and credit hours. Example: 18 credits × RM 150 tuition + RM 50 registration + RM 100 resource = ~RM 2,850.",
  },
  {
    q: "Can I pay with a test card?",
    a: "Yes — SURS uses Stripe Test Mode. Use card 4242 4242 4242 4242 with any future expiry date for demo payments.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {FAQS.map((faq, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted"
          >
            <span className="pr-4 text-sm font-semibold text-foreground">{faq.q}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-uptm-blue transition-transform duration-200",
                open === i && "rotate-180"
              )}
            />
          </button>
          <div
            className={cn(
              "grid transition-all duration-200",
              open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
