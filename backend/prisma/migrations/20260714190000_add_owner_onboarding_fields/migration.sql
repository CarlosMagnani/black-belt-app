-- AlterTable
ALTER TABLE "users" ADD COLUMN "belt" "Belt";
ALTER TABLE "users" ADD COLUMN "degree" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "academies" ADD COLUMN "logo_url" TEXT;
