import { Platform } from "react-native";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SupportedStorage } from "@supabase/auth-js";
import * as Linking from "expo-linking";

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
  SubscriptionPlan,
  SubscriptionPlanSlug,
  Subscription,
  PaymentHistory,
  WebhookEvent,
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  CreatePaymentHistoryInput,
  UpdatePaymentHistoryInput,
  CreateWebhookEventInput,
  UpdateWebhookEventInput,
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
const ROLE_VALUES: UserRole[] = ["owner", "professor", "student"];

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

const SEX_VALUES = ["M", "F", "O", "N"] as const;
type Sex = (typeof SEX_VALUES)[number];

const toSex = (value: string | null): Sex | null =>
  SEX_VALUES.includes(value as Sex) ? (value as Sex) : null;

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
  sex: toSex((row as any).sex),
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
  ...(input.sex !== undefined ? { sex: input.sex } : {}),
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
  instructorId: row.instructor_id,
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

const toSubscriptionPlan = (
  row: Database["public"]["Tables"]["subscription_plans"]["Row"]
): SubscriptionPlan => ({
  id: row.id,
  name: row.name,
  slug: row.slug as SubscriptionPlanSlug,
  description: row.description,
  priceMonthly: row.price_monthly,
  priceYearly: row.price_yearly,
  currency: row.currency,
  maxStudents: row.max_students,
  maxProfessors: row.max_professors,
  maxLocations: row.max_locations,
  features: Array.isArray(row.features) ? row.features : [],
  isActive: row.is_active,
  stripePriceIdMonthly: row.stripe_price_id_monthly,
  stripePriceIdYearly: row.stripe_price_id_yearly,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toSubscriptionPlanPayload = (
  input: CreateSubscriptionPlanInput | UpdateSubscriptionPlanInput
): Partial<Database["public"]["Tables"]["subscription_plans"]["Insert"]> => ({
  ...("name" in input && input.name !== undefined ? { name: input.name } : {}),
  ...("slug" in input && input.slug !== undefined ? { slug: input.slug } : {}),
  ...(input.description !== undefined ? { description: input.description } : {}),
  ...(input.priceMonthly !== undefined ? { price_monthly: input.priceMonthly } : {}),
  ...(input.priceYearly !== undefined ? { price_yearly: input.priceYearly } : {}),
  ...(input.currency !== undefined ? { currency: input.currency } : {}),
  ...(input.maxStudents !== undefined ? { max_students: input.maxStudents } : {}),
  ...(input.maxProfessors !== undefined ? { max_professors: input.maxProfessors } : {}),
  ...(input.maxLocations !== undefined ? { max_locations: input.maxLocations } : {}),
  ...(input.features !== undefined ? { features: input.features } : {}),
  ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
  ...(input.stripePriceIdMonthly !== undefined
    ? { stripe_price_id_monthly: input.stripePriceIdMonthly }
    : {}),
  ...(input.stripePriceIdYearly !== undefined
    ? { stripe_price_id_yearly: input.stripePriceIdYearly }
    : {}),
});

const toSubscription = (
  row: Database["public"]["Tables"]["subscriptions"]["Row"]
): Subscription => ({
  id: row.id,
  academyId: row.academy_id,
  planId: row.plan_id,
  status: row.status,
  trialStartDate: row.trial_start_date,
  trialEndDate: row.trial_end_date,
  paymentGateway: row.payment_gateway,
  pixAuthorizationId: row.pix_authorization_id,
  pixRecurrenceId: row.pix_recurrence_id,
  pixCustomerCpf: row.pix_customer_cpf,
  pixCustomerName: row.pix_customer_name,
  stripeCustomerId: row.stripe_customer_id,
  stripeSubscriptionId: row.stripe_subscription_id,
  stripePriceId: row.stripe_price_id,
  currentPeriodStart: row.current_period_start,
  currentPeriodEnd: row.current_period_end,
  canceledAt: row.canceled_at,
  cancelAtPeriodEnd: row.cancel_at_period_end,
  cancelReason: row.cancel_reason,
  metadata: (row.metadata as Record<string, unknown> | null) ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toSubscriptionPayload = (
  input: CreateSubscriptionInput | UpdateSubscriptionInput
): Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]> => ({
  ...(input.academyId !== undefined ? { academy_id: input.academyId } : {}),
  ...(input.planId !== undefined ? { plan_id: input.planId } : {}),
  ...(input.status !== undefined ? { status: input.status } : {}),
  ...(input.trialStartDate !== undefined ? { trial_start_date: input.trialStartDate } : {}),
  ...(input.trialEndDate !== undefined ? { trial_end_date: input.trialEndDate } : {}),
  ...(input.paymentGateway !== undefined ? { payment_gateway: input.paymentGateway } : {}),
  ...(input.pixAuthorizationId !== undefined
    ? { pix_authorization_id: input.pixAuthorizationId }
    : {}),
  ...(input.pixRecurrenceId !== undefined ? { pix_recurrence_id: input.pixRecurrenceId } : {}),
  ...(input.pixCustomerCpf !== undefined ? { pix_customer_cpf: input.pixCustomerCpf } : {}),
  ...(input.pixCustomerName !== undefined ? { pix_customer_name: input.pixCustomerName } : {}),
  ...(input.stripeCustomerId !== undefined ? { stripe_customer_id: input.stripeCustomerId } : {}),
  ...(input.stripeSubscriptionId !== undefined
    ? { stripe_subscription_id: input.stripeSubscriptionId }
    : {}),
  ...(input.stripePriceId !== undefined ? { stripe_price_id: input.stripePriceId } : {}),
  ...(input.currentPeriodStart !== undefined
    ? { current_period_start: input.currentPeriodStart }
    : {}),
  ...(input.currentPeriodEnd !== undefined
    ? { current_period_end: input.currentPeriodEnd }
    : {}),
  ...(input.canceledAt !== undefined ? { canceled_at: input.canceledAt } : {}),
  ...(input.cancelAtPeriodEnd !== undefined
    ? { cancel_at_period_end: input.cancelAtPeriodEnd }
    : {}),
  ...(input.cancelReason !== undefined ? { cancel_reason: input.cancelReason } : {}),
  ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
});

const toPaymentHistory = (
  row: Database["public"]["Tables"]["payment_history"]["Row"]
): PaymentHistory => ({
  id: row.id,
  subscriptionId: row.subscription_id,
  academyId: row.academy_id,
  amount: row.amount,
  currency: row.currency,
  paymentGateway: row.payment_gateway,
  gatewayPaymentId: row.gateway_payment_id,
  gatewayChargeId: row.gateway_charge_id,
  gatewayInvoiceId: row.gateway_invoice_id,
  status: row.status,
  paymentMethod: row.payment_method,
  failureReason: row.failure_reason,
  failureCode: row.failure_code,
  periodStart: row.period_start,
  periodEnd: row.period_end,
  paidAt: row.paid_at,
  createdAt: row.created_at,
});

const toPaymentHistoryPayload = (
  input: CreatePaymentHistoryInput | UpdatePaymentHistoryInput
): Partial<Database["public"]["Tables"]["payment_history"]["Insert"]> => ({
  ...(input.subscriptionId !== undefined ? { subscription_id: input.subscriptionId } : {}),
  ...(input.academyId !== undefined ? { academy_id: input.academyId } : {}),
  ...(input.amount !== undefined ? { amount: input.amount } : {}),
  ...(input.currency !== undefined ? { currency: input.currency } : {}),
  ...(input.paymentGateway !== undefined ? { payment_gateway: input.paymentGateway } : {}),
  ...(input.gatewayPaymentId !== undefined
    ? { gateway_payment_id: input.gatewayPaymentId }
    : {}),
  ...(input.gatewayChargeId !== undefined ? { gateway_charge_id: input.gatewayChargeId } : {}),
  ...(input.gatewayInvoiceId !== undefined ? { gateway_invoice_id: input.gatewayInvoiceId } : {}),
  ...(input.status !== undefined ? { status: input.status } : {}),
  ...(input.paymentMethod !== undefined ? { payment_method: input.paymentMethod } : {}),
  ...(input.failureReason !== undefined ? { failure_reason: input.failureReason } : {}),
  ...(input.failureCode !== undefined ? { failure_code: input.failureCode } : {}),
  ...(input.periodStart !== undefined ? { period_start: input.periodStart } : {}),
  ...(input.periodEnd !== undefined ? { period_end: input.periodEnd } : {}),
  ...(input.paidAt !== undefined ? { paid_at: input.paidAt } : {}),
});

const toWebhookEvent = (
  row: Database["public"]["Tables"]["webhook_events"]["Row"]
): WebhookEvent => ({
  id: row.id,
  gateway: row.gateway as WebhookEvent["gateway"],
  eventId: row.event_id,
  eventType: row.event_type,
  payload: (row.payload as Record<string, unknown>) ?? {},
  headers: (row.headers as Record<string, unknown> | null) ?? null,
  status: row.status,
  processedAt: row.processed_at,
  errorMessage: row.error_message,
  retryCount: row.retry_count,
  nextRetryAt: row.next_retry_at,
  receivedAt: row.received_at,
  createdAt: row.created_at,
});

const toWebhookEventPayload = (
  input: CreateWebhookEventInput | UpdateWebhookEventInput
): Partial<Database["public"]["Tables"]["webhook_events"]["Insert"]> => ({
  ...("gateway" in input && input.gateway !== undefined ? { gateway: input.gateway } : {}),
  ...("eventId" in input && input.eventId !== undefined ? { event_id: input.eventId } : {}),
  ...("eventType" in input && input.eventType !== undefined ? { event_type: input.eventType } : {}),
  ...("payload" in input && input.payload !== undefined ? { payload: input.payload } : {}),
  ...(input.headers !== undefined ? { headers: input.headers } : {}),
  ...(input.status !== undefined ? { status: input.status } : {}),
  ...(input.processedAt !== undefined ? { processed_at: input.processedAt } : {}),
  ...(input.errorMessage !== undefined ? { error_message: input.errorMessage } : {}),
  ...(input.retryCount !== undefined ? { retry_count: input.retryCount } : {}),
  ...(input.nextRetryAt !== undefined ? { next_retry_at: input.nextRetryAt } : {}),
  ...(input.receivedAt !== undefined ? { received_at: input.receivedAt } : {}),
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
        .upsert(toProfilePayload(input), { onConflict: "id" })
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
          ...(input.instructorId !== undefined ? { instructor_id: input.instructorId } : {}),
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
          ...(input.instructorId !== undefined ? { instructor_id: input.instructorId } : {}),
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
    async listPendingMine(): Promise<CheckinListItem[]> {
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
    async signUp(email: string, password: string): Promise<{ user: AuthUser; hasSession: boolean }> {
      const emailRedirectTo =
        process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL ?? Linking.createURL("auth-callback");

      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Missing user from sign-up response.");

      // Supabase may return an obfuscated user (without identities) when this
      // email is already registered. In this case we should not continue to
      // onboarding as if this were a brand-new account.
      const isExistingUser =
        Array.isArray(data.user.identities) && data.user.identities.length === 0;
      if (isExistingUser) {
        throw new Error("Este email já está cadastrado. Faça login para continuar.");
      }

      const hasSession = !!data.session?.user;

      if (hasSession) {
        await profiles.upsertProfile({
          id: data.user.id,
          email: data.user.email ?? email,
          role: null,
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

  const subscriptionPlans = {
    async listActive(): Promise<SubscriptionPlan[]> {
      const { data, error } = await client
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toSubscriptionPlan);
    },
    async getById(id: string): Promise<SubscriptionPlan | null> {
      const { data, error } = await client
        .from("subscription_plans")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data ? toSubscriptionPlan(data) : null;
    },
    async getBySlug(slug: SubscriptionPlanSlug): Promise<SubscriptionPlan | null> {
      const { data, error } = await client
        .from("subscription_plans")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? toSubscriptionPlan(data) : null;
    },
    async createPlan(input: CreateSubscriptionPlanInput): Promise<SubscriptionPlan> {
      const { data, error } = await client
        .from("subscription_plans")
        .insert(toSubscriptionPlanPayload(input))
        .select("*")
        .single();
      if (error) throw error;
      return toSubscriptionPlan(data);
    },
    async updatePlan(input: UpdateSubscriptionPlanInput): Promise<SubscriptionPlan> {
      const { data, error } = await client
        .from("subscription_plans")
        .update(toSubscriptionPlanPayload(input))
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return toSubscriptionPlan(data);
    },
  };

  const subscriptions = {
    async getByAcademyId(academyId: string): Promise<Subscription | null> {
      const { data, error } = await client
        .from("subscriptions")
        .select("*")
        .eq("academy_id", academyId)
        .maybeSingle();
      if (error) throw error;
      return data ? toSubscription(data) : null;
    },
    async createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
      const { data, error } = await client
        .from("subscriptions")
        .insert(toSubscriptionPayload(input))
        .select("*")
        .single();
      if (error) throw error;
      return toSubscription(data);
    },
    async updateSubscription(input: UpdateSubscriptionInput): Promise<Subscription> {
      const { data, error } = await client
        .from("subscriptions")
        .update(toSubscriptionPayload(input))
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return toSubscription(data);
    },
  };

  const paymentHistory = {
    async listByAcademy(academyId: string): Promise<PaymentHistory[]> {
      const { data, error } = await client
        .from("payment_history")
        .select("*")
        .eq("academy_id", academyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(toPaymentHistory);
    },
    async createPayment(input: CreatePaymentHistoryInput): Promise<PaymentHistory> {
      const { data, error } = await client
        .from("payment_history")
        .insert(toPaymentHistoryPayload(input))
        .select("*")
        .single();
      if (error) throw error;
      return toPaymentHistory(data);
    },
    async updatePayment(input: UpdatePaymentHistoryInput): Promise<PaymentHistory> {
      const { data, error } = await client
        .from("payment_history")
        .update(toPaymentHistoryPayload(input))
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return toPaymentHistory(data);
    },
  };

  const webhookEvents = {
    async getByEventId(eventId: string): Promise<WebhookEvent | null> {
      const { data, error } = await client
        .from("webhook_events")
        .select("*")
        .eq("event_id", eventId)
        .maybeSingle();
      if (error) throw error;
      return data ? toWebhookEvent(data) : null;
    },
    async createEvent(input: CreateWebhookEventInput): Promise<WebhookEvent> {
      const { data, error } = await client
        .from("webhook_events")
        .insert(toWebhookEventPayload(input))
        .select("*")
        .single();
      if (error) throw error;
      return toWebhookEvent(data);
    },
    async updateEvent(input: UpdateWebhookEventInput): Promise<WebhookEvent> {
      const { data, error } = await client
        .from("webhook_events")
        .update(toWebhookEventPayload(input))
        .eq("id", input.id)
        .select("*")
        .single();
      if (error) throw error;
      return toWebhookEvent(data);
    },
  };

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
    progress,
    storage: fileStorage,
    subscriptionPlans,
    subscriptions,
    paymentHistory,
    webhookEvents,
  };
};
