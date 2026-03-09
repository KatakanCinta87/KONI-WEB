import { useState, useEffect } from 'react'
import { Save, Loader2, Bell, Globe } from 'lucide-react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings')
        setSettings(res.data.data)
      } catch (error) {
        toast.error('Gagal memuat pengaturan')
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.patch('/admin/settings', settings)
      toast.success('Pengaturan berhasil disimpan')
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }))
  }

  if (loading) return <div>Memuat pengaturan...</div>

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Pengaturan Sistem</h1>
        <p style={{ color: '#64748B', marginTop: '0.5rem' }}>Konfigurasi identitas organisasi dan parameter sistem.</p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Identitas Card */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
            <Globe size={20} color="#C8102E" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Identitas Organisasi</h3>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Nama Organisasi</label>
              <input 
                value={settings.org_name || ''} 
                onChange={e => handleChange('org_name', e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Tagline</label>
              <input 
                value={settings.org_tagline || ''} 
                onChange={e => handleChange('org_tagline', e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Email Resmi</label>
              <input 
                type="email"
                value={settings.org_email || ''} 
                onChange={e => handleChange('org_email', e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} 
              />
            </div>
          </div>
        </div>

        {/* Notifikasi Card */}
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
            <Bell size={20} color="#C8102E" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Pengingat & Notifikasi</h3>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Notifikasi Masa Aktif SK (Hari sebelum habis)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="number"
                value={settings.notif_sk_days_before || ''} 
                onChange={e => handleChange('notif_sk_days_before', e.target.value)}
                style={{ width: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', outline: 'none' }} 
              />
              <span style={{ color: '#64748B', fontSize: '0.875rem' }}>hari</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            disabled={saving}
            style={{ 
              padding: '0.75rem 2.5rem', borderRadius: '10px', border: 'none', 
              background: '#0F172A', color: 'white', fontWeight: 700, 
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}
