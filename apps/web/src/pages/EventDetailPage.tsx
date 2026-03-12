import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarRange, MapPin, Trophy, Swords, ArrowLeft, Radio, FileSpreadsheet, FileText } from 'lucide-react'
import { publicApi, type Event, type MedalStanding, type TournamentItem, type TournamentStanding } from '../services/public-api'
import { useLiveEvent } from '../hooks/useLiveEvent'

type ActiveTab = 'ringkasan' | 'tournament' | 'standings'

export default function EventDetailPage() {
  const { id = '' } = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [medalStandings, setMedalStandings] = useState<MedalStanding[]>([])
  const [tournaments, setTournaments] = useState<TournamentItem[]>([])
  const [selectedTournamentId, setSelectedTournamentId] = useState('')
  const [selectedTournamentStandings, setSelectedTournamentStandings] = useState<TournamentStanding[]>([])
  const [activeTab, setActiveTab] = useState<ActiveTab>('ringkasan')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isConnected } = useLiveEvent(id)

  const loadEventDetail = useCallback(async (isRefresh = false) => {
    if (!id) return
    if (!isRefresh) setLoading(true)
    setError('')
    try {
      const [eventRes, medalRes, tournamentRes] = await Promise.all([
        publicApi.getEventDetail(id),
        publicApi.getEventMedalStandings(id),
        publicApi.getEventTournaments(id),
      ])

      if (!eventRes.success || !eventRes.data) {
        if (!isRefresh) setError('Event tidak ditemukan.')
        return
      }

      setEvent(eventRes.data)
      setMedalStandings(medalRes.success ? medalRes.data.standings : [])
      const rows = tournamentRes.success ? (tournamentRes.data || []) : []
      setTournaments(rows)
      const firstRow = rows[0]
      if (!selectedTournamentId && firstRow) {
        setSelectedTournamentId(firstRow.id)
      }
    } catch {
      if (!isRefresh) setError('Gagal memuat detail event.')
    } finally {
      if (!isRefresh) setLoading(false)
    }
  }, [id, selectedTournamentId])

  const loadTournamentStandings = useCallback(async () => {
    if (!id || !selectedTournamentId) {
      setSelectedTournamentStandings([])
      return
    }
    try {
      const res = await publicApi.getTournamentStandings(id, selectedTournamentId)
      if (!res.success) {
        setSelectedTournamentStandings([])
        return
      }
      setSelectedTournamentStandings(res.data || [])
    } catch {
      setSelectedTournamentStandings([])
    }
  }, [id, selectedTournamentId])

  useEffect(() => {
    loadEventDetail()
  }, [id]) // intentionally omitting loadEventDetail to avoid loops if needed, or use stable loadEventDetail

  useEffect(() => {
    if (activeTab === 'standings') {
      loadTournamentStandings()
    }
  }, [activeTab, id, selectedTournamentId, loadTournamentStandings])

  useEffect(() => {
    const handleLiveUpdate = (e: any) => {
      const { type } = e.detail
      if (type === 'medal') {
        loadEventDetail(true)
      } else if (type === 'score' && activeTab === 'standings') {
        loadTournamentStandings()
      }
    }

    window.addEventListener('live-update', handleLiveUpdate)
    return () => window.removeEventListener('live-update', handleLiveUpdate)
  }, [activeTab, loadEventDetail, loadTournamentStandings])

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p style={{ margin: 0, color: '#64748B' }}>Memuat detail event...</p>
        </div>
      </section>
    )
  }

  if (error || !event) {
    return (
      <section className="section">
        <div className="container">
          <p style={{ margin: 0, color: '#B91C1C' }}>{error || 'Event tidak ditemukan.'}</p>
          <Link to="/event" style={{ marginTop: '0.75rem', display: 'inline-block', color: '#DC2626' }}>Kembali ke daftar event</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="section" style={{ background: '#F8FAFC', minHeight: '70vh' }}>
      <div className="container">
        <Link to="/event" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', color: '#DC2626', marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Kembali ke daftar event
        </Link>

        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ display: 'inline-flex', padding: '0.2rem 0.55rem', borderRadius: '999px', background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {event.type}
          </div>
          <h1 style={{ margin: 0, color: '#0F172A', fontSize: 'clamp(1.4rem, 3vw, 2rem)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {event.name}
            {isConnected && (
              <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.5rem', background: '#ECFDF5', borderRadius: '6px', border: '1px solid #D1FAE5' }}>
                <Radio size={12} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} /> LIVE
              </span>
            )}
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: '#64748B' }}>
            <CalendarRange size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.3rem' }} />
            {new Date(event.startDate).toLocaleDateString('id-ID')} - {new Date(event.endDate).toLocaleDateString('id-ID')}
          </p>
          <p style={{ margin: '0.35rem 0 0', color: '#64748B' }}>
            <MapPin size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.3rem' }} />
            {event.venue}
          </p>
          {event.description && <p style={{ margin: '0.8rem 0 0', color: '#334155' }}>{event.description}</p>}
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setActiveTab('ringkasan')} style={tabStyle(activeTab === 'ringkasan')}>
            Ringkasan
          </button>
          <button type="button" onClick={() => setActiveTab('tournament')} style={tabStyle(activeTab === 'tournament')}>
            Tournament
          </button>
          <button type="button" onClick={() => setActiveTab('standings')} style={tabStyle(activeTab === 'standings')}>
            Standings
          </button>
        </div>

        {activeTab === 'ringkasan' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ margin: 0, color: '#0F172A', fontSize: '1.05rem' }}>Klasemen Medali Event</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a 
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/events/${id}/export/excel`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 600, color: '#059669', textDecoration: 'none', background: 'white' }}
                >
                  <FileSpreadsheet size={14} /> Excel
                </a>
                <a 
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/events/${id}/export/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 600, color: '#DC2626', textDecoration: 'none', background: 'white' }}
                >
                  <FileText size={14} /> PDF
                </a>
              </div>
            </div>
            {medalStandings.length === 0 && <p style={{ color: '#64748B', margin: 0 }}>Belum ada klasemen medali untuk event ini.</p>}
            {medalStandings.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Rank</th>
                      <th style={thStyle}>Cabor</th>
                      <th style={thStyle}>Emas</th>
                      <th style={thStyle}>Perak</th>
                      <th style={thStyle}>Perunggu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medalStandings.map((row, index) => (
                      <tr key={`${row.caborId}-${index}`} style={{ borderTop: '1px solid #E2E8F0' }}>
                        <td style={tdStyle}>{row.rank ?? index + 1}</td>
                        <td style={tdStyle}>{row.cabor?.name || '-'}</td>
                        <td style={tdStyle}>{row.gold}</td>
                        <td style={tdStyle}>{row.silver}</td>
                        <td style={tdStyle}>{row.bronze}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tournament' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem' }}>
            <h2 style={{ marginTop: 0, color: '#0F172A', fontSize: '1.05rem' }}>Tournament Resmi Event</h2>
            {tournaments.length === 0 && <p style={{ color: '#64748B', margin: 0 }}>Belum ada tournament resmi untuk event ini.</p>}
            {tournaments.length > 0 && (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {tournaments.map((item) => (
                  <div key={item.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#0F172A', fontWeight: 700 }}>
                      <Swords size={15} /> {item.name}
                    </div>
                    <p style={{ margin: '0.35rem 0 0', color: '#64748B', fontSize: '0.88rem' }}>
                      Status: {item.status} • Peserta: {item.participantType}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'standings' && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem' }}>
            <h2 style={{ marginTop: 0, color: '#0F172A', fontSize: '1.05rem' }}>Standings Tournament</h2>
            {tournaments.length > 0 && (
              <select
                value={selectedTournamentId}
                onChange={(eventParam) => setSelectedTournamentId(eventParam.target.value)}
                style={{ marginBottom: '1rem', width: '100%', maxWidth: '380px', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '0.55rem 0.65rem' }}
              >
                {tournaments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            )}

            {selectedTournamentStandings.length === 0 && (
              <p style={{ color: '#64748B', margin: 0 }}>Standings belum tersedia untuk tournament ini.</p>
            )}

            {selectedTournamentStandings.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Rank</th>
                      <th style={thStyle}>Peserta</th>
                      <th style={thStyle}>Poin</th>
                      <th style={thStyle}>Main</th>
                      <th style={thStyle}>Menang</th>
                      <th style={thStyle}>Kalah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTournamentStandings.map((row) => (
                      <tr key={row.id} style={{ borderTop: '1px solid #E2E8F0' }}>
                        <td style={tdStyle}>{row.rank}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Trophy size={14} color="#94A3B8" />
                            {row.participant?.name || '-'}
                          </div>
                        </td>
                        <td style={tdStyle}>{row.points}</td>
                        <td style={tdStyle}>{row.played}</td>
                        <td style={tdStyle}>{row.win}</td>
                        <td style={tdStyle}>{row.loss}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function tabStyle(active: boolean) {
  return {
    border: active ? '1px solid #DC2626' : '1px solid #CBD5E1',
    background: active ? '#FEF2F2' : '#FFFFFF',
    color: active ? '#B91C1C' : '#0F172A',
    borderRadius: '8px',
    fontWeight: 700,
    padding: '0.5rem 0.8rem',
    cursor: 'pointer',
  } as const
}

const thStyle = {
  textAlign: 'left' as const,
  padding: '0.7rem',
  color: '#64748B',
  fontSize: '0.82rem',
}

const tdStyle = {
  padding: '0.7rem',
  color: '#334155',
  fontSize: '0.9rem',
}
