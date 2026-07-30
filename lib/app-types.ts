export type UserRole = "admin" | "parent";

export type PaymentStatus =
  | "pending_proof"
  | "proof_received"
  | "approved"
  | "rejected";

export type Shift = "manha" | "tarde" | "noite";

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
  contact: string;
  passwordHash: string;
  createdAt: string;
};

export type ParentRecord = {
  id: string;
  name: string;
  contact: string;
  email: string;
  cpfHash: string;
  cpfLast4: string;
  active: boolean;
  createdAt: string;
};

export type SafeParentRecord = Omit<ParentRecord, "cpfHash">;

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
  parentId: string;
  name: string;
  birthDate: string;
  schoolId: string;
  grade: string;
  responsiblePhone: string;
  address: AddressRecord;
  notes: string;
  active: boolean;
  createdAt: string;
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

export type AppDatabase = {
  settings: CompanySettings;
  theme: ThemeSettings;
  schools: SchoolRecord[];
  neighborhoods: NeighborhoodRecord[];
  liveTracking: LiveTrackingState;
  admins: AdminUser[];
  parents: ParentRecord[];
  children: ChildRecord[];
  payments: PaymentRecord[];
};

export type SessionUser = {
  id: string;
  role: UserRole;
  name: string;
  contact: string;
};

export type ParentDashboardPayload = {
  settings: CompanySettings;
  theme: ThemeSettings;
  schools: SchoolRecord[];
  neighborhoods: NeighborhoodRecord[];
  liveTracking: LiveTrackingState;
  parent: SafeParentRecord;
  children: ChildRecord[];
  payments: PaymentRecord[];
};

export type AdminPayload = {
  settings: CompanySettings;
  theme: ThemeSettings;
  schools: SchoolRecord[];
  neighborhoods: NeighborhoodRecord[];
  liveTracking: LiveTrackingState;
  parents: SafeParentRecord[];
  children: ChildRecord[];
  payments: PaymentRecord[];
};
