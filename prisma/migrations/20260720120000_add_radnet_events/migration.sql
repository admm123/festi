-- CreateTable
CREATE TABLE "radnet_event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "distances" INTEGER[],
    "club" TEXT,
    "lvAbbr" TEXT,
    "detailUrl" TEXT NOT NULL,
    "struckThrough" BOOLEAN NOT NULL DEFAULT false,
    "landesverband" TEXT,
    "startZip" TEXT,
    "startCity" TEXT,
    "startVenue" TEXT,
    "startTime" TEXT,
    "website" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancelReason" TEXT,
    "detailSyncedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "radnet_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "radnet_sync_state" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "listSyncedAt" TIMESTAMP(3),
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "radnet_sync_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "radnet_event_date_idx" ON "radnet_event"("date");

-- CreateIndex
CREATE INDEX "radnet_event_detailSyncedAt_idx" ON "radnet_event"("detailSyncedAt");

