import { Platform } from "react-native";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SupportedStorage } from "@supabase/auth-js";

import type {
  Academy,
  AcademyMember,
  AddMemberInput,
  AuthSession,
  AuthUser,
  Belt,
  ClassScheduleItem,
  CreateAcademyInput,
  DojoFlowPorts,
  MemberProfile,
  Profile,
  ProfileUpsertInput,
  UserRole,
} from "../../core/ports/dojoflow-ports";
import type { Database } from "./database.types";

type SupabaseSchema = "public";
type SupabaseAuthStorage = SupportedStorage;

export type SupabaseConfig = {
  url?: string;
  key?: string;
  storage?: SupabaseAuthStorage;
  client?: SupabaseClient<Database, SupabaseSchema>;
};

const BELT_VALUES: Belt[] = ["Branca", "Azul", "Roxa", "Marrom", "Preta", "Coral", "Vermelha"];
const ROLE_VALUES: UserRole[] = ["professor", "student"];

const toBelt = (value: string | null): Belt | null =>
  BELT_VALUES.includes(value as Belt) ? (value as Belt) : null;

const toRole = (value: string | null): UserRole | null =>
  ROLE_VALUES.includes(value as UserRole) ? (value as UserRole) : null;

const buildFullName = (
  firstName?: string | null,
  lastName?: string | null,
  fallback?: string | null
) => {
  const first = firstName?.trim() ?? "";
  const last = lastName?.trim() ?? "";
  const combined = `${first} ${last}`.trim();
  return combined || fallback || null;
};

const toProfile = (row: Database["public"]["Tables"]["profiles"]["Row"]): Profile => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  fullName: buildFullName(row.first_name, row.last_name, row.full_name),
  role: toRole(row.role),
  avatarUrl: row.avatar_url,
  currentBelt: toBelt(row.current_belt),
  beltDegree: row.belt_degree,
  birthDate: row.birth_date,
  federationNumber: row.federation_number,
  createdAt: row.created_at,
});

const toProfilePayload = (
  input: ProfileUpsertInput
): Database["public"]["Tables"]["profiles"]["Insert"] => ({
  id: input.id,
  ...(input.email !== undefined ? { email: input.email } : {}),
  ...(input.firstName !== undefined ? { first_name: input.firstName } : {}),
  ...(input.lastName !== undefined ? { last_name: input.lastName } : {}),
  ...(input.firstName !== undefined || input.lastName !== undefined
    ? { full_name: buildFullName(input.firstName, input.lastName) }
    : input.fullName !== undefined
      ? { full_name: input.fullName }
      : {}),
  ...(input.role !== undefined ? { role: input.role } : {}),
  ...(input.avatarUrl !== undefined ? { avatar_url: input.avatarUrl } : {}),
  ...(input.currentBelt !== undefined ? { current_belt: input.currentBelt } : {}),
  ...(input.beltDegree !== undefined ? { belt_degree: input.beltDegree } : {}),
  ...(input.birthDate !== undefined ? { birth_date: input.birthDate } : {}),
  ...(input.federationNumber !== undefined ? { federation_number: input.federationNumber } : {}),
});

const toAcademy = (row: Database["public"]["Tables"]["academies"]["Row"]): Academy => ({
  id: row.id,
  ownerId: row.owner_id,
  name: row.name,
  city: row.city,
  inviteCode: row.invite_code,
  logoUrl: row.logo_url,
  createdAt: row.created_at,
});

const toMember = (row: Database["public"]["Tables"]["academy_members"]["Row"]): AcademyMember => ({
  academyId: row.academy_id,
  userId: row.user_id,
  joinedAt: row.joined_at,
});

const toScheduleItem = (
  row: Database["public"]["Tables"]["academy_class_schedule"]["Row"]
): ClassScheduleItem => ({
  id: row.id,
  academyId: row.academy_id,
  title: row.title,
  instructorName: row.instructor_name,
  weekday: row.weekday,
  startTime: row.start_time,
  endTime: row.end_time,
  location: row.location,
  level: row.level,
  notes: row.notes,
});

const resolveSupabaseConfig = (config?: SupabaseConfig) => {
  const url = config?.url ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key =
    config?.key ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return { url, key };
};

export const createSupabaseClient = (
  config?: SupabaseConfig
): SupabaseClient<Database, SupabaseSchema> => {
  if (config?.client) {
    return config.client;
  }

  const { url, key } = resolveSupabaseConfig(config);

  return createClient<Database, SupabaseSchema>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: config?.storage,
    },
    global: {
      headers: {
        "X-Client-Info": Platform.OS,
      },
    },
  });
};

export const createSupabaseAdapters = (config?: SupabaseConfig): DojoFlowPorts => {
  const client = createSupabaseClient(config);

  const profiles = {
    async getProfile(userId: string): Promise<Profile | null> {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data ? toProfile(data) : null;
    },
    async upsertProfile(input: ProfileUpsertInput): Promise<Profile> {
      const { data, error } = await client
        .from("profiles")
        .upsert(toProfilePayload(input))
        .select("*")
        .single();
      if (error) throw error;
      return toProfile(data);
    },
    async setCurrentBelt(userId: string, belt: Belt): Promise<Profile> {
      const { data, error } = await client
        .from("profiles")
        .update({ current_belt: belt })
        .eq("id", userId)
        .select("*")
        .single();
      if (error) throw error;
      return toProfile(data);
    },
  };

  const academies = {
    async createAcademy(input: CreateAcademyInput): Promise<Academy> {
      const { data, error } = await client
        .from("academies")
        .insert({
          owner_id: input.ownerId,
          name: input.name,
          invite_code: input.inviteCode,
          ...(input.city !== undefined ? { city: input.city } : {}),
          ...(input.logoUrl !== undefined ? { logo_url: input.logoUrl } : {}),
        })
        .select("*")
        .single();
      if (error) throw error;
      return toAcademy(data);
    },
    async getByInviteCode(inviteCode: string): Promise<Academy | null> {
      const normalized = inviteCode.trim().toUpperCase();

      const { data, error } = await client
        .rpc("get_academy_by_invite_code", { p_code: normalized });
      
      if (error) throw error;
      
      const academy = Array.isArray(data) ? data[0] : data;
      return academy ? toAcademy(academy) : null;
    },
    async getById(academyId: string): Promise<Academy | null> {
      const { data, error } = await client
        .from("academies")
        .select("*")
        .eq("id", academyId)
        .maybeSingle();
      if (error) throw error;
      return data ? toAcademy(data) : null;
    },
    async getByOwnerId(ownerId: string): Promise<Academy | null> {
      const { data, error } = await client
        .from("academies")
        .select("*")
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? toAcademy(data) : null;
    },
  };

  const memberships = {
    async addMember(input: AddMemberInput): Promise<AcademyMember> {
      const { data, error } = await client
        .from("academy_members")
        .upsert(
          {
            academy_id: input.academyId,
            user_id: input.userId,
          },
          { onConflict: "academy_id,user_id" }
        )
        .select("*")
        .single();
      if (error) throw error;
      return toMember(data);
    },
    async listByAcademy(academyId: string): Promise<AcademyMember[]> {
      const { data, error } = await client
        .from("academy_members")
        .select("*")
        .eq("academy_id", academyId);
      if (error) throw error;
      return (data ?? []).map(toMember);
    },
    async listByUser(userId: string): Promise<AcademyMember[]> {
      const { data, error } = await client
        .from("academy_members")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return (data ?? []).map(toMember);
    },
    async listMembersWithProfiles(academyId: string): Promise<MemberProfile[]> {
      type MemberRow = {
        user_id: string;
        joined_at: string | null;
        profiles: {
          full_name: string | null;
          email: string | null;
          current_belt: string | null;
          belt_degree: number | null;
          avatar_url: string | null;
        } | null;
      };

      const { data, error } = await client
        .from("academy_members")
        .select(
          "user_id, joined_at, profiles:profiles (full_name, email, current_belt, belt_degree, avatar_url)"
        )
        .eq("academy_id", academyId);
      if (error) throw error;
      const rows = (data as MemberRow[] | null) ?? [];
      return rows.map((row) => ({
        userId: row.user_id,
        joinedAt: row.joined_at,
        fullName: row.profiles?.full_name ?? null,
        email: row.profiles?.email ?? null,
        currentBelt: toBelt(row.profiles?.current_belt ?? null),
        beltDegree: row.profiles?.belt_degree ?? null,
        avatarUrl: row.profiles?.avatar_url ?? null,
      }));
    },
  };

  const schedules = {
    async getWeeklySchedule(
      academyId: string,
      _weekStartISO: string,
      _weekEndISO: string
    ): Promise<ClassScheduleItem[]> {
      const { data, error } = await client
        .from("academy_class_schedule")
        .select("*")
        .eq("academy_id", academyId)
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      return (data ?? []).map(toScheduleItem);
    },
  };

  const auth = {
    async signIn(email: string, password: string): Promise<AuthUser> {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Missing user from sign-in response.");

      return { id: data.user.id, email: data.user.email ?? null };
    },
    async signUp(email: string, password: string, role: UserRole): Promise<AuthUser> {
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Missing user from sign-up response.");

      if (data.session?.user) {
        await profiles.upsertProfile({
          id: data.user.id,
          email: data.user.email ?? email,
          role,
        });
      }

      return { id: data.user.id, email: data.user.email ?? null };
    },
    async signOut(): Promise<void> {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
    async getSession(): Promise<AuthSession | null> {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      if (!data.session || !data.session.user) return null;
      return {
        user: { id: data.session.user.id, email: data.session.user.email ?? null },
        accessToken: data.session.access_token,
        expiresAt: data.session.expires_at ?? null,
      };
    },
    async getCurrentUser(): Promise<AuthUser | null> {
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      if (!data.user) return null;
      return { id: data.user.id, email: data.user.email ?? null };
    },
  };

  return { auth, profiles, academies, memberships, schedules };
};
