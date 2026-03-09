import { prisma } from '../lib/prisma.js'

export async function createAuditLog(params: {
  userId?: string
  action: string        // format: "CREATE_ATHLETE", "UPDATE_NEWS", dll
  resource: string      // "athlete", "coach", "cabor", "news", "gallery", "user", "sk"
  resourceId?: string
  before?: object       // snapshot sebelum (untuk UPDATE dan DELETE)
  after?: object        // snapshot sesudah (untuk CREATE dan UPDATE)
  ipAddress?: string
  userAgent?: string
}): Promise<void> {
  try {
    // Sanitize snapshots: remove sensitive fields like password
    const sanitize = (obj: any) => {
      if (!obj) return obj
      const cloned = { ...obj }
      if (cloned.password) delete cloned.password
      return cloned
    }

    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        before: params.before ? sanitize(params.before) : undefined,
        after: params.after ? sanitize(params.after) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error('❌ Failed to create audit log:', error)
    // Non-blocking: we don't throw error to the caller
  }
}
