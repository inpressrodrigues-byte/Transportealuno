"use client";

export function RouteDivider({ dark = false }: { dark?: boolean }) {
  return (
    <div className="relative h-10 w-full overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="h-full w-full">
        <path
          d="M0 20 Q 300 0 600 20 T 1200 20"
          fill="none"
          stroke={dark ? "color-mix(in srgb, var(--color-sun) 35%, transparent)" : "color-mix(in srgb, var(--color-navy) 15%, transparent)"}
          strokeWidth="2"
          className="route-line route-line-animated"
        />
      </svg>
    </div>
  );
}

/**
 * Larger illustrative route map used in the hero: a schematic navy
 * "departures board" panel showing stops as dots along a dashed path,
 * with a small van marker continuously travelling the route.
 */
export function HeroRouteMap() {
  const pathD = "M 20 160 C 120 40, 260 260, 380 120 S 560 20, 700 120";

  return (
    <div className="relative mx-auto aspect-[18/5] min-h-28 w-full max-w-5xl">
      <svg viewBox="0 0 720 200" className="h-full w-full overflow-visible">
        <path
          d={pathD}
          fill="none"
          stroke="rgba(250,204,21,0.9)"
          strokeWidth="3"
          className="route-line route-line-animated"
        />
        {[
          { x: 20, y: 160, label: "Jd. Porto Alegre" },
          { x: 380, y: 120, label: "Centro" },
          { x: 700, y: 120, label: "Colégio Horizonte" },
        ].map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r="7" fill="var(--color-navy)" stroke="var(--color-sun)" strokeWidth="2" />
          </g>
        ))}
      </svg>

      <div
        className="absolute left-0 top-0 h-9 w-9 -translate-x-1/2 -translate-y-1/2 van-on-route motion-reduce:hidden"
        style={{ ["--path" as string]: `path("${pathD}")` }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sun shadow-lg shadow-black/30">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6v6M2 12h13l3 3h3a1 1 0 0 0 1-1v-3a2 2 0 0 0-2-2h-2l-2.5-4A2 2 0 0 0 13.7 4H4a2 2 0 0 0-2 2v6Z" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
