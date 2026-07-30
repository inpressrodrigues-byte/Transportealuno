import "server-only";

import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type {
  AdminPayload,
  AdminUser,
  AppDatabase,
  CheckinRecord,
  CheckinType,
  ChildAbsenceStatus,
  ChildRecord,
  CompanySettings,
  LiveTrackingState,
  NeighborhoodRecord,
  ParentDashboardPayload,
  ParentRecord,
  PaymentRecord,
  ReceiptRecord,
  SchoolCategory,
  SchoolRecord,
  Shift,
  ThemeSettings,
  VanQrCodeRecord,
} from "@/lib/app-types";
import { makeId, normalizeContact, normalizeCpf, shifts, todayIso } from "@/lib/app-utils";

const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "rota-segura") : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app-db.json");
const LIVE_MAX_AGE_MINUTES = 45;
const DEFAULT_ADMIN_LOGIN = "InpresS";
const DEFAULT_ADMIN_PASSWORD = "GuGalex2011@.";

let memoryDb: AppDatabase | null = null;

export function hashSecret(value: string) {
  const normalized = normalizeCpf(value) || normalizeContact(value) || value.trim();
  return createHash("sha256").update(`rota-segura:${normalized}`).digest("hex");
}

function defaultTheme(): ThemeSettings {
  return {
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
}

function defaultSettings(): CompanySettings {
  return {
    brandName: "Oziel Turismo",
    businessName: "Oziel Turismo",
    document: "00.000.000/0001-00",
    driverName: "Oziel Galtaroza Rodrigues",
    phone: "45999340446",
    whatsapp: "45999340446",
    pixKey: "75919591900",
    pixHolder: "Oziel Galtaroza Rodrigues",
    pixBank: "Sicoob",
    receiptText:
      "Recibo gerado automaticamente apos o envio do comprovante. A confirmacao definitiva depende da conciliacao bancaria.",
  };
}

function defaultLiveTracking(): LiveTrackingState {
  return {
    active: false,
    driverName: "Oziel Galtaroza Rodrigues",
    startedAt: "",
    lastSeenAt: "",
    currentNeighborhood: "Centro",
    nextStop: "Primeiro embarque",
    estimatedMinutes: 0,
    source: "manual",
  };
}

function defaultVanQrCode(): VanQrCodeRecord {
  return {
    id: "van_qr_main",
    token: makeId("vanqr"),
    label: "Van principal",
    active: true,
    generatedAt: todayIso(),
  };
}

function school(
  id: string,
  name: string,
  category: SchoolCategory,
  neighborhood: string,
  served = false,
  servedShifts: Shift[] = []
): SchoolRecord {
  const now = todayIso();

  return {
    id,
    name,
    city: "Toledo, PR",
    category,
    address: "",
    neighborhood,
    shift: servedShifts.map((item) => shiftTitle(item)).join(", ") || "Nao atendida",
    served,
    servedShifts,
    active: true,
    createdAt: now,
  };
}

function seedSchools(): SchoolRecord[] {
  return [
    school("cmei_arlindo_campos", "CMEI Arlindo de Campos", "cmei", "Boa Esperanca"),
    school("cmei_cantinho_alegria", "CMEI Cantinho da Alegria", "cmei", "Jardim Maracana", true, ["manha", "tarde"]),
    school("cmei_crescer_aprender", "CMEI Crescer e Aprender", "cmei", "Jardim Bela Vista"),
    school("cmei_cantinho_feliz", "CMEI Cantinho Feliz", "cmei", "BNH Parana", true, ["manha", "tarde"]),
    school("cmei_dalva_weinert", "CMEI Dalva Weinert Nogueira", "cmei", "Jardim Gisela", true, ["manha"]),
    school("cmei_diva_fontana", "CMEI Diva Bordin Fontana", "cmei", "Jardim Panorama"),
    school("cmei_hilda_marchi", "CMEI Hilda Angela de Marchi", "cmei", "Jardim Bressan"),
    school("cmei_jenny_donaduzzi", "CMEI Jenny Donaduzzi", "cmei", "Tocantins"),
    school("cmei_karine", "CMEI Karine Maruan Krenczynski", "cmei", "Jardim Concordia"),
    school("cmei_katiuscia", "CMEI Katiuscia Gayardo", "cmei", "Jardim Europa"),
    school("cmei_nona_gema", "CMEI Nona Gema", "cmei", "Sao Francisco"),
    school("cmei_nono_giacomazzi", "CMEI Nono Giacomazzi", "cmei", "Vila Paulista"),
    school("cmei_bertilla", "CMEI Professora Bertila Stoffel Giacomini", "cmei", "Novo Sarandi"),
    school("cmei_pingo_gente", "CMEI Pingo de Gente", "cmei", "Jardim Modelo"),
    school("cmei_everaldo_carvalho", "CMEI Professor Everaldo Cesar Adorno de Carvalho", "cmei", "Loteamento Schneider"),
    school("cmei_ana_zorzo", "CMEI Professora Ana Maria Zorzo Luckmann", "cmei", "Vila Pioneiro"),
    school("cmei_angela_wessel", "CMEI Professora Angela Maria Neolete Wessel", "cmei", "Jardim Pancera"),
    school("cmei_cleusi_berger", "CMEI Professora Cleusi Aparecida Berger", "cmei", "Jardim Santa Maria"),
    school("cmei_constantina", "CMEI Professora Constantina Henkel", "cmei", "Jardim Fachini"),
    school("cmei_elizia", "CMEI Professora Elizia Ribeiro Carraro", "cmei", "Boa Esperanca"),
    school("cmei_fani_bilibio", "CMEI Professora Fani Matilde Bilibio", "cmei", "Vila Nova"),
    school("cmei_iraci_batista", "CMEI Professora Iraci de Souza Batista", "cmei", "Vila Pioneiro"),
    school("cmei_otilia_stedile", "CMEI Professora Otilia Stedile", "cmei", "Vila Pedrini II"),
    school("cmei_rosangela", "CMEI Professora Rosangela Andreoli dos Santos", "cmei", "Vila Paulista"),
    school("cmei_sueli_gruber", "CMEI Professora Sueli Doroti Varaschin Gruber", "cmei", "Jardim Panorama II"),
    school("cmei_rita_francescon", "CMEI Rita Luciane Francescon", "cmei", "Santa Clara IV"),
    school("cmei_rosane_fontes", "CMEI Rosane Peripoli Fontes", "cmei", "Jardim Orquideas"),
    school("cmei_vo_tharcila", "CMEI Vo Tharcila", "cmei", "Jardim Coopagro", true, ["manha", "tarde"]),

    school("mun_alberto_santos", "Escola Municipal Alberto Santos Dumont", "municipal", "Jardim Porto Alegre", true, ["manha", "tarde"]),
    school("mun_amelio_dal_bosco", "Escola Municipal Amelio Dal Bosco", "municipal", "Toledo"),
    school("mun_andre_zenere", "Escola Municipal Andre Zenere", "municipal", "Toledo"),
    school("mun_anita_garibaldi", "Escola Municipal Anita Garibaldi", "municipal", "Centro", true, ["manha", "tarde"]),
    school("mun_antonio_scain", "Escola Municipal Antonio Scain", "municipal", "Jardim Filadelfia", true, ["manha"]),
    school("mun_ari_gossler", "Escola Municipal Prof. Ari Arcassio Gossler", "municipal", "Toledo"),
    school("mun_arsenio_heiss", "Escola Municipal Arsenio Heiss", "municipal", "Toledo"),
    school("mun_carlos_joao_treis", "Escola Municipal Carlos Joao Treis", "municipal", "Centro"),
    school("mun_olivo_beal", "Escola Municipal Olivo Beal", "municipal", "Cesar Park"),
    school("mun_osvaldo_cruz", "Escola Municipal Osvaldo Cruz", "municipal", "Vila Nova"),
    school("mun_sao_francisco", "Escola Municipal Sao Francisco de Assis", "municipal", "Sao Francisco"),
    school("mun_tancredo_neves", "Escola Municipal Tancredo de Almeida Neves", "municipal", "Boa Esperanca"),
    school("mun_walmir_grande", "Escola Municipal Walmir Grande", "municipal", "Jardim Panorama II"),

    school("est_antonio_jose_reis", "Colegio Estadual Antonio Jose Reis", "estadual", "Toledo"),
    school("est_attilio_fontana", "Colegio Estadual Senador Attilio Fontana", "estadual", "Toledo"),
    school("est_augustinho_donin", "Colegio Estadual Augustinho Donin", "estadual", "Toledo"),
    school("est_ayrton_senna", "Colegio Estadual Ayrton Senna da Silva", "estadual", "Toledo"),
    school("est_boa_vista", "Escola Estadual do Campo Boa Vista", "estadual", "Boa Vista"),
    school("est_bom_principio", "Escola Estadual do Campo Bom Principio", "estadual", "Bom Principio"),
    school("est_castelo_branco", "Colegio Estadual Presidente Castelo Branco", "estadual", "Centro", true, ["manha", "tarde"]),
    school("est_ceebja_toledo", "CEEBJA de Toledo", "estadual", "Centro", true, ["noite"]),
    school("est_dario_vellozo", "Colegio Estadual Dario Vellozo", "estadual", "Vila Industrial", true, ["manha", "tarde"]),
    school("est_dez_maio", "Escola Estadual do Campo de Dez de Maio", "estadual", "Dez de Maio"),
    school("est_edwino_scherer", "Escola Estadual do Campo Edwino Scherer", "estadual", "Interior"),
    school("est_esperanca_covatti", "Colegio Estadual Esperanca Favaretto Covatti", "estadual", "Jardim Panorama"),
    school("est_francisco_galdino", "Colegio Estadual Vereador Francisco Galdino de Lima", "estadual", "Toledo"),
    school("est_jardim_europa", "Colegio Estadual Jardim Europa", "estadual", "Jardim Europa"),
    school("est_jardim_gisela", "Colegio Estadual Jardim Gisela", "estadual", "Jardim Gisela", true, ["manha"]),
    school("est_jardim_maracana", "Colegio Estadual Jardim Maracana", "estadual", "Jardim Maracana"),
    school("est_jardim_porto_alegre", "Colegio Estadual Jardim Porto Alegre", "estadual", "Jardim Porto Alegre", true, ["manha", "tarde"]),
    school("est_joao_arnaldo_ritt", "Colegio Estadual Joao Arnaldo Ritt", "estadual", "Vila Nova"),
    school("est_joao_candido", "Escola Estadual Doutor Joao Candido Ferreira", "estadual", "Toledo"),
    school("est_luiz_morais_rego", "Colegio Estadual Luiz Augusto Morais Rego", "estadual", "Toledo"),
    school("est_nova_concordia", "Escola Estadual do Campo de Nova Concordia", "estadual", "Nova Concordia"),
    school("est_novo_horizonte", "Colegio Estadual Novo Horizonte", "estadual", "Toledo"),
    school("est_novo_sarandi", "Colegio Estadual do Campo Novo Sarandi", "estadual", "Novo Sarandi"),
    school("est_novo_sobradinho", "Escola Estadual do Campo Novo Sobradinho", "estadual", "Novo Sobradinho"),
    school("est_ouro_preto", "Escola Estadual do Campo de Ouro Preto", "estadual", "Ouro Preto"),
    school("est_sao_luiz", "Escola Estadual do Campo Sao Luiz Doeste", "estadual", "Sao Luiz do Oeste"),
    school("est_agricola", "Colegio Agricola Estadual de Toledo", "estadual", "Toledo"),
    school("est_vila_ipiranga", "Escola Estadual do Campo de Vila Ipiranga", "estadual", "Vila Ipiranga"),

    school("part_adventista", "Colegio Adventista Toledo", "particular", "Toledo"),
    school("part_alfa_premium", "Colegio Alfa Premium", "particular", "Centro", true, ["manha", "tarde"]),
    school("part_bem_me_quer", "Escola Bem-Me-Quer", "particular", "Toledo"),
    school("part_betesda", "Escola Betesda", "particular", "Toledo"),
    school("part_harbor", "Harbor Bilingual School", "particular", "Toledo"),
    school("part_incomar", "Colegio Incomar", "particular", "Centro", true, ["manha", "tarde"]),
    school("part_la_salle", "Colegio La Salle Toledo", "particular", "Jardim La Salle", true, ["manha", "tarde"]),
    school("part_sesi", "Colegio Sesi Toledo", "particular", "Vila Industrial", true, ["manha"]),
    school("part_vila_militar", "Colegio Vila Militar de Toledo", "particular", "Toledo"),

    school("fac_utfpr", "UTFPR Campus Toledo", "faculdade", "Jardim La Salle", true, ["noite"]),
    school("fac_unioeste", "Unioeste Campus Toledo", "faculdade", "Jardim La Salle", true, ["noite"]),
    school("fac_biopark", "Biopark Educacao", "faculdade", "Biopark", false, []),
    school("fac_unipar", "Unipar Toledo", "faculdade", "Toledo", false, []),
    school("fac_pucpr", "PUCPR Campus Toledo", "faculdade", "Toledo", false, []),
  ];
}

function neighborhood(
  id: string,
  name: string,
  area: string,
  x: number,
  y: number,
  served = false,
  color = "#94a3b8"
): NeighborhoodRecord {
  return {
    id,
    name,
    area,
    served,
    color,
    position: { x, y },
    notes: served ? "Atendimento ativo" : "Ainda nao atendido",
    createdAt: todayIso(),
  };
}

function seedNeighborhoods(): NeighborhoodRecord[] {
  return [
    neighborhood("bairro_centro", "Centro", "Central", 50, 48, true, "#facc15"),
    neighborhood("bairro_lasalle", "Jardim La Salle", "Central", 43, 38, true, "#38bdf8"),
    neighborhood("bairro_vila_industrial", "Vila Industrial", "Central", 40, 58, true, "#4ade80"),
    neighborhood("bairro_porto_alegre", "Jardim Porto Alegre", "Leste", 69, 45, true, "#f472b6"),
    neighborhood("bairro_jardim_gisela", "Jardim Gisela", "Leste", 65, 58, true, "#fb923c"),
    neighborhood("bairro_coopagro", "Jardim Coopagro", "Oeste", 28, 47, true, "#2dd4bf"),
    neighborhood("bairro_panorama", "Jardim Panorama", "Sul", 50, 71, true, "#a78bfa"),
    neighborhood("bairro_vila_pioneiro", "Vila Pioneiro", "Central", 54, 60, true, "#22c55e"),
    neighborhood("bairro_jardim_maracana", "Jardim Maracana", "Norte", 55, 29, true, "#f59e0b"),
    neighborhood("bairro_jardim_europa", "Jardim Europa", "Norte", 61, 35),
    neighborhood("bairro_boa_esperanca", "Boa Esperanca", "Norte", 47, 27),
    neighborhood("bairro_sao_francisco", "Sao Francisco", "Oeste", 20, 34),
    neighborhood("bairro_vila_nova", "Vila Nova", "Interior", 17, 16),
    neighborhood("bairro_novo_sarandi", "Novo Sarandi", "Interior", 77, 18),
    neighborhood("bairro_vila_paulista", "Vila Paulista", "Sul", 39, 73),
    neighborhood("bairro_jardim_pancera", "Jardim Pancera", "Sul", 62, 73),
    neighborhood("bairro_jardim_bressan", "Jardim Bressan", "Sul", 68, 68),
    neighborhood("bairro_tocantins", "Tocantins", "Norte", 37, 24),
    neighborhood("bairro_santa_maria", "Jardim Santa Maria", "Leste", 76, 55),
    neighborhood("bairro_modelo", "Jardim Modelo", "Oeste", 25, 61),
    neighborhood("bairro_cesar_park", "Cesar Park", "Leste", 75, 39),
    neighborhood("bairro_pinheirinho", "Jardim Pinheirinho", "Sul", 47, 84),
    neighborhood("bairro_jardim_mata", "Jardim da Mata", "Norte", 68, 23),
    neighborhood("bairro_biopark", "Biopark", "Interior", 84, 74),
  ];
}

function createInitialDb(): AppDatabase {
  const now = todayIso();
  const parentId = "parent_demo";
  const childId = "child_sophia";

  return {
    settings: defaultSettings(),
    theme: defaultTheme(),
    schools: seedSchools(),
    removedSchoolIds: [],
    neighborhoods: seedNeighborhoods(),
    removedNeighborhoodIds: [],
    liveTracking: defaultLiveTracking(),
    vanQrCode: defaultVanQrCode(),
    admins: [
      {
        id: "admin_main",
        name: "Administrador",
        login: DEFAULT_ADMIN_LOGIN,
        contact: DEFAULT_ADMIN_LOGIN,
        passwordHash: hashSecret(DEFAULT_ADMIN_PASSWORD),
        createdAt: now,
      },
    ],
    parents: [
      {
        id: parentId,
        name: "Marcia Andrade",
        contact: "45988880001",
        email: "marcia@example.com",
        cpfHash: hashSecret("12345678910"),
        cpfLast4: "8910",
        active: true,
        createdAt: now,
      },
    ],
    children: [
      {
        id: childId,
        parentId,
        name: "Sophia Andrade",
        cpfHash: hashSecret("52919401012"),
        cpfLast4: "1012",
        birthDate: "2016-08-12",
        schoolId: "est_jardim_porto_alegre",
        grade: "4o ano",
        responsiblePhone: "45988880001",
        address: {
          cep: "85900-000",
          street: "Rua das Palmeiras",
          number: "240",
          complement: "",
          neighborhood: "Jardim Porto Alegre",
          city: "Toledo",
          state: "PR",
        },
        notes: "Ponto combinado na frente da residencia.",
        absenceStatus: "going",
        absenceDate: now.slice(0, 10),
        absenceUpdatedAt: now,
        active: true,
        createdAt: now,
      },
    ],
    checkins: [],
    payments: [
      {
        id: "pay_aug_2026",
        parentId,
        childId,
        month: "Agosto/2026",
        dueDate: "2026-08-05",
        amount: 220,
        status: "pending_proof",
        createdAt: now,
      },
      {
        id: "pay_jul_2026",
        parentId,
        childId,
        month: "Julho/2026",
        dueDate: "2026-07-05",
        amount: 220,
        status: "approved",
        receipt: {
          number: "RS-202607-0001",
          generatedAt: "2026-07-05T12:00:00.000Z",
          companyName: "Oziel Turismo",
          pixKey: "75919591900",
          payerName: "Marcia Andrade",
          childName: "Sophia Andrade",
          amount: 220,
          month: "Julho/2026",
          note: "Pagamento conciliado.",
        },
        createdAt: now,
      },
    ],
  };
}

function ensureDb() {
  if (memoryDb) return memoryDb;

  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(DB_PATH)) {
      const seed = createInitialDb();
      writeFileSync(DB_PATH, JSON.stringify(seed, null, 2), "utf8");
      memoryDb = seed;
      return seed;
    }

    const raw = readFileSync(DB_PATH, "utf8");
    memoryDb = normalizeDb(JSON.parse(raw) as Partial<AppDatabase>);
    return memoryDb;
  } catch {
    memoryDb = createInitialDb();
    return memoryDb;
  }
}

function normalizeDb(input: Partial<AppDatabase>): AppDatabase {
  const seed = createInitialDb();
  const removedSchoolIds = Array.isArray(input.removedSchoolIds) ? input.removedSchoolIds : [];
  const removedNeighborhoodIds = Array.isArray(input.removedNeighborhoodIds) ? input.removedNeighborhoodIds : [];
  const schools = input.schools?.length
    ? mergeById(input.schools.map(normalizeSchool), seed.schools)
    : seed.schools;
  const neighborhoods = input.neighborhoods?.length
    ? mergeById(input.neighborhoods.map(normalizeNeighborhood), seed.neighborhoods)
    : seed.neighborhoods;

  return {
    settings: { ...seed.settings, ...input.settings },
    theme: { ...seed.theme, ...input.theme },
    schools: schools.filter((schoolItem) => !removedSchoolIds.includes(schoolItem.id)),
    removedSchoolIds,
    neighborhoods: neighborhoods.filter((neighborhood) => !removedNeighborhoodIds.includes(neighborhood.id)),
    removedNeighborhoodIds,
    liveTracking: normalizeLive(input.liveTracking, input.settings?.driverName || seed.settings.driverName),
    vanQrCode: normalizeVanQrCode(input.vanQrCode),
    admins: input.admins?.length ? input.admins.map(normalizeAdmin) : seed.admins,
    parents: input.parents?.length ? input.parents : seed.parents,
    children: input.children?.length ? input.children.map(normalizeChild) : seed.children,
    checkins: input.checkins?.length ? input.checkins.map(normalizeCheckin) : seed.checkins,
    payments: input.payments?.length ? input.payments : seed.payments,
  };
}

function mergeById<T extends { id: string }>(current: T[], seeded: T[]) {
  const ids = new Set(current.map((item) => item.id));
  return [...current, ...seeded.filter((item) => !ids.has(item.id))];
}

function normalizeSchool(item: Partial<SchoolRecord>): SchoolRecord {
  const category = item.category || guessCategory(item.name || "");
  const servedShifts = normalizeShifts(item.servedShifts, item.shift);

  return {
    id: item.id || makeId("school"),
    name: String(item.name || "Escola sem nome").trim(),
    city: item.city || "Toledo, PR",
    category,
    address: item.address || "",
    neighborhood: item.neighborhood || "Toledo",
    shift: servedShifts.map((shift) => shiftTitle(shift)).join(", ") || item.shift || "Nao atendida",
    served: item.served ?? Boolean(item.active),
    servedShifts,
    active: item.active ?? true,
    createdAt: item.createdAt || todayIso(),
  };
}

function normalizeNeighborhood(item: Partial<NeighborhoodRecord>): NeighborhoodRecord {
  return {
    id: item.id || makeId("bairro"),
    name: item.name || "Bairro",
    area: item.area || "Toledo",
    served: item.served ?? false,
    color: item.color || "#94a3b8",
    position: {
      x: Number(item.position?.x ?? 50),
      y: Number(item.position?.y ?? 50),
    },
    notes: item.notes || "",
    createdAt: item.createdAt || todayIso(),
  };
}

function normalizeChild(item: Partial<ChildRecord>): ChildRecord {
  const now = todayIso();
  const status = normalizeAbsenceStatus(item.absenceStatus);

  return {
    id: item.id || makeId("child"),
    parentId: item.parentId || "",
    name: item.name || "Aluno",
    cpfHash: item.cpfHash || "",
    cpfLast4: item.cpfLast4 || "",
    birthDate: item.birthDate || "",
    schoolId: item.schoolId || "",
    grade: item.grade || "",
    responsiblePhone: item.responsiblePhone || "",
    address: {
      cep: item.address?.cep || "",
      street: item.address?.street || "",
      number: item.address?.number || "",
      complement: item.address?.complement || "",
      neighborhood: item.address?.neighborhood || "",
      city: item.address?.city || "",
      state: item.address?.state || "",
      latitude: item.address?.latitude,
      longitude: item.address?.longitude,
    },
    notes: item.notes || "",
    absenceStatus: status,
    absenceDate: item.absenceDate || now.slice(0, 10),
    absenceUpdatedAt: item.absenceUpdatedAt || now,
    active: item.active ?? true,
    createdAt: item.createdAt || now,
  };
}

function normalizeVanQrCode(item?: Partial<VanQrCodeRecord>): VanQrCodeRecord {
  const seed = defaultVanQrCode();

  return {
    id: item?.id || seed.id,
    token: item?.token || seed.token,
    label: item?.label || seed.label,
    active: item?.active ?? true,
    generatedAt: item?.generatedAt || seed.generatedAt,
  };
}

function normalizeCheckin(item: Partial<CheckinRecord>): CheckinRecord {
  return {
    id: item.id || makeId("checkin"),
    parentId: item.parentId || "",
    childId: item.childId || "",
    type: item.type === "returning" ? "returning" : "boarding",
    scannedAt: item.scannedAt || todayIso(),
    latitude: item.latitude,
    longitude: item.longitude,
    accuracy: item.accuracy,
    token: item.token || "",
  };
}

function normalizeAdmin(item: Partial<AdminUser>): AdminUser {
  const oldDefault =
    item.id === "admin_main" &&
    normalizeContact(item.contact || "") === "45999999999" &&
    item.passwordHash === hashSecret("00000000000");
  const login = oldDefault
    ? DEFAULT_ADMIN_LOGIN
    : String(item.login || item.contact || DEFAULT_ADMIN_LOGIN).trim();

  return {
    id: item.id || "admin_main",
    name: item.name || "Administrador",
    login,
    contact: login,
    passwordHash: oldDefault ? hashSecret(DEFAULT_ADMIN_PASSWORD) : item.passwordHash || hashSecret(DEFAULT_ADMIN_PASSWORD),
    createdAt: item.createdAt || todayIso(),
  };
}

function normalizeAbsenceStatus(status?: ChildAbsenceStatus): ChildAbsenceStatus {
  if (status === "not_going" || status === "not_returning") return status;
  return "going";
}

function normalizeLive(item: Partial<LiveTrackingState> | undefined, driverName: string): LiveTrackingState {
  const seed = defaultLiveTracking();

  return {
    ...seed,
    ...item,
    driverName: item?.driverName || driverName,
    currentNeighborhood: item?.currentNeighborhood || seed.currentNeighborhood,
    nextStop: item?.nextStop || seed.nextStop,
    estimatedMinutes: Number(item?.estimatedMinutes || 0),
    source: item?.source || "manual",
  };
}

function guessCategory(name: string): SchoolCategory {
  const normalized = name.toLowerCase();
  if (normalized.includes("cmei") || normalized.includes("c m e i")) return "cmei";
  if (normalized.includes("estadual") || normalized.includes("c e ")) return "estadual";
  if (normalized.includes("utfpr") || normalized.includes("unioeste") || normalized.includes("unipar")) return "faculdade";
  if (normalized.includes("municipal") || normalized.includes("e m")) return "municipal";
  return "particular";
}

function normalizeShifts(values?: Shift[], legacy?: string): Shift[] {
  if (Array.isArray(values)) {
    return values.filter((item): item is Shift => shifts.includes(item));
  }

  const source = String(legacy || "").toLowerCase();
  return shifts.filter((item) => source.includes(item) || source.includes(shiftTitle(item).toLowerCase()));
}

function shiftTitle(shift: Shift) {
  const labels: Record<Shift, string> = {
    manha: "Manha",
    tarde: "Tarde",
    noite: "Noite",
  };

  return labels[shift];
}

function visibleLive(live: LiveTrackingState): LiveTrackingState {
  if (!live.active || !live.lastSeenAt) return { ...live, active: false };

  const lastSeen = new Date(live.lastSeenAt).getTime();
  const ageMinutes = (Date.now() - lastSeen) / 60000;
  if (!Number.isFinite(ageMinutes) || ageMinutes > LIVE_MAX_AGE_MINUTES) {
    return { ...live, active: false };
  }

  return live;
}

export function readDb() {
  return ensureDb();
}

export function writeDb(db: AppDatabase) {
  memoryDb = db;

  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // Vercel serverless storage is not durable. Keep the in-memory fallback alive.
  }

  return db;
}

export function mutateDb(mutator: (db: AppDatabase) => void) {
  const db = structuredClone(readDb()) as AppDatabase;
  mutator(db);
  return writeDb(db);
}

export function getAdminPayload(): AdminPayload {
  const db = readDb();
  return {
    adminAccess: safeAdmin(db.admins[0]),
    settings: db.settings,
    theme: db.theme,
    schools: db.schools,
    neighborhoods: db.neighborhoods,
    liveTracking: db.liveTracking,
    vanQrCode: db.vanQrCode,
    parents: db.parents.map(safeParent),
    children: db.children,
    checkins: db.checkins,
    payments: db.payments,
  };
}

export function getPublicPayload() {
  const db = readDb();
  return {
    settings: db.settings,
    theme: db.theme,
    schools: db.schools.filter((schoolItem) => schoolItem.active),
    neighborhoods: db.neighborhoods,
  };
}

export function getParentDashboard(parentId: string): ParentDashboardPayload | null {
  const db = readDb();
  const parent = db.parents.find((item) => item.id === parentId && item.active);
  if (!parent) return null;

  return {
    settings: db.settings,
    theme: db.theme,
    schools: db.schools.filter((schoolItem) => schoolItem.active),
    neighborhoods: db.neighborhoods,
    liveTracking: visibleLive(db.liveTracking),
    parent: safeParent(parent),
    children: db.children.filter((child) => child.parentId === parent.id),
    checkins: db.checkins.filter((checkin) => checkin.parentId === parent.id),
    payments: db.payments.filter((payment) => payment.parentId === parent.id),
  };
}

export function getLiveTracking() {
  return visibleLive(readDb().liveTracking);
}

function safeParent(parent: ParentRecord) {
  return {
    id: parent.id,
    name: parent.name,
    contact: parent.contact,
    email: parent.email,
    cpfLast4: parent.cpfLast4,
    active: parent.active,
    createdAt: parent.createdAt,
  };
}

function safeAdmin(admin: AdminUser | undefined) {
  return {
    id: admin?.id || "admin_main",
    name: admin?.name || "Administrador",
    login: admin?.login || admin?.contact || DEFAULT_ADMIN_LOGIN,
  };
}

export function updateAdminAccess(input: {
  id?: string;
  name: string;
  login: string;
  password?: string;
}) {
  let error = "";
  const db = mutateDb((draft) => {
    const admin = draft.admins.find((item) => item.id === input.id) || draft.admins[0];

    if (!admin) {
      error = "Admin nao encontrado.";
      return;
    }

    const login = input.login.trim();
    const password = input.password?.trim() || "";

    if (login.length < 3) {
      error = "Informe um usuario com pelo menos 3 caracteres.";
      return;
    }

    if (password && password.length < 8) {
      error = "A nova senha precisa ter pelo menos 8 caracteres.";
      return;
    }

    admin.name = input.name.trim() || admin.name || "Administrador";
    admin.login = login;
    admin.contact = login;
    if (password) admin.passwordHash = hashSecret(password);
  });

  return { db, error, adminAccess: safeAdmin(db.admins[0]) };
}

export function createReceipt(
  payment: PaymentRecord,
  parent: ParentRecord,
  child: ChildRecord,
  settings: CompanySettings
): ReceiptRecord {
  const yearMonth = payment.dueDate.slice(0, 7).replace("-", "");
  return {
    number: `RS-${yearMonth}-${payment.id.slice(-5).toUpperCase()}`,
    generatedAt: todayIso(),
    companyName: settings.businessName,
    pixKey: settings.pixKey,
    payerName: parent.name,
    childName: child.name,
    amount: payment.amount,
    month: payment.month,
    note: settings.receiptText,
  };
}

export function upsertSchool(input: Partial<SchoolRecord> & { name: string }) {
  return mutateDb((db) => {
    const now = todayIso();
    const servedShifts = normalizeShifts(input.servedShifts, input.shift);

    if (input.id) {
      db.removedSchoolIds = (db.removedSchoolIds || []).filter((id) => id !== input.id);
      const foundSchool = db.schools.find((item) => item.id === input.id);
      if (foundSchool) {
        foundSchool.name = input.name.trim();
        foundSchool.city = input.city?.trim() || foundSchool.city;
        foundSchool.category = input.category || foundSchool.category;
        foundSchool.address = input.address?.trim() || foundSchool.address;
        foundSchool.neighborhood = input.neighborhood?.trim() || foundSchool.neighborhood;
        foundSchool.served = input.served ?? foundSchool.served;
        foundSchool.servedShifts = servedShifts;
        foundSchool.shift = servedShifts.map(shiftTitle).join(", ") || "Nao atendida";
        foundSchool.active = input.active ?? foundSchool.active;
      }
      return;
    }

    db.schools.push({
      id: makeId("school"),
      name: input.name.trim(),
      city: input.city?.trim() || "Toledo, PR",
      category: input.category || "particular",
      address: input.address?.trim() || "",
      neighborhood: input.neighborhood?.trim() || "Toledo",
      served: input.served ?? true,
      servedShifts,
      shift: servedShifts.map(shiftTitle).join(", ") || "Nao atendida",
      active: input.active ?? true,
      createdAt: now,
    });
  });
}

export function deleteSchool(id: string) {
  return mutateDb((db) => {
    db.removedSchoolIds = Array.from(new Set([...(db.removedSchoolIds || []), id]));
    db.schools = db.schools.filter((schoolItem) => schoolItem.id !== id);
  });
}

export function bulkUpdateSchools(ids: string[], action: "serve" | "pause" | "delete") {
  const cleanIds = Array.from(new Set(ids.map((id) => String(id || "").trim()).filter(Boolean)));

  return mutateDb((db) => {
    if (cleanIds.length === 0) return;

    if (action === "delete") {
      db.removedSchoolIds = Array.from(new Set([...(db.removedSchoolIds || []), ...cleanIds]));
      db.schools = db.schools.filter((schoolItem) => !cleanIds.includes(schoolItem.id));
      return;
    }

    const served = action === "serve";
    db.schools.forEach((schoolItem) => {
      if (!cleanIds.includes(schoolItem.id)) return;
      schoolItem.served = served;
      schoolItem.active = true;
      if (served && schoolItem.servedShifts.length === 0) {
        schoolItem.servedShifts = [...shifts];
      }
      schoolItem.shift = served
        ? schoolItem.servedShifts.map(shiftTitle).join(", ") || "Atendida"
        : "Nao atendida";
    });
  });
}

export function updateChildAbsence(parentId: string, childId: string, status: ChildAbsenceStatus) {
  let error = "";
  const db = mutateDb((draft) => {
    const child = draft.children.find(
      (item) => item.id === childId && item.parentId === parentId && item.active
    );

    if (!child) {
      error = "Aluno nao encontrado.";
      return;
    }

    child.absenceStatus = normalizeAbsenceStatus(status);
    child.absenceDate = todayIso().slice(0, 10);
    child.absenceUpdatedAt = todayIso();
  });

  return { db, error };
}

export function regenerateVanQrCode() {
  return mutateDb((db) => {
    db.vanQrCode = {
      ...defaultVanQrCode(),
      label: db.vanQrCode?.label || "Van principal",
      generatedAt: todayIso(),
    };
  });
}

export function createCheckin(input: {
  token: string;
  parentId: string;
  childId: string;
  type?: CheckinType;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}) {
  let error = "";
  let checkin: CheckinRecord | null = null;

  const db = mutateDb((draft) => {
    if (!draft.vanQrCode.active || draft.vanQrCode.token !== input.token) {
      error = "QR Code invalido ou expirado.";
      return;
    }

    const parent = draft.parents.find((item) => item.id === input.parentId && item.active);
    const child = draft.children.find(
      (item) => item.id === input.childId && item.parentId === input.parentId && item.active
    );

    if (!parent || !child) {
      error = "Responsavel ou aluno nao encontrado.";
      return;
    }

    checkin = {
      id: makeId("checkin"),
      parentId: parent.id,
      childId: child.id,
      type: input.type === "returning" ? "returning" : "boarding",
      scannedAt: todayIso(),
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy: input.accuracy,
      token: input.token,
    };

    draft.checkins = [checkin, ...draft.checkins].slice(0, 600);
  });

  return { db, checkin, error };
}

export function getDriverRoutePayload() {
  const db = readDb();

  return {
    settings: db.settings,
    liveTracking: visibleLive(db.liveTracking),
    schools: db.schools.filter((schoolItem) => schoolItem.active),
    parents: db.parents.map(safeParent),
    children: db.children.filter((child) => child.active),
    checkins: db.checkins.slice(0, 80),
    vanQrCode: db.vanQrCode,
  };
}

export function upsertNeighborhood(input: Partial<NeighborhoodRecord> & { name: string }) {
  return mutateDb((db) => {
    const now = todayIso();
    if (input.id) {
      db.removedNeighborhoodIds = (db.removedNeighborhoodIds || []).filter((id) => id !== input.id);
      const foundNeighborhood = db.neighborhoods.find((item) => item.id === input.id);
      if (foundNeighborhood) {
        foundNeighborhood.name = input.name.trim();
        foundNeighborhood.area = input.area?.trim() || foundNeighborhood.area;
        foundNeighborhood.served = input.served ?? foundNeighborhood.served;
        foundNeighborhood.color = input.color || foundNeighborhood.color;
        foundNeighborhood.notes = input.notes ?? foundNeighborhood.notes;
        foundNeighborhood.position = {
          x: Number(input.position?.x ?? foundNeighborhood.position.x),
          y: Number(input.position?.y ?? foundNeighborhood.position.y),
        };
      }
      return;
    }

    db.neighborhoods.push({
      id: makeId("bairro"),
      name: input.name.trim(),
      area: input.area?.trim() || "Toledo",
      served: input.served ?? true,
      color: input.color || "#facc15",
      notes: input.notes || "",
      position: {
        x: Number(input.position?.x ?? 50),
        y: Number(input.position?.y ?? 50),
      },
      createdAt: now,
    });
  });
}

export function bulkUpdateNeighborhoods(ids: string[], action: "serve" | "pause" | "delete") {
  const cleanIds = Array.from(new Set(ids.map((id) => String(id || "").trim()).filter(Boolean)));

  return mutateDb((db) => {
    if (cleanIds.length === 0) return;

    if (action === "delete") {
      db.removedNeighborhoodIds = Array.from(new Set([...(db.removedNeighborhoodIds || []), ...cleanIds]));
      db.neighborhoods = db.neighborhoods.filter((neighborhood) => !cleanIds.includes(neighborhood.id));
      return;
    }

    const served = action === "serve";
    db.neighborhoods.forEach((neighborhood) => {
      if (!cleanIds.includes(neighborhood.id)) return;
      neighborhood.served = served;
      neighborhood.notes = served ? "Atendimento ativo" : "Ainda nao atendido";
    });
  });
}

export function updateLiveTracking(input: Partial<LiveTrackingState>) {
  return mutateDb((db) => {
    const now = todayIso();
    db.liveTracking = {
      ...db.liveTracking,
      ...input,
      active: input.active ?? db.liveTracking.active,
      driverName: input.driverName || db.settings.driverName,
      startedAt: input.active && !db.liveTracking.active ? now : db.liveTracking.startedAt || now,
      lastSeenAt: input.active === false ? db.liveTracking.lastSeenAt : now,
      currentNeighborhood: input.currentNeighborhood || db.liveTracking.currentNeighborhood,
      nextStop: input.nextStop || db.liveTracking.nextStop,
      estimatedMinutes: Number(input.estimatedMinutes ?? db.liveTracking.estimatedMinutes ?? 0),
      source: input.source || db.liveTracking.source || "gps",
    };
  });
}
