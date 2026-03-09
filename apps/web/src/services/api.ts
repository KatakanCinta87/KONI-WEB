import { caborData, eventData, medalTallyData, newsData } from '../data/dummy'
import { isDemoPublishMode } from '../config/runtime'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

function demoResponse<T>(data: T) {
    return Promise.resolve({ success: true, data })
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `API error: ${response.statusText}`)
    }
    return response.json()
}

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken')

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    })

    if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
            try {
                const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken })
                })

                if (refreshRes.ok) {
                    const { data } = await refreshRes.json()
                    localStorage.setItem('accessToken', data.accessToken)
                    if (data.refreshToken) {
                        localStorage.setItem('refreshToken', data.refreshToken)
                    }
                    return fetchWithAuth(endpoint, options)
                }
            } catch {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                window.location.href = '/admin/login'
            }
        }
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || `API error: ${response.statusText}`)
    }
    return response.json()
}

export interface Cabor {
    id: string
    name: string
    fullName: string
    category: string
    logoUrl?: string
    chairmanName?: string
    description?: string
    phone?: string
    email?: string
    athleteCount?: number
}

export interface News {
    id: string
    title: string
    slug: string
    content: string
    excerpt?: string
    category: string
    thumbnailUrl?: string
    publishedAt?: string
    createdAt?: string
    isPublished?: boolean
    caborId?: string
    cabor?: {
        name: string
    }
}

export interface Event {
    id: string
    name: string
    type: string
    description?: string
    startDate: string
    endDate: string
    venue: string
    status: string
}

export interface MedalStanding {
    id?: string
    caborId: string
    gold: number
    silver: number
    bronze: number
    rank?: number | null
    cabor?: {
        id: string
        name: string
        fullName: string
    }
}

export interface Athlete {
    id: string
    nik: string
    fullName: string
    gender: string
    status: string
    caborId: string
    cabor?: { name: string }
    user?: { email: string, isActive: boolean }
}

export interface Coach {
    id: string
    fullName: string
    licenseNumber?: string
    certLevel?: string
    specialization?: string
    caborId: string
    cabor?: { name: string }
    user?: { email: string, isActive: boolean }
}

const demoCabors: Cabor[] = caborData.map((item) => ({
    id: item.id,
    name: item.name,
    fullName: item.fullName,
    category: item.category,
    chairmanName: item.chairmanName,
    description: item.description,
    phone: item.phone,
    email: item.email,
    athleteCount: item.athleteCount,
}))

const demoNews: News[] = newsData.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    content: item.excerpt,
    excerpt: item.excerpt,
    category: item.category.toUpperCase(),
    publishedAt: item.date,
    isPublished: true,
}))

const demoEvents: Event[] = eventData.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    startDate: item.startDate,
    endDate: item.endDate,
    venue: item.venue,
    status: item.status,
}))

const demoPrimaryEvent =
    demoEvents.find((item) => item.status === 'ONGOING')
    || demoEvents.find((item) => item.status === 'UPCOMING')
    || demoEvents[0]

const demoFallbackCabor: Cabor = {
    id: 'demo-cabor-fallback',
    name: 'KONI',
    fullName: 'Komite Olahraga Nasional Indonesia',
    category: 'Campuran',
    chairmanName: 'Tim Demo KONI',
    description: 'Data fallback untuk publish demo Vercel.',
    phone: '-',
    email: 'demo@koni.local',
    athleteCount: 0,
}

const demoMedalStandings: MedalStanding[] = medalTallyData.map((item, index) => {
    const cabor = demoCabors[index % demoCabors.length] ?? demoFallbackCabor

    return {
        id: `demo-standing-${index + 1}`,
        caborId: cabor.id,
        gold: item.gold,
        silver: item.silver,
        bronze: item.bronze,
        rank: item.rank,
        cabor: {
            id: cabor.id,
            name: cabor.name,
            fullName: cabor.fullName,
        },
    }
})

export const api = {
    getCabor: () => isDemoPublishMode ? demoResponse(demoCabors) : fetchApi('/cabor'),
    getNews: (limit?: number) => isDemoPublishMode
        ? demoResponse(limit ? demoNews.slice(0, limit) : demoNews)
        : fetchApi(`/news${limit ? `?limit=${limit}` : ''}`),
    getEvents: () => isDemoPublishMode ? demoResponse(demoEvents) : fetchApi('/events'),
    getEventMedalStandings: (id: string) => isDemoPublishMode
        ? demoResponse({
            event: demoEvents.find((item) => item.id === id) || demoPrimaryEvent || null,
            standings: demoPrimaryEvent?.id === id ? demoMedalStandings : [],
        })
        : fetchApi(`/events/${id}/medal-standings`),
    sendContact: (data: any) => isDemoPublishMode
        ? demoResponse({
            received: true,
            mode: 'demo',
            preview: {
                nama: data?.nama || '',
                email: data?.email || '',
                subjek: data?.subjek || '',
            },
        })
        : fetchApi('/contact', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    login: (data: any) => fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    logout: (refreshToken: string) => fetchApi('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
    }),

    getAthletes: (params: any = {}) => {
        const query = new URLSearchParams(params).toString()
        return fetchWithAuth(`/athletes?${query}`)
    },
    getAthlete: (id: string) => fetchWithAuth(`/athletes/${id}`),
    updateAthlete: (id: string, data: any) => fetchWithAuth(`/athletes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    getAdminStats: () => fetchWithAuth('/admin/dashboard-stats'),

    getAdminNews: () => fetchWithAuth('/news/admin/admin'),
    createNews: (data: any) => fetchWithAuth('/news/admin', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    updateNews: (id: string, data: any) => fetchWithAuth(`/news/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    deleteNews: (id: string) => fetchWithAuth(`/news/admin/${id}`, {
        method: 'DELETE',
    }),

    getCoaches: (params: any = {}) => {
        const query = new URLSearchParams(params).toString()
        return fetchWithAuth(`/coaches?${query}`)
    },
    forgotPassword: (email: string) => fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    }),
    resetPassword: (token: string, newPassword: string) => fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
    }),
}
