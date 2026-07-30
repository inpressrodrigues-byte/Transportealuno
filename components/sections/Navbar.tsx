"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, Bus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { usePublicSite } from "@/lib/use-public-site";

const links = [
  { href: "#inicio", label: "Inicio" },
  { href: "#sobre", label: "Sobre" },
  { href: "#rotas", label: "Bairros" },
  { href: "#escolas", label: "Escolas" },
  { href: "#galeria", label: "Galeria" },
  { href: "#seguranca", label: "Seguranca" },
  { href: "#contato", label: "Contato" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const site = usePublicSite();
  const brand = site?.settings.brandName || "Rota Segura";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 transition-all duration-300",
          scrolled
            ? "bg-navy/90 backdrop-blur-md shadow-lg shadow-navy/10 py-2 max-w-5xl"
            : "bg-navy/70 backdrop-blur-sm py-3"
        )}
      >
        <Link href="#inicio" className="flex items-center gap-2 pl-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sun text-navy">
            <Bus size={16} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-bold tracking-tight text-white">
            {brand}
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white hover:bg-white/10"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2 pr-1">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="outline" size="sm">
              Area do Cliente
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10"
            aria-label="Abrir menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-4 mt-2 rounded-3xl bg-navy/95 backdrop-blur-md p-4 lg:hidden shadow-xl">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white">
              Area do Cliente
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
