import { z } from 'zod'
import {
  UserRole,
  AthleteStatus,
  Gender,
  AchievementLevel,
  MedalType,
  EventType,
  EventStatus,
} from '@prisma/client'

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token diperlukan'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token diperlukan'),
  newPassword: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password harus mengandung huruf besar, huruf kecil, dan angka'),
})

export const createAthleteSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit'),
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  birthPlace: z.string().min(2, 'Tempat lahir minimal 2 karakter'),
  birthDate: z.string().or(z.date()).pipe(z.coerce.date()),
  gender: z.nativeEnum(Gender),
  religion: z.string().optional(),
  bloodType: z.string().optional(),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  status: z.nativeEnum(AthleteStatus).default(AthleteStatus.ACTIVE),
  caborId: z.string().min(1, 'Cabang olahraga harus dipilih'),
  coachId: z.string().optional(),
})

export const updateAthleteSchema = createAthleteSchema.partial()

export const createAchievementSchema = z.object({
  eventName: z.string().min(2, 'Nama event minimal 2 karakter'),
  level: z.nativeEnum(AchievementLevel),
  medal: z.nativeEnum(MedalType),
  year: z.number().int().min(1900).max(2100),
  eventNumber: z.string().optional(),
  notes: z.string().optional(),
})

export const createCoachSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit'),
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  birthPlace: z.string().min(2, 'Tempat lahir minimal 2 karakter'),
  birthDate: z.string().or(z.date()).pipe(z.coerce.date()),
  gender: z.nativeEnum(Gender),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  phone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  licenseNumber: z.string().optional(),
  licenseLevel: z.string().optional(),
  licenseIssuer: z.string().optional(),
  caborId: z.string().min(1, 'Cabang olahraga harus dipilih'),
})

export const updateCoachSchema = createCoachSchema.partial()

export const createCaborSchema = z.object({
  name: z.string().min(2, 'Singkatan minimal 2 karakter'),
  fullName: z.string().min(5, 'Nama lengkap minimal 5 karakter'),
  category: z.string().min(2, 'Kategori harus diisi'),
  logoUrl: z.string().url('Format URL tidak valid').optional().or(z.literal('')),
  description: z.string().optional(),
  chairmanName: z.string().optional(),
  chairmanPhone: z.string().optional(),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  address: z.string().optional(),
})

export const updateCaborSchema = createCaborSchema.partial()

export const createNewsSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  content: z.string().min(20, 'Konten minimal 20 karakter'),
  category: z.string().min(2, 'Kategori harus diisi'),
  excerpt: z.string().optional(),
  thumbnailUrl: z.string().url('Format URL tidak valid').optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  author: z.string().min(2, 'Nama penulis minimal 2 karakter'),
})

export const updateNewsSchema = createNewsSchema.partial()

const eventSchemaBase = z.object({
  name: z.string().min(3, 'Nama event minimal 3 karakter'),
  type: z.nativeEnum(EventType),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).pipe(z.coerce.date()),
  endDate: z.string().or(z.date()).pipe(z.coerce.date()),
  venue: z.string().min(3, 'Venue minimal 3 karakter'),
  status: z.nativeEnum(EventStatus).default(EventStatus.UPCOMING),
  logoUrl: z.string().url('Format URL tidak valid').optional().or(z.literal('')),
})

export const createEventSchema = eventSchemaBase.refine((data) => data.endDate >= data.startDate, {
  message: 'Tanggal selesai harus setelah tanggal mulai',
  path: ['endDate'],
})

export const updateEventSchema = eventSchemaBase.partial()

export const upsertEventMedalStandingSchema = z.object({
  caborId: z.string().min(1, 'Cabang olahraga harus dipilih'),
  gold: z.number().int().min(0).default(0),
  silver: z.number().int().min(0).default(0),
  bronze: z.number().int().min(0).default(0),
  rank: z.number().int().min(1, 'Peringkat minimal 1').optional(),
  manualOverride: z.boolean().optional(),
})

export const replaceEventMedalStandingsSchema = z.object({
  standings: z.array(upsertEventMedalStandingSchema).min(1, 'Minimal satu data klasemen diperlukan'),
})

const eventTournamentParticipantSchema = z.object({
  participantType: z.enum(['CABOR_CONTINGENT', 'ATHLETE']),
  caborId: z.string().optional(),
  athleteId: z.string().optional(),
  name: z.string().min(2).optional(),
  seedNumber: z.number().int().min(1).optional(),
})

export const createEventTournamentSchema = z.object({
  name: z.string().min(3, 'Nama tournament minimal 3 karakter'),
  participantType: z.enum(['CABOR_CONTINGENT', 'ATHLETE']),
  caborId: z.string().optional(),
  roundRobinGroups: z.number().int().min(1).max(16).default(1),
  knockoutQualified: z.number().int().min(2).max(64).default(4),
  participants: z.array(eventTournamentParticipantSchema).min(2, 'Minimal dua peserta diperlukan'),
})

export const updateTournamentMatchResultSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'FORFEIT', 'CANCELLED']).default('COMPLETED'),
  notes: z.string().optional(),
})

export const tournamentMatchesQuerySchema = z.object({
  stageId: z.string().optional(),
  status: z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'FORFEIT', 'CANCELLED']).optional(),
  roundNumber: z.coerce.number().int().min(1).optional(),
})

export const resetEventMedalOverrideSchema = z.object({
  caborIds: z.array(z.string()).optional(),
})

export const createUserSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  role: z.nativeEnum(UserRole),
  caborId: z.string().optional(),
})

export const registerAthleteSchema = z.object({
  athleteId: z.string().min(1, 'Atlet harus dipilih'),
  matchNumber: z.string().optional(),
  notes: z.string().optional(),
})

export const updateUserSchema = createUserSchema.partial().extend({
  isActive: z.boolean().optional(),
})
