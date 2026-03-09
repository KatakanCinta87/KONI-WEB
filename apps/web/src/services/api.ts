const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

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

export const api = {
    getCabor: () => fetchApi('/cabor'),
    getNews: (limit?: number) => fetchApi(`/news${limit ? `?limit=${limit}` : ''}`),
    getEvents: () => fetchApi('/events'),
    getEventMedalStandings: (id: string) => fetchApi(`/events/${id}/medal-standings`),
    sendContact: (data: any) => fetchApi('/contact', {
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
