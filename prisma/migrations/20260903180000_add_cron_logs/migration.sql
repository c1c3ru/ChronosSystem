-- CreateTable
CREATE TABLE "cron_logs" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT,
    "errorMessage" TEXT,

    CONSTRAINT "cron_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cron_logs_jobName_startedAt_idx" ON "cron_logs"("jobName", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "cron_logs_status_idx" ON "cron_logs"("status");
