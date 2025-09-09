-- CreateIndex
CREATE INDEX "idx_follow_gameId_createdAt" ON "public"."Follow"("gameId", "createdAt");

-- CreateIndex
CREATE INDEX "idx_metric_gameId_timestamp" ON "public"."Metric"("gameId", "timestamp");

-- CreateIndex
CREATE INDEX "idx_vote_productId_createdAt" ON "public"."Vote"("productId", "createdAt");
