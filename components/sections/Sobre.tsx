"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { sobreCards } from "@/lib/data";
import { UserRound } from "lucide-react";

export function Sobre() {
  return (
    <section id="sobre" className="bg-cloud py-24 sm:py-32 dark:bg-[#0b1220]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Quem dirige"
          title="Uma pessoa você conhece pelo nome, não por um app"
        />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-5 lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <MediaFrame
              label="Foto do motorista"
              icon={<UserRound size={20} />}
              tone="navy"
              className="aspect-[4/5] w-full"
            />
            <p className="mt-6 text-base leading-relaxed text-mute dark:text-white/60">
              Sou o Adilson, motorista há 12 anos aqui em Toledo. Comecei
              levando meus próprios filhos e hoje cuido de mais de 400
              crianças — sempre pelas mesmas ruas, no mesmo horário, com o
              mesmo cuidado que eu queria para os meus.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
            {sobreCards.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card className="h-full">
                  <h3 className="font-semibold text-navy dark:text-white">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute dark:text-white/60">
                    {c.detail}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
