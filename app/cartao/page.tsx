"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Loader2, Share2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { usePublicSite } from "@/lib/use-public-site";
import { defaultSiteContent } from "@/lib/site-content";

export default function BusinessCardPage() {
  const site = usePublicSite();
  const [shared, setShared] = useState(false);
  const content = site?.settings.siteContent || defaultSiteContent();
  const card = site?.settings.businessCard;

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${site?.settings.brandName || "Oziel Turismo"} - Cartao de visitas`,
          text: content.businessCard.description,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 2500);
      }
    } catch {
      // The native share sheet can be dismissed without showing an error.
    }
  };

  if (!site) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy text-white">
        <Loader2 className="animate-spin text-sun" size={26} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy px-4 py-8 text-white sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white">
            <ArrowLeft size={16} /> {content.businessCard.backButton}
          </Link>
          <BrandLogo className="w-40 sm:w-52" />
        </div>

        <section className="mx-auto mt-12 max-w-3xl text-center sm:mt-16">
          <p className="text-xs font-semibold uppercase text-sun">{content.businessCard.eyebrow}</p>
          <h1 className="mt-4 font-[family-name:var(--font-luxury)] text-4xl font-normal sm:text-6xl">
            {content.businessCard.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-white/60">
            {content.businessCard.description}
          </p>
        </section>

        {card?.url ? (
          <div className="mx-auto mt-10 max-w-3xl">
            <figure className="overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl shadow-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.url} alt="Cartao de visitas da Oziel Turismo" className="h-auto w-full object-contain" />
            </figure>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a href={card.url} target="_blank" rel="noreferrer">
                <Button size="lg" className="w-full sm:w-auto">
                  <ExternalLink size={16} /> {content.businessCard.openButton}
                </Button>
              </a>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={share}>
                {shared ? <Check size={16} /> : <Share2 size={16} />}
                {shared ? content.businessCard.copiedText : content.businessCard.shareButton}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-10 max-w-xl border-y border-white/10 py-10 text-center text-sm text-white/55">
            {content.businessCard.unavailableText}
          </div>
        )}
      </div>
    </main>
  );
}
