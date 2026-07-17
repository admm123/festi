-- CreateEnum
CREATE TYPE "GroupMemberStatus" AS ENUM ('PENDING', 'APPROVED');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('SCHEDULED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_UPDATED';
ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_CANCELLED';
ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_JOIN_WITHDRAWN';
ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_LEFT';
ALTER TYPE "ActivityAction" ADD VALUE 'GROUP_JOIN_REQUESTED';
ALTER TYPE "ActivityAction" ADD VALUE 'GROUP_MEMBER_REJECTED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'GROUP_JOIN_REQUESTED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_JOIN_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_JOIN_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'RIDE_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'RIDE_CANCELLED';

-- AlterTable
ALTER TABLE "group_member" ADD COLUMN     "status" "GroupMemberStatus" NOT NULL DEFAULT 'APPROVED';

-- AlterTable
ALTER TABLE "ride" ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "maxParticipants" INTEGER,
ADD COLUMN     "pace" TEXT,
ADD COLUMN     "status" "RideStatus" NOT NULL DEFAULT 'SCHEDULED';

-- CreateIndex
CREATE INDEX "ride_status_startTime_idx" ON "ride"("status", "startTime");
