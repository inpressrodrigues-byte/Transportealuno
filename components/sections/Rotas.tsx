"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { rotas } from "@/lib/data";
import { Clock, MapPin, Users } from "lucide-react";

const routeColors = ["#facc15", "#38bdf8", "#f472b6", "#4ade80"];
const routePaths = [
  "M 20 40 Q 100 20 180 90 T 340 100",
  "M 20 200 Q 100 220 180 150 T 340 120",
  "M 20 120 L 340 110",
  "M 20 260 Q 140 260 200 180 T 340 130",
];

export function Rotas() {
  return (
    <section id="rotas" className="bg-white py-24 sm:py-32 dark:bg-[#0b1220]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Trajetos" title="Quatro rotas fixas, todos os dias" />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 rounded-3xl bg-navy p-6">
            <svg viewBox="0 0 360 280" className="h-auto w-full">
              {routePaths.map((d, i) => (
                <path
                  key={d}
                  d={d}
                  fill="none"
                  stroke={routeColors[i]}
                  strokeWidth="2.5"
                  className="route-line route-line-animated"
                  style={{ animationDelay: `${i * 0.4}s` }}
                />
              ))}
              <circle cx="340" cy="110" r="8" fill="#0f172a" stroke="#facc15" strokeWidth="2.5" />
            </svg>
            <div className="mt-2 flex flex-wrap gap-3">
              {rotas.map((r, i) => (
                <span key={r.nome} className="flex items-center gap-1.5 text-xs text-white/70">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: routeColors[i] }}
                  />
                  {r.nome}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
            {rotas.map((r, i) => (
              <motion.div
                key={r.nome}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <Card className="h-full">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-navy dark:text-white">{r.nome}</h3>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: routeColors[i] }}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-mute dark:text-white/60">
                    <Clock size={14} /> Saída {r.horario} · {r.tempo}
                  </div>
                  <div className="mt-2 flex items-start gap-2 text-sm text-mute dark:text-white/60">
                    <MapPin size={14} className="mt-0.5 shrink-0" /> {r.bairros}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-mute dark:text-white/60">
                    <Users size={14} /> {r.alunos} alunos nesta rota
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
