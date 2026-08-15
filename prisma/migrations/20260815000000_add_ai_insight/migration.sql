-- CreateTable
CREATE TABLE "ai_insight" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "feedbackCount" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "model" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_insight_type_periodStart_periodEnd_idx" ON "ai_insight"("type", "periodStart", "periodEnd");
