"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Bus,
  CalendarClock,
  CheckCircle2,
  IdCard,
  Loader2,
  LogOut,
  MapPin,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LiveRouteMap } from "@/components/ui/LiveRouteMap";
import { cn } from "@/lib/utils";
import type { ChildAbsenceStatus, SessionUser, StudentDashboardPayload } from "@/lib/app-types";

export default function StudentPage() {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [data, setData] = useState<StudentDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [loginForm, setLoginForm] = useState({ cpf: "", birthDate: "" });

  const schoolName = useMemo(() => {
    if (!data) return "Escola";
    return data.schools.find((school) => school.id === data.child.schoolId)?.name || "Escola";
  }, [data]);

  const load = async (childId: string) => {
    const response = await fetch(`/api/student/state?childId=${encodeURIComponent(childId)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Aluno nao encontrado");
    const payload = (await response.json()) as StudentDashboardPayload;
    setData(payload);
  };

  useEffect(() => {
    let alive = true;

    const boot = async () => {
      const raw = localStorage.getItem("rota-segura-session");
      const parsed = raw ? (JSON.parse(raw) as SessionUser) : null;
      if (parsed?.role === "child") {
        if (alive) setSession(parsed);
        await load(parsed.id);
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

  useEffect(() => {
    if (!session || session.role !== "child") return;
    const timer = window.setInterval(() => {
      load(session.id).catch(() => {});
    }, 9000);

    return () => window.clearInterval(timer);
  }, [session]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("login");
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: loginForm.cpf, password: loginForm.birthDate }),
      });
      const payload = (await response.json()) as { user?: SessionUser; error?: string };

      if (!response.ok || !payload.user || payload.user.role !== "child") {
        setMessage(payload.error || "Acesso do aluno nao encontrado.");
        return;
      }

      localStorage.setItem("rota-segura-session", JSON.stringify(payload.user));
      window.dispatchEvent(new Event("rota-segura-session"));
      setSession(payload.user);
      await load(payload.user.id);
      setMessage("Acesso confirmado.");
    } catch {
      setMessage("Falha ao conectar com o sistema.");
    } finally {
      setSaving("");
    }
  };

  const logout = () => {
    localStorage.removeItem("rota-segura-session");
    setSession(null);
    setData(null);
  };

  const updateStatus = async (status: ChildAbsenceStatus) => {
    if (!data) return;
    setSaving(status);
    setMessage("");

    const response = await fetch("/api/student/status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: data.child.id, status }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (response.ok) {
      await load(data.child.id);
      setMessage("Aviso enviado para o responsavel e motorista.");
    } else {
      setMessage(payload?.error || "Nao foi possivel enviar o aviso.");
    }

    setSaving("");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy text-white">
        <Loader2 className="animate-spin text-sun" size={28} />
      </main>
    );
  }

  if (!session || session.role !== "child" || !data) {
    return (
      <main className="min-h-screen bg-navy px-4 py-8 text-white">
        <div className="mx-auto max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-sun">
            <ArrowLeft size={16} /> Voltar ao site
          </Link>

          <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sun text-navy">
              <Bus size={22} />
            </span>
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-sun">Area do aluno</p>
            <h1 className="mt-2 text-3xl font-semibold">Entrar</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Use o CPF do aluno e a data de nascimento cadastrados pelo responsavel.
            </p>

            <form onSubmit={login} className="mt-6 space-y-4">
              <Field label="CPF do aluno" value={loginForm.cpf} onChange={(v) => setLoginForm({ ...loginForm, cpf: v })} />
              <Field label="Data de nascimento" type="date" value={loginForm.birthDate} onChange={(v) => setLoginForm({ ...loginForm, birthDate: v })} />
              {message && (
                <div className="rounded-2xl border border-sun/30 bg-sun/10 p-4 text-sm font-semibold text-sun">
                  {message}
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={saving === "login"}>
                {saving === "login" ? <Loader2 size={16} className="animate-spin" /> : <IdCard size={16} />}
                Entrar como aluno
              </Button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  const recentCheckins = data.checkins.slice(0, 8);

  return (
    <main className="min-h-screen bg-navy px-4 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-sun">
            <ArrowLeft size={16} /> Voltar ao site
          </Link>
          <button onClick={logout} className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-sun">
            <LogOut size={16} /> Sair
          </button>
        </div>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">Area do aluno</p>
              <h1 className="mt-2 text-3xl font-semibold">Ola, {data.child.name.split(" ")[0]}</h1>
              <p className="mt-2 text-sm text-white/60">{schoolName} - {data.child.grade || "Turma nao informada"}</p>
            </div>
            <AbsenceBadge status={data.child.absenceStatus} />
          </div>

          {message && (
            <div className="mt-5 rounded-2xl border border-sun/30 bg-sun/10 p-4 text-sm font-semibold text-sun">
              {message}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl bg-white/10 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-sun">
                <CalendarClock size={16} /> Avisos de hoje
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <StatusButton active={data.child.absenceStatus === "going"} disabled={Boolean(saving)} onClick={() => updateStatus("going")}>
                  Vou hoje
                </StatusButton>
                <StatusButton active={data.child.absenceStatus === "not_going"} disabled={Boolean(saving)} onClick={() => updateStatus("not_going")}>
                  Nao vou hoje
                </StatusButton>
                <StatusButton active={data.child.absenceStatus === "not_returning"} disabled={Boolean(saving)} onClick={() => updateStatus("not_returning")}>
                  Nao volto
                </StatusButton>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <QrCode className="text-sun" size={22} />
              <h2 className="mt-3 font-semibold">Check-in e check-out</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Escaneie o QR Code fixado na van. O sistema registra horario e localizacao.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-sun">
            <MapPin size={16} /> Van ao vivo
          </div>
          <h2 className="mt-2 text-2xl font-semibold">
            {data.liveTracking.active ? "Motorista em rota" : "Fora do horario de transporte"}
          </h2>
          <div className="mt-5">
            <LiveRouteMap live={data.liveTracking} compact />
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-sun">
            <Bell size={16} /> Notificacoes
          </div>
          <div className="mt-5 space-y-3">
            {data.notifications.slice(0, 8).map((notification) => (
              <div key={notification.id} className="rounded-2xl bg-white/10 p-4 text-sm">
                <div className="font-semibold">{notification.title}</div>
                <div className="mt-1 text-white/60">{notification.message}</div>
                <div className="mt-2 text-xs text-white/40">{new Date(notification.createdAt).toLocaleString("pt-BR")}</div>
              </div>
            ))}
            {!data.notifications.length && <p className="text-sm text-white/55">Nenhuma notificacao recebida ainda.</p>}
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-sun">
            <ShieldCheck size={16} /> Historico de seguranca
          </div>
          <div className="mt-5 space-y-3">
            {recentCheckins.length === 0 && <p className="text-sm text-white/55">Nenhum check-in registrado ainda.</p>}
            {recentCheckins.map((checkin) => (
              <div key={checkin.id} className="rounded-2xl bg-white/10 p-4 text-sm">
                <div className="font-semibold">{checkin.type === "returning" ? "Check-out" : "Check-in"}</div>
                <div className="mt-1 text-white/55">{new Date(checkin.scannedAt).toLocaleString("pt-BR")}</div>
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
      <span className="text-xs font-semibold uppercase tracking-wide text-white/55">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-sun"
      />
    </label>
  );
}

function StatusButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-3 text-sm font-bold transition disabled:opacity-50",
        active ? "bg-sun text-navy" : "bg-white/10 text-white/70 hover:bg-white/15"
      )}
    >
      {children}
    </button>
  );
}

function AbsenceBadge({ status }: { status: ChildAbsenceStatus }) {
  const labels: Record<ChildAbsenceStatus, string> = {
    going: "Vai hoje",
    not_going: "Nao vai hoje",
    not_returning: "Nao volta",
  };

  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-sun px-3 py-1 text-xs font-bold text-navy">
      <CheckCircle2 size={13} /> {labels[status]}
    </span>
  );
}
