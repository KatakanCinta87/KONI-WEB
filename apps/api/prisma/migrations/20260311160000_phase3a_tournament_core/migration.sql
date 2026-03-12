-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'GENERATED', 'ONGOING', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TournamentParticipantType" AS ENUM ('CABOR_CONTINGENT', 'ATHLETE');

-- CreateEnum
CREATE TYPE "TournamentStageType" AS ENUM ('ROUND_ROBIN', 'KNOCKOUT');

-- CreateEnum
CREATE TYPE "TournamentMatchStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'FORFEIT', 'CANCELLED');

-- AlterTable
ALTER TABLE "MedalStanding"
ADD COLUMN "manualOverride" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "lastSource" TEXT NOT NULL DEFAULT 'AUTO',
ADD COLUMN "updatedByUserId" TEXT;

-- CreateTable
CREATE TABLE "EventTournament" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "participantType" "TournamentParticipantType" NOT NULL,
    "caborId" TEXT,
    "totalParticipantsTarget" INTEGER,
    "roundRobinGroups" INTEGER NOT NULL DEFAULT 1,
    "knockoutQualified" INTEGER,
    "bracketData" JSONB,
    "generatedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTournamentStage" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "type" "TournamentStageType" NOT NULL,
    "name" TEXT NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "groupNumber" INTEGER,
    "roundCount" INTEGER,
    "bracketStageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTournamentStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTournamentParticipant" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "participantType" "TournamentParticipantType" NOT NULL,
    "caborId" TEXT,
    "athleteId" TEXT,
    "seedNumber" INTEGER,
    "name" TEXT NOT NULL,
    "bracketParticipantId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTournamentParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTournamentMatch" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "stageId" TEXT,
    "matchNumber" INTEGER NOT NULL,
    "bracketMatchId" INTEGER,
    "roundNumber" INTEGER NOT NULL,
    "groupNumber" INTEGER,
    "homeParticipantId" TEXT,
    "awayParticipantId" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "winnerParticipantId" TEXT,
    "status" "TournamentMatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTournamentMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTournamentStanding" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "caborId" TEXT,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "played" INTEGER NOT NULL DEFAULT 0,
    "win" INTEGER NOT NULL DEFAULT 0,
    "draw" INTEGER NOT NULL DEFAULT 0,
    "loss" INTEGER NOT NULL DEFAULT 0,
    "scoreFor" INTEGER NOT NULL DEFAULT 0,
    "scoreAgainst" INTEGER NOT NULL DEFAULT 0,
    "scoreDiff" INTEGER NOT NULL DEFAULT 0,
    "tieBreakNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventTournamentStanding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMedalUpdateLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "notes" TEXT,
    "payload" JSONB,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventMedalUpdateLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventTournament_eventId_status_idx" ON "EventTournament"("eventId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EventTournamentStage_tournamentId_stageOrder_groupNumber_key" ON "EventTournamentStage"("tournamentId", "stageOrder", "groupNumber");

-- CreateIndex
CREATE INDEX "EventTournamentParticipant_tournamentId_participantType_idx" ON "EventTournamentParticipant"("tournamentId", "participantType");

-- CreateIndex
CREATE UNIQUE INDEX "EventTournamentParticipant_tournamentId_caborId_athleteId_key" ON "EventTournamentParticipant"("tournamentId", "caborId", "athleteId");

-- CreateIndex
CREATE INDEX "EventTournamentMatch_tournamentId_stageId_roundNumber_idx" ON "EventTournamentMatch"("tournamentId", "stageId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "EventTournamentStanding_tournamentId_participantId_key" ON "EventTournamentStanding"("tournamentId", "participantId");

-- CreateIndex
CREATE INDEX "EventTournamentStanding_tournamentId_rank_idx" ON "EventTournamentStanding"("tournamentId", "rank");

-- CreateIndex
CREATE INDEX "EventMedalUpdateLog_eventId_createdAt_idx" ON "EventMedalUpdateLog"("eventId", "createdAt");

-- AddForeignKey
ALTER TABLE "MedalStanding" ADD CONSTRAINT "MedalStanding_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournament" ADD CONSTRAINT "EventTournament_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournament" ADD CONSTRAINT "EventTournament_caborId_fkey" FOREIGN KEY ("caborId") REFERENCES "CabangOlahraga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentStage" ADD CONSTRAINT "EventTournamentStage_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "EventTournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentParticipant" ADD CONSTRAINT "EventTournamentParticipant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "EventTournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentParticipant" ADD CONSTRAINT "EventTournamentParticipant_caborId_fkey" FOREIGN KEY ("caborId") REFERENCES "CabangOlahraga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentParticipant" ADD CONSTRAINT "EventTournamentParticipant_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentMatch" ADD CONSTRAINT "EventTournamentMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "EventTournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentMatch" ADD CONSTRAINT "EventTournamentMatch_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "EventTournamentStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentMatch" ADD CONSTRAINT "EventTournamentMatch_homeParticipantId_fkey" FOREIGN KEY ("homeParticipantId") REFERENCES "EventTournamentParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentMatch" ADD CONSTRAINT "EventTournamentMatch_awayParticipantId_fkey" FOREIGN KEY ("awayParticipantId") REFERENCES "EventTournamentParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentMatch" ADD CONSTRAINT "EventTournamentMatch_winnerParticipantId_fkey" FOREIGN KEY ("winnerParticipantId") REFERENCES "EventTournamentParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentStanding" ADD CONSTRAINT "EventTournamentStanding_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "EventTournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentStanding" ADD CONSTRAINT "EventTournamentStanding_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "EventTournamentParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournamentStanding" ADD CONSTRAINT "EventTournamentStanding_caborId_fkey" FOREIGN KEY ("caborId") REFERENCES "CabangOlahraga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMedalUpdateLog" ADD CONSTRAINT "EventMedalUpdateLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMedalUpdateLog" ADD CONSTRAINT "EventMedalUpdateLog_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
