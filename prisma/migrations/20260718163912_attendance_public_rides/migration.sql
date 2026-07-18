-- AlterEnum
ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_ATTENDANCE_MARKED';

-- AlterTable
ALTER TABLE "ride" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ride_participant" ADD COLUMN     "attended" BOOLEAN;
