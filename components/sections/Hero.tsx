"use client";

import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock, MapPinned, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroRouteMap } from "@/components/ui/RouteMotif";
import { stats } from "@/lib/data";

const statIcons = [Users, Clock, ShieldCheck, BadgeCheck];

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-navy pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(250,204,21,0.12),transparent)]"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-sun">
            Toledo - PR
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Seu filho chega a escola com <span className="text-sun">seguranca</span>, pontualidade e acompanhamento em tempo real.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/70">
            Atendimento em Toledo e regiao, com veiculo vistoriado, rotina organizada e comunicacao clara com os responsaveis.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contato">
              <Button variant="primary" size="lg">
                Solicitar vaga <ArrowRight size={16} />
              </Button>
            </a>
            <a href="#rotas">
              <Button variant="outline" size="lg">
                <MapPinned size={16} /> Ver bairros
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative"
        >
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm">
            <HeroRouteMap />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4"
      >
        {stats.map((item, index) => {
          const Icon = statIcons[index];
          return (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
              <Icon className="mx-auto mb-2 text-sun" size={20} />
              <div className="text-2xl font-bold tabular text-white">{item.value}</div>
              <div className="mt-1 text-xs text-white/60">{item.label}</div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
