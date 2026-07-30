"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPin, MinusCircle, Navigation } from "lucide-react";
import { ToledoLuxuryMap } from "@/components/ui/ToledoLuxuryMap";
import { usePublicSite } from "@/lib/use-public-site";
import type { NeighborhoodRecord } from "@/lib/app-types";

const fallbackNeighborhoods: NeighborhoodRecord[] = [
  {
    id: "fallback_centro",
    name: "Centro",
    area: "Central",
    served: true,
    color: "#d6b36a",
    position: { x: 50, y: 48 },
    notes: "Atendimento ativo",
    createdAt: "",
  },
  {
    id: "fallback_porto",
    name: "Jardim Porto Alegre",
    area: "Leste",
    served: true,
    color: "#c9a76a",
    position: { x: 69, y: 45 },
    notes: "Atendimento ativo",
    createdAt: "",
  },
  {
    id: "fallback_lasalle",
    name: "Jardim La Salle",
    area: "Central",
    served: true,
    color: "#ead59a",
    position: { x: 43, y: 38 },
    notes: "Atendimento ativo",
    createdAt: "",
  },
  {
    id: "fallback_sao_francisco",
    name: "Sao Francisco",
    area: "Oeste",
    served: false,
    color: "#9ca3af",
    position: { x: 20, y: 34 },
    notes: "Ainda nao atendido",
    createdAt: "",
  },
];

export function Rotas() {
  const site = usePublicSite();
  const neighborhoods = site?.neighborhoods?.length ? site.neighborhoods : fallbackNeighborhoods;
  const served = neighborhoods.filter((neighborhood) => neighborhood.served);
  const paused = neighborhoods.filter((neighborhood) => !neighborhood.served);

  return (
    <section id="rotas" className="relative overflow-hidden bg-[#0b0a08] py-24 text-[#f6ead0] sm:py-32">
      <div className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(to_right,#d6b36a_1px,transparent_1px),linear-gradient(to_bottom,#d6b36a_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[#d6b36a]/35" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-[#d6b36a]/25" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[0.82fr_1.18fr] xl:items-end">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 border border-[#d6b36a]/35 px-4 py-2 text-xs font-semibold text-[#d6b36a]">
              <MapPin size={14} /> Toledo, PR
            </div>

            <h2 className="mt-8 font-[var(--font-luxury)] text-5xl font-normal leading-[1.02] text-[#f8f0df] sm:text-6xl lg:text-7xl">
              Mapa real da cidade, com atendimento no ponto certo.
            </h2>

            <p className="mt-7 max-w-lg text-base leading-8 text-white/62">
              Uma leitura elegante dos bairros atendidos em Toledo. O mapa usa a cidade real como base e destaca, com acabamento premium, onde o transporte esta ativo.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-3">
              <LuxuryMetric label="Bairros ativos" value={served.length.toString()} />
              <LuxuryMetric label="Em avaliacao" value={paused.length.toString()} />
            </div>
          </div>

          <ToledoLuxuryMap neighborhoods={neighborhoods} />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border border-[#d6b36a]/20 bg-[#15120d]/70 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3 text-[#f8f0df]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d6b36a]/35 text-[#d6b36a]">
                <CheckCircle2 size={18} />
              </span>
              <div>
                <h3 className="font-semibold">Bairros atendidos</h3>
                <p className="text-sm text-white/48">Atualizado pelo painel interno.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {served.map((neighborhood, index) => (
                <motion.span
                  key={neighborhood.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.012, 0.2) }}
                  className="border border-[#d6b36a]/35 bg-[#d6b36a]/12 px-3 py-1.5 text-xs font-semibold text-[#f8f0df]"
                >
                  {neighborhood.name}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="border border-white/10 bg-black/25 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3 text-[#f8f0df]">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/50">
                <MinusCircle size={18} />
              </span>
              <div>
                <h3 className="font-semibold">Ainda em avaliacao</h3>
                <p className="text-sm text-white/42">Aparecem discretos no mapa.</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {paused.slice(0, 12).map((neighborhood) => (
                <span
                  key={neighborhood.id}
                  className="border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/45"
                >
                  {neighborhood.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-white/52">
          <Navigation size={16} className="text-[#d6b36a]" />
          Mapa real com base OpenStreetMap/CARTO. Os pontos seguem os bairros configurados no painel.
        </div>
      </div>
    </section>
  );
}

function LuxuryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#d6b36a]/24 bg-black/25 p-5">
      <div className="font-[var(--font-luxury)] text-4xl leading-none text-[#f8f0df]">{value}</div>
      <div className="mt-2 text-sm font-semibold text-white/45">{label}</div>
    </div>
  );
}
