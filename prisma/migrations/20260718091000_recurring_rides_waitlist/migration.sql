-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_WAITLISTED';
ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_WAITLIST_PROMOTED';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'RIDE_WAITLIST_PROMOTED';

-- AlterEnum
ALTER TYPE "RideParticipantStatus" ADD VALUE 'WAITLISTED';

-- AlterTable
ALTER TABLE "ride" ADD COLUMN     "recurrenceId" TEXT;

-- CreateIndex
CREATE INDEX "ride_recurrenceId_idx" ON "ride"("recurrenceId");
