-- CreateTable
CREATE TABLE "ride_photo" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ride_photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ride_photo_rideId_idx" ON "ride_photo"("rideId");

-- AddForeignKey
ALTER TABLE "ride_photo" ADD CONSTRAINT "ride_photo_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;
