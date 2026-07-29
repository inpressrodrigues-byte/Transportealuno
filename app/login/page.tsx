"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bus, Lock, IdCard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RouteDivider } from "@/components/ui/RouteMotif";

export default function LoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem("rota-segura-session", "1");
    } catch {}
    setTimeout(() => router.push("/dashboard"), 600);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy px-4 py-16">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(250,204,21,0.12),transparent)]"
      />

      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white"
      >
        <ArrowLeft size={15} /> Voltar ao site
      </Link>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sun text-navy">
            <Bus size={22} strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-white">Área do Cliente</h1>
          <p className="mt-1 text-sm text-white/50">
            Acompanhe a rota, pagamentos e avisos do seu filho.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm"
        >
          <label className="block text-xs font-semibold uppercase tracking-wide text-white/50">
            CPF
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
            <IdCard size={16} className="text-white/40" />
            <input
              required
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-white/50">
            Senha
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
            <Lock size={16} className="text-white/40" />
            <input
              required
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="mt-6 w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <button
            type="button"
            className="mt-4 w-full text-center text-xs font-medium text-white/50 hover:text-white"
          >
            Esqueci minha senha
          </button>
        </form>

        <div className="mt-6">
          <RouteDivider dark />
        </div>
        <p className="text-center text-xs text-white/30">
          Tela ilustrativa — nenhum dado é enviado a um servidor nesta versão.
        </p>
      </div>
    </main>
  );
}
