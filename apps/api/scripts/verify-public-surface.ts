import 'dotenv/config'
import assert from 'node:assert/strict'

const API_URL = 'http://localhost:3000/api/v1'

async function getJson(path: string) {
  const res = await fetch(`${API_URL}${path}`)
  let data: any = {}
  try {
    data = await res.json()
  } catch {
    data = {}
  }
  return { res, data }
}

async function run() {
  console.log('Starting public surface verification...')

  const eventsResult = await getJson('/events?includeConcurrent=true')
  assert.equal(eventsResult.res.status, 200, 'GET /events harus 200')
  assert.equal(eventsResult.data.success, true, 'GET /events harus success=true')

  const eventsPayload = eventsResult.data.data
  const events = Array.isArray(eventsPayload) ? eventsPayload : (eventsPayload?.events ?? [])
  assert.ok(Array.isArray(events), 'Payload events harus array')

  if (events.length === 0) {
    console.log('No official events found; skipping deeper public endpoint checks.')
    return
  }

  const eventId = String(events[0].id)

  const eventDetail = await getJson(`/events/${eventId}`)
  assert.equal(eventDetail.res.status, 200, 'GET /events/:id harus 200')
  assert.equal(eventDetail.data.success, true, 'GET /events/:id harus success=true')

  const medalStandings = await getJson(`/events/${eventId}/medal-standings`)
  assert.equal(medalStandings.res.status, 200, 'GET /events/:id/medal-standings harus 200')
  assert.equal(medalStandings.data.success, true, 'GET /events/:id/medal-standings harus success=true')
  assert.ok(Array.isArray(medalStandings.data.data?.standings), 'standings harus array')

  const tournaments = await getJson(`/events/${eventId}/tournaments`)
  assert.equal(tournaments.res.status, 200, 'GET /events/:id/tournaments harus 200')
  assert.equal(tournaments.data.success, true, 'GET /events/:id/tournaments harus success=true')
  assert.ok(Array.isArray(tournaments.data.data), 'tournaments data harus array')

  const rankingsBundle = await getJson(`/events/${eventId}/rankings/cabor`)
  assert.equal(rankingsBundle.res.status, 200, 'GET /events/:id/rankings/cabor harus 200')
  assert.equal(rankingsBundle.data.success, true, 'GET /events/:id/rankings/cabor harus success=true')
  assert.ok(Array.isArray(rankingsBundle.data.data?.competitionRanking), 'competitionRanking harus array')
  assert.ok(Array.isArray(rankingsBundle.data.data?.medalRanking), 'medalRanking harus array')

  if (tournaments.data.data.length > 0) {
    const tournamentId = String(tournaments.data.data[0].id)

    const standings = await getJson(`/events/${eventId}/tournaments/${tournamentId}/standings`)
    assert.equal(standings.res.status, 200, 'GET /events/:id/tournaments/:id/standings harus 200')
    assert.equal(standings.data.success, true, 'Standings public harus success=true')
    assert.ok(Array.isArray(standings.data.data), 'Standings public harus array')

    const matches = await getJson(`/events/${eventId}/tournaments/${tournamentId}/matches`)
    assert.equal(matches.res.status, 200, 'GET /events/:id/tournaments/:id/matches harus 200')
    assert.equal(matches.data.success, true, 'Matches public harus success=true')
    assert.ok(Array.isArray(matches.data.data), 'Matches public harus array')

    const invalidRoundNumber = await getJson(`/events/${eventId}/tournaments/${tournamentId}/matches?roundNumber=abc`)
    assert.equal(invalidRoundNumber.res.status, 400, 'roundNumber invalid harus 400')
  }

  const missingEvent = await getJson('/events/event-does-not-exist/tournaments')
  assert.equal(missingEvent.res.status, 404, 'Event publik tidak ditemukan harus 404')

  console.log('Public surface verification completed.')
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

