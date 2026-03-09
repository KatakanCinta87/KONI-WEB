import cron from 'node-cron'
import { prisma } from '../lib/prisma.js'

export function initCronJobs() {
  // Run every day at 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Running daily SK status check...')
    await updateSKStatuses()
  })
}

export async function updateSKStatuses() {
  const now = new Date()
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(now.getDate() + 30)

  try {
    // 1. Update to EXPIRED
    const expired = await prisma.sKDocument.updateMany({
      where: {
        validUntil: { lt: now },
        status: { not: 'EXPIRED' }
      },
      data: { status: 'EXPIRED' }
    })

    // 2. Update to EXPIRING_SOON
    const expiring = await prisma.sKDocument.updateMany({
      where: {
        validUntil: {
          gte: now,
          lte: thirtyDaysFromNow
        },
        status: 'ACTIVE'
      },
      data: { status: 'EXPIRING_SOON' }
    })

    console.log(`✅ SK Status Update complete. Expired: ${expired.count}, Expiring Soon: ${expiring.count}`)
  } catch (error) {
    console.error('❌ Failed to update SK statuses:', error)
  }
}
