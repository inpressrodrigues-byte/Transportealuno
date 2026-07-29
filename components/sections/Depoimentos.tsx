"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { depoimentos } from "@/lib/data";
import { Star, UserRound, ChevronLeft, ChevronRight } from "lucide-react";

export function Depoimentos() {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setIndex((i) => (i + 1) % depoimentos.length);
    }, 5500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const go = (dir: number) => {
    if (timer.current) clearInterval(timer.current);
    setIndex((i) => (i + dir + depoimentos.length) % depoimentos.length);
  };

  return (
    <section className="bg-mist py-24 sm:py-32 dark:bg-[#0d1526]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Depoimentos" title="Quem confia, conta" />
          <div className="flex gap-2">
            <button
              onClick={() => go(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-navy hover:bg-mist dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => go(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-navy hover:bg-mist dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/[0.1]"
              aria-label="Próximo depoimento"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-10 overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {depoimentos.map((d) => (
              <div key={d.nome} className="w-full shrink-0 px-1">
                <div className="mx-auto grid max-w-3xl grid-cols-1 items-center gap-6 rounded-3xl bg-white p-8 shadow-sm dark:bg-white/[0.04] dark:border dark:border-white/10 sm:grid-cols-[auto_1fr]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-sun">
                    <UserRound size={26} />
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-sun">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                      ))}
                    </div>
                    <p className="mt-3 text-base leading-relaxed text-ink dark:text-white/80">
                      &ldquo;{d.texto}&rdquo;
                    </p>
                    <div className="mt-4 text-sm font-semibold text-navy dark:text-white">{d.nome}</div>
                    <div className="text-xs text-mute dark:text-white/60">{d.escola}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {depoimentos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-sun-2" : "w-1.5 bg-line"
              }`}
              aria-label={`Ir para depoimento ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
