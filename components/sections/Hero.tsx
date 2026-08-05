"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroRouteMap } from "@/components/ui/RouteMotif";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden border-b border-white/10 bg-navy pb-4 pt-28 sm:pb-6 sm:pt-32">
      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 border-y border-sun/40 px-4 py-2 text-xs font-semibold uppercase text-sun">
            Transporte escolar em Toledo - PR
          </span>
          <h1 className="mt-6 font-[family-name:var(--font-luxury)] text-5xl font-normal leading-none text-white sm:text-7xl lg:text-8xl">
            Oziel <span className="text-sun">Turismo</span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-xl font-medium leading-relaxed text-white sm:text-2xl">
            Seguranca, pontualidade e acompanhamento em tempo real em cada trajeto.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/65">
            Atendimento em Toledo e regiao, com veiculo vistoriado, rotina organizada e comunicacao clara com os responsaveis.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
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
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto mt-8 w-full max-w-5xl border-y border-white/10 px-3 py-3"
        >
          <HeroRouteMap />
        </motion.div>
      </div>
    </section>
  );
}
