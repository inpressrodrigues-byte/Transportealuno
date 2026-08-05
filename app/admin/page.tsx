"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Banknote,
  Building2,
  Bus,
  CalendarClock,
  CheckCircle2,
  Copy,
  DatabaseBackup,
  Download,
  Eye,
  EyeOff,
  FileSignature,
  Fuel,
  Gauge,
  GraduationCap,
  Home,
  IdCard,
  Loader2,
  Lock,
  LogOut,
  MapPinned,
  MessageCircle,
  Navigation,
  Palette,
  Pencil,
  Plus,
  QrCode,
  RefreshCw,
  ReceiptText,
  Save,
  School,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  UsersRound,
  Wallet,
  Wrench,
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

type AdminTab =
  | "overview"
  | "companies"
  | "company"
  | "drivers"
  | "vans"
  | "operations"
  | "schools"
  | "neighborhoods"
  | "parents"
  | "payments"
  | "reports"
  | "live"
  | "checkin"
  | "contracts"
  | "audit"
  | "theme";

const tabs = [
  { id: "overview" as AdminTab, label: "Visao geral", icon: Home },
  { id: "companies" as AdminTab, label: "Empresas", icon: Building2 },
  { id: "company" as AdminTab, label: "Empresa e Pix", icon: Settings },
  { id: "drivers" as AdminTab, label: "Motoristas", icon: UsersRound },
  { id: "vans" as AdminTab, label: "Vans", icon: Bus },
  { id: "operations" as AdminTab, label: "Operacao e frota", icon: Wrench },
  { id: "schools" as AdminTab, label: "Escolas", icon: School },
  { id: "neighborhoods" as AdminTab, label: "Bairros", icon: MapPinned },
  { id: "parents" as AdminTab, label: "Responsaveis", icon: UsersRound },
  { id: "payments" as AdminTab, label: "Pagamentos", icon: Wallet },
  { id: "reports" as AdminTab, label: "Relatorios", icon: BarChart3 },
  { id: "live" as AdminTab, label: "Ao vivo", icon: Navigation },
  { id: "checkin" as AdminTab, label: "QR e check-in", icon: QrCode },
  { id: "contracts" as AdminTab, label: "Contratos", icon: FileSignature },
  { id: "audit" as AdminTab, label: "Auditoria", icon: ShieldAlert },
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
  monthlyFeeDefault: 220,
  monthlyDueDay: 5,
  automaticMonthlyBilling: true,
  routeApiProvider: "local-ai",
  routeApiKey: "",
};

const emptyCompanyForm = {
  id: "",
  name: "",
  document: "",
  password: "",
  active: true,
  whatsapp: "",
  phone: "",
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

const emptyDriverForm = {
  id: "",
  name: "",
  contact: "",
  cpf: "",
  license: "",
  vanId: "",
  active: true,
};

const emptyVanForm = {
  id: "",
  label: "",
  plate: "",
  model: "",
  seats: "15",
  color: "#facc15",
  driverId: "",
  active: true,
  notes: "",
};

const emptyParentForm = {
  id: "",
  name: "",
  contact: "",
  email: "",
  cpf: "",
  active: true,
};

const emptyChildForm = {
  id: "",
  parentId: "",
  name: "",
  cpf: "",
  birthDate: "",
  schoolId: "",
  grade: "",
  responsiblePhone: "",
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "Toledo",
  state: "PR",
  notes: "",
  driverId: "",
  vanId: "",
  shift: "" as Shift | "",
  active: true,
};

const emptyDriverDocumentForm = {
  id: "",
  driverId: "",
  type: "cnh" as "cnh" | "curso" | "exame" | "outro",
  label: "CNH",
  documentNumber: "",
  issuedAt: "",
  expiresAt: "",
  notes: "",
  active: true,
};

const emptyOccurrenceForm = {
  id: "",
  driverId: "",
  childId: "",
  occurredAt: "",
  severity: "low" as "low" | "medium" | "high",
  title: "",
  description: "",
  resolved: false,
  resolution: "",
};

const emptyMaintenanceForm = {
  id: "",
  vanId: "",
  type: "revision" as "maintenance" | "ipva" | "insurance" | "revision" | "tires" | "other",
  title: "",
  dueDate: "",
  completedAt: "",
  odometer: "",
  cost: "",
  status: "pending" as "pending" | "completed",
  notes: "",
};

const emptyFuelForm = {
  id: "",
  vanId: "",
  filledAt: "",
  liters: "",
  amount: "",
  odometer: "",
  station: "",
  notes: "",
};

const emptyExpenseForm = {
  id: "",
  category: "other" as "fuel" | "maintenance" | "tax" | "insurance" | "payroll" | "other",
  description: "",
  amount: "",
  dueDate: "",
  paidAt: "",
  status: "pending" as "pending" | "paid",
  notes: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);
  const [data, setData] = useState<AdminPayload | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
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
  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [contractTemplate, setContractTemplate] = useState("");
  const [contractForm, setContractForm] = useState({ parentId: "", childId: "", title: "" });
  const [resetForm, setResetForm] = useState({ confirmation: "", password: "" });

  const [settingsForm, setSettingsForm] = useState<CompanySettings>(emptyCompany);
  const [themeForm, setThemeForm] = useState<ThemeSettings>(emptyTheme);
  const [schoolForm, setSchoolForm] = useState(emptySchoolForm);
  const [neighborhoodForm, setNeighborhoodForm] = useState(emptyNeighborhoodForm);
  const [driverForm, setDriverForm] = useState(emptyDriverForm);
  const [vanForm, setVanForm] = useState(emptyVanForm);
  const [parentForm, setParentForm] = useState(emptyParentForm);
  const [childForm, setChildForm] = useState(emptyChildForm);
  const [driverDocumentForm, setDriverDocumentForm] = useState(emptyDriverDocumentForm);
  const [occurrenceForm, setOccurrenceForm] = useState(emptyOccurrenceForm);
  const [maintenanceForm, setMaintenanceForm] = useState(emptyMaintenanceForm);
  const [fuelForm, setFuelForm] = useState(emptyFuelForm);
  const [expenseForm, setExpenseForm] = useState(emptyExpenseForm);
  const [dashboardDates] = useState(() => {
    const now = new Date();
    return {
      today: now.toISOString().slice(0, 10),
      warning: new Date(now.getTime() + 30 * 86400000).toISOString().slice(0, 10),
    };
  });
  const [paymentForm, setPaymentForm] = useState({
    id: "",
    parentId: "",
    childId: "",
    month: "",
    dueDate: "",
    amount: "220",
    chargeEnabled: true,
    paymentMethod: "pix" as "pix" | "boleto" | "card" | "cash",
    externalReference: "",
  });

  const activeCompanyId =
    session?.role === "company"
      ? session.companyId || session.id
      : selectedCompanyId || data?.currentCompany?.id || data?.companies[0]?.id || "";
  const companyTabs: AdminTab[] = [
    "overview",
    "company",
    "drivers",
    "vans",
    "operations",
    "parents",
    "payments",
    "reports",
    "live",
    "checkin",
    "contracts",
    "audit",
  ];
  const visibleTabs = tabs.filter((tab) =>
    session?.role === "admin" ? true : companyTabs.includes(tab.id)
  );

  const load = async (companyId = activeCompanyId) => {
    const suffix = companyId ? `?companyId=${encodeURIComponent(companyId)}` : "";
    const response = await fetch(`/api/admin/state${suffix}`, { cache: "no-store" });
    if (response.status === 401) {
      localStorage.removeItem("rota-segura-session");
      setSession(null);
      throw new Error("Sessao expirada");
    }
    if (!response.ok) throw new Error("Nao foi possivel carregar o painel");
    const payload = (await response.json()) as AdminPayload;
    setData(payload);
    const nextCompanyId = payload.currentCompany?.id || payload.companies[0]?.id || "";
    if (nextCompanyId && session?.role !== "company") setSelectedCompanyId(nextCompanyId);
    setSettingsForm(payload.settings);
    setThemeForm(payload.theme);
    setContractTemplate(payload.currentCompany?.contractTemplate || "");
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
      if (!parsed || (parsed.role !== "admin" && parsed.role !== "company")) {
        if (alive) setLoading(false);
        return;
      }

      if (alive) setSession(parsed);
      const companyId = parsed.role === "company" ? parsed.companyId || parsed.id : selectedCompanyId;
      if (companyId && alive) setSelectedCompanyId(companyId);
      await load(companyId);
      if (alive) setLoading(false);
    };

    boot().catch(() => {
      if (alive) setLoading(false);
    });

    return () => {
      alive = false;
    };
    // O carregamento inicial usa a sessao salva no navegador; reexecutar por troca de estado aqui causaria recarregamentos duplicados.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (payload.user.role !== "admin" && payload.user.role !== "company") {
        setLoginError("Este acesso nao pertence ao painel administrativo.");
        return;
      }

      localStorage.setItem("rota-segura-session", JSON.stringify(payload.user));
      window.dispatchEvent(new Event("rota-segura-session"));
      setSession(payload.user);
      const companyId = payload.user.role === "company" ? payload.user.companyId || payload.user.id : selectedCompanyId;
      if (companyId) setSelectedCompanyId(companyId);
      await load(companyId);
      setMessage(payload.user.role === "company" ? "Empresa conectada." : "Admin conectado.");
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

  const selectedContractChildren = useMemo(() => {
    if (!data) return [];
    return data.children.filter((child) => child.parentId === contractForm.parentId && child.active);
  }, [data, contractForm.parentId]);

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
  const activeDrivers = data?.drivers.filter((driver) => driver.active) ?? [];
  const activeVans = data?.vans.filter((van) => van.active) ?? [];
  const pendingPayments = data?.payments.filter((payment) => payment.status === "pending_proof").length ?? 0;
  const receivedProofs = data?.payments.filter((payment) => payment.proof).length ?? 0;
  const approvedPayments = data?.payments.filter((payment) => payment.status === "approved") ?? [];
  const openPayments = data?.payments.filter((payment) => payment.chargeEnabled && payment.status !== "approved") ?? [];
  const approvedAmount = approvedPayments.reduce((total, payment) => total + payment.amount, 0);
  const openAmount = openPayments.reduce((total, payment) => total + payment.amount, 0);
  const activeChildren = data?.children.filter((child) => child.active) ?? [];
  const onlineDrivers = data?.liveTrackings.filter((tracking) => tracking.active).length ?? 0;
  const paidExpenses = data?.expenses.filter((expense) => expense.status === "paid") ?? [];
  const pendingExpenses = data?.expenses.filter((expense) => expense.status === "pending") ?? [];
  const paidExpenseAmount = paidExpenses.reduce((total, expense) => total + expense.amount, 0);
  const pendingExpenseAmount = pendingExpenses.reduce((total, expense) => total + expense.amount, 0);
  const estimatedProfit = approvedAmount - paidExpenseAmount;
  const todayKey = dashboardDates.today;
  const warningLimit = dashboardDates.warning;
  const overduePayments = openPayments.filter((payment) => payment.dueDate && payment.dueDate < todayKey);
  const expiringDocuments = data?.driverDocuments.filter(
    (document) => document.active && document.expiresAt && document.expiresAt <= warningLimit
  ) ?? [];
  const upcomingMaintenances = data?.vehicleMaintenances.filter(
    (maintenance) => maintenance.status === "pending" && maintenance.dueDate && maintenance.dueDate <= warningLimit
  ) ?? [];
  const unassignedVans = data?.vans.filter((van) => van.active && !van.driverId) ?? [];
  const intelligentAlerts = [
    overduePayments.length
      ? { severity: "high", title: "Cobrancas atrasadas", text: `${overduePayments.length} mensalidade(s) passaram do vencimento.` }
      : null,
    expiringDocuments.length
      ? { severity: "medium", title: "Documentos proximos do vencimento", text: `${expiringDocuments.length} documento(s) vencem em ate 30 dias.` }
      : null,
    upcomingMaintenances.length
      ? { severity: "medium", title: "Frota exige atencao", text: `${upcomingMaintenances.length} compromisso(s) de manutencao estao proximos.` }
      : null,
    unassignedVans.length
      ? { severity: "low", title: "Veiculos sem motorista", text: `${unassignedVans.length} van(s) ativa(s) ainda nao possuem motorista.` }
      : null,
    (data?.children.filter((child) => child.absenceStatus !== "going").length || 0) > 0
      ? { severity: "low", title: "Rota pode ser otimizada", text: "Ha ausencias informadas hoje. Gere novamente a rota para evitar paradas desnecessarias." }
      : null,
    data?.liveTrackings.some((tracking) => tracking.active && tracking.estimatedMinutes >= 15)
      ? { severity: "medium", title: "Possivel atraso", text: "Uma rota ao vivo possui previsao acima de 15 minutos para a proxima parada." }
      : null,
  ].filter((alert): alert is { severity: string; title: string; text: string } => Boolean(alert));
  const todayNotices = data?.children.filter((child) => child.absenceStatus !== "going") ?? [];
  const recentCheckins = data?.checkins.slice(0, 12) ?? [];
  const logout = () => {
    void fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("rota-segura-session");
    setSession(null);
    setData(null);
    router.push("/");
  };

  const scrollToEditor = (id: string) => {
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const saveSettings = async (savingKey = "settings") => {
    setSaving(savingKey);
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: activeCompanyId, settings: settingsForm, theme: themeForm }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (response.ok) {
      await load();
      setMessage("Informacoes salvas.");
    } else {
      setMessage(payload?.error || "Nao foi possivel salvar as configuracoes.");
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

  const saveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("company-record");
    setMessage("");
    const response = await fetch("/api/admin/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: companyForm.id,
        name: companyForm.name,
        document: companyForm.document,
        password: companyForm.password,
        active: companyForm.active,
        settings: {
          brandName: companyForm.name,
          businessName: companyForm.name,
          document: companyForm.document,
          whatsapp: companyForm.whatsapp,
          phone: companyForm.phone,
        },
      }),
    });
    const result = (await response.json().catch(() => null)) as AdminPayload & { error?: string } | null;

    if (response.ok && result) {
      setData(result);
      const nextCompanyId = result.currentCompany?.id || result.companies[0]?.id || "";
      setSelectedCompanyId(nextCompanyId);
      setCompanyForm(emptyCompanyForm);
      await load(nextCompanyId);
      setMessage(companyForm.id ? "Empresa atualizada." : "Empresa criada. Login liberado pelo CNPJ e senha informados.");
    } else {
      setMessage(result?.error || "Nao foi possivel salvar a empresa.");
    }

    setSaving("");
  };

  const editCompany = (company: AdminPayload["companies"][number]) => {
    setCompanyForm({
      id: company.id,
      name: company.name,
      document: company.settings.document || company.document,
      password: "",
      active: company.active,
      whatsapp: company.settings.whatsapp || "",
      phone: company.settings.phone || "",
    });
    setActive("companies");
  };

  const switchCompany = async (companyId: string) => {
    setSelectedCompanyId(companyId);
    setSaving("company-switch");
    await load(companyId);
    setSaving("");
  };

  const saveContractTemplate = async () => {
    setSaving("contract-template");
    setMessage("");
    const response = await fetch("/api/admin/contracts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: activeCompanyId, template: contractTemplate }),
    });
    const result = (await response.json().catch(() => null)) as AdminPayload & { error?: string } | null;

    if (response.ok && result) {
      setData(result);
      setMessage("Modelo de contrato salvo.");
    } else {
      setMessage(result?.error || "Nao foi possivel salvar o contrato.");
    }

    setSaving("");
  };

  const createContractForChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("contract-create");
    setMessage("");
    const response = await fetch("/api/admin/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...contractForm, companyId: activeCompanyId }),
    });
    const result = (await response.json().catch(() => null)) as (AdminPayload & { contract?: AdminPayload["contracts"][number]; error?: string }) | null;

    if (response.ok && result) {
      setData(result);
      setContractForm({ parentId: "", childId: "", title: "" });
      const contractUrl = result.contract ? `${origin || ""}/contract/${result.contract.id}` : "";
      if (contractUrl) {
        await navigator.clipboard?.writeText(contractUrl).catch(() => {});
      }
      setMessage(contractUrl ? "Contrato gerado e link copiado." : "Contrato gerado.");
    } else {
      setMessage(result?.error || "Nao foi possivel gerar o contrato.");
    }

    setSaving("");
  };

  const saveDriver = async (e?: React.FormEvent, payload = driverForm) => {
    e?.preventDefault();
    setSaving("driver");
    setMessage("");
    const response = await fetch("/api/admin/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, companyId: activeCompanyId }),
    });
    const result = (await response.json().catch(() => null)) as (AdminPayload & { error?: string }) | null;

    if (response.ok && result) {
      setData(result);
      setDriverForm(emptyDriverForm);
      setMessage(payload.id ? "Motorista atualizado." : "Motorista cadastrado.");
    } else {
      setMessage(result?.error || "Nao foi possivel salvar o motorista.");
    }

    setSaving("");
  };

  const editDriver = (driver: AdminPayload["drivers"][number]) => {
    setDriverForm({
      id: driver.id,
      name: driver.name,
      contact: driver.contact,
      cpf: "",
      license: driver.license,
      vanId: driver.vanId,
      active: driver.active,
    });
    setActive("drivers");
    scrollToEditor("driver-editor");
  };

  const removeDriver = async (driver: AdminPayload["drivers"][number]) => {
    const confirmed = window.confirm(`Excluir o motorista "${driver.name}"? Os alunos vinculados ficarao sem motorista.`);
    if (!confirmed) return;

    setSaving(`driver-delete-${driver.id}`);
    setMessage("");
    const response = await fetch("/api/admin/drivers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: driver.id, companyId: activeCompanyId }),
    });
    const result = (await response.json().catch(() => null)) as (AdminPayload & { error?: string }) | null;

    if (response.ok && result) {
      setData(result);
      if (driverForm.id === driver.id) setDriverForm(emptyDriverForm);
      setMessage("Motorista excluido.");
    } else {
      setMessage(result?.error || "Nao foi possivel excluir o motorista.");
    }

    setSaving("");
  };

  const saveVan = async (e?: React.FormEvent, payload = vanForm) => {
    e?.preventDefault();
    setSaving("van");
    setMessage("");
    const response = await fetch("/api/admin/vans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, companyId: activeCompanyId, seats: Number(payload.seats || 15) }),
    });
    const result = (await response.json().catch(() => null)) as (AdminPayload & { error?: string }) | null;

    if (response.ok && result) {
      setData(result);
      setVanForm(emptyVanForm);
      setMessage(payload.id ? "Van atualizada." : "Van cadastrada.");
    } else {
      setMessage(result?.error || "Nao foi possivel salvar a van.");
    }

    setSaving("");
  };

  const editVan = (van: AdminPayload["vans"][number]) => {
    setVanForm({
      id: van.id,
      label: van.label,
      plate: van.plate,
      model: van.model,
      seats: String(van.seats),
      color: van.color,
      driverId: van.driverId,
      active: van.active,
      notes: van.notes,
    });
    setActive("vans");
    scrollToEditor("van-editor");
  };

  const removeVan = async (van: AdminPayload["vans"][number]) => {
    const confirmed = window.confirm(`Excluir a van "${van.label}"? Os alunos vinculados ficarao sem van.`);
    if (!confirmed) return;

    setSaving(`van-delete-${van.id}`);
    setMessage("");
    const response = await fetch("/api/admin/vans", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: van.id, companyId: activeCompanyId }),
    });
    const result = (await response.json().catch(() => null)) as (AdminPayload & { error?: string }) | null;

    if (response.ok && result) {
      setData(result);
      if (vanForm.id === van.id) setVanForm(emptyVanForm);
      setMessage("Van excluida.");
    } else {
      setMessage(result?.error || "Nao foi possivel excluir a van.");
    }

    setSaving("");
  };

  const assignChildTransport = async (
    child: AdminPayload["children"][number],
    changes: { vanId?: string; driverId?: string; shift?: Shift | "" }
  ) => {
    setSaving(`child-assign-${child.id}`);
    setMessage("");
    const response = await fetch("/api/admin/children/assignment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId: child.id,
        companyId: activeCompanyId,
        vanId: changes.vanId ?? child.vanId ?? "",
        driverId: changes.driverId ?? child.driverId ?? "",
        shift: changes.shift ?? child.shift ?? "",
      }),
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (response.ok) {
      await load();
      setMessage("Rota do aluno atualizada.");
    } else {
      setMessage(result?.error || "Nao foi possivel atualizar a rota do aluno.");
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

  const saveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("parent");
    setMessage("");
    const response = await fetch("/api/admin/parents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parentForm, companyId: activeCompanyId }),
    });
    const result = (await response.json().catch(() => null)) as (AdminPayload & { error?: string }) | null;
    if (response.ok && result) {
      setData(result);
      setParentForm(emptyParentForm);
      setMessage(parentForm.id ? "Responsavel atualizado." : "Responsavel cadastrado. O CPF informado ja vira a senha dele.");
    } else {
      setMessage(result?.error || "Nao foi possivel salvar o responsavel.");
    }
    setSaving("");
  };

  const editParent = (parent: AdminPayload["parents"][number]) => {
    setParentForm({
      id: parent.id,
      name: parent.name,
      contact: parent.contact,
      email: parent.email || "",
      cpf: "",
      active: parent.active,
    });
    setActive("parents");
    scrollToEditor("parent-editor");
  };

  const removeParent = async (parent: AdminPayload["parents"][number]) => {
    const confirmed = window.confirm(
      `Excluir o responsavel "${parent.name}" e todos os alunos, pagamentos, contratos e check-ins vinculados?`
    );
    if (!confirmed) return;

    setSaving(`parent-delete-${parent.id}`);
    setMessage("");
    const response = await fetch("/api/admin/parents", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: parent.id, companyId: activeCompanyId }),
    });
    const result = (await response.json().catch(() => null)) as (AdminPayload & { error?: string }) | null;

    if (response.ok && result) {
      setData(result);
      if (parentForm.id === parent.id) setParentForm(emptyParentForm);
      if (childForm.parentId === parent.id) setChildForm(emptyChildForm);
      setMessage("Responsavel e dados vinculados excluidos.");
    } else {
      setMessage(result?.error || "Nao foi possivel excluir o responsavel.");
    }

    setSaving("");
  };

  const saveChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving("child");
    setMessage("");
    const response = await fetch("/api/admin/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: childForm.id,
        companyId: activeCompanyId,
        parentId: childForm.parentId,
        name: childForm.name,
        cpf: childForm.cpf,
        birthDate: childForm.birthDate,
        schoolId: childForm.schoolId,
        grade: childForm.grade,
        responsiblePhone: childForm.responsiblePhone,
        notes: childForm.notes,
        driverId: childForm.driverId,
        vanId: childForm.vanId,
        shift: childForm.shift,
        active: childForm.active,
        address: {
          cep: childForm.cep,
          street: childForm.street,
          number: childForm.number,
          complement: childForm.complement,
          neighborhood: childForm.neighborhood,
          city: childForm.city,
          state: childForm.state,
        },
      }),
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (response.ok) {
      await load();
      setChildForm(emptyChildForm);
      setMessage(childForm.id ? "Aluno atualizado." : "Aluno cadastrado com acesso liberado.");
    } else {
      setMessage(result?.error || "Nao foi possivel salvar o aluno.");
    }

    setSaving("");
  };

  const editChild = (child: AdminPayload["children"][number]) => {
    setChildForm({
      id: child.id,
      parentId: child.parentId,
      name: child.name,
      cpf: "",
      birthDate: child.birthDate,
      schoolId: child.schoolId,
      grade: child.grade,
      responsiblePhone: child.responsiblePhone,
      cep: child.address.cep,
      street: child.address.street,
      number: child.address.number,
      complement: child.address.complement,
      neighborhood: child.address.neighborhood,
      city: child.address.city || "Toledo",
      state: child.address.state || "PR",
      notes: child.notes,
      driverId: child.driverId || "",
      vanId: child.vanId || "",
      shift: child.shift || "",
      active: child.active,
    });
    setActive("parents");
  };

  const removeChild = async (child: AdminPayload["children"][number]) => {
    const confirmed = window.confirm(
      `Excluir o aluno "${child.name}" e seus pagamentos, contratos e check-ins?`
    );
    if (!confirmed) return;

    setSaving(`child-delete-${child.id}`);
    setMessage("");
    const response = await fetch("/api/admin/children", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: child.id, companyId: activeCompanyId }),
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (response.ok) {
      await load();
      if (childForm.id === child.id) setChildForm(emptyChildForm);
      setMessage("Aluno e dados vinculados excluidos.");
    } else {
      setMessage(result?.error || "Nao foi possivel excluir o aluno.");
    }

    setSaving("");
  };

  type OperationEntity = "driverDocument" | "driverOccurrence" | "maintenance" | "fuel" | "expense";

  const saveOperation = async (
    entity: OperationEntity,
    record: Record<string, unknown>,
    reset: () => void,
    label: string
  ) => {
    setSaving(`operation-${entity}`);
    setMessage("");
    const response = await fetch("/api/admin/operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity, companyId: activeCompanyId, record }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (response.ok) {
      await load();
      reset();
      setMessage(`${label} salvo.`);
    } else {
      setMessage(payload?.error || `Nao foi possivel salvar ${label.toLowerCase()}.`);
    }
    setSaving("");
  };

  const removeOperation = async (entity: OperationEntity, id: string, label: string) => {
    if (!window.confirm(`Excluir ${label.toLowerCase()}?`)) return;
    setSaving(`operation-delete-${id}`);
    setMessage("");
    const response = await fetch("/api/admin/operations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity, id, companyId: activeCompanyId }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (response.ok) {
      await load();
      setMessage(`${label} excluido.`);
    } else {
      setMessage(payload?.error || `Nao foi possivel excluir ${label.toLowerCase()}.`);
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
        companyId: activeCompanyId,
        amount: Number(paymentForm.amount.replace(",", ".")),
      }),
    });
    const result = (await response.json().catch(() => null)) as (AdminPayload & { error?: string }) | null;
    if (response.ok && result) {
      setData(result);
      setPaymentForm({ id: "", parentId: "", childId: "", month: "", dueDate: "", amount: String(settingsForm.monthlyFeeDefault || 220), chargeEnabled: true, paymentMethod: "pix", externalReference: "" });
      setMessage(paymentForm.id ? "Mensalidade atualizada." : "Mensalidade criada.");
    } else {
      setMessage(result?.error || "Nao foi possivel salvar a mensalidade.");
    }
    setSaving("");
  };

  const updatePaymentStatus = async (paymentId: string, status: PaymentStatus) => {
    setSaving(paymentId);
    setMessage("");
    const response = await fetch(`/api/admin/payments/${paymentId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, companyId: activeCompanyId }),
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

  const editPayment = (payment: AdminPayload["payments"][number]) => {
    setPaymentForm({
      id: payment.id,
      parentId: payment.parentId,
      childId: payment.childId,
      month: payment.month,
      dueDate: payment.dueDate,
      amount: String(payment.amount),
      chargeEnabled: payment.chargeEnabled,
      paymentMethod: payment.paymentMethod,
      externalReference: payment.externalReference,
    });
    setActive("payments");
    scrollToEditor("payment-editor");
  };

  const removePayment = async (payment: AdminPayload["payments"][number]) => {
    if (!window.confirm(`Excluir a mensalidade ${payment.month}?`)) return;
    setSaving(`payment-delete-${payment.id}`);
    const response = await fetch("/api/admin/payments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: payment.id, companyId: activeCompanyId }),
    });
    const payload = (await response.json().catch(() => null)) as (AdminPayload & { error?: string }) | null;
    if (response.ok && payload) {
      setData(payload);
      if (paymentForm.id === payment.id) setPaymentForm({ id: "", parentId: "", childId: "", month: "", dueDate: "", amount: String(settingsForm.monthlyFeeDefault || 220), chargeEnabled: true, paymentMethod: "pix", externalReference: "" });
      setMessage("Mensalidade excluida.");
    } else {
      setMessage(payload?.error || "Nao foi possivel excluir a mensalidade.");
    }
    setSaving("");
  };

  const togglePaymentCharge = async (payment: AdminPayload["payments"][number]) => {
    setSaving(`payment-charge-${payment.id}`);
    setMessage("");
    const response = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payment,
        companyId: activeCompanyId,
        chargeEnabled: !payment.chargeEnabled,
      }),
    });
    const payload = (await response.json().catch(() => null)) as (AdminPayload & { error?: string }) | null;
    if (response.ok && payload) {
      setData(payload);
      setMessage(payment.chargeEnabled ? "Cobranca desativada para este mes." : "Cobranca ativada para este mes.");
    } else {
      setMessage(payload?.error || "Nao foi possivel alterar a cobranca.");
    }
    setSaving("");
  };

  const generateNextPayments = async () => {
    setSaving("payment-generate");
    setMessage("");
    const response = await fetch("/api/admin/payments/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: activeCompanyId }),
    });
    const payload = (await response.json().catch(() => null)) as (AdminPayload & { generated?: number; month?: string; error?: string }) | null;
    if (response.ok && payload) {
      setData(payload);
      setMessage(
        payload.generated
          ? `${payload.generated} mensalidade(s) criada(s) para ${payload.month}.`
          : `As mensalidades de ${payload.month || "proximo mes"} ja estavam criadas.`
      );
    } else {
      setMessage(payload?.error || "Nao foi possivel gerar as mensalidades.");
    }
    setSaving("");
  };

  const resetOperationalData = async () => {
    setSaving("system-reset");
    setMessage("");
    const response = await fetch("/api/admin/system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reset",
        companyId: activeCompanyId,
        login: session?.contact,
        password: resetForm.password,
        confirmation: resetForm.confirmation,
      }),
    });
    const payload = (await response.json().catch(() => null)) as (AdminPayload & { error?: string }) | null;
    if (response.ok && payload) {
      setData(payload);
      setDriverForm(emptyDriverForm);
      setVanForm(emptyVanForm);
      setParentForm(emptyParentForm);
      setChildForm(emptyChildForm);
      setResetForm({ confirmation: "", password: "" });
      setMessage("Dados operacionais apagados. Um backup foi criado antes da limpeza.");
    } else {
      setMessage(payload?.error || "Nao foi possivel zerar os dados.");
    }
    setSaving("");
  };

  const createManualBackup = async () => {
    setSaving("system-backup");
    setMessage("");
    const response = await fetch("/api/admin/system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "backup",
        login: session?.contact,
        password: resetForm.password,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    if (response.ok) {
      setMessage("Backup completo criado no Supabase.");
    } else {
      setMessage(payload?.error || "Nao foi possivel criar o backup.");
    }
    setSaving("");
  };

  const stopLive = async (live = data?.liveTracking) => {
    setSaving(`live-${live?.driverId || "main"}`);
    await fetch("/api/driver/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        active: false,
        source: "manual",
        companyId: activeCompanyId,
        driverId: live?.driverId,
        vanId: live?.vanId,
      }),
    });
    await load();
    setMessage("Ao vivo encerrado.");
    setSaving("");
  };

  const regenerateQr = async (vanId?: string) => {
    setSaving(`qr-${vanId || "main"}`);
    setMessage("");
    const response = await fetch("/api/admin/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vanId, companyId: activeCompanyId }),
    });
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
  const parentContact = (id: string) => data?.parents.find((parent) => parent.id === id)?.contact || "";
  const driverName = (id?: string) => data?.drivers.find((driver) => driver.id === id)?.name || "Sem motorista";
  const vanName = (id?: string) => data?.vans.find((van) => van.id === id)?.label || "Sem van";
  const qrForVan = (vanId: string) => data?.vanQrCodes.find((qr) => qr.vanId === vanId) || data?.vanQrCode;
  const checkinUrlFor = (vanId: string) => {
    const token = qrForVan(vanId)?.token || "";
    return token ? `${origin || ""}/checkin?token=${token}` : "";
  };
  const contractUrlFor = (id: string) => `${origin || ""}/contract/${id}`;
  const qrImageFor = (vanId: string) => {
    const url = checkinUrlFor(vanId);
    return url ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(url)}` : "";
  };
  const paymentMessageHref = (payment: AdminPayload["payments"][number]) => {
    const contact = parentContact(payment.parentId);
    const phone = contact.startsWith("55") ? contact : `55${contact}`;
    const text = [
      `Ola, ${parentName(payment.parentId)}.`,
      `Consta uma mensalidade em aberto de ${childName(payment.childId)} referente a ${payment.month}.`,
      `Valor: ${formatCurrency(payment.amount)}. Vencimento: ${payment.dueDate}.`,
      "Por favor, envie o comprovante pela area do responsavel para liberar o recibo.",
    ].join(" ");

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

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
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col overflow-hidden border-r border-line bg-white p-5 dark:border-white/10 dark:bg-navy lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun text-navy">
            <Bus size={18} strokeWidth={2.5} />
          </span>
          <div>
            <div className="text-sm font-bold text-navy dark:text-white">Oziel Turismo</div>
            <div className="text-xs text-mute dark:text-white/45">Painel da empresa</div>
          </div>
        </Link>

        <nav className="mt-8 flex-1 space-y-1 overflow-y-auto pr-1">
          {visibleTabs.map((tab) => {
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
          className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-mute hover:bg-mist dark:text-white/60 dark:hover:bg-white/5"
        >
          <LogOut size={16} /> Sair
        </button>
      </aside>

      <main className="px-4 py-5 lg:ml-72 lg:px-10 lg:py-8">
        <div className="sticky top-2 z-30 mb-5 flex items-center gap-3 rounded-xl border border-line bg-white/95 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-navy/95 lg:hidden">
          <Link href="/" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sun text-navy" aria-label="Voltar ao site" title="Voltar ao site">
            <Bus size={18} />
          </Link>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Secao do painel</span>
            <select
              value={active}
              onChange={(event) => setActive(event.target.value as AdminTab)}
              className="h-10 w-full rounded-lg border border-line bg-mist px-3 text-sm font-semibold text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {visibleTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </label>
          <button onClick={logout} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-mute hover:bg-mist dark:text-white/60 dark:hover:bg-white/10" aria-label="Sair" title="Sair">
            <LogOut size={18} />
          </button>
        </div>

        <header className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sun-2">Empresa</p>
          <h1 className="mt-2 text-2xl font-semibold text-navy dark:text-white sm:text-3xl">
            Controle profissional do transporte escolar
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-mute dark:text-white/60">
            Cadastre escolas, bairros, motoristas, vans, pagamentos, Pix, cores e rastreamento ao vivo.
          </p>
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/45">
                Empresa ativa
              </div>
              <div className="mt-1 font-semibold text-navy dark:text-white">
                {data.currentCompany?.name || settingsForm.businessName || "Empresa"}
              </div>
            </div>
            {session.role === "admin" ? (
              <select
                value={activeCompanyId}
                onChange={(e) => switchCompany(e.target.value)}
                disabled={saving === "company-switch"}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm font-semibold text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white sm:w-auto"
              >
                {data.companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            ) : (
              <span className="w-fit rounded-full bg-sun px-3 py-1 text-xs font-bold text-navy">Painel da empresa</span>
            )}
          </div>
          {message && (
            <div className="mt-4 rounded-xl border border-sun/30 bg-sun/10 px-4 py-3 text-sm font-medium text-navy dark:text-sun">
              {message}
            </div>
          )}
          {!data.storage?.durable && (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
              Protecao dos cadastros pendente: conecte um armazenamento privado ao projeto na Vercel para evitar perda de dados apos reinicializacoes.
            </div>
          )}
          {data.storage?.durable && data.storage.healthy === false && (
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
              <strong>Supabase conectado, mas sem permissao para salvar.</strong>
              <span className="mt-1 block">{data.storage.message || "Revise a tabela e as permissoes do banco."}</span>
            </div>
          )}
        </header>

        <section className="mx-auto mt-8 max-w-6xl">
          {active === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <Metric icon={Banknote} label="Receita aprovada" value={formatCurrency(approvedAmount)} />
                <Metric icon={GraduationCap} label="Alunos ativos" value={activeChildren.length.toString()} />
                <Metric icon={Navigation} label="Vans em rota" value={onlineDrivers.toString()} />
                <Metric icon={AlertTriangle} label="Inadimplencia" value={overduePayments.length.toString()} />
                <Metric icon={Activity} label="Motoristas online" value={`${onlineDrivers}/${activeDrivers.length}`} />
                <Metric icon={Gauge} label="Resultado" value={formatCurrency(estimatedProfit)} />
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <Panel title="Desempenho financeiro" subtitle="Receita, despesas pagas e valores em aberto">
                  <div className="space-y-4">
                    <FinanceBar label="Receita" value={approvedAmount} maximum={Math.max(approvedAmount, paidExpenseAmount, openAmount, 1)} color="bg-ok" />
                    <FinanceBar label="Despesas" value={paidExpenseAmount} maximum={Math.max(approvedAmount, paidExpenseAmount, openAmount, 1)} color="bg-red-400" />
                    <FinanceBar label="A receber" value={openAmount} maximum={Math.max(approvedAmount, paidExpenseAmount, openAmount, 1)} color="bg-sun" />
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <ProfileLine label="Escolas" value={servedSchools.length.toString()} />
                    <ProfileLine label="Bairros" value={servedNeighborhoods.length.toString()} />
                    <ProfileLine label="Vans" value={activeVans.length.toString()} />
                    <ProfileLine label="Pendencias" value={pendingExpenses.length.toString()} />
                  </div>
                </Panel>

                <Panel title="Alertas inteligentes" subtitle="Analise automatica dos dados da empresa">
                  <div className="space-y-3">
                    {intelligentAlerts.length ? intelligentAlerts.map((alert) => (
                      <div key={alert.title} className="flex gap-3 rounded-xl border border-line p-4 dark:border-white/10">
                        <AlertTriangle className={alert.severity === "high" ? "text-red-400" : alert.severity === "medium" ? "text-sun" : "text-sky-400"} size={18} />
                        <div>
                          <div className="text-sm font-semibold text-navy dark:text-white">{alert.title}</div>
                          <div className="mt-1 text-xs leading-5 text-mute dark:text-white/55">{alert.text}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-xl bg-ok/10 p-4 text-sm font-semibold text-ok">Nenhum alerta critico encontrado.</div>
                    )}
                  </div>
                </Panel>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
                <Panel title="Fila de pagamentos" subtitle={`${pendingPayments} aguardando comprovante`}>
                  <PaymentList
                    payments={data.payments.slice(0, 6)}
                    parentName={parentName}
                    childName={childName}
                    saving={saving}
                    onStatus={updatePaymentStatus}
                    messageHref={paymentMessageHref}
                    onEdit={editPayment}
                    onDelete={removePayment}
                    onCharge={togglePaymentCharge}
                  />
                </Panel>

                <Panel title="Resumo financeiro" subtitle="Recebidos e pendencias da empresa">
                  <div className="rounded-2xl bg-mist p-5 text-sm dark:bg-white/5">
                    <div className="text-xs uppercase tracking-wide text-mute dark:text-white/45">Recebido aprovado</div>
                    <div className="mt-1 font-semibold text-navy dark:text-white">
                      {formatCurrency(approvedAmount)}
                    </div>
                    <div className="mt-4 text-xs uppercase tracking-wide text-mute dark:text-white/45">Em aberto</div>
                    <div className="mt-1 font-semibold text-navy dark:text-white">
                      {formatCurrency(openAmount)}
                    </div>
                    <div className="mt-4 text-xs uppercase tracking-wide text-mute dark:text-white/45">Comprovantes</div>
                    <div className="mt-1 font-semibold text-navy dark:text-white">
                      {receivedProofs} recebido(s)
                    </div>
                    <Button type="button" className="mt-5" onClick={() => setActive("payments")}>
                      Abrir cobranca
                    </Button>
                  </div>
                </Panel>
              </div>

              <Panel title="Vans em operacao" subtitle="Status rapido da equipe e da frota">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {data.vans.map((van) => {
                    const live = data.liveTrackings.find((item) => item.vanId === van.id);
                    return (
                      <div key={van.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-navy dark:text-white">{van.label}</div>
                            <div className="mt-1 text-sm text-mute dark:text-white/55">
                              {driverName(van.driverId)} - {van.plate || "sem placa"}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              live?.active ? "bg-ok/10 text-ok" : "bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/45"
                            )}
                          >
                            {live?.active ? "AO VIVO" : "Parada"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>
          )}

          {active === "companies" && session.role === "admin" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
              <Panel
                title={companyForm.id ? "Editar empresa" : "Criar empresa"}
                subtitle="O dono entra no /admin usando CNPJ e senha."
              >
                <form onSubmit={saveCompany} className="space-y-4">
                  <Field label="Nome da empresa" value={companyForm.name} onChange={(v) => setCompanyForm({ ...companyForm, name: v })} />
                  <Field label="CNPJ de login" value={companyForm.document} onChange={(v) => setCompanyForm({ ...companyForm, document: v })} />
                  <Field
                    label={companyForm.id ? "Nova senha" : "Senha inicial"}
                    type="password"
                    placeholder={companyForm.id ? "Deixe em branco para manter" : "Senha para a empresa"}
                    value={companyForm.password}
                    onChange={(v) => setCompanyForm({ ...companyForm, password: v })}
                  />
                  <Field label="WhatsApp da empresa" value={companyForm.whatsapp} onChange={(v) => setCompanyForm({ ...companyForm, whatsapp: v })} />
                  <Field label="Telefone" value={companyForm.phone} onChange={(v) => setCompanyForm({ ...companyForm, phone: v })} />
                  <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                    <input
                      type="checkbox"
                      checked={companyForm.active}
                      onChange={(e) => setCompanyForm({ ...companyForm, active: e.target.checked })}
                      className="h-4 w-4 accent-sun"
                    />
                    Empresa ativa
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving === "company-record"}>
                      <Building2 size={16} /> {companyForm.id ? "Salvar empresa" : "Criar empresa"}
                    </Button>
                    {companyForm.id && (
                      <Button type="button" variant="outlineDark" onClick={() => setCompanyForm(emptyCompanyForm)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </Panel>

              <Panel title="Empresas cadastradas" subtitle="Cada empresa tem frota, motoristas, alunos, pagamentos e contrato.">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {data.companies.map((company) => (
                    <div key={company.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-navy dark:text-white">{company.name}</div>
                          <div className="mt-1 text-sm text-mute dark:text-white/55">
                            Login: CNPJ final {company.documentLast4 || "nao informado"}
                          </div>
                          <div className="mt-1 text-xs text-mute dark:text-white/45">
                            WhatsApp {company.settings.whatsapp || "nao informado"}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            company.active ? "bg-ok/10 text-ok" : "bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/45"
                          )}
                        >
                          {company.active ? "Ativa" : "Pausada"}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button type="button" variant="outlineDark" size="sm" onClick={() => switchCompany(company.id)}>
                          Abrir painel
                        </Button>
                        <Button type="button" variant="outlineDark" size="sm" onClick={() => editCompany(company)}>
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
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
                  <Field label="API de rotas" value={settingsForm.routeApiProvider || ""} onChange={(v) => setSettingsForm({ ...settingsForm, routeApiProvider: v })} placeholder="local-ai, google, mapbox, ors" />
                  <Field
                    label="Chave da API de rotas"
                    type="password"
                    value={settingsForm.routeApiKey || ""}
                    onChange={(v) => setSettingsForm({ ...settingsForm, routeApiKey: v })}
                    placeholder={data.currentCompany?.settings.hasRouteApiKey ? "Chave cadastrada" : "Opcional"}
                  />
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
                <Button onClick={() => saveSettings()} className="mt-6" disabled={saving === "settings"}>
                  <Save size={16} /> Salvar empresa e Pix
                </Button>
              </Panel>

              {session.role === "admin" && (
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
              )}

              {session.role === "admin" && (
                <Panel title="Seguranca e limpeza" subtitle="Backup e limpeza dos dados operacionais desta empresa.">
                  <div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <DatabaseBackup size={20} className="mt-0.5 shrink-0 text-amber-300" />
                      <div>
                        <div className="font-semibold text-white">Backup diario automatico</div>
                        <p className="mt-1 text-sm text-white/60">Execucao diaria com copia segura no Supabase.</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                        data.storage.automaticBackups
                          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                          : "border-amber-400/25 bg-amber-400/10 text-amber-200",
                      )}
                    >
                      {data.storage.automaticBackups ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                      {data.storage.automaticBackups ? "Ativo" : "Configuracao pendente"}
                    </span>
                  </div>
                  <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-400/20 dark:bg-red-500/10">
                    <div className="flex items-start gap-3">
                      <ShieldAlert size={20} className="mt-0.5 shrink-0 text-red-600 dark:text-red-300" />
                      <div>
                        <div className="font-semibold text-red-800 dark:text-red-200">Zona de seguranca</div>
                        <p className="mt-1 text-sm leading-relaxed text-red-700 dark:text-red-200/75">
                          A limpeza apaga motoristas, vans, responsaveis, alunos, mensalidades, contratos, rotas e historicos. Empresa, cores, escolas e bairros permanecem.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <Field
                        label="Senha do administrador"
                        type="password"
                        value={resetForm.password}
                        onChange={(value) => setResetForm({ ...resetForm, password: value })}
                        placeholder="Obrigatoria para backup e limpeza"
                      />
                      <Field
                        label="Digite ZERAR para apagar"
                        value={resetForm.confirmation}
                        onChange={(value) => setResetForm({ ...resetForm, confirmation: value })}
                        placeholder="ZERAR"
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outlineDark"
                        onClick={createManualBackup}
                        disabled={!resetForm.password || saving === "system-backup"}
                      >
                        <DatabaseBackup size={16} /> Criar backup agora
                      </Button>
                      <Button
                        type="button"
                        variant="outlineDark"
                        className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-400/30 dark:text-red-200 dark:hover:bg-red-500/10"
                        onClick={resetOperationalData}
                        disabled={
                          !resetForm.password ||
                          resetForm.confirmation.trim().toUpperCase() !== "ZERAR" ||
                          saving === "system-reset"
                        }
                      >
                        <Trash2 size={16} /> Zerar dados operacionais
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-red-700/75 dark:text-red-200/60">
                      Antes da limpeza, o sistema cria automaticamente um backup completo no Supabase.
                    </p>
                  </div>
                </Panel>
              )}
            </div>
          )}

          {active === "drivers" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
              <Panel
                id="driver-editor"
                className="order-2 xl:order-1"
                title={driverForm.id ? "Editar motorista" : "Cadastrar motorista"}
                subtitle="O motorista acessa /driver com contato e CPF."
              >
                <form onSubmit={(e) => saveDriver(e)} className="space-y-4">
                  <Field label="Nome completo" value={driverForm.name} onChange={(v) => setDriverForm({ ...driverForm, name: v })} />
                  <Field label="Contato do motorista" value={driverForm.contact} onChange={(v) => setDriverForm({ ...driverForm, contact: v })} />
                  <Field
                    label={driverForm.id ? "Nova senha CPF" : "CPF senha"}
                    value={driverForm.cpf}
                    onChange={(v) => setDriverForm({ ...driverForm, cpf: v })}
                    placeholder={driverForm.id ? "Deixe em branco para manter" : "000.000.000-00"}
                  />
                  <Field label="CNH / observacao" value={driverForm.license} onChange={(v) => setDriverForm({ ...driverForm, license: v })} />
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Van vinculada</span>
                    <select
                      value={driverForm.vanId}
                      onChange={(e) => setDriverForm({ ...driverForm, vanId: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="">Sem van fixa</option>
                      {data.vans.map((van) => (
                        <option key={van.id} value={van.id}>{van.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                    <input
                      type="checkbox"
                      checked={driverForm.active}
                      onChange={(e) => setDriverForm({ ...driverForm, active: e.target.checked })}
                      className="h-4 w-4 accent-sun"
                    />
                    Motorista ativo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving === "driver"}>
                      <Save size={16} /> {driverForm.id ? "Salvar" : "Cadastrar"}
                    </Button>
                    {driverForm.id && (
                      <Button type="button" variant="outlineDark" onClick={() => setDriverForm(emptyDriverForm)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </Panel>

              <Panel className="order-1 xl:order-2" title="Motoristas cadastrados" subtitle="Equipe com acesso proprio para ver alunos e iniciar rota.">
                <div className="mb-4 flex justify-end">
                  <Button
                    type="button"
                    variant="outlineDark"
                    size="sm"
                    onClick={() => {
                      setDriverForm(emptyDriverForm);
                      scrollToEditor("driver-editor");
                    }}
                  >
                    <Plus size={14} /> Novo motorista
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {data.drivers.map((driver) => (
                    <div key={driver.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-navy dark:text-white">{driver.name}</div>
                          <div className="mt-1 text-sm text-mute dark:text-white/55">
                            {formatPhone(driver.contact)} - CPF final {driver.cpfLast4 || "nao informado"}
                          </div>
                          <div className="mt-1 text-sm text-mute dark:text-white/55">
                            {vanName(driver.vanId)} {driver.license ? `- ${driver.license}` : ""}
                          </div>
                        </div>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            driver.active ? "bg-ok/10 text-ok" : "bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/45"
                          )}
                        >
                          {driver.active ? "Ativo" : "Pausado"}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button type="button" size="sm" className="w-full" onClick={() => editDriver(driver)}>
                          <Pencil size={14} /> Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outlineDark"
                          size="sm"
                          className="w-full border-red-500/40 text-red-600 hover:bg-red-500/10 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-500/10"
                          onClick={() => removeDriver(driver)}
                          disabled={saving === `driver-delete-${driver.id}`}
                          aria-label={`Apagar cadastro de ${driver.name}`}
                        >
                          <Trash2 size={14} /> Apagar
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outlineDark"
                          size="sm"
                          onClick={() => saveDriver(undefined, { ...driver, cpf: "", active: !driver.active })}
                          disabled={saving === "driver"}
                        >
                          {driver.active ? "Pausar" : "Ativar"}
                        </Button>
                        <Link href="/driver" target="_blank" className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy transition hover:border-sun dark:border-white/10 dark:text-white">
                          <Navigation size={14} /> Tela motorista
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}

          {active === "vans" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
              <Panel
                id="van-editor"
                className="order-2 xl:order-1"
                title={vanForm.id ? "Editar van" : "Cadastrar van"}
                subtitle="Controle placa, motorista, lugares e QR individual da van."
              >
                <form onSubmit={(e) => saveVan(e)} className="space-y-4">
                  <Field label="Nome da van" value={vanForm.label} onChange={(v) => setVanForm({ ...vanForm, label: v })} placeholder="Van 01 - Manha" />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Placa" value={vanForm.plate} onChange={(v) => setVanForm({ ...vanForm, plate: v })} />
                    <Field label="Lugares" type="number" value={vanForm.seats} onChange={(v) => setVanForm({ ...vanForm, seats: v })} />
                  </div>
                  <Field label="Modelo" value={vanForm.model} onChange={(v) => setVanForm({ ...vanForm, model: v })} />
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Motorista responsavel</span>
                    <select
                      value={vanForm.driverId}
                      onChange={(e) => setVanForm({ ...vanForm, driverId: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="">Sem motorista fixo</option>
                      {data.drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Cor da van no painel</span>
                    <input
                      type="color"
                      value={vanForm.color}
                      onChange={(e) => setVanForm({ ...vanForm, color: e.target.value })}
                      className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent"
                    />
                  </label>
                  <Field label="Observacoes" value={vanForm.notes} onChange={(v) => setVanForm({ ...vanForm, notes: v })} />
                  <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                    <input
                      type="checkbox"
                      checked={vanForm.active}
                      onChange={(e) => setVanForm({ ...vanForm, active: e.target.checked })}
                      className="h-4 w-4 accent-sun"
                    />
                    Van ativa
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving === "van"}>
                      <Save size={16} /> {vanForm.id ? "Salvar" : "Cadastrar"}
                    </Button>
                    {vanForm.id && (
                      <Button type="button" variant="outlineDark" onClick={() => setVanForm(emptyVanForm)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </form>
              </Panel>

              <Panel className="order-1 xl:order-2" title="Frota" subtitle="Cada van pode ter motorista, QR e alunos vinculados.">
                <div className="mb-4 flex justify-end">
                  <Button
                    type="button"
                    variant="outlineDark"
                    size="sm"
                    onClick={() => {
                      setVanForm(emptyVanForm);
                      scrollToEditor("van-editor");
                    }}
                  >
                    <Plus size={14} /> Nova van
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {data.vans.map((van) => {
                    const students = data.children.filter((child) => child.vanId === van.id);
                    const qrImage = qrImageFor(van.id);
                    const url = checkinUrlFor(van.id);

                    return (
                      <div key={van.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-navy dark:text-white">{van.label}</div>
                            <div className="mt-1 text-sm text-mute dark:text-white/55">
                              {van.model || "Modelo nao informado"} - {van.plate || "sem placa"}
                            </div>
                            <div className="mt-1 text-sm text-mute dark:text-white/55">
                              {driverName(van.driverId)} - {students.length}/{van.seats} aluno(s)
                            </div>
                          </div>
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-xs font-semibold",
                              van.active ? "bg-ok/10 text-ok" : "bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/45"
                            )}
                          >
                            {van.active ? "Ativa" : "Pausada"}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[150px_1fr]">
                          <div className="rounded-xl bg-mist p-3 text-center dark:bg-white/5">
                            {qrImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={qrImage} alt={`QR Code da ${van.label}`} className="mx-auto h-32 w-32 rounded-lg bg-white p-2" />
                            ) : (
                              <div className="flex h-32 items-center justify-center text-xs text-mute">Sem QR</div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="break-all rounded-xl bg-mist px-3 py-2 text-xs text-mute dark:bg-white/5 dark:text-white/55">
                              {url || "Link indisponivel"}
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <Button type="button" size="sm" className="w-full" onClick={() => editVan(van)}>
                                <Pencil size={14} /> Editar
                              </Button>
                              <Button
                                type="button"
                                variant="outlineDark"
                                size="sm"
                                className="w-full border-red-500/40 text-red-600 hover:bg-red-500/10 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-500/10"
                                onClick={() => removeVan(van)}
                                disabled={saving === `van-delete-${van.id}`}
                                aria-label={`Apagar cadastro de ${van.label}`}
                              >
                                <Trash2 size={14} /> Apagar
                              </Button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="outlineDark"
                                size="sm"
                                onClick={() => saveVan(undefined, { ...van, seats: String(van.seats), active: !van.active })}
                                disabled={saving === "van"}
                              >
                                {van.active ? "Pausar" : "Ativar"}
                              </Button>
                              <Button type="button" variant="outlineDark" size="sm" onClick={() => regenerateQr(van.id)} disabled={saving === `qr-${van.id}`}>
                                <QrCode size={14} /> Novo QR
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>
          )}

          {active === "operations" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Panel title="Documentos dos motoristas" subtitle="CNH, cursos, exames e vencimentos com alerta automatico.">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveOperation("driverDocument", driverDocumentForm, () => setDriverDocumentForm(emptyDriverDocumentForm), "Documento");
                    }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <SelectField
                      label="Motorista"
                      value={driverDocumentForm.driverId}
                      onChange={(value) => setDriverDocumentForm({ ...driverDocumentForm, driverId: value })}
                      options={[{ value: "", label: "Selecione" }, ...data.drivers.map((driver) => ({ value: driver.id, label: driver.name }))]}
                    />
                    <SelectField
                      label="Tipo"
                      value={driverDocumentForm.type}
                      onChange={(value) => setDriverDocumentForm({ ...driverDocumentForm, type: value as typeof driverDocumentForm.type })}
                      options={[
                        { value: "cnh", label: "CNH" },
                        { value: "curso", label: "Curso" },
                        { value: "exame", label: "Exame" },
                        { value: "outro", label: "Outro" },
                      ]}
                    />
                    <Field label="Nome do documento" value={driverDocumentForm.label} onChange={(value) => setDriverDocumentForm({ ...driverDocumentForm, label: value })} />
                    <Field label="Numero" value={driverDocumentForm.documentNumber} onChange={(value) => setDriverDocumentForm({ ...driverDocumentForm, documentNumber: value })} />
                    <Field label="Emissao" type="date" value={driverDocumentForm.issuedAt} onChange={(value) => setDriverDocumentForm({ ...driverDocumentForm, issuedAt: value })} />
                    <Field label="Vencimento" type="date" value={driverDocumentForm.expiresAt} onChange={(value) => setDriverDocumentForm({ ...driverDocumentForm, expiresAt: value })} />
                    <div className="sm:col-span-2">
                      <Field label="Observacoes" value={driverDocumentForm.notes} onChange={(value) => setDriverDocumentForm({ ...driverDocumentForm, notes: value })} />
                    </div>
                    <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                      <input type="checkbox" checked={driverDocumentForm.active} onChange={(event) => setDriverDocumentForm({ ...driverDocumentForm, active: event.target.checked })} className="h-4 w-4 accent-sun" />
                      Documento ativo
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="submit" disabled={saving === "operation-driverDocument"}><Save size={15} /> Salvar</Button>
                      {driverDocumentForm.id && <Button type="button" variant="outlineDark" onClick={() => setDriverDocumentForm(emptyDriverDocumentForm)}>Cancelar</Button>}
                    </div>
                  </form>
                  <div className="mt-6 space-y-3">
                    {data.driverDocuments.map((document) => (
                      <OperationRow
                        key={document.id}
                        title={`${document.label} - ${driverName(document.driverId)}`}
                        subtitle={`${document.documentNumber || "Sem numero"}${document.expiresAt ? ` - vence ${document.expiresAt}` : " - sem vencimento"}`}
                        status={!document.active ? "Inativo" : document.expiresAt && document.expiresAt < todayKey ? "Vencido" : document.expiresAt && document.expiresAt <= warningLimit ? "Vence em breve" : "Regular"}
                        tone={!document.active ? "muted" : document.expiresAt && document.expiresAt < todayKey ? "danger" : document.expiresAt && document.expiresAt <= warningLimit ? "warning" : "success"}
                        onEdit={() => setDriverDocumentForm({ ...document })}
                        onDelete={() => removeOperation("driverDocument", document.id, "Documento")}
                        deleting={saving === `operation-delete-${document.id}`}
                      />
                    ))}
                    {!data.driverDocuments.length && <EmptyState text="Nenhum documento cadastrado." />}
                  </div>
                </Panel>

                <Panel title="Ocorrencias" subtitle="Registre fatos da rota, alunos envolvidos e resolucao.">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveOperation("driverOccurrence", occurrenceForm, () => setOccurrenceForm(emptyOccurrenceForm), "Ocorrencia");
                    }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <SelectField label="Motorista" value={occurrenceForm.driverId} onChange={(value) => setOccurrenceForm({ ...occurrenceForm, driverId: value })} options={[{ value: "", label: "Selecione" }, ...data.drivers.map((driver) => ({ value: driver.id, label: driver.name }))]} />
                    <SelectField label="Aluno relacionado" value={occurrenceForm.childId} onChange={(value) => setOccurrenceForm({ ...occurrenceForm, childId: value })} options={[{ value: "", label: "Nenhum" }, ...data.children.map((child) => ({ value: child.id, label: child.name }))]} />
                    <Field label="Data e hora" type="datetime-local" value={occurrenceForm.occurredAt} onChange={(value) => setOccurrenceForm({ ...occurrenceForm, occurredAt: value })} />
                    <SelectField label="Gravidade" value={occurrenceForm.severity} onChange={(value) => setOccurrenceForm({ ...occurrenceForm, severity: value as typeof occurrenceForm.severity })} options={[{ value: "low", label: "Baixa" }, { value: "medium", label: "Media" }, { value: "high", label: "Alta" }]} />
                    <div className="sm:col-span-2"><Field label="Titulo" value={occurrenceForm.title} onChange={(value) => setOccurrenceForm({ ...occurrenceForm, title: value })} /></div>
                    <div className="sm:col-span-2"><Field label="Descricao" value={occurrenceForm.description} onChange={(value) => setOccurrenceForm({ ...occurrenceForm, description: value })} /></div>
                    <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                      <input type="checkbox" checked={occurrenceForm.resolved} onChange={(event) => setOccurrenceForm({ ...occurrenceForm, resolved: event.target.checked })} className="h-4 w-4 accent-sun" />
                      Resolvida
                    </label>
                    <Field label="Resolucao" value={occurrenceForm.resolution} onChange={(value) => setOccurrenceForm({ ...occurrenceForm, resolution: value })} />
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      <Button type="submit" disabled={saving === "operation-driverOccurrence"}><Save size={15} /> Salvar</Button>
                      {occurrenceForm.id && <Button type="button" variant="outlineDark" onClick={() => setOccurrenceForm(emptyOccurrenceForm)}>Cancelar</Button>}
                    </div>
                  </form>
                  <div className="mt-6 space-y-3">
                    {data.driverOccurrences.map((occurrence) => (
                      <OperationRow
                        key={occurrence.id}
                        title={`${occurrence.title} - ${driverName(occurrence.driverId)}`}
                        subtitle={`${occurrence.occurredAt || "Sem data"}${occurrence.childId ? ` - ${childName(occurrence.childId)}` : ""}`}
                        status={occurrence.resolved ? "Resolvida" : occurrence.severity === "high" ? "Alta" : occurrence.severity === "medium" ? "Media" : "Baixa"}
                        tone={occurrence.resolved ? "success" : occurrence.severity === "high" ? "danger" : occurrence.severity === "medium" ? "warning" : "muted"}
                        onEdit={() => setOccurrenceForm({ ...occurrence, childId: occurrence.childId || "" })}
                        onDelete={() => removeOperation("driverOccurrence", occurrence.id, "Ocorrencia")}
                        deleting={saving === `operation-delete-${occurrence.id}`}
                      />
                    ))}
                    {!data.driverOccurrences.length && <EmptyState text="Nenhuma ocorrencia registrada." />}
                  </div>
                </Panel>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Panel title="Manutencoes e documentos da frota" subtitle="Revisoes, pneus, IPVA e seguro com datas e custos.">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveOperation("maintenance", { ...maintenanceForm, odometer: Number(maintenanceForm.odometer), cost: Number(maintenanceForm.cost.replace(",", ".")) }, () => setMaintenanceForm(emptyMaintenanceForm), "Manutencao");
                    }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <SelectField label="Veiculo" value={maintenanceForm.vanId} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, vanId: value })} options={[{ value: "", label: "Selecione" }, ...data.vans.map((van) => ({ value: van.id, label: van.label }))]} />
                    <SelectField label="Tipo" value={maintenanceForm.type} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, type: value as typeof maintenanceForm.type })} options={[{ value: "revision", label: "Revisao" }, { value: "maintenance", label: "Manutencao" }, { value: "tires", label: "Pneus" }, { value: "ipva", label: "IPVA" }, { value: "insurance", label: "Seguro" }, { value: "other", label: "Outro" }]} />
                    <div className="sm:col-span-2"><Field label="Descricao" value={maintenanceForm.title} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, title: value })} /></div>
                    <Field label="Vencimento" type="date" value={maintenanceForm.dueDate} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, dueDate: value })} />
                    <SelectField label="Situacao" value={maintenanceForm.status} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, status: value as typeof maintenanceForm.status })} options={[{ value: "pending", label: "Pendente" }, { value: "completed", label: "Concluida" }]} />
                    <Field label="Quilometragem" type="number" value={maintenanceForm.odometer} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, odometer: value })} />
                    <Field label="Custo" type="number" value={maintenanceForm.cost} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, cost: value })} />
                    <div className="sm:col-span-2"><Field label="Observacoes" value={maintenanceForm.notes} onChange={(value) => setMaintenanceForm({ ...maintenanceForm, notes: value })} /></div>
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      <Button type="submit" disabled={saving === "operation-maintenance"}><Wrench size={15} /> Salvar</Button>
                      {maintenanceForm.id && <Button type="button" variant="outlineDark" onClick={() => setMaintenanceForm(emptyMaintenanceForm)}>Cancelar</Button>}
                    </div>
                  </form>
                  <div className="mt-6 space-y-3">
                    {data.vehicleMaintenances.map((maintenance) => (
                      <OperationRow
                        key={maintenance.id}
                        title={`${maintenance.title} - ${vanName(maintenance.vanId)}`}
                        subtitle={`${maintenance.dueDate || "Sem vencimento"} - ${formatCurrency(maintenance.cost)}`}
                        status={maintenance.status === "completed" ? "Concluida" : maintenance.dueDate && maintenance.dueDate < todayKey ? "Atrasada" : "Pendente"}
                        tone={maintenance.status === "completed" ? "success" : maintenance.dueDate && maintenance.dueDate < todayKey ? "danger" : "warning"}
                        onEdit={() => setMaintenanceForm({ ...maintenance, odometer: String(maintenance.odometer || ""), cost: String(maintenance.cost || "") })}
                        onDelete={() => removeOperation("maintenance", maintenance.id, "Manutencao")}
                        deleting={saving === `operation-delete-${maintenance.id}`}
                      />
                    ))}
                    {!data.vehicleMaintenances.length && <EmptyState text="Nenhuma manutencao cadastrada." />}
                  </div>
                </Panel>

                <Panel title="Abastecimentos" subtitle="Custos, litros e quilometragem por veiculo.">
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveOperation("fuel", { ...fuelForm, liters: Number(fuelForm.liters.replace(",", ".")), amount: Number(fuelForm.amount.replace(",", ".")), odometer: Number(fuelForm.odometer) }, () => setFuelForm(emptyFuelForm), "Abastecimento");
                    }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                  >
                    <SelectField label="Veiculo" value={fuelForm.vanId} onChange={(value) => setFuelForm({ ...fuelForm, vanId: value })} options={[{ value: "", label: "Selecione" }, ...data.vans.map((van) => ({ value: van.id, label: van.label }))]} />
                    <Field label="Data" type="date" value={fuelForm.filledAt} onChange={(value) => setFuelForm({ ...fuelForm, filledAt: value })} />
                    <Field label="Litros" type="number" value={fuelForm.liters} onChange={(value) => setFuelForm({ ...fuelForm, liters: value })} />
                    <Field label="Valor" type="number" value={fuelForm.amount} onChange={(value) => setFuelForm({ ...fuelForm, amount: value })} />
                    <Field label="Quilometragem" type="number" value={fuelForm.odometer} onChange={(value) => setFuelForm({ ...fuelForm, odometer: value })} />
                    <Field label="Posto" value={fuelForm.station} onChange={(value) => setFuelForm({ ...fuelForm, station: value })} />
                    <div className="sm:col-span-2"><Field label="Observacoes" value={fuelForm.notes} onChange={(value) => setFuelForm({ ...fuelForm, notes: value })} /></div>
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      <Button type="submit" disabled={saving === "operation-fuel"}><Fuel size={15} /> Salvar</Button>
                      {fuelForm.id && <Button type="button" variant="outlineDark" onClick={() => setFuelForm(emptyFuelForm)}>Cancelar</Button>}
                    </div>
                  </form>
                  <div className="mt-6 space-y-3">
                    {data.fuelRecords.map((fuel) => (
                      <OperationRow
                        key={fuel.id}
                        title={`${vanName(fuel.vanId)} - ${formatCurrency(fuel.amount)}`}
                        subtitle={`${fuel.filledAt || "Sem data"} - ${fuel.liters.toLocaleString("pt-BR")} L - ${fuel.odometer ? `${fuel.odometer.toLocaleString("pt-BR")} km` : "km nao informado"}`}
                        status={fuel.liters > 0 ? `${formatCurrency(fuel.amount / fuel.liters)}/L` : "Registrado"}
                        tone="muted"
                        onEdit={() => setFuelForm({ ...fuel, liters: String(fuel.liters), amount: String(fuel.amount), odometer: String(fuel.odometer || "") })}
                        onDelete={() => removeOperation("fuel", fuel.id, "Abastecimento")}
                        deleting={saving === `operation-delete-${fuel.id}`}
                      />
                    ))}
                    {!data.fuelRecords.length && <EmptyState text="Nenhum abastecimento registrado." />}
                  </div>
                </Panel>
              </div>
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
                subtitle="Marque quais bairros a empresa atende."
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
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Cor de identificacao</span>
                    <input
                      type="color"
                      value={neighborhoodForm.color}
                      onChange={(e) => setNeighborhoodForm({ ...neighborhoodForm, color: e.target.value })}
                      className="mt-2 h-11 w-full rounded-xl border border-line bg-transparent"
                    />
                  </label>
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

              <Panel title="Bairros atendidos" subtitle="Lista simples para selecionar, atender, pausar ou excluir bairros.">
                <div className="rounded-2xl border border-line bg-mist p-4 dark:border-white/10 dark:bg-white/5">
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
                <div className="mt-6 flex flex-wrap gap-2">
                  {servedNeighborhoods.length === 0 && <EmptyState text="Nenhum bairro atendido ainda." />}
                  {servedNeighborhoods.map((neighborhood) => (
                    <span
                      key={neighborhood.id}
                      className="border-b-2 border-sun px-1 pb-1 text-sm font-semibold text-navy dark:text-white"
                    >
                      {neighborhood.name}
                    </span>
                  ))}
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
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[430px_1fr]">
              <div className="space-y-5">
                <Panel
                  id="parent-editor"
                  title={parentForm.id ? "Editar responsavel" : "Cadastrar responsavel"}
                  subtitle="O contato e o CPF liberam o acesso da familia."
                >
                  <form onSubmit={saveParent} className="space-y-4">
                    <Field label="Nome completo" value={parentForm.name} onChange={(v) => setParentForm({ ...parentForm, name: v })} />
                    <Field label="Numero de contato" value={parentForm.contact} onChange={(v) => setParentForm({ ...parentForm, contact: v })} placeholder="(45) 99999-9999" />
                    <Field label="Email" type="email" value={parentForm.email} onChange={(v) => setParentForm({ ...parentForm, email: v })} />
                    <Field
                      label={parentForm.id ? "Novo CPF senha" : "CPF senha"}
                      value={parentForm.cpf}
                      onChange={(v) => setParentForm({ ...parentForm, cpf: v })}
                      placeholder={parentForm.id ? "Deixe em branco para manter" : "000.000.000-00"}
                    />
                    <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                      <input
                        type="checkbox"
                        checked={parentForm.active}
                        onChange={(e) => setParentForm({ ...parentForm, active: e.target.checked })}
                        className="h-4 w-4 accent-sun"
                      />
                      Acesso ativo
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={saving === "parent"}>
                        <Save size={16} /> {parentForm.id ? "Salvar" : "Cadastrar"}
                      </Button>
                      {parentForm.id && (
                        <Button type="button" variant="outlineDark" onClick={() => setParentForm(emptyParentForm)}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </Panel>

                <Panel
                  title={childForm.id ? "Editar aluno" : "Cadastrar aluno"}
                  subtitle="O aluno entra com CPF e data de nascimento."
                >
                  <form onSubmit={saveChild} className="space-y-4">
                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Responsavel</span>
                      <select
                        required
                        value={childForm.parentId}
                        onChange={(e) => {
                          const parent = data.parents.find((item) => item.id === e.target.value);
                          setChildForm({ ...childForm, parentId: e.target.value, responsiblePhone: parent?.contact || childForm.responsiblePhone });
                        }}
                        className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="">Selecione o responsavel</option>
                        {data.parents.map((parent) => (
                          <option key={parent.id} value={parent.id}>{parent.name}</option>
                        ))}
                      </select>
                    </label>
                    <Field label="Nome do aluno" value={childForm.name} onChange={(v) => setChildForm({ ...childForm, name: v })} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        label={childForm.id ? "Novo CPF" : "CPF do aluno"}
                        value={childForm.cpf}
                        onChange={(v) => setChildForm({ ...childForm, cpf: v })}
                        placeholder={childForm.id ? "Deixe em branco para manter" : "000.000.000-00"}
                      />
                      <Field label="Nascimento" type="date" value={childForm.birthDate} onChange={(v) => setChildForm({ ...childForm, birthDate: v })} />
                    </div>
                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Escola</span>
                      <select
                        required
                        value={childForm.schoolId}
                        onChange={(e) => setChildForm({ ...childForm, schoolId: e.target.value })}
                        className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                      >
                        <option value="">Selecione a escola</option>
                        {data.schools.filter((item) => item.active).map((schoolItem) => (
                          <option key={schoolItem.id} value={schoolItem.id}>{schoolItem.name}</option>
                        ))}
                      </select>
                    </label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Turma / serie" value={childForm.grade} onChange={(v) => setChildForm({ ...childForm, grade: v })} />
                      <Field label="Telefone responsavel" value={childForm.responsiblePhone} onChange={(v) => setChildForm({ ...childForm, responsiblePhone: v })} />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-4">
                      <Field label="CEP" value={childForm.cep} onChange={(v) => setChildForm({ ...childForm, cep: v })} />
                      <Field label="Rua" value={childForm.street} onChange={(v) => setChildForm({ ...childForm, street: v })} />
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-4">
                      <Field label="Numero" value={childForm.number} onChange={(v) => setChildForm({ ...childForm, number: v })} />
                      <Field label="Complemento" value={childForm.complement} onChange={(v) => setChildForm({ ...childForm, complement: v })} />
                    </div>
                    <Field label="Bairro" value={childForm.neighborhood} onChange={(v) => setChildForm({ ...childForm, neighborhood: v })} />
                    <div className="grid grid-cols-[1fr_90px] gap-4">
                      <Field label="Cidade" value={childForm.city} onChange={(v) => setChildForm({ ...childForm, city: v })} />
                      <Field label="UF" value={childForm.state} onChange={(v) => setChildForm({ ...childForm, state: v })} />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <SelectField
                        label="Van"
                        value={childForm.vanId}
                        onChange={(value) => setChildForm({ ...childForm, vanId: value })}
                        options={[{ value: "", label: "Sem van" }, ...data.vans.map((van) => ({ value: van.id, label: van.label }))]}
                      />
                      <SelectField
                        label="Motorista"
                        value={childForm.driverId}
                        onChange={(value) => setChildForm({ ...childForm, driverId: value })}
                        options={[{ value: "", label: "Sem motorista" }, ...data.drivers.map((driver) => ({ value: driver.id, label: driver.name }))]}
                      />
                      <SelectField
                        label="Turno"
                        value={childForm.shift}
                        onChange={(value) => setChildForm({ ...childForm, shift: value as Shift | "" })}
                        options={[{ value: "", label: "Sem turno" }, ...shifts.map((shift) => ({ value: shift, label: shiftLabel(shift) }))]}
                      />
                    </div>
                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Observacoes</span>
                      <textarea
                        value={childForm.notes}
                        onChange={(e) => setChildForm({ ...childForm, notes: e.target.value })}
                        rows={3}
                        className="mt-2 w-full resize-y rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </label>
                    <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                      <input
                        type="checkbox"
                        checked={childForm.active}
                        onChange={(e) => setChildForm({ ...childForm, active: e.target.checked })}
                        className="h-4 w-4 accent-sun"
                      />
                      Aluno ativo
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" disabled={saving === "child"}>
                        <Save size={16} /> {childForm.id ? "Salvar" : "Cadastrar"}
                      </Button>
                      {childForm.id && (
                        <Button type="button" variant="outlineDark" onClick={() => setChildForm(emptyChildForm)}>
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </Panel>
              </div>

              <Panel title="Responsaveis e alunos" subtitle="Edite acessos, dados pessoais e vinculos de transporte.">
                <div className="space-y-3">
                  {data.parents.map((parent) => {
                    const children = data.children.filter((child) => child.parentId === parent.id);
                    return (
                      <div key={parent.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="font-semibold text-navy dark:text-white">{parent.name}</div>
                            <div className="mt-1 flex flex-wrap gap-3 text-sm text-mute dark:text-white/55">
                              <span>{formatPhone(parent.contact)}</span>
                              <span>CPF final {parent.cpfLast4}</span>
                              {parent.email && <span>{parent.email}</span>}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", parent.active ? "bg-ok/10 text-ok" : "bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/45")}>
                              {parent.active ? `${children.length} aluno(s)` : "Pausado"}
                            </span>
                            <button type="button" onClick={() => editParent(parent)} className="rounded-lg p-2 text-mute transition hover:bg-mist hover:text-navy dark:hover:bg-white/10 dark:hover:text-white" title="Editar responsavel" aria-label={`Editar ${parent.name}`}>
                              <Pencil size={16} />
                            </button>
                            <button type="button" onClick={() => removeParent(parent)} disabled={saving === `parent-delete-${parent.id}`} className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50" title="Excluir responsavel" aria-label={`Excluir ${parent.name}`}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        {children.length > 0 && (
                          <div className="mt-4 divide-y divide-line border-t border-line dark:divide-white/10 dark:border-white/10">
                            {children.map((child) => (
                              <div key={child.id} className="py-4 text-sm">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <div className="font-semibold text-navy dark:text-white">{child.name}</div>
                                      <AbsenceBadge status={child.absenceStatus} />
                                    </div>
                                    <div className="mt-1 text-mute dark:text-white/55">{schoolName(child.schoolId)}</div>
                                    <div className="mt-1 text-xs text-mute dark:text-white/45">
                                      CPF final {child.cpfLast4 || "nao informado"} - nascimento {child.birthDate || "nao informado"}
                                    </div>
                                    <div className="mt-1 text-xs text-mute dark:text-white/45">
                                      {child.address.street || "Endereco nao informado"}{child.address.number ? `, ${child.address.number}` : ""}{child.address.neighborhood ? ` - ${child.address.neighborhood}` : ""}
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <button type="button" onClick={() => editChild(child)} className="rounded-lg p-2 text-mute transition hover:bg-mist hover:text-navy dark:hover:bg-white/10 dark:hover:text-white" title="Editar aluno" aria-label={`Editar ${child.name}`}>
                                      <Pencil size={16} />
                                    </button>
                                    <button type="button" onClick={() => removeChild(child)} disabled={saving === `child-delete-${child.id}`} className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50" title="Excluir aluno" aria-label={`Excluir ${child.name}`}>
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    <select
                                      value={child.vanId || ""}
                                      onChange={(e) => assignChildTransport(child, { vanId: e.target.value })}
                                      disabled={saving === `child-assign-${child.id}`}
                                      className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                                      aria-label={`Van de ${child.name}`}
                                    >
                                      <option value="">Sem van</option>
                                      {data.vans.map((van) => (
                                        <option key={van.id} value={van.id}>{van.label}</option>
                                      ))}
                                    </select>
                                    <select
                                      value={child.driverId || ""}
                                      onChange={(e) => assignChildTransport(child, { driverId: e.target.value })}
                                      disabled={saving === `child-assign-${child.id}`}
                                      className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                                      aria-label={`Motorista de ${child.name}`}
                                    >
                                      <option value="">Sem motorista</option>
                                      {data.drivers.map((driver) => (
                                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                                      ))}
                                    </select>
                                    <select
                                      value={child.shift || ""}
                                      onChange={(e) => assignChildTransport(child, { shift: e.target.value as Shift | "" })}
                                      disabled={saving === `child-assign-${child.id}`}
                                      className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                                      aria-label={`Turno de ${child.name}`}
                                    >
                                      <option value="">Sem turno</option>
                                      {shifts.map((shift) => (
                                        <option key={shift} value={shift}>{shiftLabel(shift)}</option>
                                      ))}
                                    </select>
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
            <div className="space-y-5">
              <Panel title="Cobranca automatica" subtitle="O sistema prepara o proximo mes para cada aluno ativo, sem criar duplicidades.">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <Field
                    label="Valor mensal padrao"
                    type="number"
                    value={String(settingsForm.monthlyFeeDefault || 0)}
                    onChange={(value) => setSettingsForm({ ...settingsForm, monthlyFeeDefault: Number(value || 0) })}
                  />
                  <Field
                    label="Dia do vencimento"
                    type="number"
                    value={String(settingsForm.monthlyDueDay || 5)}
                    onChange={(value) => setSettingsForm({ ...settingsForm, monthlyDueDay: Math.min(28, Math.max(1, Number(value || 5))) })}
                  />
                  <Button type="button" onClick={() => saveSettings("billing-settings")} disabled={saving === "billing-settings"}>
                    <Save size={16} /> Salvar regras
                  </Button>
                </div>
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-line p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3 text-sm font-semibold text-navy dark:text-white">
                    <input
                      type="checkbox"
                      checked={settingsForm.automaticMonthlyBilling}
                      onChange={(event) => setSettingsForm({ ...settingsForm, automaticMonthlyBilling: event.target.checked })}
                      className="h-4 w-4 accent-sun"
                    />
                    Criar automaticamente as mensalidades do proximo mes
                  </label>
                  <Button type="button" variant="outlineDark" onClick={generateNextPayments} disabled={saving === "payment-generate"}>
                    <RefreshCw size={16} /> Gerar proximo mes agora
                  </Button>
                </div>
              </Panel>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
              <Panel id="payment-editor" title={paymentForm.id ? "Editar mensalidade" : "Criar mensalidade"} subtitle="O recibo so libera depois do comprovante anexado.">
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
                  <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold text-navy dark:border-white/10 dark:text-white">
                    <input
                      type="checkbox"
                      checked={paymentForm.chargeEnabled}
                      onChange={(event) => setPaymentForm({ ...paymentForm, chargeEnabled: event.target.checked })}
                      className="h-4 w-4 accent-sun"
                    />
                    Cobrar esta mensalidade
                  </label>
                  <SelectField label="Forma de pagamento" value={paymentForm.paymentMethod} onChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value as typeof paymentForm.paymentMethod })} options={[{ value: "pix", label: "Pix" }, { value: "boleto", label: "Boleto" }, { value: "card", label: "Cartao" }, { value: "cash", label: "Dinheiro" }]} />
                  <Field label="Referencia externa" value={paymentForm.externalReference} onChange={(value) => setPaymentForm({ ...paymentForm, externalReference: value })} placeholder="Codigo do boleto ou transacao" />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving === "payment"}>
                      <Banknote size={16} /> {paymentForm.id ? "Salvar mensalidade" : "Criar mensalidade"}
                    </Button>
                    {paymentForm.id && (
                      <Button type="button" variant="outlineDark" onClick={() => setPaymentForm({ id: "", parentId: "", childId: "", month: "", dueDate: "", amount: String(settingsForm.monthlyFeeDefault || 220), chargeEnabled: true, paymentMethod: "pix", externalReference: "" })}>Cancelar</Button>
                    )}
                  </div>
                </form>
              </Panel>

              <Panel title="Dashboard financeiro" subtitle="Acompanhe recebidos, pendencias e cobre pelo WhatsApp.">
                <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <ProfileLine label="Pago" value={formatCurrency(approvedAmount)} />
                  <ProfileLine label="Em aberto" value={formatCurrency(openAmount)} />
                  <ProfileLine label="Pendencias" value={`${openPayments.length} mensalidade(s)`} />
                </div>
                <PaymentList
                  payments={data.payments}
                  parentName={parentName}
                  childName={childName}
                  saving={saving}
                  onStatus={updatePaymentStatus}
                  messageHref={paymentMessageHref}
                  onEdit={editPayment}
                  onDelete={removePayment}
                  onCharge={togglePaymentCharge}
                />
              </Panel>
              </div>
            </div>
          )}

          {active === "payments" && (
            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[380px_1fr]">
              <Panel title={expenseForm.id ? "Editar despesa" : "Registrar despesa"} subtitle="Controle combustivel, manutencao, impostos, seguros e folha.">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveOperation("expense", { ...expenseForm, amount: Number(expenseForm.amount.replace(",", ".")) }, () => setExpenseForm(emptyExpenseForm), "Despesa");
                  }}
                  className="space-y-4"
                >
                  <SelectField label="Categoria" value={expenseForm.category} onChange={(value) => setExpenseForm({ ...expenseForm, category: value as typeof expenseForm.category })} options={[{ value: "fuel", label: "Combustivel" }, { value: "maintenance", label: "Manutencao" }, { value: "tax", label: "Impostos" }, { value: "insurance", label: "Seguro" }, { value: "payroll", label: "Folha" }, { value: "other", label: "Outros" }]} />
                  <Field label="Descricao" value={expenseForm.description} onChange={(value) => setExpenseForm({ ...expenseForm, description: value })} />
                  <Field label="Valor" type="number" value={expenseForm.amount} onChange={(value) => setExpenseForm({ ...expenseForm, amount: value })} />
                  <Field label="Vencimento" type="date" value={expenseForm.dueDate} onChange={(value) => setExpenseForm({ ...expenseForm, dueDate: value })} />
                  <SelectField label="Situacao" value={expenseForm.status} onChange={(value) => setExpenseForm({ ...expenseForm, status: value as typeof expenseForm.status })} options={[{ value: "pending", label: "Pendente" }, { value: "paid", label: "Paga" }]} />
                  <Field label="Observacoes" value={expenseForm.notes} onChange={(value) => setExpenseForm({ ...expenseForm, notes: value })} />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={saving === "operation-expense"}><Banknote size={15} /> Salvar</Button>
                    {expenseForm.id && <Button type="button" variant="outlineDark" onClick={() => setExpenseForm(emptyExpenseForm)}>Cancelar</Button>}
                  </div>
                </form>
              </Panel>

              <Panel title="Fluxo de caixa" subtitle="Resultado estimado com mensalidades aprovadas e despesas pagas.">
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <ProfileLine label="Receita" value={formatCurrency(approvedAmount)} />
                  <ProfileLine label="Despesas pagas" value={formatCurrency(paidExpenseAmount)} />
                  <ProfileLine label="Despesas pendentes" value={formatCurrency(pendingExpenseAmount)} />
                  <ProfileLine label="Resultado" value={formatCurrency(estimatedProfit)} />
                </div>
                <div className="space-y-3">
                  {data.expenses.map((expense) => (
                    <OperationRow
                      key={expense.id}
                      title={expense.description}
                      subtitle={`${expense.dueDate || "Sem vencimento"} - ${formatCurrency(expense.amount)}`}
                      status={expense.status === "paid" ? "Paga" : expense.dueDate && expense.dueDate < todayKey ? "Atrasada" : "Pendente"}
                      tone={expense.status === "paid" ? "success" : expense.dueDate && expense.dueDate < todayKey ? "danger" : "warning"}
                      onEdit={() => setExpenseForm({ ...expense, amount: String(expense.amount) })}
                      onDelete={() => removeOperation("expense", expense.id, "Despesa")}
                      deleting={saving === `operation-delete-${expense.id}`}
                    />
                  ))}
                  {!data.expenses.length && <EmptyState text="Nenhuma despesa registrada." />}
                </div>
              </Panel>
            </div>
          )}

          {active === "reports" && (
            <div className="space-y-5 print:bg-white print:text-black">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric icon={Banknote} label="Receita" value={formatCurrency(approvedAmount)} />
                <Metric icon={Wallet} label="Despesas" value={formatCurrency(paidExpenseAmount)} />
                <Metric icon={GraduationCap} label="Alunos ativos" value={activeChildren.length.toString()} />
                <Metric icon={CheckCircle2} label="Check-ins" value={data.checkins.length.toString()} />
              </div>

              <Panel title="Exportar relatorios" subtitle="Arquivos CSV abrem normalmente no Excel; a impressao pode ser salva em PDF.">
                <div className="flex flex-wrap gap-3 print:hidden">
                  {[
                    { type: "financial", label: "Financeiro" },
                    { type: "students", label: "Alunos" },
                    { type: "fleet", label: "Frota" },
                    { type: "attendance", label: "Presenca" },
                  ].map((report) => (
                    <a key={report.type} href={`/api/admin/reports?companyId=${encodeURIComponent(activeCompanyId)}&type=${report.type}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold text-navy transition hover:border-sun dark:border-white/10 dark:text-white">
                      <Download size={16} /> {report.label}
                    </a>
                  ))}
                  <Button type="button" onClick={() => window.print()}><ReceiptText size={16} /> Salvar em PDF</Button>
                </div>
              </Panel>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Panel title="Ranking de alunos" subtitle="Quantidade de registros de embarque e desembarque.">
                  <div className="space-y-3">
                    {[...data.children]
                      .map((child) => ({ child, count: data.checkins.filter((checkin) => checkin.childId === child.id).length }))
                      .sort((left, right) => right.count - left.count)
                      .slice(0, 10)
                      .map(({ child, count }, index) => (
                        <ProfileLine key={child.id} label={`${index + 1}. ${child.name}`} value={`${count} registro(s)`} />
                      ))}
                  </div>
                </Panel>
                <Panel title="Ranking de motoristas" subtitle="Alunos atualmente vinculados a cada motorista.">
                  <div className="space-y-3">
                    {[...data.drivers]
                      .map((driver) => ({ driver, count: data.children.filter((child) => child.driverId === driver.id).length }))
                      .sort((left, right) => right.count - left.count)
                      .map(({ driver, count }, index) => (
                        <ProfileLine key={driver.id} label={`${index + 1}. ${driver.name}`} value={`${count} aluno(s)`} />
                      ))}
                  </div>
                </Panel>
              </div>

              <Panel title="Historico de rotas" subtitle="Planos gerados e pontos de GPS preservados para consulta.">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <ProfileLine label="Rotas geradas" value={data.routePlans.length.toString()} />
                  <ProfileLine label="Pontos de GPS" value={data.trackingPoints.length.toString()} />
                  <ProfileLine label="Ocorrencias" value={data.driverOccurrences.length.toString()} />
                </div>
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
                    <Button type="button" variant="outlineDark" onClick={() => stopLive()} disabled={saving === `live-${data.liveTracking.driverId || "main"}`}>
                      Encerrar ao vivo
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl bg-mist p-5 text-sm text-mute dark:bg-white/5 dark:text-white/60">
                  <div className="font-semibold text-navy dark:text-white">Vans e sinais</div>
                  <p className="mt-2">
                    Cada motorista liga a propria rota no celular. Depois de 45 minutos sem sinal, os pais deixam de ver o ao vivo.
                  </p>
                  <div className="mt-4 space-y-3">
                    {data.vans.map((van) => {
                      const live = data.liveTrackings.find((item) => item.vanId === van.id);
                      return (
                        <div key={van.id} className="rounded-xl bg-white p-3 dark:bg-white/5">
                          <div className="font-semibold text-navy dark:text-white">{van.label}</div>
                          <div className="mt-1 text-xs text-mute dark:text-white/50">{driverName(van.driverId)}</div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className={cn("rounded-full px-2 py-1 text-[11px] font-semibold", live?.active ? "bg-ok/10 text-ok" : "bg-slate-200 text-slate-500 dark:bg-white/5 dark:text-white/45")}>
                              {live?.active ? "AO VIVO" : "Parada"}
                            </span>
                            {live?.active && (
                              <button
                                type="button"
                                onClick={() => stopLive(live)}
                                className="text-[11px] font-bold text-red-600 hover:underline dark:text-red-300"
                              >
                                Encerrar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {active === "checkin" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_1fr]">
              <Panel title="QR Code das vans" subtitle="Cada van tem seu proprio QR para check-in seguro.">
                <div className="space-y-4">
                  {data.vans.map((van) => {
                    const qrImage = qrImageFor(van.id);
                    const url = checkinUrlFor(van.id);

                    return (
                      <div key={van.id} className="rounded-2xl border border-line bg-white p-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
                        <div className="mb-3 text-sm font-semibold text-navy dark:text-white">{van.label}</div>
                        {qrImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={qrImage}
                            alt={`QR Code da ${van.label}`}
                            className="mx-auto h-52 w-52 rounded-xl bg-white p-3"
                          />
                        ) : (
                          <div className="flex h-52 items-center justify-center rounded-xl bg-mist text-sm text-mute dark:bg-white/5 dark:text-white/50">
                            Gerando QR
                          </div>
                        )}
                        <div className="mt-4 break-all rounded-xl bg-mist px-3 py-2 text-xs text-mute dark:bg-white/5 dark:text-white/55">
                          {url || "Link indisponivel"}
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          <Button type="button" onClick={() => regenerateQr(van.id)} disabled={saving === `qr-${van.id}`} size="sm">
                            <QrCode size={14} /> Novo QR
                          </Button>
                          {url && (
                            <Button
                              type="button"
                              variant="outlineDark"
                              size="sm"
                              onClick={() => navigator.clipboard?.writeText(url)}
                            >
                              Copiar link
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-mute dark:text-white/55">
                  Ao trocar o QR de uma van, o codigo antigo daquela van deixa de registrar check-ins.
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

          {active === "contracts" && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_1fr]">
              <Panel title="Modelo de contrato" subtitle="A empresa pode escrever o texto que sera usado nos links de assinatura.">
                <div className="rounded-2xl bg-mist p-4 text-sm text-mute dark:bg-white/5 dark:text-white/60">
                  Use os campos: {"{{empresa}}"}, {"{{responsavel}}"}, {"{{aluno}}"}, {"{{escola}}"} e {"{{assinatura}}"}.
                </div>
                <textarea
                  value={contractTemplate}
                  onChange={(e) => setContractTemplate(e.target.value)}
                  rows={14}
                  className="mt-4 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm leading-7 text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <Button onClick={saveContractTemplate} className="mt-4" disabled={saving === "contract-template"}>
                  <FileSignature size={16} /> Salvar modelo
                </Button>
              </Panel>

              <div className="space-y-5">
                <Panel title="Gerar contrato" subtitle="Crie um link para o responsavel assinar simbolicamente.">
                  <form onSubmit={createContractForChild} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <label>
                      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">Responsavel</span>
                      <select
                        value={contractForm.parentId}
                        onChange={(e) => setContractForm({ ...contractForm, parentId: e.target.value, childId: "" })}
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
                        value={contractForm.childId}
                        onChange={(e) => setContractForm({ ...contractForm, childId: e.target.value })}
                        className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
                        required
                      >
                        <option value="">Selecione</option>
                        {selectedContractChildren.map((child) => (
                          <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                      </select>
                    </label>
                    <div className="lg:col-span-2">
                      <Field
                        label="Titulo"
                        value={contractForm.title}
                        onChange={(v) => setContractForm({ ...contractForm, title: v })}
                        placeholder="Contrato de transporte escolar"
                      />
                    </div>
                    <Button type="submit" disabled={saving === "contract-create"}>
                      <FileSignature size={16} /> Gerar link
                    </Button>
                  </form>
                </Panel>

                <Panel title="Contratos gerados" subtitle={`${data.contracts.length} contrato(s) nesta empresa.`}>
                  <div className="space-y-3">
                    {data.contracts.length === 0 && <EmptyState text="Nenhum contrato gerado ainda." />}
                    {data.contracts.map((contract) => {
                      const url = contractUrlFor(contract.id);
                      return (
                        <div key={contract.id} className="rounded-2xl border border-line p-4 dark:border-white/10">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <div className="font-semibold text-navy dark:text-white">{contract.title}</div>
                              <div className="mt-1 text-sm text-mute dark:text-white/55">
                                {parentName(contract.parentId)} - {childName(contract.childId)}
                              </div>
                              <div className="mt-1 text-xs text-mute dark:text-white/45">
                                {contract.status === "signed" ? "Assinado" : "Aguardando assinatura"}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Link href={url} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-navy transition hover:border-sun dark:border-white/10 dark:text-white">
                                Abrir
                              </Link>
                              <Button type="button" variant="outlineDark" size="sm" onClick={() => navigator.clipboard?.writeText(url)}>
                                <Copy size={14} /> Copiar
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {active === "audit" && (
            <div className="space-y-5">
              <Panel title="Permissoes por perfil" subtitle="Cada acesso recebe somente as funcoes necessarias para sua rotina.">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <ProfileLine label="Administrador" value="Todas as empresas e configuracoes" />
                  <ProfileLine label="Empresa" value="Somente seus dados e equipe" />
                  <ProfileLine label="Motorista" value="Sua rota, alunos e ocorrencias" />
                  <ProfileLine label="Responsavel" value="Filhos, pagamentos e localizacao" />
                  <ProfileLine label="Aluno" value="Check-in e avisos pessoais" />
                </div>
              </Panel>

              <Panel title="Trilha de auditoria" subtitle="Historico automatico de criacoes, alteracoes e exclusoes.">
                <div className="space-y-3">
                  {data.auditLogs.slice(0, 150).map((log) => (
                    <div key={log.id} className="flex flex-col gap-3 rounded-2xl border border-line p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", log.action === "deleted" ? "bg-red-500/10 text-red-500" : log.action === "created" ? "bg-ok/10 text-ok" : "bg-sun/15 text-sun-2")}>
                          {log.action === "deleted" ? <Trash2 size={16} /> : log.action === "created" ? <CheckCircle2 size={16} /> : <Pencil size={16} />}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold capitalize text-navy dark:text-white">{log.summary}</div>
                          <div className="mt-1 truncate text-sm text-mute dark:text-white/55">{log.actorName} - {log.entityType}</div>
                        </div>
                      </div>
                      <div className="text-xs text-mute dark:text-white/45">
                        {new Date(log.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  ))}
                  {!data.auditLogs.length && <EmptyState text="A trilha comeca a ser preenchida na proxima alteracao." />}
                </div>
              </Panel>
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
              <Button onClick={() => saveSettings()} className="mt-6" disabled={saving === "settings"}>
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
  const [showPassword, setShowPassword] = useState(false);

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
          Acesso separado da area dos responsaveis. Admin entra com usuario; empresa entra com CNPJ e senha.
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-5">
          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-white/55">Usuario ou CNPJ</span>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus-within:border-sun/50">
              <IdCard size={16} className="text-white/40" />
              <input
                required
                value={form.contact}
                onChange={(e) => onChange({ ...form, contact: e.target.value })}
                placeholder="InpresS ou CNPJ"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
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
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => onChange({ ...form, password: e.target.value })}
                placeholder="Senha administrativa"
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
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
                <IdCard size={16} /> Entrar
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

function FinanceBar({
  label,
  value,
  maximum,
  color,
}: {
  label: string;
  value: number;
  maximum: number;
  color: string;
}) {
  const width = Math.max(3, Math.min(100, (value / maximum) * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-navy dark:text-white">{label}</span>
        <span className="tabular-nums text-mute dark:text-white/55">{formatCurrency(value)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-mist dark:bg-white/10">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function OperationRow({
  title,
  subtitle,
  status,
  tone,
  onEdit,
  onDelete,
  deleting,
}: {
  title: string;
  subtitle: string;
  status: string;
  tone: "success" | "warning" | "danger" | "muted";
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="truncate font-semibold text-navy dark:text-white">{title}</div>
        <div className="mt-1 text-sm text-mute dark:text-white/55">{subtitle}</div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={cn(
          "rounded-full px-3 py-1 text-xs font-semibold",
          tone === "success" && "bg-ok/10 text-ok",
          tone === "warning" && "bg-sun/15 text-sun-2",
          tone === "danger" && "bg-red-500/10 text-red-500",
          tone === "muted" && "bg-mist text-mute dark:bg-white/5 dark:text-white/55"
        )}>{status}</span>
        <button type="button" onClick={onEdit} className="rounded-lg p-2 text-mute transition hover:bg-mist hover:text-navy dark:hover:bg-white/10 dark:hover:text-white" title="Editar" aria-label={`Editar ${title}`}>
          <Pencil size={16} />
        </button>
        <button type="button" onClick={onDelete} disabled={deleting} className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50" title="Excluir" aria-label={`Excluir ${title}`}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

function Panel({
  id,
  className,
  title,
  subtitle,
  children,
}: {
  id?: string;
  className?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className={cn("scroll-mt-28 rounded-2xl border border-line bg-white p-5 dark:border-white/10 dark:bg-white/[0.04] sm:p-6", className)}>
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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-wide text-mute dark:text-white/50">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm text-navy outline-none focus:border-sun dark:border-white/10 dark:bg-white/5 dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

function PaymentList({
  payments,
  parentName,
  childName,
  saving,
  onStatus,
  messageHref,
  onEdit,
  onDelete,
  onCharge,
}: {
  payments: AdminPayload["payments"];
  parentName: (id: string) => string;
  childName: (id: string) => string;
  saving: string;
  onStatus: (paymentId: string, status: PaymentStatus) => void;
  messageHref: (payment: AdminPayload["payments"][number]) => string;
  onEdit: (payment: AdminPayload["payments"][number]) => void;
  onDelete: (payment: AdminPayload["payments"][number]) => void;
  onCharge: (payment: AdminPayload["payments"][number]) => void;
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
                {parentName(payment.parentId)} - {formatCurrency(payment.amount)} - vence {payment.dueDate} - {payment.paymentMethod === "pix" ? "Pix" : payment.paymentMethod === "boleto" ? "Boleto" : payment.paymentMethod === "card" ? "Cartao" : "Dinheiro"}
              </div>
            </div>
            <span
              className={cn(
                "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                !payment.chargeEnabled && "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-white/60",
                payment.chargeEnabled && payment.status === "approved" && "bg-ok/10 text-ok",
                payment.chargeEnabled && payment.status === "proof_received" && "bg-sun/15 text-sun-2",
                payment.chargeEnabled && payment.status === "pending_proof" && "bg-mist text-mute dark:bg-white/5 dark:text-white/55",
                payment.chargeEnabled && payment.status === "rejected" && "bg-red-500/10 text-red-600"
              )}
            >
              {payment.chargeEnabled && payment.status === "approved" && <CheckCircle2 size={13} />}
              {payment.chargeEnabled && payment.status === "rejected" && <XCircle size={13} />}
              {payment.chargeEnabled ? paymentStatusLabel(payment.status) : "Nao cobrar"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outlineDark" size="sm" onClick={() => onEdit(payment)}>
              <Pencil size={14} /> Editar
            </Button>
            <Button type="button" variant="outlineDark" size="sm" onClick={() => onDelete(payment)} disabled={saving === `payment-delete-${payment.id}`}>
              <Trash2 size={14} /> Excluir
            </Button>
            <Button
              type="button"
              variant="outlineDark"
              size="sm"
              onClick={() => onCharge(payment)}
              disabled={saving === `payment-charge-${payment.id}`}
            >
              {payment.chargeEnabled ? "Nao cobrar este mes" : "Ativar cobranca"}
            </Button>
            <Button
              type="button"
              variant="outlineDark"
              size="sm"
              disabled={saving === payment.id || !payment.proof || !payment.chargeEnabled}
              onClick={() => onStatus(payment.id, "approved")}
            >
              Aprovar
            </Button>
            <Button
              type="button"
              variant="outlineDark"
              size="sm"
              disabled={saving === payment.id || !payment.chargeEnabled}
              onClick={() => onStatus(payment.id, "rejected")}
            >
              Recusar
            </Button>
            {!payment.chargeEnabled ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-white/60">
                Cobranca desativada neste mes
              </span>
            ) : payment.proof ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-ok/10 px-3 py-2 text-xs font-semibold text-ok">
                <ReceiptText size={13} /> Recibo liberado
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-2 text-xs font-semibold text-mute dark:bg-white/5 dark:text-white/55">
                Sem comprovante, sem recibo
              </span>
            )}
            {payment.chargeEnabled && payment.status !== "approved" && (
              <a href={messageHref(payment)} target="_blank" rel="noreferrer">
                <Button type="button" variant="outlineDark" size="sm">
                  <MessageCircle size={14} /> Cobrar no WhatsApp
                </Button>
              </a>
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
          {checkin.type === "returning" ? "Check-out" : "Check-in"}
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
