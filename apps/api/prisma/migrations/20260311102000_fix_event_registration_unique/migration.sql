-- Adjust EventRegistration uniqueness to enforce one registration per athlete per event
DROP INDEX IF EXISTS "EventRegistration_eventId_athleteId_matchNumber_key";
CREATE UNIQUE INDEX IF NOT EXISTS "EventRegistration_eventId_athleteId_key" ON "EventRegistration"("eventId", "athleteId");

-- Support common filtering path for admin/public registration queries
CREATE INDEX IF NOT EXISTS "EventRegistration_eventId_caborId_status_idx" ON "EventRegistration"("eventId", "caborId", "status");
