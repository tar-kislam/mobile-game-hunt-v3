DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'NewsletterSubscription'
      AND column_name = 'source'
  ) THEN
    ALTER TABLE "public"."NewsletterSubscription"
    ADD COLUMN "source" TEXT NOT NULL DEFAULT 'newsletter';
  END IF;
END $$;
