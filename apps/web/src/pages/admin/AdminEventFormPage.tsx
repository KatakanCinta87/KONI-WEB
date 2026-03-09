import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Medal, Plus, Save, Trash2 } from 'lucide-react'
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
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [savingStandings, setSavingStandings] = useState(false)
  const [cabors, setCabors] = useState<Cabor[]>([])
  const [standings, setStandings] = useState<StandingRow[]>([])

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

  useEffect(() => {
    const loadCabors = async () => {
      try {
        const res = await api.get('/cabor')
        setCabors(res.data.data || [])
      } catch (error) {
        handleApiError(error)
      }
    }

    loadCabors()
  }, [])

  useEffect(() => {
    if (!isEdit) return

    const loadEvent = async () => {
      try {
        const res = await api.get(`/admin/events/${id}`)
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
        })))
      } catch (error) {
        handleApiError(error)
      } finally {
        setFetching(false)
      }
    }

    loadEvent()
  }, [id, isEdit, reset])

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
    setStandings((prev) => [...prev, { caborId: '', gold: 0, silver: 0, bronze: 0, rank: prev.length + 1 }])
  }

  const updateStanding = (index: number, key: keyof StandingRow, value: string | number) => {
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
        })),
      })
      toast.success('Klasemen medali berhasil diperbarui')
    } catch (error) {
      handleApiError(error)
    } finally {
      setSavingStandings(false)
    }
  }

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

      {isEdit && (
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
                  <th style={tableHeadStyle}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {standings.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#64748B' }}>
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
