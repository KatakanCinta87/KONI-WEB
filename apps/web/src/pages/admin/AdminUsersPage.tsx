import { useState, useEffect } from 'react'
import { 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table'
import { 
  UserPlus, Edit, Trash2, 
  CheckCircle, XCircle, User
} from 'lucide-react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

interface UserData {
  id: string
  email: string
  fullName: string
  role: string
  isActive: boolean
  lastLogin: string | null
}

const columnHelper = createColumnHelper<UserData>()

export default function AdminUsersPage() {
  const [data, setData] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/users')
      setData(res.data.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${id}`, { isActive: !currentStatus })
      toast.success('Status user diperbarui')
      fetchData()
    } catch (error) {
      toast.error('Gagal memperbarui status')
    }
  }

  const columns = [
    columnHelper.accessor('fullName', {
      header: 'Nama Pengguna',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '8px', 
            background: '#F1F5F9', color: '#64748B', 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <User size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#1E293B' }}>{info.getValue()}</span>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{info.row.original.email}</span>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: info => {
        const role = info.getValue()
        const colors: any = {
          SUPER_ADMIN: { bg: '#E0F2FE', text: '#0369A1' },
          CABOR_ADMIN: { bg: '#F0F9FF', text: '#075985' },
          COACH: { bg: '#F5F3FF', text: '#5B21B6' },
          ATHLETE: { bg: '#ECFDF5', text: '#065F46' },
        }
        const style = colors[role] || { bg: '#F1F5F9', text: '#475569' }
        return (
          <span style={{ 
            padding: '0.25rem 0.6rem', 
            borderRadius: '6px', 
            fontSize: '0.75rem', 
            fontWeight: 700,
            background: style.bg,
            color: style.text,
            textTransform: 'uppercase'
          }}>
            {role.replace('_', ' ')}
          </span>
        )
      },
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: info => {
        const active = info.getValue()
        return (
          <button 
            onClick={() => toggleStatus(info.row.original.id, active)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', 
              border: 'none', background: 'none', cursor: 'pointer',
              color: active ? '#10B981' : '#EF4444', fontWeight: 600, fontSize: '0.875rem' 
            }}
          >
            {active ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {active ? 'Aktif' : 'Nonaktif'}
          </button>
        )
      },
    }),
    columnHelper.accessor('lastLogin', {
      header: 'Login Terakhir',
      cell: info => info.getValue() ? new Date(info.getValue()!).toLocaleString('id-ID') : 'Belum pernah',
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Aksi',
      cell: () => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#3B82F6', cursor: 'pointer' }}>
            <Edit size={18} />
          </button>
          <button style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}>
            <Trash2 size={18} />
          </button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (loading) return <div>Memuat data user...</div>

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Manajemen User</h1>
        <button className="btn-primary" style={{ background: '#0F172A', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
          <UserPlus size={20} />
          Tambah User
        </button>
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
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={{ padding: '1rem 1.5rem', fontSize: '0.95rem' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
