"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#portals", label: "Portals" },
  { href: "#faq", label: "FAQ" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="touch-target flex items-center justify-center rounded-lg border border-white/15 bg-white/10 p-2 text-white"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav
            className={cn(
              "fixed inset-x-3 top-[4.25rem] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#002244]/95 shadow-xl backdrop-blur-md safe-top",
              "animate-fade-in-up"
            )}
          >
            <ul className="p-2">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex gap-2 border-t border-white/10 p-3">
              <Button asChild size="sm" variant="ghost" className="flex-1 text-white hover:bg-white/10">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log masuk
                </Link>
              </Button>
              <Button asChild size="sm" className="flex-1 bg-white text-uptm-blue hover:bg-white/90">
                <Link href="/register" onClick={() => setOpen(false)}>
                  Daftar
                </Link>
              </Button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
