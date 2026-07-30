"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bus,
  IdCard,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RouteDivider } from "@/components/ui/RouteMotif";
import type { SessionUser } from "@/lib/app-types";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [registerForm, setRegisterForm] = useState({ name: "", contact: "", email: "", cpf: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      if (payload.user.role !== "parent") {
        setError("Este acesso nao pertence a area dos responsaveis.");
        return;
      }

      localStorage.setItem("rota-segura-session", JSON.stringify(payload.user));
      window.dispatchEvent(new Event("rota-segura-session"));
      router.push("/dashboard");
    } catch {
      setError("Falha ao conectar com o sistema. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register-parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });
      const payload = (await response.json()) as { user?: SessionUser; error?: string };

      if (!response.ok || !payload.user) {
        setError(payload.error || "Nao foi possivel criar o acesso.");
        return;
      }

      localStorage.setItem("rota-segura-session", JSON.stringify(payload.user));
      window.dispatchEvent(new Event("rota-segura-session"));
      router.push("/dashboard");
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
            Acesso dos responsaveis para acompanhar filhos, pagamentos e rota.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65">
            Entre com o numero de contato cadastrado e use o CPF do responsavel como senha.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <ShieldCheck className="text-sun" size={20} />
              <div className="mt-3 text-sm font-semibold">Seguranca da rota</div>
              <p className="mt-1 text-sm text-white/55">Acompanhe check-ins e avisos do transporte.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <UserRound className="text-sun" size={20} />
              <div className="mt-3 text-sm font-semibold">Perfil familiar</div>
              <p className="mt-1 text-sm text-white/55">Cadastre os filhos, endereco e comprovantes.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/20 backdrop-blur-md sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sun">
              Area dos pais
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {mode === "login" ? "Entrar" : "Criar acesso"}
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={mode === "login" ? "rounded-xl bg-sun px-4 py-2 text-sm font-bold text-navy" : "rounded-xl px-4 py-2 text-sm font-bold text-white/60"}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={mode === "register" ? "rounded-xl bg-sun px-4 py-2 text-sm font-bold text-navy" : "rounded-xl px-4 py-2 text-sm font-bold text-white/60"}
            >
              Criar acesso
            </button>
          </div>

          {mode === "login" ? (
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
                CPF do responsavel
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
                <IdCard size={16} className="text-white/40" />
                <input
                  id="password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="000.000.000-00"
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
          ) : (
            <form onSubmit={handleRegister} className="mt-7 space-y-5">
              <AccessField
                id="register-name"
                label="Nome completo"
                icon={UserRoundPlus}
                value={registerForm.name}
                onChange={(value) => setRegisterForm({ ...registerForm, name: value })}
                placeholder="Nome do responsavel"
              />
              <AccessField
                id="register-contact"
                label="WhatsApp de login"
                icon={Phone}
                value={registerForm.contact}
                onChange={(value) => setRegisterForm({ ...registerForm, contact: value })}
                placeholder="(45) 99999-9999"
                inputMode="tel"
              />
              <AccessField
                id="register-email"
                label="Email"
                icon={Mail}
                value={registerForm.email}
                onChange={(value) => setRegisterForm({ ...registerForm, email: value })}
                placeholder="email@exemplo.com"
                type="email"
              />
              <AccessField
                id="register-cpf"
                label="CPF senha"
                icon={IdCard}
                value={registerForm.cpf}
                onChange={(value) => setRegisterForm({ ...registerForm, cpf: value })}
                placeholder="000.000.000-00"
              />

              {error && (
                <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Criando
                  </>
                ) : (
                  "Criar acesso e entrar"
                )}
              </Button>
            </form>
          )}

          <div className="mt-6">
            <RouteDivider dark />
          </div>

          <p className="mt-5 text-sm leading-relaxed text-white/55">
            O login usa o WhatsApp do responsavel e o CPF informado como senha.
          </p>
        </section>
      </div>
    </main>
  );
}

function AccessField({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/55">{label}</span>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
        <Icon size={16} className="text-white/40" />
        <input
          id={id}
          required={label !== "Email"}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
        />
      </div>
    </label>
  );
}
