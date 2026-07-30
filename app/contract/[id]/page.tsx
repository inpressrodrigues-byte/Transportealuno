"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileSignature, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ChildRecord, ContractRecord, SafeCompanyRecord, SafeParentRecord } from "@/lib/app-types";

type ContractPayload = {
  contract: ContractRecord;
  company: SafeCompanyRecord;
  parent: SafeParentRecord | null;
  child: ChildRecord | null;
};

export default function ContractPage() {
  const params = useParams<{ id: string }>();
  const [payload, setPayload] = useState<ContractPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ signerName: "", signerDocument: "" });

  const load = async () => {
    const response = await fetch(`/api/contracts/${params.id}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Contrato nao encontrado");
    const nextPayload = (await response.json()) as ContractPayload;
    setPayload(nextPayload);
    setForm((current) => ({
      signerName: current.signerName || nextPayload.parent?.name || "",
      signerDocument: current.signerDocument,
    }));
  };

  useEffect(() => {
    let alive = true;

    const loadContract = async () => {
      try {
        const response = await fetch(`/api/contracts/${params.id}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Contrato nao encontrado");
        const nextPayload = (await response.json()) as ContractPayload;
        if (!alive) return;
        setPayload(nextPayload);
        setForm((current) => ({
          signerName: current.signerName || nextPayload.parent?.name || "",
          signerDocument: current.signerDocument,
        }));
      } catch {
        if (alive) setMessage("Contrato nao encontrado ou indisponivel.");
      } finally {
        if (alive) setLoading(false);
      }
    };

    void loadContract();

    return () => {
      alive = false;
    };
  }, [params.id]);

  const sign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch(`/api/contracts/${params.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setMessage(result?.error || "Nao foi possivel assinar.");
      setSaving(false);
      return;
    }

    await load();
    setMessage("Contrato assinado com sucesso.");
    setSaving(false);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0a08] text-[#f6ead0]">
        <Loader2 className="animate-spin text-[#d6b36a]" size={28} />
      </main>
    );
  }

  if (!payload) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0a08] px-4 text-[#f6ead0]">
        <div className="max-w-md border border-[#d6b36a]/25 p-8 text-center">
          <h1 className="font-[var(--font-luxury)] text-4xl">Contrato indisponivel</h1>
          <p className="mt-3 text-sm text-white/55">{message}</p>
          <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-[#d6b36a] hover:underline">
            Voltar ao site
          </Link>
        </div>
      </main>
    );
  }

  const signed = payload.contract.status === "signed";

  return (
    <main className="min-h-screen bg-[#0b0a08] px-4 py-8 text-[#f6ead0]">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 hover:text-[#d6b36a]">
          <ArrowLeft size={16} /> Voltar
        </Link>

        <section className="mt-8 border border-[#d6b36a]/25 bg-black/20 p-6 shadow-2xl sm:p-10">
          <div className="flex flex-col gap-4 border-b border-[#d6b36a]/20 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d6b36a]">
                {payload.company.name}
              </p>
              <h1 className="mt-3 font-[var(--font-luxury)] text-4xl font-normal text-[#f8f0df] sm:text-5xl">
                {payload.contract.title}
              </h1>
              <p className="mt-3 text-sm text-white/55">
                Responsavel: {payload.parent?.name || "Nao informado"} · Aluno: {payload.child?.name || "Nao informado"}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 border border-[#d6b36a]/30 px-3 py-2 text-xs font-bold text-[#d6b36a]">
              {signed ? <CheckCircle2 size={15} /> : <FileSignature size={15} />}
              {signed ? "ASSINADO" : "AGUARDANDO"}
            </span>
          </div>

          <article className="mt-8 whitespace-pre-wrap text-base leading-8 text-[#f8f0df]/88">
            {payload.contract.content}
          </article>

          {signed ? (
            <div className="mt-8 border border-emerald-400/25 bg-emerald-400/10 p-5 text-sm text-emerald-100">
              Assinado por {payload.contract.signerName} em{" "}
              {payload.contract.signedAt ? new Date(payload.contract.signedAt).toLocaleString("pt-BR") : "data registrada"}.
            </div>
          ) : (
            <form onSubmit={sign} className="mt-8 grid grid-cols-1 gap-4 border-t border-[#d6b36a]/20 pt-6 sm:grid-cols-[1fr_220px_auto]">
              <Field label="Nome de quem assina" value={form.signerName} onChange={(v) => setForm({ ...form, signerName: v })} />
              <Field label="CPF/CNPJ" value={form.signerDocument} onChange={(v) => setForm({ ...form, signerDocument: v })} />
              <Button type="submit" className="self-end" disabled={saving}>
                <FileSignature size={16} /> Assinar
              </Button>
            </form>
          )}

          {message && (
            <div className="mt-5 border border-[#d6b36a]/25 bg-[#d6b36a]/10 px-4 py-3 text-sm font-semibold text-[#f8f0df]">
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-wide text-white/45">{label}</span>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-[#d6b36a]/20 bg-black/30 px-4 py-3 text-sm text-[#f8f0df] outline-none focus:border-[#d6b36a]"
      />
    </label>
  );
}
