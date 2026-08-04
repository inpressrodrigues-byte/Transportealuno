import "server-only";

import { get, put } from "@vercel/blob";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type {
  AdminPayload,
  AdminUser,
  AppDatabase,
  AuditLogRecord,
  CheckinRecord,
  CheckinType,
  ChildAbsenceStatus,
  ChildRecord,
  CompanyRecord,
  CompanySettings,
  ContractRecord,
  DriverRecord,
  DriverDocumentRecord,
  DriverOccurrenceRecord,
  ExpenseRecord,
  FuelRecord,
  LiveTrackingState,
  NeighborhoodRecord,
  NotificationRecord,
  ParentDashboardPayload,
  ParentRecord,
  PaymentRecord,
  ReceiptRecord,
  RoutePlanRecord,
  SafeChildRecord,
  SchoolCategory,
  SchoolRecord,
  Shift,
  StudentDashboardPayload,
  ThemeSettings,
  TrackingPointRecord,
  VanQrCodeRecord,
  VanRecord,
  VehicleMaintenanceRecord,
} from "@/lib/app-types";
import { makeId, normalizeContact, normalizeCpf, normalizeDigits, shifts, todayIso } from "@/lib/app-utils";

const DATA_DIR = process.env.VERCEL ? path.join("/tmp", "rota-segura") : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app-db.json");
const BLOB_DB_PATH = "rota-segura/app-db.json";
const LIVE_MAX_AGE_MINUTES = 45;
const DEFAULT_ADMIN_LOGIN = "InpresS";
const DEFAULT_ADMIN_PASSWORD = "GuGalex2011@.";
const DEFAULT_COMPANY_ID = "company_oziel";
const DEFAULT_COMPANY_PASSWORD = "Oziel@2026";
const DEFAULT_DRIVER_CPF = "12345678910";
const DEFAULT_DRIVER_ID = "driver_oziel";
const DEFAULT_VAN_ID = "van_principal";

let memoryDb: AppDatabase | null = null;

export function hashSecret(value: string) {
  const normalized = normalizeCpf(value) || normalizeContact(value) || value.trim();
  return createHash("sha256").update(`rota-segura:${normalized}`).digest("hex");
}

export function hashPassword(value: string) {
  return createHash("sha256").update(`rota-segura-password:${value.trim()}`).digest("hex");
}

export function passwordMatches(storedHash: string, value: string) {
  return storedHash === hashPassword(value) || storedHash === hashSecret(value);
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
    routeApiProvider: "local-ai",
    routeApiKey: "",
  };
}

function defaultContractTemplate() {
  return [
    "CONTRATO SIMBOLICO DE TRANSPORTE ESCOLAR",
    "",
    "Empresa: {{empresa}}",
    "Responsavel: {{responsavel}}",
    "Aluno: {{aluno}}",
    "Escola: {{escola}}",
    "",
    "A empresa se compromete a realizar o transporte escolar conforme combinacao de horarios, bairros atendidos e disponibilidade de vaga.",
    "O responsavel declara ciencia das regras de embarque, comunicacao de ausencia, pagamento mensal e envio de comprovante para liberacao de recibo.",
    "",
    "Assinatura simbolica do responsavel: {{assinatura}}",
  ].join("\n");
}

function defaultCompany(): CompanyRecord {
  const settings = defaultSettings();
  const document = "00000000000000";

  return {
    id: DEFAULT_COMPANY_ID,
    name: settings.businessName,
    document,
    documentHash: hashSecret(document),
    documentLast4: document.slice(-4),
    passwordHash: hashPassword(DEFAULT_COMPANY_PASSWORD),
    active: true,
    settings,
    theme: defaultTheme(),
    contractTemplate: defaultContractTemplate(),
    createdAt: todayIso(),
  };
}

function defaultLiveTracking(): LiveTrackingState {
  return {
    id: "live_principal",
    companyId: DEFAULT_COMPANY_ID,
    driverId: DEFAULT_DRIVER_ID,
    vanId: DEFAULT_VAN_ID,
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
    companyId: DEFAULT_COMPANY_ID,
    vanId: DEFAULT_VAN_ID,
    token: makeId("vanqr"),
    label: "Van principal",
    active: true,
    generatedAt: todayIso(),
  };
}

function defaultDriver(): DriverRecord {
  const now = todayIso();

  return {
    id: DEFAULT_DRIVER_ID,
    companyId: DEFAULT_COMPANY_ID,
    name: "Oziel Galtaroza Rodrigues",
    contact: "45999340446",
    cpfHash: hashSecret(DEFAULT_DRIVER_CPF),
    cpfLast4: DEFAULT_DRIVER_CPF.slice(-4),
    license: "CNH profissional",
    vanId: DEFAULT_VAN_ID,
    active: true,
    createdAt: now,
  };
}

function defaultVan(): VanRecord {
  return {
    id: DEFAULT_VAN_ID,
    companyId: DEFAULT_COMPANY_ID,
    label: "Van principal",
    plate: "ABC-1D23",
    model: "Renault Master",
    seats: 15,
    color: "#facc15",
    driverId: DEFAULT_DRIVER_ID,
    active: true,
    notes: "Veiculo principal da empresa.",
    createdAt: todayIso(),
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
    companies: [defaultCompany()],
    currentCompanyId: DEFAULT_COMPANY_ID,
    schools: seedSchools(),
    removedSchoolIds: [],
    neighborhoods: seedNeighborhoods(),
    removedNeighborhoodIds: [],
    liveTracking: defaultLiveTracking(),
    liveTrackings: [defaultLiveTracking()],
    vanQrCode: defaultVanQrCode(),
    vanQrCodes: [defaultVanQrCode()],
    admins: [
      {
        id: "admin_main",
        name: "Administrador",
        login: DEFAULT_ADMIN_LOGIN,
        contact: DEFAULT_ADMIN_LOGIN,
        passwordHash: hashPassword(DEFAULT_ADMIN_PASSWORD),
        createdAt: now,
      },
    ],
    drivers: [defaultDriver()],
    vans: [defaultVan()],
    parents: [
      {
        id: parentId,
        companyId: DEFAULT_COMPANY_ID,
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
        companyId: DEFAULT_COMPANY_ID,
        parentId,
        driverId: DEFAULT_DRIVER_ID,
        vanId: DEFAULT_VAN_ID,
        shift: "manha",
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
        companyId: DEFAULT_COMPANY_ID,
        parentId,
        childId,
        month: "Agosto/2026",
        dueDate: "2026-08-05",
        amount: 220,
        paymentMethod: "pix",
        externalReference: "",
        status: "pending_proof",
        createdAt: now,
      },
      {
        id: "pay_jul_2026",
        companyId: DEFAULT_COMPANY_ID,
        parentId,
        childId,
        month: "Julho/2026",
        dueDate: "2026-07-05",
        amount: 220,
        paymentMethod: "pix",
        externalReference: "",
        status: "approved",
        proof: {
          fileName: "comprovante-julho.png",
          fileType: "image/png",
          fileData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          uploadedAt: "2026-07-05T11:55:00.000Z",
        },
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
    contracts: [],
    routePlans: [],
    driverDocuments: [],
    driverOccurrences: [],
    vehicleMaintenances: [],
    fuelRecords: [],
    expenses: [],
    trackingPoints: [],
    notifications: [],
    auditLogs: [],
  };
}

function ensureDb() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    if (!existsSync(DB_PATH)) {
      const seed = memoryDb || createInitialDb();
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
  const companies = input.companies?.length
    ? mergeById(input.companies.map(normalizeCompany), seed.companies)
    : seed.companies;
  const currentCompanyId = input.currentCompanyId || companies[0]?.id || DEFAULT_COMPANY_ID;
  const drivers = Array.isArray(input.drivers)
    ? input.drivers.map(normalizeDriver)
    : seed.drivers;
  const vans = Array.isArray(input.vans)
    ? input.vans.map(normalizeVan)
    : seed.vans;
  const vanQrCodes = Array.isArray(input.vanQrCodes)
    ? input.vanQrCodes.map(normalizeVanQrCode)
    : [normalizeVanQrCode(input.vanQrCode)];
  const liveTrackings = Array.isArray(input.liveTrackings)
    ? input.liveTrackings.map((item) => normalizeLive(item, input.settings?.driverName || seed.settings.driverName))
    : [normalizeLive(input.liveTracking, input.settings?.driverName || seed.settings.driverName)];
  const schools = input.schools?.length
    ? mergeById(input.schools.map(normalizeSchool), seed.schools)
    : seed.schools;
  const neighborhoods = input.neighborhoods?.length
    ? mergeById(input.neighborhoods.map(normalizeNeighborhood), seed.neighborhoods)
    : seed.neighborhoods;

  return {
    settings: { ...seed.settings, ...(companies.find((company) => company.id === currentCompanyId)?.settings || input.settings) },
    theme: { ...seed.theme, ...(companies.find((company) => company.id === currentCompanyId)?.theme || input.theme) },
    companies,
    currentCompanyId,
    schools: schools.filter((schoolItem) => !removedSchoolIds.includes(schoolItem.id)),
    removedSchoolIds,
    neighborhoods: neighborhoods.filter((neighborhood) => !removedNeighborhoodIds.includes(neighborhood.id)),
    removedNeighborhoodIds,
    liveTracking: visibleLive(ensureCompanyOnLive(liveTrackings[0] || seed.liveTracking, currentCompanyId)),
    liveTrackings: liveTrackings.map((live) => ensureCompanyOnLive(live, currentCompanyId)),
    vanQrCode: ensureCompanyOnQr(vanQrCodes[0] || seed.vanQrCode, currentCompanyId),
    vanQrCodes: vanQrCodes.map((qr) => ensureCompanyOnQr(qr, currentCompanyId)),
    admins: input.admins?.length ? input.admins.map(normalizeAdmin) : seed.admins,
    drivers: drivers.map((driver) => ({ ...driver, companyId: driver.companyId || currentCompanyId })),
    vans: vans.map((van) => ({ ...van, companyId: van.companyId || currentCompanyId })),
    parents: (Array.isArray(input.parents) ? input.parents : seed.parents).map((parent) => ({
      ...parent,
      companyId: parent.companyId || currentCompanyId,
    })),
    children: (Array.isArray(input.children) ? input.children.map(normalizeChild) : seed.children).map((child) => ({
      ...child,
      companyId: child.companyId || currentCompanyId,
    })),
    checkins: (Array.isArray(input.checkins) ? input.checkins.map(normalizeCheckin) : seed.checkins).map((checkin) => ({
      ...checkin,
      companyId: checkin.companyId || currentCompanyId,
    })),
    payments: (Array.isArray(input.payments) ? input.payments : seed.payments).map((payment) => ({
      ...normalizePayment(payment),
      companyId: payment.companyId || currentCompanyId,
    })),
    contracts: (Array.isArray(input.contracts) ? input.contracts.map(normalizeContract) : seed.contracts).map((contract) => ({
      ...contract,
      companyId: contract.companyId || currentCompanyId,
    })),
    routePlans: (Array.isArray(input.routePlans) ? input.routePlans.map(normalizeRoutePlan) : seed.routePlans).map((plan) => ({
      ...plan,
      companyId: plan.companyId || currentCompanyId,
    })),
    driverDocuments: (Array.isArray(input.driverDocuments) ? input.driverDocuments : []).map((item) => ({
      ...normalizeDriverDocument(item),
      companyId: item.companyId || currentCompanyId,
    })),
    driverOccurrences: (Array.isArray(input.driverOccurrences) ? input.driverOccurrences : []).map((item) => ({
      ...normalizeDriverOccurrence(item),
      companyId: item.companyId || currentCompanyId,
    })),
    vehicleMaintenances: (Array.isArray(input.vehicleMaintenances) ? input.vehicleMaintenances : []).map((item) => ({
      ...normalizeVehicleMaintenance(item),
      companyId: item.companyId || currentCompanyId,
    })),
    fuelRecords: (Array.isArray(input.fuelRecords) ? input.fuelRecords : []).map((item) => ({
      ...normalizeFuelRecord(item),
      companyId: item.companyId || currentCompanyId,
    })),
    expenses: (Array.isArray(input.expenses) ? input.expenses : []).map((item) => ({
      ...normalizeExpense(item),
      companyId: item.companyId || currentCompanyId,
    })),
    trackingPoints: (Array.isArray(input.trackingPoints) ? input.trackingPoints : []).map((item) => ({
      ...normalizeTrackingPoint(item),
      companyId: item.companyId || currentCompanyId,
    })),
    notifications: (Array.isArray(input.notifications) ? input.notifications : []).map((item) => ({
      ...normalizeNotification(item),
      companyId: item.companyId || currentCompanyId,
    })),
    auditLogs: (Array.isArray(input.auditLogs) ? input.auditLogs : []).map((item) => ({
      ...normalizeAuditLog(item),
      companyId: item.companyId || currentCompanyId,
    })),
  };
}

function mergeById<T extends { id: string }>(current: T[], seeded: T[]) {
  const ids = new Set(current.map((item) => item.id));
  return [...current, ...seeded.filter((item) => !ids.has(item.id))];
}

function normalizeCompany(item: Partial<CompanyRecord>): CompanyRecord {
  const seed = defaultCompany();
  const settings = {
    ...defaultSettings(),
    ...item.settings,
  };
  const document = normalizeDigits(String(item.document || settings.document || seed.document));
  const passwordHash = item.passwordHash || hashSecret(DEFAULT_COMPANY_PASSWORD);

  return {
    id: item.id || makeId("company"),
    name: String(item.name || settings.businessName || settings.brandName || "Empresa").trim(),
    document,
    documentHash: item.documentHash || hashSecret(document),
    documentLast4: item.documentLast4 || document.slice(-4),
    passwordHash,
    active: item.active ?? true,
    settings: {
      ...settings,
      document: settings.document || document,
      businessName: settings.businessName || item.name || "Empresa",
      brandName: settings.brandName || item.name || "Empresa",
      routeApiProvider: settings.routeApiProvider || "local-ai",
      routeApiKey: settings.routeApiKey || "",
    },
    theme: { ...defaultTheme(), ...item.theme },
    contractTemplate: item.contractTemplate || defaultContractTemplate(),
    createdAt: item.createdAt || todayIso(),
  };
}

function normalizeContract(item: Partial<ContractRecord>): ContractRecord {
  return {
    id: item.id || makeId("contract"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    parentId: item.parentId || "",
    childId: item.childId || "",
    title: item.title || "Contrato de transporte escolar",
    content: item.content || defaultContractTemplate(),
    status: item.status === "signed" || item.status === "draft" ? item.status : "sent",
    signerName: item.signerName || "",
    signerDocument: item.signerDocument || "",
    signedAt: item.signedAt || "",
    createdAt: item.createdAt || todayIso(),
  };
}

function normalizeRoutePlan(item: Partial<RoutePlanRecord>): RoutePlanRecord {
  return {
    id: item.id || makeId("routeplan"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    driverId: item.driverId || "",
    vanId: item.vanId || "",
    provider: item.provider === "external-api" ? "external-api" : "local-ai",
    summary: item.summary || "Rota sugerida com base nos enderecos cadastrados.",
    totalEstimatedMinutes: Number(item.totalEstimatedMinutes || 0),
    generatedAt: item.generatedAt || todayIso(),
    stops: Array.isArray(item.stops) ? item.stops : [],
  };
}

function normalizeDriverDocument(item: Partial<DriverDocumentRecord>): DriverDocumentRecord {
  const now = todayIso();
  const allowedTypes = ["cnh", "curso", "exame", "outro"] as const;
  return {
    id: item.id || makeId("driverdoc"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    driverId: item.driverId || "",
    type: allowedTypes.includes(item.type as (typeof allowedTypes)[number]) ? item.type as DriverDocumentRecord["type"] : "outro",
    label: item.label || "Documento",
    documentNumber: item.documentNumber || "",
    issuedAt: item.issuedAt || "",
    expiresAt: item.expiresAt || "",
    notes: item.notes || "",
    active: item.active ?? true,
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || item.createdAt || now,
  };
}

function normalizeDriverOccurrence(item: Partial<DriverOccurrenceRecord>): DriverOccurrenceRecord {
  const now = todayIso();
  return {
    id: item.id || makeId("occurrence"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    driverId: item.driverId || "",
    childId: item.childId || "",
    occurredAt: item.occurredAt || now.slice(0, 16),
    severity: item.severity === "high" || item.severity === "medium" ? item.severity : "low",
    title: item.title || "Ocorrencia",
    description: item.description || "",
    resolved: item.resolved ?? false,
    resolution: item.resolution || "",
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || item.createdAt || now,
  };
}

function normalizeVehicleMaintenance(item: Partial<VehicleMaintenanceRecord>): VehicleMaintenanceRecord {
  const now = todayIso();
  const allowedTypes = ["maintenance", "ipva", "insurance", "revision", "tires", "other"] as const;
  return {
    id: item.id || makeId("maintenance"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    vanId: item.vanId || "",
    type: allowedTypes.includes(item.type as (typeof allowedTypes)[number]) ? item.type as VehicleMaintenanceRecord["type"] : "other",
    title: item.title || "Manutencao",
    dueDate: item.dueDate || "",
    completedAt: item.completedAt || "",
    odometer: Number(item.odometer || 0),
    cost: Number(item.cost || 0),
    status: item.status === "completed" ? "completed" : "pending",
    notes: item.notes || "",
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || item.createdAt || now,
  };
}

function normalizeFuelRecord(item: Partial<FuelRecord>): FuelRecord {
  const now = todayIso();
  return {
    id: item.id || makeId("fuel"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    vanId: item.vanId || "",
    filledAt: item.filledAt || now.slice(0, 10),
    liters: Number(item.liters || 0),
    amount: Number(item.amount || 0),
    odometer: Number(item.odometer || 0),
    station: item.station || "",
    notes: item.notes || "",
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || item.createdAt || now,
  };
}

function normalizeExpense(item: Partial<ExpenseRecord>): ExpenseRecord {
  const now = todayIso();
  const allowedCategories = ["fuel", "maintenance", "tax", "insurance", "payroll", "other"] as const;
  return {
    id: item.id || makeId("expense"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    category: allowedCategories.includes(item.category as (typeof allowedCategories)[number]) ? item.category as ExpenseRecord["category"] : "other",
    description: item.description || "Despesa",
    amount: Number(item.amount || 0),
    dueDate: item.dueDate || "",
    paidAt: item.paidAt || "",
    status: item.status === "paid" ? "paid" : "pending",
    notes: item.notes || "",
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || item.createdAt || now,
  };
}

function normalizeTrackingPoint(item: Partial<TrackingPointRecord>): TrackingPointRecord {
  return {
    id: item.id || makeId("tracking"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    liveTrackingId: item.liveTrackingId || "",
    driverId: item.driverId || "",
    vanId: item.vanId || "",
    latitude: Number(item.latitude || 0),
    longitude: Number(item.longitude || 0),
    accuracy: item.accuracy,
    speed: item.speed,
    neighborhood: item.neighborhood || "",
    recordedAt: item.recordedAt || todayIso(),
  };
}

function normalizeNotification(item: Partial<NotificationRecord>): NotificationRecord {
  const allowedTypes = ["checkin", "checkout", "absence", "payment", "route", "alert"] as const;
  return {
    id: item.id || makeId("notification"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    parentId: item.parentId || "",
    childId: item.childId || "",
    driverId: item.driverId || "",
    type: allowedTypes.includes(item.type as (typeof allowedTypes)[number]) ? item.type as NotificationRecord["type"] : "alert",
    title: item.title || "Aviso",
    message: item.message || "",
    createdAt: item.createdAt || todayIso(),
    readAt: item.readAt || "",
  };
}

function normalizeAuditLog(item: Partial<AuditLogRecord>): AuditLogRecord {
  const action = item.action === "created" || item.action === "deleted" ? item.action : "updated";
  return {
    id: item.id || makeId("audit"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    actorRole: item.actorRole || "system",
    actorName: item.actorName || "Sistema",
    action,
    entityType: item.entityType || "dados",
    entityId: item.entityId || "",
    summary: item.summary || "Dados atualizados",
    createdAt: item.createdAt || todayIso(),
  };
}

function ensureCompanyOnLive(item: LiveTrackingState, companyId: string): LiveTrackingState {
  return { ...item, companyId: item.companyId || companyId };
}

function ensureCompanyOnQr(item: VanQrCodeRecord, companyId: string): VanQrCodeRecord {
  return { ...item, companyId: item.companyId || companyId };
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

function normalizeDriver(item: Partial<DriverRecord>): DriverRecord {
  const seed = defaultDriver();
  const contact = normalizeContact(String(item.contact || seed.contact));
  const cpfLast4 = item.cpfLast4 || "8910";

  return {
    id: item.id || makeId("driver"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    name: item.name || seed.name,
    contact,
    cpfHash: item.cpfHash || seed.cpfHash,
    cpfLast4,
    license: item.license || "",
    vanId: item.vanId || DEFAULT_VAN_ID,
    active: item.active ?? true,
    createdAt: item.createdAt || todayIso(),
  };
}

function normalizeVan(item: Partial<VanRecord>): VanRecord {
  const seed = defaultVan();

  return {
    id: item.id || makeId("van"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    label: item.label || seed.label,
    plate: item.plate || "",
    model: item.model || "",
    seats: Number(item.seats || seed.seats),
    color: item.color || seed.color,
    driverId: item.driverId || "",
    active: item.active ?? true,
    notes: item.notes || "",
    createdAt: item.createdAt || todayIso(),
  };
}

function normalizeChild(item: Partial<ChildRecord>): ChildRecord {
  const now = todayIso();
  const status = normalizeAbsenceStatus(item.absenceStatus);
  const shift = shifts.includes(item.shift as Shift) ? item.shift : undefined;

  return {
    id: item.id || makeId("child"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    parentId: item.parentId || "",
    driverId: item.driverId || "",
    vanId: item.vanId || "",
    shift,
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
    companyId: item?.companyId || DEFAULT_COMPANY_ID,
    vanId: item?.vanId || seed.vanId,
    token: item?.token || seed.token,
    label: item?.label || seed.label,
    active: item?.active ?? true,
    generatedAt: item?.generatedAt || seed.generatedAt,
  };
}

function normalizeCheckin(item: Partial<CheckinRecord>): CheckinRecord {
  return {
    id: item.id || makeId("checkin"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    parentId: item.parentId || "",
    childId: item.childId || "",
    vanId: item.vanId || "",
    driverId: item.driverId || "",
    type: item.type === "returning" ? "returning" : "boarding",
    scannedAt: item.scannedAt || todayIso(),
    latitude: item.latitude,
    longitude: item.longitude,
    accuracy: item.accuracy,
    token: item.token || "",
  };
}

function normalizePayment(item: Partial<PaymentRecord>): PaymentRecord {
  const proof = item.proof?.fileName && item.proof?.fileData ? item.proof : undefined;
  const allowedStatuses: PaymentRecord["status"][] = ["pending_proof", "proof_received", "approved", "rejected"];
  let status = allowedStatuses.includes(item.status as PaymentRecord["status"])
    ? item.status as PaymentRecord["status"]
    : "pending_proof";
  if (!proof && (status === "approved" || status === "proof_received")) status = "pending_proof";

  return {
    id: item.id || makeId("payment"),
    companyId: item.companyId || DEFAULT_COMPANY_ID,
    parentId: item.parentId || "",
    childId: item.childId || "",
    month: item.month || "Mensalidade",
    dueDate: item.dueDate || "",
    amount: Number(item.amount || 0),
    paymentMethod: item.paymentMethod === "boleto" || item.paymentMethod === "card" || item.paymentMethod === "cash" ? item.paymentMethod : "pix",
    externalReference: item.externalReference || "",
    status,
    proof,
    receipt: proof ? item.receipt : undefined,
    createdAt: item.createdAt || todayIso(),
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
    passwordHash: oldDefault ? hashPassword(DEFAULT_ADMIN_PASSWORD) : item.passwordHash || hashPassword(DEFAULT_ADMIN_PASSWORD),
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
    id: item?.id || seed.id || makeId("live"),
    companyId: item?.companyId || seed.companyId || DEFAULT_COMPANY_ID,
    driverId: item?.driverId || seed.driverId,
    vanId: item?.vanId || seed.vanId,
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

function hasSupabaseStorage() {
  return Boolean(
    (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function hasBlobStorage() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
  );
}

function hasDurableStorage() {
  return hasSupabaseStorage() || hasBlobStorage();
}

function storageProvider(): AdminPayload["storage"]["provider"] {
  if (hasSupabaseStorage()) return "supabase";
  if (hasBlobStorage()) return "vercel-blob";
  return "temporary";
}

function supabaseHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const headers: Record<string, string> = {
    apikey: key,
    "Content-Type": "application/json",
  };

  // Supabase secret keys are not JWTs and must not be sent as bearer tokens.
  if (!key.startsWith("sb_secret_")) {
    headers.Authorization = `Bearer ${key}`;
  }

  return headers;
}

async function readSupabaseDb() {
  const baseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const response = await fetch(`${baseUrl}/rest/v1/app_state?id=eq.rota-segura&select=payload`, {
    headers: supabaseHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`);
  const rows = await response.json() as Array<{ payload?: Partial<AppDatabase> }>;
  return rows[0]?.payload ? normalizeDb(rows[0].payload) : null;
}

async function writeSupabaseDb(db: AppDatabase) {
  const baseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const response = await fetch(`${baseUrl}/rest/v1/app_state?on_conflict=id`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ id: "rota-segura", payload: db, updated_at: todayIso() }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase write failed: ${response.status}`);
}

export async function prepareDb() {
  if (!hasDurableStorage()) return readDb();

  if (hasSupabaseStorage()) {
    try {
      const remoteDb = await readSupabaseDb();
      if (remoteDb) {
        writeDb(remoteDb);
      } else {
        await writeSupabaseDb(readDb());
      }
      return readDb();
    } catch {
      if (!hasBlobStorage()) return readDb();
    }
  }

  try {
    const result = await get(BLOB_DB_PATH, { access: "private", useCache: false });
    if (result?.statusCode === 200) {
      const raw = await new Response(result.stream).text();
      writeDb(normalizeDb(JSON.parse(raw) as Partial<AppDatabase>));
    } else {
      memoryDb = ensureDb();
      await persistDb();
    }
  } catch {
    memoryDb = ensureDb();
  }

  return readDb();
}

export async function persistDb() {
  if (!hasDurableStorage()) return false;

  if (hasSupabaseStorage()) {
    try {
      await writeSupabaseDb(readDb());
      return true;
    } catch (error) {
      if (!hasBlobStorage()) throw error;
    }
  }

  await put(BLOB_DB_PATH, JSON.stringify(readDb()), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });

  return true;
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
  const collections = [
    "companies",
    "schools",
    "neighborhoods",
    "drivers",
    "vans",
    "parents",
    "children",
    "checkins",
    "payments",
    "contracts",
    "routePlans",
    "driverDocuments",
    "driverOccurrences",
    "vehicleMaintenances",
    "fuelRecords",
    "expenses",
  ] as const;
  const before = new Map<string, Array<{ id: string; companyId?: string }>>(
    collections.map((name) => [name, structuredClone(db[name]) as Array<{ id: string; companyId?: string }>])
  );
  mutator(db);

  for (const name of collections) {
    const previous = before.get(name) || [];
    const current = db[name] as Array<{ id: string; companyId?: string }>;
    if (JSON.stringify(previous) === JSON.stringify(current)) continue;

    const previousById = new Map(previous.map((item) => [item.id, item]));
    const currentById = new Map(current.map((item) => [item.id, item]));
    const created = current.find((item) => !previousById.has(item.id));
    const deleted = previous.find((item) => !currentById.has(item.id));
    const updated = current.find((item) => {
      const old = previousById.get(item.id);
      return old && JSON.stringify(old) !== JSON.stringify(item);
    });
    const target = created || deleted || updated;
    const action: AuditLogRecord["action"] = created ? "created" : deleted ? "deleted" : "updated";
    const labels: Record<typeof name, string> = {
      companies: "empresa",
      schools: "escola",
      neighborhoods: "bairro",
      drivers: "motorista",
      vans: "veiculo",
      parents: "responsavel",
      children: "aluno",
      checkins: "check-in",
      payments: "mensalidade",
      contracts: "contrato",
      routePlans: "rota",
      driverDocuments: "documento do motorista",
      driverOccurrences: "ocorrencia",
      vehicleMaintenances: "manutencao",
      fuelRecords: "abastecimento",
      expenses: "despesa",
    };
    const verbs: Record<AuditLogRecord["action"], string> = {
      created: "criado",
      updated: "atualizado",
      deleted: "excluido",
    };
    db.auditLogs = [
      {
        id: makeId("audit"),
        companyId: target?.companyId || db.currentCompanyId || DEFAULT_COMPANY_ID,
        actorRole: "system" as const,
        actorName: "Sistema",
        action,
        entityType: name,
        entityId: target?.id || "",
        summary: `${labels[name]} ${verbs[action]}`,
        createdAt: todayIso(),
      },
      ...db.auditLogs,
    ].slice(0, 800);
  }
  return writeDb(db);
}

function resolveCompany(db: AppDatabase, companyId?: string) {
  return db.companies.find((company) => company.id === companyId) ||
    db.companies.find((company) => company.id === db.currentCompanyId) ||
    db.companies[0] ||
    defaultCompany();
}

function companySettings(db: AppDatabase, companyId?: string) {
  return resolveCompany(db, companyId).settings || db.settings;
}

function companyTheme(db: AppDatabase, companyId?: string) {
  return resolveCompany(db, companyId).theme || db.theme;
}

function publicCompanySettings(settings: CompanySettings) {
  const copy = { ...settings };
  delete copy.routeApiKey;
  return copy;
}

function belongsToCompany<T extends { companyId?: string }>(item: T, companyId: string) {
  return (item.companyId || DEFAULT_COMPANY_ID) === companyId;
}

export function getAdminPayload(companyId?: string): AdminPayload {
  const db = readDb();
  const currentCompany = resolveCompany(db, companyId);
  const currentCompanyId = currentCompany.id;
  const drivers = db.drivers.filter((item) => belongsToCompany(item, currentCompanyId));
  const vans = db.vans.filter((item) => belongsToCompany(item, currentCompanyId));
  const parents = db.parents.filter((item) => belongsToCompany(item, currentCompanyId));
  const children = db.children.filter((item) => belongsToCompany(item, currentCompanyId));
  const checkins = db.checkins.filter((item) => belongsToCompany(item, currentCompanyId));
  const payments = db.payments.filter((item) => belongsToCompany(item, currentCompanyId));
  const contracts = db.contracts.filter((item) => belongsToCompany(item, currentCompanyId));
  const routePlans = db.routePlans.filter((item) => belongsToCompany(item, currentCompanyId));
  const driverDocuments = db.driverDocuments.filter((item) => belongsToCompany(item, currentCompanyId));
  const driverOccurrences = db.driverOccurrences.filter((item) => belongsToCompany(item, currentCompanyId));
  const vehicleMaintenances = db.vehicleMaintenances.filter((item) => belongsToCompany(item, currentCompanyId));
  const fuelRecords = db.fuelRecords.filter((item) => belongsToCompany(item, currentCompanyId));
  const expenses = db.expenses.filter((item) => belongsToCompany(item, currentCompanyId));
  const trackingPoints = db.trackingPoints.filter((item) => belongsToCompany(item, currentCompanyId));
  const notifications = db.notifications.filter((item) => belongsToCompany(item, currentCompanyId));
  const auditLogs = db.auditLogs.filter((item) => belongsToCompany(item, currentCompanyId));
  const liveTrackings = db.liveTrackings
    .filter((item) => belongsToCompany(item, currentCompanyId))
    .map(visibleLive);
  const vanQrCodes = db.vanQrCodes.filter((item) => belongsToCompany(item, currentCompanyId));

  return {
    storage: {
      durable: hasDurableStorage(),
      provider: storageProvider(),
    },
    adminAccess: safeAdmin(db.admins[0]),
    currentCompany: safeCompany(currentCompany),
    companies: db.companies.map(safeCompany),
    settings: companySettings(db, currentCompanyId),
    theme: companyTheme(db, currentCompanyId),
    schools: db.schools,
    neighborhoods: db.neighborhoods,
    liveTracking: liveTrackings[0] || visibleLive(ensureCompanyOnLive(db.liveTracking, currentCompanyId)),
    liveTrackings,
    vanQrCode: vanQrCodes[0] || ensureCompanyOnQr(db.vanQrCode, currentCompanyId),
    vanQrCodes,
    drivers: drivers.map(safeDriver),
    vans,
    parents: parents.map(safeParent),
    children: children.map(safeChild),
    checkins,
    payments,
    contracts,
    routePlans,
    driverDocuments,
    driverOccurrences,
    vehicleMaintenances,
    fuelRecords,
    expenses,
    trackingPoints,
    notifications,
    auditLogs,
  };
}

export function getPublicPayload() {
  const db = readDb();
  const settings = publicCompanySettings(companySettings(db, db.currentCompanyId));

  return {
    settings,
    theme: companyTheme(db, db.currentCompanyId),
    schools: db.schools.filter((schoolItem) => schoolItem.active),
    neighborhoods: db.neighborhoods.filter((neighborhood) => neighborhood.served),
  };
}

export function getParentDashboard(parentId: string): ParentDashboardPayload | null {
  const db = readDb();
  const parent = db.parents.find((item) => item.id === parentId && item.active);
  if (!parent) return null;
  const parentCompanyId = parent.companyId || DEFAULT_COMPANY_ID;
  const children = db.children.filter((child) => child.parentId === parent.id);
  const childDriverIds = new Set(children.map((child) => child.driverId).filter(Boolean));
  const childVanIds = new Set(children.map((child) => child.vanId).filter(Boolean));
  const relatedLiveTrackings = db.liveTrackings
    .filter((live) => belongsToCompany(live, parentCompanyId))
    .map(visibleLive)
    .filter((live) => (live.driverId && childDriverIds.has(live.driverId)) || (live.vanId && childVanIds.has(live.vanId)));
  const liveTracking = relatedLiveTrackings[0] || visibleLive(ensureCompanyOnLive(db.liveTracking, parentCompanyId));
  const settings = publicCompanySettings(companySettings(db, parentCompanyId));

  return {
    settings,
    theme: companyTheme(db, parentCompanyId),
    schools: db.schools.filter((schoolItem) => schoolItem.active),
    neighborhoods: db.neighborhoods,
    liveTracking,
    liveTrackings: relatedLiveTrackings,
    parent: safeParent(parent),
    children: children.map(safeChild),
    checkins: db.checkins.filter((checkin) => checkin.parentId === parent.id),
    payments: db.payments.filter((payment) => payment.parentId === parent.id),
    contracts: db.contracts.filter((contract) => contract.parentId === parent.id),
    trackingHistory: db.trackingPoints
      .filter((point) => belongsToCompany(point, parentCompanyId) && ((point.driverId && childDriverIds.has(point.driverId)) || (point.vanId && childVanIds.has(point.vanId))))
      .slice(0, 200),
    notifications: db.notifications.filter((notification) => notification.parentId === parent.id).slice(0, 100),
  };
}

export function getStudentDashboard(childId: string): StudentDashboardPayload | null {
  const db = readDb();
  const child = db.children.find((item) => item.id === childId && item.active);
  if (!child) return null;

  const parent = db.parents.find((item) => item.id === child.parentId && item.active);
  if (!parent) return null;

  const companyId = child.companyId || parent.companyId || DEFAULT_COMPANY_ID;
  const relatedLiveTrackings = db.liveTrackings
    .filter((live) => belongsToCompany(live, companyId))
    .map(visibleLive)
    .filter((live) => (child.driverId && live.driverId === child.driverId) || (child.vanId && live.vanId === child.vanId));
  const liveTracking = relatedLiveTrackings[0] || visibleLive(ensureCompanyOnLive(db.liveTracking, companyId));

  return {
    settings: publicCompanySettings(companySettings(db, companyId)),
    theme: companyTheme(db, companyId),
    schools: db.schools.filter((schoolItem) => schoolItem.active),
    neighborhoods: db.neighborhoods,
    liveTracking,
    liveTrackings: relatedLiveTrackings,
    parent: safeParent(parent),
    child: safeChild(child),
    checkins: db.checkins.filter((checkin) => checkin.childId === child.id),
    payments: db.payments.filter((payment) => payment.childId === child.id),
    contracts: db.contracts.filter((contract) => contract.childId === child.id),
    trackingHistory: db.trackingPoints
      .filter((point) => belongsToCompany(point, companyId) && ((child.driverId && point.driverId === child.driverId) || (child.vanId && point.vanId === child.vanId)))
      .slice(0, 200),
    notifications: db.notifications.filter((notification) => notification.childId === child.id).slice(0, 100),
  };
}

export function getLiveTracking(driverId?: string) {
  const db = readDb();
  const live = driverId
    ? db.liveTrackings.find((item) => item.driverId === driverId || item.id === driverId)
    : db.liveTrackings[0] || db.liveTracking;

  return visibleLive(live || db.liveTracking);
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

function safeDriver(driver: DriverRecord) {
  return {
    id: driver.id,
    companyId: driver.companyId,
    name: driver.name,
    contact: driver.contact,
    cpfLast4: driver.cpfLast4,
    license: driver.license,
    vanId: driver.vanId,
    active: driver.active,
    createdAt: driver.createdAt,
  };
}

function safeChild(child: ChildRecord): SafeChildRecord {
  const safe = { ...child };
  delete (safe as Partial<ChildRecord>).cpfHash;
  return safe as SafeChildRecord;
}

function safeCompany(company: CompanyRecord) {
  const settings = publicCompanySettings(company.settings);

  return {
    id: company.id,
    name: company.name,
    document: company.document,
    documentLast4: company.documentLast4,
    active: company.active,
    settings: {
      ...settings,
      routeApiProvider: company.settings.routeApiProvider || "local-ai",
      hasRouteApiKey: Boolean(company.settings.routeApiKey),
    },
    theme: company.theme,
    contractTemplate: company.contractTemplate,
    createdAt: company.createdAt,
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
    if (password) admin.passwordHash = hashPassword(password);
  });

  return { db, error, adminAccess: safeAdmin(db.admins[0]) };
}

export function upsertCompany(input: {
  id?: string;
  name: string;
  document: string;
  password?: string;
  active?: boolean;
  settings?: Partial<CompanySettings>;
  theme?: Partial<ThemeSettings>;
  contractTemplate?: string;
}) {
  let error = "";
  let companyId = "";
  const db = mutateDb((draft) => {
    const name = input.name.trim();
    const document = normalizeDigits(input.document || input.settings?.document || "");
    const password = input.password?.trim() || "";

    if (!name || document.length < 11) {
      error = "Informe nome da empresa e CNPJ/CPF com digitos validos.";
      return;
    }

    if (!input.id && password.length < 6) {
      error = "Informe uma senha inicial com pelo menos 6 caracteres.";
      return;
    }

    const existing = input.id
      ? draft.companies.find((item) => item.id === input.id)
      : draft.companies.find((item) => normalizeDigits(item.document) === document);
    const company: CompanyRecord = existing || {
      ...defaultCompany(),
      id: makeId("company"),
      createdAt: todayIso(),
    };

    company.name = name;
    company.document = document;
    company.documentHash = hashSecret(document);
    company.documentLast4 = document.slice(-4);
    company.active = input.active ?? true;
    company.settings = {
      ...company.settings,
      ...input.settings,
      brandName: input.settings?.brandName?.trim() || company.settings.brandName || name,
      businessName: input.settings?.businessName?.trim() || company.settings.businessName || name,
      document: input.settings?.document?.trim() || document,
      routeApiProvider: input.settings?.routeApiProvider || company.settings.routeApiProvider || "local-ai",
      routeApiKey: input.settings?.routeApiKey ?? company.settings.routeApiKey ?? "",
    };
    company.theme = { ...company.theme, ...input.theme };
    company.contractTemplate = input.contractTemplate?.trim() || company.contractTemplate || defaultContractTemplate();
    if (password) company.passwordHash = hashPassword(password);
    companyId = company.id;

    if (!existing) {
      draft.companies.push(company);
    }
  });

  return { db, error, companyId };
}

export function updateCompanyProfile(
  companyId: string | undefined,
  settings?: Partial<CompanySettings>,
  theme?: Partial<ThemeSettings>
) {
  const db = mutateDb((draft) => {
    const company = resolveCompany(draft, companyId);
    if (settings) {
      company.settings = {
        ...company.settings,
        ...settings,
        brandName: settings.brandName?.trim() || company.settings.brandName,
        businessName: settings.businessName?.trim() || company.settings.businessName,
        pixKey: settings.pixKey?.trim() || company.settings.pixKey,
        routeApiProvider: settings.routeApiProvider || company.settings.routeApiProvider || "local-ai",
        routeApiKey: settings.routeApiKey ?? company.settings.routeApiKey ?? "",
      };
      company.name = company.settings.businessName || company.settings.brandName || company.name;
      company.document = normalizeDigits(company.settings.document || company.document);
      company.documentHash = hashSecret(company.document);
      company.documentLast4 = company.document.slice(-4);
    }

    if (theme) {
      company.theme = {
        ...company.theme,
        ...theme,
      };
    }

    if (company.id === draft.currentCompanyId) {
      draft.settings = company.settings;
      draft.theme = company.theme;
    }
  });

  const currentCompany = resolveCompany(db, companyId);
  return {
    db,
    settings: currentCompany.settings,
    theme: currentCompany.theme,
    currentCompany: safeCompany(currentCompany),
  };
}

export function upsertParent(input: {
  id?: string;
  companyId?: string;
  name: string;
  contact: string;
  email?: string;
  cpf?: string;
  active?: boolean;
}) {
  let error = "";
  let parentId = "";

  const db = mutateDb((draft) => {
    const companyId = resolveCompany(draft, input.companyId).id;
    const name = input.name.trim();
    const contact = normalizeContact(input.contact);
    const cpf = normalizeCpf(input.cpf || "");
    const existing = input.id
      ? draft.parents.find((item) => item.id === input.id && belongsToCompany(item, companyId))
      : undefined;

    if (!name || contact.length < 10) {
      error = "Informe nome e um contato valido com DDD.";
      return;
    }

    if (input.id && !existing) {
      error = "Responsavel nao encontrado.";
      return;
    }

    if (!existing && cpf.length !== 11) {
      error = "Informe o CPF com 11 digitos para criar a senha.";
      return;
    }

    const duplicateContact = draft.parents.find(
      (item) =>
        item.id !== existing?.id &&
        item.active &&
        belongsToCompany(item, companyId) &&
        normalizeContact(item.contact) === contact
    );
    if (duplicateContact) {
      error = "Este contato ja pertence a outro responsavel desta empresa.";
      return;
    }

    if (cpf) {
      const cpfHash = hashSecret(cpf);
      const duplicateCpf = draft.parents.find(
        (item) =>
          item.id !== existing?.id &&
          item.active &&
          belongsToCompany(item, companyId) &&
          item.cpfHash === cpfHash
      );
      if (duplicateCpf) {
        error = "Este CPF ja pertence a outro responsavel desta empresa.";
        return;
      }
    }

    const parent: ParentRecord = existing || {
      id: makeId("parent"),
      companyId,
      name,
      contact,
      email: "",
      cpfHash: hashSecret(cpf),
      cpfLast4: cpf.slice(-4),
      active: true,
      createdAt: todayIso(),
    };

    parent.companyId = companyId;
    parent.name = name;
    parent.contact = contact;
    parent.email = input.email?.trim() || "";
    parent.active = input.active ?? true;
    if (cpf) {
      parent.cpfHash = hashSecret(cpf);
      parent.cpfLast4 = cpf.slice(-4);
    }
    parentId = parent.id;

    if (!existing) draft.parents.push(parent);
    draft.children.forEach((child) => {
      if (child.parentId === parent.id) child.responsiblePhone = contact;
    });
  });

  return { db, error, parentId };
}

export function deleteParent(id: string, companyId?: string) {
  let error = "";

  const db = mutateDb((draft) => {
    const activeCompanyId = resolveCompany(draft, companyId).id;
    const parent = draft.parents.find(
      (item) => item.id === id && belongsToCompany(item, activeCompanyId)
    );
    if (!parent) {
      error = "Responsavel nao encontrado.";
      return;
    }

    const childIds = new Set(
      draft.children.filter((child) => child.parentId === id).map((child) => child.id)
    );
    draft.parents = draft.parents.filter((item) => item.id !== id);
    draft.children = draft.children.filter((child) => child.parentId !== id);
    draft.checkins = draft.checkins.filter((checkin) => checkin.parentId !== id);
    draft.payments = draft.payments.filter((payment) => payment.parentId !== id);
    draft.contracts = draft.contracts.filter((contract) => contract.parentId !== id);
    draft.notifications = draft.notifications.filter((notification) => notification.parentId !== id);
    draft.routePlans = draft.routePlans.filter(
      (plan) => !plan.stops.some((stop) => childIds.has(stop.childId))
    );
  });

  return { db, error };
}

export function upsertChild(input: {
  id?: string;
  companyId?: string;
  parentId: string;
  name: string;
  cpf?: string;
  birthDate: string;
  schoolId: string;
  grade?: string;
  responsiblePhone?: string;
  address?: Partial<ChildRecord["address"]>;
  notes?: string;
  driverId?: string;
  vanId?: string;
  shift?: Shift | "";
  active?: boolean;
}) {
  let error = "";
  let childId = "";

  const db = mutateDb((draft) => {
    const companyId = resolveCompany(draft, input.companyId).id;
    const parent = draft.parents.find(
      (item) => item.id === input.parentId && item.active && belongsToCompany(item, companyId)
    );
    const schoolItem = draft.schools.find((item) => item.id === input.schoolId && item.active);
    const name = input.name.trim();
    const cpf = normalizeCpf(input.cpf || "");
    const existing = input.id
      ? draft.children.find((item) => item.id === input.id && belongsToCompany(item, companyId))
      : undefined;

    if (!parent) {
      error = "Responsavel nao encontrado.";
      return;
    }
    if (input.id && !existing) {
      error = "Aluno nao encontrado.";
      return;
    }
    if (!name || !input.birthDate || !schoolItem) {
      error = "Informe nome, nascimento e escola do aluno.";
      return;
    }
    if (!existing && cpf.length !== 11) {
      error = "Informe o CPF com 11 digitos para liberar o acesso do aluno.";
      return;
    }

    if (cpf) {
      const cpfHash = hashSecret(cpf);
      const duplicateCpf = draft.children.find(
        (item) => item.id !== existing?.id && item.active && item.cpfHash === cpfHash
      );
      if (duplicateCpf) {
        error = "Este CPF ja pertence a outro aluno.";
        return;
      }
    }

    const driver = input.driverId
      ? draft.drivers.find(
          (item) => item.id === input.driverId && belongsToCompany(item, companyId)
        )
      : undefined;
    const van = input.vanId
      ? draft.vans.find((item) => item.id === input.vanId && belongsToCompany(item, companyId))
      : undefined;
    if (input.driverId && !driver) {
      error = "Motorista selecionado nao pertence a esta empresa.";
      return;
    }
    if (input.vanId && !van) {
      error = "Van selecionada nao pertence a esta empresa.";
      return;
    }

    const child: ChildRecord = existing || {
      id: makeId("child"),
      companyId,
      parentId: parent.id,
      name,
      cpfHash: hashSecret(cpf),
      cpfLast4: cpf.slice(-4),
      birthDate: input.birthDate,
      schoolId: input.schoolId,
      grade: "",
      responsiblePhone: parent.contact,
      address: {
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "Toledo",
        state: "PR",
      },
      notes: "",
      absenceStatus: "going",
      absenceDate: todayIso().slice(0, 10),
      absenceUpdatedAt: todayIso(),
      active: true,
      createdAt: todayIso(),
    };

    child.companyId = companyId;
    child.parentId = parent.id;
    child.name = name;
    child.birthDate = input.birthDate;
    child.schoolId = input.schoolId;
    child.grade = input.grade?.trim() || "";
    child.responsiblePhone = normalizeContact(input.responsiblePhone || parent.contact);
    child.address = {
      ...child.address,
      ...input.address,
      city: input.address?.city?.trim() || child.address.city || "Toledo",
      state: input.address?.state?.trim().toUpperCase() || child.address.state || "PR",
    };
    child.notes = input.notes?.trim() || "";
    child.driverId = driver?.id || "";
    child.vanId = van?.id || "";
    child.shift = shifts.includes(input.shift as Shift) ? (input.shift as Shift) : undefined;
    child.active = input.active ?? true;
    if (cpf) {
      child.cpfHash = hashSecret(cpf);
      child.cpfLast4 = cpf.slice(-4);
    }
    childId = child.id;

    if (!existing) draft.children.push(child);
  });

  return { db, error, childId };
}

export function deleteChild(id: string, companyId?: string, parentId?: string) {
  let error = "";

  const db = mutateDb((draft) => {
    const activeCompanyId = resolveCompany(draft, companyId).id;
    const child = draft.children.find(
      (item) =>
        item.id === id &&
        belongsToCompany(item, activeCompanyId) &&
        (!parentId || item.parentId === parentId)
    );
    if (!child) {
      error = "Aluno nao encontrado.";
      return;
    }

    draft.children = draft.children.filter((item) => item.id !== id);
    draft.checkins = draft.checkins.filter((checkin) => checkin.childId !== id);
    draft.payments = draft.payments.filter((payment) => payment.childId !== id);
    draft.contracts = draft.contracts.filter((contract) => contract.childId !== id);
    draft.notifications = draft.notifications.filter((notification) => notification.childId !== id);
    draft.routePlans = draft.routePlans.filter(
      (plan) => !plan.stops.some((stop) => stop.childId === id)
    );
  });

  return { db, error };
}

export function upsertDriver(input: Partial<DriverRecord> & { name: string; contact: string; cpf?: string; companyId?: string }) {
  let error = "";
  const db = mutateDb((draft) => {
    const companyId = resolveCompany(draft, input.companyId).id;
    const name = input.name.trim();
    const contact = normalizeContact(input.contact || "");
    const cpf = normalizeCpf(input.cpf || "");

    if (!name || contact.length < 10) {
      error = "Informe nome e um contato valido com DDD.";
      return;
    }

    if (!input.id && cpf.length !== 11) {
      error = "Informe o CPF com 11 digitos para criar a senha do motorista.";
      return;
    }

    const existing = input.id ? draft.drivers.find((item) => item.id === input.id && belongsToCompany(item, companyId)) : null;
    if (input.id && !existing) {
      error = "Motorista nao encontrado.";
      return;
    }

    const duplicateContact = draft.drivers.find(
      (item) =>
        item.id !== existing?.id &&
        item.active &&
        belongsToCompany(item, companyId) &&
        normalizeContact(item.contact) === contact
    );
    if (duplicateContact) {
      error = "Este contato ja pertence a outro motorista desta empresa.";
      return;
    }

    if (cpf) {
      const cpfHash = hashSecret(cpf);
      const duplicateCpf = draft.drivers.find(
        (item) =>
          item.id !== existing?.id &&
          item.active &&
          belongsToCompany(item, companyId) &&
          item.cpfHash === cpfHash
      );
      if (duplicateCpf) {
        error = "Este CPF ja pertence a outro motorista desta empresa.";
        return;
      }
    }

    const driver: DriverRecord = existing || {
      id: makeId("driver"),
      companyId,
      name,
      contact,
      cpfHash: hashSecret(cpf),
      cpfLast4: cpf.slice(-4),
      license: "",
      vanId: "",
      active: true,
      createdAt: todayIso(),
    };

    driver.name = name;
    driver.companyId = companyId;
    driver.contact = contact;
    driver.license = input.license || "";
    driver.vanId = input.vanId || "";
    driver.active = input.active ?? true;

    if (cpf) {
      driver.cpfHash = hashSecret(cpf);
      driver.cpfLast4 = cpf.slice(-4);
    }

    if (!existing) draft.drivers.push(driver);

    draft.vans.filter((van) => belongsToCompany(van, companyId)).forEach((van) => {
      if (van.driverId === driver.id && van.id !== driver.vanId) van.driverId = "";
      if (driver.vanId && van.id === driver.vanId) van.driverId = driver.id;
    });
  });

  return { db, error };
}

export function deleteDriver(id: string, companyId?: string) {
  let error = "";
  const db = mutateDb((draft) => {
    const activeCompanyId = resolveCompany(draft, companyId).id;
    const driver = draft.drivers.find((item) => item.id === id && belongsToCompany(item, activeCompanyId));
    if (!driver) {
      error = "Motorista nao encontrado.";
      return;
    }

    draft.drivers = draft.drivers.filter((item) => item.id !== id);
    draft.vans.forEach((van) => {
      if (belongsToCompany(van, activeCompanyId) && van.driverId === id) van.driverId = "";
    });
    draft.children.forEach((child) => {
      if (belongsToCompany(child, activeCompanyId) && child.driverId === id) child.driverId = "";
    });
    draft.liveTrackings = draft.liveTrackings.filter((live) => live.driverId !== id);
    draft.routePlans = draft.routePlans.filter((plan) => plan.driverId !== id);
    draft.driverDocuments = draft.driverDocuments.filter((document) => document.driverId !== id);
    draft.driverOccurrences = draft.driverOccurrences.filter((occurrence) => occurrence.driverId !== id);
    draft.trackingPoints = draft.trackingPoints.filter((point) => point.driverId !== id);
    draft.notifications = draft.notifications.filter((notification) => notification.driverId !== id);
    if (draft.liveTracking.driverId === id) draft.liveTracking = defaultLiveTracking();
  });

  return { db, error };
}

export function upsertVan(input: Partial<VanRecord> & { label: string; companyId?: string }) {
  let error = "";
  const db = mutateDb((draft) => {
    const companyId = resolveCompany(draft, input.companyId).id;
    const label = input.label.trim();
    if (!label) {
      error = "Informe o nome da van.";
      return;
    }

    const existing = input.id ? draft.vans.find((item) => item.id === input.id && belongsToCompany(item, companyId)) : null;
    const van: VanRecord = existing || {
      id: makeId("van"),
      companyId,
      label,
      plate: "",
      model: "",
      seats: 15,
      color: "#facc15",
      driverId: "",
      active: true,
      notes: "",
      createdAt: todayIso(),
    };

    van.label = label;
    van.companyId = companyId;
    van.plate = input.plate || "";
    van.model = input.model || "";
    van.seats = Math.max(1, Number(input.seats || 15));
    van.color = input.color || "#facc15";
    van.driverId = input.driverId || "";
    van.active = input.active ?? true;
    van.notes = input.notes || "";

    if (!existing) {
      draft.vans.push(van);
      draft.vanQrCodes.push({
        id: makeId("vanqr"),
        companyId,
        vanId: van.id,
        token: makeId("vanqr"),
        label: van.label,
        active: true,
        generatedAt: todayIso(),
      });
    }

    draft.drivers.filter((driver) => belongsToCompany(driver, companyId)).forEach((driver) => {
      if (driver.vanId === van.id && driver.id !== van.driverId) driver.vanId = "";
      if (van.driverId && driver.id === van.driverId) driver.vanId = van.id;
    });

    draft.vanQrCodes.forEach((qr) => {
      if (qr.vanId === van.id) qr.label = van.label;
    });
    draft.vanQrCode = draft.vanQrCodes[0] || draft.vanQrCode;
  });

  return { db, error };
}

export function deleteVan(id: string, companyId?: string) {
  let error = "";
  const db = mutateDb((draft) => {
    const activeCompanyId = resolveCompany(draft, companyId).id;
    const van = draft.vans.find((item) => item.id === id && belongsToCompany(item, activeCompanyId));
    if (!van) {
      error = "Van nao encontrada.";
      return;
    }

    draft.vans = draft.vans.filter((item) => item.id !== id);
    draft.vanQrCodes = draft.vanQrCodes.filter((qr) => qr.vanId !== id);
    draft.drivers.forEach((driver) => {
      if (belongsToCompany(driver, activeCompanyId) && driver.vanId === id) driver.vanId = "";
    });
    draft.children.forEach((child) => {
      if (!belongsToCompany(child, activeCompanyId) || child.vanId !== id) return;
      child.vanId = "";
      if (child.driverId === van.driverId) child.driverId = "";
    });
    draft.liveTrackings = draft.liveTrackings.filter((live) => live.vanId !== id);
    draft.routePlans = draft.routePlans.filter((plan) => plan.vanId !== id);
    draft.vehicleMaintenances = draft.vehicleMaintenances.filter((maintenance) => maintenance.vanId !== id);
    draft.fuelRecords = draft.fuelRecords.filter((fuel) => fuel.vanId !== id);
    draft.trackingPoints = draft.trackingPoints.filter((point) => point.vanId !== id);
    draft.vanQrCode = draft.vanQrCodes.find((qr) => belongsToCompany(qr, activeCompanyId)) || defaultVanQrCode();
    if (draft.liveTracking.vanId === id) draft.liveTracking = defaultLiveTracking();
  });

  return { db, error };
}

export function upsertDriverDocument(input: Partial<DriverDocumentRecord> & { driverId: string; label: string; companyId?: string }) {
  let error = "";
  const db = mutateDb((draft) => {
    const companyId = resolveCompany(draft, input.companyId).id;
    const driver = draft.drivers.find((item) => item.id === input.driverId && belongsToCompany(item, companyId));
    const existing = input.id
      ? draft.driverDocuments.find((item) => item.id === input.id && belongsToCompany(item, companyId))
      : undefined;
    if (!driver || !input.label.trim()) {
      error = "Informe motorista e nome do documento.";
      return;
    }
    if (input.id && !existing) {
      error = "Documento nao encontrado.";
      return;
    }
    const now = todayIso();
    const record = normalizeDriverDocument({
      ...existing,
      ...input,
      companyId,
      driverId: driver.id,
      label: input.label.trim(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    if (existing) Object.assign(existing, record);
    else draft.driverDocuments.unshift(record);
  });
  return { db, error };
}

export function upsertDriverOccurrence(input: Partial<DriverOccurrenceRecord> & { driverId: string; title: string; companyId?: string }) {
  let error = "";
  const db = mutateDb((draft) => {
    const companyId = resolveCompany(draft, input.companyId).id;
    const driver = draft.drivers.find((item) => item.id === input.driverId && belongsToCompany(item, companyId));
    const existing = input.id
      ? draft.driverOccurrences.find((item) => item.id === input.id && belongsToCompany(item, companyId))
      : undefined;
    if (!driver || !input.title.trim()) {
      error = "Informe motorista e titulo da ocorrencia.";
      return;
    }
    if (input.id && !existing) {
      error = "Ocorrencia nao encontrada.";
      return;
    }
    if (input.childId && !draft.children.some((child) => child.id === input.childId && belongsToCompany(child, companyId))) {
      error = "Aluno selecionado nao pertence a esta empresa.";
      return;
    }
    const now = todayIso();
    const record = normalizeDriverOccurrence({
      ...existing,
      ...input,
      companyId,
      driverId: driver.id,
      title: input.title.trim(),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    if (existing) Object.assign(existing, record);
    else draft.driverOccurrences.unshift(record);
  });
  return { db, error };
}

export function upsertVehicleMaintenance(input: Partial<VehicleMaintenanceRecord> & { vanId: string; title: string; companyId?: string }) {
  let error = "";
  const db = mutateDb((draft) => {
    const companyId = resolveCompany(draft, input.companyId).id;
    const van = draft.vans.find((item) => item.id === input.vanId && belongsToCompany(item, companyId));
    const existing = input.id
      ? draft.vehicleMaintenances.find((item) => item.id === input.id && belongsToCompany(item, companyId))
      : undefined;
    if (!van || !input.title.trim()) {
      error = "Informe veiculo e descricao da manutencao.";
      return;
    }
    if (input.id && !existing) {
      error = "Manutencao nao encontrada.";
      return;
    }
    const now = todayIso();
    const record = normalizeVehicleMaintenance({
      ...existing,
      ...input,
      companyId,
      vanId: van.id,
      title: input.title.trim(),
      completedAt: input.status === "completed" ? input.completedAt || now.slice(0, 10) : "",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    if (existing) Object.assign(existing, record);
    else draft.vehicleMaintenances.unshift(record);
  });
  return { db, error };
}

export function upsertFuelRecord(input: Partial<FuelRecord> & { vanId: string; companyId?: string }) {
  let error = "";
  const db = mutateDb((draft) => {
    const companyId = resolveCompany(draft, input.companyId).id;
    const van = draft.vans.find((item) => item.id === input.vanId && belongsToCompany(item, companyId));
    const existing = input.id
      ? draft.fuelRecords.find((item) => item.id === input.id && belongsToCompany(item, companyId))
      : undefined;
    if (!van || Number(input.liters || 0) <= 0 || Number(input.amount || 0) <= 0) {
      error = "Informe veiculo, litros e valor do abastecimento.";
      return;
    }
    if (input.id && !existing) {
      error = "Abastecimento nao encontrado.";
      return;
    }
    const now = todayIso();
    const record = normalizeFuelRecord({
      ...existing,
      ...input,
      companyId,
      vanId: van.id,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    if (existing) Object.assign(existing, record);
    else draft.fuelRecords.unshift(record);
  });
  return { db, error };
}

export function upsertExpense(input: Partial<ExpenseRecord> & { description: string; companyId?: string }) {
  let error = "";
  const db = mutateDb((draft) => {
    const companyId = resolveCompany(draft, input.companyId).id;
    const existing = input.id
      ? draft.expenses.find((item) => item.id === input.id && belongsToCompany(item, companyId))
      : undefined;
    if (!input.description.trim() || Number(input.amount || 0) <= 0) {
      error = "Informe descricao e valor da despesa.";
      return;
    }
    if (input.id && !existing) {
      error = "Despesa nao encontrada.";
      return;
    }
    const now = todayIso();
    const record = normalizeExpense({
      ...existing,
      ...input,
      companyId,
      description: input.description.trim(),
      paidAt: input.status === "paid" ? input.paidAt || now.slice(0, 10) : "",
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    });
    if (existing) Object.assign(existing, record);
    else draft.expenses.unshift(record);
  });
  return { db, error };
}

export function deleteOperationRecord(
  entity: "driverDocument" | "driverOccurrence" | "maintenance" | "fuel" | "expense",
  id: string,
  companyId?: string
) {
  let error = "";
  const db = mutateDb((draft) => {
    const activeCompanyId = resolveCompany(draft, companyId).id;
    const remove = <T extends { id: string; companyId?: string }>(items: T[]) => {
      if (!items.some((item) => item.id === id && belongsToCompany(item, activeCompanyId))) {
        error = "Registro nao encontrado.";
        return items;
      }
      return items.filter((item) => item.id !== id);
    };
    if (entity === "driverDocument") draft.driverDocuments = remove(draft.driverDocuments);
    if (entity === "driverOccurrence") draft.driverOccurrences = remove(draft.driverOccurrences);
    if (entity === "maintenance") draft.vehicleMaintenances = remove(draft.vehicleMaintenances);
    if (entity === "fuel") draft.fuelRecords = remove(draft.fuelRecords);
    if (entity === "expense") draft.expenses = remove(draft.expenses);
  });
  return { db, error };
}

export function assignChildTransport(input: {
  childId: string;
  driverId?: string;
  vanId?: string;
  shift?: Shift | "";
  companyId?: string;
}) {
  let error = "";
  const db = mutateDb((draft) => {
    const companyId = resolveCompany(draft, input.companyId).id;
    const child = draft.children.find((item) => item.id === input.childId && belongsToCompany(item, companyId));
    if (!child) {
      error = "Aluno nao encontrado.";
      return;
    }

    const van = input.vanId ? draft.vans.find((item) => item.id === input.vanId && belongsToCompany(item, companyId)) : null;
    const driver = input.driverId ? draft.drivers.find((item) => item.id === input.driverId && belongsToCompany(item, companyId)) : null;

    child.vanId = van?.id || "";
    child.driverId = driver?.id || van?.driverId || "";
    child.shift = shifts.includes(input.shift as Shift) ? input.shift as Shift : undefined;
  });

  return { db, error };
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
    const labels: Record<ChildAbsenceStatus, string> = {
      going: "vai normalmente",
      not_going: "nao vai hoje",
      not_returning: "nao volta hoje",
    };
    draft.notifications = [
      {
        id: makeId("notification"),
        companyId: child.companyId || DEFAULT_COMPANY_ID,
        parentId: child.parentId,
        childId: child.id,
        driverId: child.driverId,
        type: "absence" as const,
        title: "Situacao do transporte atualizada",
        message: `${child.name} ${labels[child.absenceStatus]}.`,
        createdAt: todayIso(),
        readAt: "",
      },
      ...draft.notifications,
    ].slice(0, 1200);
  });

  return { db, error };
}

export function regenerateVanQrCode(vanId = DEFAULT_VAN_ID, companyId?: string) {
  const targetVanId = vanId || DEFAULT_VAN_ID;
  return mutateDb((db) => {
    const activeCompanyId = resolveCompany(db, companyId).id;
    const van = db.vans.find((item) => item.id === targetVanId && belongsToCompany(item, activeCompanyId));
    const nextQr = {
      ...defaultVanQrCode(),
      id: makeId("vanqr"),
      companyId: activeCompanyId,
      vanId: targetVanId,
      label: van?.label || db.vanQrCode?.label || "Van principal",
      generatedAt: todayIso(),
    };

    db.vanQrCodes = [
      nextQr,
      ...db.vanQrCodes.filter((qr) => qr.vanId !== targetVanId),
    ];
    db.vanQrCode = db.vanQrCodes.find((qr) => belongsToCompany(qr, activeCompanyId)) || nextQr;
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
    const qr =
      draft.vanQrCodes.find((item) => item.active && item.token === input.token) ||
      (draft.vanQrCode.active && draft.vanQrCode.token === input.token ? draft.vanQrCode : null);

    if (!qr) {
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
      companyId: qr.companyId || child.companyId || parent.companyId || DEFAULT_COMPANY_ID,
      parentId: parent.id,
      childId: child.id,
      vanId: qr.vanId || child.vanId || "",
      driverId: child.driverId || draft.vans.find((van) => van.id === qr.vanId)?.driverId || "",
      type: input.type === "returning" ? "returning" : "boarding",
      scannedAt: todayIso(),
      latitude: input.latitude,
      longitude: input.longitude,
      accuracy: input.accuracy,
      token: input.token,
    };

    draft.checkins = [checkin, ...draft.checkins].slice(0, 600);
    const eventLabel = checkin.type === "returning" ? "desembarque" : "embarque";
    draft.notifications = [
      {
        id: makeId("notification"),
        companyId: checkin.companyId,
        parentId: parent.id,
        childId: child.id,
        driverId: checkin.driverId,
        type: (checkin.type === "returning" ? "checkout" : "checkin") as NotificationRecord["type"],
        title: `${eventLabel === "embarque" ? "Embarque" : "Desembarque"} confirmado`,
        message: `${child.name}: ${eventLabel} registrado as ${new Date(checkin.scannedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}.`,
        createdAt: checkin.scannedAt,
        readAt: "",
      },
      ...draft.notifications,
    ].slice(0, 1200);
  });

  return { db, checkin, error };
}

export function getDriverRoutePayload(driverId?: string) {
  const db = readDb();
  const driver = driverId ? db.drivers.find((item) => item.id === driverId && item.active) : null;
  const companyId = driver?.companyId || DEFAULT_COMPANY_ID;
  const driverVan = driver?.vanId
    ? db.vans.find((van) => van.id === driver.vanId && van.active && belongsToCompany(van, companyId))
    : null;
  const children = db.children.filter((child) => {
    if (!child.active || !belongsToCompany(child, companyId)) return false;
    if (!driver) return true;
    return child.driverId === driver.id || (!!driverVan && child.vanId === driverVan.id);
  });
  const childIds = new Set(children.map((child) => child.id));
  const liveTracking = driver ? getLiveTracking(driver.id) : visibleLive(db.liveTracking);
  const routePlan = driver
    ? db.routePlans
        .filter((plan) => plan.driverId === driver.id && belongsToCompany(plan, companyId))
        .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0] || null
    : null;

  return {
    settings: companySettings(db, companyId),
    driver: driver ? safeDriver(driver) : null,
    van: driverVan || null,
    liveTracking,
    schools: db.schools.filter((schoolItem) => schoolItem.active),
    parents: db.parents.filter((parent) => belongsToCompany(parent, companyId)).map(safeParent),
    children: children.map(safeChild),
    checkins: db.checkins.filter((checkin) => childIds.has(checkin.childId) && belongsToCompany(checkin, companyId)).slice(0, 80),
    vanQrCode: driverVan
      ? db.vanQrCodes.find((qr) => qr.vanId === driverVan.id && belongsToCompany(qr, companyId)) || ensureCompanyOnQr(db.vanQrCode, companyId)
      : ensureCompanyOnQr(db.vanQrCode, companyId),
    routePlan,
    documents: driver
      ? db.driverDocuments.filter((document) => document.driverId === driver.id && document.active)
      : [],
    occurrences: driver
      ? db.driverOccurrences.filter((occurrence) => occurrence.driverId === driver.id).slice(0, 50)
      : [],
    notifications: driver
      ? db.notifications.filter((notification) => notification.driverId === driver.id).slice(0, 100)
      : [],
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
    const driver = input.driverId
      ? db.drivers.find((item) => item.id === input.driverId)
      : db.drivers.find((item) => item.vanId === input.vanId) || db.drivers[0];
    const companyId = input.companyId || driver?.companyId || DEFAULT_COMPANY_ID;
    const vanId = input.vanId || driver?.vanId || db.vans[0]?.id || DEFAULT_VAN_ID;
    const driverName = driver?.name || input.driverName || companySettings(db, companyId).driverName;
    const current =
      db.liveTrackings.find((item) => belongsToCompany(item, companyId) && (item.driverId === driver?.id || item.vanId === vanId)) ||
      db.liveTracking ||
      defaultLiveTracking();
    const updated: LiveTrackingState = {
      ...current,
      ...input,
      id: current.id || makeId("live"),
      companyId,
      driverId: driver?.id || input.driverId || current.driverId,
      vanId,
      active: input.active ?? current.active,
      driverName,
      startedAt: input.active && !current.active ? now : current.startedAt || now,
      lastSeenAt: input.active === false ? current.lastSeenAt : now,
      currentNeighborhood: input.currentNeighborhood || current.currentNeighborhood,
      nextStop: input.nextStop || current.nextStop,
      estimatedMinutes: Number(input.estimatedMinutes ?? current.estimatedMinutes ?? 0),
      source: input.source || current.source || "gps",
    };

    db.liveTrackings = [
      updated,
      ...db.liveTrackings.filter((item) => item.id !== updated.id && item.driverId !== updated.driverId && item.vanId !== updated.vanId),
    ];
    db.liveTracking = updated;

    if (
      updated.active &&
      typeof updated.latitude === "number" &&
      typeof updated.longitude === "number"
    ) {
      const previousPoint = db.trackingPoints.find(
        (point) => point.liveTrackingId === updated.id || (updated.driverId && point.driverId === updated.driverId)
      );
      const ageSeconds = previousPoint
        ? (Date.now() - new Date(previousPoint.recordedAt).getTime()) / 1000
        : Number.POSITIVE_INFINITY;
      const moved = previousPoint
        ? Math.hypot(previousPoint.latitude - updated.latitude, previousPoint.longitude - updated.longitude)
        : Number.POSITIVE_INFINITY;
      if (ageSeconds >= 20 || moved >= 0.00008) {
        db.trackingPoints = [
          {
            id: makeId("tracking"),
            companyId,
            liveTrackingId: updated.id,
            driverId: updated.driverId,
            vanId: updated.vanId,
            latitude: updated.latitude,
            longitude: updated.longitude,
            accuracy: updated.accuracy,
            speed: updated.speed,
            neighborhood: updated.currentNeighborhood,
            recordedAt: now,
          },
          ...db.trackingPoints,
        ].slice(0, 5000);
      }
    }
  });
}

function childAddressLine(child: ChildRecord) {
  const address = [
    child.address.street,
    child.address.number,
    child.address.neighborhood,
    child.address.city || "Toledo",
    child.address.state || "PR",
  ].filter(Boolean);

  return address.join(", ") || "Endereco nao informado";
}

function sortChildrenForRoute(children: ChildRecord[]) {
  const withCoordinates = children.filter(
    (child) => typeof child.address.latitude === "number" && typeof child.address.longitude === "number"
  );

  if (withCoordinates.length >= 2) {
    const remaining = [...children];
    const ordered: ChildRecord[] = [];
    let cursor = { latitude: -24.7249, longitude: -53.7419 };

    while (remaining.length) {
      remaining.sort((a, b) => distanceFrom(cursor, a) - distanceFrom(cursor, b));
      const next = remaining.shift();
      if (!next) break;
      ordered.push(next);
      if (typeof next.address.latitude === "number" && typeof next.address.longitude === "number") {
        cursor = { latitude: next.address.latitude, longitude: next.address.longitude };
      }
    }

    return ordered;
  }

  return [...children].sort((a, b) => {
    const left = `${a.address.neighborhood} ${a.address.street} ${a.name}`.trim();
    const right = `${b.address.neighborhood} ${b.address.street} ${b.name}`.trim();
    return left.localeCompare(right, "pt-BR");
  });
}

function distanceFrom(cursor: { latitude: number; longitude: number }, child: ChildRecord) {
  if (typeof child.address.latitude !== "number" || typeof child.address.longitude !== "number") return Number.MAX_SAFE_INTEGER;
  return Math.hypot(cursor.latitude - child.address.latitude, cursor.longitude - child.address.longitude);
}

export function generateRoutePlan(input: { driverId: string; companyId?: string }) {
  let error = "";
  let routePlan: RoutePlanRecord | null = null;

  const db = mutateDb((draft) => {
    const driver = draft.drivers.find(
      (item) => item.id === input.driverId && item.active && (!input.companyId || belongsToCompany(item, input.companyId))
    );
    if (!driver) {
      error = "Motorista nao encontrado.";
      return;
    }

    const companyId = driver.companyId || input.companyId || DEFAULT_COMPANY_ID;
    const van = driver.vanId
      ? draft.vans.find((item) => item.id === driver.vanId && item.active && belongsToCompany(item, companyId))
      : null;
    const students = draft.children.filter((child) => {
      if (!child.active || !belongsToCompany(child, companyId) || child.absenceStatus === "not_going") return false;
      return child.driverId === driver.id || (!!van && child.vanId === van.id);
    });
    const parentsById = new Map(draft.parents.map((parent) => [parent.id, parent]));
    const schoolsById = new Map(draft.schools.map((schoolItem) => [schoolItem.id, schoolItem]));
    const ordered = sortChildrenForRoute(students);
    const provider = resolveCompany(draft, companyId).settings.routeApiKey ? "external-api" : "local-ai";

    routePlan = {
      id: makeId("routeplan"),
      companyId,
      driverId: driver.id,
      vanId: van?.id || driver.vanId || "",
      provider,
      summary:
        ordered.length === 0
          ? "Nenhum aluno ativo para montar rota agora."
          : provider === "external-api"
            ? "Sugestao pronta para validar em API externa de rotas cadastrada pela empresa."
            : "Sugestao local criada com base nos bairros, enderecos e localizacoes salvas dos alunos.",
      totalEstimatedMinutes: ordered.length ? ordered.length * 7 + 8 : 0,
      generatedAt: todayIso(),
      stops: ordered.map((child, index) => ({
        childId: child.id,
        childName: child.name,
        parentName: parentsById.get(child.parentId)?.name || "Responsavel",
        address: childAddressLine(child),
        neighborhood: child.address.neighborhood || "Bairro nao informado",
        schoolName: schoolsById.get(child.schoolId)?.name || "Escola",
        status: child.absenceStatus,
        estimatedMinutes: (index + 1) * 7,
      })),
    };

    draft.routePlans = [
      routePlan,
      ...draft.routePlans.filter((plan) => !(plan.driverId === driver.id && belongsToCompany(plan, companyId))).slice(0, 30),
    ];
  });

  return { db, error, routePlan };
}

function renderContractTemplate(
  template: string,
  company: CompanyRecord,
  parent: ParentRecord,
  child: ChildRecord,
  schoolName: string,
  signature = "Aguardando assinatura"
) {
  return template
    .replaceAll("{{empresa}}", company.settings.businessName || company.name)
    .replaceAll("{{responsavel}}", parent.name)
    .replaceAll("{{aluno}}", child.name)
    .replaceAll("{{escola}}", schoolName)
    .replaceAll("{{assinatura}}", signature);
}

export function updateContractTemplate(companyId: string | undefined, template: string) {
  let error = "";
  const db = mutateDb((draft) => {
    const company = resolveCompany(draft, companyId);
    const nextTemplate = template.trim();

    if (nextTemplate.length < 40) {
      error = "Escreva um contrato com pelo menos 40 caracteres.";
      return;
    }

    company.contractTemplate = nextTemplate;
  });

  return { db, error };
}

export function createContract(input: { companyId?: string; parentId: string; childId: string; title?: string }) {
  let error = "";
  let contract: ContractRecord | null = null;

  const db = mutateDb((draft) => {
    const company = resolveCompany(draft, input.companyId);
    const parent = draft.parents.find((item) => item.id === input.parentId && belongsToCompany(item, company.id));
    const child = draft.children.find(
      (item) => item.id === input.childId && item.parentId === input.parentId && belongsToCompany(item, company.id)
    );

    if (!parent || !child) {
      error = "Responsavel ou aluno nao encontrado.";
      return;
    }

    const schoolName = draft.schools.find((schoolItem) => schoolItem.id === child.schoolId)?.name || "Escola";
    contract = {
      id: makeId("contract"),
      companyId: company.id,
      parentId: parent.id,
      childId: child.id,
      title: input.title?.trim() || `Contrato - ${child.name}`,
      content: renderContractTemplate(company.contractTemplate, company, parent, child, schoolName),
      status: "sent",
      createdAt: todayIso(),
    };

    draft.contracts = [contract, ...draft.contracts];
  });

  return { db, error, contract };
}

export function getContract(id: string) {
  const db = readDb();
  const contract = db.contracts.find((item) => item.id === id);
  if (!contract) return null;
  const company = resolveCompany(db, contract.companyId);
  const parent = db.parents.find((item) => item.id === contract.parentId);
  const child = db.children.find((item) => item.id === contract.childId);

  return {
    contract,
    company: safeCompany(company),
    parent: parent ? safeParent(parent) : null,
    child: child || null,
  };
}

export function signContract(input: { id: string; signerName: string; signerDocument: string }) {
  let error = "";
  let contract: ContractRecord | null = null;

  const db = mutateDb((draft) => {
    const found = draft.contracts.find((item) => item.id === input.id);
    if (!found) {
      error = "Contrato nao encontrado.";
      return;
    }

    const signerName = input.signerName.trim();
    const signerDocument = normalizeDigits(input.signerDocument);
    if (!signerName || signerDocument.length < 11) {
      error = "Informe nome completo e CPF/CNPJ para assinar.";
      return;
    }

    found.status = "signed";
    found.signerName = signerName;
    found.signerDocument = signerDocument;
    found.signedAt = todayIso();
    found.content = found.content.replaceAll("Aguardando assinatura", signerName);
    contract = found;
  });

  return { db, error, contract };
}
