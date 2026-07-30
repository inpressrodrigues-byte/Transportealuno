"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bus, Loader2, MapPin, Navigation, Power, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { LiveTrackingState } from "@/lib/app-types";

const emptyLive: LiveTrackingState = {
  active: false,
  driverName: "Motorista",
  startedAt: "",
  lastSeenAt: "",
  currentNeighborhood: "Centro",
  nextStop: "Primeiro embarque",
  estimatedMinutes: 0,
  source: "manual",
};

export default function DriverPage() {
  const watchId = useRef<number | null>(null);
  const [live, setLive] = useState<LiveTrackingState>(emptyLive);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [manual, setManual] = useState({
    currentNeighborhood: "Centro",
    nextStop: "Primeiro embarque",
    estimatedMinutes: "8",
  });

  useEffect(() => {
    let alive = true;

    fetch("/api/driver/live", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: LiveTrackingState) => {
        if (!alive) return;
        setLive(payload);
        setManual((current) => ({
          currentNeighborhood: payload.currentNeighborhood || current.currentNeighborhood,
          nextStop: payload.nextStop || current.nextStop,
          estimatedMinutes: String(payload.estimatedMinutes || current.estimatedMinutes),
        }));
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  const postLive = async (payload: Partial<LiveTrackingState>) => {
    const response = await fetch("/api/driver/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        currentNeighborhood: manual.currentNeighborhood,
        nextStop: manual.nextStop,
        estimatedMinutes: Number(manual.estimatedMinutes || 0),
      }),
    });
    const updated = (await response.json()) as LiveTrackingState;
    setLive(updated);
  };

  const startRoute = async () => {
    setSaving("start");
    setMessage("");

    if (!navigator.geolocation) {
      await postLive({ active: true, source: "manual" });
      setMessage("Ao vivo ligado sem GPS. Atualize manualmente quando precisar.");
      setSaving("");
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        await postLive({
          active: true,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          source: "gps",
        });
        setMessage("Localizacao enviada para os responsaveis.");
        setSaving("");
      },
      async () => {
        await postLive({ active: true, source: "manual" });
        setMessage("GPS nao liberado. Ao vivo ligado em modo manual.");
        setSaving("");
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 }
    );
  };

  const sendManualUpdate = async () => {
    setSaving("manual");
    await postLive({ active: true, source: "manual" });
    setMessage("Atualizacao enviada.");
    setSaving("");
  };

  const stopRoute = async () => {
    setSaving("stop");
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    await postLive({ active: false, source: "manual" });
    setMessage("Ao vivo encerrado.");
    setSaving("");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy text-white">
        <Loader2 className="animate-spin text-sun" size={28} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy px-4 py-6 text-white">
      <div className="mx-auto max-w-xl">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-sun">
          <ArrowLeft size={16} /> Voltar ao admin
        </Link>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun">Motorista</p>
              <h1 className="mt-2 text-3xl font-semibold">Ao vivo da rota</h1>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sun text-navy">
              <Bus size={20} />
            </span>
          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-white/55">Status</div>
                <div className="mt-1 text-lg font-semibold">{live.active ? "AO VIVO ligado" : "AO VIVO desligado"}</div>
              </div>
              <span className={live.active ? "text-ok" : "text-white/45"}>
                <Navigation size={24} />
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatusLine label="Bairro" value={live.currentNeighborhood || "Sem bairro"} />
              <StatusLine label="Previsao" value={live.active ? `${live.estimatedMinutes || 0} min` : "Indisponivel"} />
              <StatusLine label="Latitude" value={live.latitude ? live.latitude.toFixed(5) : "Sem GPS"} />
              <StatusLine label="Longitude" value={live.longitude ? live.longitude.toFixed(5) : "Sem GPS"} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Field label="Bairro atual" value={manual.currentNeighborhood} onChange={(v) => setManual({ ...manual, currentNeighborhood: v })} />
            <Field label="Proxima parada" value={manual.nextStop} onChange={(v) => setManual({ ...manual, nextStop: v })} />
            <Field label="Estimativa ate chegar (min)" value={manual.estimatedMinutes} onChange={(v) => setManual({ ...manual, estimatedMinutes: v })} type="number" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button type="button" className="w-full" onClick={startRoute} disabled={saving === "start"}>
              <MapPin size={16} /> Iniciar com GPS
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={sendManualUpdate} disabled={saving === "manual"}>
              <Send size={16} /> Atualizar
            </Button>
            <Button type="button" variant="outline" className="w-full sm:col-span-2" onClick={stopRoute} disabled={saving === "stop"}>
              <Power size={16} /> Encerrar rota
            </Button>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl border border-sun/30 bg-sun/10 px-4 py-3 text-sm font-semibold text-sun">
              {message}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-wide text-white/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-sun"
      />
    </label>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-navy/40 p-3">
      <div className="text-xs uppercase tracking-wide text-white/40">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
