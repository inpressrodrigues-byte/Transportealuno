"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { seguranca } from "@/lib/data";
import {
  ShieldCheck,
  FileCheck2,
  Video,
  Satellite,
  Wrench,
  BadgeCheck,
  HeartPulse,
  ClipboardCheck,
} from "lucide-react";

const icons = [ShieldCheck, FileCheck2, Video, Satellite, Wrench, BadgeCheck, HeartPulse, ClipboardCheck];

export function Seguranca() {
  return (
    <section id="seguranca" className="bg-navy py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow="Segurança"
          title="Cuidado que não aparece, mas sustenta tudo"
          description="A rotina que garante que cada viagem seja igual à anterior: sem surpresas."
          dark
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {seguranca.map((s, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card dark className="h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sun/10 text-sun">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{s.detail}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
