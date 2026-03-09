import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.middleware.js'
import { upload } from '../middleware/upload.middleware.js'
import { UserRole } from '@prisma/client'
import { createAchievementSchema, createAthleteSchema, updateAthleteSchema } from '../lib/zod-schemas.js'
import * as athleteController from '../controllers/athlete.controller.js'

const router = Router()

// ── Base Athlete Routes ──────────────────────────────────────

router.get('/', 
  requireAuth(UserRole.COACH), 
  athleteController.getAthletes
)

router.get('/:id', 
  requireAuth(UserRole.ATHLETE), 
  athleteController.getAthleteById
)

router.post('/', 
  requireAuth(UserRole.CABOR_ADMIN), 
  validate(createAthleteSchema), 
  athleteController.createAthlete
)

router.patch('/:id', 
  requireAuth(UserRole.CABOR_ADMIN), 
  validate(updateAthleteSchema), 
  athleteController.updateAthlete
)

router.delete('/:id', 
  requireAuth(UserRole.SUPER_ADMIN), 
  athleteController.deleteAthlete
)

// ── Achievement Routes ──────────────────────────────────────

router.get('/:id/achievements', 
  requireAuth(UserRole.COACH), 
  athleteController.getAchievements
)

router.post('/:id/achievements', 
  requireAuth(UserRole.CABOR_ADMIN), 
  validate(createAchievementSchema),
  athleteController.createAchievement
)

router.patch('/:id/achievements/:achievementId', 
  requireAuth(UserRole.CABOR_ADMIN), 
  validate(createAchievementSchema.partial()),
  athleteController.updateAchievement
)

router.delete('/:id/achievements/:achievementId', 
  requireAuth(UserRole.CABOR_ADMIN), 
  athleteController.deleteAchievement
)

// ── Document Routes ──────────────────────────────────────────

router.get('/:id/documents',
  requireAuth(UserRole.COACH),
  athleteController.getDocuments
)

router.post('/:id/documents',
  requireAuth(UserRole.CABOR_ADMIN),
  upload.single('file'),
  athleteController.uploadDocument
)

router.delete('/:id/documents/:documentId',
  requireAuth(UserRole.CABOR_ADMIN),
  athleteController.deleteDocument
)

export default router
