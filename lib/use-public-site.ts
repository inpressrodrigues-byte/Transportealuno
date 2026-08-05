"use client";

import { useEffect, useState } from "react";
import type { CompanySettings, GalleryPhotoRecord, NeighborhoodRecord, SchoolRecord, ThemeSettings } from "@/lib/app-types";

export type PublicSitePayload = {
  settings: CompanySettings;
  theme: ThemeSettings;
  schools: SchoolRecord[];
  neighborhoods: NeighborhoodRecord[];
  galleryPhotos: GalleryPhotoRecord[];
};

let cachedSite: PublicSitePayload | null = null;
let cachedAt = 0;
let pendingRequest: Promise<PublicSitePayload> | null = null;

export function loadPublicSite() {
  if (cachedSite && Date.now() - cachedAt < 5000) return Promise.resolve(cachedSite);
  if (pendingRequest) return pendingRequest;

  pendingRequest = fetch("/api/public/site", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Nao foi possivel carregar os dados publicos.");
      return response.json() as Promise<PublicSitePayload>;
    })
    .then((payload) => {
      cachedSite = payload;
      cachedAt = Date.now();
      return payload;
    })
    .finally(() => {
      pendingRequest = null;
    });

  return pendingRequest;
}

export function usePublicSite() {
  const [site, setSite] = useState<PublicSitePayload | null>(cachedSite);

  useEffect(() => {
    let alive = true;

    loadPublicSite()
      .then((payload) => {
        if (alive) setSite(payload);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return site;
}
