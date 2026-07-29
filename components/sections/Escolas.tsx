"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { escolas } from "@/lib/data";
import { School, ArrowUpRight } from "lucide-react";

export function Escolas() {
  return (
    <section id="escolas" className="bg-mist py-24 sm:py-32 dark:bg-[#0d1526]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Onde atendemos" title="Escolas atendidas em Toledo" />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {escolas.map((e, i) => (
            <motion.div
              key={e.nome}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-sun">
                    <School size={18} />
                  </div>
                  <span className="rounded-full bg-sun/15 px-3 py-1 text-xs font-semibold text-sun-2">
                    {e.turno}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-navy dark:text-white">{e.nome}</h3>
                <p className="text-sm text-mute dark:text-white/60">{e.cidade}</p>
                <a
                  href="#rotas"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-sun-2"
                >
                  Ver rota <ArrowUpRight size={14} />
                </a>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
