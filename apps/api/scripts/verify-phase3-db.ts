import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
    console.log('Verifying Phase 3 Database State...')
    let failures = 0

    const event = await prisma.event.findFirst({
        where: { id: 'event-porkab-kab-malang-2026' },
        include: {
            schedules: true,
            registrations: true,
            results: true
        }
    })

    if (!event) {
        console.error('❌ Event PORKAB 2026 not found!')
        process.exit(1)
    }

    console.log(`✅ Event found: ${event.name}`)
    console.log(`   - Schedules: ${event.schedules.length}`)
    console.log(`   - Registrations: ${event.registrations.length}`)
    console.log(`   - Results: ${event.results.length}`)

    if (event.schedules.length > 0) {
        console.log(`✅ Schedule sample: ${event.schedules[0].matchName}`)
    } else {
        console.error('❌ No schedules found!')
        failures += 1
    }

    if (event.registrations.length > 0) {
        console.log(`✅ Registration sample: ${event.registrations[0].athleteId}`)
    } else {
        console.error('❌ No registrations found!')
        failures += 1
    }

    if (event.results.length > 0) {
        console.log(`✅ Result sample: ${event.results[0].matchName}`)
    } else {
        console.error('❌ No results found!')
        failures += 1
    }

    if (failures > 0) {
        console.error(`❌ Verification failed with ${failures} issue(s).`)
        process.exit(1)
    }

    console.log('Verification completed.')
}

verify()
    .catch(err => {
        console.error(err)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
