export type UserRole = "owner" | "professor" | "student";
export type Belt = "Branca" | "Azul" | "Roxa" | "Marrom" | "Preta" | "Coral" | "Vermelha";
export type AuthUser = {
  id: string;
  email: string | null;
};

export type SignUpResult = {
  user: AuthUser;
  /** True if session was created immediately (email confirmation disabled) */
  hasSession: boolean;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  expiresAt: number | null;
};

export type Sex = "M" | "F" | "O" | "N"; // Male, Female, Other, Not specified

export type Profile = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  role: UserRole | null;
  avatarUrl: string | null;
  currentBelt: Belt | null;
  beltDegree: number | null;
  birthDate: string | null;
  sex: Sex | null;
  federationNumber: string | null;
  createdAt: string | null;
};

export type Academy = {
  id: string;
  ownerId: string;
  name: string;
  city: string | null;
  inviteCode: string;
  logoUrl: string | null;
  createdAt: string | null;
};

export type AcademyMember = {
  academyId: string;
  userId: string;
  joinedAt: string | null;
};

export type ClassScheduleItem = {
  id: string;
  academyId: string;
  title: string;
  instructorId: string | null;
  instructorName: string | null;
  weekday: number;
  startTime: string;
  endTime: string;
  location: string | null;
  level: string | null;
  notes: string | null;
  isRecurring: boolean;
  startDate: string | null;
};

export type AcademyClass = ClassScheduleItem & {
  createdAt: string | null;
};

export type CheckinStatus = "pending" | "approved" | "rejected";

export type ClassCheckin = {
  id: string;
  academyId: string;
  classId: string;
  studentId: string;
  status: CheckinStatus;
  validatedBy: string | null;
  validatedAt: string | null;
  createdAt: string | null;
};

export type CheckinListItem = {
  id: string;
  academyId: string;
  classId: string;
  classTitle: string | null;
  classWeekday: number | null;
  classStartTime: string | null;
  studentId: string;
  studentName: string | null;
  studentAvatarUrl: string | null;
  status: CheckinStatus;
  createdAt: string | null;
};

export type MemberProfile = {
  userId: string;
  fullName: string | null;
  email: string | null;
  currentBelt: Belt | null;
  beltDegree: number | null;
  avatarUrl: string | null;
  joinedAt: string | null;
};

export type ProfileUpsertInput = {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  role?: UserRole | null;
  avatarUrl?: string | null;
  currentBelt?: Belt | null;
  beltDegree?: number | null;
  birthDate?: string | null;
  sex?: Sex | null;
  federationNumber?: string | null;
};

export type CreateClassInput = {
  academyId: string;
  title: string;
  instructorId?: string | null;
  instructorName?: string | null;
  weekday: number;
  startTime: string;
  endTime: string;
  location?: string | null;
  level?: string | null;
  notes?: string | null;
  isRecurring?: boolean;
  startDate?: string | null;
};

export type UpdateClassInput = {
  id: string;
  title?: string;
  instructorId?: string | null;
  instructorName?: string | null;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  location?: string | null;
  level?: string | null;
  notes?: string | null;
  isRecurring?: boolean;
  startDate?: string | null;
};

export type CreateCheckinInput = {
  academyId: string;
  classId: string;
  studentId: string;
};

export type UpdateCheckinStatusInput = {
  id: string;
  status: CheckinStatus;
  validatedBy: string;
};

export type CreateAcademyInput = {
  ownerId: string;
  name: string;
  city?: string | null;
  inviteCode: string;
  logoUrl?: string | null;
};

export type AddMemberInput = {
  academyId: string;
  userId: string;
};

// ──────────────────────────────────────────────
// Subscriptions (B2B - Academies)
// ──────────────────────────────────────────────

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";
export type PaymentGateway = "pix_auto" | "stripe";
export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "refunded";
export type WebhookStatus = "pending" | "processing" | "processed" | "failed" | "skipped";

export type SubscriptionPlan = {
  id: string;
  name: string;
  slug: SubscriptionPlanSlug;
  description: string | null;
  priceMonthly: number;
  priceYearly: number | null;
  currency: string | null;
  maxStudents: number | null;
  maxProfessors: number | null;
  maxLocations: number | null;
  features: unknown[];
  isActive: boolean | null;
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Subscription = {
  id: string;
  academyId: string;
  planId: string;
  status: SubscriptionStatus;

  trialStartDate: string | null;
  trialEndDate: string | null;

  paymentGateway: PaymentGateway | null;

  pixAuthorizationId: string | null;
  pixRecurrenceId: string | null;
  pixCustomerCpf: string | null;
  pixCustomerName: string | null;

  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;

  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;

  canceledAt: string | null;
  cancelAtPeriodEnd: boolean | null;
  cancelReason: string | null;

  metadata: Record<string, unknown> | null;

  createdAt: string | null;
  updatedAt: string | null;
};

export type PaymentHistory = {
  id: string;
  subscriptionId: string;
  academyId: string;

  amount: number;
  currency: string | null;

  paymentGateway: PaymentGateway;
  gatewayPaymentId: string | null;
  gatewayChargeId: string | null;
  gatewayInvoiceId: string | null;

  status: PaymentStatus;

  paymentMethod: string | null;
  failureReason: string | null;
  failureCode: string | null;

  periodStart: string | null;
  periodEnd: string | null;

  paidAt: string | null;
  createdAt: string | null;
};

export type WebhookEvent = {
  id: string;

  gateway: PaymentGateway;

  eventId: string;
  eventType: string;

  payload: Record<string, unknown>;
  headers: Record<string, unknown> | null;

  status: WebhookStatus;
  processedAt: string | null;
  errorMessage: string | null;
  retryCount: number | null;
  nextRetryAt: string | null;

  receivedAt: string | null;
  createdAt: string | null;
};

export type SubscriptionPlanSlug = "starter" | "pro" | "business";

export type CreateSubscriptionPlanInput = {
  name: string;
  slug: SubscriptionPlanSlug;
  description?: string | null;
  priceMonthly: number;
  priceYearly?: number | null;
  currency?: string | null;
  maxStudents?: number | null;
  maxProfessors?: number | null;
  maxLocations?: number | null;
  features?: unknown[];
  isActive?: boolean;
  stripePriceIdMonthly?: string | null;
  stripePriceIdYearly?: string | null;
};

export type UpdateSubscriptionPlanInput = {
  id: string;
  name?: string;
  slug?: SubscriptionPlanSlug;
  description?: string | null;
  priceMonthly?: number;
  priceYearly?: number | null;
  currency?: string | null;
  maxStudents?: number | null;
  maxProfessors?: number | null;
  maxLocations?: number | null;
  features?: unknown[];
  isActive?: boolean;
  stripePriceIdMonthly?: string | null;
  stripePriceIdYearly?: string | null;
};

export type CreateSubscriptionInput = {
  academyId: string;
  planId: string;
  status?: SubscriptionStatus;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  paymentGateway?: PaymentGateway | null;
  pixAuthorizationId?: string | null;
  pixRecurrenceId?: string | null;
  pixCustomerCpf?: string | null;
  pixCustomerName?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  canceledAt?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelReason?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type UpdateSubscriptionInput = {
  id: string;
  planId?: string;
  status?: SubscriptionStatus;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
  paymentGateway?: PaymentGateway | null;
  pixAuthorizationId?: string | null;
  pixRecurrenceId?: string | null;
  pixCustomerCpf?: string | null;
  pixCustomerName?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  canceledAt?: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelReason?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CreatePaymentHistoryInput = {
  subscriptionId: string;
  academyId: string;
  amount: number;
  currency?: string | null;
  paymentGateway: PaymentGateway;
  gatewayPaymentId?: string | null;
  gatewayChargeId?: string | null;
  gatewayInvoiceId?: string | null;
  status?: PaymentStatus;
  paymentMethod?: string | null;
  failureReason?: string | null;
  failureCode?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  paidAt?: string | null;
};

export type UpdatePaymentHistoryInput = {
  id: string;
  status?: PaymentStatus;
  gatewayPaymentId?: string | null;
  gatewayChargeId?: string | null;
  gatewayInvoiceId?: string | null;
  paymentMethod?: string | null;
  failureReason?: string | null;
  failureCode?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  paidAt?: string | null;
};

export type CreateWebhookEventInput = {
  gateway: PaymentGateway;
  eventId: string;
  eventType: string;
  payload: Record<string, unknown>;
  headers?: Record<string, unknown> | null;
  status?: WebhookStatus;
  processedAt?: string | null;
  errorMessage?: string | null;
  retryCount?: number;
  nextRetryAt?: string | null;
  receivedAt?: string | null;
};

export type UpdateWebhookEventInput = {
  id: string;
  status?: WebhookStatus;
  processedAt?: string | null;
  errorMessage?: string | null;
  retryCount?: number;
  nextRetryAt?: string | null;
};

export interface SubscriptionPlansPort {
  listActive(): Promise<SubscriptionPlan[]>;
  getById(id: string): Promise<SubscriptionPlan | null>;
  getBySlug(slug: SubscriptionPlanSlug): Promise<SubscriptionPlan | null>;
  createPlan?(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlan>;
  updatePlan?(input: UpdateSubscriptionPlanInput): Promise<SubscriptionPlan>;
}

export interface SubscriptionsPort {
  getByAcademyId(academyId: string): Promise<Subscription | null>;
  createSubscription?(input: CreateSubscriptionInput): Promise<Subscription>;
  updateSubscription?(input: UpdateSubscriptionInput): Promise<Subscription>;
}

export interface PaymentHistoryPort {
  listByAcademy(academyId: string): Promise<PaymentHistory[]>;
  createPayment?(input: CreatePaymentHistoryInput): Promise<PaymentHistory>;
  updatePayment?(input: UpdatePaymentHistoryInput): Promise<PaymentHistory>;
}

export interface WebhookEventsPort {
  getByEventId(eventId: string): Promise<WebhookEvent | null>;
  createEvent?(input: CreateWebhookEventInput): Promise<WebhookEvent>;
  updateEvent?(input: UpdateWebhookEventInput): Promise<WebhookEvent>;
}

export interface AuthPort {
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(email: string, password: string): Promise<{ user: AuthUser; hasSession: boolean }>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  getCurrentUser(): Promise<AuthUser | null>;
  onAuthStateChange(
    callback: (event: string, session: AuthSession | null) => void
  ): { unsubscribe: () => void };
}

export interface ProfilesPort {
  getProfile(userId: string): Promise<Profile | null>;
  upsertProfile(input: ProfileUpsertInput): Promise<Profile>;
  setCurrentBelt(userId: string, belt: Belt): Promise<Profile>;
  setBeltAndDegree(userId: string, belt: Belt, degree: number | null): Promise<Profile>;
}

export interface AcademiesPort {
  createAcademy(input: CreateAcademyInput): Promise<Academy>;
  getByInviteCode(inviteCode: string): Promise<Academy | null>;
  getById(academyId: string): Promise<Academy | null>;
  getByOwnerId(ownerId: string): Promise<Academy | null>;
}

export interface MembershipsPort {
  addMember(input: AddMemberInput): Promise<AcademyMember>;
  listByAcademy(academyId: string): Promise<AcademyMember[]>;
  listByUser(userId: string): Promise<AcademyMember[]>;
  listMembersWithProfiles(academyId: string): Promise<MemberProfile[]>;
}

export interface ClassesPort {
  listByAcademy(academyId: string): Promise<AcademyClass[]>;
  createClass(input: CreateClassInput): Promise<AcademyClass>;
  updateClass(input: UpdateClassInput): Promise<AcademyClass>;
  deleteClass(id: string): Promise<void>;
}

export interface CheckinsPort {
  createCheckin(input: CreateCheckinInput): Promise<ClassCheckin>;
  listPendingByAcademy(academyId: string): Promise<CheckinListItem[]>;
  /** RLS filters results to the current instructor's classes. */
  listPendingMine(): Promise<CheckinListItem[]>;
  updateStatus(input: UpdateCheckinStatusInput): Promise<ClassCheckin>;
}

export interface SchedulesPort {
  getWeeklySchedule(
    academyId: string,
    weekStartISO: string,
    weekEndISO: string
  ): Promise<ClassScheduleItem[]>;
}

export type StudentProgress = {
  studentId: string;
  academyId: string;
  approvedClassesCount: number;
};

export interface ProgressPort {
  getByStudent(studentId: string): Promise<StudentProgress | null>;
}

export interface StoragePort {
  uploadAvatar(userId: string, blob: Blob, fileExt: string): Promise<string>;
}

export type BlackBeltPorts = {
  auth: AuthPort;
  profiles: ProfilesPort;
  academies: AcademiesPort;
  memberships: MembershipsPort;
  classes: ClassesPort;
  checkins: CheckinsPort;
  schedules: SchedulesPort;
  progress: ProgressPort;
  storage: StoragePort;
  subscriptionPlans?: SubscriptionPlansPort;
  subscriptions?: SubscriptionsPort;
  paymentHistory?: PaymentHistoryPort;
  webhookEvents?: WebhookEventsPort;
};
