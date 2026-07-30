"use client";

import { useEffect, useState } from "react";
import type { CompanySettings, NeighborhoodRecord, SchoolRecord, ThemeSettings } from "@/lib/app-types";

export type PublicSitePayload = {
  settings: CompanySettings;
  theme: ThemeSettings;
  schools: SchoolRecord[];
  neighborhoods: NeighborhoodRecord[];
};

export function usePublicSite() {
  const [site, setSite] = useState<PublicSitePayload | null>(null);

  useEffect(() => {
    let alive = true;

    fetch("/api/public/site", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: PublicSitePayload) => {
        if (alive) setSite(payload);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return site;
}
