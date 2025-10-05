-- CreateIndex
CREATE INDEX "Metric_gameId_type_idx" ON "public"."Metric"("gameId", "type");

-- CreateIndex
CREATE INDEX "Metric_timestamp_idx" ON "public"."Metric"("timestamp");

-- CreateIndex
CREATE INDEX "Metric_type_idx" ON "public"."Metric"("type");
