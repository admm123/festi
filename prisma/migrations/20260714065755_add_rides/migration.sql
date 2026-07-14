-- CreateEnum
CREATE TYPE "RideParticipantStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_CREATED';
ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_JOIN_REQUESTED';
ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_JOIN_APPROVED';
ALTER TYPE "ActivityAction" ADD VALUE 'RIDE_JOIN_REJECTED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'RIDE_JOIN_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'RIDE_JOIN_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'RIDE_JOIN_REJECTED';

-- CreateTable
CREATE TABLE "ride" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "elevationGain" INTEGER NOT NULL DEFAULT 0,
    "elevationLoss" INTEGER NOT NULL DEFAULT 0,
    "routeGeometry" TEXT NOT NULL,
    "waypoints" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ride_participant" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RideParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ride_participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ride_creatorId_idx" ON "ride"("creatorId");

-- CreateIndex
CREATE INDEX "ride_startTime_idx" ON "ride"("startTime");

-- CreateIndex
CREATE INDEX "ride_participant_rideId_idx" ON "ride_participant"("rideId");

-- CreateIndex
CREATE INDEX "ride_participant_userId_idx" ON "ride_participant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ride_participant_rideId_userId_key" ON "ride_participant"("rideId", "userId");

-- AddForeignKey
ALTER TABLE "ride" ADD CONSTRAINT "ride_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_participant" ADD CONSTRAINT "ride_participant_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ride_participant" ADD CONSTRAINT "ride_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
