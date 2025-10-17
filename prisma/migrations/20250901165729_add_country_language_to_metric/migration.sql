-- Add country and language fields to Metric table
ALTER TABLE "Metric" ADD COLUMN "country" TEXT;
ALTER TABLE "Metric" ADD COLUMN "language" TEXT;

-- Add indexes for better performance
CREATE INDEX "idx_metric_country" ON "Metric"("country");
CREATE INDEX "idx_metric_language" ON "Metric"("language");
