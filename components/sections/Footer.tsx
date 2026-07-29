import Link from "next/link";
import { Bus, MessageCircle } from "lucide-react";
import { InstagramGlyph, FacebookGlyph } from "@/components/ui/SocialIcons";

const cols = [
  {
    title: "Navegação",
    links: [
      { label: "Início", href: "#inicio" },
      { label: "Sobre", href: "#sobre" },
      { label: "Nossa Van", href: "#van" },
      { label: "Rotas", href: "#rotas" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Escolas atendidas", href: "#escolas" },
      { label: "Segurança", href: "#seguranca" },
      { label: "Galeria", href: "#galeria" },
      { label: "Contato", href: "#contato" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-navy-2 border-t border-white/10 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sun text-navy">
                <Bus size={16} strokeWidth={2.5} />
              </span>
              <span className="text-sm font-bold text-white">Rota Segura</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Transporte escolar em Toledo, PR. Rua das Palmeiras, 240 — Jardim
              Porto Alegre.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-sun">
                <InstagramGlyph size={15} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-sun">
                <FacebookGlyph size={15} />
              </a>
              <a href="https://wa.me/5545999999999" target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-sun">
                <MessageCircle size={15} />
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
            <h4 className="text-sm font-semibold text-white">Área do Cliente</h4>
            <p className="mt-4 text-sm text-white/50">
              Mensalidades, rastreamento e avisos em um só lugar.
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
          <span>© {new Date().getFullYear()} Rota Segura Transporte Escolar. Todos os direitos reservados.</span>
          <span>CNPJ 00.000.000/0001-00</span>
        </div>
      </div>
    </footer>
  );
}
