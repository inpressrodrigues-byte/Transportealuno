"use client";

import { useEffect } from "react";
import type { ThemeSettings } from "@/lib/app-types";

const cssVarMap: Record<keyof ThemeSettings, string> = {
  navy: "--color-navy",
  navy2: "--color-navy-2",
  ink: "--color-ink",
  mute: "--color-mute",
  mist: "--color-mist",
  cloud: "--color-cloud",
  sun: "--color-sun",
  sun2: "--color-sun-2",
  ok: "--color-ok",
};

export function ThemeRuntime() {
  useEffect(() => {
    let alive = true;

    fetch("/api/public/site", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { theme?: ThemeSettings }) => {
        if (!alive || !payload.theme) return;

        Object.entries(cssVarMap).forEach(([key, variable]) => {
          const color = payload.theme?.[key as keyof ThemeSettings];
          if (color) document.documentElement.style.setProperty(variable, color);
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return null;
}
