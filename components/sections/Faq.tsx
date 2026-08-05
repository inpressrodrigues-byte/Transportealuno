"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { usePublicSite } from "@/lib/use-public-site";
import { defaultSiteContent } from "@/lib/site-content";

export function Faq() {
  const site = usePublicSite();
  const content = site?.settings.siteContent || defaultSiteContent();
  const [open, setOpen] = useState<number | null>(0);

  if (!content.faqItems.length) return null;

  return (
    <section className="bg-mist py-24 sm:py-32 dark:bg-[#121211]">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading eyebrow={content.faq.eyebrow} title={content.faq.title} align="center" />

        <div className="mt-12 divide-y divide-line rounded-lg border border-line bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.04]">
          {content.faqItems.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.id}>
                <button onClick={() => setOpen(isOpen ? null : index)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left" aria-expanded={isOpen}>
                  <span className="font-medium text-navy dark:text-white">{item.question}</span>
                  <Plus size={18} className={cn("shrink-0 text-mute transition-transform duration-300", isOpen && "rotate-45 text-sun-2")} />
                </button>
                <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-mute dark:text-white/60">{item.answer}</p>
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
