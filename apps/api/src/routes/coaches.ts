import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.middleware.js'
import { UserRole } from '@prisma/client'
import { createCoachSchema, updateCoachSchema } from '../lib/zod-schemas.js'
import * as coachController from '../controllers/coach.controller.js'

const router = Router()

// GET /api/v1/coaches
router.get('/', 
  requireAuth(UserRole.CABOR_ADMIN), 
  coachController.getCoaches
)

// GET /api/v1/coaches/:id
router.get('/:id', 
  requireAuth(UserRole.COACH), 
  coachController.getCoachById
)

// POST /api/v1/coaches
router.post('/', 
  requireAuth(UserRole.CABOR_ADMIN), 
  validate(createCoachSchema),
  coachController.createCoach
)

// PATCH /api/v1/coaches/:id
router.patch('/:id', 
  requireAuth(UserRole.CABOR_ADMIN), 
  validate(updateCoachSchema),
  coachController.updateCoach
)

// DELETE /api/v1/coaches/:id
router.delete('/:id', 
  requireAuth(UserRole.SUPER_ADMIN), 
  coachController.deleteCoach
)

export default router
