-- AlterEnum
ALTER TYPE "ActivityAction" ADD VALUE 'DIRECT_MESSAGE_SENT';

-- CreateTable
CREATE TABLE "direct_message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,

    CONSTRAINT "direct_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "direct_message_senderId_idx" ON "direct_message"("senderId");

-- CreateIndex
CREATE INDEX "direct_message_recipientId_idx" ON "direct_message"("recipientId");

-- CreateIndex
CREATE INDEX "direct_message_senderId_recipientId_idx" ON "direct_message"("senderId", "recipientId");

-- AddForeignKey
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
