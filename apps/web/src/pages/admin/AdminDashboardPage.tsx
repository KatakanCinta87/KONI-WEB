import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, UserRound, Newspaper, Activity
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts'
import api from '../../lib/axios'

interface DashboardStats {
  athletes: number
  coaches: number
  news: {
    total: number
    published: number
    draft: number
    archived?: number
  }
  athleteStatus: {
    active: number
    inactive: number
    injured: number
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats')
        setStats(res.data.data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div>Memuat data...</div>

  const statCards = [
    { label: 'Total Atlet', value: stats?.athletes || 0, icon: Users, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
    { label: 'Total Pelatih', value: stats?.coaches || 0, icon: UserRound, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Total Berita', value: stats?.news.total || 0, icon: Newspaper, color: '#C8102E', bgColor: 'rgba(200, 16, 46, 0.1)' },
    { label: 'Atlet Aktif', value: stats?.athleteStatus.active || 0, icon: Activity, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
  ]

  const newsData = [
    { name: 'Diterbitkan', value: stats?.news.published || 0, color: '#10B981' },
    { name: 'Draft', value: stats?.news.draft || 0, color: '#F59E0B' },
    { name: 'Arsip', value: stats?.news.archived || 0, color: '#64748B' },
  ].filter((item) => item.value > 0)

  const resourceData = [
    { name: 'Atlet', value: stats?.athletes || 0, color: '#3B82F6' },
    { name: 'Pelatih', value: stats?.coaches || 0, color: '#10B981' },
    { name: 'Berita', value: stats?.news.total || 0, color: '#C8102E' },
  ]

  const athleteStatusData = [
    { name: 'Aktif', value: stats?.athleteStatus.active || 0, color: '#10B981' },
    { name: 'Nonaktif', value: stats?.athleteStatus.inactive || 0, color: '#94A3B8' },
    { name: 'Cedera', value: stats?.athleteStatus.injured || 0, color: '#F97316' },
  ]

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: stat.bgColor,
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <stat.icon size={28} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500, marginBottom: '0.25rem' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.5rem' }}>Ringkasan Resource</h4>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resourceData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={48}>
                  {resourceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.5rem' }}>Status Berita</h4>
          <div style={{ height: '200px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={newsData.length > 0 ? newsData : [{ name: 'Kosong', value: 1, color: '#E2E8F0' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(newsData.length > 0 ? newsData : [{ name: 'Kosong', value: 1, color: '#E2E8F0' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {(newsData.length > 0 ? newsData : [{ name: 'Kosong', value: 0, color: '#E2E8F0' }]).map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                  <span style={{ fontSize: '0.875rem', color: '#64748B' }}>{item.name}</span>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E293B' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.5rem' }}>Status Atlet</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {athleteStatusData.map((item) => (
            <div key={item.name} style={{ padding: '1rem', borderRadius: '14px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '9999px', background: item.color }} />
                <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>{item.name}</span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
