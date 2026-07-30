"use client";

import { MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FacebookGlyph, InstagramGlyph } from "@/components/ui/SocialIcons";
import { usePublicSite } from "@/lib/use-public-site";
import { normalizeDigits } from "@/lib/app-utils";

export function Contato() {
  const site = usePublicSite();
  const phone = site?.settings.phone || "(45) 99999-9999";
  const whatsapp = whatsappNumber(site?.settings.whatsapp || "5545999999999");
  const city = "Toledo, PR";

  return (
    <section id="contato" className="bg-navy py-24 text-white sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Contato" title="Solicite uma vaga" dark />

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun">Atendimento direto</p>
            <h3 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              Informe escola, turno e bairro para consultar disponibilidade.
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
              O atendimento e feito com base nas escolas e bairros cadastrados no painel administrativo, mantendo a consulta simples para a familia e organizada para a empresa.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:+${whatsappNumber(phone)}`}>
                <Button variant="outline" size="lg">
                  <Phone size={16} /> Ligar
                </Button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <ContactLine icon={Phone} label="Telefone" value={phone} />
            <ContactLine icon={MessageCircle} label="WhatsApp" value={`+${whatsapp}`} />
            <ContactLine icon={MapPin} label="Cidade" value={city} />
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/45">Redes sociais</div>
              <div className="mt-4 flex gap-2">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/65 transition hover:border-sun/40 hover:text-sun"
                >
                  <InstagramGlyph size={17} />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/65 transition hover:border-sun/40 hover:text-sun"
                >
                  <FacebookGlyph size={17} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactLine({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun/15 text-sun">
          <Icon size={17} />
        </span>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-white/45">{label}</div>
          <div className="mt-1 text-sm font-semibold text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function whatsappNumber(value: string) {
  const digits = normalizeDigits(value);
  if (digits.startsWith("55")) return digits;
  if (digits.length >= 10) return `55${digits}`;
  return "5545999999999";
}
