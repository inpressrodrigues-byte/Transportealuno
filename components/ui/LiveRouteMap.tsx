"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import type { LiveTrackingState } from "@/lib/app-types";
import { cn } from "@/lib/utils";
import { loadLeaflet, type LeafletMapInstance, type LeafletMarker } from "@/components/ui/ToledoLuxuryMap";

const TOLEDO_CENTER: [number, number] = [-24.7246, -53.7412];

export function LiveRouteMap({
  live,
  compact = false,
}: {
  live: LiveTrackingState;
  compact?: boolean;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const [ready, setReady] = useState(false);

  const hasGps = typeof live.latitude === "number" && typeof live.longitude === "number";
  const center = useMemo<[number, number]>(() => {
    if (hasGps) return [live.latitude as number, live.longitude as number];
    return TOLEDO_CENTER;
  }, [hasGps, live.latitude, live.longitude]);
  const initialCenterRef = useRef(center);
  const initialHasGpsRef = useRef(hasGps);

  useEffect(() => {
    let cancelled = false;

    const setupMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = await loadLeaflet();
      if (cancelled || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: initialCenterRef.current,
        zoom: initialHasGpsRef.current ? 15 : 12,
        minZoom: 11,
        maxZoom: 18,
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
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

    const renderLiveMarker = async () => {
      const L = await loadLeaflet();
      if (cancelled) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.setView(center, hasGps ? 15 : 12);

      if (hasGps) {
        const marker = L.marker(center, {
          icon: L.divIcon({
            className: "live-route-marker",
            html: `<span class="live-route-pulse"></span><span class="live-route-pin">${vanIcon()}</span>`,
            iconSize: [58, 58],
            iconAnchor: [29, 29],
          }),
          keyboard: false,
        })
          .addTo(map)
          .bindTooltip(
            `${escapeHtml(live.driverName || "Motorista")} - ${escapeHtml(live.currentNeighborhood || "em rota")}`,
            {
              className: "toledo-lux-tooltip",
              direction: "top",
              offset: [0, -18],
            }
          );

        markersRef.current.push(marker);
      }
    };

    renderLiveMarker();

    return () => {
      cancelled = true;
    };
  }, [center, hasGps, live.currentNeighborhood, live.driverName]);

  const mapsHref = hasGps
    ? `https://www.google.com/maps?q=${live.latitude},${live.longitude}`
    : "https://www.google.com/maps/search/?api=1&query=Toledo%20PR";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white shadow-sm">
      <div
        ref={mapContainerRef}
        className={cn("live-route-map w-full", compact ? "h-64" : "h-[420px]")}
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-white text-sm font-semibold text-navy">
          Carregando mapa da cidade
        </div>
      )}

      <div className="pointer-events-none absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-navy shadow-xl backdrop-blur">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-mute">
          <Navigation size={13} /> {live.active ? "Rota em andamento" : "Aguardando motorista"}
        </div>
        <div className="mt-1 text-sm font-semibold">
          {live.active
            ? live.currentNeighborhood || "Em deslocamento"
            : "A localizacao aparece quando a rota iniciar"}
        </div>
        {live.active && (
          <div className="mt-1 text-xs text-mute">
            Chegada estimada: {live.estimatedMinutes || 0} min
          </div>
        )}
      </div>

      <a
        href={mapsHref}
        target="_blank"
        rel="noreferrer"
        className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-bold text-white shadow-xl transition hover:bg-navy-2"
      >
        <MapPin size={14} /> Abrir no mapa
      </a>
    </div>
  );
}

function vanIcon() {
  return "van";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
