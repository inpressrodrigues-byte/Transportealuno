"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  ClipboardCheck,
  FileCheck2,
  HeartPulse,
  Satellite,
  ShieldCheck,
  Video,
  Wrench,
} from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { usePublicSite } from "@/lib/use-public-site";
import { defaultSiteContent } from "@/lib/site-content";

const icons = [ShieldCheck, FileCheck2, Video, Satellite, Wrench, BadgeCheck, HeartPulse, ClipboardCheck];

export function Seguranca() {
  const site = usePublicSite();
  const content = site?.settings.siteContent || defaultSiteContent();

  if (!content.safetyItems.length) return null;

  return (
    <section id="seguranca" className="bg-navy py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          eyebrow={content.safety.eyebrow}
          title={content.safety.title}
          description={content.safety.description}
          dark
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.safetyItems.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
              >
                <Card dark className="h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sun/10 text-sun">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{item.detail}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
