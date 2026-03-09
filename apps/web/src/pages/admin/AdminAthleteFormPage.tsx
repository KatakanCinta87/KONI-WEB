import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Save, ArrowLeft, Loader2
} from 'lucide-react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import { handleApiError } from '../../lib/utils'

const athleteSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit'),
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  birthPlace: z.string().min(2, 'Tempat lahir minimal 2 karakter'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  gender: z.enum(['MALE', 'FEMALE']),
  religion: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Format email tidak valid').optional().nullable().or(z.literal('')),
  weight: z.coerce.number().positive().optional().nullable(),
  height: z.coerce.number().positive().optional().nullable(),
  status: z.string(),
  caborId: z.string().min(1, 'Cabang olahraga harus dipilih'),
})

type AthleteFormData = z.infer<typeof athleteSchema>

export default function AdminAthleteFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!id)
  const [cabors, setCabors] = useState<any[]>([])

  const { register, handleSubmit, reset, setError, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(athleteSchema) as any,
    defaultValues: {
      gender: 'MALE',
      status: 'ACTIVE',
    }
  })

  const weight = watch('weight')
  const height = watch('height')
  const bmi = weight && height ? (Number(weight) / ((Number(height) / 100) ** 2)).toFixed(1) : null

  useEffect(() => {
    const loadData = async () => {
      try {
        const caborRes = await api.get('/cabor')
        setCabors(caborRes.data.data)

        if (id) {
          const athleteRes = await api.get(`/athletes/${id}`)
          const athlete = athleteRes.data.data
          // Format date for input
          if (athlete.birthDate) {
            athlete.birthDate = new Date(athlete.birthDate).toISOString().split('T')[0]
          }
          reset(athlete)
        }
      } catch (error) {
        handleApiError(error)
      } finally {
        setFetching(false)
      }
    }
    loadData()
  }, [id, reset])

  const onSubmit: SubmitHandler<AthleteFormData> = async (data) => {
    setLoading(true)
    
    // Clean up data: ensure no nested objects like 'cabor' or 'user' are sent
    const payload: any = {}
    Object.keys(data).forEach(key => {
      const val = (data as any)[key]
      if (typeof val !== 'object' || val === null || val instanceof Date) {
        payload[key] = val
      }
    })

    try {
      if (id) {
        await api.patch(`/athletes/${id}`, payload)
        toast.success('Data atlet berhasil diperbarui')
      } else {
        await api.post('/athletes', payload)
        toast.success('Atlet baru berhasil ditambahkan')
      }
      navigate('/admin/athletes')
    } catch (error: any) {
      handleApiError(error, setError)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div>Memuat data...</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/admin/athletes')}
          style={{ background: 'white', border: '1px solid #E2E8F0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          {id ? 'Edit Data Atlet' : 'Tambah Atlet Baru'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Basic Info Card */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'grid', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0, paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>Informasi Pribadi</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>NIK (16 Digit)</label>
              <input {...register('nik')} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: errors.nik ? '1.5px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} />
              {errors.nik && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{(errors.nik as any).message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Nama Lengkap</label>
              <input {...register('fullName')} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: errors.fullName ? '1.5px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} />
              {errors.fullName && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{(errors.fullName as any).message}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Tempat Lahir</label>
              <input {...register('birthPlace')} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: errors.birthPlace ? '1.5px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} />
              {errors.birthPlace && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{(errors.birthPlace as any).message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Tanggal Lahir</label>
              <input type="date" {...register('birthDate')} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: errors.birthDate ? '1.5px solid #EF4444' : '1px solid #E2E8F0', outline: 'none' }} />
              {errors.birthDate && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{(errors.birthDate as any).message}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Jenis Kelamin</label>
              <select {...register('gender')} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white' }}>
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Cabang Olahraga</label>
              <select {...register('caborId')} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: errors.caborId ? '1.5px solid #EF4444' : '1px solid #E2E8F0', background: 'white' }}>
                <option value="">Pilih Cabor</option>
                {cabors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.caborId && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{(errors.caborId as any).message}</p>}
            </div>
          </div>
        </div>

        {/* Physical Info Card */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'grid', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0, paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>Data Fisik & Kontak</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Berat (kg)</label>
              <input type="number" {...register('weight')} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Tinggi (cm)</label>
              <input type="number" {...register('height')} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>BMI (Auto)</label>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontWeight: 700, color: '#1E293B' }}>
                {bmi || '-'}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Alamat Domisili</label>
            <textarea {...register('address')} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: errors.address ? '1.5px solid #EF4444' : '1px solid #E2E8F0', outline: 'none', resize: 'vertical' }} />
            {errors.address && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{(errors.address as any).message}</p>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={() => navigate('/admin/athletes')}
            style={{ padding: '0.75rem 1.5rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontWeight: 600, cursor: 'pointer' }}
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '0.75rem 2rem', borderRadius: '10px', border: 'none', 
              background: '#0F172A', color: 'white', fontWeight: 700, 
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Simpan Data
          </button>
        </div>
      </form>
    </div>
  )
}
