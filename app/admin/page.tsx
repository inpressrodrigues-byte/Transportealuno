"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Banknote,
  Bus,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Home,
  IdCard,
  Loader2,
  Lock,
  LogOut,
  MapPinned,
  Navigation,
  Palette,
  QrCode,
  ReceiptText,
  Save,
  School,
  Settings,
  ShieldCheck,
  Trash2,
  UserRoundPlus,
  UsersRound,
  Wallet,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LiveRouteMap } from "@/components/ui/LiveRouteMap";
import { cn } from "@/lib/utils";
import type {
  AdminPayload,
  ChildAbsenceStatus,
  CompanySettings,
  NeighborhoodRecord,
  PaymentStatus,
  SchoolCategory,
  SessionUser,
  Shift,
  ThemeSettings,
} from "@/lib/app-types";
import {
  formatCurrency,
  formatPhone,
  paymentStatusLabel,
  schoolCategories,
  schoolCategoryLabel,
  shiftLabel,
  shifts,
  shiftsLabel,
} from "@/lib/app-utils";

type AdminTab = "overview" | "company" | "schools" | "neighborhoods" | "parents" | "payments" | "live" | "checkin" | "theme";

const tabs = [
  { id: "overview" as AdminTab, label: "Visao geral", icon: Home },
  { id: "company" as AdminTab, label: "Empresa e Pix", icon: Settings },
  { id: "schools" as AdminTab, label: "Escolas", icon: School },
  { id: "neighborhoods" as AdminTab, label: "Bairros", icon: MapPinned },
  { id: "parents" as AdminTab, label: "Responsaveis", icon: UsersRound },
  { id: "payments" as AdminTab, label: "Pagamentos", icon: Wallet },
  { id: "live" as AdminTab, label: "Ao vivo", icon: Navigation },
  { id: "checkin" as AdminTab, label: "QR e check-in", icon: QrCode },
  { id: "theme" as AdminTab, label: "Cores", icon: Palette },
];

const emptyCompany: CompanySettings = {
  brandName: "",
  businessName: "",
  document: "",
  driverName: "",
  phone: "",
  whatsapp: "",
  pixKey: "",
  pixHolder: "",
  pixBank: "",
  receiptText: "",
};

const emptyTheme: ThemeSettings = {
  navy: "#0f172a",
  navy2: "#16213b",
  ink: "#1e293b",
  mute: "#64748b",
  mist: "#f1f5f9",
  cloud: "#f8fafc",
  sun: "#facc15",
  sun2: "#eab308",
  ok: "#22c55e",
};

const emptySchoolForm = {
  id: "",
  name: "",
  city: "Toledo, PR",
  category: "particular" as SchoolCategory,
  address: "",
  neighborhood: "",
  served: true,
  servedShifts: ["manha"] as Shift[],
  active: true,
};

const emptyNeighborhoodForm = {
  id: "",
  name: "",
  area: "Urbano",
  served: true,
  color: "#facc15",
  x: "50",
  y: "50",
  notes: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [data, setData] = useState<AdminPayload | null>(null);
  const [active, setActive] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [schoolFilter, setSchoolFilter] = useState<SchoolCategory | "todas">("todas");
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>([]);
  const [selectedNeighborhoodIds, setSelectedNeighborhoodIds] = useState<string[]>([]);
  const [origin] = useState(() => (typeof window === "undefined" ? "" : window.location.origin));
  const [loginForm, setLoginForm] = useState({ contact: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [adminAccessForm, setAdminAccessForm] = useState({ id: "", name: "", login: "", password: "" });

  const [settingsForm, setSettingsForm] = useState<CompanySettings>(emptyCompany);
  const [themeForm, setThemeForm] = useState<ThemeSettings>(emptyTheme);
  const [schoolForm, setSchoolForm] = useState(emptySchoolForm);
  const [neighborhoodForm, setNeighborhoodForm] = useState(emptyNeighborhoodForm);
  const [parentForm, setParentForm] = useState({ name: "", contact: "", email: "", cpf: "" });
  const [paymentForm, setPaymentForm] = useState({
    parentId: "",
    childId: "",
    month: "",
    dueDate: "",
    amount: "220",
  });

  const load = async () => {
    const response = await fetch("/api/admin/state", { cache: "no-store" });
    const payload = (await response.json()) as AdminPayload;
    setData(payload);
    setSettingsForm(payload.settings);
    setThemeForm(payload.theme);
    setAdminAccessForm({
      id: payload.adminAccess.id,
      name: payload.adminAccess.name,
      login: payload.adminAccess.login,
      password: "",
    });
  };

  useEffect(() => {
    const wasDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.add("dark");

    return () => {
      if (wasDark) return;
      const mode = localStorage.getItem("theme-mode") || localStorage.getItem("theme") || "light";
      const hour = new Date().getHours();
      const dark = mode === "dark" || (mode === "auto" && (hour >= 18 || hour < 6));
      document.documentElement.classList.toggle("dark", dark);
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const boot = async () => {
      const raw = localStorage.getItem("rota-segura-session");
      const parsed = raw ? (JSON.parse(raw) as SessionUser) : null;
      if (!parsed || parsed.role !== "admin") {
        if (alive) setLoading(false);
        return;
      }

      if (alive) setSession(parsed);
      await load();
      if (alive) setLoading(false);
    };

    boot().catch(() => {
      if (alive) setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  const loginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("admin-login");
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const payload = (await response.json()) as { user?: SessionUser; error?: string };

      if (!response.ok || !payload.user) {
        setLoginError(payload.error || "Nao foi possivel entrar.");
        return;
      }

      if (payload.user.role !== "admin") {
        setLoginError("Este acesso nao pertence ao painel administrativo.");
        return;
      }

      localStorage.setItem("rota-segura-session", JSON.stringify(payload.user));
      window.dispatchEvent(new Event("rota-segura-session"));
      setSession(payload.user);
      await load();
      setMessage("Admin conectado.");
    } catch {
      setLoginError("Falha ao conectar com o sistema.");
    } finally {
      setSaving("");
    }
  };

  const selectedParentChildren = useMemo(() => {
    if (!data) return [];
    return data.children.filter((child) => child.parentId === paymentForm.parentId && child.active);
  }, [data, paymentForm.parentId]);

  const filteredSchools = useMemo(() => {
    const list = data?.schools ?? [];
    if (schoolFilter === "todas") return list;
    return list.filter((schoolItem) => schoolItem.category === schoolFilter);
  }, [data, schoolFilter]);
  const visibleSchoolIds = filteredSchools.map((schoolItem) => schoolItem.id);
  const allVisibleSchoolsSelected =
    visibleSchoolIds.length > 0 && visibleSchoolIds.every((id) => selectedSchoolIds.includes(id));
  const visibleNeighborhoodIds = data?.neighborhoods.map((neighborhood) => neighborhood.id) ?? [];
  const allVisibleNeighborhoodsSelected =
    visibleNeighborhoodIds.length > 0 && visibleNeighborhoodIds.every((id) => selectedNeighborhoodIds.includes(id));

  const servedSchools = data?.schools.filter((schoolItem) => schoolItem.served && schoolItem.active) ?? [];
  const servedNeighborhoods = data?.neighborhoods.filter((neighborhood) => neighborhood.served) ?? [];
  const pendingPayments = data?.payments.filter((payment) => payment.status === "pending_proof").length ?? 0;
  const receivedProofs = data?.payments.filter((payment) => payment.proof).length ?? 0;
  const todayNotices = data?.children.filter((child) => child.absenceStatus !== "going") ?? [];
  const recentCheckins = data?.checkins.slice(0, 12) ?? [];
  const checkinUrl = data?.vanQrCode?.token ? `${origin || ""}/checkin?token=${data.vanQrCode.token}` : "";
  const qrImageUrl = checkinUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(checkinUrl)}`
    : "";

  const logout = () => {
    localStorage.removeItem("rota-segura-session");
    setSession(null);
    setData(null);
    router.push("/");
  };

  const saveSettings = async () => {
    setSaving("settings");
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: settingsForm, theme: themeForm }),
    });
    if (response.ok) {
      await load();
      setMessage("Informacoes salvas.");
    }
    setSaving("");
  };

  const saveAdminAccess = async () => {
    setSaving("admin-access");
    setMessage("");
    const response = await fetch("/api/admin/access", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminAccessForm),
    });
    const payload = (await response.json().catch(() => null)) as {
      adminAccess?: AdminPayload["adminAccess"];
      error?: string;
    } | null;

    if (response.ok && payload?.adminAccess) {
      const updatedSession = session
        ? { ...session, name: payload.adminAccess.name, contact: payload.adminAccess.login }
        : session;
      if (updatedSession) {
        setSession(updatedSession);
        localStorage.setItem("rota-segura-session", JSON.stringify(updatedSession));
      }
      await load();
      setMessage("Acesso administrativo atualizado.");
    } else {
      setMessage(payload?.error || "Nao foi possivel atualizar o acesso.");
    }

    setSaving("");
  };

  const saveSchool = async (e?: React.FormEvent, payload = schoolForm) => {
    e?.preventDefault();
    setSaving("school");
    setMessage("");
    const response = await fetch("/api/admin/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      await load();
      setSchoolForm(emptySchoolForm);
      setMessage(payload.id ? "Escola atualizada." : "Escola adicionada.");
    }
    setSaving("");
  };

  const removeSchool = async (id: string, name: string) => {
    const confirmed = window.confirm(`Excluir a escola "${name}" do catalogo?`);
    if (!confirmed) return;

    setSaving(`school-delete-${id}`);
    setMessage("");
    const response = await fetch("/api/admin/schools", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      await load();
      if (schoolForm.id === id) setSchoolForm(emptySchoolForm);
      setMessage("Escola excluida.");
    } else {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error || "Nao foi possivel excluir a escola.");
    }

    setSaving("");
  };

  const toggleSchoolSelection = (id: string) => {
    setSelectedSchoolIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleVisibleSchoolsSelection = () => {
    setSelectedSchoolIds((current) => {
      if (allVisibleSchoolsSelected) {
        return current.filter((id) => !visibleSchoolIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleSchoolIds]));
    });
  };

  const bulkUpdateSchools = async (action: "serve" | "pause" | "delete") => {
    if (selectedSchoolIds.length === 0) {
      setMessage("Selecione pelo menos uma escola.");
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm(`Excluir ${selectedSchoolIds.length} escola(s) selecionada(s)?`);
      if (!confirmed) return;
    }

    setSaving(`schools-bulk-${action}`);
    setMessage("");
    const response = await fetch("/api/admin/schools", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selectedSchoolIds, action }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (response.ok) {
      await load();
      setSelectedSchoolIds([]);
      setMessage(
        action === "delete"
          ? "Escolas excluidas."
          : action === "serve"
            ? "Escolas marcadas como atendidas."
            : "Escolas pausadas."
      );
    } else {
      setMessage(payload?.error || "Nao foi possivel atualizar as escolas.");
    }

    setSaving("");
  };

  const editSchool = (schoolItem: AdminPayload["schools"][number]) => {
    setSchoolForm({
      id: schoolItem.id,
      name: schoolItem.name,
      city: schoolItem.city,
      category: schoolItem.category,
      address: schoolItem.address,
      neighborhood: schoolItem.neighborhood,
      served: schoolItem.served,
      servedShifts: schoolItem.servedShifts,
      active: schoolItem.active,
    });
    setActive("schools");
  };

  const saveNeighborhood = async (e?: React.FormEvent, payload = neighborhoodForm) => {
    e?.preventDefault();
    setSaving("neighborhood");
    setMessage("");
    const response = await fetch("/api/admin/neighborhoods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: payload.id,
        name: payload.name,
        area: payload.area,
        served: payload.served,
        color: payload.color,
        notes: payload.notes,
        position: {
          x: Number(payload.x),
          y: Number(payload.y),
        },
      }),
    });
    if (response.ok) {
      await load();
      setNeighborhoodForm(emptyNeighborhoodForm);
      setMessage(payload.id ? "Bairro atualizado." : "Bairro adicionado.");
    }
    setSaving("");
  };

  const editNeighborhood = (neighborhood: NeighborhoodRecord) => {
    setNeighborhoodForm({
      id: neighborhood.id,
      name: neighborhood.name,
      area: neighborhood.area,
      served: neighborhood.served,
      color: neighborhood.color,
      x: String(neighborhood.position.x),
      y: String(neighborhood.position.y),
      notes: neighborhood.notes,
    });
    setActive("neighborhoods");
  };

  const toggleNeighborhoodSelection = (id: string) => {
    setSelectedNeighborhoodIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleVisibleNeighborhoodsSelection = () => {
    setSelectedNeighborhoodIds((current) => {
      if (allVisibleNeighborhoodsSelected) {
        return current.filter((id) => !visibleNeighborhoodIds.includes(id));
      }

      return Array.from(new Set([...current, ...visibleNeighborhoodIds]));
    });
  };

  const bulkUpdateNeighborhoods = async (
    action: "serve" | "pause" | "delete",
    ids = selectedNeighborhoodIds
  ) => {
    if (ids.length === 0) {
      setMessage("Selecione pelo menos um bairro.");
      return;
    }

    if (action === "delete") {
      const confirmed = window.confirm(`Excluir ${ids.length} bairro(s) selecionado(s)?`);
      if (!confirmed) return;
    }

    setSaving(`neighborhoods-bulk-${action}`);
    setMessage("");
    const response = await fetch("/api/admin/neighborhoods", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, action }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (response.ok) {
      await load();
      setSelectedNeighborhoodIds((current) => current.filter((id) => !ids.includes(id)));
      if (neighborhoodForm.id && ids.includes(neighborhoodForm.id)) setNeighborhoodForm(emptyNeighborhoodForm);
      setMessage(
        action === "delete"
          ? "Bairros excluidos."
          : action === "serve"
            ? "Bairros marcados como atendidos."
            : "Bairros pausados."
      );
    } else {
      setMessage(payload?.error || "Nao foi possivel atualizar os bairros.");
    }

    setSaving("");
  };

  const createParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("parent");
    setMessage("");
    const response = await fetch("/api/admin/parents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parentForm),
    });
    if (response.ok) {
      await load();
      setParentForm({ name: "", contact: "", email: "", cpf: "" });
      setMessage("Responsavel cadastrado. O CPF informado ja vira a senha dele.");
    }
    setSaving("");
  };

  const createPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("payment");
    setMessage("");
    const response = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...paymentForm,
        amount: Number(paymentForm.amount.replace(",", ".")),
      }),
    });
    if (response.ok) {
      await load();
      setPaymentForm({ parentId: "", childId: "", month: "", dueDate: "", amount: "220" });
      setMessage("Mensalidade criada.");
    }
    setSaving("");
  };

  const updatePaymentStatus = async (paymentId: string, status: PaymentStatus) => {
    setSaving(paymentId);
    setMessage("");
    const response = await fetch(`/api/admin/payments/${paymentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = (await response.json()) as { error?: string };
    if (response.ok) {
      await load();
      setMessage("Pagamento atualizado.");
    } else {
      setMessage(payload.error || "Nao foi possivel atualizar.");
    }
    setSaving("");
  };

  const stopLive = async () => {
    setSaving("live");
    await fetch("/api/driver/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false, source: "manual" }),
    });
    await load();
    setMessage("Ao vivo encerrado.");
    setSaving("");
  };

  const regenerateQr = async () => {
    setSaving("qr");
    setMessage("");
    const response = await fetch("/api/admin/qr", { method: "POST" });
    if (response.ok) {
      await load();
      setMessage("Novo QR Code da van gerado.");
    } else {
      setMessage("Nao foi possivel gerar um novo QR.");
    }
    setSaving("");
  };

  const schoolName = (id: string) => data?.schools.find((schoolItem) => schoolItem.id === id)?.name || "Sem escola";
  const parentName = (id: string) => data?.parents.find((parent) => parent.id === id)?.name || "Responsavel";
  const childName = (id: string) => data?.children.find((child) => child.id === id)?.name || "Aluno";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1220] text-white">
        <Loader2 className="animate-spin text-sun-2" size={28} />
      </main>
    );
  }

  if (!session || !data) {
    return (
      <AdminLogin
        form={loginForm}
        error={loginError}
        saving={saving === "admin-login"}
        onChange={setLoginForm}
        onSubmit={loginAdmin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-mist dark:bg-[#0b1220]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-line bg-white p-5 dark:border-white/10 dark:bg-navy lg:block">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun text-navy">
            <Bus size={18} strokeWidth={2.5} />
          </span>
          <div>
            <div className="text-sm font-bold text-navy dark:text-white">Oziel Turismo</div>
            <div className="text-xs text-mute dark:text-white/45">Painel administrativo</div>
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
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
          className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-mute hover:bg-mist dark:text-white/60 dark:hover:bg-white/5"
        >
          <LogOut size={16} /> Sair
        </button>
      </aside>

      <main className="px-4 py-5 lg:ml-72 lg:px-10 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 dark:border-white/10 dark:bg-white/[0.04] lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-navy dark:text-white">Admin</span>
            <button onClick={logout} className="text-sm font-semibold text-mute dark:text-white/60">
              Sair
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-semibold",
                  active === tab.id ? "bg-navy text-white" : "bg-mist text-mute"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <header className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sun-2">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-navy dark:text-white">
            Controle do transporte escolar
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-mute dark:text-white/60">
            Cadastre escolas, turnos, bairros atendidos, pagamentos, Pix, cores e rastreamento ao vivo.
          </p>
          {message && (
            <div className="mt-4 rounded-xl border border-sun/30 bg-sun/10 px-4 py-3 text-sm font-medium text-navy dark:text-sun">
              {message}
            </div>
          )}
        </header>

        <section className="mx-auto mt-8 max-w-6xl">
          {active === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric icon={School} label="Escolas atendidas" value={servedSchools.length.toString()} />
                <Metric icon={MapPinned} label="Bairros atendidos" value={servedNeighborhoods.length.toString()} />
                <Metric icon={GraduationCap} label="Alunos" value={data.children.length.toString()} />
                <Metric icon={ReceiptText} label="Comprovantes" value={receivedProofs.toString()} />
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
                <Panel title="Fila de pagamentos" subtitle={`${pendingPayments} aguardando comprovante`}>
                  <PaymentList
                    payments={data.payments.slice(0, 6)}
                    parentName={parentName}
                    childName={childName}
                    saving={saving}
                    onStatus={updatePaymentStatus}
                  />
                </Panel>

                <Panel title="Ao vivo" subtitle={data.liveTracking.active ? "Motorista em rota" : "Fora de rota"}>
                  <div className="rounded-2xl bg-mist p-5 text-sm dark:bg-white/5">
                    <div className="text-xs uppercase tracking-wide text-mute dark:text-white/45">Bairro atual</div>
                    <div className="mt-1 font-semibold text-navy dark:text-white">
                      {data.liveTracking.currentNeighborhood || "Sem sinal"}
                    </div>
                    <div className="mt-4 text-xs uppercase tracking-wide text-mute dark:text-white/45">Previsao</div>
                    <div className="mt-1 font-semibold text-navy dark:text-white">
                      {data.liveTracking.active ? `${data.liveTracking.estimatedMinutes || 0} min` : "Indisponivel"}
                    </div>
                    <Button type="button" className="mt-5" onClick={() => setActive("live")}>
                      Abrir controle
                    </Button>
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {active === "company" && (
            <div className="space-y-5">
              <Panel title="Empresa, contato e Pix" subtitle="Esses dados aparecem para os pais e nos recibos.">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <Field label="Nome da marca" value={settingsForm.brandName} onChange={(v) => setSettingsForm({ ...settingsForm, brandName: v })} />
                  <Field label="Razao social" value={settingsForm.businessName} onChange={(v) => setSettingsForm({ ...settingsForm, businessName: v })} />
                  <Field label="CNPJ/Documento" value={settingsForm.document} onChange={(v) => setSettingsForm({ ...settingsForm, document: v })} />
                  <Field label="Motorista principal" value={settingsForm.driverName} onChange={(v) => setSettingsForm({ ...settingsForm, driverName: v })} />
                  <Field label="Telefone" value={settingsForm.phone} onChange={(v) => setSettingsForm({ ...settingsForm, phone: v })} />
                  <Field label="WhatsApp com DDI" value={settingsForm.whatsapp} onChange={(v) => setSettingsForm({ ...settingsForm, whatsapp: v })} />
                  <Field label="Chave Pix" value={settingsForm.pixKey} onChange={(v) => setSettingsForm({ ...settingsForm, pixKey: v })} />
                  <Field label="Titular do Pix" value={settingsForm.pixHolder} onChange={(v) => setSettingsForm({ ...settingsForm, pixHolder: v })} />
                  <Field label="Banco do Pix" value={settingsForm.pixBank} onChange={(v) => setSettingsForm({ ...settingsForm, pixBank: v })} />
                  <label className="lg:col-span-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Texto do recibo</span>
                    <textarea
                      value={settingsForm.receiptText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, receiptText: e.target.value })}
                      rows={4}
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </label>
                </div>
                <Button onClick={saveSettings} className="mt-6" disabled={saving === "settings"}>
                  <Save size={16} /> Salvar empresa e Pix
                </Button>
              </Panel>

              <Panel title="Acesso administrativo" subtitle="Altere o usuario do /admin e defina uma nova senha quando precisar.">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <Field
                    label="Nome exibido"
                    value={adminAccessForm.name}
                    onChange={(v) => setAdminAccessForm({ ...adminAccessForm, name: v })}
                  />
                  <Field
                    label="Usuario do admin"
                    value={adminAccessForm.login}
                    onChange={(v) => setAdminAccessForm({ ...adminAccessForm, login: v })}
                  />
                  <Field
                    label="Nova senha"
                    type="password"
                    placeholder="Deixe em branco para manter"
                    value={adminAccessForm.password}
                    onChange={(v) => setAdminAccessForm({ ...adminAccessForm, password: v })}
                  />
                </div>
                <Button onClick={saveAdminAccess} className="mt-6" disabled={saving === "admin-access"}>
                  <ShieldCheck size={16} /> Salvar acesso admin
                </Button>
              </Panel>
            </div>
          )}

          {active === "schools" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
              <Panel
                title={schoolForm.id ? "Editar escola" : "Adicionar escola"}
                subtitle="Marque se atende e em quais turnos."
              >
                <form onSubmit={(e) => saveSchool(e)} className="space-y-4">
                  <Field label="Nome da escola" value={schoolForm.name} onChange={(v) => setSchoolForm({ ...schoolForm, name: v })} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Categoria</span>
                      <select
                        value={schoolForm.category}
                        onChange={(e) => setSchoolForm({ ...schoolForm, category: e.target.value as SchoolCategory })}
                        className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        {schoolCategories.map((category) => (
                          <option key={category} value={category}>{schoolCategoryLabel(category)}</option>
                        ))}
                      </select>
                    </label>
                    <Field label="Cidade" value={schoolForm.city} onChange={(v) => setSchoolForm({ ...schoolForm, city: v })} />
                  </div>
                  <Field label="Bairro da escola" value={schoolForm.neighborhood} onChange={(v) => setSchoolForm({ ...schoolForm, neighborhood: v })} />
                  <Field label="Endereco" value={schoolForm.address} onChange={(v) => setSchoolForm({ ...schoolForm, address: v })} />

                  <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                    <input
                      type="checkbox"
                      checked={schoolForm.served}
                      onChange={(e) => setSchoolForm({ ...schoolForm, served: e.target.checked })}
                      className="h-4 w-4 accent-sun"
                    />
                    Atendemos esta escola
                  </label>

                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Turnos atendidos</span>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {shifts.map((shift) => (
                        <label key={shift} className="flex items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                          <input
                            type="checkbox"
                            checked={schoolForm.servedShifts.includes(shift)}
                            onChange={() => {
                              setSchoolForm((current) => ({
                                ...current,
                                servedShifts: current.servedShifts.includes(shift)
                                  ? current.servedShifts.filter((item) => item !== shift)
                                  : [...current.servedShifts, shift],
                              }));
                            }}
                            className="h-4 w-4 accent-sun"
                          />
                          {shiftLabel(shift)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving === "school"}>
                      <Save size={16} /> {schoolForm.id ? "Salvar" : "Adicionar"}
                    </Button>
                    {schoolForm.id && (
                      <Button type="button" variant="outlineDark" onClick={() => setSchoolForm(emptySchoolForm)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </Panel>

              <Panel title="Catalogo de escolas de Toledo" subtitle={`${filteredSchools.length} registros visiveis`}>
                <div className="mb-4 flex flex-wrap gap-2">
                  {["todas", ...schoolCategories].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSchoolFilter(category as SchoolCategory | "todas")}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-semibold transition",
                        schoolFilter === category ? "bg-navy text-white dark:bg-sun dark:text-navy" : "bg-mist text-mute dark:bg-white/5 dark:text-white/60"
                      )}
                    >
                      {category === "todas" ? "Todas" : schoolCategoryLabel(category)}
                    </button>
                  ))}
                </div>
                <div className="mb-4 rounded-2xl border border-line bg-mist p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <label className="flex items-center gap-3 text-sm font-semibold text-navy dark:text-white">
                      <input
                        type="checkbox"
                        checked={allVisibleSchoolsSelected}
                        onChange={toggleVisibleSchoolsSelection}
                        className="h-4 w-4 accent-sun"
                      />
                      Selecionar escolas visiveis
                    </label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">
                      {selectedSchoolIds.length} selecionada(s)
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" variant="outlineDark" size="sm" onClick={() => bulkUpdateSchools("serve")} disabled={saving === "schools-bulk-serve"}>
                      Atender selecionadas
                    </Button>
                    <Button type="button" variant="outlineDark" size="sm" onClick={() => bulkUpdateSchools("pause")} disabled={saving === "schools-bulk-pause"}>
                      Pausar selecionadas
                    </Button>
                    <Button type="button" variant="outlineDark" size="sm" onClick={() => bulkUpdateSchools("delete")} disabled={saving === "schools-bulk-delete"}>
                      <Trash2 size={14} /> Excluir selecionadas
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {filteredSchools.map((schoolItem) => (
                    <div key={schoolItem.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <label className="flex min-w-0 items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedSchoolIds.includes(schoolItem.id)}
                            onChange={() => toggleSchoolSelection(schoolItem.id)}
                            className="mt-1 h-4 w-4 flex-none accent-sun"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-navy dark:text-white">{schoolItem.name}</div>
                            <div className="mt-1 text-sm text-mute dark:text-white/55">
                              {schoolCategoryLabel(schoolItem.category)} - {schoolItem.neighborhood || schoolItem.city}
                            </div>
                          </div>
                        </label>
                        <span className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          schoolItem.served ? "bg-ok/10 text-ok" : "bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/45"
                        )}>
                          {schoolItem.served ? "Atendida" : "Nao atende"}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-mute dark:text-white/55">
                        Turnos: {shiftsLabel(schoolItem.servedShifts)}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="button" variant="outlineDark" size="sm" onClick={() => editSchool(schoolItem)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outlineDark"
                          size="sm"
                          onClick={() => saveSchool(undefined, { ...schoolItem, served: !schoolItem.served })}
                          disabled={saving === "school"}
                        >
                          {schoolItem.served ? "Pausar" : "Atender"}
                        </Button>
                        <Button
                          type="button"
                          variant="outlineDark"
                          size="sm"
                          onClick={() => removeSchool(schoolItem.id, schoolItem.name)}
                          disabled={saving === `school-delete-${schoolItem.id}`}
                        >
                          <Trash2 size={14} /> Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {active === "neighborhoods" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
              <Panel
                title={neighborhoodForm.id ? "Editar bairro" : "Adicionar bairro"}
                subtitle="Bairros atendidos ficam coloridos no mapa."
              >
                <form onSubmit={(e) => saveNeighborhood(e)} className="space-y-4">
                  <Field label="Nome do bairro" value={neighborhoodForm.name} onChange={(v) => setNeighborhoodForm({ ...neighborhoodForm, name: v })} />
                  <Field label="Regiao/observacao" value={neighborhoodForm.area} onChange={(v) => setNeighborhoodForm({ ...neighborhoodForm, area: v })} />
                  <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                    <input
                      type="checkbox"
                      checked={neighborhoodForm.served}
                      onChange={(e) => setNeighborhoodForm({ ...neighborhoodForm, served: e.target.checked })}
                      className="h-4 w-4 accent-sun"
                    />
                    Atendemos este bairro
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Cor</span>
                      <input
                        type="color"
                        value={neighborhoodForm.color}
                        onChange={(e) => setNeighborhoodForm({ ...neighborhoodForm, color: e.target.value })}
                        className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent"
                      />
                    </label>
                    <Field label="X mapa" value={neighborhoodForm.x} onChange={(v) => setNeighborhoodForm({ ...neighborhoodForm, x: v })} />
                    <Field label="Y mapa" value={neighborhoodForm.y} onChange={(v) => setNeighborhoodForm({ ...neighborhoodForm, y: v })} />
                  </div>
                  <Field label="Notas internas" value={neighborhoodForm.notes} onChange={(v) => setNeighborhoodForm({ ...neighborhoodForm, notes: v })} />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving === "neighborhood"}>
                      <Save size={16} /> Salvar bairro
                    </Button>
                    {neighborhoodForm.id && (
                      <Button type="button" variant="outlineDark" onClick={() => setNeighborhoodForm(emptyNeighborhoodForm)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </Panel>

              <Panel title="Mapa de atendimento" subtitle="Colorido atende; preto e branco ainda nao atende.">
                <NeighborhoodMap neighborhoods={data.neighborhoods} />
                <div className="mt-6 rounded-2xl border border-line bg-mist p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <label className="flex items-center gap-3 text-sm font-semibold text-navy dark:text-white">
                      <input
                        type="checkbox"
                        checked={allVisibleNeighborhoodsSelected}
                        onChange={toggleVisibleNeighborhoodsSelection}
                        className="h-4 w-4 accent-sun"
                      />
                      Selecionar bairros visiveis
                    </label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">
                      {selectedNeighborhoodIds.length} selecionado(s)
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" variant="outlineDark" size="sm" onClick={() => bulkUpdateNeighborhoods("serve")} disabled={saving === "neighborhoods-bulk-serve"}>
                      Atender selecionados
                    </Button>
                    <Button type="button" variant="outlineDark" size="sm" onClick={() => bulkUpdateNeighborhoods("pause")} disabled={saving === "neighborhoods-bulk-pause"}>
                      Pausar selecionados
                    </Button>
                    <Button type="button" variant="outlineDark" size="sm" onClick={() => bulkUpdateNeighborhoods("delete")} disabled={saving === "neighborhoods-bulk-delete"}>
                      <Trash2 size={14} /> Excluir selecionados
                    </Button>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {data.neighborhoods.map((neighborhood) => (
                    <div key={neighborhood.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <label className="flex min-w-0 items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedNeighborhoodIds.includes(neighborhood.id)}
                            onChange={() => toggleNeighborhoodSelection(neighborhood.id)}
                            className="mt-1 h-4 w-4 flex-none accent-sun"
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-navy dark:text-white">{neighborhood.name}</div>
                            <div className="text-sm text-mute dark:text-white/55">{neighborhood.area}</div>
                          </div>
                        </label>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            neighborhood.served ? "bg-ok/10 text-ok" : "bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/45"
                          )}
                        >
                          {neighborhood.served ? "Atendido" : "Nao atende"}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="button" variant="outlineDark" size="sm" onClick={() => editNeighborhood(neighborhood)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outlineDark"
                          size="sm"
                          onClick={() =>
                            saveNeighborhood(undefined, {
                              id: neighborhood.id,
                              name: neighborhood.name,
                              area: neighborhood.area,
                              served: !neighborhood.served,
                              color: neighborhood.color,
                              x: String(neighborhood.position.x),
                              y: String(neighborhood.position.y),
                              notes: neighborhood.notes,
                            })
                          }
                          disabled={saving === "neighborhood"}
                        >
                          {neighborhood.served ? "Pausar" : "Atender"}
                        </Button>
                        <Button
                          type="button"
                          variant="outlineDark"
                          size="sm"
                          onClick={() => bulkUpdateNeighborhoods("delete", [neighborhood.id])}
                          disabled={saving === "neighborhoods-bulk-delete"}
                        >
                          <Trash2 size={14} /> Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {active === "parents" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
              <Panel title="Cadastrar responsavel" subtitle="Contato e CPF serao usados no login da area dos pais.">
                <form onSubmit={createParent} className="space-y-4">
                  <Field label="Nome completo" value={parentForm.name} onChange={(v) => setParentForm({ ...parentForm, name: v })} />
                  <Field label="Numero de contato" value={parentForm.contact} onChange={(v) => setParentForm({ ...parentForm, contact: v })} />
                  <Field label="Email" value={parentForm.email} onChange={(v) => setParentForm({ ...parentForm, email: v })} />
                  <Field label="CPF senha" value={parentForm.cpf} onChange={(v) => setParentForm({ ...parentForm, cpf: v })} />
                  <Button type="submit" disabled={saving === "parent"}>
                    <UserRoundPlus size={16} /> Cadastrar responsavel
                  </Button>
                </form>
              </Panel>

              <Panel title="Responsaveis e alunos" subtitle="Os alunos sao cadastrados pela area do responsavel.">
                <div className="space-y-3">
                  {data.parents.map((parent) => {
                    const children = data.children.filter((child) => child.parentId === parent.id);
                    return (
                      <div key={parent.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="font-semibold text-navy dark:text-white">{parent.name}</div>
                            <div className="mt-1 flex flex-wrap gap-3 text-sm text-mute dark:text-white/55">
                              <span>{formatPhone(parent.contact)}</span>
                              <span>CPF final {parent.cpfLast4}</span>
                            </div>
                          </div>
                          <span className="rounded-full bg-ok/10 px-3 py-1 text-xs font-semibold text-ok">
                            {children.length} aluno(s)
                          </span>
                        </div>
                        {children.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                            {children.map((child) => (
                              <div key={child.id} className="rounded-xl bg-mist px-4 py-3 text-sm dark:bg-white/5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="font-semibold text-navy dark:text-white">{child.name}</div>
                                  <AbsenceBadge status={child.absenceStatus} />
                                </div>
                                <div className="text-mute dark:text-white/55">{schoolName(child.schoolId)}</div>
                                <div className="mt-1 text-xs text-mute dark:text-white/45">
                                  CPF final {child.cpfLast4 || "nao informado"} - nascimento {child.birthDate || "nao informado"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>
          )}

          {active === "payments" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
              <Panel title="Criar mensalidade" subtitle="O recibo so libera depois do comprovante anexado.">
                <form onSubmit={createPayment} className="space-y-4">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Responsavel</span>
                    <select
                      value={paymentForm.parentId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, parentId: e.target.value, childId: "" })}
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                      required
                    >
                      <option value="">Selecione</option>
                      {data.parents.map((parent) => (
                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Aluno</span>
                    <select
                      value={paymentForm.childId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, childId: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                      required
                    >
                      <option value="">Selecione</option>
                      {selectedParentChildren.map((child) => (
                        <option key={child.id} value={child.id}>{child.name}</option>
                      ))}
                    </select>
                  </label>
                  <Field label="Mes de referencia" value={paymentForm.month} onChange={(v) => setPaymentForm({ ...paymentForm, month: v })} placeholder="Setembro/2026" />
                  <Field label="Vencimento" value={paymentForm.dueDate} onChange={(v) => setPaymentForm({ ...paymentForm, dueDate: v })} type="date" />
                  <Field label="Valor" value={paymentForm.amount} onChange={(v) => setPaymentForm({ ...paymentForm, amount: v })} />
                  <Button type="submit" disabled={saving === "payment"}>
                    <Banknote size={16} /> Criar mensalidade
                  </Button>
                </form>
              </Panel>

              <Panel title="Pagamentos" subtitle="Aprove ou recuse comprovantes recebidos.">
                <PaymentList
                  payments={data.payments}
                  parentName={parentName}
                  childName={childName}
                  saving={saving}
                  onStatus={updatePaymentStatus}
                />
              </Panel>
            </div>
          )}

          {active === "live" && (
            <Panel title="Ao vivo do motorista" subtitle="O motorista pode abrir esta tela no celular e iniciar a rota com GPS.">
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
                <div className="rounded-2xl border border-line p-5 dark:border-white/10">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-navy dark:text-white">
                        Status: {data.liveTracking.active ? "em rota" : "fora de rota"}
                      </div>
                      <div className="mt-1 text-sm text-mute dark:text-white/55">
                        Bairro atual: {data.liveTracking.currentNeighborhood || "sem sinal"} - proxima parada: {data.liveTracking.nextStop || "nao informada"}
                      </div>
                    </div>
                    <span className={cn(
                      "w-fit rounded-full px-3 py-1 text-xs font-semibold",
                      data.liveTracking.active ? "bg-ok/10 text-ok" : "bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/45"
                    )}>
                      {data.liveTracking.active ? "AO VIVO" : "DESLIGADO"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ProfileLine label="Bairro" value={data.liveTracking.currentNeighborhood || "Sem bairro"} />
                    <ProfileLine label="Proxima parada" value={data.liveTracking.nextStop || "Nao informada"} />
                    <ProfileLine label="Estimativa" value={data.liveTracking.active ? `${data.liveTracking.estimatedMinutes || 0} min` : "Indisponivel"} />
                  </div>

                  <div className="mt-5">
                    <LiveRouteMap live={data.liveTracking} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href="/driver" target="_blank" className="inline-flex items-center justify-center gap-2 rounded-full bg-sun px-6 py-3 text-sm font-semibold text-navy transition hover:bg-sun-2">
                      <Navigation size={16} /> Abrir tela do motorista
                    </Link>
                    <Button type="button" variant="outlineDark" onClick={stopLive} disabled={saving === "live"}>
                      Encerrar ao vivo
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl bg-mist p-5 text-sm text-mute dark:bg-white/5 dark:text-white/60">
                  <div className="font-semibold text-navy dark:text-white">Como funciona</div>
                  <p className="mt-2">
                    O celular do motorista envia a posicao atual enquanto a rota estiver ligada. Se parar de enviar sinal por mais de 45 minutos, a area dos pais deixa de mostrar o ao vivo.
                  </p>
                </div>
              </div>
            </Panel>
          )}

          {active === "checkin" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
              <Panel title="QR Code da van" subtitle="Imprima ou deixe este QR fixado dentro da van.">
                <div className="rounded-2xl border border-line bg-white p-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="QR Code da van para check-in"
                      className="mx-auto h-64 w-64 rounded-xl bg-white p-3"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-xl bg-mist text-sm text-mute dark:bg-white/5 dark:text-white/50">
                      Gerando QR
                    </div>
                  )}
                  <div className="mt-4 break-all rounded-xl bg-mist px-3 py-2 text-xs text-mute dark:bg-white/5 dark:text-white/55">
                    {checkinUrl || "Link indisponivel"}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" onClick={regenerateQr} disabled={saving === "qr"}>
                    <QrCode size={16} /> Gerar novo QR
                  </Button>
                  {checkinUrl && (
                    <Button
                      type="button"
                      variant="outlineDark"
                      onClick={() => navigator.clipboard?.writeText(checkinUrl)}
                    >
                      Copiar link
                    </Button>
                  )}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-mute dark:text-white/55">
                  Ao trocar o QR, o codigo antigo deixa de registrar check-ins.
                </p>
              </Panel>

              <div className="space-y-5">
                <Panel title="Avisos dos pais" subtitle="Status que o motorista tambem ve na rota.">
                  <div className="space-y-3">
                    {todayNotices.length === 0 && <EmptyState text="Nenhum aviso de ausencia no momento." />}
                    {todayNotices.map((child) => (
                      <div key={child.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="font-semibold text-navy dark:text-white">{child.name}</div>
                            <div className="text-sm text-mute dark:text-white/55">
                              {parentName(child.parentId)} - {schoolName(child.schoolId)}
                            </div>
                          </div>
                          <AbsenceBadge status={child.absenceStatus} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Check-ins recentes" subtitle="Horario e localizacao enviados ao escanear o QR da van.">
                  <div className="space-y-3">
                    {recentCheckins.length === 0 && <EmptyState text="Nenhum check-in registrado ainda." />}
                    {recentCheckins.map((checkin) => (
                      <CheckinRow
                        key={checkin.id}
                        checkin={checkin}
                        childName={childName(checkin.childId)}
                        parentName={parentName(checkin.parentId)}
                      />
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {active === "theme" && (
            <Panel title="Cores do sistema" subtitle="Muda a paleta usada no site, admin e area dos pais.">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(themeForm).map(([key, value]) => (
                  <label key={key} className="rounded-2xl border border-line p-4 dark:border-white/10">
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">
                      {key}
                    </span>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        type="color"
                        value={value}
                        onChange={(e) => setThemeForm({ ...themeForm, [key]: e.target.value })}
                        className="h-10 w-12 rounded-lg border border-line bg-transparent"
                      />
                      <input
                        value={value}
                        onChange={(e) => setThemeForm({ ...themeForm, [key]: e.target.value })}
                        className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                  </label>
                ))}
              </div>
              <Button onClick={saveSettings} className="mt-6" disabled={saving === "settings"}>
                <Palette size={16} /> Salvar cores
              </Button>
            </Panel>
          )}
        </section>
      </main>
    </div>
  );
}

function AdminLogin({
  form,
  error,
  saving,
  onChange,
  onSubmit,
}: {
  form: { contact: string; password: string };
  error: string;
  saving: boolean;
  onChange: (form: { contact: string; password: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1220] px-4 py-10 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(250,204,21,0.12),transparent)]"
      />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/55 hover:text-white">
          Voltar ao site
        </Link>

        <span className="mt-7 flex h-12 w-12 items-center justify-center rounded-full bg-sun text-navy">
          <ShieldCheck size={22} />
        </span>
        <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-sun">
          Painel restrito
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Entrada administrativa</h1>
        <p className="mt-2 text-sm leading-relaxed text-white/55">
          Acesso separado da area dos responsaveis. Use o usuario e a senha do administrador.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-5">
          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-white/55">Usuario do admin</span>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
              <IdCard size={16} className="text-white/40" />
              <input
                required
                value={form.contact}
                onChange={(e) => onChange({ ...form, contact: e.target.value })}
                placeholder="InpresS"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>
          </label>

          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-white/55">Senha</span>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
              <Lock size={16} className="text-white/40" />
              <input
                required
                type="password"
                value={form.password}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
                placeholder="Senha administrativa"
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Entrando
              </>
            ) : (
              <>
                <IdCard size={16} /> Entrar no admin
              </>
            )}
          </Button>
        </form>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sun/15 text-sun-2">
        <Icon size={18} />
      </div>
      <div className="mt-4 text-3xl font-semibold tabular-nums text-navy dark:text-white">{value}</div>
      <div className="mt-1 text-sm text-mute dark:text-white/55">{label}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
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
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
      />
    </label>
  );
}

function NeighborhoodMap({ neighborhoods }: { neighborhoods: NeighborhoodRecord[] }) {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4 dark:border-white/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-800">
      <div className="absolute inset-6 rounded-[38%_62%_44%_56%/46%_42%_58%_54%] border border-slate-300 bg-white/50 shadow-inner grayscale dark:border-white/10 dark:bg-white/5" />
      <div className="absolute inset-x-14 top-1/2 h-px bg-slate-300 dark:bg-white/10" />
      <div className="absolute left-1/2 top-10 h-[280px] w-px bg-slate-300 dark:bg-white/10" />
      {neighborhoods.map((neighborhood) => (
        <button
          key={neighborhood.id}
          type="button"
          title={neighborhood.notes || neighborhood.name}
          className={cn(
            "absolute max-w-[132px] -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm transition",
            neighborhood.served
              ? "border-white/70 text-navy"
              : "border-slate-300 bg-slate-100 text-slate-500 grayscale dark:border-white/10 dark:bg-slate-800 dark:text-white/40"
          )}
          style={{
            left: `${neighborhood.position.x}%`,
            top: `${neighborhood.position.y}%`,
            backgroundColor: neighborhood.served ? neighborhood.color : undefined,
          }}
        >
          {neighborhood.name}
        </button>
      ))}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 rounded-2xl bg-white/80 p-3 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur dark:bg-slate-950/70 dark:text-white/60">
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sun" /> Atende</span>
        <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Nao atende</span>
      </div>
    </div>
  );
}

function PaymentList({
  payments,
  parentName,
  childName,
  saving,
  onStatus,
}: {
  payments: AdminPayload["payments"];
  parentName: (id: string) => string;
  childName: (id: string) => string;
  saving: string;
  onStatus: (paymentId: string, status: PaymentStatus) => void;
}) {
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-mute dark:border-white/10 dark:text-white/55">
        Nenhum pagamento cadastrado ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div key={payment.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="font-semibold text-navy dark:text-white">
                {payment.month} - {childName(payment.childId)}
              </div>
              <div className="mt-1 text-sm text-mute dark:text-white/55">
                {parentName(payment.parentId)} - {formatCurrency(payment.amount)} - vence {payment.dueDate}
              </div>
            </div>
            <span
              className={cn(
                "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                payment.status === "approved" && "bg-ok/10 text-ok",
                payment.status === "proof_received" && "bg-sun/15 text-sun-2",
                payment.status === "pending_proof" && "bg-mist text-mute dark:bg-white/5 dark:text-white/55",
                payment.status === "rejected" && "bg-red-500/10 text-red-600"
              )}
            >
              {payment.status === "approved" && <CheckCircle2 size={13} />}
              {payment.status === "rejected" && <XCircle size={13} />}
              {paymentStatusLabel(payment.status)}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outlineDark"
              size="sm"
              disabled={saving === payment.id || !payment.proof}
              onClick={() => onStatus(payment.id, "approved")}
            >
              Aprovar
            </Button>
            <Button
              type="button"
              variant="outlineDark"
              size="sm"
              disabled={saving === payment.id}
              onClick={() => onStatus(payment.id, "rejected")}
            >
              Recusar
            </Button>
            {payment.proof ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-ok/10 px-3 py-2 text-xs font-semibold text-ok">
                <ReceiptText size={13} /> Recibo liberado
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-2 text-xs font-semibold text-mute dark:bg-white/5 dark:text-white/55">
                Sem comprovante, sem recibo
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
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

function AbsenceBadge({ status }: { status: ChildAbsenceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        status === "going" && "bg-ok/10 text-ok",
        status === "not_going" && "bg-red-500/10 text-red-600 dark:text-red-300",
        status === "not_returning" && "bg-sun/15 text-sun-2"
      )}
    >
      <CalendarClock size={13} />
      {absenceLabel(status)}
    </span>
  );
}

function absenceLabel(status: ChildAbsenceStatus) {
  const labels: Record<ChildAbsenceStatus, string> = {
    going: "Vai hoje",
    not_going: "Nao vou hoje",
    not_returning: "Nao volto",
  };

  return labels[status];
}

function CheckinRow({
  checkin,
  childName,
  parentName,
}: {
  checkin: AdminPayload["checkins"][number];
  childName: string;
  parentName: string;
}) {
  const hasLocation = typeof checkin.latitude === "number" && typeof checkin.longitude === "number";

  return (
    <div className="rounded-2xl border border-line p-4 dark:border-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-semibold text-navy dark:text-white">{childName}</div>
          <div className="text-sm text-mute dark:text-white/55">
            {parentName} - {new Date(checkin.scannedAt).toLocaleString("pt-BR")}
          </div>
        </div>
        <span className="rounded-full bg-ok/10 px-3 py-1 text-xs font-semibold text-ok">
          {checkin.type === "returning" ? "Volta" : "Embarque"}
        </span>
      </div>
      {hasLocation ? (
        <a
          href={`https://www.google.com/maps?q=${checkin.latitude},${checkin.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm font-semibold text-sun-2 hover:underline"
        >
          Abrir localizacao
        </a>
      ) : (
        <p className="mt-3 text-sm text-mute dark:text-white/45">Registrado sem permissao de GPS.</p>
      )}
    </div>
  );
}
