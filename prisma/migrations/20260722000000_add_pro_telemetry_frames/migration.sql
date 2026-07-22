-- CreateTable
CREATE TABLE "pro_telemetry_frame" (
    "id" TEXT NOT NULL,
    "raceKey" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "stage" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pro_telemetry_frame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pro_telemetry_frame_raceKey_year_stage_capturedAt_key" ON "pro_telemetry_frame"("raceKey", "year", "stage", "capturedAt");

-- CreateIndex
CREATE INDEX "pro_telemetry_frame_raceKey_year_stage_idx" ON "pro_telemetry_frame"("raceKey", "year", "stage");
