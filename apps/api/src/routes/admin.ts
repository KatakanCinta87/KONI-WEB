import { Router } from 'express'
import { UserRole } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.middleware.js'
import * as userController from '../controllers/user.controller.js'
import * as settingsController from '../controllers/settings.controller.js'
import * as eventController from '../controllers/event.controller.js'
import * as tournamentController from '../controllers/tournament.controller.js'
import {
  createEventSchema,
  createEventTournamentSchema,
  resetEventMedalOverrideSchema,
  tournamentMatchesQuerySchema,
  updateTournamentMatchResultSchema,
  updateEventSchema,
  replaceEventMedalStandingsSchema,
  registerAthleteSchema,
} from '../lib/zod-schemas.js'

const router = Router()

router.get('/dashboard-stats', requireAuth(UserRole.CABOR_ADMIN), async (req: any, res) => {
  try {
    const caborId = req.user.role === UserRole.CABOR_ADMIN
      ? (await prisma.cabangOlahraga.findUnique({ where: { adminId: req.user.id } }))?.id
      : null

    const athleteWhere = {
      caborId: caborId || undefined,
      deletedAt: null,
    }
    const coachWhere = {
      caborId: caborId || undefined,
      isActive: true,
    }
    const newsWhere = {
      caborId: caborId || undefined,
    }

    const [athleteCount, coachCount, newsCount, athleteStatusStats] = await Promise.all([
      prisma.athlete.count({ where: athleteWhere }),
      prisma.coach.count({ where: coachWhere }),
      prisma.news.count({ where: newsWhere }),
      prisma.athlete.groupBy({
        by: ['status'],
        _count: true,
        where: athleteWhere,
      }),
    ])

    const inactiveCount = athleteStatusStats.find(s => s.status === 'INACTIVE')?._count || 0
    const injuredCount = athleteStatusStats.find(s => s.status === 'INJURED')?._count || 0

    const newsStats = await prisma.news.groupBy({
      by: ['status'],
      _count: true,
      where: caborId ? { caborId } : {},
    })

    res.json({
      success: true,
      data: {
        athletes: athleteCount,
        coaches: coachCount,
        news: {
          total: newsCount,
          published: newsStats.find((s) => s.status === 'PUBLISHED')?._count || 0,
          draft: newsStats.find((s) => s.status === 'DRAFT')?._count || 0,
          archived: newsStats.find((s) => s.status === 'ARCHIVED')?._count || 0,
        },
        athleteStatus: {
          active: athleteCount - inactiveCount - injuredCount,
          inactive: inactiveCount,
          injured: injuredCount,
        },
      },
    })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/audit-logs', requireAuth(UserRole.SUPER_ADMIN), async (req, res) => {
  const { resource, action, limit = 50, offset = 0 } = req.query
  try {
    const where: any = {}
    if (resource) where.resource = String(resource)
    if (action) where.action = String(action)

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { email: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.auditLog.count({ where }),
    ])

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

router.get('/settings', requireAuth(UserRole.SUPER_ADMIN), settingsController.getSettings)
router.patch('/settings', requireAuth(UserRole.SUPER_ADMIN), settingsController.updateSettings)

router.get('/events', requireAuth(UserRole.CABOR_ADMIN), eventController.getEvents)
router.get('/events/:id', requireAuth(UserRole.CABOR_ADMIN), eventController.getEventById)
router.post('/events', requireAuth(UserRole.SUPER_ADMIN), validate(createEventSchema), eventController.createEvent)
router.patch('/events/:id', requireAuth(UserRole.SUPER_ADMIN), validate(updateEventSchema), eventController.updateEvent)
router.delete('/events/:id', requireAuth(UserRole.SUPER_ADMIN), eventController.deleteEvent)
router.get('/events/:id/medal-standings', requireAuth(UserRole.CABOR_ADMIN), eventController.getEventMedalStandings)
router.get('/events/:id/registrations', requireAuth(UserRole.CABOR_ADMIN), eventController.getEventRegistrations)
router.post(
  '/events/:id/register',
  requireAuth(UserRole.CABOR_ADMIN),
  validate(registerAthleteSchema),
  eventController.registerAthleteToEvent,
)
router.delete('/events/registrations/:registrationId', requireAuth(UserRole.CABOR_ADMIN), eventController.deleteEventRegistration)
router.get('/events/:id/export/excel', requireAuth(UserRole.CABOR_ADMIN), eventController.exportEventMedalExcel)
router.get('/events/:id/export/pdf', requireAuth(UserRole.CABOR_ADMIN), eventController.exportEventMedalPdf)
router.put(
  '/events/:id/medal-standings',
  requireAuth(UserRole.SUPER_ADMIN),
  validate(replaceEventMedalStandingsSchema),
  eventController.replaceEventMedalStandings,
)
router.post(
  '/events/:id/medal-standings/reset-override',
  requireAuth(UserRole.SUPER_ADMIN),
  validate(resetEventMedalOverrideSchema),
  eventController.resetEventMedalStandingsOverride,
)

router.post(
  '/events/:eventId/tournaments',
  requireAuth(UserRole.SUPER_ADMIN),
  validate(createEventTournamentSchema),
  tournamentController.createEventTournament,
)
router.get(
  '/events/:eventId/tournaments',
  requireAuth(UserRole.SUPER_ADMIN),
  tournamentController.listEventTournaments,
)
router.get(
  '/events/:eventId/tournaments/:tournamentId',
  requireAuth(UserRole.SUPER_ADMIN),
  tournamentController.getEventTournamentById,
)
router.post(
  '/events/:eventId/tournaments/:tournamentId/generate',
  requireAuth(UserRole.SUPER_ADMIN),
  tournamentController.generateEventTournament,
)
router.post(
  '/events/:eventId/tournaments/:tournamentId/generate-knockout',
  requireAuth(UserRole.SUPER_ADMIN),
  tournamentController.generateEventTournamentKnockout,
)
router.get(
  '/events/:eventId/tournaments/:tournamentId/matches',
  requireAuth(UserRole.SUPER_ADMIN),
  validate(tournamentMatchesQuerySchema, 'query'),
  tournamentController.getEventTournamentMatches,
)
router.patch(
  '/events/:eventId/tournaments/:tournamentId/matches/:matchId/result',
  requireAuth(UserRole.SUPER_ADMIN),
  validate(updateTournamentMatchResultSchema),
  tournamentController.updateEventTournamentMatchResult,
)
router.get(
  '/events/:eventId/tournaments/:tournamentId/standings',
  requireAuth(UserRole.SUPER_ADMIN),
  tournamentController.getEventTournamentStandings,
)
router.post(
  '/events/:eventId/tournaments/:tournamentId/medals/recompute',
  requireAuth(UserRole.SUPER_ADMIN),
  tournamentController.recomputeEventTournamentMedals,
)

router.post(
  '/sandbox/events/:eventId/tournaments',
  requireAuth(UserRole.ATHLETE),
  validate(createEventTournamentSchema),
  tournamentController.createSandboxEventTournament,
)
router.get(
  '/sandbox/events/:eventId/tournaments',
  requireAuth(UserRole.ATHLETE),
  tournamentController.listSandboxEventTournaments,
)
router.post(
  '/sandbox/events/:eventId/tournaments/:tournamentId/generate',
  requireAuth(UserRole.ATHLETE),
  tournamentController.generateSandboxEventTournament,
)
router.post(
  '/sandbox/events/:eventId/tournaments/:tournamentId/generate-knockout',
  requireAuth(UserRole.ATHLETE),
  tournamentController.generateSandboxEventTournamentKnockout,
)
router.get(
  '/sandbox/events/:eventId/tournaments/:tournamentId/matches',
  requireAuth(UserRole.ATHLETE),
  validate(tournamentMatchesQuerySchema, 'query'),
  tournamentController.getSandboxEventTournamentMatches,
)
router.patch(
  '/sandbox/events/:eventId/tournaments/:tournamentId/matches/:matchId/result',
  requireAuth(UserRole.ATHLETE),
  validate(updateTournamentMatchResultSchema),
  tournamentController.updateSandboxEventTournamentMatchResult,
)
router.get(
  '/sandbox/events/:eventId/tournaments/:tournamentId/standings',
  requireAuth(UserRole.ATHLETE),
  tournamentController.getSandboxEventTournamentStandings,
)

router.get('/users', requireAuth(UserRole.SUPER_ADMIN), userController.getUsers)
router.post('/users', requireAuth(UserRole.SUPER_ADMIN), userController.createUser)
router.patch('/users/:id', requireAuth(UserRole.SUPER_ADMIN), userController.updateUser)
router.delete('/users/:id', requireAuth(UserRole.SUPER_ADMIN), userController.deleteUser)

export default router
