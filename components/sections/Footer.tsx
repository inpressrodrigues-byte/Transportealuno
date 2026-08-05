"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { InstagramGlyph, FacebookGlyph } from "@/components/ui/SocialIcons";
import { usePublicSite } from "@/lib/use-public-site";
import { defaultSiteContent } from "@/lib/site-content";

export function Footer() {
  const site = usePublicSite();
  const settings = site?.settings;
  const content = settings?.siteContent || defaultSiteContent();
  const businessName = settings?.businessName || "Oziel Turismo";
  const document = settings?.document || "00.000.000/0001-00";
  const cols = [
    {
      title: content.footer.navigationTitle,
      links: [
        { label: content.navigation.home, href: "#inicio" },
        { label: content.navigation.about, href: "#sobre" },
        { label: content.van.eyebrow, href: "#van" },
        { label: content.navigation.neighborhoods, href: "#rotas" },
      ],
    },
    {
      title: content.footer.institutionalTitle,
      links: [
        { label: content.navigation.schools, href: "#escolas" },
        { label: content.navigation.safety, href: "#seguranca" },
        { label: content.navigation.contact, href: "#contato" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-navy-2 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <BrandLogo className="w-52" />
            <p className="mt-4 text-sm leading-relaxed text-white/50">
              {content.footer.description}
            </p>
            <div className="mt-4 flex gap-3">
              {content.contact.instagramUrl && <a href={content.contact.instagramUrl} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-sun" aria-label="Instagram">
                <InstagramGlyph size={15} />
              </a>}
              {content.contact.facebookUrl && <a href={content.contact.facebookUrl} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-sun" aria-label="Facebook">
                <FacebookGlyph size={15} />
              </a>}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-sm font-semibold text-white">{c.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-white/50 hover:text-sun">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-semibold text-white">{content.footer.clientAreaTitle}</h4>
            <p className="mt-4 text-sm text-white/50">
              {content.footer.clientAreaDescription}
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white hover:border-sun/50"
            >
              {content.footer.clientAreaButton}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} {businessName}. {content.footer.rightsText}</span>
          <span>{content.footer.documentPrefix} {document}</span>
        </div>
      </div>
    </footer>
  );
}
