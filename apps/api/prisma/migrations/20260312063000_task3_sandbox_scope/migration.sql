-- Add data scope enum for official/sandbox data segregation
CREATE TYPE "DataScope" AS ENUM ('OFFICIAL', 'SANDBOX');

-- Event scope (future governance for homepage/public source)
ALTER TABLE "Event"
ADD COLUMN "scope" "DataScope" NOT NULL DEFAULT 'OFFICIAL';

-- Tournament scope + ownership for sandbox isolation
ALTER TABLE "EventTournament"
ADD COLUMN "scope" "DataScope" NOT NULL DEFAULT 'OFFICIAL',
ADD COLUMN "ownerUserId" TEXT,
ADD COLUMN "ownerRole" "UserRole";

-- Query support indexes
CREATE INDEX "Event_scope_status_startDate_endDate_idx"
ON "Event"("scope", "status", "startDate", "endDate");

CREATE INDEX "EventTournament_eventId_scope_ownerUserId_status_idx"
ON "EventTournament"("eventId", "scope", "ownerUserId", "status");

-- Sandbox duplicate guard per user per event
CREATE UNIQUE INDEX "EventTournament_eventId_scope_ownerUserId_name_key"
ON "EventTournament"("eventId", "scope", "ownerUserId", "name");
