import {
    PrismaClient,
    UserRole,
    AthleteStatus,
    Gender,
    EventType,
    EventStatus,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database with Fase 2 schema...')

    const adminPassword = await bcrypt.hash('admin123', 12)
    await prisma.user.upsert({
        where: { email: 'admin@koni-kabmalang.or.id' },
        update: {
            fullName: 'Super Admin KONI',
            password: adminPassword,
            role: UserRole.SUPER_ADMIN,
        },
        create: {
            email: 'admin@koni-kabmalang.or.id',
            password: adminPassword,
            fullName: 'Super Admin KONI',
            role: UserRole.SUPER_ADMIN,
        },
    })
    console.log('  OK Super Admin created/updated')

    const caborData = [
        { name: 'PSSI', fullName: 'Persatuan Sepak Bola Seluruh Indonesia', category: 'Beregu', chairmanName: 'Budi Santoso' },
        { name: 'PBSI', fullName: 'Persatuan Bulutangkis Seluruh Indonesia', category: 'Perorangan', chairmanName: 'Siti Aminah' },
        { name: 'PASI', fullName: 'Persatuan Atletik Seluruh Indonesia', category: 'Perorangan', chairmanName: 'Ahmad Fauzi' },
        { name: 'PBVSI', fullName: 'Persatuan Bola Voli Seluruh Indonesia', category: 'Beregu', chairmanName: 'Rina Dewi' },
        { name: 'PERBASI', fullName: 'Persatuan Bola Basket Seluruh Indonesia', category: 'Beregu', chairmanName: 'Deni Prasetyo' },
        { name: 'PTMSI', fullName: 'Persatuan Tenis Meja Seluruh Indonesia', category: 'Perorangan', chairmanName: 'Lina Hartati' },
        { name: 'PRSI', fullName: 'Persatuan Renang Seluruh Indonesia', category: 'Perorangan', chairmanName: 'Bambang Irawan' },
        { name: 'IPSI', fullName: 'Ikatan Pencak Silat Indonesia', category: 'Perorangan', chairmanName: 'Hendra Wijaya' },
        { name: 'TI', fullName: 'Taekwondo Indonesia', category: 'Perorangan', chairmanName: 'Yoga Permana' },
        { name: 'PJSI', fullName: 'Persatuan Judo Seluruh Indonesia', category: 'Perorangan', chairmanName: 'Eko Nugroho' },
        { name: 'PELTI', fullName: 'Persatuan Lawn Tennis Indonesia', category: 'Perorangan', chairmanName: 'Andi Saputra' },
        { name: 'ISSI', fullName: 'Ikatan Sport Sepeda Indonesia', category: 'Perorangan', chairmanName: 'Fajar Kurniawan' },
    ]

    const cabors = []
    for (const c of caborData) {
        const cabor = await prisma.cabangOlahraga.upsert({
            where: { name: c.name },
            update: {
                fullName: c.fullName,
                category: c.category,
                chairmanName: c.chairmanName,
            },
            create: {
                name: c.name,
                fullName: c.fullName,
                category: c.category,
                description: `Pengurus Kabupaten ${c.fullName} Kabupaten Malang`,
                email: `${c.name.toLowerCase()}@koni-kabmalang.or.id`,
                chairmanName: c.chairmanName,
                chairmanPhone: '081200000000',
                address: 'Jl. Panji, Kepanjen, Kabupaten Malang',
            },
        })
        cabors.push(cabor)
    }
    console.log(`  OK ${cabors.length} Cabang Olahraga created/updated`)

    const caborAdminPassword = await bcrypt.hash('cabor123', 12)
    for (const cabor of cabors.slice(0, 3)) {
        const email = `admin-${cabor.name.toLowerCase()}@koni-kabmalang.or.id`
        const adminUser = await prisma.user.upsert({
            where: { email },
            update: {
                fullName: `Admin ${cabor.name}`,
                password: caborAdminPassword,
                role: UserRole.CABOR_ADMIN,
            },
            create: {
                email,
                password: caborAdminPassword,
                fullName: `Admin ${cabor.name}`,
                role: UserRole.CABOR_ADMIN,
            },
        })

        await prisma.cabangOlahraga.update({
            where: { id: cabor.id },
            data: { adminId: adminUser.id },
        })
    }
    console.log('  OK 3 Cabor Admins created/updated')

    const coachPassword = await bcrypt.hash('pelatih123', 12)
    const coachNames = ['Mulyo Handoyo']

    for (let i = 0; i < coachNames.length; i++) {
        const name = coachNames[i]
        const cabor = cabors[i % cabors.length]
        const email = `${name.toLowerCase().replace(/\s/g, '.')}@coach.koni.id`

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                fullName: name,
                password: coachPassword,
                role: UserRole.COACH,
            },
            create: {
                email,
                password: coachPassword,
                fullName: name,
                role: UserRole.COACH,
            },
        })

        await prisma.coach.upsert({
            where: { nik: `350${String(i + 100).padStart(13, '0')}` },
            update: {
                fullName: name,
                caborId: cabor.id,
            },
            create: {
                userId: user.id,
                nik: `350${String(i + 100).padStart(13, '0')}`,
                fullName: name,
                birthPlace: 'Malang',
                birthDate: new Date(1975, 0, 1),
                gender: Gender.MALE,
                address: `Jl. Pelatih No. ${i + 1}, Kabupaten Malang`,
                caborId: cabor.id,
                licenseNumber: `LIC-${i + 1000}`,
                licenseLevel: 'Nasional A',
            },
        })
    }
    console.log('  OK Coaches created/updated')

    const athletePassword = await bcrypt.hash('atlet123', 12)
    const athleteNames = ['Rudi Hartono', 'Susi Susanti', 'Taufik Hidayat', 'Eko Yuli', 'Defia Rosmaniar']

    for (let i = 0; i < athleteNames.length; i++) {
        const name = athleteNames[i]
        const cabor = cabors[i % cabors.length]
        const email = `${name.toLowerCase().replace(/\s/g, '.')}@athlete.koni.id`

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                fullName: name,
                password: athletePassword,
                role: UserRole.ATHLETE,
            },
            create: {
                email,
                password: athletePassword,
                fullName: name,
                role: UserRole.ATHLETE,
            },
        })

        await prisma.athlete.upsert({
            where: { nik: `350${String(i + 1).padStart(13, '0')}` },
            update: {
                fullName: name,
                caborId: cabor.id,
            },
            create: {
                userId: user.id,
                nik: `350${String(i + 1).padStart(13, '0')}`,
                fullName: name,
                birthPlace: 'Malang',
                birthDate: new Date(2005, 0, 1),
                gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE,
                address: `Jl. Olahraga No. ${i + 1}, Kabupaten Malang`,
                weight: 60,
                height: 170,
                status: AthleteStatus.ACTIVE,
                caborId: cabor.id,
                joinDate: new Date(),
            },
        })
    }
    console.log(`  OK ${athleteNames.length} Athletes created/updated`)

    const settings = [
        { key: 'org_name', value: 'KONI Kabupaten Malang' },
        { key: 'org_tagline', value: 'Bersatu, Berprestasi, Berkarakter' },
        { key: 'org_email', value: 'info@koni-kabmalang.or.id' },
        { key: 'notif_sk_days_before', value: '30' },
    ]

    for (const s of settings) {
        await prisma.systemSetting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: s,
        })
    }
    console.log('  OK System Settings initialized/updated')

    const porkabEvent = await prisma.event.upsert({
        where: { id: 'event-porkab-kab-malang-2026' },
        update: {
            name: 'PORKAB Kabupaten Malang 2026',
            type: EventType.PORKAB,
            description: 'Event induk untuk klasemen medali lintas cabang olahraga KONI Kabupaten Malang.',
            startDate: new Date('2026-07-10T08:00:00.000Z'),
            endDate: new Date('2026-07-20T16:00:00.000Z'),
            venue: 'Kabupaten Malang',
            status: EventStatus.UPCOMING,
        },
        create: {
            id: 'event-porkab-kab-malang-2026',
            name: 'PORKAB Kabupaten Malang 2026',
            type: EventType.PORKAB,
            description: 'Event induk untuk klasemen medali lintas cabang olahraga KONI Kabupaten Malang.',
            startDate: new Date('2026-07-10T08:00:00.000Z'),
            endDate: new Date('2026-07-20T16:00:00.000Z'),
            venue: 'Kabupaten Malang',
            status: EventStatus.UPCOMING,
        },
    })

    const medalSeeds = [
        { caborName: 'PSSI', gold: 3, silver: 1, bronze: 0, rank: 1 },
        { caborName: 'PBSI', gold: 2, silver: 2, bronze: 1, rank: 2 },
        { caborName: 'PASI', gold: 1, silver: 3, bronze: 2, rank: 3 },
    ]

    for (const medalSeed of medalSeeds) {
        const cabor = cabors.find((item) => item.name === medalSeed.caborName)
        if (!cabor) continue

        const existingStanding = await prisma.medalStanding.findFirst({
            where: {
                caborId: cabor.id,
                eventId: porkabEvent.id,
            },
        })

        if (existingStanding) {
            await prisma.medalStanding.update({
                where: { id: existingStanding.id },
                data: {
                    gold: medalSeed.gold,
                    silver: medalSeed.silver,
                    bronze: medalSeed.bronze,
                    rank: medalSeed.rank,
                },
            })
        } else {
            await prisma.medalStanding.create({
                data: {
                    eventId: porkabEvent.id,
                    caborId: cabor.id,
                    gold: medalSeed.gold,
                    silver: medalSeed.silver,
                    bronze: medalSeed.bronze,
                    rank: medalSeed.rank,
                },
            })
        }
    }
    console.log('  OK Minimal Event and Medal Standings created/updated')

    console.log('Seeding completed successfully')
}

main()
    .catch((error) => {
        console.error('Seed error:', error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
