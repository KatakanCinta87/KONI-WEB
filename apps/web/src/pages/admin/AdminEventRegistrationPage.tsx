import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { handleApiError } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

interface Athlete {
  id: string
  fullName: string
  nik: string
  gender: string
}

interface Registration {
  id: string
  athlete: Athlete
  cabor: {
    id: string
    name: string
  }
  matchNumber?: string
  notes?: string
  createdAt: string
}

interface Event {
  id: string
  name: string
  registDeadline?: string
}

export default function AdminEventRegistrationPage() {
  const { id: eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [availableAthletes, setAvailableAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const [formData, setFormData] = useState({
    athleteId: '',
    matchNumber: '',
    notes: ''
  })

  const fetchData = async () => {
    try {
      const [eventRes, regsRes, athletesRes] = await Promise.all([
        api.get(`/admin/events/${eventId}`),
        api.get(`/admin/events/${eventId}/registrations`),
        api.get('/admin/athletes') // Ideally this should be filtered by cabor for CABOR_ADMIN
      ])
      
      setEvent(eventRes.data.data)
      setRegistrations(regsRes.data.data)
      
      // Filter athletes by cabor if user is CABOR_ADMIN
      let filteredAthletes = athletesRes.data.data
      if (user?.role === 'CABOR_ADMIN') {
        // We need to know which cabor the user belongs to. 
        // For now, let's assume the backend already filters or we filter here if we have caborId in user.
        // Looking at the dashboard-stats logic, we might need a separate endpoint or check user profile.
      }
      
      // Filter out already registered athletes
      const registeredIds = new Set(regsRes.data.data.map((r: Registration) => r.athlete.id))
      setAvailableAthletes(filteredAthletes.filter((a: Athlete) => !registeredIds.has(a.id)))
      
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [eventId])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.athleteId) {
      toast.error('Pilih atlet terlebih dahulu')
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/admin/events/${eventId}/register`, formData)
      toast.success('Atlet berhasil didaftarkan')
      setShowForm(false)
      setFormData({ athleteId: '', matchNumber: '', notes: '' })
      fetchData()
    } catch (error) {
      handleApiError(error)
    } finally {
      setSubmitting(true)
      setSubmitting(false)
    }
  }

  const handleDelete = async (registrationId: string) => {
    if (!window.confirm('Hapus pendaftaran ini?')) return
    try {
      await api.delete(`/admin/events/registrations/${registrationId}`)
      toast.success('Pendaftaran berhasil dihapus')
      fetchData()
    } catch (error) {
      handleApiError(error)
    }
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data...</div>
  if (!event) return <div style={{ padding: '2rem', textAlign: 'center' }}>Event tidak ditemukan</div>

  const isPastDeadline = event.registDeadline && new Date() > new Date(event.registDeadline)

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => navigate('/admin/events')}
          style={{ padding: '0.5rem', border: '1px solid #E2E8F0', borderRadius: '8px', background: 'white', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Pendaftaran Atlet</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748B' }}>{event.name}</p>
        </div>
      </div>

      {isPastDeadline && (
        <div style={{ padding: '1rem', background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '12px', color: '#991B1B', fontWeight: 600 }}>
          Batas waktu pendaftaran telah berakhir ({new Date(event.registDeadline!).toLocaleString('id-ID')}).
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Daftar Peserta ({registrations.length})</h2>
        {!isPastDeadline && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{ 
              background: showForm ? '#64748B' : '#C8102E', 
              color: 'white', 
              border: 'none', 
              padding: '0.6rem 1rem', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontWeight: 600, 
              cursor: 'pointer' 
            }}
          >
            {showForm ? 'Batal' : (
              <>
                <UserPlus size={18} />
                Daftarkan Atlet
              </>
            )}
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'grid', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Formulir Pendaftaran</h3>
          <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Pilih Atlet</label>
              <select
                required
                value={formData.athleteId}
                onChange={(e) => setFormData({ ...formData, athleteId: e.target.value })}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
              >
                <option value="">-- Pilih Atlet --</option>
                {availableAthletes.map(a => (
                  <option key={a.id} value={a.id}>{a.fullName} ({a.nik})</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Nomor/Kategori (Opsional)</label>
              <input
                placeholder="Misal: 100m Putra"
                value={formData.matchNumber}
                onChange={(e) => setFormData({ ...formData, matchNumber: e.target.value })}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'grid', gap: '0.4rem', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Catatan (Opsional)</label>
              <textarea
                placeholder="Catatan tambahan..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                style={{ padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none', minHeight: '80px' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{ background: '#C8102E', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Memproses...' : 'Simpan Pendaftaran'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>Nama Atlet</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>Cabor</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>Nomor/Kategori</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>Tgl Daftar</th>
              <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Belum ada atlet terdaftar.</td>
              </tr>
            ) : (
              registrations.map(reg => (
                <tr key={reg.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{reg.athlete.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{reg.athlete.nik}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>{reg.cabor.name}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{reg.matchNumber || '-'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{new Date(reg.createdAt).toLocaleDateString('id-ID')}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <button
                      onClick={() => handleDelete(reg.id)}
                      style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
                      title="Hapus pendaftaran"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
