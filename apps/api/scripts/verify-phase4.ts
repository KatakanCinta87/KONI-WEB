import 'dotenv/config'
import assert from 'node:assert/strict'

const API_URL = 'http://localhost:3000/api/v1'

async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data: any = await res.json()
  if (!data.success) throw new Error(`Login gagal (${email}): ${JSON.stringify(data)}`)
  return data.data.accessToken as string
}

async function authedJson(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  })
  let data: any = {}
  try {
    data = await res.json()
  } catch {
    data = {}
  }
  return { res, data }
}

async function run() {
  console.log('Starting Phase 4 verification...')
  const superAdminToken = await login('admin@koni-kabmalang.or.id', 'admin123')
  const caborAdminToken = await login('admin-pssi@koni-kabmalang.or.id', 'cabor123')
  const coachToken = await login('mulyo.handoyo@coach.koni.id', 'pelatih123')
  const athleteToken = await login('rudi.hartono@athlete.koni.id', 'atlet123')

  const { data: caborData } = await authedJson('/cabor', superAdminToken, { method: 'GET' })
  assert.equal(caborData.success, true, 'Gagal mengambil data cabor')
  const caborPssi = caborData.data.find((item: any) => item.name === 'PSSI')
  const caborPbsi = caborData.data.find((item: any) => item.name === 'PBSI')
  assert.ok(caborPssi, 'Cabor PSSI wajib ada')
  assert.ok(caborPbsi, 'Cabor PBSI wajib ada')

  const publicSelectionBeforeRes = await fetch(`${API_URL}/events?includeConcurrent=true`)
  const publicSelectionBeforeData: any = await publicSelectionBeforeRes.json()
  assert.equal(publicSelectionBeforeData.success, true, 'Public events selection gagal')
  const featuredEventId = publicSelectionBeforeData.data?.medalSelection?.featuredEventId as string | null
  assert.equal(featuredEventId, 'event-pon-kab-malang-2026', 'Featured event harus PON')

  const featuredMedalBeforeRes = await fetch(`${API_URL}/events/${featuredEventId}/medal-standings`)
  const featuredMedalBeforeData: any = await featuredMedalBeforeRes.json()
  assert.equal(featuredMedalBeforeData.success, true, 'Medal standings featured event gagal')
  const featuredMedalBefore = JSON.stringify(featuredMedalBeforeData.data?.standings || [])

  const officialWriteByCaborAdmin = await authedJson('/admin/events/event-pon-kab-malang-2026/tournaments', caborAdminToken, {
    method: 'POST',
    body: JSON.stringify({
      name: `Official Write Forbidden ${Date.now()}`,
      participantType: 'CABOR_CONTINGENT',
      caborId: caborPssi.id,
      roundRobinGroups: 1,
      knockoutQualified: 2,
      participants: [
        { participantType: 'CABOR_CONTINGENT', caborId: caborPssi.id, seedNumber: 1 },
        { participantType: 'CABOR_CONTINGENT', caborId: caborPssi.id, seedNumber: 2 },
      ],
    }),
  })
  assert.equal(officialWriteByCaborAdmin.res.status, 403, 'CABOR_ADMIN tidak boleh write official tournament')
  console.log('Official write restricted to SUPER_ADMIN verified')

  const crossCaborSandboxWrite = await authedJson('/admin/sandbox/events/event-pon-kab-malang-2026/tournaments', caborAdminToken, {
    method: 'POST',
    body: JSON.stringify({
      name: `Sandbox Cross Cabor Block ${Date.now()}`,
      participantType: 'CABOR_CONTINGENT',
      caborId: caborPbsi.id,
      roundRobinGroups: 1,
      knockoutQualified: 2,
      participants: [
        { participantType: 'CABOR_CONTINGENT', caborId: caborPbsi.id, seedNumber: 1 },
        { participantType: 'CABOR_CONTINGENT', caborId: caborPbsi.id, seedNumber: 2 },
      ],
    }),
  })
  assert.equal(crossCaborSandboxWrite.res.status, 403, 'CABOR_ADMIN lintas cabor harus ditolak')
  console.log('Cross-cabor sandbox write rejection verified')

  const caborSandboxCreate = await authedJson('/admin/sandbox/events/event-pon-kab-malang-2026/tournaments', caborAdminToken, {
    method: 'POST',
    body: JSON.stringify({
      name: `Sandbox Cabor Admin ${Date.now()}`,
      participantType: 'CABOR_CONTINGENT',
      caborId: caborPssi.id,
      roundRobinGroups: 1,
      knockoutQualified: 2,
      participants: [
        { participantType: 'CABOR_CONTINGENT', caborId: caborPssi.id, seedNumber: 1, name: 'PSSI-Alpha' },
        { participantType: 'CABOR_CONTINGENT', caborId: caborPssi.id, seedNumber: 2, name: 'PSSI-Beta' },
      ],
    }),
  })
  assert.equal(caborSandboxCreate.res.status, 201, `Create sandbox cabor admin gagal: ${JSON.stringify(caborSandboxCreate.data)}`)
  const caborSandboxTournamentId = caborSandboxCreate.data.data.id as string

  const coachSandboxCreate = await authedJson('/admin/sandbox/events/event-pon-kab-malang-2026/tournaments', coachToken, {
    method: 'POST',
    body: JSON.stringify({
      name: `Sandbox Coach ${Date.now()}`,
      participantType: 'CABOR_CONTINGENT',
      caborId: caborPssi.id,
      roundRobinGroups: 1,
      knockoutQualified: 2,
      participants: [
        { participantType: 'CABOR_CONTINGENT', caborId: caborPssi.id, seedNumber: 1, name: 'Coach-Team-1' },
        { participantType: 'CABOR_CONTINGENT', caborId: caborPssi.id, seedNumber: 2, name: 'Coach-Team-2' },
      ],
    }),
  })
  assert.equal(coachSandboxCreate.res.status, 201, `Create sandbox coach gagal: ${JSON.stringify(coachSandboxCreate.data)}`)
  const coachSandboxTournamentId = coachSandboxCreate.data.data.id as string

  const athletesByCoach = await authedJson('/athletes', coachToken, { method: 'GET' })
  assert.equal(athletesByCoach.data.success, true, 'Coach gagal mengambil list athlete')
  const foreignAthlete = (athletesByCoach.data.data || []).find((item: any) => item.email !== 'rudi.hartono@athlete.koni.id')
  assert.ok(foreignAthlete, 'Butuh sample athlete bukan milik user athlete untuk negative-case')

  const athleteForeignSandboxCreate = await authedJson('/admin/sandbox/events/event-pon-kab-malang-2026/tournaments', athleteToken, {
    method: 'POST',
    body: JSON.stringify({
      name: `Sandbox Athlete Foreign ${Date.now()}`,
      participantType: 'ATHLETE',
      roundRobinGroups: 1,
      knockoutQualified: 2,
      participants: [
        { participantType: 'ATHLETE', athleteId: foreignAthlete.id, seedNumber: 1 },
        { participantType: 'CABOR_CONTINGENT', caborId: caborPssi.id, seedNumber: 2, name: 'Athlete-Team-2' },
      ],
    }),
  })
  assert.equal(athleteForeignSandboxCreate.res.status, 403, 'Athlete tidak boleh pakai athlete peserta milik user lain')
  console.log('Athlete foreign participant rejection verified')

  const athleteSandboxCreate = await authedJson('/admin/sandbox/events/event-pon-kab-malang-2026/tournaments', athleteToken, {
    method: 'POST',
    body: JSON.stringify({
      name: `Sandbox Athlete ${Date.now()}`,
      participantType: 'CABOR_CONTINGENT',
      caborId: caborPssi.id,
      roundRobinGroups: 1,
      knockoutQualified: 2,
      participants: [
        { participantType: 'CABOR_CONTINGENT', caborId: caborPssi.id, seedNumber: 1, name: 'Athlete-Team-1' },
        { participantType: 'CABOR_CONTINGENT', caborId: caborPssi.id, seedNumber: 2, name: 'Athlete-Team-2' },
      ],
    }),
  })
  assert.equal(athleteSandboxCreate.res.status, 201, `Create sandbox athlete gagal: ${JSON.stringify(athleteSandboxCreate.data)}`)

  const coachCannotAccessCaborTournament = await authedJson(
    `/admin/sandbox/events/event-pon-kab-malang-2026/tournaments/${caborSandboxTournamentId}/matches`,
    coachToken,
    { method: 'GET' },
  )
  assert.ok(
    coachCannotAccessCaborTournament.res.status === 403 || coachCannotAccessCaborTournament.res.status === 404,
    'Coach tidak boleh akses sandbox milik CABOR_ADMIN',
  )

  const athleteCannotAccessCoachTournament = await authedJson(
    `/admin/sandbox/events/event-pon-kab-malang-2026/tournaments/${coachSandboxTournamentId}/standings`,
    athleteToken,
    { method: 'GET' },
  )
  assert.ok(
    athleteCannotAccessCoachTournament.res.status === 403 || athleteCannotAccessCoachTournament.res.status === 404,
    'Athlete tidak boleh akses sandbox milik COACH',
  )
  console.log('Cross-user sandbox isolation verified')

  const caborGenerate = await authedJson(
    `/admin/sandbox/events/event-pon-kab-malang-2026/tournaments/${caborSandboxTournamentId}/generate`,
    caborAdminToken,
    { method: 'POST' },
  )
  assert.equal(caborGenerate.data.success, true, 'Generate sandbox cabor admin gagal')

  const caborMatches = await authedJson(
    `/admin/sandbox/events/event-pon-kab-malang-2026/tournaments/${caborSandboxTournamentId}/matches`,
    caborAdminToken,
    { method: 'GET' },
  )
  assert.equal(caborMatches.data.success, true, 'Ambil sandbox matches gagal')
  const firstMatch = caborMatches.data.data?.[0]
  assert.ok(firstMatch, 'Sandbox match tidak ditemukan')

  const caborPatchMatch = await authedJson(
    `/admin/sandbox/events/event-pon-kab-malang-2026/tournaments/${caborSandboxTournamentId}/matches/${firstMatch.id}/result`,
    caborAdminToken,
    {
      method: 'PATCH',
      body: JSON.stringify({ homeScore: 2, awayScore: 1, status: 'COMPLETED' }),
    },
  )
  assert.equal(caborPatchMatch.data.success, true, 'Update sandbox match result gagal')

  const caborStandings = await authedJson(
    `/admin/sandbox/events/event-pon-kab-malang-2026/tournaments/${caborSandboxTournamentId}/standings`,
    caborAdminToken,
    { method: 'GET' },
  )
  assert.equal(caborStandings.data.success, true, 'Standings sandbox gagal')
  console.log('Sandbox flow to standings verified')

  const publicSelectionAfterRes = await fetch(`${API_URL}/events?includeConcurrent=true`)
  const publicSelectionAfterData: any = await publicSelectionAfterRes.json()
  const featuredAfterEventId = publicSelectionAfterData.data?.medalSelection?.featuredEventId as string | null
  assert.equal(featuredAfterEventId, featuredEventId, 'Featured homepage event tidak boleh berubah akibat sandbox')

  const featuredMedalAfterRes = await fetch(`${API_URL}/events/${featuredEventId}/medal-standings`)
  const featuredMedalAfterData: any = await featuredMedalAfterRes.json()
  const featuredMedalAfter = JSON.stringify(featuredMedalAfterData.data?.standings || [])
  assert.equal(featuredMedalAfter, featuredMedalBefore, 'Medal standings official berubah setelah sandbox flow')
  console.log('Homepage/public official data remained unchanged after sandbox operations')

  console.log('Phase 4 verification completed.')
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
