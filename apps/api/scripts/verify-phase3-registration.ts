import { prisma } from '../src/lib/prisma.js'

async function verifyRegistration() {
  console.log('--- Verifying Phase 3 Event Registration ---')
  
  try {
    // 1. Get an official event
    const event = await prisma.event.findFirst({
      where: { scope: 'OFFICIAL', status: 'UPCOMING' }
    })
    
    if (!event) {
      console.log('❌ No official upcoming event found for testing')
      return
    }
    console.log(`✅ Found event: ${event.name}`)

    // 2. Get an athlete
    const athlete = await prisma.athlete.findFirst()
    if (!athlete) {
      console.log('❌ No athlete found for testing')
      return
    }
    console.log(`✅ Found athlete: ${athlete.fullName}`)

    // 3. Try to register
    console.log('Attempting to register athlete...')
    const registration = await prisma.eventRegistration.upsert({
      where: {
        eventId_athleteId: {
          eventId: event.id,
          athleteId: athlete.id
        }
      },
      update: {
        status: 'CONFIRMED'
      },
      create: {
        eventId: event.id,
        athleteId: athlete.id,
        caborId: athlete.caborId,
        status: 'CONFIRMED',
        matchNumber: 'Test Match'
      }
    })
    
    console.log(`✅ Registration successful: ${registration.id}`)

    // 4. Verify list endpoint would work (querying DB)
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: event.id },
      include: { athlete: true }
    })
    
    if (registrations.length > 0) {
      console.log(`✅ List registrations successful: ${registrations.length} found`)
    } else {
      console.log('❌ List registrations failed')
    }

    // Cleanup (optional, but good for idempotency)
    // await prisma.eventRegistration.delete({ where: { id: registration.id } })
    // console.log('✅ Cleanup successful')

  } catch (error) {
    console.error('❌ Verification failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyRegistration()
