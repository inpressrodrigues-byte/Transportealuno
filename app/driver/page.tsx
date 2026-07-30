"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bus,
  CalendarClock,
  CheckCircle2,
  IdCard,
  Loader2,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  Power,
  Route,
  Send,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LiveRouteMap } from "@/components/ui/LiveRouteMap";
import type {
  CheckinRecord,
  ChildAbsenceStatus,
  ChildRecord,
  CompanySettings,
  LiveTrackingState,
  RoutePlanRecord,
  SafeDriverRecord,
  SafeParentRecord,
  SchoolRecord,
  SessionUser,
  VanQrCodeRecord,
  VanRecord,
} from "@/lib/app-types";
import { formatPhone, shiftLabel } from "@/lib/app-utils";

type DriverRoutePayload = {
  settings: CompanySettings;
  driver: SafeDriverRecord | null;
  van: VanRecord | null;
  liveTracking: LiveTrackingState;
  schools: SchoolRecord[];
  parents: SafeParentRecord[];
  children: ChildRecord[];
  checkins: CheckinRecord[];
  vanQrCode: VanQrCodeRecord;
  routePlan: RoutePlanRecord | null;
};

const emptyLive: LiveTrackingState = {
  id: "live_empty",
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
  const heartbeatId = useRef<number | null>(null);
  const latestGps = useRef<Pick<LiveTrackingState, "latitude" | "longitude" | "accuracy" | "speed">>({});
  const [session, setSession] = useState<SessionUser | null>(null);
  const [live, setLive] = useState<LiveTrackingState>(emptyLive);
  const [routeState, setRouteState] = useState<DriverRoutePayload | null>(null);
  const [routePlan, setRoutePlan] = useState<RoutePlanRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginForm, setLoginForm] = useState({ contact: "", password: "" });
  const [manual, setManual] = useState({
    currentNeighborhood: "Centro",
    nextStop: "Primeiro embarque",
    estimatedMinutes: "8",
  });

  const driverId = session?.role === "driver" ? session.id : "";

  const loadRouteState = useCallback(async () => {
    if (!driverId) return;
    const response = await fetch(`/api/driver/route-state?driverId=${encodeURIComponent(driverId)}`, { cache: "no-store" });
    if (response.ok) {
      const payload = (await response.json()) as DriverRoutePayload;
      setRouteState(payload);
      setRoutePlan(payload.routePlan || null);
      setLive(payload.liveTracking || emptyLive);
    }
  }, [driverId]);

  useEffect(() => {
    let mounted = true;
    const frame = window.requestAnimationFrame(() => {
      if (!mounted) return;
      const raw = localStorage.getItem("rota-segura-session");
      const parsed = raw ? (JSON.parse(raw) as SessionUser) : null;
      if (parsed?.role === "driver") setSession(parsed);
      setLoading(false);
    });

    return () => {
      mounted = false;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!driverId) return;
    let alive = true;

    fetch(`/api/driver/live?driverId=${encodeURIComponent(driverId)}`, { cache: "no-store" })
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
      .catch(() => {});

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
      if (heartbeatId.current !== null) window.clearInterval(heartbeatId.current);
    };
  }, [driverId, loadRouteState]);

  const loginDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("login");
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const payload = (await response.json()) as { user?: SessionUser; error?: string };

      if (!response.ok || !payload.user) {
        setLoginError(payload.error || "Nao foi possivel entrar.");
        return;
      }

      if (payload.user.role !== "driver") {
        setLoginError("Este acesso nao pertence a area dos motoristas.");
        return;
      }

      localStorage.setItem("rota-segura-session", JSON.stringify(payload.user));
      window.dispatchEvent(new Event("rota-segura-session"));
      setSession(payload.user);
    } catch {
      setLoginError("Falha ao conectar com o sistema.");
    } finally {
      setSaving("");
    }
  };

  const logout = () => {
    localStorage.removeItem("rota-segura-session");
    setSession(null);
    setRouteState(null);
    setLive(emptyLive);
  };

  const postLive = async (payload: Partial<LiveTrackingState>) => {
    const response = await fetch("/api/driver/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        driverId,
        companyId: session?.companyId,
        vanId: routeState?.van?.id || routeState?.driver?.vanId || "",
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

    if (heartbeatId.current !== null) {
      window.clearInterval(heartbeatId.current);
      heartbeatId.current = null;
    }

    if (!navigator.geolocation) {
      await postLive({ active: true, source: "manual" });
      setMessage("Ao vivo ligado sem GPS. Atualize manualmente quando precisar.");
      setSaving("");
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        latestGps.current = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
        };
        await postLive({
          active: true,
          ...latestGps.current,
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

    heartbeatId.current = window.setInterval(() => {
      void postLive({
        active: true,
        ...latestGps.current,
        source: latestGps.current.latitude ? "gps" : "manual",
      });
    }, 15000);
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
    if (heartbeatId.current !== null) {
      window.clearInterval(heartbeatId.current);
      heartbeatId.current = null;
    }
    await postLive({ active: false, source: "manual" });
    setMessage("Ao vivo encerrado.");
    setSaving("");
  };

  const generateRoutePlan = async () => {
    if (!driverId) return;
    setSaving("route-plan");
    setMessage("");

    const response = await fetch("/api/driver/route-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId, companyId: session?.companyId }),
    });
    const payload = (await response.json().catch(() => null)) as { routePlan?: RoutePlanRecord; error?: string } | null;

    if (response.ok && payload?.routePlan) {
      setRoutePlan(payload.routePlan);
      await loadRouteState();
      setMessage("Rota sugerida gerada.");
    } else {
      setMessage(payload?.error || "Nao foi possivel gerar a rota.");
    }

    setSaving("");
  };

  const routeChildren = routeState?.children ?? [];
  const notices = routeChildren.filter((child) => child.absenceStatus !== "going");
  const recentCheckins = routeState?.checkins.slice(0, 8) ?? [];
  const childName = (id: string) => routeState?.children.find((child) => child.id === id)?.name || "Aluno";
  const parent = (id: string) => routeState?.parents.find((item) => item.id === id);
  const parentName = (id: string) => parent(id)?.name || "Responsavel";
  const schoolName = (id: string) => routeState?.schools.find((school) => school.id === id)?.name || "Escola";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy text-white">
        <Loader2 className="animate-spin text-sun" size={28} />
      </main>
    );
  }

  if (!session || session.role !== "driver") {
    return (
      <DriverLogin
        form={loginForm}
        error={loginError}
        saving={saving === "login"}
        onChange={setLoginForm}
        onSubmit={loginDriver}
      />
    );
  }

  return (
    <main className="min-h-screen bg-navy px-4 py-6 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-sun">
            <ArrowLeft size={16} /> Voltar ao site
          </Link>
          <button onClick={logout} className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-sun">
            <LogOut size={15} /> Sair
          </button>
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun">Motorista</p>
              <h1 className="mt-2 text-3xl font-semibold">{routeState?.driver?.name || session.name}</h1>
              <p className="mt-2 text-sm text-white/55">
                {routeState?.van?.label || "Van sem vinculo"} {routeState?.van?.plate ? `- ${routeState.van.plate}` : ""}
              </p>
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
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatusLine label="Bairro" value={live.currentNeighborhood || "Sem bairro"} />
              <StatusLine label="Previsao" value={live.active ? `${live.estimatedMinutes || 0} min` : "Indisponivel"} />
              <StatusLine label="Alunos" value={routeChildren.length.toString()} />
              <StatusLine label="Ultimo sinal" value={live.lastSeenAt ? new Date(live.lastSeenAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Sem sinal"} />
            </div>
            <div className="mt-4">
              <LiveRouteMap live={live} compact />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Bairro atual" value={manual.currentNeighborhood} onChange={(v) => setManual({ ...manual, currentNeighborhood: v })} />
            <Field label="Proxima parada" value={manual.nextStop} onChange={(v) => setManual({ ...manual, nextStop: v })} />
            <Field label="Estimativa (min)" value={manual.estimatedMinutes} onChange={(v) => setManual({ ...manual, estimatedMinutes: v })} type="number" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button type="button" className="w-full" onClick={startRoute} disabled={saving === "start"}>
              <MapPin size={16} /> Iniciar com GPS
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={sendManualUpdate} disabled={saving === "manual"}>
              <Send size={16} /> Atualizar
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={stopRoute} disabled={saving === "stop"}>
              <Power size={16} /> Encerrar rota
            </Button>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-white/45">
            Depois de iniciar, o radar envia atualizacoes automaticas enquanto esta tela permanecer aberta com GPS permitido.
          </p>

          {message && (
            <div className="mt-5 rounded-2xl border border-sun/30 bg-sun/10 px-4 py-3 text-sm font-semibold text-sun">
              {message}
            </div>
          )}
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun">Rota IA</p>
              <h2 className="mt-2 text-2xl font-semibold">Sugestao de caminho</h2>
              <p className="mt-2 text-sm text-white/55">
                Baseada nos enderecos dos alunos vinculados a este motorista.
              </p>
            </div>
            <Button type="button" onClick={generateRoutePlan} disabled={saving === "route-plan"}>
              <Route size={16} /> Gerar rota IA
            </Button>
          </div>

          {routePlan ? (
            <div className="mt-5">
              <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/65">
                {routePlan.summary} Tempo total estimado: {routePlan.totalEstimatedMinutes} min.
              </div>
              <div className="mt-4 space-y-3">
                {routePlan.stops.length === 0 && <EmptyState text="Sem alunos ativos para montar a rota." />}
                {routePlan.stops.map((stop, index) => (
                  <div key={`${stop.childId}-${index}`} className="rounded-2xl bg-white/10 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-sun">Parada {index + 1}</div>
                        <div className="mt-1 font-semibold">{stop.childName}</div>
                        <div className="mt-1 text-sm text-white/55">{stop.address}</div>
                        <div className="mt-1 text-xs text-white/45">
                          {stop.parentName} - {stop.schoolName}
                        </div>
                      </div>
                      <span className="w-fit rounded-full bg-sun px-3 py-1 text-xs font-bold text-navy">
                        ~{stop.estimatedMinutes} min
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm text-white/55">
              Nenhuma rota gerada ainda. Toque no botao acima antes de iniciar o trajeto.
            </div>
          )}
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun">Alunos da van</p>
              <h2 className="mt-2 text-2xl font-semibold">Roteiro de hoje</h2>
            </div>
            <UsersRound className="text-sun" size={22} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            {routeChildren.length === 0 && <EmptyState text="Nenhum aluno vinculado a este motorista ainda." />}
            {routeChildren.map((child) => {
              const parentInfo = parent(child.parentId);
              return (
                <div key={child.id} className="rounded-2xl bg-white/10 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-semibold">{child.name}</div>
                      <div className="mt-1 text-sm text-white/55">{schoolName(child.schoolId)}</div>
                      <div className="mt-1 text-xs text-white/45">
                        {parentInfo?.name || "Responsavel"} {parentInfo?.contact ? `- ${formatPhone(parentInfo.contact)}` : ""}
                      </div>
                      <div className="mt-1 text-xs text-white/45">
                        {child.address.neighborhood || "Bairro nao informado"} {child.shift ? `- ${shiftLabel(child.shift)}` : ""}
                      </div>
                    </div>
                    <AbsenceBadge status={child.absenceStatus} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun">Avisos dos pais</p>
              <h2 className="mt-2 text-2xl font-semibold">Nao vao ou nao voltam</h2>
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
                    {checkin.type === "returning" ? "Check-out" : "Check-in"}
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

function DriverLogin({
  form,
  error,
  saving,
  onChange,
  onSubmit,
}: {
  form: { contact: string; password: string };
  error: string;
  saving: boolean;
  onChange: (form: { contact: string; password: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-4 py-10 text-white">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(250,204,21,0.12),transparent)]" />
      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/55 hover:text-white">
          <ArrowLeft size={15} /> Voltar ao site
        </Link>

        <span className="mt-7 flex h-12 w-12 items-center justify-center rounded-full bg-sun text-navy">
          <ShieldCheck size={22} />
        </span>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-sun">Area do motorista</p>
        <h1 className="mt-3 text-3xl font-semibold">Entrar na rota</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Use o contato cadastrado pela empresa e a senha definida pelo CPF do motorista.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-5">
          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-white/55">Contato do motorista</span>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
              <Phone size={16} className="text-white/40" />
              <input
                required
                value={form.contact}
                onChange={(e) => onChange({ ...form, contact: e.target.value })}
                placeholder="(45) 99999-9999"
                inputMode="tel"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>
          </label>

          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-white/55">CPF senha</span>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
              <IdCard size={16} className="text-white/40" />
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
                placeholder="000.000.000-00"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Entrando
              </>
            ) : (
              <>
                <IdCard size={16} /> Entrar como motorista
              </>
            )}
          </Button>
        </form>
      </section>
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
