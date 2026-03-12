import 'dotenv/config'
import assert from 'node:assert/strict'

const API_URL = 'http://localhost:3000/api/v1'

async function loginAdmin() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@koni-kabmalang.or.id', password: 'admin123' }),
  })
  const data: any = await res.json()
  if (!data.success) throw new Error(`Login gagal: ${JSON.stringify(data)}`)
  return data.data.accessToken as string
}

async function loginCaborAdmin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data: any = await res.json()
  if (!data.success) throw new Error(`Login CABOR_ADMIN gagal (${email}): ${JSON.stringify(data)}`)
  return data.data.accessToken as string
}

async function run() {
  console.log('Starting Phase 3 verification...')
  const token = await loginAdmin()

  const eventRes = await fetch(`${API_URL}/admin/events`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const eventData: any = await eventRes.json()
  if (!eventData.success || !eventData.data?.length) throw new Error('Tidak ada event untuk verifikasi phase3')
  const eventId = eventData.data[0].id

  const caborRes = await fetch(`${API_URL}/cabor`)
  const caborData: any = await caborRes.json()
  if (!caborData.success || caborData.data.length < 2) throw new Error('Cabor tidak cukup untuk verifikasi tournament')
  const caborPssi = caborData.data.find((item: any) => item.name === 'PSSI')
  const caborPbsi = caborData.data.find((item: any) => item.name === 'PBSI')
  const caborPasi = caborData.data.find((item: any) => item.name === 'PASI')
  if (!caborPssi || !caborPbsi || !caborPasi) {
    throw new Error('Seed CABOR (PSSI/PBSI/PASI) tidak ditemukan untuk verifikasi RBAC lintas-cabor')
  }

  const pssiAdminToken = await loginCaborAdmin('admin-pssi@koni-kabmalang.or.id', 'cabor123')

  const crossCreateRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pssiAdminToken}` },
    body: JSON.stringify({
      name: `RBAC Cross Create ${Date.now()}`,
      participantType: 'CABOR_CONTINGENT',
      caborId: caborPbsi.id,
      roundRobinGroups: 1,
      knockoutQualified: 2,
      participants: [
        { participantType: 'CABOR_CONTINGENT', caborId: caborPbsi.id, seedNumber: 1 },
        { participantType: 'CABOR_CONTINGENT', caborId: caborPasi.id, seedNumber: 2 },
      ],
    }),
  })
  const crossCreateData: any = await crossCreateRes.json()
  assert.strictEqual(crossCreateRes.status, 403, `Cross-cabor create harus 403, got ${crossCreateRes.status} ${JSON.stringify(crossCreateData)}`)
  console.log('RBAC cross-cabor create rejected as expected')

  const lockTournamentRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: `RBAC Lock Tournament ${Date.now()}`,
      participantType: 'CABOR_CONTINGENT',
      caborId: caborPbsi.id,
      roundRobinGroups: 1,
      knockoutQualified: 2,
      participants: [
        { participantType: 'CABOR_CONTINGENT', caborId: caborPbsi.id, seedNumber: 1 },
        { participantType: 'CABOR_CONTINGENT', caborId: caborPasi.id, seedNumber: 2 },
      ],
    }),
  })
  const lockTournamentData: any = await lockTournamentRes.json()
  if (!lockTournamentData.success) throw new Error(`Setup tournament RBAC gagal: ${JSON.stringify(lockTournamentData)}`)
  const rbacTournamentId = lockTournamentData.data.id as string

  const crossGenerateRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${rbacTournamentId}/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pssiAdminToken}` },
  })
  const crossGenerateData: any = await crossGenerateRes.json()
  assert.strictEqual(crossGenerateRes.status, 403, `Cross-cabor generate harus 403, got ${crossGenerateRes.status} ${JSON.stringify(crossGenerateData)}`)
  console.log('RBAC cross-cabor generate rejected as expected')

  const rbacGenerateAsAdminRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${rbacTournamentId}/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const rbacGenerateAsAdminData: any = await rbacGenerateAsAdminRes.json()
  if (!rbacGenerateAsAdminData.success) throw new Error(`Generate tournament RBAC setup gagal: ${JSON.stringify(rbacGenerateAsAdminData)}`)

  const rbacMatchesRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${rbacTournamentId}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const rbacMatchesData: any = await rbacMatchesRes.json()
  if (!rbacMatchesData.success || !rbacMatchesData.data?.length) throw new Error('Setup match RBAC gagal')
  const rbacMatchId = rbacMatchesData.data[0].id as string

  const crossPatchRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${rbacTournamentId}/matches/${rbacMatchId}/result`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pssiAdminToken}` },
    body: JSON.stringify({ homeScore: 1, awayScore: 0, status: 'COMPLETED' }),
  })
  const crossPatchData: any = await crossPatchRes.json()
  assert.strictEqual(crossPatchRes.status, 403, `Cross-cabor patch match harus 403, got ${crossPatchRes.status} ${JSON.stringify(crossPatchData)}`)
  console.log('RBAC cross-cabor match update rejected as expected')

  const createRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      name: `Verify Tournament ${Date.now()}`,
      participantType: 'CABOR_CONTINGENT',
      roundRobinGroups: 1,
      knockoutQualified: 2,
      participants: [
        { participantType: 'CABOR_CONTINGENT', caborId: caborData.data[0].id, seedNumber: 1 },
        { participantType: 'CABOR_CONTINGENT', caborId: caborData.data[1].id, seedNumber: 2 },
      ],
    }),
  })
  const createData: any = await createRes.json()
  if (!createData.success) throw new Error(`Create tournament gagal: ${JSON.stringify(createData)}`)
  const tournamentId = createData.data.id
  console.log('Tournament created:', tournamentId)

  const generateRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const generateData: any = await generateRes.json()
  if (!generateData.success) throw new Error(`Generate bracket gagal: ${JSON.stringify(generateData)}`)
  console.log('Bracket generated')

  const earlyKnockoutRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/generate-knockout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const earlyKnockoutData: any = await earlyKnockoutRes.json()
  if (earlyKnockoutRes.status !== 409 || earlyKnockoutData.success) {
    throw new Error(`Generate KO sebelum RR selesai seharusnya ditolak: ${JSON.stringify(earlyKnockoutData)}`)
  }
  console.log('Knockout pre-check rejected as expected')

  const matchesRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const matchesData: any = await matchesRes.json()
  if (!matchesData.success || !matchesData.data?.length) throw new Error('Tidak ada match setelah generate')
  const matchId = matchesData.data[0].id

  const resultRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/matches/${matchId}/result`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ homeScore: 2, awayScore: 1, status: 'COMPLETED' }),
  })
  const resultData: any = await resultRes.json()
  if (!resultData.success) throw new Error(`Update match gagal: ${JSON.stringify(resultData)}`)
  console.log('Match result updated and standings recomputed')

  const knockoutRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/generate-knockout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const knockoutData: any = await knockoutRes.json()
  if (!knockoutData.success) throw new Error(`Generate KO gagal: ${JSON.stringify(knockoutData)}`)
  console.log('Knockout generated from RR standings')

  const allMatchesRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const allMatchesData: any = await allMatchesRes.json()
  const knockoutMatches = (allMatchesData.data || []).filter((match: any) => match.stage?.type === 'KNOCKOUT')
  if (knockoutMatches.length === 0) throw new Error('KO match tidak terbentuk setelah generate knockout')
  console.log(`KO scenario verified. Knockout matches: ${knockoutMatches.length}`)

  const knockoutMatchId = knockoutMatches[0].id as string
  const drawKoRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/matches/${knockoutMatchId}/result`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ homeScore: 1, awayScore: 1, status: 'COMPLETED' }),
  })
  const drawKoData: any = await drawKoRes.json()
  if (drawKoRes.status !== 400 || drawKoData.success) {
    throw new Error(`Draw KO seharusnya ditolak: ${JSON.stringify(drawKoData)}`)
  }
  console.log('No-draw KO validation rejected as expected')

  const forfeitKoRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/matches/${knockoutMatchId}/result`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ homeScore: 1, awayScore: 0, status: 'FORFEIT' }),
  })
  const forfeitKoData: any = await forfeitKoRes.json()
  if (!forfeitKoData.success) throw new Error(`Update KO FORFEIT gagal: ${JSON.stringify(forfeitKoData)}`)

  const verifyForfeitRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const verifyForfeitData: any = await verifyForfeitRes.json()
  const persistedKoMatch = (verifyForfeitData.data || []).find((match: any) => match.id === knockoutMatchId)
  if (!persistedKoMatch || persistedKoMatch.status !== 'FORFEIT') {
    throw new Error(`Status KO FORFEIT tidak persisten: ${JSON.stringify(persistedKoMatch)}`)
  }
  console.log('KO FORFEIT status persisted')

  const reopenKoRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/matches/${knockoutMatchId}/result`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ homeScore: 2, awayScore: 1, status: 'ONGOING' }),
  })
  const reopenKoData: any = await reopenKoRes.json()
  if (reopenKoRes.status !== 400 || reopenKoData.success) {
    throw new Error(`Match terminal tidak boleh dibuka ulang: ${JSON.stringify(reopenKoData)}`)
  }
  console.log('Terminal match reopen rejected as expected')

  const standingRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/standings`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const standingData: any = await standingRes.json()
  if (!standingData.success || !Array.isArray(standingData.data)) throw new Error('Standings tidak valid')
  console.log(`Standings rows: ${standingData.data.length}`)

  const recomputeRes = await fetch(`${API_URL}/admin/events/${eventId}/tournaments/${tournamentId}/medals/recompute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const recomputeData: any = await recomputeRes.json()
  if (!recomputeData.success) throw new Error(`Recompute medali gagal: ${JSON.stringify(recomputeData)}`)
  console.log('Medal recompute OK')

  const medalRes = await fetch(`${API_URL}/admin/events/${eventId}/medal-standings`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const medalData: any = await medalRes.json()
  const medalRows = Array.isArray(medalData.data)
    ? medalData.data
    : (Array.isArray(medalData.data?.standings) ? medalData.data.standings : null)
  if (!medalData.success || !medalRows) {
    throw new Error(`Data medal standings tidak valid: ${JSON.stringify(medalData)}`)
  }
  console.log(`Medal standings rows: ${medalRows.length}`)

  await fetch(`${API_URL}/admin/events/${eventId}/medal-standings/reset-override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ caborIds: [] }),
  })
  console.log('Reset medal override OK')

  console.log('Phase 3 verification completed.')
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
