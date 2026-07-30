"use client";

import { motion } from "framer-motion";
import { CheckCircle2, MapPin, MinusCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { usePublicSite } from "@/lib/use-public-site";
import type { NeighborhoodRecord } from "@/lib/app-types";
import { cn } from "@/lib/utils";

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
    color: "#f472b6",
    position: { x: 69, y: 45 },
    notes: "Atendimento ativo",
    createdAt: "",
  },
  {
    id: "fallback_lasalle",
    name: "Jardim La Salle",
    area: "Central",
    served: true,
    color: "#38bdf8",
    position: { x: 43, y: 38 },
    notes: "Atendimento ativo",
    createdAt: "",
  },
  {
    id: "fallback_sao_francisco",
    name: "Sao Francisco",
    area: "Oeste",
    served: false,
    color: "#94a3b8",
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
    <section id="rotas" className="bg-white py-24 sm:py-32 dark:bg-[#0b1220]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Bairros" title="Mapa de atendimento em Toledo" />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <NeighborhoodMap neighborhoods={neighborhoods} />
          </div>

          <div className="space-y-5 lg:col-span-2">
            <Card>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ok/10 text-ok">
                  <CheckCircle2 size={18} />
                </span>
                <div>
                  <h3 className="font-semibold text-navy dark:text-white">Bairros atendidos</h3>
                  <p className="text-sm text-mute dark:text-white/60">{served.length} bairros ativos no painel</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {served.map((neighborhood) => (
                  <motion.span
                    key={neighborhood.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-full px-3 py-1.5 text-xs font-bold text-navy"
                    style={{ backgroundColor: neighborhood.color }}
                  >
                    {neighborhood.name}
                  </motion.span>
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/45">
                  <MinusCircle size={18} />
                </span>
                <div>
                  <h3 className="font-semibold text-navy dark:text-white">Ainda nao atendidos</h3>
                  <p className="text-sm text-mute dark:text-white/60">Podem ser ativados pelo admin.</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {paused.slice(0, 12).map((neighborhood) => (
                  <span
                    key={neighborhood.id}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 grayscale dark:bg-white/5 dark:text-white/45"
                  >
                    {neighborhood.name}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function NeighborhoodMap({ neighborhoods }: { neighborhoods: NeighborhoodRecord[] }) {
  return (
    <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-slate-100 via-white to-slate-200 p-5 shadow-sm dark:border-white/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-800">
      <div className="absolute left-[9%] top-[7%] h-[82%] w-[80%] rounded-[38%_62%_44%_56%/46%_42%_58%_54%] border border-slate-300 bg-white/60 shadow-inner dark:border-white/10 dark:bg-white/5" />
      <div className="absolute left-[15%] right-[14%] top-1/2 h-px bg-slate-300 dark:bg-white/10" />
      <div className="absolute bottom-[15%] left-1/2 top-[14%] w-px bg-slate-300 dark:bg-white/10" />
      <div className="absolute left-7 top-7 flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-bold text-navy shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-white">
        <MapPin size={14} className="text-sun-2" /> Toledo, PR
      </div>

      {neighborhoods.map((neighborhood, index) => (
        <motion.span
          key={neighborhood.id}
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35, delay: Math.min(index * 0.015, 0.25) }}
          className={cn(
            "absolute max-w-[140px] -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1.5 text-center text-xs font-bold shadow-sm",
            neighborhood.served
              ? "border-white/70 text-navy"
              : "border-slate-300 bg-slate-100 text-slate-500 grayscale dark:border-white/10 dark:bg-slate-800 dark:text-white/40"
          )}
          style={{
            left: `${neighborhood.position.x}%`,
            top: `${neighborhood.position.y}%`,
            backgroundColor: neighborhood.served ? neighborhood.color : undefined,
          }}
        >
          {neighborhood.name}
        </motion.span>
      ))}

      <div className="absolute bottom-5 left-5 flex flex-wrap gap-2 rounded-2xl bg-white/85 p-3 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur dark:bg-slate-950/80 dark:text-white/60">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sun" /> Atendemos</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Nao atendemos</span>
      </div>
    </div>
  );
}
