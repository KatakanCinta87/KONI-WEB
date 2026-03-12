DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'EventType' AND e.enumlabel = 'PON'
  ) THEN
    ALTER TYPE "EventType" ADD VALUE 'PON';
  END IF;
END $$;
