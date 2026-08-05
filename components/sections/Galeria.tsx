"use client";

import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { galeria } from "@/lib/data";
import { usePublicSite } from "@/lib/use-public-site";
import { Camera } from "lucide-react";

const spans = ["row-span-2", "row-span-1", "row-span-1", "row-span-2", "row-span-1", "row-span-2", "row-span-1", "row-span-1"];

export function Galeria() {
  const site = usePublicSite();
  const photos = site?.galleryPhotos ?? [];

  return (
    <section id="galeria" className="bg-white py-24 sm:py-32 dark:bg-[#0b1220]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Galeria" title="O dia a dia, em imagens" align="center" />

        <div className="mt-14 grid auto-rows-[110px] grid-cols-2 gap-4 sm:grid-cols-4">
          {(photos.length ? photos : galeria).map((item, i) => {
            const photo = "url" in item ? item : null;
            const title = "url" in item ? item.caption : item.titulo;
            const itemKey = "url" in item ? item.id : item.titulo;
            return (
              <motion.div
                key={itemKey}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className={spans[i % spans.length]}
              >
                {photo ? (
                  <figure className="group relative h-full w-full overflow-hidden rounded-2xl bg-mist dark:bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-4 pt-10 text-sm font-semibold text-white">
                      {title}
                    </figcaption>
                  </figure>
                ) : (
                  <MediaFrame
                    label={title}
                    icon={<Camera size={18} />}
                    tone={i % 3 === 0 ? "sun" : "mist"}
                    className="h-full w-full"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
