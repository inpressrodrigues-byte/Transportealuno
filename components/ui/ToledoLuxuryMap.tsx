"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NeighborhoodRecord } from "@/lib/app-types";
import { cn } from "@/lib/utils";

type MapShape = NeighborhoodRecord & {
  latitude: number;
  longitude: number;
  boundary: [number, number][];
};

export type LeafletMapInstance = {
  remove: () => void;
  fitBounds: (bounds: unknown, options?: Record<string, unknown>) => void;
  setView: (center: [number, number], zoom: number) => void;
};

export type LeafletMarker = {
  remove: () => void;
  addTo: (map: LeafletMapInstance) => LeafletMarker;
  bindTooltip: (content: string, options: Record<string, unknown>) => LeafletMarker;
};

export type LeafletBounds = {
  pad: (ratio: number) => LeafletBounds;
};

export type LeafletNamespace = {
  map: (element: HTMLDivElement, options: Record<string, unknown>) => LeafletMapInstance;
  tileLayer: (url: string, options: Record<string, unknown>) => { addTo: (map: LeafletMapInstance) => void };
  control: {
    zoom: (options: Record<string, unknown>) => { addTo: (map: LeafletMapInstance) => void };
    attribution: (options: Record<string, unknown>) => { addTo: (map: LeafletMapInstance) => void };
  };
  marker: (
    coordinates: [number, number],
    options: Record<string, unknown>
  ) => LeafletMarker;
  polygon: (
    coordinates: [number, number][],
    options: Record<string, unknown>
  ) => LeafletMarker;
  divIcon: (options: Record<string, unknown>) => unknown;
  latLngBounds: (coordinates: [number, number][]) => LeafletBounds;
};

const TOLEDO_CENTER: [number, number] = [-24.7246, -53.7412];

const TOLEDO_VIEWPORT = {
  north: -24.668,
  south: -24.79,
  west: -53.835,
  east: -53.655,
};

export function ToledoLuxuryMap({ neighborhoods }: { neighborhoods: NeighborhoodRecord[] }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [ready, setReady] = useState(false);

  const shapes = useMemo(() => neighborhoods.map(toMapShape), [neighborhoods]);

  useEffect(() => {
    let cancelled = false;

    const setupMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = await loadLeaflet();
      if (cancelled || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: TOLEDO_CENTER,
        zoom: 12,
        minZoom: 11,
        maxZoom: 17,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);

      mapRef.current = map;
      setReady(true);
    };

    setupMap();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let cancelled = false;

    const renderBoundaries = async () => {
      const L = await loadLeaflet();
      if (cancelled) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      shapes.forEach((shape) => {
        const color = shape.served ? shape.color || "#d6b36a" : "#9ca3af";
        const boundary = L.polygon(shape.boundary, {
          className: cn("toledo-neighborhood-outline", shape.served ? "is-served" : "is-muted"),
          color,
          dashArray: shape.served ? "8 0" : "4 6",
          fillColor: color,
          fillOpacity: shape.served ? 0.16 : 0.05,
          interactive: false,
          opacity: shape.served ? 0.95 : 0.45,
          smoothFactor: 1,
          weight: shape.served ? 2.6 : 1.8,
        }).addTo(map);

        markersRef.current.push(boundary);
      });

      const allCoordinates = shapes.flatMap((shape) => shape.boundary);
      if (allCoordinates.length > 1) {
        const bounds = L.latLngBounds(allCoordinates);
        map.fitBounds(bounds.pad(0.08), { animate: false, maxZoom: 13 });
      } else {
        map.setView(TOLEDO_CENTER, 12);
      }
    };

    renderBoundaries();

    return () => {
      cancelled = true;
    };
  }, [shapes]);

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-[#c6a15b]/35 bg-[#f4f0e7] p-2 shadow-[0_28px_80px_rgba(0,0,0,0.34)]">
      <div
        ref={mapContainerRef}
        className="luxury-real-map h-[520px] min-h-[420px] w-full overflow-hidden rounded-[18px]"
      />

      {!ready && (
        <div className="absolute inset-2 flex items-center justify-center rounded-[18px] bg-[#f4f0e7] text-sm font-semibold text-[#8a6b2f]">
          Carregando mapa real de Toledo
        </div>
      )}
    </div>
  );
}

function toMapShape(neighborhood: NeighborhoodRecord): MapShape {
  const x = clamp(Number(neighborhood.position?.x ?? 50), 0, 100);
  const y = clamp(Number(neighborhood.position?.y ?? 50), 0, 100);
  const latitude = TOLEDO_VIEWPORT.north - (y / 100) * (TOLEDO_VIEWPORT.north - TOLEDO_VIEWPORT.south);
  const longitude = TOLEDO_VIEWPORT.west + (x / 100) * (TOLEDO_VIEWPORT.east - TOLEDO_VIEWPORT.west);
  const key = slugify(neighborhood.name);
  const boundary = NEIGHBORHOOD_BOUNDARIES[key] || ellipseBoundary([latitude, longitude], 0.0065, 0.011);

  return {
    ...neighborhood,
    latitude,
    longitude,
    boundary,
  };
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function ellipseBoundary(center: [number, number], latRadius: number, lngRadius: number) {
  return Array.from({ length: 18 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 18;
    return [
      center[0] + Math.sin(angle) * latRadius,
      center[1] + Math.cos(angle) * lngRadius,
    ] as [number, number];
  });
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const NEIGHBORHOOD_BOUNDARIES: Record<string, [number, number][]> = {
  "sao-francisco": [
    [-24.7028, -53.7904],
    [-24.6974, -53.7726],
    [-24.7048, -53.7545],
    [-24.7237, -53.7556],
    [-24.7357, -53.7712],
    [-24.7289, -53.7932],
  ],
  "vila-pioneiro": [
    [-24.7362, -53.7415],
    [-24.7328, -53.7181],
    [-24.7468, -53.7068],
    [-24.7657, -53.7146],
    [-24.7711, -53.7355],
    [-24.7518, -53.7462],
  ],
  centro: [
    [-24.7144, -53.7518],
    [-24.7102, -53.7358],
    [-24.7226, -53.7215],
    [-24.7378, -53.7316],
    [-24.7344, -53.7511],
  ],
  "jardim-la-salle": [
    [-24.7039, -53.7646],
    [-24.7048, -53.7424],
    [-24.7208, -53.7355],
    [-24.7322, -53.7476],
    [-24.7244, -53.7673],
  ],
  "vila-industrial": [
    [-24.7352, -53.7704],
    [-24.7292, -53.7508],
    [-24.7465, -53.7382],
    [-24.7624, -53.7535],
    [-24.7558, -53.7738],
  ],
  "jardim-porto-alegre": [
    [-24.7066, -53.7054],
    [-24.7044, -53.6818],
    [-24.7242, -53.6726],
    [-24.7392, -53.6908],
    [-24.7296, -53.7116],
  ],
  "jardim-gisela": [
    [-24.7382, -53.7168],
    [-24.7365, -53.6942],
    [-24.7554, -53.6856],
    [-24.7696, -53.7045],
    [-24.7568, -53.7224],
  ],
  "jardim-coopagro": [
    [-24.7142, -53.8056],
    [-24.7068, -53.7842],
    [-24.7244, -53.7718],
    [-24.7415, -53.7882],
    [-24.7336, -53.8105],
  ],
  "jardim-panorama": [
    [-24.7528, -53.7554],
    [-24.7485, -53.7346],
    [-24.7676, -53.7228],
    [-24.7835, -53.7415],
    [-24.7756, -53.7628],
  ],
  "jardim-maracana": [
    [-24.6838, -53.7416],
    [-24.6855, -53.7195],
    [-24.7048, -53.7138],
    [-24.7164, -53.7316],
    [-24.7025, -53.7511],
  ],
};

declare global {
  interface Window {
    L?: LeafletNamespace;
    __toledoLeafletPromise?: Promise<LeafletNamespace>;
  }
}

export function loadLeaflet() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet so carrega no navegador."));
  }

  if (window.L) return Promise.resolve(window.L);
  if (window.__toledoLeafletPromise) return window.__toledoLeafletPromise;

  window.__toledoLeafletPromise = new Promise<LeafletNamespace>((resolve, reject) => {
    if (!document.querySelector("link[data-toledo-leaflet]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
      link.setAttribute("data-toledo-leaflet", "true");
      document.head.appendChild(link);
    }

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-toledo-leaflet]");
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.L) resolve(window.L);
        else reject(new Error("Leaflet nao ficou disponivel."));
      });
      existingScript.addEventListener("error", () => reject(new Error("Falha ao carregar Leaflet.")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.setAttribute("data-toledo-leaflet", "true");
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("Leaflet nao ficou disponivel."));
    };
    script.onerror = () => reject(new Error("Falha ao carregar Leaflet."));
    document.body.appendChild(script);
  });

  return window.__toledoLeafletPromise;
}
