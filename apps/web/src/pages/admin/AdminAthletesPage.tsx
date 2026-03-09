import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table'
import {
  Search, ChevronLeft, ChevronRight,
  Edit, Trash2, UserPlus, Download
} from 'lucide-react'
import api from '../../lib/axios'
import { motion, AnimatePresence } from 'framer-motion'
import * as XLSX from 'xlsx'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

interface Athlete {
  id: string
  fullName: string
  nik: string
  gender: string
  status: string
  cabor: { name: string }
  caborId: string
  user?: { email: string, isActive: boolean }
}

const columnHelper = createColumnHelper<Athlete>()

export default function AdminAthletesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [caborFilter, setCaborFilter] = useState('ALL')
  const [cabors, setCabors] = useState<any[]>([])

  const canDelete = user?.role === 'SUPER_ADMIN'

  const fetchData = async () => {
    try {
      const [athleteRes, caborRes] = await Promise.all([
        api.get('/athletes'),
        api.get('/cabor')
      ])
      setData(athleteRes.data.data)
      setCabors(caborRes.data.data)
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error('Gagal memuat data atlet')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (athlete: Athlete) => {
    if (!canDelete) {
      toast.error('Hanya super admin yang dapat menghapus atlet')
      return
    }

    const confirmed = window.confirm(`Nonaktifkan atlet ${athlete.fullName}?`)
    if (!confirmed) return

    try {
      await api.delete(`/athletes/${athlete.id}`)
      toast.success('Atlet berhasil dinonaktifkan')
      setData((current) => current.filter((item) => item.id !== athlete.id))
    } catch (error) {
      console.error('Failed to delete athlete:', error)
      toast.error('Gagal menghapus atlet')
    }
  }

  const filteredData = useMemo(() => {
    return data.filter(athlete => {
      const matchesSearch = athlete.fullName.toLowerCase().includes(search.toLowerCase()) ||
                           athlete.nik.includes(search)
      const matchesStatus = statusFilter === 'ALL' || athlete.status === statusFilter
      const matchesCabor = caborFilter === 'ALL' || athlete.caborId === caborFilter
      return matchesSearch && matchesStatus && matchesCabor
    })
  }, [data, search, statusFilter, caborFilter])

  const exportToExcel = () => {
    const exportData = filteredData.map(a => ({
      'Nama Lengkap': a.fullName,
      'NIK': a.nik,
      'Cabang Olahraga': a.cabor.name,
      'Gender': a.gender === 'MALE' ? 'Laki-laki' : 'Perempuan',
      'Status': a.status
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar Atlet')
    XLSX.writeFile(wb, `Data_Atlet_KONI_${new Date().getFullYear()}.xlsx`)
    toast.success('File Excel berhasil diunduh')
  }

  const columns = [
    columnHelper.accessor('fullName', {
      header: 'Nama Lengkap',
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
    columnHelper.accessor('gender', {
      header: 'L/P',
      cell: info => info.getValue() === 'MALE' ? 'L' : 'P',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue()
        const colors: any = {
          ACTIVE: { bg: '#DCFCE7', text: '#166534' },
          INACTIVE: { bg: '#F1F5F9', text: '#475569' },
          INJURED: { bg: '#FEF2F2', text: '#991B1B' },
        }
        const style = colors[status] || colors.INACTIVE
        return (
          <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 600,
            background: style.bg,
            color: style.text
          }}>
            {status}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Aksi',
      cell: info => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate(`/admin/athletes/edit/${info.row.original.id}`)}
            style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#3B82F6', cursor: 'pointer' }}
            title="Edit"
          >
            <Edit size={18} />
          </button>
          {canDelete && (
            <button
              onClick={() => handleDelete(info.row.original)}
              style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
              title="Nonaktifkan"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (loading) return <div>Memuat data atlet...</div>

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Database Atlet</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={exportToExcel}
            style={{ background: 'white', color: '#475569', border: '1px solid #E2E8F0', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <Download size={20} />
            Ekspor Excel
          </button>
          <button
            onClick={() => navigate('/admin/athletes/new')}
            className="btn-primary"
            style={{ background: '#C8102E', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <UserPlus size={20} />
            Tambah Atlet
          </button>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Cari nama atau NIK..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1.5px solid #F1F5F9', borderRadius: '10px', outline: 'none', fontSize: '0.95rem' }}
          />
        </div>

        <select
          value={caborFilter}
          onChange={e => setCaborFilter(e.target.value)}
          style={{ padding: '0.75rem 1rem', border: '1.5px solid #F1F5F9', borderRadius: '10px', outline: 'none', background: 'white', fontSize: '0.95rem', minWidth: '160px' }}
        >
          <option value="ALL">Semua Cabor</option>
          {cabors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.75rem 1rem', border: '1.5px solid #F1F5F9', borderRadius: '10px', outline: 'none', background: 'white', fontSize: '0.95rem', minWidth: '140px' }}
        >
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Nonaktif</option>
          <option value="INJURED">Cedera</option>
        </select>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              <AnimatePresence>
                {table.getRowModel().rows.map(row => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ borderBottom: '1px solid #F1F5F9' }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} style={{ padding: '1rem 1.5rem', fontSize: '0.95rem', color: '#334155' }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
            Menampilkan <strong>{filteredData.length}</strong> atlet
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', cursor: table.getCanPreviousPage() ? 'pointer' : 'not-allowed', color: '#64748B' }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white', cursor: table.getCanNextPage() ? 'pointer' : 'not-allowed', color: '#64748B' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
