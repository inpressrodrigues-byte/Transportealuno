"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bus, CalendarClock, CheckCircle2, Loader2, MapPin, Navigation, Power, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LiveRouteMap } from "@/components/ui/LiveRouteMap";
import type {
  CheckinRecord,
  ChildAbsenceStatus,
  ChildRecord,
  LiveTrackingState,
  SafeParentRecord,
  SchoolRecord,
} from "@/lib/app-types";

type DriverRoutePayload = {
  schools: SchoolRecord[];
  parents: SafeParentRecord[];
  children: ChildRecord[];
  checkins: CheckinRecord[];
};

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
  const [routeState, setRouteState] = useState<DriverRoutePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [manual, setManual] = useState({
    currentNeighborhood: "Centro",
    nextStop: "Primeiro embarque",
    estimatedMinutes: "8",
  });

  const loadRouteState = useCallback(async () => {
    const response = await fetch("/api/driver/route-state", { cache: "no-store" });
    if (response.ok) {
      setRouteState((await response.json()) as DriverRoutePayload);
    }
  }, []);

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

    const firstRouteStateTimer = window.setTimeout(() => {
      loadRouteState().catch(() => {});
    }, 0);
    const timer = window.setInterval(() => {
      loadRouteState().catch(() => {});
    }, 12000);

    return () => {
      alive = false;
      window.clearTimeout(firstRouteStateTimer);
      window.clearInterval(timer);
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [loadRouteState]);

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

  const notices = routeState?.children.filter((child) => child.absenceStatus !== "going") ?? [];
  const recentCheckins = routeState?.checkins.slice(0, 8) ?? [];
  const childName = (id: string) => routeState?.children.find((child) => child.id === id)?.name || "Aluno";
  const parentName = (id: string) => routeState?.parents.find((parent) => parent.id === id)?.name || "Responsavel";
  const schoolName = (id: string) => routeState?.schools.find((school) => school.id === id)?.name || "Escola";

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
              <StatusLine label="Proxima parada" value={live.nextStop || "Nao informada"} />
              <StatusLine label="Ultimo sinal" value={live.lastSeenAt ? new Date(live.lastSeenAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Sem sinal"} />
            </div>
            <div className="mt-4">
              <LiveRouteMap live={live} compact />
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

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun">Avisos dos pais</p>
              <h2 className="mt-2 text-2xl font-semibold">Hoje na rota</h2>
            </div>
            <CalendarClock className="text-sun" size={22} />
          </div>

          <div className="mt-5 space-y-3">
            {notices.length === 0 && <EmptyState text="Nenhum aviso de ausencia no momento." />}
            {notices.map((child) => (
              <div key={child.id} className="rounded-2xl bg-white/10 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold">{child.name}</div>
                    <div className="text-sm text-white/55">{parentName(child.parentId)} - {schoolName(child.schoolId)}</div>
                  </div>
                  <AbsenceBadge status={child.absenceStatus} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun">Seguranca</p>
              <h2 className="mt-2 text-2xl font-semibold">Check-ins recentes</h2>
            </div>
            <CheckCircle2 className="text-sun" size={22} />
          </div>

          <div className="mt-5 space-y-3">
            {recentCheckins.length === 0 && <EmptyState text="Nenhum check-in registrado ainda." />}
            {recentCheckins.map((checkin) => (
              <div key={checkin.id} className="rounded-2xl bg-white/10 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold">{childName(checkin.childId)}</div>
                    <div className="text-sm text-white/55">
                      {parentName(checkin.parentId)} - {new Date(checkin.scannedAt).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <span className="rounded-full bg-ok/10 px-3 py-1 text-xs font-semibold text-ok">
                    {checkin.type === "returning" ? "Volta" : "Embarque"}
                  </span>
                </div>
                {typeof checkin.latitude === "number" && typeof checkin.longitude === "number" && (
                  <a
                    href={`https://www.google.com/maps?q=${checkin.latitude},${checkin.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex text-sm font-semibold text-sun hover:underline"
                  >
                    Abrir localizacao
                  </a>
                )}
              </div>
            ))}
          </div>
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

function AbsenceBadge({ status }: { status: ChildAbsenceStatus }) {
  return (
    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${absenceClass(status)}`}>
      {absenceLabel(status)}
    </span>
  );
}

function absenceLabel(status: ChildAbsenceStatus) {
  const labels: Record<ChildAbsenceStatus, string> = {
    going: "Vai hoje",
    not_going: "Nao vou hoje",
    not_returning: "Nao volto",
  };

  return labels[status];
}

function absenceClass(status: ChildAbsenceStatus) {
  const classes: Record<ChildAbsenceStatus, string> = {
    going: "bg-ok/10 text-ok",
    not_going: "bg-red-500/10 text-red-200",
    not_returning: "bg-sun/15 text-sun",
  };

  return classes[status];
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/50">
      {text}
    </div>
  );
}
