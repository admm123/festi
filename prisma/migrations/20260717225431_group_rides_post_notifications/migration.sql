-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'POST_LIKED';
ALTER TYPE "ActivityAction" ADD VALUE 'POST_COMMENTED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'GROUP_RIDE_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'POST_LIKED';
ALTER TYPE "NotificationType" ADD VALUE 'POST_COMMENTED';

-- AlterTable
ALTER TABLE "ride" ADD COLUMN     "groupId" TEXT;

-- CreateIndex
CREATE INDEX "ride_groupId_idx" ON "ride"("groupId");

-- AddForeignKey
ALTER TABLE "ride" ADD CONSTRAINT "ride_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
