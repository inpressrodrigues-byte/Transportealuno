"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Banknote,
  Bus,
  CheckCircle2,
  Clock,
  FileUp,
  Home,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  Navigation,
  Plus,
  Printer,
  ReceiptText,
  School,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type {
  AddressRecord,
  ChildRecord,
  LiveTrackingState,
  ParentDashboardPayload,
  PaymentRecord,
  ReceiptRecord,
  SessionUser,
} from "@/lib/app-types";
import { formatCurrency, formatPhone, normalizeDigits, paymentStatusLabel } from "@/lib/app-utils";

type ParentTab = "inicio" | "ao-vivo" | "alunos" | "pagamentos" | "perfil";

const tabs = [
  { id: "inicio" as ParentTab, label: "Inicio", icon: Home },
  { id: "ao-vivo" as ParentTab, label: "Ao vivo", icon: Navigation },
  { id: "alunos" as ParentTab, label: "Filhos", icon: UserRound },
  { id: "pagamentos" as ParentTab, label: "Pagamentos", icon: Wallet },
  { id: "perfil" as ParentTab, label: "Perfil", icon: MapPin },
];

const emptyAddress: AddressRecord = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
};

const emptyChild = {
  name: "",
  birthDate: "",
  schoolId: "",
  grade: "",
  responsiblePhone: "",
  address: emptyAddress,
  notes: "",
};

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [data, setData] = useState<ParentDashboardPayload | null>(null);
  const [active, setActive] = useState<ParentTab>("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [childForm, setChildForm] = useState(emptyChild);
  const [openReceipt, setOpenReceipt] = useState<ReceiptRecord | null>(null);

  const load = async (parentId: string) => {
    const response = await fetch(`/api/parent/state?parentId=${parentId}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Responsavel nao encontrado");
    const payload = (await response.json()) as ParentDashboardPayload;
    setData(payload);
    const firstServedSchool = payload.schools.find((school) => school.served);
    setChildForm((current) => ({
      ...current,
      schoolId: current.schoolId || firstServedSchool?.id || payload.schools[0]?.id || "",
      responsiblePhone: current.responsiblePhone || payload.parent.contact,
    }));
  };

  useEffect(() => {
    let alive = true;

    const boot = async () => {
      const raw = localStorage.getItem("rota-segura-session");
      const parsed = raw ? (JSON.parse(raw) as SessionUser) : null;
      if (!parsed || parsed.role !== "parent") {
        router.replace("/login");
        return;
      }

      if (alive) setSession(parsed);
      await load(parsed.id);
      if (alive) setLoading(false);
    };

    boot().catch(() => {
      if (alive) router.replace("/login");
    });

    return () => {
      alive = false;
    };
  }, [router]);

  const nextPayment = useMemo(() => {
    return data?.payments.find((payment) => payment.status !== "approved") || data?.payments[0];
  }, [data]);

  const logout = () => {
    localStorage.removeItem("rota-segura-session");
    router.push("/");
  };

  const schoolName = (id: string) => data?.schools.find((school) => school.id === id)?.name || "Escola";
  const childName = (id: string) => data?.children.find((child) => child.id === id)?.name || "Aluno";

  const updateAddress = (patch: Partial<AddressRecord>) => {
    setChildForm((current) => ({
      ...current,
      address: { ...current.address, ...patch },
    }));
  };

  const lookupCep = async () => {
    const cep = normalizeDigits(childForm.address.cep);
    if (cep.length !== 8) {
      setMessage("Informe um CEP com 8 digitos.");
      return;
    }

    setSaving("cep");
    setMessage("");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const payload = await response.json();
      if (payload.erro) {
        setMessage("CEP nao encontrado.");
        return;
      }

      updateAddress({
        cep,
        street: payload.logradouro || "",
        neighborhood: payload.bairro || "",
        city: payload.localidade || "",
        state: payload.uf || "",
      });
      setMessage("Endereco preenchido pelo CEP.");
    } catch {
      setMessage("Nao foi possivel consultar o CEP agora.");
    } finally {
      setSaving("");
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Este aparelho nao liberou localizacao pelo navegador.");
      return;
    }

    setSaving("gps");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateAddress({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setMessage("Localizacao salva no cadastro. Complete rua e numero se necessario.");
        setSaving("");
      },
      () => {
        setMessage("Nao foi possivel acessar a localizacao do aparelho.");
        setSaving("");
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  const createChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setSaving("child");
    setMessage("");
    const response = await fetch("/api/parent/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...childForm, parentId: session.id }),
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error || "Nao foi possivel cadastrar o aluno.");
      setSaving("");
      return;
    }

    await load(session.id);
    setChildForm({
      ...emptyChild,
      schoolId: data?.schools.find((school) => school.served)?.id || data?.schools[0]?.id || "",
      responsiblePhone: data?.parent.contact || "",
      address: emptyAddress,
    });
    setMessage("Aluno cadastrado.");
    setSaving("");
  };

  const uploadProof = async (payment: PaymentRecord, file?: File) => {
    if (!session || !file) return;
    setSaving(payment.id);
    setMessage("");

    try {
      const fileData = await readFileAsDataUrl(file);
      const response = await fetch(`/api/parent/payments/${payment.id}/proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: session.id,
          fileName: file.name,
          fileType: file.type,
          fileData,
        }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(payload.error || "Nao foi possivel anexar o comprovante.");
        return;
      }

      await load(session.id);
      setMessage("Comprovante anexado. O recibo foi liberado.");
    } catch {
      setMessage("Falha ao ler o arquivo anexado.");
    } finally {
      setSaving("");
    }
  };

  if (loading || !session || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-mist text-navy">
        <Loader2 className="animate-spin text-sun-2" size={28} />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-mist dark:bg-[#0b1220]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-white dark:border-white/10 dark:bg-navy lg:flex">
        <Link href="/" className="flex items-center gap-2 px-6 py-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun text-navy">
            <Bus size={17} strokeWidth={2.5} />
          </span>
          <span className="text-sm font-bold text-navy dark:text-white">Rota Segura</span>
        </Link>
        <nav className="mt-2 flex-1 space-y-1 px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  active === tab.id
                    ? "bg-navy text-white dark:bg-sun dark:text-navy"
                    : "text-mute hover:bg-mist dark:text-white/60 dark:hover:bg-white/5"
                )}
              >
                <Icon size={16} /> {tab.label}
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

      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-line bg-white px-4 py-3 dark:border-white/10 dark:bg-navy lg:hidden">
        <span className="text-sm font-bold text-navy dark:text-white">Rota Segura</span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-navy dark:text-white" aria-label="Abrir menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {menuOpen && (
        <div className="fixed inset-x-0 top-[52px] z-30 border-b border-line bg-white p-3 dark:border-white/10 dark:bg-navy lg:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActive(tab.id);
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium",
                  active === tab.id ? "bg-navy text-white dark:bg-sun dark:text-navy" : "text-mute dark:text-white/60"
                )}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-mute dark:text-white/60">
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}

      <main className="px-4 pb-16 pt-20 lg:ml-64 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sun-2">Area dos pais</p>
          <h1 className="mt-2 text-3xl font-semibold text-navy dark:text-white">
            Ola, familia {data.parent.name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-sm text-mute dark:text-white/60">
            Cadastre os filhos, acompanhe mensalidades, envie comprovantes e baixe recibos.
          </p>

          {message && (
            <div className="mt-5 rounded-xl border border-sun/30 bg-sun/10 px-4 py-3 text-sm font-medium text-navy dark:text-sun">
              {message}
            </div>
          )}

          <section className="mt-8">
            {active === "inicio" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <InfoCard icon={UserRound} label="Responsavel" value={data.parent.name} />
                  <InfoCard icon={School} label="Filhos cadastrados" value={data.children.length.toString()} />
                  <InfoCard icon={Wallet} label="Proxima mensalidade" value={nextPayment ? formatCurrency(nextPayment.amount) : "Sem mensalidade"} />
                  <InfoCard icon={Clock} label="Status" value={nextPayment ? paymentStatusLabel(nextPayment.status) : "Tudo certo"} />
                </div>

                <Panel title="Pix da empresa" subtitle="Use estes dados para pagar a mensalidade.">
                  <PixBox settings={data.settings} />
                </Panel>

                <LivePanel initialLive={data.liveTracking} />
              </div>
            )}

            {active === "ao-vivo" && (
              <LivePanel initialLive={data.liveTracking} expanded />
            )}

            {active === "alunos" && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_420px]">
                <Panel title="Filhos cadastrados" subtitle="Cada filho pode ter escola e endereco de embarque proprios.">
                  <div className="space-y-3">
                    {data.children.length === 0 && (
                      <EmptyState text="Nenhum filho cadastrado ainda." />
                    )}
                    {data.children.map((child) => (
                      <ChildCard key={child.id} child={child} schoolName={schoolName(child.schoolId)} />
                    ))}
                  </div>
                </Panel>

                <Panel title="Cadastrar filho" subtitle="O CEP ajuda a preencher o endereco automaticamente.">
                  <form onSubmit={createChild} className="space-y-4">
                    <Field label="Nome do filho" value={childForm.name} onChange={(v) => setChildForm({ ...childForm, name: v })} required />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Nascimento" value={childForm.birthDate} onChange={(v) => setChildForm({ ...childForm, birthDate: v })} type="date" />
                      <Field label="Serie/turma" value={childForm.grade} onChange={(v) => setChildForm({ ...childForm, grade: v })} />
                    </div>
                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Escola</span>
                      <select
                        required
                        value={childForm.schoolId}
                        onChange={(e) => setChildForm({ ...childForm, schoolId: e.target.value })}
                        className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="">Selecione</option>
                        {data.schools.filter((school) => school.served).map((school) => (
                          <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                      </select>
                    </label>
                    <Field label="Numero do responsavel" value={childForm.responsiblePhone} onChange={(v) => setChildForm({ ...childForm, responsiblePhone: v })} />

                    <div className="rounded-2xl border border-line p-4 dark:border-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-navy dark:text-white">Endereco de embarque</h3>
                          <p className="text-sm text-mute dark:text-white/55">Busque pelo CEP ou salve a localizacao do celular.</p>
                        </div>
                        <Button type="button" variant="outlineDark" size="sm" onClick={useCurrentLocation} disabled={saving === "gps"}>
                          <MapPin size={14} /> GPS
                        </Button>
                      </div>
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                        <Field label="CEP" value={childForm.address.cep} onChange={(v) => updateAddress({ cep: v })} />
                        <Button type="button" variant="outlineDark" className="self-end" onClick={lookupCep} disabled={saving === "cep"}>
                          Buscar CEP
                        </Button>
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_110px]">
                        <Field label="Rua" value={childForm.address.street} onChange={(v) => updateAddress({ street: v })} />
                        <Field label="Numero" value={childForm.address.number} onChange={(v) => updateAddress({ number: v })} />
                      </div>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Bairro" value={childForm.address.neighborhood} onChange={(v) => updateAddress({ neighborhood: v })} />
                        <Field label="Complemento" value={childForm.address.complement} onChange={(v) => updateAddress({ complement: v })} />
                        <Field label="Cidade" value={childForm.address.city} onChange={(v) => updateAddress({ city: v })} />
                        <Field label="Estado" value={childForm.address.state} onChange={(v) => updateAddress({ state: v })} />
                      </div>
                      {childForm.address.latitude && childForm.address.longitude && (
                        <p className="mt-3 text-xs text-ok">
                          Localizacao salva: {childForm.address.latitude.toFixed(5)}, {childForm.address.longitude.toFixed(5)}
                        </p>
                      )}
                    </div>

                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Observacoes</span>
                      <textarea
                        value={childForm.notes}
                        onChange={(e) => setChildForm({ ...childForm, notes: e.target.value })}
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </label>

                    <Button type="submit" disabled={saving === "child"}>
                      <Plus size={16} /> Cadastrar filho
                    </Button>
                  </form>
                </Panel>
              </div>
            )}

            {active === "pagamentos" && (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[330px_1fr]">
                <Panel title="Dados Pix" subtitle="Recibo so fica disponivel depois do comprovante.">
                  <PixBox settings={data.settings} />
                </Panel>

                <Panel title="Mensalidades" subtitle="Anexe o comprovante para liberar seu recibo.">
                  <div className="space-y-3">
                    {data.payments.length === 0 && <EmptyState text="Nenhuma mensalidade cadastrada ainda." />}
                    {data.payments.map((payment) => (
                      <div key={payment.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="font-semibold text-navy dark:text-white">
                              {payment.month} - {childName(payment.childId)}
                            </div>
                            <div className="mt-1 text-sm text-mute dark:text-white/55">
                              {formatCurrency(payment.amount)} · vencimento {payment.dueDate}
                            </div>
                          </div>
                          <PaymentBadge payment={payment} />
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <label className={cn(
                            "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-2",
                            saving === payment.id && "pointer-events-none opacity-50"
                          )}>
                            <FileUp size={15} />
                            {payment.proof ? "Trocar comprovante" : "Anexar comprovante"}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="sr-only"
                              onChange={(e) => uploadProof(payment, e.target.files?.[0])}
                            />
                          </label>
                          {payment.receipt ? (
                            <Button type="button" variant="outlineDark" size="sm" onClick={() => setOpenReceipt(payment.receipt || null)}>
                              <ReceiptText size={15} /> Ver recibo
                            </Button>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-2 text-xs font-semibold text-mute dark:bg-white/5 dark:text-white/55">
                              Sem comprovante, sem recibo
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            )}

            {active === "perfil" && (
              <Panel title="Perfil do responsavel" subtitle="Dados usados para acesso e contato.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ProfileLine label="Nome" value={data.parent.name} />
                  <ProfileLine label="Contato de login" value={formatPhone(data.parent.contact)} />
                  <ProfileLine label="Email" value={data.parent.email || "Nao informado"} />
                  <ProfileLine label="CPF senha" value={`Final ${data.parent.cpfLast4}`} />
                </div>
              </Panel>
            )}
          </section>
        </div>
      </main>

      {openReceipt && (
        <ReceiptModal receipt={openReceipt} onClose={() => setOpenReceipt(null)} />
      )}
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function LivePanel({
  initialLive,
  expanded,
}: {
  initialLive: LiveTrackingState;
  expanded?: boolean;
}) {
  const [live, setLive] = useState(initialLive);

  useEffect(() => {
    const timer = window.setInterval(() => {
      fetch("/api/live", { cache: "no-store" })
        .then((response) => response.json())
        .then((payload: LiveTrackingState) => setLive(payload))
        .catch(() => {});
    }, 12000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-line bg-navy p-6 text-white dark:border-white/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className={cn("h-2.5 w-2.5 rounded-full", live.active ? "bg-ok pulse-dot" : "bg-white/30")} />
            AO VIVO
          </div>
          <h2 className="mt-2 text-2xl font-semibold">
            {live.active ? "Motorista em rota" : "Fora do horario de transporte"}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            A localizacao aparece somente enquanto o motorista mantem a rota ligada.
          </p>
        </div>
        <span className={cn(
          "w-fit rounded-full px-3 py-1 text-xs font-bold",
          live.active ? "bg-ok/15 text-ok" : "bg-white/10 text-white/45"
        )}>
          {live.active ? "SINAL ATIVO" : "DESLIGADO"}
        </span>
      </div>

      <div className={cn("mt-6 grid grid-cols-1 gap-3", expanded ? "md:grid-cols-3" : "sm:grid-cols-2")}>
        <LiveLine label="Bairro atual" value={live.active ? live.currentNeighborhood || "Em deslocamento" : "Indisponivel"} />
        <LiveLine label="Proxima parada" value={live.active ? live.nextStop || "Nao informada" : "Indisponivel"} />
        <LiveLine label="Previsao" value={live.active ? `${live.estimatedMinutes || 0} min` : "Indisponivel"} />
        {expanded && (
          <>
            <LiveLine label="Latitude" value={live.latitude ? live.latitude.toFixed(5) : "Sem GPS"} />
            <LiveLine label="Longitude" value={live.longitude ? live.longitude.toFixed(5) : "Sem GPS"} />
            <LiveLine label="Ultimo sinal" value={live.lastSeenAt ? new Date(live.lastSeenAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Sem sinal"} />
          </>
        )}
      </div>

      {live.active && live.latitude && live.longitude && (
        <a
          href={`https://www.google.com/maps?q=${live.latitude},${live.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-sun px-5 py-2.5 text-sm font-semibold text-navy"
        >
          <MapPin size={15} /> Abrir no mapa
        </a>
      )}
    </div>
  );
}

function LiveLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="text-xs uppercase tracking-wide text-white/45">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun/15 text-sun-2">
        <Icon size={18} />
      </div>
      <div className="mt-3 text-xs uppercase tracking-wide text-mute dark:text-white/50">{label}</div>
      <div className="mt-1 text-sm font-semibold text-navy dark:text-white">{value}</div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-navy dark:text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-mute dark:text-white/55">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </label>
  );
}

function PixBox({ settings }: { settings: ParentDashboardPayload["settings"] }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-2xl bg-mist p-4 dark:bg-white/5">
        <div className="text-xs uppercase tracking-wide text-mute dark:text-white/45">Chave Pix</div>
        <div className="mt-1 break-all font-semibold text-navy dark:text-white">{settings.pixKey}</div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-mist p-4 dark:bg-white/5">
          <div className="text-xs uppercase tracking-wide text-mute dark:text-white/45">Titular</div>
          <div className="mt-1 font-semibold text-navy dark:text-white">{settings.pixHolder}</div>
        </div>
        <div className="rounded-2xl bg-mist p-4 dark:bg-white/5">
          <div className="text-xs uppercase tracking-wide text-mute dark:text-white/45">Banco</div>
          <div className="mt-1 font-semibold text-navy dark:text-white">{settings.pixBank}</div>
        </div>
      </div>
    </div>
  );
}

function ChildCard({ child, schoolName }: { child: ChildRecord; schoolName: string }) {
  return (
    <div className="rounded-2xl border border-line p-4 dark:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-navy dark:text-white">{child.name}</div>
          <div className="mt-1 text-sm text-mute dark:text-white/55">{schoolName} · {child.grade || "Serie nao informada"}</div>
        </div>
        <span className="rounded-full bg-ok/10 px-3 py-1 text-xs font-semibold text-ok">Ativo</span>
      </div>
      <div className="mt-4 rounded-xl bg-mist p-3 text-sm text-mute dark:bg-white/5 dark:text-white/60">
        {child.address.street || "Endereco nao informado"}, {child.address.number || "s/n"} · {child.address.neighborhood || "bairro"}
      </div>
    </div>
  );
}

function PaymentBadge({ payment }: { payment: PaymentRecord }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        payment.status === "approved" && "bg-ok/10 text-ok",
        payment.status === "proof_received" && "bg-sun/15 text-sun-2",
        payment.status === "pending_proof" && "bg-mist text-mute dark:bg-white/5 dark:text-white/55",
        payment.status === "rejected" && "bg-red-500/10 text-red-600"
      )}
    >
      {payment.status === "approved" ? <CheckCircle2 size={13} /> : <Banknote size={13} />}
      {paymentStatusLabel(payment.status)}
    </span>
  );
}

function ProfileLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line p-4 dark:border-white/10">
      <div className="text-xs uppercase tracking-wide text-mute dark:text-white/50">{label}</div>
      <div className="mt-1 font-semibold text-navy dark:text-white">{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-mute dark:border-white/10 dark:text-white/55">
      {text}
    </div>
  );
}

function ReceiptModal({ receipt, onClose }: { receipt: ReceiptRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 text-navy shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sun-2">Recibo</p>
            <h2 className="mt-2 text-2xl font-semibold">{receipt.number}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-mute hover:bg-mist" aria-label="Fechar recibo">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-line p-4">
          <ReceiptLine label="Empresa" value={receipt.companyName} />
          <ReceiptLine label="Pagador" value={receipt.payerName} />
          <ReceiptLine label="Aluno" value={receipt.childName} />
          <ReceiptLine label="Referencia" value={receipt.month} />
          <ReceiptLine label="Valor" value={formatCurrency(receipt.amount)} />
          <ReceiptLine label="Chave Pix" value={receipt.pixKey} />
          <ReceiptLine label="Gerado em" value={new Date(receipt.generatedAt).toLocaleString("pt-BR")} />
        </div>

        <p className="mt-4 rounded-2xl bg-mist p-4 text-sm text-mute">{receipt.note}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir
          </Button>
          <Button type="button" variant="outlineDark" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReceiptLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-mute">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}
