"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { usePublicSite } from "@/lib/use-public-site";
import { defaultSiteContent } from "@/lib/site-content";
import { Bus } from "lucide-react";

const thumbs = ["Frontal", "Lateral", "Interior", "Bancos"];

export function Van() {
  const [active, setActive] = useState(0);
  const site = usePublicSite();
  const content = site?.settings.siteContent || defaultSiteContent();
  const photoSlots = thumbs.map((_, index) =>
    (site?.galleryPhotos ?? []).find((photo) => photo.order === index)
  );
  const activePhoto = photoSlots[active];
  const activeName = activePhoto?.caption?.trim() || thumbs[active];

  return (
    <section id="van" className="bg-white py-24 sm:py-32 dark:bg-[#0d0d0c]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow={content.van.eyebrow} title={content.van.title} />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            {activePhoto ? (
              <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePhoto.url}
                  alt={activePhoto.alt}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-5 pb-5 pt-14 text-sm font-semibold text-white">
                  {activeName}
                </figcaption>
              </figure>
            ) : (
              <MediaFrame
                label={`Foto - ${thumbs[active]}`}
                icon={<Bus size={22} />}
                tone="mist"
                className="aspect-[4/3] w-full"
              />
            )}
            <div className="mt-4 grid grid-cols-4 gap-3">
              {thumbs.map((label, i) => {
                const photo = photoSlots[i];
                const photoName = photo?.caption?.trim() || label;
                return (
                  <button
                    key={label}
                    onClick={() => setActive(i)}
                    aria-label={`Mostrar ${photoName}`}
                    title={photoName}
                    className={`rounded-xl border p-2 transition-colors ${
                      active === i ? "border-sun-2 bg-sun/10" : "border-line hover:border-mute/30"
                    }`}
                  >
                    {photo ? (
                      <span className="relative block aspect-square w-full overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                        <span className="absolute inset-x-0 bottom-0 line-clamp-2 break-words bg-black/75 px-1.5 py-1 text-[10px] font-semibold leading-tight text-white">
                          {photoName}
                        </span>
                      </span>
                    ) : (
                      <MediaFrame label={label} tone="mist" className="aspect-square w-full" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {content.vanSpecs.map((s) => (
                <div key={s.id} className="rounded-xl bg-mist p-4 text-center">
                  <div className="text-[11px] uppercase tracking-wide text-mute dark:text-white/60">{s.label}</div>
                  <div className="mt-1 text-sm font-semibold tabular text-navy dark:text-white">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {content.vanFeatures.map((f, i) => (
              <motion.div
                key={f.id}
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
