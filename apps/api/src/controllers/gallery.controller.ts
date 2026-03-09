import { Response, Request } from 'express'
import { prisma } from '../lib/prisma.js'
import { AuthRequest } from '../middleware/auth.js'
import { createAuditLog } from '../services/audit.service.js'
import { storage } from '../services/storage.service.js'
import { UserRole } from '@prisma/client'

// ── Album Handlers ───────────────────────────────────────────

export const getAlbums = async (_req: Request, res: Response) => {
  try {
    const albums = await prisma.galleryAlbum.findMany({
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json({ success: true, data: albums })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil data album' })
  }
}

export const createAlbum = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, coverUrl } = req.body
    const album = await prisma.galleryAlbum.create({
      data: { name, description, coverUrl }
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_ALBUM',
      resource: 'gallery',
      resourceId: album.id,
      after: album,
      ipAddress: req.ip,
    })

    res.status(201).json({ success: true, data: album })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal membuat album' })
  }
}

export const updateAlbum = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  try {
    const album = await prisma.galleryAlbum.update({
      where: { id },
      data: req.body
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'UPDATE_ALBUM',
      resource: 'gallery',
      resourceId: id,
      after: album,
      ipAddress: req.ip,
    })

    res.json({ success: true, data: album })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal memperbarui album' })
  }
}

export const deleteAlbum = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  try {
    await prisma.galleryAlbum.delete({ where: { id } })

    await createAuditLog({
      userId: req.user?.id,
      action: 'DELETE_ALBUM',
      resource: 'gallery',
      resourceId: id,
      ipAddress: req.ip,
    })

    res.json({ success: true, message: 'Album berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghapus album' })
  }
}

// ── Gallery Item Handlers ────────────────────────────────────

export const getGalleryItems = async (req: Request, res: Response) => {
  const { albumId, type } = req.query
  try {
    const where: any = {}
    if (albumId) where.albumId = String(albumId)
    if (type) where.type = String(type)

    const items = await prisma.gallery.findMany({
      where,
      include: {
        galleryAlbum: {
          select: { name: true }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    })
    res.json({ success: true, data: items })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal mengambil data galeri' })
  }
}

export const createGalleryItem = async (req: AuthRequest, res: Response) => {
  const { title, description, type, url, albumId } = req.body
  const file = req.file

  try {
    let finalUrl = url
    let thumbnailUrl = req.body.thumbnailUrl
    let fileSize = null
    let mimeType = null

    // If it's a photo and a file is uploaded
    if (type === 'PHOTO' && file) {
      const uploadResult = await storage.uploadFile({
        buffer: file.buffer,
        filename: file.originalname,
        mimeType: file.mimetype,
        folder: 'gallery',
      })
      finalUrl = uploadResult.url
      fileSize = file.size
      mimeType = file.mimetype
    }

    // Minimal validation guard to avoid invalid media entries that break thumbnails/UI.
    if (type === 'PHOTO' && !finalUrl) {
      res.status(400).json({ success: false, error: 'Foto membutuhkan file atau URL.' })
      return
    }
    if (type === 'VIDEO' && !finalUrl) {
      res.status(400).json({ success: false, error: 'Video membutuhkan URL.' })
      return
    }

    // Default thumbnail behavior:
    // - PHOTO: fallback to the media URL itself
    // - VIDEO (YouTube): derive thumbnail when possible
    if (!thumbnailUrl && type === 'PHOTO') {
      thumbnailUrl = finalUrl
    }
    if (!thumbnailUrl && type === 'VIDEO' && typeof finalUrl === 'string') {
      const ytMatch = finalUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
      if (ytMatch?.[1]) {
        thumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`
      } else {
        const vimeoMatch = finalUrl.match(/vimeo\.com\/(\d+)/)
        if (vimeoMatch?.[1]) {
          thumbnailUrl = `https://vumbnail.com/${vimeoMatch[1]}.jpg`
        }
      }
    }

    const item = await prisma.gallery.create({
      data: {
        title,
        description,
        type,
        url: finalUrl,
        thumbnailUrl,
        albumId,
        fileSize,
        mimeType,
      }
    })

    await createAuditLog({
      userId: req.user?.id,
      action: 'CREATE_GALLERY_ITEM',
      resource: 'gallery',
      resourceId: item.id,
      after: item,
      ipAddress: req.ip,
    })

    res.status(201).json({ success: true, data: item })
  } catch (error) {
    console.error('Gallery creation error:', error)
    res.status(500).json({ success: false, error: 'Gagal menambah item galeri' })
  }
}

export const deleteGalleryItem = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string
  try {
    const item = await prisma.gallery.findUnique({ where: { id } })
    if (!item) {
      res.status(404).json({ success: false, error: 'Item tidak ditemukan' })
      return
    }

    await prisma.gallery.delete({ where: { id } })

    // If it's a local file, delete it from storage
    if (item.url.startsWith('/uploads/')) {
      const fileId = item.url.replace('/uploads/', '')
      await storage.deleteFile(fileId)
    }

    await createAuditLog({
      userId: req.user?.id,
      action: 'DELETE_GALLERY_ITEM',
      resource: 'gallery',
      resourceId: id,
      ipAddress: req.ip,
    })

    res.json({ success: true, message: 'Item berhasil dihapus' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Gagal menghapus item' })
  }
}
