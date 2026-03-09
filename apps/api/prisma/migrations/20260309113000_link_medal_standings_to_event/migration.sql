-- Ensure table is empty before reshaping uniqueness semantics from global-per-cabor
-- to per-event-per-cabor standings.
DELETE FROM "MedalStanding";

-- Add event relation and timestamps needed by the current schema.
ALTER TABLE "MedalStanding"
ADD COLUMN "eventId" TEXT,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Remove the old global uniqueness on cabor.
DROP INDEX IF EXISTS "MedalStanding_caborId_key";

-- eventId is required for all standings.
ALTER TABLE "MedalStanding"
ALTER COLUMN "eventId" SET NOT NULL;

-- Add FK and per-event uniqueness.
ALTER TABLE "MedalStanding"
ADD CONSTRAINT "MedalStanding_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "MedalStanding_eventId_caborId_key" ON "MedalStanding"("eventId", "caborId");
CREATE INDEX "MedalStanding_eventId_rank_updatedAt_idx" ON "MedalStanding"("eventId", "rank", "updatedAt");
