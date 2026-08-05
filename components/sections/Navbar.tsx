"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { usePublicSite } from "@/lib/use-public-site";
import { defaultSiteContent } from "@/lib/site-content";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const site = usePublicSite();
  const navigation = site?.settings.siteContent?.navigation || defaultSiteContent().navigation;
  const links = [
    { href: "#inicio", label: navigation.home },
    { href: "#sobre", label: navigation.about },
    { href: "#rotas", label: navigation.neighborhoods },
    { href: "#escolas", label: navigation.schools },
    { href: "#seguranca", label: navigation.safety },
    { href: "#contato", label: navigation.contact },
  ];

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
          "mx-auto flex max-w-6xl items-center justify-between rounded-lg border border-white/10 px-4 transition-all duration-300",
          scrolled
            ? "max-w-5xl bg-navy/95 py-1.5 shadow-lg shadow-black/20 backdrop-blur-md"
            : "bg-navy/90 py-2 backdrop-blur-sm"
        )}
      >
        <Link href="#inicio" className="shrink-0" aria-label="Oziel Turismo - Inicio">
          <BrandLogo priority className="w-40 sm:w-44" />
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
              {navigation.clientArea}
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
        <div className="mx-4 mt-2 rounded-lg border border-white/10 bg-navy/95 p-4 shadow-xl backdrop-blur-md lg:hidden">
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
              {navigation.clientArea}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
