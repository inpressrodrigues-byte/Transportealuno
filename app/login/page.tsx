"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bus,
  IdCard,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RouteDivider } from "@/components/ui/RouteMotif";
import type { SessionUser, UserRole } from "@/lib/app-types";

const demoAccess = [
  {
    role: "admin" as UserRole,
    label: "Admin",
    contact: "(45) 99999-9999",
    password: "000.000.000-00",
  },
  {
    role: "parent" as UserRole,
    label: "Responsavel",
    contact: "(45) 98888-0001",
    password: "123.456.789-10",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserRole>("parent");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fillDemo = (role: UserRole) => {
    const demo = demoAccess.find((item) => item.role === role);
    if (!demo) return;
    setProfile(role);
    setContact(demo.contact);
    setPassword(demo.password);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, password }),
      });
      const payload = (await response.json()) as { user?: SessionUser; error?: string };

      if (!response.ok || !payload.user) {
        setError(payload.error || "Nao foi possivel entrar.");
        return;
      }

      if (payload.user.role !== profile) {
        setError(
          payload.user.role === "admin"
            ? "Este contato pertence ao acesso administrativo."
            : "Este contato pertence a area do responsavel."
        );
        return;
      }

      localStorage.setItem("rota-segura-session", JSON.stringify(payload.user));
      window.dispatchEvent(new Event("rota-segura-session"));
      router.push(payload.user.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Falha ao conectar com o sistema. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-navy px-4 py-10 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(250,204,21,0.14),transparent)]"
      />

      <Link
        href="/"
        className="relative z-10 inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white"
      >
        <ArrowLeft size={15} /> Voltar ao site
      </Link>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-5xl grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_420px]">
        <section>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-sun text-navy">
            <Bus size={22} strokeWidth={2.5} />
          </span>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-sun">
            Rota Segura
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
            Acesso para administrar bairros, alunos e pagamentos.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65">
            O responsavel entra com o numero de contato e usa o CPF como senha.
            O admin consegue cadastrar escolas, bairros, responsaveis, alunos, cores e dados do Pix.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <ShieldCheck className="text-sun" size={20} />
              <div className="mt-3 text-sm font-semibold">Admin completo</div>
              <p className="mt-1 text-sm text-white/55">Gerencie informacoes e acompanhe comprovantes.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <UserRound className="text-sun" size={20} />
              <div className="mt-3 text-sm font-semibold">Area dos pais</div>
              <p className="mt-1 text-sm text-white/55">Cadastro dos filhos, pagamentos, Pix e recibos.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-8">
          <div className="grid grid-cols-2 gap-2 rounded-full bg-white/5 p-1">
            {[
              { id: "parent" as UserRole, label: "Responsavel" },
              { id: "admin" as UserRole, label: "Admin" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setProfile(item.id);
                  setError("");
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  profile === item.id ? "bg-sun text-navy" : "text-white/60 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-7">
            <label htmlFor="contact" className="block text-xs font-semibold uppercase tracking-wide text-white/55">
              Numero de contato
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
              <Phone size={16} className="text-white/40" />
              <input
                id="contact"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="(45) 99999-9999"
                inputMode="tel"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>

            <label htmlFor="password" className="mt-5 block text-xs font-semibold uppercase tracking-wide text-white/55">
              {profile === "parent" ? "Senha CPF do responsavel" : "Senha administrativa"}
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
              {profile === "parent" ? (
                <IdCard size={16} className="text-white/40" />
              ) : (
                <Lock size={16} className="text-white/40" />
              )}
              <input
                id="password"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={profile === "parent" ? "000.000.000-00" : "Senha"}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Entrando
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <RouteDivider dark />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Acessos de teste
            </p>
            <div className="mt-3 space-y-2 text-xs text-white/65">
              {demoAccess.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => fillDemo(item.role)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-white/5"
                >
                  <span>{item.label}</span>
                  <span className="tabular text-white/45">{item.contact}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
