import { Router } from 'express'
import * as eventController from '../controllers/event.controller.js'

const router = Router()

router.get('/', eventController.getEvents)
router.get('/:id', eventController.getEventById)
router.get('/:id/medal-standings', eventController.getEventMedalStandings)

export default router
