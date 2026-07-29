"use client";

import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faq } from "@/lib/data";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-mist py-24 sm:py-32 dark:bg-[#0d1526]">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes" align="center" />

        <div className="mt-12 divide-y divide-line dark:divide-white/10 rounded-2xl border border-line bg-white dark:border-white/10 dark:bg-white/[0.04]">
          {faq.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.pergunta}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-navy dark:text-white">{f.pergunta}</span>
                  <Plus
                    size={18}
                    className={cn(
                      "shrink-0 text-mute transition-transform duration-300",
                      isOpen && "rotate-45 text-sun-2"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-mute dark:text-white/60">
                      {f.resposta}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
