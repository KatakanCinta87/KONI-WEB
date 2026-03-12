import { BracketsManager, type Database } from 'brackets-manager'
import { InMemoryDatabase } from 'brackets-memory-db'
import { Status } from 'brackets-model'
import { prisma } from '../lib/prisma.js'

type TournamentMatchStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'FORFEIT' | 'CANCELLED'
const eventTournamentModel = (prisma as any).eventTournament
const TERMINAL_MATCH_STATUSES: TournamentMatchStatus[] = ['COMPLETED', 'FORFEIT', 'CANCELLED']

function mapStageType(type: string) {
  return type === 'round_robin' ? 'ROUND_ROBIN' as const : 'KNOCKOUT' as const
}

function mapMatchStatus(status: number): TournamentMatchStatus {
  if (status === Status.Completed || status === Status.Archived) return 'COMPLETED'
  if (status === Status.Running) return 'ONGOING'
  return 'SCHEDULED'
}

function toBracketStatus(status: TournamentMatchStatus): number {
  if (status === 'COMPLETED' || status === 'FORFEIT') return Status.Completed
  if (status === 'CANCELLED') return Status.Archived
  if (status === 'ONGOING') return Status.Running
  return Status.Ready
}

export async function generateTournamentBracket(tournamentId: string) {
  const tournament = await eventTournamentModel.findUnique({
    where: { id: tournamentId },
    include: { participants: { orderBy: [{ seedNumber: 'asc' }, { createdAt: 'asc' }] } },
  })

  if (!tournament) throw new Error('Tournament tidak ditemukan')
  if (tournament.participants.length < 2) throw new Error('Minimal dua peserta diperlukan untuk generate bracket')

  const storage = new InMemoryDatabase()
  const manager = new BracketsManager(storage)
  const participantLabelMap = new Map<string, string>()

  const seeding = tournament.participants.map((participant: any) => {
    const label = `${participant.name} [${participant.id.slice(-6)}]`
    participantLabelMap.set(label, participant.id)
    return label
  })

  await manager.create({
    tournamentId: 1,
    name: 'Round Robin',
    type: 'round_robin',
    seeding,
    settings: { groupCount: tournament.roundRobinGroups || 1 },
  })

  // Phase 3A step 1: initial generate flow only creates round-robin stage.

  const data = await manager.export()

  await prisma.$transaction(async (tx) => {
    await (tx as any).eventTournamentStage.deleteMany({ where: { tournamentId: tournament.id } })
    await (tx as any).eventTournamentMatch.deleteMany({ where: { tournamentId: tournament.id } })
    await (tx as any).eventTournamentStanding.deleteMany({ where: { tournamentId: tournament.id } })

    for (const participant of data.participant) {
      const internalId = participantLabelMap.get(participant.name)
      if (internalId) {
        await (tx as any).eventTournamentParticipant.update({
          where: { id: internalId },
          data: { bracketParticipantId: Number(participant.id) },
        })
      }
    }

    const stageRowsByGroupId = new Map<number | string, string>()
    for (const group of data.group) {
      const stage = data.stage.find((item) => item.id === group.stage_id)
      if (!stage) continue
      const rounds = data.round.filter((round) => round.group_id === group.id)

      const created = await (tx as any).eventTournamentStage.create({
        data: {
          tournamentId: tournament.id,
          type: mapStageType(stage.type),
          name: `${stage.name}${data.group.length > 1 ? ` Group ${group.number}` : ''}`,
          stageOrder: stage.number,
          groupNumber: group.number,
          roundCount: rounds.length,
          bracketStageId: stage.id,
        },
      })
      stageRowsByGroupId.set(group.id as number | string, created.id)
    }

    const participants = await (tx as any).eventTournamentParticipant.findMany({ where: { tournamentId: tournament.id } })
    const participantByBracketId = new Map<number, string>(
      participants
        .filter((p: any) => typeof p.bracketParticipantId === 'number' && typeof p.id === 'string')
        .map((p: any) => [p.bracketParticipantId as number, p.id as string]),
    )

    for (const match of data.match) {
      const stageId = stageRowsByGroupId.get(match.group_id)
      if (!stageId) continue

      const homeId = match.opponent1?.id != null ? participantByBracketId.get(match.opponent1.id as number) : undefined
      const awayId = match.opponent2?.id != null ? participantByBracketId.get(match.opponent2.id as number) : undefined

      const homeScore = match.opponent1?.score ?? null
      const awayScore = match.opponent2?.score ?? null
      let winnerId: string | undefined
      if (homeId && awayId && homeScore !== null && awayScore !== null) {
        if (homeScore > awayScore) winnerId = homeId
        else if (awayScore > homeScore) winnerId = awayId
      }

      await (tx as any).eventTournamentMatch.create({
        data: {
          tournamentId: tournament.id,
          stageId,
          bracketMatchId: match.id,
          matchNumber: match.number,
          roundNumber: data.round.find((item) => item.id === match.round_id)?.number ?? 1,
          groupNumber: data.group.find((item) => item.id === match.group_id)?.number,
          homeParticipantId: homeId,
          awayParticipantId: awayId,
          homeScore,
          awayScore,
          winnerParticipantId: winnerId,
          status: mapMatchStatus(match.status),
        },
      })
    }

    await (tx as any).eventTournament.update({
      where: { id: tournament.id },
      data: { status: 'GENERATED', generatedAt: new Date(), bracketData: data as unknown as object },
    })
  })
}

export async function generateKnockoutFromRoundRobin(tournamentId: string) {
  const tournament = await eventTournamentModel.findUnique({
    where: { id: tournamentId },
    include: {
      participants: true,
      stages: true,
      matches: true,
      standings: true,
    },
  })

  if (!tournament) throw new Error('Tournament tidak ditemukan')
  if (!tournament.bracketData) throw new Error('Bracket round-robin belum digenerate')

  const rrStages = tournament.stages.filter((stage: any) => stage.type === 'ROUND_ROBIN')
  if (rrStages.length === 0) throw new Error('Stage round-robin tidak ditemukan')

  const existingKo = tournament.stages.find((stage: any) => stage.type === 'KNOCKOUT')
  if (existingKo) throw new Error('Stage knockout sudah digenerate')

  const rrStageIds = new Set(rrStages.map((stage: any) => stage.id))
  const rrMatches = tournament.matches.filter((match: any) => match.stageId && rrStageIds.has(match.stageId))
  if (rrMatches.length === 0) throw new Error('Match round-robin tidak ditemukan')

  const unresolvedRr = rrMatches.some((match: any) => (
    match.status !== 'COMPLETED'
    || match.homeParticipantId === null
    || match.awayParticipantId === null
    || match.homeScore === null
    || match.awayScore === null
  ))
  if (unresolvedRr) throw new Error('Round-robin belum selesai. Selesaikan semua match RR sebelum generate knockout')

  const standings = [...tournament.standings].sort((a: any, b: any) => {
    if (a.rank !== b.rank) return a.rank - b.rank
    if (b.points !== a.points) return b.points - a.points
    if (b.scoreDiff !== a.scoreDiff) return b.scoreDiff - a.scoreDiff
    return b.scoreFor - a.scoreFor
  })
  if (standings.length < 2) throw new Error('Standings round-robin belum tersedia untuk seeding knockout')

  const knockoutTarget = tournament.knockoutQualified && tournament.knockoutQualified > 1
    ? tournament.knockoutQualified
    : Math.min(4, standings.length)
  const qualifiedCount = Math.min(knockoutTarget, standings.length)
  if (qualifiedCount < 2) throw new Error('Peserta lolos knockout minimal dua')

  const participantById = new Map<string, any>(tournament.participants.map((participant: any) => [participant.id, participant]))
  const seeding = standings.slice(0, qualifiedCount).map((standing: any) => {
    const participant = participantById.get(standing.participantId)
    if (!participant) throw new Error('Peserta standings tidak valid')
    return `${participant.name} [${participant.id.slice(-6)}]`
  })

  const storage = new InMemoryDatabase()
  const manager = new BracketsManager(storage)
  await manager.import(tournament.bracketData as Database)
  await manager.create({
    tournamentId: 1,
    name: 'Knockout',
    type: 'single_elimination',
    seeding,
  })

  const nextData = await manager.export()
  const participantByBracketId = new Map<number, string>(
    tournament.participants
      .filter((participant: any) => typeof participant.bracketParticipantId === 'number' && typeof participant.id === 'string')
      .map((participant: any) => [participant.bracketParticipantId as number, participant.id as string]),
  )

  await prisma.$transaction(async (tx) => {
    const koStageIds = tournament.stages
      .filter((stage: any) => stage.type === 'KNOCKOUT')
      .map((stage: any) => stage.id)

    if (koStageIds.length > 0) {
      await (tx as any).eventTournamentMatch.deleteMany({ where: { tournamentId: tournament.id, stageId: { in: koStageIds } } })
      await (tx as any).eventTournamentStage.deleteMany({ where: { id: { in: koStageIds } } })
    }

    const stageRowsByGroupId = new Map<number | string, string>()
    for (const group of nextData.group) {
      const stage = nextData.stage.find((item) => item.id === group.stage_id)
      if (!stage || stage.type !== 'single_elimination') continue
      const rounds = nextData.round.filter((round) => round.group_id === group.id)

      const created = await (tx as any).eventTournamentStage.create({
        data: {
          tournamentId: tournament.id,
          type: 'KNOCKOUT',
          name: stage.name,
          stageOrder: stage.number,
          groupNumber: group.number,
          roundCount: rounds.length,
          bracketStageId: stage.id,
        },
      })
      stageRowsByGroupId.set(group.id as number | string, created.id)
    }

    for (const match of nextData.match) {
      const group = nextData.group.find((item) => item.id === match.group_id)
      const stage = group ? nextData.stage.find((item) => item.id === group.stage_id) : null
      if (!stage || stage.type !== 'single_elimination') continue

      const stageId = stageRowsByGroupId.get(match.group_id)
      if (!stageId) continue

      const homeId = match.opponent1?.id != null ? participantByBracketId.get(match.opponent1.id as number) : undefined
      const awayId = match.opponent2?.id != null ? participantByBracketId.get(match.opponent2.id as number) : undefined

      const homeScore = match.opponent1?.score ?? null
      const awayScore = match.opponent2?.score ?? null
      let winnerId: string | undefined
      if (homeId && awayId && homeScore !== null && awayScore !== null) {
        if (homeScore > awayScore) winnerId = homeId
        else if (awayScore > homeScore) winnerId = awayId
      }

      await (tx as any).eventTournamentMatch.create({
        data: {
          tournamentId: tournament.id,
          stageId,
          bracketMatchId: match.id,
          matchNumber: match.number,
          roundNumber: nextData.round.find((item) => item.id === match.round_id)?.number ?? 1,
          groupNumber: group?.number ?? null,
          homeParticipantId: homeId,
          awayParticipantId: awayId,
          homeScore,
          awayScore,
          winnerParticipantId: winnerId,
          status: mapMatchStatus(match.status),
        },
      })
    }

    await (tx as any).eventTournament.update({
      where: { id: tournament.id },
      data: { bracketData: nextData as unknown as object },
    })
  })

  return {
    qualifiedCount,
    seeding,
    topParticipants: standings.slice(0, qualifiedCount).map((item: any) => ({
      rank: item.rank,
      participantId: item.participantId,
      points: item.points,
      scoreDiff: item.scoreDiff,
      scoreFor: item.scoreFor,
    })),
  }
}

export async function updateTournamentMatchWithBracket(params: {
  tournamentId: string
  matchId: string
  homeScore: number
  awayScore: number
  status: TournamentMatchStatus
  notes?: string
}) {
  const tournament = await eventTournamentModel.findUnique({
    where: { id: params.tournamentId },
    include: { matches: { include: { stage: { select: { type: true } } } }, participants: true },
  })

  if (!tournament || !tournament.bracketData) throw new Error('Tournament belum digenerate')

  const targetMatch = tournament.matches.find((match: any) => match.id === params.matchId)
  if (!targetMatch || targetMatch.bracketMatchId === null) throw new Error('Match tidak valid untuk update')
  if (targetMatch.stage?.type === 'KNOCKOUT' && params.homeScore === params.awayScore) {
    throw new Error('Match knockout tidak boleh berakhir draw')
  }
  if (TERMINAL_MATCH_STATUSES.includes(targetMatch.status) && !TERMINAL_MATCH_STATUSES.includes(params.status)) {
    throw new Error('Match terminal tidak dapat dibuka ulang ke status non-terminal')
  }

  const storage = new InMemoryDatabase()
  const manager = new BracketsManager(storage)
  await manager.import(tournament.bracketData as Database)

  await manager.update.match({
    id: targetMatch.bracketMatchId,
    status: toBracketStatus(params.status),
    opponent1: { score: params.homeScore },
    opponent2: { score: params.awayScore },
  })

  const nextData = await manager.export()
  const participantByBracketId = new Map<number, string>(
    tournament.participants
      .filter((p: any) => typeof p.bracketParticipantId === 'number' && typeof p.id === 'string')
      .map((p: any) => [p.bracketParticipantId as number, p.id as string]),
  )

  await prisma.$transaction(async (tx) => {
    for (const match of nextData.match) {
      const localMatch = tournament.matches.find((item: any) => item.bracketMatchId === Number(match.id))
      if (!localMatch) continue

      const homeId = match.opponent1?.id != null ? participantByBracketId.get(match.opponent1.id as number) : undefined
      const awayId = match.opponent2?.id != null ? participantByBracketId.get(match.opponent2.id as number) : undefined
      const homeScore = match.opponent1?.score ?? null
      const awayScore = match.opponent2?.score ?? null

      let winnerParticipantId: string | null = null
      if (homeId && awayId && homeScore !== null && awayScore !== null) {
        if (homeScore > awayScore) winnerParticipantId = homeId
        else if (awayScore > homeScore) winnerParticipantId = awayId
      }

      await (tx as any).eventTournamentMatch.update({
        where: { id: localMatch.id },
        data: {
          homeParticipantId: homeId,
          awayParticipantId: awayId,
          homeScore,
          awayScore,
          winnerParticipantId,
          status: localMatch.id === params.matchId
            ? params.status
            : (
              localMatch.status === 'FORFEIT' || localMatch.status === 'CANCELLED'
                ? localMatch.status
                : mapMatchStatus(match.status)
            ),
          notes: localMatch.id === params.matchId ? params.notes ?? localMatch.notes : localMatch.notes,
        },
      })
    }

    await (tx as any).eventTournament.update({
      where: { id: tournament.id },
      data: { bracketData: nextData as unknown as object },
    })
  })
}

