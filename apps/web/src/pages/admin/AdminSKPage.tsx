import { useState, useEffect } from 'react'
import { 
  Plus, Calendar, AlertCircle, 
  CheckCircle2, Clock, Download
} from 'lucide-react'
import api from '../../lib/axios'
import { useAuth } from '../../context/AuthContext'

interface SKDocument {
  id: string
  skNumber: string
  issuedAt: string
  validFrom: string
  validUntil: string
  status: string
  fileUrl: string | null
  cabor: { name: string }
}

export default function AdminSKPage() {
  const { user } = useAuth()
  const [sks, setSks] = useState<SKDocument[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [caborRes] = await Promise.all([
          api.get('/cabor')
        ])
        
        // If cabor admin, fetch their SKs
        if (user?.role === 'CABOR_ADMIN') {
          const myCabor = caborRes.data.data.find((c: any) => c.adminId === user.id)
          if (myCabor) {
            const skRes = await api.get(`/cabor/${myCabor.id}/sk`)
            setSks(skRes.data.data)
          }
        } else {
          // Super admin: show all latest SKs from cabor list
          const allSks = caborRes.data.data.flatMap((c: any) => c.skDocuments.map((s: any) => ({ ...s, cabor: { name: c.name } })))
          setSks(allSks)
        }
      } catch (error) {
        console.error('Failed to fetch SK data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (loading) return <div>Memuat data E-SK...</div>

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Monitoring E-SK</h1>
          <p style={{ color: '#64748B', marginTop: '0.25rem' }}>Manajemen Surat Keputusan kepengurusan Cabang Olahraga.</p>
        </div>
        {user?.role === 'SUPER_ADMIN' && (
          <button style={{ background: '#0F172A', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={20} />
            Tambah SK Baru
          </button>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>SK Aktif</p>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{sks.filter(s => s.status === 'ACTIVE').length}</h4>
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Segera Habis</p>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{sks.filter(s => s.status === 'EXPIRING_SOON').length}</h4>
          </div>
        </div>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', margin: 0 }}>Kedaluwarsa</p>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{sks.filter(s => s.status === 'EXPIRED').length}</h4>
          </div>
        </div>
      </div>

      {/* SK List */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Daftar Dokumen SK</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>Cabor</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>Nomor SK</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>Masa Berlaku</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>File</th>
              </tr>
            </thead>
            <tbody>
              {sks.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>Belum ada data SK</td></tr>
              ) : (
                sks.map(sk => (
                  <tr key={sk.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{sk.cabor.name}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem' }}>{sk.skNumber}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                        <Calendar size={14} />
                        {new Date(sk.validUntil).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <SKStatusBadge status={sk.status} />
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      {sk.fileUrl ? (
                        <a href={sk.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                          <Download size={16} /> Unduh
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SKStatusBadge({ status }: { status: string }) {
  const configs: any = {
    ACTIVE: { label: 'Aktif', color: '#10B981', bg: '#DCFCE7' },
    EXPIRING_SOON: { label: 'Akan Habis', color: '#F59E0B', bg: '#FEF3C7' },
    EXPIRED: { label: 'Habis', color: '#EF4444', bg: '#FEE2E2' },
  }
  const config = configs[status] || configs.EXPIRED
  return (
    <span style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: config.color, background: config.bg }}>
      {config.label}
    </span>
  )
}
