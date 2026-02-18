import { Platform } from "react-native";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SupportedStorage } from "@supabase/auth-js";
import * as Linking from "expo-linking";

import type {
  Academy,
  AcademyClass,
  AcademyMember,
  AcademyPlan,
  AcademySubscription,
  AddMemberInput,
  AuthSession,
  AuthUser,
  Belt,
  BeltRank,
  BlackBeltPorts,
  CheckinListItem,
  ClassCheckin,
  ClassScheduleItem,
  CreateAcademyInput,
  CreateAcademyPlanInput,
  CreateCheckinInput,
  CreateClassInput,
  MemberProfile,
  MemberRole,
  PaymentAttempt,
  PlatformPlan,
  Profile,
  ProfileUpsertInput,
  Sex,
  UpdateAcademyPlanInput,
  UpdateCheckinStatusInput,
  UpdateClassInput,
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

// ──────────────────────────────────────────────
// Belt mapping (DB uses belt_rank enum, UI uses display names)
// ──────────────────────────────────────────────

const BELT_RANK_TO_DISPLAY: Record<BeltRank, Belt> = {
  white: "Branca",
  blue: "Azul",
  purple: "Roxa",
  brown: "Marrom",
  black: "Preta",
  coral: "Coral",
  red: "Vermelha",
};

const BELT_DISPLAY_TO_RANK: Record<Belt, BeltRank> = {
  Branca: "white",
  Azul: "blue",
  Roxa: "purple",
  Marrom: "brown",
  Preta: "black",
  Coral: "coral",
  Vermelha: "red",
};

const toBeltDisplay = (rank: string | null): Belt =>
  BELT_RANK_TO_DISPLAY[rank as BeltRank] ?? "Branca";

const toBeltRank = (display: Belt): BeltRank =>
  BELT_DISPLAY_TO_RANK[display] ?? "white";

const SEX_VALUES = ["M", "F", "O", "N"] as const;
const toSex = (value: string | null): Sex | null =>
  SEX_VALUES.includes(value as Sex) ? (value as Sex) : null;

// ──────────────────────────────────────────────
// Transformation functions
// ──────────────────────────────────────────────

const toProfile = (row: Database["public"]["Tables"]["profiles"]["Row"]): Profile => ({
  id: row.id,
  firstName: row.first_name,
  birthDate: row.birth_date,
  photoUrl: row.photo_url,
  sex: toSex(row.sex),
  federationNumber: row.federation_number,
  belt: toBeltDisplay(row.belt),
  beltDegree: row.belt_degree,
  createdAt: row.created_at,
});

const toProfilePayload = (
  input: ProfileUpsertInput
): Database["public"]["Tables"]["profiles"]["Insert"] => ({
  id: input.id,
  ...(input.firstName !== undefined ? { first_name: input.firstName } : {}),
  ...(input.birthDate !== undefined ? { birth_date: input.birthDate } : {}),
  ...(input.photoUrl !== undefined ? { photo_url: input.photoUrl } : {}),
  ...(input.sex !== undefined ? { sex: input.sex } : {}),
  ...(input.federationNumber !== undefined ? { federation_number: input.federationNumber } : {}),
  ...(input.belt !== undefined ? { belt: toBeltRank(input.belt) } : {}),
  ...(input.beltDegree !== undefined ? { belt_degree: input.beltDegree } : {}),
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
  id: row.id,
  academyId: row.academy_id,
  userId: row.user_id,
  role: row.role as MemberRole,
  isBjj: row.is_bjj,
  isMuayThai: row.is_muay_thai,
  approvedClasses: row.approved_classes,
  classesToDegree: row.classes_to_degree,
  classesToBelt: row.classes_to_belt,
  joinedAt: row.joined_at,
});

const toScheduleItem = (
  row: Database["public"]["Tables"]["academy_class_schedule"]["Row"]
): ClassScheduleItem => ({
  id: row.id,
  academyId: row.academy_id,
  className: row.class_name,
  instructorMemberId: row.instructor_member_id,
  weekday: row.weekday,
  startTime: row.start_time,
  endTime: row.end_time,
  location: row.location,
  classType: row.class_type,
  isActive: row.is_active,
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
  memberId: row.member_id,
  trainingDate: row.training_date,
  status: row.status,
  approvedByMemberId: row.approved_by_member_id,
  approvedAt: row.approved_at,
  createdAt: row.created_at,
});

const toPlatformPlan = (
  row: Database["public"]["Tables"]["platform_plans"]["Row"]
): PlatformPlan => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  priceMonthCents: row.price_month_cents,
  priceYearCents: row.price_year_cents,
  discountPercent: row.discount_percent,
  description: row.description,
  currency: row.currency,
  isActive: row.is_active,
  createdAt: row.created_at,
});

const toAcademyPlan = (
  row: Database["public"]["Tables"]["academy_plans"]["Row"]
): AcademyPlan => ({
  id: row.id,
  academyId: row.academy_id,
  name: row.name,
  priceCents: row.price_cents,
  periodicity: row.periodicity,
  isActive: row.is_active,
  createdAt: row.created_at,
});

const toAcademySubscription = (
  row: Database["public"]["Tables"]["academy_subscriptions"]["Row"]
): AcademySubscription => ({
  id: row.id,
  academyId: row.academy_id,
  platformPlanId: row.platform_plan_id,
  status: row.status,
  gateway: row.gateway,
  currentPeriodStart: row.current_period_start,
  currentPeriodEnd: row.current_period_end,
  nextBillingAt: row.next_billing_at,
  canceledAt: row.canceled_at,
  createdAt: row.created_at,
});

const toPaymentAttempt = (
  row: Database["public"]["Tables"]["payment_attempts"]["Row"]
): PaymentAttempt => ({
  id: row.id,
  academyId: row.academy_id,
  memberSubscriptionId: row.member_subscription_id,
  academySubscriptionId: row.academy_subscription_id,
  gateway: row.gateway,
  amountCents: row.amount_cents,
  status: row.status,
  externalReference: row.external_reference,
  failureCode: row.failure_code,
  failureReason: row.failure_reason,
  attemptedAt: row.attempted_at,
  paidAt: row.paid_at,
  createdAt: row.created_at,
});

// ──────────────────────────────────────────────
// Supabase config
// ──────────────────────────────────────────────

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

// ──────────────────────────────────────────────
// Adapter factory
// ──────────────────────────────────────────────

export const createSupabaseAdapters = (config?: SupabaseConfig): BlackBeltPorts => {
  const client = createSupabaseClient(config);

  // ── Profiles ──────────────────────────────

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
        .upsert(toProfilePayload(input), { onConflict: "id" })
        .select("*")
        .single();
      if (error) throw error;
      return toProfile(data);
    },
    async setBeltAndDegree(userId: string, belt: Belt, degree: number): Promise<Profile> {
      const { data, error } = await client
        .from("profiles")
        .update({ belt: toBeltRank(belt), belt_degree: degree })
        .eq("id", userId)
        .select("*")
        .single();
      if (error) throw error;
      return toProfile(data);
    },
  };

  // ── Academies ─────────────────────────────

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
      const { data, error } = await client.rpc("get_academy_by_invite_code", {
        p_code: normalized,
      });
      if (error) throw error;
      const academy = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data;
      return academy ? toAcademy(academy as any) : null;
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

  // ── Memberships ───────────────────────────

  const memberships = {
    async addMember(input: AddMemberInput): Promise<AcademyMember> {
      const { data, error } = await client
        .from("academy_members")
        .insert({
          academy_id: input.academyId,
          user_id: input.userId,
          role: input.role ?? "student",
          ...(input.isBjj !== undefined ? { is_bjj: input.isBjj } : {}),
          ...(input.isMuayThai !== undefined ? { is_muay_thai: input.isMuayThai } : {}),
        })
        .select("*")
        .single();
      if (error) throw error;
      return toMember(data);
    },
    async getMember(academyId: string, userId: string): Promise<AcademyMember | null> {
      const { data, error } = await client
        .from("academy_members")
        .select("*")
        .eq("academy_id", academyId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data ? toMember(data) : null;
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
        id: string;
        user_id: string;
        role: string;
        approved_classes: number;
        joined_at: string;
        profiles: {
          first_name: string;
          photo_url: string | null;
          belt: string;
          belt_degree: number;
        } | null;
      };

      const { data, error } = await client
        .from("academy_members")
        .select(
          "id, user_id, role, approved_classes, joined_at, profiles:profiles (first_name, photo_url, belt, belt_degree)"
        )
        .eq("academy_id", academyId);
      if (error) throw error;
      const rows = (data as MemberRow[] | null) ?? [];
      return rows.map((row) => ({
        memberId: row.id,
        userId: row.user_id,
        role: row.role as MemberRole,
        firstName: row.profiles?.first_name ?? "",
        photoUrl: row.profiles?.photo_url ?? null,
        belt: toBeltDisplay(row.profiles?.belt ?? null),
        beltDegree: row.profiles?.belt_degree ?? 0,
        approvedClasses: row.approved_classes,
        joinedAt: row.joined_at,
      }));
    },
  };

  // ── Classes ───────────────────────────────

  const classes = {
    async listByAcademy(academyId: string): Promise<AcademyClass[]> {
      const { data, error } = await client
        .from("academy_class_schedule")
        .select("*")
        .eq("academy_id", academyId)
        .eq("is_active", true)
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
          class_name: input.className,
          weekday: input.weekday,
          start_time: input.startTime,
          end_time: input.endTime,
          ...(input.instructorMemberId !== undefined
            ? { instructor_member_id: input.instructorMemberId }
            : {}),
          ...(input.location !== undefined ? { location: input.location } : {}),
          ...(input.classType !== undefined ? { class_type: input.classType } : {}),
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
          ...(input.className !== undefined ? { class_name: input.className } : {}),
          ...(input.weekday !== undefined ? { weekday: input.weekday } : {}),
          ...(input.startTime !== undefined ? { start_time: input.startTime } : {}),
          ...(input.endTime !== undefined ? { end_time: input.endTime } : {}),
          ...(input.instructorMemberId !== undefined
            ? { instructor_member_id: input.instructorMemberId }
            : {}),
          ...(input.location !== undefined ? { location: input.location } : {}),
          ...(input.classType !== undefined ? { class_type: input.classType } : {}),
          ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
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

  // ── Checkins ──────────────────────────────

  const checkins = {
    async createCheckin(input: CreateCheckinInput): Promise<ClassCheckin> {
      const { data, error } = await client
        .from("class_checkins")
        .insert({
          academy_id: input.academyId,
          class_id: input.classId,
          member_id: input.memberId,
          status: "pending",
          ...(input.trainingDate ? { training_date: input.trainingDate } : {}),
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
        member_id: string;
        status: string;
        training_date: string;
        created_at: string;
        academy_members: {
          user_id: string;
          profiles: { first_name: string; photo_url: string | null } | null;
        } | null;
        academy_class_schedule: {
          class_name: string | null;
          weekday: number | null;
          start_time: string | null;
        } | null;
      };

      const { data, error } = await client
        .from("class_checkins")
        .select(
          "id, academy_id, class_id, member_id, status, training_date, created_at, academy_members:academy_members!class_checkins_member_id_fkey (user_id, profiles:profiles (first_name, photo_url)), academy_class_schedule:academy_class_schedule (class_name, weekday, start_time)"
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
        className: row.academy_class_schedule?.class_name ?? null,
        classWeekday: row.academy_class_schedule?.weekday ?? null,
        classStartTime: row.academy_class_schedule?.start_time ?? null,
        memberId: row.member_id,
        memberName: row.academy_members?.profiles?.first_name ?? null,
        memberPhotoUrl: row.academy_members?.profiles?.photo_url ?? null,
        status: row.status as ClassCheckin["status"],
        trainingDate: row.training_date,
        createdAt: row.created_at,
      }));
    },
    async listPendingMine(): Promise<CheckinListItem[]> {
      type PendingRow = {
        id: string;
        academy_id: string;
        class_id: string;
        member_id: string;
        status: string;
        training_date: string;
        created_at: string;
        academy_members: {
          user_id: string;
          profiles: { first_name: string; photo_url: string | null } | null;
        } | null;
        academy_class_schedule: {
          class_name: string | null;
          weekday: number | null;
          start_time: string | null;
        } | null;
      };

      const { data, error } = await client
        .from("class_checkins")
        .select(
          "id, academy_id, class_id, member_id, status, training_date, created_at, academy_members:academy_members!class_checkins_member_id_fkey (user_id, profiles:profiles (first_name, photo_url)), academy_class_schedule:academy_class_schedule (class_name, weekday, start_time)"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (data as PendingRow[] | null) ?? [];
      return rows.map((row) => ({
        id: row.id,
        academyId: row.academy_id,
        classId: row.class_id,
        className: row.academy_class_schedule?.class_name ?? null,
        classWeekday: row.academy_class_schedule?.weekday ?? null,
        classStartTime: row.academy_class_schedule?.start_time ?? null,
        memberId: row.member_id,
        memberName: row.academy_members?.profiles?.first_name ?? null,
        memberPhotoUrl: row.academy_members?.profiles?.photo_url ?? null,
        status: row.status as ClassCheckin["status"],
        trainingDate: row.training_date,
        createdAt: row.created_at,
      }));
    },
    async updateStatus(input: UpdateCheckinStatusInput): Promise<ClassCheckin> {
      const { data, error } = await client
        .from("class_checkins")
        .update({
          status: input.status,
          approved_by_member_id: input.approvedByMemberId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return toCheckin(data);
    },
  };

  // ── Schedules ─────────────────────────────

  const schedules = {
    async getWeeklySchedule(academyId: string): Promise<ClassScheduleItem[]> {
      const { data, error } = await client
        .from("academy_class_schedule")
        .select("*")
        .eq("academy_id", academyId)
        .eq("is_active", true)
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toScheduleItem);
    },
  };

  // ── Auth ──────────────────────────────────

  const auth = {
    async signIn(email: string, password: string): Promise<AuthUser> {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Missing user from sign-in response.");
      return { id: data.user.id, email: data.user.email ?? null };
    },
    async signUp(
      email: string,
      password: string
    ): Promise<{ user: AuthUser; hasSession: boolean }> {
      const emailRedirectTo =
        process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL ?? Linking.createURL("auth-callback");

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Missing user from sign-up response.");

      const isExistingUser =
        Array.isArray(data.user.identities) && data.user.identities.length === 0;
      if (isExistingUser) {
        throw new Error("Este email já está cadastrado. Faça login para continuar.");
      }

      const hasSession = !!data.session?.user;

      if (hasSession) {
        // Create a minimal profile for the new user
        await profiles.upsertProfile({
          id: data.user.id,
          firstName: email.split("@")[0],
        });
      }

      return {
        user: { id: data.user.id, email: data.user.email ?? null },
        hasSession,
      };
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
    onAuthStateChange(
      callback: (event: string, session: AuthSession | null) => void
    ): { unsubscribe: () => void } {
      const { data } = client.auth.onAuthStateChange((event, session) => {
        const mapped: AuthSession | null = session
          ? {
              user: { id: session.user.id, email: session.user.email ?? null },
              accessToken: session.access_token,
              expiresAt: session.expires_at ?? null,
            }
          : null;
        callback(event, mapped);
      });
      return { unsubscribe: () => data.subscription.unsubscribe() };
    },
  };

  // ── Platform Plans ────────────────────────

  const platformPlans = {
    async listActive(): Promise<PlatformPlan[]> {
      const { data, error } = await client
        .from("platform_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_month_cents", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toPlatformPlan);
    },
    async getById(id: string): Promise<PlatformPlan | null> {
      const { data, error } = await client
        .from("platform_plans")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? toPlatformPlan(data) : null;
    },
  };

  // ── Academy Plans ─────────────────────────

  const academyPlans = {
    async listByAcademy(academyId: string): Promise<AcademyPlan[]> {
      const { data, error } = await client
        .from("academy_plans")
        .select("*")
        .eq("academy_id", academyId)
        .eq("is_active", true)
        .order("price_cents", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toAcademyPlan);
    },
    async createPlan(input: CreateAcademyPlanInput): Promise<AcademyPlan> {
      const { data, error } = await client
        .from("academy_plans")
        .insert({
          academy_id: input.academyId,
          name: input.name,
          price_cents: input.priceCents,
          periodicity: input.periodicity,
          ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
        })
        .select("*")
        .single();
      if (error) throw error;
      return toAcademyPlan(data);
    },
    async updatePlan(input: UpdateAcademyPlanInput): Promise<AcademyPlan> {
      const { data, error } = await client
        .from("academy_plans")
        .update({
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.priceCents !== undefined ? { price_cents: input.priceCents } : {}),
          ...(input.periodicity !== undefined ? { periodicity: input.periodicity } : {}),
          ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
        })
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return toAcademyPlan(data);
    },
  };

  // ── Academy Subscriptions ─────────────────

  const academySubscriptions = {
    async getByAcademyId(academyId: string): Promise<AcademySubscription | null> {
      const { data, error } = await client
        .from("academy_subscriptions")
        .select("*")
        .eq("academy_id", academyId)
        .maybeSingle();
      if (error) throw error;
      return data ? toAcademySubscription(data) : null;
    },
  };

  // ── Payment Attempts ──────────────────────

  const paymentAttempts = {
    async listByAcademy(academyId: string): Promise<PaymentAttempt[]> {
      const { data, error } = await client
        .from("payment_attempts")
        .select("*")
        .eq("academy_id", academyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toPaymentAttempt);
    },
  };

  // ── Storage ───────────────────────────────

  const fileStorage = {
    async uploadAvatar(userId: string, blob: Blob, fileExt: string): Promise<string> {
      const guessExtFromMime = (mime?: string | null): string | null => {
        const value = (mime ?? "").toLowerCase();
        if (!value.startsWith("image/")) return null;
        const subtype = value.slice("image/".length);
        if (subtype === "jpeg") return "jpg";
        if (subtype === "jpg") return "jpg";
        if (subtype === "png") return "png";
        if (subtype === "webp") return "webp";
        if (subtype === "gif") return "gif";
        if (subtype === "heic") return "heic";
        if (subtype === "heif") return "heif";
        return null;
      };

      const normalizeExt = (value?: string | null, mime?: string | null): string => {
        const raw = (value ?? "").toLowerCase().trim().replace(/^\./, "");
        const safe = /^[a-z0-9]{1,10}$/.test(raw) ? raw : "";
        const normalized = safe === "jpeg" ? "jpg" : safe;
        const allowed = new Set(["jpg", "png", "webp", "gif", "heic", "heif"]);
        if (allowed.has(normalized)) return normalized;
        return guessExtFromMime(mime) ?? "jpg";
      };

      const toContentType = (ext: string, mime?: string | null) => {
        const safeMime = (mime ?? "").toLowerCase();
        if (safeMime.startsWith("image/")) return safeMime;
        if (ext === "jpg") return "image/jpeg";
        if (ext === "png") return "image/png";
        if (ext === "webp") return "image/webp";
        if (ext === "gif") return "image/gif";
        if (ext === "heic") return "image/heic";
        if (ext === "heif") return "image/heif";
        return "image/jpeg";
      };

      const ext = normalizeExt(fileExt, (blob as unknown as { type?: string }).type ?? null);
      const fileName = `${userId}/avatar.${ext}`;
      const { error: uploadError } = await client.storage
        .from("avatars")
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: toContentType(ext, (blob as unknown as { type?: string }).type ?? null),
        });
      if (uploadError) throw uploadError;
      const { data: urlData } = client.storage.from("avatars").getPublicUrl(fileName);
      return `${urlData.publicUrl}?t=${Date.now()}`;
    },
  };

  return {
    auth,
    profiles,
    academies,
    memberships,
    classes,
    checkins,
    schedules,
    storage: fileStorage,
    platformPlans,
    academyPlans,
    academySubscriptions,
    paymentAttempts,
  };
};
