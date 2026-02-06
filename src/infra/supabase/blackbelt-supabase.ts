import { Platform } from "react-native";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SupportedStorage } from "@supabase/auth-js";

import type {
  Academy,
  AcademyMember,
  AcademyClass,
  AddMemberInput,
  AuthSession,
  AuthUser,
  Belt,
  CheckinListItem,
  ClassCheckin,
  ClassScheduleItem,
  CreateCheckinInput,
  CreateAcademyInput,
  CreateClassInput,
  BlackBeltPorts,
  MemberProfile,
  Profile,
  ProfileUpsertInput,
  StudentProgress,
  UpdateCheckinStatusInput,
  UpdateClassInput,
  UserRole,
} from "../../core/ports/blackbelt-ports";
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
  isRecurring: row.is_recurring ?? true,
  startDate: row.start_date,
});

const toAcademyClass = (
  row: Database["public"]["Tables"]["academy_class_schedule"]["Row"]
): AcademyClass => ({
  ...toScheduleItem(row),
  createdAt: row.created_at,
});

const toCheckin = (
  row: Database["public"]["Tables"]["class_checkins"]["Row"]
): ClassCheckin => ({
  id: row.id,
  academyId: row.academy_id,
  classId: row.class_id,
  studentId: row.student_id,
  status: row.status,
  validatedBy: row.validated_by,
  validatedAt: row.validated_at,
  createdAt: row.created_at,
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

export const createSupabaseAdapters = (config?: SupabaseConfig): BlackBeltPorts => {
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
    async setBeltAndDegree(userId: string, belt: Belt, degree: number | null): Promise<Profile> {
      const { data, error } = await client
        .from("profiles")
        .update({ current_belt: belt, belt_degree: degree })
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
      
      const academy = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
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

  const classes = {
    async listByAcademy(academyId: string): Promise<AcademyClass[]> {
      const { data, error } = await client
        .from("academy_class_schedule")
        .select("*")
        .eq("academy_id", academyId)
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toAcademyClass);
    },
    async createClass(input: CreateClassInput): Promise<AcademyClass> {
      const { data, error } = await client
        .from("academy_class_schedule")
        .insert({
          academy_id: input.academyId,
          title: input.title,
          weekday: input.weekday,
          start_time: input.startTime,
          end_time: input.endTime,
          ...(input.instructorName !== undefined ? { instructor_name: input.instructorName } : {}),
          ...(input.location !== undefined ? { location: input.location } : {}),
          ...(input.level !== undefined ? { level: input.level } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          ...(input.isRecurring !== undefined ? { is_recurring: input.isRecurring } : {}),
          ...(input.startDate !== undefined ? { start_date: input.startDate } : {}),
        })
        .select("*")
        .single();
      if (error) throw error;
      return toAcademyClass(data);
    },
    async updateClass(input: UpdateClassInput): Promise<AcademyClass> {
      const { data, error } = await client
        .from("academy_class_schedule")
        .update({
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.weekday !== undefined ? { weekday: input.weekday } : {}),
          ...(input.startTime !== undefined ? { start_time: input.startTime } : {}),
          ...(input.endTime !== undefined ? { end_time: input.endTime } : {}),
          ...(input.instructorName !== undefined ? { instructor_name: input.instructorName } : {}),
          ...(input.location !== undefined ? { location: input.location } : {}),
          ...(input.level !== undefined ? { level: input.level } : {}),
          ...(input.notes !== undefined ? { notes: input.notes } : {}),
          ...(input.isRecurring !== undefined ? { is_recurring: input.isRecurring } : {}),
          ...(input.startDate !== undefined ? { start_date: input.startDate } : {}),
        })
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return toAcademyClass(data);
    },
    async deleteClass(id: string): Promise<void> {
      const { error } = await client
        .from("academy_class_schedule")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
  };

  const checkins = {
    async createCheckin(input: CreateCheckinInput): Promise<ClassCheckin> {
      const { data, error } = await client
        .from("class_checkins")
        .insert({
          academy_id: input.academyId,
          class_id: input.classId,
          student_id: input.studentId,
          status: "pending",
        })
        .select("*")
        .single();
      if (error) throw error;
      return toCheckin(data);
    },
    async listPendingByAcademy(academyId: string): Promise<CheckinListItem[]> {
      type PendingRow = {
        id: string;
        academy_id: string;
        class_id: string;
        student_id: string;
        status: string;
        created_at: string | null;
        profiles: { full_name: string | null; avatar_url: string | null } | null;
        academy_class_schedule: { title: string | null; weekday: number | null; start_time: string | null } | null;
      };

      const { data, error } = await client
        .from("class_checkins")
        .select(
          "id, academy_id, class_id, student_id, status, created_at, profiles:profiles!class_checkins_student_id_fkey (full_name, avatar_url), academy_class_schedule:academy_class_schedule (title, weekday, start_time)"
        )
        .eq("academy_id", academyId)
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (data as PendingRow[] | null) ?? [];
      return rows.map((row) => ({
        id: row.id,
        academyId: row.academy_id,
        classId: row.class_id,
        classTitle: row.academy_class_schedule?.title ?? null,
        classWeekday: row.academy_class_schedule?.weekday ?? null,
        classStartTime: row.academy_class_schedule?.start_time ?? null,
        studentId: row.student_id,
        studentName: row.profiles?.full_name ?? null,
        studentAvatarUrl: row.profiles?.avatar_url ?? null,
        status: row.status as ClassCheckin["status"],
        createdAt: row.created_at,
      }));
    },
    async updateStatus(input: UpdateCheckinStatusInput): Promise<ClassCheckin> {
      const { data: current, error: currentError } = await client
        .from("class_checkins")
        .select("status, student_id, academy_id")
        .eq("id", input.id)
        .single();
      if (currentError) throw currentError;

      const previousStatus = current.status;

      const { data, error } = await client
        .from("class_checkins")
        .update({
          status: input.status,
          validated_by: input.validatedBy,
          validated_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;

      if (input.status === "approved" && previousStatus !== "approved") {
        try {
          const { data: progressRow, error: progressSelectError } = await client
            .from("student_progress")
            .select("approved_classes_count")
            .eq("student_id", current.student_id)
            .maybeSingle();
          if (progressSelectError) throw progressSelectError;
          const nextCount = (progressRow?.approved_classes_count ?? 0) + 1;
          const { error: progressError } = await client
            .from("student_progress")
            .upsert({
              student_id: current.student_id,
              academy_id: current.academy_id,
              approved_classes_count: nextCount,
              updated_at: new Date().toISOString(),
            })
            .select("*")
            .single();
          if (progressError) throw progressError;
        } catch (progressErr) {
          // Rollback checkin status to avoid inconsistency
          await client
            .from("class_checkins")
            .update({ status: previousStatus, validated_by: null, validated_at: null })
            .eq("id", input.id);
          throw progressErr;
        }
      }

      return toCheckin(data);
    },
  };

  const schedules = {
    async getWeeklySchedule(
      academyId: string,
      weekStartISO: string,
      weekEndISO: string
    ): Promise<ClassScheduleItem[]> {
      const { data, error } = await client
        .from("academy_class_schedule")
        .select("*")
        .eq("academy_id", academyId)
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      return (data ?? [])
        .filter((row) => {
          if (row.is_recurring !== false) return true;
          if (!row.start_date) return false;
          return row.start_date >= weekStartISO && row.start_date <= weekEndISO;
        })
        .map(toScheduleItem);
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

  const progress = {
    async getByStudent(studentId: string): Promise<StudentProgress | null> {
      const { data, error } = await client
        .from("student_progress")
        .select("*")
        .eq("student_id", studentId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return {
        studentId: data.student_id,
        academyId: data.academy_id,
        approvedClassesCount: data.approved_classes_count,
      };
    },
  };

  return { auth, profiles, academies, memberships, classes, checkins, schedules, progress };
};
