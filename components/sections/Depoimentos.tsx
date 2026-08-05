"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star, UserRound } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { usePublicSite } from "@/lib/use-public-site";
import { defaultSiteContent } from "@/lib/site-content";

export function Depoimentos() {
  const site = usePublicSite();
  const content = site?.settings.siteContent || defaultSiteContent();
  const items = content.testimonialItems;
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (items.length < 2) return;
    timer.current = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 5500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [items.length]);

  if (!items.length) return null;

  const visibleIndex = index % items.length;

  const go = (direction: number) => {
    if (timer.current) clearInterval(timer.current);
    setIndex((current) => (current + direction + items.length) % items.length);
  };

  return (
    <section className="bg-mist py-24 sm:py-32 dark:bg-[#121211]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow={content.testimonials.eyebrow} title={content.testimonials.title} />
          {items.length > 1 && (
            <div className="flex gap-2">
              <button onClick={() => go(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-navy hover:bg-mist dark:border-white/10 dark:bg-white/[0.06] dark:text-white" aria-label="Depoimento anterior">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => go(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-navy hover:bg-mist dark:border-white/10 dark:bg-white/[0.06] dark:text-white" aria-label="Proximo depoimento">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 overflow-hidden">
          <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${visibleIndex * 100}%)` }}>
            {items.map((item) => (
              <div key={item.id} className="w-full shrink-0 px-1">
                <div className="mx-auto grid max-w-3xl grid-cols-1 items-center gap-6 rounded-lg bg-white p-8 shadow-sm dark:border dark:border-white/10 dark:bg-white/[0.04] sm:grid-cols-[auto_1fr]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-sun">
                    <UserRound size={26} />
                  </div>
                  <div>
                    <div className="flex gap-0.5 text-sun">
                      {Array.from({ length: 5 }).map((_, star) => <Star key={star} size={14} fill="currentColor" strokeWidth={0} />)}
                    </div>
                    <p className="mt-3 text-base leading-relaxed text-ink dark:text-white/80">&ldquo;{item.quote}&rdquo;</p>
                    <div className="mt-4 text-sm font-semibold text-navy dark:text-white">{item.name}</div>
                    <div className="text-xs text-mute dark:text-white/60">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {items.length > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {items.map((item, itemIndex) => (
              <button
                key={item.id}
                onClick={() => setIndex(itemIndex)}
                className={`h-1.5 rounded-full transition-all ${itemIndex === visibleIndex ? "w-6 bg-sun-2" : "w-1.5 bg-line"}`}
                aria-label={`Ir para depoimento ${itemIndex + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
