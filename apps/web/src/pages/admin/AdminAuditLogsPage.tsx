import { useState, useEffect } from 'react'
import { 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table'
import { 
  Activity, Filter
} from 'lucide-react'
import api from '../../lib/axios'

interface AuditLog {
  id: string
  action: string
  resource: string
  resourceId: string | null
  ipAddress: string | null
  createdAt: string
  user: {
    fullName: string
    email: string
  } | null
}

const columnHelper = createColumnHelper<AuditLog>()

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [resourceFilter, setResourceFilter] = useState('')

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/audit-logs', {
        params: { resource: resourceFilter || undefined }
      })
      setData(res.data.data)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [resourceFilter])

  const columns = [
    columnHelper.accessor('createdAt', {
      header: 'Waktu',
      cell: info => (
        <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
          {new Date(info.getValue()).toLocaleString('id-ID')}
        </div>
      ),
    }),
    columnHelper.accessor('user.fullName', {
      header: 'User',
      cell: info => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: '#1E293B' }}>{info.getValue() || 'System'}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{info.row.original.user?.email}</span>
        </div>
      ),
    }),
    columnHelper.accessor('action', {
      header: 'Aksi',
      cell: info => (
        <span style={{ 
          padding: '0.2rem 0.5rem', 
          borderRadius: '4px', 
          background: '#F1F5F9', 
          fontSize: '0.75rem', 
          fontWeight: 700,
          color: '#475569'
        }}>
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('resource', {
      header: 'Resource',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textTransform: 'capitalize' }}>
          <Activity size={14} color="#94A3B8" />
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('ipAddress', {
      header: 'IP Address',
      cell: info => info.getValue() || '-',
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Log Aktivitas Sistem</h1>
      </div>

      {/* Filter Toolbar */}
      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={18} color="#94A3B8" />
          <select 
            value={resourceFilter}
            onChange={e => setResourceFilter(e.target.value)}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #F1F5F9', outline: 'none', background: 'white' }}
          >
            <option value="">Semua Resource</option>
            <option value="athlete">Atlet</option>
            <option value="coach">Pelatih</option>
            <option value="news">Berita</option>
            <option value="user">User</option>
            <option value="cabor">Cabor</option>
          </select>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Memuat data log...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Tidak ada log ditemukan</td></tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ padding: '1rem 1.5rem', fontSize: '0.95rem' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
