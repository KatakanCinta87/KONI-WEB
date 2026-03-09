import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth.js'
import { createAuditLog } from '../services/audit.service.js'

/**
 * Middleware to automatically log mutation actions.
 * Usage: router.post('/', requireAuth(), auditMiddleware('CREATE_ATHLETE', 'athlete'), controller)
 */
export function auditMiddleware(action: string, resource: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Only log successful mutations (POST, PATCH, PUT, DELETE)
    const originalJson = res.json
    const originalSend = res.send

    // Helper to extract IP address
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || ''
    const userAgent = req.headers['user-agent'] || ''

    // Wrap res.json to capture when response is sent
    res.json = function (data: any) {
      res.json = originalJson
      const result = res.json(data)

      // Only log if status is successful (2xx) and it's a mutation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
          // Fire and forget: don't wait for audit log to finish
          createAuditLog({
            userId: req.user?.id,
            action,
            resource,
            resourceId: req.params.id || data?.data?.id || data?.id,
            // Note: before/after snapshots are better handled at controller level 
            // for complex diffs, but we can capture the result data as 'after'
            after: req.method !== 'DELETE' ? data?.data || data : undefined,
            ipAddress,
            userAgent,
          })
        }
      }

      return result
    }

    next()
  }
}
