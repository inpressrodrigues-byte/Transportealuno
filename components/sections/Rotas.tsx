"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPin } from "lucide-react";
import { usePublicSite } from "@/lib/use-public-site";
import type { NeighborhoodRecord } from "@/lib/app-types";
import { defaultSiteContent } from "@/lib/site-content";

const fallbackNeighborhoods: NeighborhoodRecord[] = [
  {
    id: "fallback_centro",
    name: "Centro",
    area: "Central",
    served: true,
    color: "#c89b4a",
    position: { x: 50, y: 48 },
    notes: "Atendimento ativo",
    createdAt: "",
  },
  {
    id: "fallback_porto",
    name: "Jardim Porto Alegre",
    area: "Leste",
    served: true,
    color: "#c89b4a",
    position: { x: 69, y: 45 },
    notes: "Atendimento ativo",
    createdAt: "",
  },
  {
    id: "fallback_lasalle",
    name: "Jardim La Salle",
    area: "Central",
    served: true,
    color: "#c89b4a",
    position: { x: 43, y: 38 },
    notes: "Atendimento ativo",
    createdAt: "",
  },
];

export function Rotas() {
  const site = usePublicSite();
  const content = site?.settings.siteContent || defaultSiteContent();
  const neighborhoods = site?.neighborhoods?.length ? site.neighborhoods : fallbackNeighborhoods;
  const served = neighborhoods.filter((neighborhood) => neighborhood.served);

  return (
    <section id="rotas" className="bg-[#0b0a08] py-24 text-[#f6ead0] sm:py-32">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-[#d6b36a]/35 px-4 py-2 text-xs font-semibold text-[#d6b36a]">
              <MapPin size={14} /> {content.neighborhoods.eyebrow}
            </div>
            <h2 className="mt-6 font-[var(--font-luxury)] text-5xl font-normal leading-[1.02] text-[#f8f0df] sm:text-6xl">
              {content.neighborhoods.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/62">
              {content.neighborhoods.description}
            </p>
          </div>

          <div className="w-full sm:max-w-[190px]">
            <Metric label="Atendidos" value={served.length.toString()} />
          </div>
        </div>

        <div className="mt-8">
          <NeighborhoodList
            icon={CheckCircle2}
            title={content.neighborhoods.listTitle}
            neighborhoods={served}
            itemClassName="border-b-2 border-[#d6b36a] text-[#f8f0df]"
            emptyText={content.neighborhoods.emptyText}
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
  emptyText,
}: {
  icon: React.ElementType;
  title: string;
  neighborhoods: NeighborhoodRecord[];
  itemClassName: string;
  emptyText: string;
}) {
  return (
    <div className="border border-white/10 bg-black/20 p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d6b36a]/30 text-[#d6b36a]">
          <Icon size={18} />
        </span>
        <h3 className="font-semibold text-[#f8f0df]">{title}</h3>
      </div>
      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-4">
        {neighborhoods.length === 0 ? (
          <span className="text-sm text-white/45">{emptyText}</span>
        ) : (
          neighborhoods.map((neighborhood, index) => (
            <motion.span
              key={neighborhood.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: Math.min(index * 0.01, 0.18) }}
              className={`px-1 pb-1 text-sm font-semibold ${itemClassName}`}
            >
              {neighborhood.name}
            </motion.span>
          ))
        )}
      </div>
    </div>
  );
}
