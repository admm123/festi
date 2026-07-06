-- CreateTable
CREATE TABLE "group_message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "group_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_message_groupId_idx" ON "group_message"("groupId");

-- CreateIndex
CREATE INDEX "group_message_userId_idx" ON "group_message"("userId");

-- AddForeignKey
ALTER TABLE "group_message" ADD CONSTRAINT "group_message_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_message" ADD CONSTRAINT "group_message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
