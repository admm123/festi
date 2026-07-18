-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'GROUP_MEMBER_ROLE_CHANGED';
ALTER TYPE "ActivityAction" ADD VALUE 'GROUP_ANNOUNCEMENT_CREATED';
ALTER TYPE "ActivityAction" ADD VALUE 'ROUTE_SAVED';
ALTER TYPE "ActivityAction" ADD VALUE 'ROUTE_DELETED';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'GROUP_ANNOUNCEMENT';

-- CreateTable
CREATE TABLE "route" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "groupId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "distance" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "elevationGain" INTEGER NOT NULL DEFAULT 0,
    "elevationLoss" INTEGER NOT NULL DEFAULT 0,
    "routeGeometry" TEXT NOT NULL,
    "waypoints" JSONB NOT NULL,
    "elevationProfile" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_announcement" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "route_creatorId_idx" ON "route"("creatorId");

-- CreateIndex
CREATE INDEX "route_groupId_idx" ON "route"("groupId");

-- CreateIndex
CREATE INDEX "group_announcement_groupId_idx" ON "group_announcement"("groupId");

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_announcement" ADD CONSTRAINT "group_announcement_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_announcement" ADD CONSTRAINT "group_announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
