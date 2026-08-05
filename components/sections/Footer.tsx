"use client";

import Link from "next/link";
import { Bus } from "lucide-react";
import { InstagramGlyph, FacebookGlyph } from "@/components/ui/SocialIcons";
import { usePublicSite } from "@/lib/use-public-site";

const cols = [
  {
    title: "Navegacao",
    links: [
      { label: "Inicio", href: "#inicio" },
      { label: "Sobre", href: "#sobre" },
      { label: "Nossa Van", href: "#van" },
      { label: "Bairros", href: "#rotas" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Escolas atendidas", href: "#escolas" },
      { label: "Seguranca", href: "#seguranca" },
      { label: "Contato", href: "#contato" },
    ],
  },
];

export function Footer() {
  const site = usePublicSite();
  const settings = site?.settings;
  const brand = settings?.brandName || "Rota Segura";
  const businessName = settings?.businessName || "Rota Segura Transporte Escolar";
  const document = settings?.document || "00.000.000/0001-00";

  return (
    <footer className="border-t border-white/10 bg-navy-2 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sun text-navy">
                <Bus size={16} strokeWidth={2.5} />
              </span>
              <span className="text-sm font-bold text-white">{brand}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Transporte escolar em Toledo, PR. Atendimento com seguranca,
              comunicacao e pontualidade.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-sun" aria-label="Instagram">
                <InstagramGlyph size={15} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-sun" aria-label="Facebook">
                <FacebookGlyph size={15} />
              </a>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold text-white">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-white/50 hover:text-sun">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-semibold text-white">Area do Cliente</h4>
            <p className="mt-4 text-sm text-white/50">
              Mensalidades, filhos cadastrados e recibos em um so lugar.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white hover:border-sun/50"
            >
              Acessar
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} {businessName}. Todos os direitos reservados.</span>
          <span>CNPJ {document}</span>
        </div>
      </div>
    </footer>
  );
}
