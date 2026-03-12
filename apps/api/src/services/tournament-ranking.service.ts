type TournamentParticipantType = 'CABOR_CONTINGENT' | 'ATHLETE'
type TournamentStageType = 'ROUND_ROBIN' | 'KNOCKOUT'

interface StandingAccumulator {
  participantId: string
  caborId: string | null
  points: number
  played: number
  win: number
  draw: number
  loss: number
  scoreFor: number
  scoreAgainst: number
  scoreDiff: number
}

function resolveHeadToHeadWinner(
  participantA: string,
  participantB: string,
  completedMatches: Array<{ homeParticipantId: string | null; awayParticipantId: string | null; homeScore: number | null; awayScore: number | null }>,
) {
  let aPoints = 0
  let bPoints = 0

  for (const match of completedMatches) {
    if (!match.homeParticipantId || !match.awayParticipantId) continue
    const pairMatches =
      (match.homeParticipantId === participantA && match.awayParticipantId === participantB)
      || (match.homeParticipantId === participantB && match.awayParticipantId === participantA)

    if (!pairMatches || match.homeScore === null || match.awayScore === null) continue

    const aScore = match.homeParticipantId === participantA ? match.homeScore : match.awayScore
    const bScore = match.homeParticipantId === participantA ? match.awayScore : match.homeScore

    if (aScore > bScore) aPoints += 3
    else if (aScore < bScore) bPoints += 3
    else {
      aPoints += 1
      bPoints += 1
    }
  }

  if (aPoints === bPoints) return 0
  return aPoints > bPoints ? -1 : 1
}

export function buildTournamentStandings(params: {
  participants: Array<{
    id: string
    participantType: TournamentParticipantType
    caborId: string | null
    athlete?: { caborId: string } | null
  }>
  matches: Array<{
    homeParticipantId: string | null
    awayParticipantId: string | null
    homeScore: number | null
    awayScore: number | null
    status: string
    stageType?: TournamentStageType | null
  }>
  includeStageTypes?: TournamentStageType[]
}) {
  const includedStageTypes = new Set<TournamentStageType>(
    params.includeStageTypes && params.includeStageTypes.length > 0
      ? params.includeStageTypes
      : ['ROUND_ROBIN'],
  )

  const participantToCabor = new Map<string, string | null>()
  const table = new Map<string, StandingAccumulator>()

  for (const participant of params.participants) {
    const caborId = participant.participantType === 'CABOR_CONTINGENT'
      ? participant.caborId
      : (participant.athlete?.caborId ?? null)

    participantToCabor.set(participant.id, caborId)
    table.set(participant.id, {
      participantId: participant.id,
      caborId,
      points: 0,
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      scoreFor: 0,
      scoreAgainst: 0,
      scoreDiff: 0,
    })
  }

  const completedMatches = params.matches.filter((match) => (
    includedStageTypes.has((match.stageType ?? 'ROUND_ROBIN') as TournamentStageType)
    && match.status === 'COMPLETED'
    && match.homeParticipantId
    && match.awayParticipantId
    && match.homeScore !== null
    && match.awayScore !== null
  ))

  for (const match of completedMatches) {
    const home = table.get(match.homeParticipantId!)
    const away = table.get(match.awayParticipantId!)
    if (!home || !away) continue

    home.played += 1
    away.played += 1

    home.scoreFor += match.homeScore!
    home.scoreAgainst += match.awayScore!
    away.scoreFor += match.awayScore!
    away.scoreAgainst += match.homeScore!

    if (match.homeScore! > match.awayScore!) {
      home.win += 1
      away.loss += 1
      home.points += 3
    } else if (match.homeScore! < match.awayScore!) {
      away.win += 1
      home.loss += 1
      away.points += 3
    } else {
      home.draw += 1
      away.draw += 1
      home.points += 1
      away.points += 1
    }
  }

  const standings = Array.from(table.values()).map((item) => ({
    ...item,
    scoreDiff: item.scoreFor - item.scoreAgainst,
  }))

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.scoreDiff !== a.scoreDiff) return b.scoreDiff - a.scoreDiff
    if (b.scoreFor !== a.scoreFor) return b.scoreFor - a.scoreFor

    const headToHead = resolveHeadToHeadWinner(a.participantId, b.participantId, completedMatches)
    if (headToHead !== 0) return headToHead

    return a.participantId.localeCompare(b.participantId)
  })

  return standings.map((item, index) => ({
    ...item,
    rank: index + 1,
    tieBreakNotes: 'Points > GD > GF > Head2Head',
  }))
}
