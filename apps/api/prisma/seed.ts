import {
  PrismaClient,
  UserRole,
  AthleteStatus,
  Gender,
  EventType,
  EventStatus,
  RegistStatus,
  ScheduleStatus,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const tournamentModel = (prisma as any).eventTournament
const tournamentParticipantModel = (prisma as any).eventTournamentParticipant

async function upsertBaseUsersAndCabors() {
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
        isActive: true,
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

  const coachPassword = await bcrypt.hash('pelatih123', 12)
  const coachNames = ['Mulyo Handoyo']
  for (let i = 0; i < coachNames.length; i += 1) {
    const name = coachNames[i]
    const cabor = cabors[i % cabors.length]
    const email = `${name.toLowerCase().replace(/\s/g, '.')}@coach.koni.id`

    const user = await prisma.user.upsert({
      where: { email },
      update: { fullName: name, password: coachPassword, role: UserRole.COACH },
      create: { email, password: coachPassword, fullName: name, role: UserRole.COACH },
    })

    await prisma.coach.upsert({
      where: { nik: `350${String(i + 100).padStart(13, '0')}` },
      update: { fullName: name, caborId: cabor.id, userId: user.id },
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

  const athletePassword = await bcrypt.hash('atlet123', 12)
  const athleteNames = ['Rudi Hartono', 'Susi Susanti', 'Taufik Hidayat', 'Eko Yuli', 'Defia Rosmaniar']
  for (let i = 0; i < athleteNames.length; i += 1) {
    const name = athleteNames[i]
    const cabor = cabors[i % cabors.length]
    const email = `${name.toLowerCase().replace(/\s/g, '.')}@athlete.koni.id`

    const user = await prisma.user.upsert({
      where: { email },
      update: { fullName: name, password: athletePassword, role: UserRole.ATHLETE },
      create: { email, password: athletePassword, fullName: name, role: UserRole.ATHLETE },
    })

    await prisma.athlete.upsert({
      where: { nik: `350${String(i + 1).padStart(13, '0')}` },
      update: { fullName: name, caborId: cabor.id, userId: user.id, deletedAt: null, status: AthleteStatus.ACTIVE },
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

  return { cabors }
}

async function upsertOfficialEvents(cabors: Array<{ id: string; name: string }>) {
  const now = new Date()
  const nowPlus6h = new Date(now.getTime() + 6 * 60 * 60 * 1000)
  const nowPlus8h = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  const nowMinus4h = new Date(now.getTime() - 4 * 60 * 60 * 1000)
  const nowMinus2h = new Date(now.getTime() - 2 * 60 * 60 * 1000)

  const ponEvent = await prisma.event.upsert({
    where: { id: 'event-pon-kab-malang-2026' },
    update: {
      name: 'PON Pra-Kabupaten Malang 2026',
      type: EventType.PON,
      scope: 'OFFICIAL',
      description: 'Event prioritas tertinggi untuk validasi hierarchy homepage.',
      startDate: nowMinus4h,
      endDate: nowPlus6h,
      venue: 'GOR Kanjuruhan',
      status: EventStatus.ONGOING,
    },
    create: {
      id: 'event-pon-kab-malang-2026',
      name: 'PON Pra-Kabupaten Malang 2026',
      type: EventType.PON,
      scope: 'OFFICIAL',
      description: 'Event prioritas tertinggi untuk validasi hierarchy homepage.',
      startDate: nowMinus4h,
      endDate: nowPlus6h,
      venue: 'GOR Kanjuruhan',
      status: EventStatus.ONGOING,
    },
  })

  const porprovEvent = await prisma.event.upsert({
    where: { id: 'event-porprov-kab-malang-2026' },
    update: {
      name: 'PORPROV Kabupaten Malang 2026',
      type: EventType.PORPROV,
      scope: 'OFFICIAL',
      description: 'Event hierarchy level kedua yang overlap dengan PON.',
      startDate: nowMinus2h,
      endDate: nowPlus8h,
      venue: 'Sport Center Kepanjen',
      status: EventStatus.ONGOING,
    },
    create: {
      id: 'event-porprov-kab-malang-2026',
      name: 'PORPROV Kabupaten Malang 2026',
      type: EventType.PORPROV,
      scope: 'OFFICIAL',
      description: 'Event hierarchy level kedua yang overlap dengan PON.',
      startDate: nowMinus2h,
      endDate: nowPlus8h,
      venue: 'Sport Center Kepanjen',
      status: EventStatus.ONGOING,
    },
  })

  const porkabEvent = await prisma.event.upsert({
    where: { id: 'event-porkab-kab-malang-2026' },
    update: {
      name: 'PORKAB Kabupaten Malang 2026',
      type: EventType.PORKAB,
      scope: 'OFFICIAL',
      description: 'Event induk untuk klasemen medali lintas cabang olahraga KONI Kabupaten Malang.',
      startDate: new Date('2026-07-10T08:00:00.000Z'),
      endDate: new Date('2026-07-20T16:00:00.000Z'),
      venue: 'Kabupaten Malang',
      status: EventStatus.UPCOMING,
      registDeadline: new Date('2026-06-30T23:59:59.000Z'),
    },
    create: {
      id: 'event-porkab-kab-malang-2026',
      name: 'PORKAB Kabupaten Malang 2026',
      type: EventType.PORKAB,
      scope: 'OFFICIAL',
      description: 'Event induk untuk klasemen medali lintas cabang olahraga KONI Kabupaten Malang.',
      startDate: new Date('2026-07-10T08:00:00.000Z'),
      endDate: new Date('2026-07-20T16:00:00.000Z'),
      venue: 'Kabupaten Malang',
      status: EventStatus.UPCOMING,
      registDeadline: new Date('2026-06-30T23:59:59.000Z'),
    },
  })

  const pssiCabor = cabors.find((c) => c.name === 'PSSI')
  if (pssiCabor) {
    await prisma.eventSchedule.upsert({
      where: { id: 'sched-pssi-final-2026' },
      update: {
        eventId: porkabEvent.id,
        caborId: pssiCabor.id,
        matchName: 'Final Sepak Bola Putra',
        startTime: new Date('2026-07-19T15:00:00.000Z'),
        venue: 'Stadion Kanjuruhan',
        status: ScheduleStatus.SCHEDULED,
      },
      create: {
        id: 'sched-pssi-final-2026',
        eventId: porkabEvent.id,
        caborId: pssiCabor.id,
        matchName: 'Final Sepak Bola Putra',
        startTime: new Date('2026-07-19T15:00:00.000Z'),
        venue: 'Stadion Kanjuruhan',
        status: ScheduleStatus.SCHEDULED,
      },
    })
  }

  const allAthletes = await prisma.athlete.findMany({ where: { deletedAt: null } })
  for (const athlete of allAthletes.slice(0, 3)) {
    await prisma.eventRegistration.upsert({
      where: {
        eventId_athleteId: {
          eventId: porkabEvent.id,
          athleteId: athlete.id,
        },
      },
      update: { status: RegistStatus.CONFIRMED, caborId: athlete.caborId },
      create: {
        eventId: porkabEvent.id,
        athleteId: athlete.id,
        caborId: athlete.caborId,
        matchNumber: 'K-001',
        status: RegistStatus.CONFIRMED,
      },
    })
  }

  if (pssiCabor) {
    const existingResult = await prisma.matchResult.findFirst({
      where: { eventId: porkabEvent.id, caborId: pssiCabor.id, matchName: 'Penyisihan Grup A - Match 1' },
    })
    if (existingResult) {
      await prisma.matchResult.update({
        where: { id: existingResult.id },
        data: {
          gold: 'Kecamatan Kepanjen',
          silver: 'Kecamatan Gondanglegi',
          bronze: 'Kecamatan Turen',
          notes: 'Pertandingan pembuka PORKAB 2026',
        },
      })
    } else {
      await prisma.matchResult.create({
        data: {
          eventId: porkabEvent.id,
          caborId: pssiCabor.id,
          matchName: 'Penyisihan Grup A - Match 1',
          gold: 'Kecamatan Kepanjen',
          silver: 'Kecamatan Gondanglegi',
          bronze: 'Kecamatan Turen',
          notes: 'Pertandingan pembuka PORKAB 2026',
        },
      })
    }
  }

  const medalSeeds: Array<{ eventId: string; caborName: string; gold: number; silver: number; bronze: number; rank: number }> = [
    { eventId: ponEvent.id, caborName: 'PSSI', gold: 5, silver: 2, bronze: 1, rank: 1 },
    { eventId: ponEvent.id, caborName: 'PBSI', gold: 3, silver: 4, bronze: 2, rank: 2 },
    { eventId: ponEvent.id, caborName: 'PASI', gold: 2, silver: 1, bronze: 3, rank: 3 },
    { eventId: porprovEvent.id, caborName: 'PBVSI', gold: 2, silver: 0, bronze: 1, rank: 1 },
    { eventId: porprovEvent.id, caborName: 'PERBASI', gold: 1, silver: 2, bronze: 0, rank: 2 },
    { eventId: porkabEvent.id, caborName: 'IPSI', gold: 1, silver: 0, bronze: 0, rank: 1 },
  ]

  for (const medalSeed of medalSeeds) {
    const cabor = cabors.find((item) => item.name === medalSeed.caborName)
    if (!cabor) continue
    await prisma.medalStanding.upsert({
      where: {
        eventId_caborId: {
          eventId: medalSeed.eventId,
          caborId: cabor.id,
        },
      },
      update: {
        gold: medalSeed.gold,
        silver: medalSeed.silver,
        bronze: medalSeed.bronze,
        rank: medalSeed.rank,
        manualOverride: true,
        lastSource: 'MANUAL',
      },
      create: {
        eventId: medalSeed.eventId,
        caborId: cabor.id,
        gold: medalSeed.gold,
        silver: medalSeed.silver,
        bronze: medalSeed.bronze,
        rank: medalSeed.rank,
        manualOverride: true,
        lastSource: 'MANUAL',
      },
    })
  }

  return { ponEvent, porprovEvent, porkabEvent }
}

async function upsertOfficialTournament(eventId: string, cabors: Array<{ id: string; name: string }>) {
  const participantCabors = ['PSSI', 'PBSI', 'PASI', 'IPSI']
    .map((name) => cabors.find((item) => item.name === name))
    .filter(Boolean) as Array<{ id: string; name: string }>

  let tournament = await tournamentModel.findFirst({
    where: {
      eventId,
      scope: 'OFFICIAL',
      ownerUserId: null,
      name: 'Official PON RR + KO Seed 2026',
    },
  })

  if (!tournament) {
    tournament = await tournamentModel.create({
      data: {
        eventId,
        scope: 'OFFICIAL',
        ownerUserId: null,
        ownerRole: null,
        name: 'Official PON RR + KO Seed 2026',
        participantType: 'CABOR_CONTINGENT',
        roundRobinGroups: 1,
        knockoutQualified: 4,
        totalParticipantsTarget: participantCabors.length,
        status: 'DRAFT',
      },
    })
  } else {
    tournament = await tournamentModel.update({
      where: { id: tournament.id },
      data: {
        participantType: 'CABOR_CONTINGENT',
        roundRobinGroups: 1,
        knockoutQualified: 4,
        totalParticipantsTarget: participantCabors.length,
      },
    })
  }

  const existingParticipants = await tournamentParticipantModel.findMany({ where: { tournamentId: tournament.id } })
  if (existingParticipants.length === 0) {
    await tournamentParticipantModel.createMany({
      data: participantCabors.map((cabor, index) => ({
        tournamentId: tournament.id,
        participantType: 'CABOR_CONTINGENT',
        caborId: cabor.id,
        name: cabor.name,
        seedNumber: index + 1,
      })),
    })
  }
}

async function upsertSandboxDemoData(eventId: string, cabors: Array<{ id: string; name: string }>) {
  const ownerEmails = [
    'admin-pssi@koni-kabmalang.or.id',
    'mulyo.handoyo@coach.koni.id',
    'rudi.hartono@athlete.koni.id',
  ]

  for (const email of ownerEmails) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) continue

    const roleLabel = user.role === UserRole.CABOR_ADMIN
      ? 'CABOR_ADMIN'
      : user.role === UserRole.COACH
        ? 'COACH'
        : 'ATHLETE'

    const caborId = user.role === UserRole.CABOR_ADMIN
      ? (await prisma.cabangOlahraga.findUnique({ where: { adminId: user.id }, select: { id: true } }))?.id ?? null
      : user.role === UserRole.COACH
        ? (await prisma.coach.findUnique({ where: { userId: user.id }, select: { caborId: true } }))?.caborId ?? null
        : (await prisma.athlete.findUnique({ where: { userId: user.id }, select: { caborId: true } }))?.caborId ?? null

    const fallbackCabor = cabors.find((item) => item.name === 'PSSI')
    const effectiveCaborId = caborId ?? fallbackCabor?.id ?? null
    if (!effectiveCaborId) continue

    let sandboxTournament = await tournamentModel.findFirst({
      where: {
        eventId,
        scope: 'SANDBOX',
        ownerUserId: user.id,
        name: `Sandbox ${roleLabel} Demo`,
      },
    })

    if (!sandboxTournament) {
      sandboxTournament = await tournamentModel.create({
        data: {
          eventId,
          scope: 'SANDBOX',
          ownerUserId: user.id,
          ownerRole: user.role,
          name: `Sandbox ${roleLabel} Demo`,
          participantType: 'CABOR_CONTINGENT',
          caborId: effectiveCaborId,
          roundRobinGroups: 1,
          knockoutQualified: 2,
          totalParticipantsTarget: 2,
          status: 'DRAFT',
        },
      })
    } else {
      sandboxTournament = await tournamentModel.update({
        where: { id: sandboxTournament.id },
        data: {
          participantType: 'CABOR_CONTINGENT',
          caborId: effectiveCaborId,
          roundRobinGroups: 1,
          knockoutQualified: 2,
          totalParticipantsTarget: 2,
        },
      })
    }

    const existingParticipants = await tournamentParticipantModel.findMany({ where: { tournamentId: sandboxTournament.id } })
    if (existingParticipants.length === 0) {
      await tournamentParticipantModel.createMany({
        data: [
          {
            tournamentId: sandboxTournament.id,
            participantType: 'CABOR_CONTINGENT',
            caborId: effectiveCaborId,
            name: `${roleLabel} Team A`,
            seedNumber: 1,
          },
          {
            tournamentId: sandboxTournament.id,
            participantType: 'CABOR_CONTINGENT',
            caborId: effectiveCaborId,
            name: `${roleLabel} Team B`,
            seedNumber: 2,
          },
        ],
      })
    }
  }
}

async function main() {
  console.log('Seeding database with Phase 4 dataset...')
  const { cabors } = await upsertBaseUsersAndCabors()
  const { ponEvent } = await upsertOfficialEvents(cabors)
  await upsertOfficialTournament(ponEvent.id, cabors)
  await upsertSandboxDemoData(ponEvent.id, cabors)
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
