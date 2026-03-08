// ===== KONI Shared Type Definitions =====
// Used across both frontend and backend

// User Roles (RBAC)
export type UserRole = 'SUPER_ADMIN' | 'CABOR_ADMIN' | 'COACH' | 'ATHLETE' | 'PUBLIC'

export type Gender = 'MALE' | 'FEMALE'

export type AthleteStatus = 'ACTIVE' | 'INACTIVE' | 'INJURED'

export type EventType = 'PORKAB' | 'PORPROV' | 'KEJURKAB' | 'OTHER'

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'

export type NewsCategory = 'Prestasi' | 'Event' | 'Organisasi' | 'Sport Science'

export type CaborCategory = 'Beregu' | 'Perorangan' | 'Campuran'

// Entity interfaces
export interface User {
    id: string
    email: string
    role: UserRole
    isActive: boolean
    lastLogin?: string
    createdAt: string
    updatedAt: string
}

export interface Athlete {
    id: string
    userId: string
    nik: string
    fullName: string
    birthPlace: string
    birthDate: string
    gender: Gender
    address: string
    phone?: string
    photoUrl?: string
    weight?: number
    height?: number
    status: AthleteStatus
    caborId: string
    createdAt: string
    updatedAt: string
}

export interface CabangOlahraga {
    id: string
    name: string
    fullName: string
    category: CaborCategory
    logoUrl?: string
    description?: string
    chairmanName?: string
    phone?: string
    email?: string
    address?: string
    isActive: boolean
    adminId?: string
    createdAt: string
    updatedAt: string
}

export interface Event {
    id: string
    name: string
    type: EventType
    description?: string
    startDate: string
    endDate: string
    venue: string
    status: EventStatus
    registDeadline: string
    createdAt: string
    updatedAt: string
}

export interface MedalTally {
    id: string
    eventId: string
    entityType: 'KECAMATAN' | 'CABOR'
    entityName: string
    gold: number
    silver: number
    bronze: number
}

export interface NewsArticle {
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    category: NewsCategory
    imageUrl?: string
    publishedAt: string
    createdAt: string
    updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
    data: T
    message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface ApiError {
    error: string
    code: string
    statusCode: number
}
