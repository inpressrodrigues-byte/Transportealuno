"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NeighborhoodRecord } from "@/lib/app-types";
import { cn } from "@/lib/utils";

type MapPoint = NeighborhoodRecord & {
  latitude: number;
  longitude: number;
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

  const points = useMemo(() => neighborhoods.map(toMapPoint), [neighborhoods]);

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

    const renderMarkers = async () => {
      const L = await loadLeaflet();
      if (cancelled) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      points.forEach((point) => {
        const marker = L.marker([point.latitude, point.longitude], {
          icon: L.divIcon({
            className: cn("toledo-lux-marker", point.served ? "is-served" : "is-muted"),
            html: markerHtml(point),
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
          keyboard: false,
        }).addTo(map);

        markersRef.current.push(marker);
      });

      if (points.length > 1) {
        const bounds = L.latLngBounds(points.map((point) => [point.latitude, point.longitude]));
        map.fitBounds(bounds.pad(0.18), { animate: false, maxZoom: 13 });
      } else {
        map.setView(TOLEDO_CENTER, 12);
      }
    };

    renderMarkers();

    return () => {
      cancelled = true;
    };
  }, [points]);

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

function toMapPoint(neighborhood: NeighborhoodRecord): MapPoint {
  const x = clamp(Number(neighborhood.position?.x ?? 50), 0, 100);
  const y = clamp(Number(neighborhood.position?.y ?? 50), 0, 100);
  const latitude = TOLEDO_VIEWPORT.north - (y / 100) * (TOLEDO_VIEWPORT.north - TOLEDO_VIEWPORT.south);
  const longitude = TOLEDO_VIEWPORT.west + (x / 100) * (TOLEDO_VIEWPORT.east - TOLEDO_VIEWPORT.west);

  return {
    ...neighborhood,
    latitude,
    longitude,
  };
}

function markerHtml(point: MapPoint) {
  const color = point.served ? "#d6b36a" : "#9ca3af";

  return `<span class="marker-dot" style="--marker-color:${escapeHtml(color)}" aria-label="${escapeHtml(point.name)}"></span>`;
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

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
