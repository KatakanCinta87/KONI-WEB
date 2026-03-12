import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarRange, MapPin, ChevronRight } from 'lucide-react'
import { publicApi, type Event } from '../services/public-api'

const statusLabel: Record<string, string> = {
  UPCOMING: 'Mendatang',
  ONGOING: 'Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
}

export default function EventListPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await publicApi.getEvents()
        if (!res.success) {
          setError('Gagal memuat data event.')
          return
        }
        const payload = Array.isArray(res.data) ? res.data : (res.data?.events || [])
        setEvents(payload)
      } catch {
        setError('Gagal memuat data event.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const grouped = useMemo(() => ({
    ONGOING: events.filter((item) => item.status === 'ONGOING'),
    UPCOMING: events.filter((item) => item.status === 'UPCOMING'),
    COMPLETED: events.filter((item) => item.status === 'COMPLETED'),
  }), [events])

  return (
    <section className="section" style={{ background: '#F8FAFC', minHeight: '70vh' }}>
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ margin: 0, color: '#0F172A', fontSize: 'clamp(1.7rem, 3.5vw, 2.2rem)' }}>Event Resmi KONI</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#64748B' }}>
            Daftar event resmi yang sedang berlangsung, mendatang, dan riwayat event.
          </p>
        </div>

        {loading && <p style={{ color: '#64748B' }}>Memuat event...</p>}
        {error && <p style={{ color: '#B91C1C' }}>{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p style={{ color: '#64748B' }}>Belum ada event resmi yang ditampilkan.</p>
        )}

        {!loading && !error && events.length > 0 && (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {(['ONGOING', 'UPCOMING', 'COMPLETED'] as const).map((groupKey) => (
              <div key={groupKey}>
                <h2 style={{ margin: '0 0 0.75rem', color: '#0F172A', fontSize: '1.1rem' }}>
                  {statusLabel[groupKey]}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {grouped[groupKey].map((event) => (
                    <Link
                      key={event.id}
                      to={`/event/${event.id}`}
                      style={{
                        textDecoration: 'none',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '1rem',
                        color: '#0F172A',
                        display: 'block',
                      }}
                    >
                      <div style={{ display: 'inline-flex', padding: '0.2rem 0.55rem', borderRadius: '999px', background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {event.type}
                      </div>
                      <h3 style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>{event.name}</h3>
                      <p style={{ margin: '0 0 0.5rem', color: '#64748B', fontSize: '0.86rem' }}>
                        <CalendarRange size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.3rem' }} />
                        {new Date(event.startDate).toLocaleDateString('id-ID')} - {new Date(event.endDate).toLocaleDateString('id-ID')}
                      </p>
                      <p style={{ margin: 0, color: '#64748B', fontSize: '0.86rem' }}>
                        <MapPin size={14} style={{ verticalAlign: 'text-bottom', marginRight: '0.3rem' }} />
                        {event.venue}
                      </p>
                      <div style={{ marginTop: '0.8rem', color: '#DC2626', fontWeight: 600, fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        Lihat Detail <ChevronRight size={14} />
                      </div>
                    </Link>
                  ))}
                </div>
                {grouped[groupKey].length === 0 && (
                  <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.88rem' }}>Tidak ada event pada kategori ini.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
