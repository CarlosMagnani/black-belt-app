// ──────────────────────────────────────────────
// Enums & Basic Types
// ──────────────────────────────────────────────

export type MemberRole = "student" | "instructor" | "professor" | "owner";
export type UserRole = MemberRole;
export type Belt = "Branca" | "Azul" | "Roxa" | "Marrom" | "Preta" | "Coral" | "Vermelha";
export type BeltRank = "white" | "blue" | "purple" | "brown" | "black" | "coral" | "red";
export type Sex = "M" | "F" | "O" | "N";
export type CheckinStatus = "pending" | "approved" | "rejected";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired";
export type PaymentGateway = "pix" | "pix_auto" | "stripe";
export type PaymentAttemptStatus =
  | "pending"
  | "processing"
  | "paid"
  | "succeeded"
  | "failed"
  | "refunded";
export type PlanPeriodicity = "monthly" | "quarterly" | "semiannual" | "annual" | "yearly";

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export type AuthUser = {
  id: string;
  email: string | null;
  metadata?: Record<string, unknown> | null;
};

export type SignUpResult = {
  user: AuthUser;
  hasSession: boolean;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  expiresAt: number | null;
};

// ──────────────────────────────────────────────
// Profile (from profiles table)
// ──────────────────────────────────────────────

export type Profile = {
  id: string;
  firstName: string;
  /** Legacy compatibility fields used by older screens/components. */
  lastName: string | null;
  fullName: string | null;
  email: string | null;
  birthDate: string | null;
  photoUrl: string | null;
  avatarUrl: string | null;
  sex: Sex | null;
  federationNumber: string | null;
  belt: Belt;
  currentBelt: Belt;
  beltDegree: number;
  createdAt: string;
};

export type ProfileUpsertInput = {
  id: string;
  firstName?: string;
  lastName?: string | null;
  fullName?: string | null;
  birthDate?: string | null;
  photoUrl?: string | null;
  avatarUrl?: string | null;
  sex?: Sex | null;
  federationNumber?: string | null;
  belt?: Belt;
  currentBelt?: Belt;
  beltDegree?: number;
};

// ──────────────────────────────────────────────
// Academy
// ──────────────────────────────────────────────

export type Academy = {
  id: string;
  ownerId: string;
  name: string;
  city: string | null;
  inviteCode: string;
  logoUrl: string | null;
  createdAt: string;
};

export type CreateAcademyInput = {
  ownerId: string;
  name: string;
  city?: string | null;
  inviteCode: string;
  logoUrl?: string | null;
};

export type UpdateAcademyInput = {
  id: string;
  name?: string;
  city?: string | null;
  logoUrl?: string | null;
};

// ──────────────────────────────────────────────
// Academy Members (replaces old memberships + staff + role)
// ──────────────────────────────────────────────

export type AcademyMember = {
  id: string;
  academyId: string;
  userId: string;
  role: MemberRole;
  isBjj: boolean;
  isMuayThai: boolean;
  approvedClasses: number;
  classesToDegree: number;
  classesToBelt: number;
  joinedAt: string;
};

export type AddMemberInput = {
  academyId: string;
  userId: string;
  role?: MemberRole;
  isBjj?: boolean;
  isMuayThai?: boolean;
};

export type MemberProfile = {
  memberId: string;
  userId: string;
  role: MemberRole;
  firstName: string;
  fullName: string | null;
  email: string | null;
  photoUrl: string | null;
  avatarUrl: string | null;
  belt: Belt;
  currentBelt: Belt;
  beltDegree: number;
  approvedClasses: number;
  joinedAt: string;
};

// ──────────────────────────────────────────────
// Class Schedule
// ──────────────────────────────────────────────

export type ClassScheduleItem = {
  id: string;
  academyId: string;
  className: string;
  /** Legacy compatibility fields used by older screens/components. */
  title: string;
  instructorMemberId: string | null;
  instructorId: string | null;
  instructorName: string | null;
  weekday: number;
  startTime: string;
  endTime: string;
  location: string | null;
  classType: string;
  level: string | null;
  notes: string | null;
  isRecurring: boolean;
  startDate: string | null;
  isActive: boolean;
};

export type AcademyClass = ClassScheduleItem & {
  createdAt: string;
};

export type CreateClassInput = {
  academyId: string;
  className?: string;
  title?: string;
  instructorMemberId?: string | null;
  instructorId?: string | null;
  instructorName?: string | null;
  weekday: number;
  startTime: string;
  endTime: string;
  location?: string | null;
  classType?: string;
  level?: string | null;
  notes?: string | null;
  isRecurring?: boolean;
  startDate?: string | null;
};

export type UpdateClassInput = {
  id: string;
  className?: string;
  title?: string;
  instructorMemberId?: string | null;
  instructorId?: string | null;
  instructorName?: string | null;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  location?: string | null;
  classType?: string;
  level?: string | null;
  notes?: string | null;
  isRecurring?: boolean;
  startDate?: string | null;
  isActive?: boolean;
};

// ──────────────────────────────────────────────
// Checkins
// ──────────────────────────────────────────────

export type ClassCheckin = {
  id: string;
  academyId: string;
  classId: string;
  memberId: string;
  trainingDate: string;
  status: CheckinStatus;
  approvedByMemberId: string | null;
  approvedAt: string | null;
  createdAt: string;
};

export type CheckinListItem = {
  id: string;
  academyId: string;
  classId: string;
  className: string | null;
  classTitle: string | null;
  classWeekday: number | null;
  classStartTime: string | null;
  memberId: string;
  memberName: string | null;
  studentName: string | null;
  memberPhotoUrl: string | null;
  studentAvatarUrl: string | null;
  status: CheckinStatus;
  trainingDate: string;
  createdAt: string;
};

export type CreateCheckinInput = {
  academyId: string;
  classId: string;
  memberId?: string;
  studentId?: string;
  trainingDate?: string;
};

export type UpdateCheckinStatusInput = {
  id: string;
  status: CheckinStatus;
  approvedByMemberId?: string;
  validatedBy?: string;
};

// ──────────────────────────────────────────────
// Platform Plans (B2B - for academies)
// ──────────────────────────────────────────────

export type PlatformPlan = {
  id: string;
  name: string;
  slug: string;
  priceMonthCents: number;
  priceYearCents: number | null;
  discountPercent: number | null;
  description: string | null;
  currency: string;
  isActive: boolean;
  createdAt: string;
};

// ──────────────────────────────────────────────
// Academy Plans (plans the academy offers to members)
// ──────────────────────────────────────────────

export type AcademyPlan = {
  id: string;
  academyId: string;
  name: string;
  priceCents: number;
  periodicity: PlanPeriodicity;
  isActive: boolean;
  createdAt: string;
};

export type CreateAcademyPlanInput = {
  academyId: string;
  name: string;
  priceCents: number;
  periodicity: PlanPeriodicity;
  isActive?: boolean;
};

export type UpdateAcademyPlanInput = {
  id: string;
  name?: string;
  priceCents?: number;
  periodicity?: PlanPeriodicity;
  isActive?: boolean;
};

// ──────────────────────────────────────────────
// Academy Subscriptions (academy subscribes to platform)
// ──────────────────────────────────────────────

export type AcademySubscription = {
  id: string;
  academyId: string;
  platformPlanId: string;
  status: SubscriptionStatus;
  gateway: PaymentGateway | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextBillingAt: string | null;
  canceledAt: string | null;
  createdAt: string;
};

// ──────────────────────────────────────────────
// Member Subscriptions (member subscribes to academy plan)
// ──────────────────────────────────────────────

export type MemberSubscription = {
  id: string;
  academyId: string;
  memberId: string;
  academyPlanId: string;
  status: SubscriptionStatus;
  subscribedAt: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  nextBillingAt: string | null;
  canceledAt: string | null;
  createdAt: string;
};

// ──────────────────────────────────────────────
// Payment Attempts
// ──────────────────────────────────────────────

export type PaymentAttempt = {
  id: string;
  academyId: string;
  memberSubscriptionId: string | null;
  academySubscriptionId: string | null;
  gateway: PaymentGateway;
  amountCents: number;
  status: PaymentAttemptStatus;
  externalReference: string | null;
  failureCode: string | null;
  failureReason: string | null;
  attemptedAt: string;
  paidAt: string | null;
  createdAt: string;
};

// ──────────────────────────────────────────────
// Port Interfaces
// ──────────────────────────────────────────────

export interface AuthPort {
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(email: string, password: string): Promise<SignUpResult>;
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
  setBeltAndDegree(userId: string, belt: Belt, degree: number): Promise<Profile>;
}

export interface AcademiesPort {
  createAcademy(input: CreateAcademyInput): Promise<Academy>;
  updateAcademy(input: UpdateAcademyInput): Promise<Academy>;
  getByInviteCode(inviteCode: string): Promise<Academy | null>;
  getById(academyId: string): Promise<Academy | null>;
  getByOwnerId(ownerId: string): Promise<Academy | null>;
}

export interface MembershipsPort {
  addMember(input: AddMemberInput): Promise<AcademyMember>;
  getMember(academyId: string, userId: string): Promise<AcademyMember | null>;
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
  listPendingMine(): Promise<CheckinListItem[]>;
  updateStatus(input: UpdateCheckinStatusInput): Promise<ClassCheckin>;
}

export interface SchedulesPort {
  getWeeklySchedule(
    academyId: string,
    weekStartISO?: string,
    weekEndISO?: string
  ): Promise<ClassScheduleItem[]>;
}

export interface StoragePort {
  uploadAvatar(userId: string, blob: Blob, fileExt: string): Promise<string>;
  uploadAcademyLogo(ownerId: string, blob: Blob, fileExt: string): Promise<string>;
}

export interface PlatformPlansPort {
  listActive(): Promise<PlatformPlan[]>;
  getById(id: string): Promise<PlatformPlan | null>;
}

export interface AcademyPlansPort {
  listByAcademy(academyId: string): Promise<AcademyPlan[]>;
  createPlan(input: CreateAcademyPlanInput): Promise<AcademyPlan>;
  updatePlan(input: UpdateAcademyPlanInput): Promise<AcademyPlan>;
}

export interface AcademySubscriptionsPort {
  getByAcademyId(academyId: string): Promise<AcademySubscription | null>;
}

export interface PaymentAttemptsPort {
  listByAcademy(academyId: string): Promise<PaymentAttempt[]>;
}

// ──────────────────────────────────────────────
// Master Ports
// ──────────────────────────────────────────────

export type BlackBeltPorts = {
  auth: AuthPort;
  profiles: ProfilesPort;
  academies: AcademiesPort;
  memberships: MembershipsPort;
  classes: ClassesPort;
  checkins: CheckinsPort;
  schedules: SchedulesPort;
  storage: StoragePort;
  platformPlans?: PlatformPlansPort;
  academyPlans?: AcademyPlansPort;
  academySubscriptions?: AcademySubscriptionsPort;
  paymentAttempts?: PaymentAttemptsPort;
};
