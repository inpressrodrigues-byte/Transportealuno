export type UserRole = "admin" | "company" | "parent" | "child" | "driver";

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

export type SiteAssetSettings = {
  url: string;
  storagePath: string;
  storageProvider: "supabase" | "vercel-blob" | "";
  fileName: string;
  contentType: string;
  updatedAt: string;
};

export type SiteTextItem = {
  id: string;
  title: string;
  detail: string;
};

export type SiteSpecItem = {
  id: string;
  label: string;
  value: string;
};

export type SiteTestimonialItem = {
  id: string;
  name: string;
  role: string;
  quote: string;
};

export type SiteFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SiteContentSettings = {
  navigation: {
    home: string;
    about: string;
    neighborhoods: string;
    schools: string;
    safety: string;
    contact: string;
    clientArea: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    subtitle: string;
    description: string;
    primaryButton: string;
    secondaryButton: string;
  };
  driver: {
    eyebrow: string;
    title: string;
    description: string;
    photoAlt: string;
  };
  driverHighlights: SiteTextItem[];
  van: {
    eyebrow: string;
    title: string;
  };
  vanSpecs: SiteSpecItem[];
  vanFeatures: SiteTextItem[];
  schools: {
    eyebrow: string;
    title: string;
    button: string;
  };
  neighborhoods: {
    eyebrow: string;
    title: string;
    description: string;
    listTitle: string;
    emptyText: string;
  };
  safety: {
    eyebrow: string;
    title: string;
    description: string;
  };
  safetyItems: SiteTextItem[];
  testimonials: {
    eyebrow: string;
    title: string;
  };
  testimonialItems: SiteTestimonialItem[];
  faq: {
    eyebrow: string;
    title: string;
  };
  faqItems: SiteFaqItem[];
  contact: {
    eyebrow: string;
    title: string;
    kicker: string;
    headline: string;
    description: string;
    callButton: string;
    city: string;
    socialLabel: string;
    instagramUrl: string;
    facebookUrl: string;
    phoneLabel: string;
    whatsappLabel: string;
    cityLabel: string;
  };
  footer: {
    description: string;
    navigationTitle: string;
    institutionalTitle: string;
    clientAreaTitle: string;
    clientAreaDescription: string;
    clientAreaButton: string;
    rightsText: string;
    documentPrefix: string;
  };
  businessCard: {
    button: string;
    eyebrow: string;
    title: string;
    description: string;
    openButton: string;
    shareButton: string;
    backButton: string;
    unavailableText: string;
    copiedText: string;
  };
  assistant: {
    subtitle: string;
    greeting: string;
    startButton: string;
    initialHint: string;
    shiftQuestion: string;
    nameLabel: string;
    phoneLabel: string;
    schoolQuestion: string;
    selectPlaceholder: string;
    otherSchoolOption: string;
    customSchoolLabel: string;
    neighborhoodLabel: string;
    customSchoolUnavailable: string;
    schoolRequired: string;
    schoolShiftUnavailable: string;
    neighborhoodRequired: string;
    neighborhoodUnavailable: string;
    available: string;
    sendButton: string;
    sentButton: string;
    messageIntro: string;
  };
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
  monthlyFeeDefault: number;
  monthlyDueDay: number;
  automaticMonthlyBilling: boolean;
  routeApiProvider?: string;
  routeApiKey?: string;
  siteContent: SiteContentSettings;
  businessCard: SiteAssetSettings;
  driverPhoto: SiteAssetSettings;
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

export type GalleryPhotoRecord = {
  id: string;
  companyId?: string;
  url: string;
  storagePath: string;
  storageProvider: "supabase" | "vercel-blob";
  caption: string;
  alt: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
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
  estimatedArrivalAt?: string;
  estimateSource?: "smart" | "manual";
  distanceToNextStopKm?: number;
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
export type SafeChildRecord = Omit<ChildRecord, "cpfHash">;

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
  chargeEnabled: boolean;
  automatic: boolean;
  paymentMethod: "pix" | "boleto" | "card" | "cash";
  externalReference: string;
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

export type DriverDocumentRecord = {
  id: string;
  companyId?: string;
  driverId: string;
  type: "cnh" | "curso" | "exame" | "outro";
  label: string;
  documentNumber: string;
  issuedAt: string;
  expiresAt: string;
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DriverOccurrenceRecord = {
  id: string;
  companyId?: string;
  driverId: string;
  childId?: string;
  occurredAt: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  resolved: boolean;
  resolution: string;
  createdAt: string;
  updatedAt: string;
};

export type VehicleMaintenanceRecord = {
  id: string;
  companyId?: string;
  vanId: string;
  type: "maintenance" | "ipva" | "insurance" | "revision" | "tires" | "other";
  title: string;
  dueDate: string;
  completedAt: string;
  odometer: number;
  cost: number;
  status: "pending" | "completed";
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type FuelRecord = {
  id: string;
  companyId?: string;
  vanId: string;
  filledAt: string;
  liters: number;
  amount: number;
  odometer: number;
  station: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseRecord = {
  id: string;
  companyId?: string;
  category: "fuel" | "maintenance" | "tax" | "insurance" | "payroll" | "other";
  description: string;
  amount: number;
  dueDate: string;
  paidAt: string;
  status: "pending" | "paid";
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type TrackingPointRecord = {
  id: string;
  companyId?: string;
  liveTrackingId: string;
  driverId?: string;
  vanId?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  neighborhood: string;
  recordedAt: string;
};

export type NotificationRecord = {
  id: string;
  companyId?: string;
  parentId?: string;
  childId?: string;
  driverId?: string;
  type: "checkin" | "checkout" | "absence" | "payment" | "route" | "alert";
  title: string;
  message: string;
  createdAt: string;
  readAt: string;
};

export type AuditLogRecord = {
  id: string;
  companyId?: string;
  actorRole: UserRole | "system";
  actorName: string;
  action: "created" | "updated" | "deleted";
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
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
  galleryPhotos: GalleryPhotoRecord[];
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
  driverDocuments: DriverDocumentRecord[];
  driverOccurrences: DriverOccurrenceRecord[];
  vehicleMaintenances: VehicleMaintenanceRecord[];
  fuelRecords: FuelRecord[];
  expenses: ExpenseRecord[];
  trackingPoints: TrackingPointRecord[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogRecord[];
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
  children: SafeChildRecord[];
  checkins: CheckinRecord[];
  payments: PaymentRecord[];
  contracts: ContractRecord[];
  trackingHistory: TrackingPointRecord[];
  notifications: NotificationRecord[];
};

export type StudentDashboardPayload = {
  settings: Omit<CompanySettings, "routeApiKey">;
  theme: ThemeSettings;
  schools: SchoolRecord[];
  neighborhoods: NeighborhoodRecord[];
  liveTracking: LiveTrackingState;
  liveTrackings: LiveTrackingState[];
  parent: SafeParentRecord;
  child: SafeChildRecord;
  checkins: CheckinRecord[];
  payments: PaymentRecord[];
  contracts: ContractRecord[];
  trackingHistory: TrackingPointRecord[];
  notifications: NotificationRecord[];
};

export type AdminPayload = {
  storage: {
    durable: boolean;
    provider: "supabase" | "vercel-blob" | "temporary";
    healthy?: boolean;
    automaticBackups?: boolean;
    message?: string;
  };
  adminAccess: AdminAccessRecord;
  currentCompany?: SafeCompanyRecord;
  companies: SafeCompanyRecord[];
  settings: CompanySettings;
  theme: ThemeSettings;
  schools: SchoolRecord[];
  neighborhoods: NeighborhoodRecord[];
  galleryPhotos: GalleryPhotoRecord[];
  liveTracking: LiveTrackingState;
  liveTrackings: LiveTrackingState[];
  vanQrCode: VanQrCodeRecord;
  vanQrCodes: VanQrCodeRecord[];
  drivers: SafeDriverRecord[];
  vans: VanRecord[];
  parents: SafeParentRecord[];
  children: SafeChildRecord[];
  checkins: CheckinRecord[];
  payments: PaymentRecord[];
  contracts: ContractRecord[];
  routePlans: RoutePlanRecord[];
  driverDocuments: DriverDocumentRecord[];
  driverOccurrences: DriverOccurrenceRecord[];
  vehicleMaintenances: VehicleMaintenanceRecord[];
  fuelRecords: FuelRecord[];
  expenses: ExpenseRecord[];
  trackingPoints: TrackingPointRecord[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogRecord[];
};
