"use client";

import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { usePublicSite } from "@/lib/use-public-site";
import { defaultSiteContent } from "@/lib/site-content";

export function Sobre() {
  const site = usePublicSite();
  const content = site?.settings.siteContent || defaultSiteContent();
  const photo = site?.settings.driverPhoto;

  return (
    <section id="sobre" className="bg-cloud py-24 sm:py-32 dark:bg-[#0d0d0c]">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow={content.driver.eyebrow} title={content.driver.title} />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-5 lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {photo?.url ? (
              <figure className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-mist">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={content.driver.photoAlt} className="h-full w-full object-cover" />
              </figure>
            ) : (
              <MediaFrame
                label={content.driver.photoAlt}
                icon={<UserRound size={20} />}
                tone="navy"
                className="aspect-[4/5] w-full"
              />
            )}
            <p className="mt-6 text-base leading-relaxed text-mute dark:text-white/60">
              {content.driver.description}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-3">
            {content.driverHighlights.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="h-full">
                  <h3 className="font-semibold text-navy dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mute dark:text-white/60">
                    {item.detail}
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
