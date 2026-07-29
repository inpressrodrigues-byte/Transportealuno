"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { vanFeatures, vanSpecs } from "@/lib/data";
import { Bus } from "lucide-react";

const thumbs = ["Frontal", "Lateral", "Interior", "Bancos"];

export function Van() {
  const [active, setActive] = useState(0);

  return (
    <section id="van" className="bg-white py-24 sm:py-32 dark:bg-[#0b1220]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Nossa van" title="Feita para o trajeto de todos os dias" />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <MediaFrame
              label={`Foto — ${thumbs[active]}`}
              icon={<Bus size={22} />}
              tone="mist"
              className="aspect-[4/3] w-full"
            />
            <div className="mt-4 grid grid-cols-4 gap-3">
              {thumbs.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setActive(i)}
                  className={`rounded-xl border p-2 transition-colors ${
                    active === i ? "border-sun-2 bg-sun/10" : "border-line hover:border-mute/30"
                  }`}
                >
                  <MediaFrame label={t} tone="mist" className="aspect-square w-full" />
                </button>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {vanSpecs.map((s) => (
                <div key={s.label} className="rounded-xl bg-mist p-4 text-center">
                  <div className="text-[11px] uppercase tracking-wide text-mute dark:text-white/60">{s.label}</div>
                  <div className="mt-1 text-sm font-semibold tabular text-navy dark:text-white">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {vanFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <Card className="h-full">
                  <h3 className="font-semibold text-navy dark:text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute dark:text-white/60">{f.detail}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
