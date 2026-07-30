export type UserRole = "admin" | "company" | "parent" | "driver";

export type PaymentStatus =
  | "pending_proof"
  | "proof_received"
  | "approved"
  | "rejected";

export type Shift = "manha" | "tarde" | "noite";

export type ChildAbsenceStatus = "going" | "not_going" | "not_returning";

export type CheckinType = "boarding" | "returning";

export type SchoolCategory =
  | "cmei"
  | "municipal"
  | "estadual"
  | "particular"
  | "faculdade";

export type ThemeSettings = {
  navy: string;
  navy2: string;
  ink: string;
  mute: string;
  mist: string;
  cloud: string;
  sun: string;
  sun2: string;
  ok: string;
};

export type CompanySettings = {
  brandName: string;
  businessName: string;
  document: string;
  driverName: string;
  phone: string;
  whatsapp: string;
  pixKey: string;
  pixHolder: string;
  pixBank: string;
  receiptText: string;
  routeApiProvider?: string;
  routeApiKey?: string;
};

export type CompanyRecord = {
  id: string;
  name: string;
  document: string;
  documentHash: string;
  documentLast4: string;
  passwordHash: string;
  active: boolean;
  settings: CompanySettings;
  theme: ThemeSettings;
  contractTemplate: string;
  createdAt: string;
};

export type SafeCompanyRecord = Omit<CompanyRecord, "documentHash" | "passwordHash" | "settings"> & {
  settings: Omit<CompanySettings, "routeApiKey"> & {
    routeApiProvider?: string;
    hasRouteApiKey?: boolean;
  };
};

export type SchoolRecord = {
  id: string;
  name: string;
  city: string;
  category: SchoolCategory;
  address: string;
  neighborhood: string;
  shift: string;
  served: boolean;
  servedShifts: Shift[];
  active: boolean;
  createdAt: string;
};

export type NeighborhoodRecord = {
  id: string;
  name: string;
  area: string;
  served: boolean;
  color: string;
  position: {
    x: number;
    y: number;
  };
  notes: string;
  createdAt: string;
};

export type LiveTrackingState = {
  id: string;
  companyId?: string;
  driverId?: string;
  vanId?: string;
  active: boolean;
  driverName: string;
  startedAt: string;
  lastSeenAt: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  speed?: number;
  currentNeighborhood: string;
  nextStop: string;
  estimatedMinutes: number;
  source: "gps" | "manual";
};

export type AdminUser = {
  id: string;
  name: string;
  login: string;
  contact: string;
  passwordHash: string;
  createdAt: string;
};

export type AdminAccessRecord = {
  id: string;
  name: string;
  login: string;
};

export type ParentRecord = {
  id: string;
  companyId?: string;
  name: string;
  contact: string;
  email: string;
  cpfHash: string;
  cpfLast4: string;
  active: boolean;
  createdAt: string;
};

export type SafeParentRecord = Omit<ParentRecord, "cpfHash">;

export type DriverRecord = {
  id: string;
  companyId?: string;
  name: string;
  contact: string;
  cpfHash: string;
  cpfLast4: string;
  license: string;
  vanId: string;
  active: boolean;
  createdAt: string;
};

export type SafeDriverRecord = Omit<DriverRecord, "cpfHash">;

export type VanRecord = {
  id: string;
  companyId?: string;
  label: string;
  plate: string;
  model: string;
  seats: number;
  color: string;
  driverId: string;
  active: boolean;
  notes: string;
  createdAt: string;
};

export type AddressRecord = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude?: number;
  longitude?: number;
};

export type ChildRecord = {
  id: string;
  companyId?: string;
  parentId: string;
  driverId?: string;
  vanId?: string;
  shift?: Shift;
  name: string;
  cpfHash: string;
  cpfLast4: string;
  birthDate: string;
  schoolId: string;
  grade: string;
  responsiblePhone: string;
  address: AddressRecord;
  notes: string;
  absenceStatus: ChildAbsenceStatus;
  absenceDate: string;
  absenceUpdatedAt: string;
  active: boolean;
  createdAt: string;
};

export type VanQrCodeRecord = {
  id: string;
  companyId?: string;
  vanId?: string;
  token: string;
  label: string;
  active: boolean;
  generatedAt: string;
};

export type CheckinRecord = {
  id: string;
  companyId?: string;
  parentId: string;
  childId: string;
  vanId?: string;
  driverId?: string;
  type: CheckinType;
  scannedAt: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  token: string;
};

export type PaymentProof = {
  fileName: string;
  fileType: string;
  fileData: string;
  uploadedAt: string;
};

export type ReceiptRecord = {
  number: string;
  generatedAt: string;
  companyName: string;
  pixKey: string;
  payerName: string;
  childName: string;
  amount: number;
  month: string;
  note: string;
};

export type PaymentRecord = {
  id: string;
  companyId?: string;
  parentId: string;
  childId: string;
  month: string;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  proof?: PaymentProof;
  receipt?: ReceiptRecord;
  createdAt: string;
};

export type ContractRecord = {
  id: string;
  companyId?: string;
  parentId: string;
  childId: string;
  title: string;
  content: string;
  status: "draft" | "sent" | "signed";
  signerName?: string;
  signerDocument?: string;
  signedAt?: string;
  createdAt: string;
};

export type RoutePlanStop = {
  childId: string;
  childName: string;
  parentName: string;
  address: string;
  neighborhood: string;
  schoolName: string;
  status: ChildAbsenceStatus;
  estimatedMinutes: number;
};

export type RoutePlanRecord = {
  id: string;
  companyId?: string;
  driverId: string;
  vanId?: string;
  provider: "local-ai" | "external-api";
  summary: string;
  totalEstimatedMinutes: number;
  generatedAt: string;
  stops: RoutePlanStop[];
};

export type AppDatabase = {
  settings: CompanySettings;
  theme: ThemeSettings;
  companies: CompanyRecord[];
  currentCompanyId?: string;
  schools: SchoolRecord[];
  removedSchoolIds: string[];
  neighborhoods: NeighborhoodRecord[];
  removedNeighborhoodIds: string[];
  liveTracking: LiveTrackingState;
  liveTrackings: LiveTrackingState[];
  vanQrCode: VanQrCodeRecord;
  vanQrCodes: VanQrCodeRecord[];
  admins: AdminUser[];
  drivers: DriverRecord[];
  vans: VanRecord[];
  parents: ParentRecord[];
  children: ChildRecord[];
  checkins: CheckinRecord[];
  payments: PaymentRecord[];
  contracts: ContractRecord[];
  routePlans: RoutePlanRecord[];
};

export type SessionUser = {
  id: string;
  role: UserRole;
  name: string;
  contact: string;
  companyId?: string;
};

export type ParentDashboardPayload = {
  settings: CompanySettings;
  theme: ThemeSettings;
  schools: SchoolRecord[];
  neighborhoods: NeighborhoodRecord[];
  liveTracking: LiveTrackingState;
  liveTrackings: LiveTrackingState[];
  parent: SafeParentRecord;
  children: ChildRecord[];
  checkins: CheckinRecord[];
  payments: PaymentRecord[];
  contracts: ContractRecord[];
};

export type AdminPayload = {
  adminAccess: AdminAccessRecord;
  currentCompany?: SafeCompanyRecord;
  companies: SafeCompanyRecord[];
  settings: CompanySettings;
  theme: ThemeSettings;
  schools: SchoolRecord[];
  neighborhoods: NeighborhoodRecord[];
  liveTracking: LiveTrackingState;
  liveTrackings: LiveTrackingState[];
  vanQrCode: VanQrCodeRecord;
  vanQrCodes: VanQrCodeRecord[];
  drivers: SafeDriverRecord[];
  vans: VanRecord[];
  parents: SafeParentRecord[];
  children: ChildRecord[];
  checkins: CheckinRecord[];
  payments: PaymentRecord[];
  contracts: ContractRecord[];
  routePlans: RoutePlanRecord[];
};
