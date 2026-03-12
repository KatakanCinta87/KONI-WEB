import { Router } from 'express'
import * as eventController from '../controllers/event.controller.js'
import * as tournamentController from '../controllers/tournament.controller.js'

const router = Router()

router.get('/', eventController.getEvents)
router.get('/:eventId/tournaments', tournamentController.getPublicEventTournaments)
router.get('/:eventId/tournaments/:tournamentId/matches', tournamentController.getPublicTournamentMatches)
router.get('/:eventId/tournaments/:tournamentId/standings', tournamentController.getPublicTournamentStandings)
router.get('/:eventId/rankings/cabor', tournamentController.getEventCaborRankingsBundle)
router.get('/:id/medal-standings', eventController.getEventMedalStandings)
router.get('/:id/export/excel', eventController.exportEventMedalExcel)
router.get('/:id/export/pdf', eventController.exportEventMedalPdf)
router.get('/:id', eventController.getEventById)

export default router
