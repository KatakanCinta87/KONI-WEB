import { prisma } from '../lib/prisma.js'

export async function resolveManagedCaborId(userId?: string | null) {
  if (!userId) return null

  const managedCabor = await prisma.cabangOlahraga.findUnique({
    where: { adminId: userId },
    select: { id: true },
  })

  return managedCabor?.id ?? null
}
