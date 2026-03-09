import { useState, useEffect } from 'react'
import { 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table'
import { 
  Plus, Edit, Trash2
} from 'lucide-react'
import api from '../../lib/axios'
import { useAuth } from '../../context/AuthContext'

interface Cabor {
  id: string
  name: string
  fullName: string
  category: string
  chairmanName: string | null
  email: string | null
  _count: {
    athletes: number
    coaches: number
  }
}

const columnHelper = createColumnHelper<Cabor>()

export default function AdminCaborsPage() {
  const { user } = useAuth()
  const [data, setData] = useState<Cabor[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await api.get('/cabor')
      setData(res.data.data)
    } catch (error) {
      console.error('Failed to fetch cabors:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const columns = [
    columnHelper.accessor('name', {
      header: 'Cabor',
      cell: info => <span style={{ fontWeight: 700, color: '#0F172A' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('fullName', {
      header: 'Nama Lengkap',
      cell: info => <span style={{ fontSize: '0.875rem' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('chairmanName', {
      header: 'Ketua',
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('_count.athletes', {
      header: 'Atlet',
      cell: info => <span style={{ fontWeight: 600 }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('_count.coaches', {
      header: 'Pelatih',
      cell: info => <span style={{ fontWeight: 600 }}>{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Aksi',
      cell: () => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#3B82F6', cursor: 'pointer' }} title="Edit">
            <Edit size={18} />
          </button>
          {user?.role === 'SUPER_ADMIN' && (
            <button style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }} title="Hapus">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (loading) return <div>Memuat data cabor...</div>

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Pengelolaan Cabor</h1>
        {user?.role === 'SUPER_ADMIN' && (
          <button className="btn-primary" style={{ background: '#C8102E', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={20} />
            Tambah Cabor
          </button>
        )}
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
