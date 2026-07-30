"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPin, MinusCircle } from "lucide-react";
import { ToledoLuxuryMap } from "@/components/ui/ToledoLuxuryMap";
import { usePublicSite } from "@/lib/use-public-site";
import type { NeighborhoodRecord } from "@/lib/app-types";

const fallbackNeighborhoods: NeighborhoodRecord[] = [
  {
    id: "fallback_centro",
    name: "Centro",
    area: "Central",
    served: true,
    color: "#facc15",
    position: { x: 50, y: 48 },
    notes: "Atendimento ativo",
    createdAt: "",
  },
  {
    id: "fallback_porto",
    name: "Jardim Porto Alegre",
    area: "Leste",
    served: true,
    color: "#facc15",
    position: { x: 69, y: 45 },
    notes: "Atendimento ativo",
    createdAt: "",
  },
  {
    id: "fallback_lasalle",
    name: "Jardim La Salle",
    area: "Central",
    served: true,
    color: "#facc15",
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
    <section id="rotas" className="bg-[#0b0a08] py-24 text-[#f6ead0] sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-[#d6b36a]/35 px-4 py-2 text-xs font-semibold text-[#d6b36a]">
              <MapPin size={14} /> Bairros de Toledo
            </div>
            <h2 className="mt-6 font-[var(--font-luxury)] text-5xl font-normal leading-[1.02] text-[#f8f0df] sm:text-6xl">
              Bairros atendidos
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/62">
              Um mapa limpo para visualizar somente os bairros cadastrados no painel.
            </p>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 sm:max-w-sm">
            <Metric label="Atendidos" value={served.length.toString()} />
            <Metric label="Em avaliacao" value={paused.length.toString()} />
          </div>
        </div>

        <ToledoLuxuryMap neighborhoods={neighborhoods} />

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <NeighborhoodList
            icon={CheckCircle2}
            title="Atendidos"
            neighborhoods={served}
            itemClassName="border-[#d6b36a]/35 bg-[#d6b36a]/12 text-[#f8f0df]"
          />
          <NeighborhoodList
            icon={MinusCircle}
            title="Em avaliacao"
            neighborhoods={paused}
            itemClassName="border-white/10 bg-white/[0.04] text-white/45"
          />
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#d6b36a]/24 bg-black/25 p-5">
      <div className="font-[var(--font-luxury)] text-4xl leading-none text-[#f8f0df]">{value}</div>
      <div className="mt-2 text-sm font-semibold text-white/45">{label}</div>
    </div>
  );
}

function NeighborhoodList({
  icon: Icon,
  title,
  neighborhoods,
  itemClassName,
}: {
  icon: React.ElementType;
  title: string;
  neighborhoods: NeighborhoodRecord[];
  itemClassName: string;
}) {
  return (
    <div className="border border-white/10 bg-black/20 p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d6b36a]/30 text-[#d6b36a]">
          <Icon size={18} />
        </span>
        <h3 className="font-semibold text-[#f8f0df]">{title}</h3>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {neighborhoods.length === 0 ? (
          <span className="text-sm text-white/45">Nenhum bairro cadastrado.</span>
        ) : (
          neighborhoods.map((neighborhood, index) => (
            <motion.span
              key={neighborhood.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: Math.min(index * 0.01, 0.18) }}
              className={`border px-3 py-1.5 text-xs font-semibold ${itemClassName}`}
            >
              {neighborhood.name}
            </motion.span>
          ))
        )}
      </div>
    </div>
  );
}
