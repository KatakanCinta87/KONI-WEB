import api from '../lib/axios'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
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
  views?: number
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

export interface EventMedalSelectionPayload {
  featuredEventId: string | null
  concurrentEventIds: string[]
}

export interface EventsWithSelectionPayload {
  events: Event[]
  medalSelection?: EventMedalSelectionPayload
}

export interface TournamentItem {
  id: string
  name: string
  status: string
  participantType: string
}

export interface TournamentStanding {
  id: string
  rank: number
  points: number
  played: number
  win: number
  loss: number
  participant?: {
    id: string
    name: string
  }
}

export interface MedalStanding {
  id?: string
  caborId: string
  gold: number
  silver: number
  bronze: number
  rank?: number | null
  manualOverride?: boolean
  lastSource?: string
  cabor?: {
    id: string
    name: string
    fullName: string
  }
}

interface EventMedalPayload {
  event?: Event
  standings: MedalStanding[]
}

function normalizeEventMedalPayload(raw: unknown): EventMedalPayload {
  if (Array.isArray(raw)) {
    return { standings: raw as MedalStanding[] }
  }

  if (raw && typeof raw === 'object') {
    const payload = raw as { event?: Event; standings?: MedalStanding[] }
    return {
      event: payload.event,
      standings: Array.isArray(payload.standings) ? payload.standings : [],
    }
  }

  return { standings: [] }
}

export const publicApi = {
  async getCabor(): Promise<ApiResponse<Cabor[]>> {
    const { data } = await api.get('/cabor')
    return data
  },

  async getNews(limit?: number): Promise<ApiResponse<News[]>> {
    const { data } = await api.get(`/news${limit ? `?limit=${limit}` : ''}`)
    return data
  },

  async getNewsDetail(slug: string): Promise<ApiResponse<News>> {
    const { data } = await api.get(`/news/${slug}`)
    return data
  },

  async getEvents(includeConcurrent?: boolean): Promise<ApiResponse<Event[] | EventsWithSelectionPayload>> {
    const query = includeConcurrent ? '?includeConcurrent=true' : ''
    const { data } = await api.get(`/events${query}`)
    if (Array.isArray(data?.data)) return data
    if (data?.data && Array.isArray(data.data.events)) return data
    return { ...data, data: [] as Event[] }
  },

  async getEventDetail(id: string): Promise<ApiResponse<Event>> {
    const { data } = await api.get(`/events/${id}`)
    return data
  },

  async getEventTournaments(eventId: string): Promise<ApiResponse<TournamentItem[]>> {
    const { data } = await api.get(`/events/${eventId}/tournaments`)
    return data
  },

  async getTournamentStandings(eventId: string, tournamentId: string): Promise<ApiResponse<TournamentStanding[]>> {
    const { data } = await api.get(`/events/${eventId}/tournaments/${tournamentId}/standings`)
    return data
  },

  async getEventMedalStandings(id: string): Promise<ApiResponse<EventMedalPayload>> {
    const { data } = await api.get(`/events/${id}/medal-standings`)
    return {
      ...data,
      data: normalizeEventMedalPayload(data?.data),
    }
  },

  async sendContact(payload: {
    nama: string
    email: string
    subjek: string
    pesan: string
  }): Promise<ApiResponse<null>> {
    const { data } = await api.post('/contact', payload)
    return data
  },
}
