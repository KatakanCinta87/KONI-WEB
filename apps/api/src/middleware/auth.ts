import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'

const SECRET = (process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-only')) as string

if (!SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production environment')
}

export interface AuthRequest extends Request {
    user?: {
        id: string
        email: string
        role: UserRole
    }
}

const roleHierarchy: Record<UserRole, number> = {
    [UserRole.SUPER_ADMIN]: 4,
    [UserRole.CABOR_ADMIN]: 3,
    [UserRole.COACH]: 2,
    [UserRole.ATHLETE]: 1,
}

export const requireAuth = (minRole: UserRole = UserRole.ATHLETE) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Authentication required' })
            return
        }

        const token = authHeader.split(' ')[1]

        try {
            const decoded = jwt.verify(token, SECRET) as { id: string, email: string, role: UserRole }
            
            // Check role hierarchy
            if (roleHierarchy[decoded.role] < roleHierarchy[minRole]) {
                res.status(403).json({ success: false, message: 'Insufficient permissions' })
                return
            }

            req.user = decoded
            next()
        } catch (error) {
            res.status(401).json({ success: false, message: 'Invalid or expired token' })
            return
        }
    }
}
