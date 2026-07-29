"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { galeria } from "@/lib/data";
import { Camera } from "lucide-react";

const spans = ["row-span-2", "row-span-1", "row-span-1", "row-span-2", "row-span-1", "row-span-2", "row-span-1", "row-span-1"];

export function Galeria() {
  return (
    <section id="galeria" className="bg-white py-24 sm:py-32 dark:bg-[#0b1220]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Galeria" title="O dia a dia, em imagens" align="center" />

        <div className="mt-14 grid auto-rows-[110px] grid-cols-2 gap-4 sm:grid-cols-4">
          {galeria.map((g, i) => (
            <motion.div
              key={g.titulo}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              className={spans[i]}
            >
              <MediaFrame
                label={g.titulo}
                icon={<Camera size={18} />}
                tone={i % 3 === 0 ? "sun" : "mist"}
                className="h-full w-full"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
