"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, IdCard, Loader2, MapPin, Phone, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CheckinType, ParentDashboardPayload, SessionUser } from "@/lib/app-types";

export default function CheckinPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CheckinContent />
    </Suspense>
  );
}

function CheckinContent() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [session, setSession] = useState<SessionUser | null>(null);
  const [data, setData] = useState<ParentDashboardPayload | null>(null);
  const [selectedChild, setSelectedChild] = useState("");
  const [loginForm, setLoginForm] = useState({ contact: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");

  const recentCheckins = useMemo(() => data?.checkins.slice(0, 5) ?? [], [data]);

  const loadParent = async (parentId: string) => {
    const response = await fetch(`/api/parent/state?parentId=${parentId}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Responsavel nao encontrado");
    const payload = (await response.json()) as ParentDashboardPayload;
    setData(payload);
    setSelectedChild((current) => current || payload.children[0]?.id || "");
  };

  useEffect(() => {
    let alive = true;

    const boot = async () => {
      const raw = localStorage.getItem("rota-segura-session");
      const parsed = raw ? (JSON.parse(raw) as SessionUser) : null;
      if (parsed?.role === "parent") {
        if (alive) setSession(parsed);
        await loadParent(parsed.id);
      }
      if (alive) setLoading(false);
    };

    boot().catch(() => {
      if (alive) setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  const loginParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("login");
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const payload = (await response.json()) as { user?: SessionUser; error?: string };

      if (!response.ok || !payload.user || payload.user.role !== "parent") {
        setMessage(payload.error || "Acesso dos responsaveis nao encontrado.");
        return;
      }

      localStorage.setItem("rota-segura-session", JSON.stringify(payload.user));
      setSession(payload.user);
      await loadParent(payload.user.id);
      setMessage("Acesso confirmado. Agora registre o check-in.");
    } catch {
      setMessage("Falha ao conectar com o sistema.");
    } finally {
      setSaving("");
    }
  };

  const submitCheckin = async (type: CheckinType) => {
    if (!session || !selectedChild || !token) return;

    setSaving(type);
    setMessage("Registrando check-in...");

    const location = await getLocation().catch(() => null);
    const response = await fetch("/api/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        parentId: session.id,
        childId: selectedChild,
        type,
        latitude: location?.latitude,
        longitude: location?.longitude,
        accuracy: location?.accuracy,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (response.ok) {
      await loadParent(session.id);
      setMessage(location ? "Check-in registrado com horario e localizacao." : "Check-in registrado sem localizacao.");
    } else {
      setMessage(payload?.error || "Nao foi possivel registrar o check-in.");
    }

    setSaving("");
  };

  if (loading) return <LoadingScreen />;

  return (
    <main className="min-h-screen bg-navy px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-sun">
          <ArrowLeft size={16} /> Voltar ao site
        </Link>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">Check-in da van</p>
              <h1 className="mt-2 text-3xl font-semibold">Registrar embarque</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                O registro salva o horario do QR Code e, se permitido, a localizacao do celular.
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sun text-navy">
              <QrCode size={22} />
            </span>
          </div>

          {!token && (
            <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
              QR Code sem codigo valido. Escaneie novamente o QR da van.
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-2xl border border-sun/30 bg-sun/10 p-4 text-sm font-semibold text-sun">
              {message}
            </div>
          )}

          {!session || !data ? (
            <form onSubmit={loginParent} className="mt-6 space-y-4">
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-white/55">Contato do responsavel</span>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
                  <Phone size={16} className="text-white/40" />
                  <input
                    required
                    value={loginForm.contact}
                    onChange={(e) => setLoginForm({ ...loginForm, contact: e.target.value })}
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
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                  />
                </div>
              </label>
              <Button type="submit" variant="primary" size="lg" disabled={saving === "login"}>
                {saving === "login" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Confirmar acesso
              </Button>
            </form>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <label>
                  <span className="text-xs font-semibold uppercase tracking-wide text-white/55">Aluno</span>
                  <select
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-navy px-4 py-3 text-sm text-white outline-none focus:border-sun"
                  >
                    {data.children.map((child) => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </select>
                </label>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button type="button" onClick={() => submitCheckin("boarding")} disabled={!token || saving === "boarding"}>
                    <MapPin size={16} /> Entrei na van
                  </Button>
                  <Button type="button" variant="outline" onClick={() => submitCheckin("returning")} disabled={!token || saving === "returning"}>
                    <CheckCircle2 size={16} /> Voltei para casa
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-5 text-sm text-white/60">
                <div className="font-semibold text-white">Seguranca</div>
                <p className="mt-2 leading-relaxed">
                  O navegador pode pedir permissao de localizacao. Permitindo, o admin, motorista e responsavel veem o ponto do check-in.
                </p>
              </div>
            </div>
          )}
        </section>

        {data && (
          <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
            <h2 className="text-lg font-semibold">Ultimos check-ins</h2>
            <div className="mt-4 space-y-3">
              {recentCheckins.length === 0 && <p className="text-sm text-white/55">Nenhum registro ainda.</p>}
              {recentCheckins.map((checkin) => {
                const child = data.children.find((item) => item.id === checkin.childId);
                return (
                  <div key={checkin.id} className="rounded-2xl bg-white/10 p-4 text-sm">
                    <div className="font-semibold">{child?.name || "Aluno"}</div>
                    <div className="mt-1 text-white/55">{new Date(checkin.scannedAt).toLocaleString("pt-BR")}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy text-white">
      <Loader2 className="animate-spin text-sun" size={28} />
    </main>
  );
}

function getLocation() {
  return new Promise<{ latitude: number; longitude: number; accuracy: number }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      reject,
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 }
    );
  });
}
