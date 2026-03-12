import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { prisma } from '../lib/prisma.js'
import { sendResetPasswordEmail } from '../services/email.service.js'
import { validate } from '../middleware/validate.middleware.js'
import { loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema } from '../lib/zod-schemas.js'

const router = Router()
const JWT_SECRET = (process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-only')) as string
const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-refresh-secret-only')) as string

if ((!JWT_SECRET || !JWT_REFRESH_SECRET) && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production environment')
}

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000

function signAccessToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  )
}

function signRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: 'Kredensial tidak valid' })
      return
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Kredensial tidak valid' })
      return
    }

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user.id)

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      }
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          mustChangePassword: user.mustChangePassword
        }
      }
    })
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// POST /api/v1/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), async (req, res) => {
  const { refreshToken } = req.body

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string }
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!storedToken || storedToken.userId !== decoded.id || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { token: refreshToken } }).catch(() => undefined)
      }
      res.status(401).json({ success: false, error: 'Refresh token tidak valid atau kadaluwarsa' })
      return
    }

    if (!storedToken.user.isActive) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } }).catch(() => undefined)
      res.status(401).json({ success: false, error: 'User tidak aktif' })
      return
    }

    const nextAccessToken = signAccessToken(storedToken.user)
    const nextRefreshToken = signRefreshToken(storedToken.user.id)

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token: refreshToken } }),
      prisma.refreshToken.create({
        data: {
          token: nextRefreshToken,
          userId: storedToken.user.id,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        },
      }),
    ])

    res.json({
      success: true,
      data: {
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      },
    })
  } catch {
    res.status(401).json({ success: false, error: 'Refresh token tidak valid atau kadaluwarsa' })
  }
})

// POST /api/v1/auth/logout
router.post('/logout', validate(refreshTokenSchema), async (req, res) => {
  const { refreshToken } = req.body

  try {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    })

    res.json({ success: true, message: 'Logout berhasil' })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal logout' })
  }
})

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
  const { email } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      res.json({ success: true, message: 'Jika email terdaftar, instruksi reset akan dikirim' })
      return
    }

    const token = crypto.randomBytes(32).toString('hex')
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000)
      }
    })

    await sendResetPasswordEmail(email, token)
    res.json({ success: true, message: 'Email reset password telah dikirim' })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal memproses permintaan' })
  }
})

// POST /api/v1/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
  const { token, newPassword } = req.body
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken || resetToken.expiresAt < new Date()) {
      res.status(400).json({ success: false, error: 'Token tidak valid atau kadaluwarsa' })
      return
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false
      }
    })

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
    await prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } })

    res.json({ success: true, message: 'Password berhasil diperbarui' })
  } catch {
    res.status(500).json({ success: false, error: 'Gagal mereset password' })
  }
})

export default router
