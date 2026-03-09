import { Router } from 'express'
import { UserRole } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.middleware.js'
import * as userController from '../controllers/user.controller.js'
import * as settingsController from '../controllers/settings.controller.js'
import * as eventController from '../controllers/event.controller.js'
import {
  createEventSchema,
  updateEventSchema,
  replaceEventMedalStandingsSchema,
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

    const [athleteCount, coachCount, newsCount, inactiveAthleteCount, injuredAthleteCount] = await Promise.all([
      prisma.athlete.count({ where: athleteWhere }),
      prisma.coach.count({ where: coachWhere }),
      prisma.news.count({ where: newsWhere }),
      prisma.athlete.count({ where: { ...athleteWhere, status: 'INACTIVE' } }),
      prisma.athlete.count({ where: { ...athleteWhere, status: 'INJURED' } }),
    ])

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
          active: athleteCount - inactiveAthleteCount - injuredAthleteCount,
          inactive: inactiveAthleteCount,
          injured: injuredAthleteCount,
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

router.get('/events', requireAuth(UserRole.SUPER_ADMIN), eventController.getEvents)
router.get('/events/:id', requireAuth(UserRole.SUPER_ADMIN), eventController.getEventById)
router.post('/events', requireAuth(UserRole.SUPER_ADMIN), validate(createEventSchema), eventController.createEvent)
router.patch('/events/:id', requireAuth(UserRole.SUPER_ADMIN), validate(updateEventSchema), eventController.updateEvent)
router.delete('/events/:id', requireAuth(UserRole.SUPER_ADMIN), eventController.deleteEvent)
router.get('/events/:id/medal-standings', requireAuth(UserRole.SUPER_ADMIN), eventController.getEventMedalStandings)
router.put(
  '/events/:id/medal-standings',
  requireAuth(UserRole.SUPER_ADMIN),
  validate(replaceEventMedalStandingsSchema),
  eventController.replaceEventMedalStandings,
)

router.get('/users', requireAuth(UserRole.SUPER_ADMIN), userController.getUsers)
router.post('/users', requireAuth(UserRole.SUPER_ADMIN), userController.createUser)
router.patch('/users/:id', requireAuth(UserRole.SUPER_ADMIN), userController.updateUser)
router.delete('/users/:id', requireAuth(UserRole.SUPER_ADMIN), userController.deleteUser)

export default router
