-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('USER_REGISTERED', 'USER_LOGGED_IN', 'USER_LOGGED_OUT', 'USER_UPDATED_PROFILE', 'USER_CHANGED_PASSWORD', 'USER_BANNED', 'USER_UNBANNED', 'USER_ROLE_CHANGED', 'USER_FOLLOWED', 'USER_UNFOLLOWED', 'GROUP_CREATED', 'GROUP_UPDATED', 'GROUP_DELETED', 'GROUP_JOINED', 'GROUP_LEFT', 'GROUP_MEMBER_APPROVED', 'GROUP_MEMBER_REMOVED', 'GROUP_MESSAGE_SENT', 'OTHER');

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "actorId" TEXT,
    "targetUserId" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_log_action_idx" ON "activity_log"("action");

-- CreateIndex
CREATE INDEX "activity_log_actorId_idx" ON "activity_log"("actorId");

-- CreateIndex
CREATE INDEX "activity_log_targetUserId_idx" ON "activity_log"("targetUserId");

-- CreateIndex
CREATE INDEX "activity_log_targetType_targetId_idx" ON "activity_log"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "activity_log_createdAt_idx" ON "activity_log"("createdAt");

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
