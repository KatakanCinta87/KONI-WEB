import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Medal, Plus, Save, Settings2, Swords, Table2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { handleApiError } from '../../lib/utils'

const eventSchema = z.object({
  name: z.string().min(3, 'Nama event minimal 3 karakter'),
  type: z.enum(['PORKAB', 'PORPROV', 'KEJURKAB', 'OTHER']),
  venue: z.string().min(3, 'Lokasi minimal 3 karakter'),
  status: z.enum(['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
  description: z.string().optional(),
  logoUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
})

type EventFormData = z.infer<typeof eventSchema>

interface Cabor {
  id: string
  name: string
  fullName: string
}

interface StandingRow {
  caborId: string
  gold: number
  silver: number
  bronze: number
  rank: number | ''
  manualOverride: boolean
}

type TournamentParticipantType = 'CABOR_CONTINGENT' | 'ATHLETE'
type TabKey = 'event' | 'tournament' | 'competition' | 'medal'

interface AthleteOption {
  id: string
  fullName: string
  caborId: string
}

interface TournamentParticipantRow {
  participantType: TournamentParticipantType
  caborId: string
  athleteId: string
  name: string
  seedNumber: number
}

interface TournamentItem {
  id: string
  name: string
  status: string
  participantType: TournamentParticipantType
}

interface TournamentMatch {
  id: string
  roundNumber: number
  matchNumber: number
  status: string
  stage?: { type: string } | null
  homeScore?: number | null
  awayScore?: number | null
  homeParticipant?: { name: string } | null
  awayParticipant?: { name: string } | null
}

interface TournamentStanding {
  id: string
  rank: number
  points: number
  played: number
  win: number
  draw: number
  loss: number
  scoreFor: number
  scoreAgainst: number
  scoreDiff: number
  participant?: { name: string }
  cabor?: { name: string } | null
}

function toDatetimeLocalInput(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)
  return localDate.toISOString().slice(0, 16)
}

export default function AdminEventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [activeTab, setActiveTab] = useState<TabKey>('event')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [savingStandings, setSavingStandings] = useState(false)
  const [cabors, setCabors] = useState<Cabor[]>([])
  const [athletes, setAthletes] = useState<AthleteOption[]>([])
  const [baseOptionsLoading, setBaseOptionsLoading] = useState(false)
  const [baseOptionsError, setBaseOptionsError] = useState<string | null>(null)
  const [athleteSearch, setAthleteSearch] = useState('')
  const [athleteCaborFilter, setAthleteCaborFilter] = useState('')
  const [standings, setStandings] = useState<StandingRow[]>([])
  const [tournaments, setTournaments] = useState<TournamentItem[]>([])
  const [selectedTournamentId, setSelectedTournamentId] = useState('')
  const [matches, setMatches] = useState<TournamentMatch[]>([])
  const [competitionStandings, setCompetitionStandings] = useState<TournamentStanding[]>([])
  const [bundleLoading, setBundleLoading] = useState(false)
  const [bundleError, setBundleError] = useState<string | null>(null)
  const [lastBundleSyncAt, setLastBundleSyncAt] = useState<string | null>(null)
  const [submittingTournament, setSubmittingTournament] = useState(false)
  const [generatingTournament, setGeneratingTournament] = useState(false)
  const [generatingKnockout, setGeneratingKnockout] = useState(false)
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null)
  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    participantType: 'CABOR_CONTINGENT' as TournamentParticipantType,
    roundRobinGroups: 1,
    knockoutQualified: 4,
  })
  const [tournamentParticipants, setTournamentParticipants] = useState<TournamentParticipantRow[]>([
    { participantType: 'CABOR_CONTINGENT', caborId: '', athleteId: '', name: '', seedNumber: 1 },
    { participantType: 'CABOR_CONTINGENT', caborId: '', athleteId: '', name: '', seedNumber: 2 },
  ])

  const { register, handleSubmit, reset, formState: { errors }, setError } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      type: 'PORKAB',
      status: 'UPCOMING',
      description: '',
      logoUrl: '',
      startDate: '',
      endDate: '',
    },
  })

  const loadBaseOptions = useCallback(async () => {
    setBaseOptionsLoading(true)
    setBaseOptionsError(null)
    try {
      const [caborRes, athleteRes] = await Promise.all([
        api.get('/cabor'),
        api.get('/athletes'),
      ])
      setCabors(caborRes.data.data || [])
      setAthletes((athleteRes.data.data || []).map((item: any) => ({
        id: item.id,
        fullName: item.fullName,
        caborId: item.caborId,
      })))
    } catch (error) {
      setBaseOptionsError('Gagal memuat data cabor/atlet. Coba lagi.')
      handleApiError(error)
    } finally {
      setBaseOptionsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBaseOptions()
  }, [loadBaseOptions])

  const loadTournamentBundle = useCallback(async (
    eventId: string,
    forcedTournamentId?: string,
    options?: { silent?: boolean },
  ) => {
    const silent = Boolean(options?.silent)
    if (!silent) setBundleLoading(true)
    setBundleError(null)

    try {
      const listRes = await api.get(`/admin/events/${eventId}/tournaments`)
      const listData: TournamentItem[] = listRes.data.data || []
      setTournaments(listData)

      const activeTournamentId = forcedTournamentId || selectedTournamentId || listData[0]?.id || ''
      setSelectedTournamentId(activeTournamentId)

      if (!activeTournamentId) {
        setMatches([])
        setCompetitionStandings([])
        setLastBundleSyncAt(new Date().toISOString())
        return
      }

      const [matchRes, standingRes] = await Promise.all([
        api.get(`/admin/events/${eventId}/tournaments/${activeTournamentId}/matches`),
        api.get(`/admin/events/${eventId}/tournaments/${activeTournamentId}/standings`),
      ])
      setMatches(matchRes.data.data || [])
      setCompetitionStandings(standingRes.data.data || [])
      setLastBundleSyncAt(new Date().toISOString())
    } catch (error) {
      setBundleError('Gagal memuat data tournament/standings. Coba refresh data.')
      throw error
    } finally {
      if (!silent) setBundleLoading(false)
    }
  }, [selectedTournamentId])

  useEffect(() => {
    if (!isEdit || !id) return
    let ignore = false

    const loadEvent = async () => {
      try {
        const res = await api.get(`/admin/events/${id}`)
        if (ignore) return
        const event = res.data.data
        reset({
          name: event.name,
          type: event.type,
          venue: event.venue,
          status: event.status,
          description: event.description || '',
          logoUrl: event.logoUrl || '',
          startDate: toDatetimeLocalInput(event.startDate),
          endDate: toDatetimeLocalInput(event.endDate),
        })

        setStandings((event.medalStandings || []).map((item: any) => ({
          caborId: item.caborId,
          gold: item.gold,
          silver: item.silver,
          bronze: item.bronze,
          rank: item.rank ?? '',
          manualOverride: item.manualOverride ?? true,
        })))
        await loadTournamentBundle(id)
      } catch (error) {
        if (!ignore) handleApiError(error)
      } finally {
        if (!ignore) setFetching(false)
      }
    }

    loadEvent()
    return () => {
      ignore = true
    }
  }, [id, isEdit, loadTournamentBundle, reset])

  useEffect(() => {
    if (!isEdit || !id || !selectedTournamentId) return
    if (activeTab !== 'tournament' && activeTab !== 'competition') return
    loadTournamentBundle(id, selectedTournamentId, { silent: true }).catch(() => undefined)
  }, [activeTab, id, isEdit, loadTournamentBundle, selectedTournamentId])

  useEffect(() => {
    if (!isEdit || !id || !selectedTournamentId) return
    if (activeTab !== 'tournament' && activeTab !== 'competition') return

    const timer = setInterval(() => {
      loadTournamentBundle(id, selectedTournamentId, { silent: true }).catch(() => undefined)
    }, 20000)

    return () => clearInterval(timer)
  }, [activeTab, id, isEdit, loadTournamentBundle, selectedTournamentId])

  const onSubmit = async (data: EventFormData) => {
    setLoading(true)
    try {
      const payload = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      }

      if (isEdit) {
        await api.patch(`/admin/events/${id}`, payload)
        toast.success('Event berhasil diperbarui')
      } else {
        const res = await api.post('/admin/events', payload)
        toast.success('Event berhasil dibuat')
        navigate(`/admin/events/edit/${res.data.data.id}`)
        return
      }
    } catch (error) {
      handleApiError(error, setError)
    } finally {
      setLoading(false)
    }
  }

  const addStandingRow = () => {
    setStandings((prev) => [...prev, { caborId: '', gold: 0, silver: 0, bronze: 0, rank: prev.length + 1, manualOverride: true }])
  }

  const updateStanding = (index: number, key: keyof StandingRow, value: string | number | boolean) => {
    setStandings((prev) => prev.map((item, itemIndex) => {
      if (itemIndex !== index) return item
      return { ...item, [key]: value }
    }))
  }

  const removeStanding = (index: number) => {
    setStandings((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
  }

  const duplicateCabor = useMemo(() => {
    const ids = standings.map((item) => item.caborId).filter(Boolean)
    return ids.length !== new Set(ids).size
  }, [standings])

  const filteredAthletes = useMemo(() => {
    const normalizedQuery = athleteSearch.trim().toLowerCase()
    return athletes.filter((athlete) => {
      if (athleteCaborFilter && athlete.caborId !== athleteCaborFilter) return false
      if (!normalizedQuery) return true
      return athlete.fullName.toLowerCase().includes(normalizedQuery)
    })
  }, [athleteCaborFilter, athleteSearch, athletes])

  const participantRowErrors = useMemo(() => {
    const seedCount = new Map<number, number>()
    tournamentParticipants.forEach((row) => {
      seedCount.set(row.seedNumber, (seedCount.get(row.seedNumber) ?? 0) + 1)
    })

    return tournamentParticipants.map((row, index) => {
      if (!Number.isInteger(row.seedNumber) || row.seedNumber < 1) {
        return 'Seed number wajib bilangan bulat minimal 1.'
      }
      if ((seedCount.get(row.seedNumber) ?? 0) > 1) {
        return 'Seed number duplikat terdeteksi.'
      }
      if (row.participantType === 'CABOR_CONTINGENT' && !row.caborId) {
        return `Baris ${index + 1}: pilih cabor peserta.`
      }
      if (row.participantType === 'ATHLETE' && !row.athleteId) {
        return `Baris ${index + 1}: pilih atlet peserta.`
      }
      return ''
    })
  }, [tournamentParticipants])

  const participantValidationError = useMemo(() => {
    if (!tournamentForm.name.trim()) return 'Nama tournament wajib diisi'
    if (tournamentParticipants.length < 2) return 'Minimal 2 peserta diperlukan'

    const seedNumbers = tournamentParticipants.map((row) => row.seedNumber)
    if (seedNumbers.some((seed) => !Number.isInteger(seed) || seed < 1)) {
      return 'Seed number wajib bilangan bulat minimal 1'
    }
    if (new Set(seedNumbers).size !== seedNumbers.length) {
      return 'Seed number tidak boleh duplikat'
    }

    const firstRowError = participantRowErrors.find(Boolean)
    if (firstRowError) return firstRowError

    return null
  }, [participantRowErrors, tournamentForm.name, tournamentParticipants])

  const saveStandings = async () => {
    if (!id) return
    if (standings.length === 0) {
      toast.error('Tambahkan minimal satu baris klasemen')
      return
    }
    if (standings.some((item) => !item.caborId)) {
      toast.error('Semua baris klasemen harus memilih cabor')
      return
    }
    if (duplicateCabor) {
      toast.error('Cabor duplikat tidak diperbolehkan')
      return
    }

    setSavingStandings(true)
    try {
      await api.put(`/admin/events/${id}/medal-standings`, {
        standings: standings.map((item) => ({
          caborId: item.caborId,
          gold: Number(item.gold),
          silver: Number(item.silver),
          bronze: Number(item.bronze),
          rank: item.rank === '' ? undefined : Number(item.rank),
          manualOverride: item.manualOverride,
        })),
      })
      toast.success('Klasemen medali berhasil diperbarui')
    } catch (error) {
      handleApiError(error)
    } finally {
      setSavingStandings(false)
    }
  }

  const resetMedalOverride = async () => {
    if (!id) return
    try {
      await api.post(`/admin/events/${id}/medal-standings/reset-override`, { caborIds: [] })
      toast.success('Manual override berhasil direset')
      const res = await api.get(`/admin/events/${id}`)
      const event = res.data.data
      setStandings((event.medalStandings || []).map((item: any) => ({
        caborId: item.caborId,
        gold: item.gold,
        silver: item.silver,
        bronze: item.bronze,
        rank: item.rank ?? '',
        manualOverride: item.manualOverride ?? false,
      })))
    } catch (error) {
      handleApiError(error)
    }
  }

  const createTournament = async () => {
    if (!id) return
    if (participantValidationError) {
      toast.error(participantValidationError)
      return
    }

    setSubmittingTournament(true)
    try {
      await api.post(`/admin/events/${id}/tournaments`, {
        ...tournamentForm,
        participants: tournamentParticipants.map((item) => ({
          participantType: item.participantType,
          caborId: item.participantType === 'CABOR_CONTINGENT' ? item.caborId : undefined,
          athleteId: item.participantType === 'ATHLETE' ? item.athleteId : undefined,
          name: item.name || undefined,
          seedNumber: item.seedNumber,
        })),
      })
      toast.success('Tournament berhasil dibuat')
      setTournamentForm({ name: '', participantType: 'CABOR_CONTINGENT', roundRobinGroups: 1, knockoutQualified: 4 })
      setTournamentParticipants([
        { participantType: 'CABOR_CONTINGENT', caborId: '', athleteId: '', name: '', seedNumber: 1 },
        { participantType: 'CABOR_CONTINGENT', caborId: '', athleteId: '', name: '', seedNumber: 2 },
      ])
      await loadTournamentBundle(id)
    } catch (error) {
      handleApiError(error)
    } finally {
      setSubmittingTournament(false)
    }
  }

  const generateBracket = async (tournamentId: string) => {
    if (!id) return
    setGeneratingTournament(true)
    try {
      await api.post(`/admin/events/${id}/tournaments/${tournamentId}/generate`)
      toast.success('Bracket tournament berhasil digenerate')
      await loadTournamentBundle(id, tournamentId)
    } catch (error) {
      handleApiError(error)
    } finally {
      setGeneratingTournament(false)
    }
  }

  const saveMatchResult = async (match: TournamentMatch) => {
    if (!id || !selectedTournamentId) return
    setSavingMatchId(match.id)
    try {
      await api.patch(`/admin/events/${id}/tournaments/${selectedTournamentId}/matches/${match.id}/result`, {
        homeScore: Number(match.homeScore ?? 0),
        awayScore: Number(match.awayScore ?? 0),
        status: 'COMPLETED',
      })
      toast.success('Hasil pertandingan berhasil diperbarui')
      await loadTournamentBundle(id, selectedTournamentId)
    } catch (error) {
      handleApiError(error)
    } finally {
      setSavingMatchId(null)
    }
  }

  const generateKnockout = async (tournamentId: string) => {
    if (!id) return
    setGeneratingKnockout(true)
    try {
      await api.post(`/admin/events/${id}/tournaments/${tournamentId}/generate-knockout`)
      toast.success('Stage knockout berhasil digenerate')
      await loadTournamentBundle(id, tournamentId)
    } catch (error) {
      handleApiError(error)
    } finally {
      setGeneratingKnockout(false)
    }
  }

  const recomputeMedal = async () => {
    if (!id || !selectedTournamentId) return
    try {
      await api.post(`/admin/events/${id}/tournaments/${selectedTournamentId}/medals/recompute`)
      toast.success('Recompute medali event berhasil')
      await loadTournamentBundle(id, selectedTournamentId)
    } catch (error) {
      handleApiError(error)
    }
  }

  const selectedTournament = useMemo(
    () => tournaments.find((item) => item.id === selectedTournamentId) || null,
    [selectedTournamentId, tournaments],
  )
  const rrMatches = useMemo(
    () => matches.filter((match) => match.stage?.type === 'ROUND_ROBIN'),
    [matches],
  )
  const hasKnockoutMatch = useMemo(
    () => matches.some((match) => match.stage?.type === 'KNOCKOUT'),
    [matches],
  )
  const rrFinished = useMemo(
    () => rrMatches.length > 0 && rrMatches.every((match) => match.status === 'COMPLETED' && match.homeScore !== null && match.awayScore !== null),
    [rrMatches],
  )
  const canGenerateKnockout = Boolean(selectedTournament) && rrFinished && !hasKnockoutMatch

  if (fetching) return <div>Memuat data event...</div>

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => navigate('/admin/events')}
          style={{ background: 'white', border: '1px solid #E2E8F0', padding: '0.55rem', borderRadius: '10px', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            {isEdit ? 'Edit Event & Klasemen' : 'Buat Event Baru'}
          </h1>
          <p style={{ margin: '0.35rem 0 0', color: '#64748B' }}>
            {isEdit ? 'Perbarui detail event dan klasemen medalinya.' : 'Simpan event terlebih dulu sebelum mengelola klasemen.'}
          </p>
        </div>
      </div>

      {isEdit && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { key: 'event', label: 'Event Info', icon: <Settings2 size={16} /> },
            { key: 'tournament', label: 'Tournament', icon: <Swords size={16} /> },
            { key: 'competition', label: 'Competition Ranking', icon: <Table2 size={16} /> },
            { key: 'medal', label: 'Medal Ranking', icon: <Medal size={16} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              style={{
                border: '1px solid #E2E8F0',
                background: activeTab === tab.key ? '#0F172A' : 'white',
                color: activeTab === tab.key ? 'white' : '#0F172A',
                borderRadius: '10px',
                padding: '0.6rem 0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {(!isEdit || activeTab === 'event') && (
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={labelStyle}>Nama Event</label>
            <input {...register('name')} style={inputStyle(errors.name)} placeholder="PORKAB Kabupaten Malang 2026" />
            {errors.name && <FieldError message={errors.name.message} />}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={labelStyle}>Tipe Event</label>
              <select {...register('type')} style={inputStyle(errors.type)}>
                <option value="PORKAB">PORKAB</option>
                <option value="PORPROV">PORPROV</option>
                <option value="KEJURKAB">KEJURKAB</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={labelStyle}>Status</label>
              <select {...register('status')} style={inputStyle(errors.status)}>
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={labelStyle}>Lokasi / Venue</label>
            <input {...register('venue')} style={inputStyle(errors.venue)} placeholder="Kabupaten Malang" />
            {errors.venue && <FieldError message={errors.venue.message} />}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={labelStyle}>Mulai</label>
              <input type="datetime-local" {...register('startDate')} style={inputStyle(errors.startDate)} />
              {errors.startDate && <FieldError message={errors.startDate.message} />}
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={labelStyle}>Selesai</label>
              <input type="datetime-local" {...register('endDate')} style={inputStyle(errors.endDate)} />
              {errors.endDate && <FieldError message={errors.endDate.message} />}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={labelStyle}>Logo URL</label>
            <input {...register('logoUrl')} style={inputStyle(errors.logoUrl)} placeholder="https://..." />
            {errors.logoUrl && <FieldError message={errors.logoUrl.message} />}
          </div>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={labelStyle}>Deskripsi</label>
            <textarea {...register('description')} rows={5} style={{ ...inputStyle(undefined), resize: 'vertical', fontFamily: 'inherit' }} placeholder="Deskripsi singkat event..." />
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'grid', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Aksi Event</h3>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '0.8rem', border: 'none', borderRadius: '10px', background: '#0F172A', color: 'white', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isEdit ? 'Simpan Perubahan' : 'Buat Event'}
            </button>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Medal size={18} color="#D4AF37" />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Klasemen Medali</h3>
            </div>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.9rem' }}>
              {isEdit ? 'Kelola perolehan medali per cabor untuk event ini.' : 'Setelah event dibuat, Anda bisa menambahkan klasemen medali di halaman edit event.'}
            </p>
          </div>
        </div>
      </form>
      )}

      {isEdit && activeTab === 'tournament' && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {bundleError && (
            <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#B91C1C', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <span>{bundleError}</span>
              {id && (
                <button type="button" onClick={() => loadTournamentBundle(id, selectedTournamentId || undefined)} style={secondaryButtonStyle}>
                  Coba Lagi
                </button>
              )}
            </div>
          )}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'grid', gap: '0.9rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Buat Tournament Baru</h2>
            {baseOptionsError && (
              <div style={{ padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#B91C1C', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <span>{baseOptionsError}</span>
                <button type="button" onClick={loadBaseOptions} style={secondaryButtonStyle}>Reload Opsi</button>
              </div>
            )}
            {baseOptionsLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#64748B', fontSize: '0.85rem' }}>
                <Loader2 size={14} className="animate-spin" />
                Memuat opsi peserta...
              </div>
            )}
            {participantValidationError && (
              <div style={{ padding: '0.7rem 0.85rem', borderRadius: '10px', background: '#FFF7ED', border: '1px solid #FDBA74', color: '#9A3412', fontSize: '0.85rem' }}>
                {participantValidationError}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem' }}>
              <input value={tournamentForm.name} onChange={(event) => setTournamentForm((prev) => ({ ...prev, name: event.target.value }))} style={miniInputStyle} placeholder="Nama tournament" />
              <select value={tournamentForm.participantType} onChange={(event) => setTournamentForm((prev) => ({ ...prev, participantType: event.target.value as TournamentParticipantType }))} style={miniInputStyle}>
                <option value="CABOR_CONTINGENT">CABOR_CONTINGENT</option>
                <option value="ATHLETE">ATHLETE</option>
              </select>
              <input type="number" min={1} value={tournamentForm.roundRobinGroups} onChange={(event) => setTournamentForm((prev) => ({ ...prev, roundRobinGroups: Number(event.target.value) }))} style={miniInputStyle} />
              <input type="number" min={2} value={tournamentForm.knockoutQualified} onChange={(event) => setTournamentForm((prev) => ({ ...prev, knockoutQualified: Number(event.target.value) }))} style={miniInputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <input
                value={athleteSearch}
                onChange={(event) => setAthleteSearch(event.target.value)}
                placeholder="Cari nama atlet..."
                style={miniInputStyle}
              />
              <select
                value={athleteCaborFilter}
                onChange={(event) => setAthleteCaborFilter(event.target.value)}
                style={miniInputStyle}
              >
                <option value="">Semua Cabor (Atlet)</option>
                {cabors.map((cabor) => <option key={cabor.id} value={cabor.id}>{cabor.name}</option>)}
              </select>
            </div>
            {tournamentParticipants.map((row, index) => (
              <div key={`${index}-${row.seedNumber}-${row.participantType}`} style={{ display: 'grid', gap: '0.35rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr 1fr 48px', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="number" min={1} value={row.seedNumber} onChange={(event) => setTournamentParticipants((prev) => prev.map((x, i) => i === index ? { ...x, seedNumber: Number(event.target.value) } : x))} style={miniInputStyle} />
                  <select value={row.participantType} onChange={(event) => setTournamentParticipants((prev) => prev.map((x, i) => i === index ? { ...x, participantType: event.target.value as TournamentParticipantType } : x))} style={miniInputStyle}>
                    <option value="CABOR_CONTINGENT">CABOR</option>
                    <option value="ATHLETE">ATHLETE</option>
                  </select>
                  {row.participantType === 'CABOR_CONTINGENT' ? (
                    <select value={row.caborId} onChange={(event) => setTournamentParticipants((prev) => prev.map((x, i) => i === index ? { ...x, caborId: event.target.value } : x))} style={miniInputStyle}>
                      <option value="">Pilih Cabor</option>
                      {cabors.map((cabor) => <option key={cabor.id} value={cabor.id}>{cabor.name}</option>)}
                    </select>
                  ) : (
                    <select value={row.athleteId} onChange={(event) => setTournamentParticipants((prev) => prev.map((x, i) => i === index ? { ...x, athleteId: event.target.value } : x))} style={miniInputStyle}>
                      <option value="">Pilih Atlet</option>
                      {filteredAthletes.map((athlete) => <option key={athlete.id} value={athlete.id}>{athlete.fullName}</option>)}
                      {filteredAthletes.length === 0 && <option value="" disabled>Tidak ada atlet sesuai filter</option>}
                    </select>
                  )}
                  <input value={row.name} onChange={(event) => setTournamentParticipants((prev) => prev.map((x, i) => i === index ? { ...x, name: event.target.value } : x))} style={miniInputStyle} placeholder="Display name (opsional)" />
                  <button type="button" onClick={() => setTournamentParticipants((prev) => prev.filter((_, i) => i !== index))} style={{ border: 'none', background: '#FEF2F2', borderRadius: '8px', height: '38px', cursor: 'pointer', color: '#DC2626' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
                {participantRowErrors[index] && (
                  <p style={{ margin: 0, color: '#B45309', fontSize: '0.8rem' }}>{participantRowErrors[index]}</p>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button type="button" onClick={() => setTournamentParticipants((prev) => [...prev, { participantType: tournamentForm.participantType, caborId: '', athleteId: '', name: '', seedNumber: prev.length + 1 }])} style={secondaryButtonStyle}><Plus size={16} /> Tambah Peserta</button>
              <button type="button" onClick={createTournament} disabled={submittingTournament || Boolean(participantValidationError)} style={secondaryButtonStyle}>
                {submittingTournament ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan Tournament
              </button>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'grid', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Tournament Tersedia</h2>
              <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {bundleLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                {bundleLoading ? 'Memuat data...' : (lastBundleSyncAt ? `Sinkron: ${new Date(lastBundleSyncAt).toLocaleTimeString('id-ID')}` : 'Belum sinkron')}
              </div>
            </div>
            {tournaments.length === 0 ? <p style={{ margin: 0, color: '#64748B' }}>Belum ada tournament untuk event ini.</p> : tournaments.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.8rem 1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{item.status} | {item.participantType}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setSelectedTournamentId(item.id)} disabled={bundleLoading} style={secondaryButtonStyle}>Pilih</button>
                  <button type="button" onClick={() => generateBracket(item.id)} disabled={generatingTournament || bundleLoading} style={secondaryButtonStyle}>
                    {generatingTournament ? <Loader2 size={16} className="animate-spin" /> : <Settings2 size={16} />}
                    Generate RR
                  </button>
                  {item.id === selectedTournamentId && canGenerateKnockout && (
                    <button type="button" onClick={() => generateKnockout(item.id)} disabled={generatingKnockout || bundleLoading} style={secondaryButtonStyle}>
                      {generatingKnockout ? <Loader2 size={16} className="animate-spin" /> : <Swords size={16} />}
                      Generate KO
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedTournamentId && (
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem', display: 'grid', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Match Result Editor</h2>
                <button type="button" onClick={recomputeMedal} disabled={bundleLoading} style={secondaryButtonStyle}><Medal size={16} /> Recompute Medal</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC' }}>
                      <th style={tableHeadStyle}>Round</th>
                      <th style={tableHeadStyle}>Match</th>
                      <th style={tableHeadStyle}>Home</th>
                      <th style={tableHeadStyle}>Away</th>
                      <th style={tableHeadStyle}>Score</th>
                      <th style={tableHeadStyle}>Status</th>
                      <th style={tableHeadStyle}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.length === 0 && <tr><td colSpan={7} style={{ padding: '1rem', textAlign: 'center', color: '#64748B' }}>Belum ada match. Generate bracket dulu.</td></tr>}
                    {matches.map((match) => (
                      <tr key={match.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={tableCellStyle}>R{match.roundNumber}</td>
                        <td style={tableCellStyle}>#{match.matchNumber}</td>
                        <td style={tableCellStyle}>{match.homeParticipant?.name || '-'}</td>
                        <td style={tableCellStyle}>{match.awayParticipant?.name || '-'}</td>
                        <td style={tableCellStyle}>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <input type="number" min={0} value={match.homeScore ?? 0} onChange={(event) => setMatches((prev) => prev.map((item) => item.id === match.id ? { ...item, homeScore: Number(event.target.value) } : item))} style={{ ...miniInputStyle, width: '70px' }} />
                            <span>-</span>
                            <input type="number" min={0} value={match.awayScore ?? 0} onChange={(event) => setMatches((prev) => prev.map((item) => item.id === match.id ? { ...item, awayScore: Number(event.target.value) } : item))} style={{ ...miniInputStyle, width: '70px' }} />
                          </div>
                        </td>
                        <td style={tableCellStyle}>{match.status}</td>
                        <td style={tableCellStyle}>
                          <button type="button" onClick={() => saveMatchResult(match)} disabled={bundleLoading || savingMatchId === match.id} style={secondaryButtonStyle}>
                            {savingMatchId === match.id ? <Loader2 size={14} className="animate-spin" /> : 'Simpan'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {isEdit && activeTab === 'competition' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>Competition Ranking (Points / GD / GF / H2H)</h2>
            <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {bundleLoading ? <Loader2 size={14} className="animate-spin" /> : null}
              {bundleLoading ? 'Memuat data...' : (lastBundleSyncAt ? `Sinkron: ${new Date(lastBundleSyncAt).toLocaleTimeString('id-ID')}` : 'Belum sinkron')}
            </div>
          </div>
          {bundleError && id && (
            <div style={{ marginBottom: '0.8rem', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#B91C1C', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <span>{bundleError}</span>
              <button type="button" onClick={() => loadTournamentBundle(id, selectedTournamentId || undefined)} style={secondaryButtonStyle}>
                Coba Lagi
              </button>
            </div>
          )}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={tableHeadStyle}>Rank</th>
                  <th style={tableHeadStyle}>Participant</th>
                  <th style={tableHeadStyle}>Cabor</th>
                  <th style={tableHeadStyle}>Pts</th>
                  <th style={tableHeadStyle}>P</th>
                  <th style={tableHeadStyle}>W</th>
                  <th style={tableHeadStyle}>D</th>
                  <th style={tableHeadStyle}>L</th>
                  <th style={tableHeadStyle}>GF</th>
                  <th style={tableHeadStyle}>GA</th>
                  <th style={tableHeadStyle}>GD</th>
                </tr>
              </thead>
              <tbody>
                {competitionStandings.length === 0 && <tr><td colSpan={11} style={{ padding: '1rem', textAlign: 'center', color: '#64748B' }}>Belum ada standings. Input hasil pertandingan dulu.</td></tr>}
                {competitionStandings.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={tableCellStyle}>{row.rank}</td>
                    <td style={tableCellStyle}>{row.participant?.name || '-'}</td>
                    <td style={tableCellStyle}>{row.cabor?.name || '-'}</td>
                    <td style={tableCellStyle}>{row.points}</td>
                    <td style={tableCellStyle}>{row.played}</td>
                    <td style={tableCellStyle}>{row.win}</td>
                    <td style={tableCellStyle}>{row.draw}</td>
                    <td style={tableCellStyle}>{row.loss}</td>
                    <td style={tableCellStyle}>{row.scoreFor}</td>
                    <td style={tableCellStyle}>{row.scoreAgainst}</td>
                    <td style={tableCellStyle}>{row.scoreDiff}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isEdit && activeTab === 'medal' && (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>Editor Klasemen Medali</h2>
              <p style={{ margin: '0.35rem 0 0', color: '#64748B' }}>Simpan seluruh klasemen dalam satu kali submit.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={addStandingRow}
                style={{ padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#0F172A', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} />
                Tambah Baris
              </button>
              <button
                type="button"
                onClick={saveStandings}
                disabled={savingStandings}
                style={{ padding: '0.7rem 1rem', borderRadius: '10px', border: 'none', background: '#C8102E', color: 'white', fontWeight: 700, cursor: savingStandings ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {savingStandings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan Klasemen
              </button>
              <button
                type="button"
                onClick={resetMedalOverride}
                style={{ padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#0F172A', fontWeight: 700, cursor: 'pointer' }}
              >
                Reset Override
              </button>
            </div>
          </div>

          {duplicateCabor && (
            <div style={{ padding: '0.9rem 1rem', borderRadius: '12px', background: '#FEF2F2', color: '#B91C1C', fontWeight: 600 }}>
              Ada cabor yang dipilih lebih dari sekali. Perbaiki sebelum menyimpan.
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={tableHeadStyle}>Rank</th>
                  <th style={tableHeadStyle}>Cabor</th>
                  <th style={tableHeadStyle}>Emas</th>
                  <th style={tableHeadStyle}>Perak</th>
                  <th style={tableHeadStyle}>Perunggu</th>
                  <th style={tableHeadStyle}>Manual</th>
                  <th style={tableHeadStyle}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {standings.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B' }}>
                      Belum ada baris klasemen. Tambahkan data untuk mulai mengisi medali.
                    </td>
                  </tr>
                )}
                {standings.map((row, index) => (
                  <tr key={`${row.caborId}-${index}`} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={tableCellStyle}>
                      <input
                        type="number"
                        min={1}
                        value={row.rank}
                        onChange={(event) => updateStanding(index, 'rank', event.target.value === '' ? '' : Number(event.target.value))}
                        style={miniInputStyle}
                      />
                    </td>
                    <td style={tableCellStyle}>
                      <select
                        value={row.caborId}
                        onChange={(event) => updateStanding(index, 'caborId', event.target.value)}
                        style={{ ...miniInputStyle, minWidth: '220px' }}
                      >
                        <option value="">Pilih Cabor</option>
                        {cabors.map((cabor) => (
                          <option key={cabor.id} value={cabor.id}>
                            {cabor.name} - {cabor.fullName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={tableCellStyle}>
                      <input type="number" min={0} value={row.gold} onChange={(event) => updateStanding(index, 'gold', Number(event.target.value))} style={miniInputStyle} />
                    </td>
                    <td style={tableCellStyle}>
                      <input type="number" min={0} value={row.silver} onChange={(event) => updateStanding(index, 'silver', Number(event.target.value))} style={miniInputStyle} />
                    </td>
                    <td style={tableCellStyle}>
                      <input type="number" min={0} value={row.bronze} onChange={(event) => updateStanding(index, 'bronze', Number(event.target.value))} style={miniInputStyle} />
                    </td>
                    <td style={tableCellStyle}>
                      <input type="checkbox" checked={row.manualOverride} onChange={(event) => updateStanding(index, 'manualOverride', event.target.checked)} />
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        type="button"
                        onClick={() => removeStanding(index)}
                        style={{ padding: '0.45rem', borderRadius: '8px', border: 'none', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p style={{ margin: 0, color: '#DC2626', fontSize: '0.8rem' }}>{message}</p>
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

function inputStyle(error?: unknown): React.CSSProperties {
  return {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: '10px',
    border: error ? '1px solid #DC2626' : '1px solid #E2E8F0',
    outline: 'none',
    background: 'white',
  }
}

const tableHeadStyle: React.CSSProperties = {
  padding: '0.9rem 1rem',
  textAlign: 'left',
  fontSize: '0.8rem',
  color: '#64748B',
  fontWeight: 700,
}

const tableCellStyle: React.CSSProperties = {
  padding: '0.9rem 1rem',
  verticalAlign: 'top',
}

const miniInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #E2E8F0',
  outline: 'none',
  background: 'white',
}

const secondaryButtonStyle: React.CSSProperties = {
  padding: '0.5rem 0.85rem',
  borderRadius: '10px',
  border: '1px solid #E2E8F0',
  background: 'white',
  color: '#0F172A',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  cursor: 'pointer',
}


