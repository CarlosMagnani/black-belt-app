export type UserRole = "professor" | "student";
export type Belt = "Branca" | "Azul" | "Roxa" | "Marrom" | "Preta";
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
  fullName: string | null;
  role: UserRole | null;
  avatarUrl: string | null;
  currentBelt: Belt | null;
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

export type MemberProfile = {
  userId: string;
  fullName: string | null;
  email: string | null;
  currentBelt: Belt | null;
  avatarUrl: string | null;
  joinedAt: string | null;
};

export type ProfileUpsertInput = {
  id: string;
  email?: string | null;
  fullName?: string | null;
  role?: UserRole | null;
  avatarUrl?: string | null;
  currentBelt?: Belt | null;
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

export type DojoFlowPorts = {
  auth: AuthPort;
  profiles: ProfilesPort;
  academies: AcademiesPort;
  memberships: MembershipsPort;
};
