import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.middleware.js'
import { UserRole } from '@prisma/client'
import { createCaborSchema, updateCaborSchema } from '../lib/zod-schemas.js'
import * as caborController from '../controllers/cabor.controller.js'

const router = Router()

// GET /api/v1/cabor
router.get('/', caborController.getCabors)

// GET /api/v1/cabor/:id
router.get('/:id', caborController.getCaborById)

// POST /api/v1/cabor
router.post('/', 
  requireAuth(UserRole.SUPER_ADMIN), 
  validate(createCaborSchema),
  caborController.createCabor
)

// PATCH /api/v1/cabor/:id
router.patch('/:id', 
  requireAuth(UserRole.CABOR_ADMIN), 
  validate(updateCaborSchema),
  caborController.updateCabor
)

// ── SK Document Routes ──────────────────────────────────────

router.get('/:id/sk', 
  requireAuth(UserRole.CABOR_ADMIN), 
  caborController.getCaborSKs
)

router.post('/:id/sk', 
  requireAuth(UserRole.SUPER_ADMIN), 
  caborController.uploadCaborSK
)

export default router
