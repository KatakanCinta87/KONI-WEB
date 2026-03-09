import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { upload } from '../middleware/upload.middleware.js'
import { UserRole } from '@prisma/client'
import * as galleryController from '../controllers/gallery.controller.js'

const router = Router()

// ── Album Routes ─────────────────────────────────────────────

router.get('/albums', galleryController.getAlbums)

router.post('/albums', 
  requireAuth(UserRole.SUPER_ADMIN), 
  galleryController.createAlbum
)

router.patch('/albums/:id', 
  requireAuth(UserRole.SUPER_ADMIN), 
  galleryController.updateAlbum
)

router.delete('/albums/:id', 
  requireAuth(UserRole.SUPER_ADMIN), 
  galleryController.deleteAlbum
)

// ── Gallery Item Routes ──────────────────────────────────────

router.get('/', galleryController.getGalleryItems)

router.post('/', 
  requireAuth(UserRole.SUPER_ADMIN),
  upload.single('file'),
  galleryController.createGalleryItem
)

router.delete('/:id', 
  requireAuth(UserRole.SUPER_ADMIN), 
  galleryController.deleteGalleryItem
)

export default router
