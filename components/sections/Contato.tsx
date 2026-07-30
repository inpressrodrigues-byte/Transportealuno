"use client";

import { useMemo, useState } from "react";
import { Check, MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FacebookGlyph, InstagramGlyph } from "@/components/ui/SocialIcons";
import { usePublicSite } from "@/lib/use-public-site";
import type { Shift } from "@/lib/app-types";
import { normalizeDigits, schoolCategoryLabel, shiftLabel, shifts } from "@/lib/app-utils";
import { cn } from "@/lib/utils";

export function Contato() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    intent: "Gostaria de saber o valor para transporte",
    shift: "manha" as Shift,
    schoolId: "",
    customSchool: "",
    neighborhoodId: "",
  });
  const site = usePublicSite();
  const phone = site?.settings.phone || "(45) 99999-9999";
  const whatsapp = whatsappNumber(site?.settings.whatsapp || "5545999999999");
  const tel = whatsappNumber(phone);
  const schools = site?.schools ?? [];
  const neighborhoods = site?.neighborhoods ?? [];
  const selectedSchool = schools.find((school) => school.id === form.schoolId);
  const selectedNeighborhood = neighborhoods.find((neighborhood) => neighborhood.id === form.neighborhoodId);
  const hasCustomSchool = form.schoolId === "outra";

  const availability = useMemo(() => {
    if (hasCustomSchool) {
      return {
        ok: false,
        text: "Infelizmente essa instituicao ainda nao esta cadastrada para atendimento.",
      };
    }

    if (!selectedSchool) {
      return {
        ok: false,
        text: "Selecione uma instituicao para consultar disponibilidade.",
      };
    }

    if (!selectedSchool.served || !selectedSchool.servedShifts.includes(form.shift)) {
      return {
        ok: false,
        text: "Infelizmente essa instituicao nesse turno nao realizamos atendimento.",
      };
    }

    if (!selectedNeighborhood) {
      return {
        ok: false,
        text: "Selecione o bairro onde reside para finalizar a consulta.",
      };
    }

    if (!selectedNeighborhood.served) {
      return {
        ok: false,
        text: "Infelizmente ainda nao atendemos esse bairro.",
      };
    }

    return {
      ok: true,
      text: "Atendimento possivel. A mensagem ja vai com todos os dados.",
    };
  }, [form.shift, hasCustomSchool, selectedNeighborhood, selectedSchool]);

  const waMessage = encodeURIComponent(
    [
      "Ola! Gostaria de saber o valor para transporte escolar.",
      `Nome: ${form.name || "Nao informado"}`,
      `WhatsApp: ${form.phone || "Nao informado"}`,
      `Turno: ${shiftLabel(form.shift)}`,
      `Instituicao: ${hasCustomSchool ? form.customSchool || "Outra instituicao" : selectedSchool?.name || "Nao informada"}`,
      selectedSchool ? `Categoria: ${schoolCategoryLabel(selectedSchool.category)}` : "",
      `Bairro onde reside: ${selectedNeighborhood?.name || "Nao informado"}`,
      `Resultado no site: ${availability.text}`,
    ].filter(Boolean).join("\n")
  );

  return (
    <section id="contato" className="bg-navy py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow="Contato" title="Consulte pelo WhatsApp" dark />

        <div className="mt-14 grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun">Atendimento</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">Escolha turno, escola e bairro</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                O sistema confere o que esta cadastrado no admin e prepara a conversa com as informacoes principais.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={`tel:+${tel}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-white/80 hover:border-sun/40"
              >
                <Phone size={16} className="text-sun" /> {phone}
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-white/80 hover:border-sun/40"
              >
                <MessageCircle size={16} className="text-sun" /> WhatsApp
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-white/80 hover:border-sun/40"
              >
                <InstagramGlyph size={16} className="text-sun" /> Instagram
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-white/80 hover:border-sun/40"
              >
                <FacebookGlyph size={16} className="text-sun" /> Facebook
              </a>
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-white/15 bg-slate-950 p-3 shadow-2xl">
            <div className="rounded-[1.5rem] bg-[#edf2f7] p-4 text-navy">
              <div className="mx-auto mb-4 h-1.5 w-20 rounded-full bg-slate-300" />
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun text-navy">
                    <MessageCircle size={16} />
                  </span>
                  <div>
                    <div className="text-sm font-bold">Oziel Turismo</div>
                    <div className="text-xs text-mute">online para consulta</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <ChatBubble>{form.intent}</ChatBubble>

                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-mute">Pra qual turno voce necessita?</div>
                    <div className="grid grid-cols-3 gap-2">
                      {shifts.map((shift) => (
                        <button
                          key={shift}
                          onClick={() => setForm({ ...form, shift })}
                          className={cn(
                            "rounded-xl px-3 py-2 text-sm font-bold",
                            form.shift === shift ? "bg-navy text-white" : "bg-mist text-mute"
                          )}
                        >
                          {shiftLabel(shift)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field label="Seu nome" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
                  <Field label="Seu WhatsApp" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute">Pra qual instituicao?</span>
                    <select
                      value={form.schoolId}
                      onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-sun"
                    >
                      <option value="">Selecione</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                      <option value="outra">Outra instituicao</option>
                    </select>
                  </label>

                  {hasCustomSchool && (
                    <Field
                      label="Nome da instituicao"
                      value={form.customSchool}
                      onChange={(value) => setForm({ ...form, customSchool: value })}
                    />
                  )}

                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute">Bairro onde reside</span>
                    <select
                      value={form.neighborhoodId}
                      onChange={(e) => setForm({ ...form, neighborhoodId: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-sun"
                    >
                      <option value="">Selecione</option>
                      {neighborhoods.map((neighborhood) => (
                        <option key={neighborhood.id} value={neighborhood.id}>
                          {neighborhood.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm font-semibold",
                      availability.ok ? "border-ok/30 bg-ok/10 text-ok" : "border-slate-200 bg-mist text-mute"
                    )}
                  >
                    {availability.text}
                  </div>

                  <Button
                    type="button"
                    className="w-full"
                    disabled={!form.name || !form.phone || !availability.ok}
                    onClick={() => {
                      setSent(true);
                      window.open(`https://wa.me/${whatsapp}?text=${waMessage}`, "_blank", "noopener,noreferrer");
                    }}
                  >
                    {sent ? (
                      <>
                        <Check size={16} /> Mensagem preparada
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Enviar no WhatsApp
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChatBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-fit max-w-[88%] rounded-2xl rounded-bl-md bg-[#d9fdd3] px-4 py-2 text-sm font-semibold text-navy">
      {children}
    </div>
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
      <span className="text-xs font-semibold uppercase tracking-wide text-mute">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-sun"
      />
    </label>
  );
}

function whatsappNumber(value: string) {
  const digits = normalizeDigits(value);
  if (digits.startsWith("55")) return digits;
  if (digits.length >= 10) return `55${digits}`;
  return "5545999999999";
}
