import { prisma } from '../lib/prisma.js'
import { buildTournamentStandings } from './tournament-ranking.service.js'

const eventTournamentModel = (prisma as any).eventTournament
const eventTournamentStandingModel = (prisma as any).eventTournamentStanding

export async function recomputeTournamentStandings(tournamentId: string) {
  const tournament = await eventTournamentModel.findUnique({
    where: { id: tournamentId },
    include: {
      participants: { include: { athlete: { select: { caborId: true } } } },
      matches: {
        select: {
          homeParticipantId: true,
          awayParticipantId: true,
          homeScore: true,
          awayScore: true,
          status: true,
          stage: { select: { type: true } },
        },
      },
    },
  })

  if (!tournament) throw new Error('Tournament tidak ditemukan')

  const standings = buildTournamentStandings({
    participants: tournament.participants,
    matches: tournament.matches.map((match: any) => ({
      homeParticipantId: match.homeParticipantId,
      awayParticipantId: match.awayParticipantId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      status: match.status,
      stageType: match.stage?.type ?? null,
    })),
    includeStageTypes: ['ROUND_ROBIN'],
  })

  await prisma.$transaction(async (tx) => {
    await (tx as any).eventTournamentStanding.deleteMany({ where: { tournamentId } })
    if (standings.length > 0) {
      await (tx as any).eventTournamentStanding.createMany({
        data: standings.map((item) => ({
          tournamentId,
          participantId: item.participantId,
          caborId: item.caborId,
          rank: item.rank,
          points: item.points,
          played: item.played,
          win: item.win,
          draw: item.draw,
          loss: item.loss,
          scoreFor: item.scoreFor,
          scoreAgainst: item.scoreAgainst,
          scoreDiff: item.scoreDiff,
          tieBreakNotes: item.tieBreakNotes,
        })),
      })
    }
  })
  return standings
}

export async function recomputeEventMedalFromTournament(params: {
  tournamentId: string
  eventId: string
  userId?: string
  notes?: string
}) {
  const standings = await eventTournamentStandingModel.findMany({
    where: { tournamentId: params.tournamentId },
    orderBy: [{ rank: 'asc' }, { points: 'desc' }, { scoreDiff: 'desc' }, { scoreFor: 'desc' }],
  })

  if (standings.length === 0) return []

  const medalData = standings
    .filter((row: any) => row.caborId)
    .slice(0, 3)
    .map((row: any, index: number) => ({
      caborId: row.caborId!,
      gold: index === 0 ? 1 : 0,
      silver: index === 1 ? 1 : 0,
      bronze: index === 2 ? 1 : 0,
      rank: row.rank,
    }))

  await prisma.$transaction(async (tx) => {
    for (const entry of medalData) {
      const existing = await (tx as any).medalStanding.findUnique({
        where: { eventId_caborId: { eventId: params.eventId, caborId: entry.caborId } },
      })

      if (!existing) {
        await (tx as any).medalStanding.create({
          data: {
            eventId: params.eventId,
            caborId: entry.caborId,
            gold: entry.gold,
            silver: entry.silver,
            bronze: entry.bronze,
            rank: entry.rank,
            manualOverride: false,
            lastSource: 'AUTO',
            updatedByUserId: params.userId,
          },
        })
        continue
      }

      if (existing.manualOverride) continue

      await (tx as any).medalStanding.update({
        where: { id: existing.id },
        data: {
          gold: entry.gold,
          silver: entry.silver,
          bronze: entry.bronze,
          rank: entry.rank,
          lastSource: 'AUTO',
          updatedByUserId: params.userId,
        },
      })
    }

    await (tx as any).eventMedalUpdateLog.create({
      data: {
        eventId: params.eventId,
        source: 'AUTO',
        notes: params.notes ?? 'Auto recompute from tournament standings',
        payload: { tournamentId: params.tournamentId, medals: medalData },
        updatedByUserId: params.userId,
      },
    })
  })
  return medalData
}

