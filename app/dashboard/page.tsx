"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bus,
  Home,
  Wallet,
  MapPin,
  Bell,
  UserRound,
  LogOut,
  Menu,
  X,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardAluno } from "@/lib/data";
import { HeroRouteMap } from "@/components/ui/RouteMotif";

const tabs = [
  { id: "inicio", label: "Início", icon: Home },
  { id: "mensalidades", label: "Mensalidades", icon: Wallet },
  { id: "rastreamento", label: "Rastreamento", icon: MapPin },
  { id: "avisos", label: "Avisos", icon: Bell },
  { id: "perfil", label: "Perfil", icon: UserRound },
];

function subscribeSession(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSessionSnapshot() {
  try {
    return localStorage.getItem("rota-segura-session") === "1";
  } catch {
    return false;
  }
}

function getServerSessionSnapshot() {
  return false;
}

export default function DashboardPage() {
  const router = useRouter();
  const [active, setActive] = useState("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const hasSession = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot
  );

  useEffect(() => {
    if (!hasSession) router.replace("/login");
  }, [hasSession, router]);

  const logout = () => {
    try {
      localStorage.removeItem("rota-segura-session");
    } catch {}
    router.push("/");
  };

  if (!hasSession) return null;

  return (
    <div className="min-h-screen bg-mist dark:bg-[#0b1220]">
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-white dark:bg-navy dark:border-white/10 lg:flex">
          <Link href="/" className="flex items-center gap-2 px-6 py-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun text-navy">
              <Bus size={17} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-bold text-navy dark:text-white">Rota Segura</span>
          </Link>
          <nav className="mt-2 flex-1 space-y-1 px-4">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-navy text-white dark:bg-sun dark:text-navy"
                      : "text-mute hover:bg-mist dark:text-white/60 dark:hover:bg-white/5"
                  )}
                >
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
          </nav>
          <button
            onClick={logout}
            className="m-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-mute hover:bg-mist dark:text-white/60 dark:hover:bg-white/5"
          >
            <LogOut size={16} /> Sair
          </button>
        </aside>

        {/* Mobile top bar */}
        <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line bg-white px-4 py-3 dark:bg-navy dark:border-white/10 lg:hidden">
          <span className="text-sm font-bold text-navy dark:text-white">Rota Segura</span>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-navy dark:text-white">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="fixed inset-x-0 top-[52px] z-30 border-b border-line bg-white p-3 dark:bg-navy dark:border-white/10 lg:hidden">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActive(t.id);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                    active === t.id ? "bg-navy text-white dark:bg-sun dark:text-navy" : "text-mute dark:text-white/60"
                  )}
                >
                  <Icon size={16} /> {t.label}
                </button>
              );
            })}
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-mute dark:text-white/60">
              <LogOut size={16} /> Sair
            </button>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 px-4 pb-16 pt-20 lg:ml-64 lg:px-10 lg:pt-10">
          {active === "inicio" && <InicioTab />}
          {active === "mensalidades" && <MensalidadesTab />}
          {active === "rastreamento" && <RastreamentoTab />}
          {active === "avisos" && <AvisosTab />}
          {active === "perfil" && <PerfilTab />}
        </main>
      </div>
    </div>
  );
}

function Shell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-navy dark:text-white">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-mute dark:text-white/60">{subtitle}</p>}
      <div className="mt-8 space-y-5">{children}</div>
    </div>
  );
}

function InicioTab() {
  const d = dashboardAluno;
  return (
    <Shell title={`Olá, família ${d.nome.split(" ")[0]} 👋`} subtitle="Aqui está o resumo de hoje.">
      <div className="rounded-2xl border border-line bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy text-sun">
            <UserRound size={24} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-navy dark:text-white">{d.nome}</div>
            <div className="text-sm text-mute dark:text-white/60">{d.escola} · Motorista {d.motorista}</div>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-ok/10 px-3 py-1.5 text-xs font-semibold text-ok">
            <span className="pulse-dot h-2 w-2 rounded-full bg-ok" /> {d.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard icon={Wallet} label="Próximo pagamento" value={d.proximoPagamento} />
        <InfoCard icon={CheckCircle2} label="Último pagamento" value={d.ultimoPagamento} />
        <InfoCard icon={Clock} label="Próxima viagem" value={d.proximaViagem} />
        <InfoCard icon={MapPin} label="Horário de embarque" value={d.embarque} />
      </div>

      <div className="rounded-2xl border border-line bg-navy p-6 dark:border-white/10">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Van em rota agora</span>
          <span className="text-xs text-white/50">Atualizado há 1 min</span>
        </div>
        <HeroRouteMap />
      </div>
    </Shell>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sun/15 text-sun-2">
        <Icon size={16} />
      </div>
      <div className="mt-3 text-xs uppercase tracking-wide text-mute dark:text-white/50">{label}</div>
      <div className="mt-1 text-sm font-semibold tabular text-navy dark:text-white">{value}</div>
    </div>
  );
}

function MensalidadesTab() {
  const historico = [
    { mes: "Julho/2026", status: "Pago", valor: "R$ 220,00" },
    { mes: "Junho/2026", status: "Pago", valor: "R$ 220,00" },
    { mes: "Maio/2026", status: "Pago", valor: "R$ 220,00" },
    { mes: "Agosto/2026", status: "Em aberto", valor: "R$ 220,00" },
  ];
  return (
    <Shell title="Mensalidades" subtitle="Histórico de pagamentos do transporte.">
      <div className="overflow-hidden rounded-2xl border border-line bg-white dark:border-white/10 dark:bg-white/[0.04]">
        {historico.map((h) => (
          <div
            key={h.mes}
            className="flex items-center justify-between border-b border-line px-6 py-4 last:border-0 dark:border-white/10"
          >
            <span className="text-sm font-medium text-navy dark:text-white">{h.mes}</span>
            <span className="text-sm tabular text-mute dark:text-white/60">{h.valor}</span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                h.status === "Pago" ? "bg-ok/10 text-ok" : "bg-sun/15 text-sun-2"
              )}
            >
              {h.status}
            </span>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function RastreamentoTab() {
  return (
    <Shell title="Rastreamento" subtitle="Localização da van em tempo real durante o trajeto.">
      <div className="rounded-2xl border border-line bg-navy p-6 dark:border-white/10">
        <HeroRouteMap />
      </div>
      <div className="rounded-2xl border border-line bg-white p-5 text-sm text-mute dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60">
        Próxima parada estimada: <span className="font-semibold text-navy dark:text-white">Rua das Palmeiras, 240 — 06h27</span>
      </div>
    </Shell>
  );
}

function AvisosTab() {
  const avisos = [
    { titulo: "Manutenção preventiva concluída", data: "22/07/2026" },
    { titulo: "Alteração de horário na sexta-feira (saída 06h30)", data: "18/07/2026" },
    { titulo: "Nova motorista substituta cadastrada para emergências", data: "05/07/2026" },
  ];
  return (
    <Shell title="Avisos" subtitle="Comunicados enviados pela equipe.">
      {avisos.map((a) => (
        <div key={a.titulo} className="rounded-2xl border border-line bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-start gap-3">
            <Bell size={16} className="mt-0.5 text-sun-2" />
            <div>
              <div className="text-sm font-medium text-navy dark:text-white">{a.titulo}</div>
              <div className="mt-1 text-xs text-mute dark:text-white/50">{a.data}</div>
            </div>
          </div>
        </div>
      ))}
    </Shell>
  );
}

function PerfilTab() {
  const d = dashboardAluno;
  return (
    <Shell title="Perfil" subtitle="Dados do aluno cadastrados no transporte.">
      <div className="rounded-2xl border border-line bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Aluno", value: d.nome },
            { label: "Escola", value: d.escola },
            { label: "Motorista", value: d.motorista },
            { label: "Endereço de embarque", value: "Rua das Palmeiras, 240" },
          ].map((f) => (
            <div key={f.label}>
              <div className="text-xs uppercase tracking-wide text-mute dark:text-white/50">{f.label}</div>
              <div className="mt-1 text-sm font-medium text-navy dark:text-white">{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
