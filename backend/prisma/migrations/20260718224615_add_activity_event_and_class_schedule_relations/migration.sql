-- CreateEnum
CREATE TYPE "activity_action" AS ENUM ('professor_promoted', 'professor_revoked', 'class_created', 'class_updated', 'class_deactivated', 'check_in_approved', 'check_in_rejected', 'belt_promoted', 'plan_created', 'plan_updated', 'plan_deactivated', 'subscription_assigned', 'subscription_changed');

-- CreateTable
CREATE TABLE "activity_events" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" "activity_action" NOT NULL,
    "subject_member_id" TEXT,
    "subject_class_id" TEXT,
    "subject_plan_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_subject_member_id_fkey" FOREIGN KEY ("subject_member_id") REFERENCES "academy_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_subject_class_id_fkey" FOREIGN KEY ("subject_class_id") REFERENCES "class_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_events" ADD CONSTRAINT "activity_events_subject_plan_id_fkey" FOREIGN KEY ("subject_plan_id") REFERENCES "membership_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_instructor_id_fkey" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
