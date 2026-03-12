import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  createColumnHelper,
  getPaginationRowModel
} from '@tanstack/react-table'
import { 
  Search, Plus, 
  Edit, Trash2, CheckCircle, Clock
} from 'lucide-react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

interface News {
  id: string
  title: string
  category: string
  status: string
  author: string
  publishedAt: string | null
  createdAt: string
}

const columnHelper = createColumnHelper<News>()

export default function AdminNewsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    try {
      const res = await api.get('/news/admin')
      setData(res.data.data)
    } catch (error) {
      console.error('Failed to fetch news:', error)
      toast.error('Gagal memuat daftar berita')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) return
    try {
      await api.delete(`/news/${id}`)
      toast.success('Berita berhasil dihapus')
      fetchData()
    } catch (error) {
      toast.error('Gagal menghapus berita')
    }
  }

  const filteredData = useMemo(() => {
    return data.filter(news => 
      news.title.toLowerCase().includes(search.toLowerCase())
    )
  }, [data, search])

  const columns = [
    columnHelper.accessor('title', {
      header: 'Judul Berita',
      cell: info => <span style={{ fontWeight: 600, color: '#1E293B' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('category', {
      header: 'Kategori',
      cell: info => <span style={{ fontSize: '0.875rem' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue()
        const isPublished = status === 'PUBLISHED'
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', 
            color: isPublished ? '#10B981' : '#64748B', fontWeight: 600, fontSize: '0.875rem' 
          }}>
            {isPublished ? <CheckCircle size={14} /> : <Clock size={14} />}
            {isPublished ? 'Diterbitkan' : 'Draft'}
          </div>
        )
      },
    }),
    columnHelper.accessor('createdAt', {
      header: 'Tanggal Dibuat',
      cell: info => new Date(info.getValue()).toLocaleDateString('id-ID'),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Aksi',
      cell: info => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate(`/admin/news/edit/${info.row.original.id}`)}
            style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#3B82F6', cursor: 'pointer' }}
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => handleDelete(info.row.original.id)}
            style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
          >
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

  if (loading) return <div>Memuat data berita...</div>

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Manajemen Berita</h1>
        <button 
          onClick={() => navigate('/admin/news/new')}
          className="btn-primary" 
          style={{ background: '#C8102E', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}
        >
          <Plus size={20} />
          Buat Artikel
        </button>
      </div>

      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Cari judul berita..."
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
