import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  flexRender, 
  getCoreRowModel, 
  getPaginationRowModel,
  useReactTable,
  createColumnHelper,
} from '@tanstack/react-table'
import { 
  Search, 
  Edit, Trash2, UserPlus
} from 'lucide-react'
import api from '../../lib/axios'
import { handleApiError } from '../../lib/utils'

interface Coach {
  id: string
  fullName: string
  nik: string
  licenseNumber: string | null
  licenseLevel: string | null
  cabor: { name: string }
  caborId: string
  isActive: boolean
}

const columnHelper = createColumnHelper<Coach>()

export default function AdminCoachesPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    try {
      const [coachRes] = await Promise.all([
        api.get('/coaches'),
        api.get('/cabor')
      ])
      setData(coachRes.data.data)
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return data.filter(coach => 
      coach.fullName.toLowerCase().includes(search.toLowerCase()) || 
      coach.nik.includes(search)
    )
  }, [data, search])

  const columns = [
    columnHelper.accessor('fullName', {
      header: 'Nama Pelatih',
      cell: info => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '50%', 
            background: '#F1F5F9', color: '#64748B', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700
          }}>
            {info.getValue().charAt(0)}
          </div>
          <span style={{ fontWeight: 600, color: '#1E293B' }}>{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('cabor.name', {
      header: 'Cabang Olahraga',
      cell: info => <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#F1F5F9', fontSize: '0.75rem', fontWeight: 600 }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('licenseLevel', {
      header: 'Lisensi',
      cell: info => info.getValue() || '-',
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: info => (
        <span style={{ 
          padding: '0.25rem 0.75rem', 
          borderRadius: '9999px', 
          fontSize: '0.75rem', 
          fontWeight: 600,
          background: info.getValue() ? '#DCFCE7' : '#FEE2E2',
          color: info.getValue() ? '#166534' : '#991B1B'
        }}>
          {info.getValue() ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Aksi',
      cell: info => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate(`/admin/coaches/edit/${info.row.original.id}`)}
            style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#3B82F6', cursor: 'pointer' }} 
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }} title="Hapus">
            <Trash2 size={18} />
          </button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (loading) return <div>Memuat data pelatih...</div>

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Database Pelatih</h1>
        <button 
          onClick={() => navigate('/admin/coaches/new')}
          className="btn-primary" 
          style={{ background: '#C8102E', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
        >
          <UserPlus size={20} />
          Tambah Pelatih
        </button>
      </div>

      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Cari nama atau NIK..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #F1F5F9', borderRadius: '10px', outline: 'none' }}
          />
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
