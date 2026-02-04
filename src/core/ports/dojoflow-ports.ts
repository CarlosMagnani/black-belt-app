export type UserRole = "professor" | "student";
export type Belt = "Branca" | "Azul" | "Roxa" | "Marrom" | "Preta" | "Coral" | "Vermelha";
export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  expiresAt: number | null;
};

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
  federationNumber?: string | null;
};

export type CreateClassInput = {
  academyId: string;
  title: string;
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

export interface AuthPort {
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(email: string, password: string, role: UserRole): Promise<AuthUser>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  getCurrentUser(): Promise<AuthUser | null>;
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
  updateStatus(input: UpdateCheckinStatusInput): Promise<ClassCheckin>;
}

export interface SchedulesPort {
  getWeeklySchedule(
    academyId: string,
    weekStartISO: string,
    weekEndISO: string
  ): Promise<ClassScheduleItem[]>;
}

export type DojoFlowPorts = {
  auth: AuthPort;
  profiles: ProfilesPort;
  academies: AcademiesPort;
  memberships: MembershipsPort;
  classes: ClassesPort;
  checkins: CheckinsPort;
  schedules: SchedulesPort;
};
