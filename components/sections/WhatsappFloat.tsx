"use client";

import { useMemo, useState } from "react";
import { Check, MessageCircle, Phone, Send, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePublicSite } from "@/lib/use-public-site";
import type { Shift } from "@/lib/app-types";
import { normalizeDigits, schoolCategoryLabel, shiftLabel, shifts } from "@/lib/app-utils";
import { cn } from "@/lib/utils";

export function WhatsappFloat() {
  const site = usePublicSite();
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    shift: "manha" as Shift,
    schoolId: "",
    customSchool: "",
    neighborhoodId: "",
  });

  const whatsapp = whatsappNumber(site?.settings.whatsapp || "5545999999999");
  const schools = site?.schools ?? [];
  const neighborhoods = site?.neighborhoods ?? [];
  const selectedSchool = schools.find((school) => school.id === form.schoolId);
  const selectedNeighborhood = neighborhoods.find((neighborhood) => neighborhood.id === form.neighborhoodId);
  const hasCustomSchool = form.schoolId === "outra";

  const availability = useMemo(() => {
    if (!started) {
      return {
        ok: false,
        text: "Clique na opcao abaixo e eu monto a consulta com voce.",
      };
    }

    if (hasCustomSchool) {
      return {
        ok: false,
        text: "Infelizmente essa instituicao ainda nao esta cadastrada para atendimento.",
      };
    }

    if (!selectedSchool) {
      return {
        ok: false,
        text: "Me diga a instituicao para eu conferir se esse turno esta disponivel.",
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
        text: "Agora escolha o bairro onde reside para fechar a consulta.",
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
      text: "Atendemos esse turno, escola e bairro. Posso encaminhar a mensagem completa no WhatsApp.",
    };
  }, [form.shift, hasCustomSchool, selectedNeighborhood, selectedSchool, started]);

  const waMessage = encodeURIComponent(
    [
      "Ola! Gostaria de saber o valor para transporte escolar.",
      `Nome: ${form.name || "Nao informado"}`,
      `WhatsApp: ${form.phone || "Nao informado"}`,
      `Turno: ${shiftLabel(form.shift)}`,
      `Instituicao: ${hasCustomSchool ? form.customSchool || "Outra instituicao" : selectedSchool?.name || "Nao informada"}`,
      selectedSchool ? `Categoria: ${schoolCategoryLabel(selectedSchool.category)}` : "",
      `Bairro onde reside: ${selectedNeighborhood?.name || "Nao informado"}`,
      `Resposta do assistente: ${availability.text}`,
    ].filter(Boolean).join("\n")
  );

  const canSend = Boolean(form.name && form.phone && availability.ok);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 w-[min(380px,calc(100vw-2rem))] rounded-[2rem] border border-slate-200 bg-slate-950 p-3 shadow-2xl shadow-black/30">
          <div className="rounded-[1.5rem] bg-[#edf2f7] p-4 text-navy">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun text-navy">
                  <MessageCircle size={16} />
                </span>
                <div>
                  <div className="text-sm font-bold">{site?.settings.brandName || "Oziel Turismo"}</div>
                  <div className="text-xs text-mute">assistente de atendimento</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar atendimento"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-mute shadow-sm hover:text-navy"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              <ChatBubble>Oi! Posso montar sua consulta de transporte em alguns passos.</ChatBubble>

              {!started ? (
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="w-full rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold text-navy shadow-sm transition hover:bg-sun/20"
                >
                  Gostaria de saber o valor para transporte
                </button>
              ) : (
                <>
                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-mute">
                      Pra qual turno voce necessita?
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {shifts.map((shift) => (
                        <button
                          key={shift}
                          type="button"
                          onClick={() => setForm({ ...form, shift })}
                          className={cn(
                            "rounded-xl px-3 py-2 text-sm font-bold",
                            form.shift === shift ? "bg-navy text-white" : "bg-white text-mute"
                          )}
                        >
                          {shiftLabel(shift)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Field label="Seu nome" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
                  <Field label="Seu WhatsApp" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />

                  <SelectField
                    label="Pra qual instituicao?"
                    value={form.schoolId}
                    onChange={(value) => setForm({ ...form, schoolId: value })}
                  >
                    <option value="">Selecione</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                    <option value="outra">Outra instituicao</option>
                  </SelectField>

                  {hasCustomSchool && (
                    <Field
                      label="Nome da instituicao"
                      value={form.customSchool}
                      onChange={(value) => setForm({ ...form, customSchool: value })}
                    />
                  )}

                  <SelectField
                    label="Bairro onde reside"
                    value={form.neighborhoodId}
                    onChange={(value) => setForm({ ...form, neighborhoodId: value })}
                  >
                    <option value="">Selecione</option>
                    {neighborhoods.map((neighborhood) => (
                      <option key={neighborhood.id} value={neighborhood.id}>
                        {neighborhood.name}
                      </option>
                    ))}
                  </SelectField>
                </>
              )}

              <div
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-semibold",
                  availability.ok ? "border-ok/30 bg-ok/10 text-ok" : "border-slate-200 bg-white text-mute"
                )}
              >
                {availability.text}
              </div>

              {started && (
                <Button
                  type="button"
                  className="w-full"
                  disabled={!canSend}
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
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Abrir assistente do WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105 float-slow"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} fill="white" strokeWidth={0} />}
      </button>
    </>
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
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus-within:border-sun">
        <Phone size={14} className="text-mute" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none placeholder:text-mute/50"
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-wide text-mute">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-sun"
      >
        {children}
      </select>
    </label>
  );
}

function whatsappNumber(value: string) {
  const digits = normalizeDigits(value);
  if (digits.startsWith("55")) return digits;
  if (digits.length >= 10) return `55${digits}`;
  return "5545999999999";
}
