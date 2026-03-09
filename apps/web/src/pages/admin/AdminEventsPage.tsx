import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { CalendarRange, Edit, Medal, Plus, Search, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { handleApiError } from '../../lib/utils'

interface AdminEvent {
  id: string
  name: string
  type: string
  venue: string
  status: string
  startDate: string
  endDate: string
}

const columnHelper = createColumnHelper<AdminEvent>()

function formatEventType(type: string) {
  return type.split('_').join(' ')
}

function formatEventStatus(status: string) {
  const map: Record<string, string> = {
    UPCOMING: 'Mendatang',
    ONGOING: 'Berlangsung',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  }
  return map[status] || status
}

function statusStyles(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    UPCOMING: { bg: '#DBEAFE', color: '#1D4ED8' },
    ONGOING: { bg: '#DCFCE7', color: '#166534' },
    COMPLETED: { bg: '#F1F5F9', color: '#334155' },
    CANCELLED: { bg: '#FEE2E2', color: '#B91C1C' },
  }
  return map[status] || { bg: '#F1F5F9', color: '#334155' }
}

export default function AdminEventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchEvents = async () => {
    try {
      const res = await api.get('/admin/events')
      setEvents(res.data.data || [])
    } catch (error) {
      handleApiError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus event ini beserta klasemen medalinya?')) return
    try {
      await api.delete(`/admin/events/${id}`)
      toast.success('Event berhasil dihapus')
      fetchEvents()
    } catch (error) {
      handleApiError(error)
    }
  }

  const filteredEvents = useMemo(() => {
    const keyword = search.toLowerCase()
    return events.filter((event) =>
      event.name.toLowerCase().includes(keyword) ||
      event.venue.toLowerCase().includes(keyword) ||
      event.type.toLowerCase().includes(keyword),
    )
  }, [events, search])

  const columns = [
    columnHelper.accessor('name', {
      header: 'Nama Event',
      cell: (info) => (
        <div>
          <div style={{ fontWeight: 700, color: '#0F172A' }}>{info.getValue()}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
            {new Date(info.row.original.startDate).toLocaleDateString('id-ID')} - {new Date(info.row.original.endDate).toLocaleDateString('id-ID')}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Tipe',
      cell: (info) => formatEventType(info.getValue()),
    }),
    columnHelper.accessor('venue', {
      header: 'Lokasi',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const style = statusStyles(info.getValue())
        return (
          <span style={{
            display: 'inline-flex',
            padding: '0.35rem 0.7rem',
            borderRadius: '999px',
            background: style.bg,
            color: style.color,
            fontSize: '0.8rem',
            fontWeight: 700,
          }}>
            {formatEventStatus(info.getValue())}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Aksi',
      cell: (info) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate(`/admin/events/edit/${info.row.original.id}`)}
            style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#2563EB', cursor: 'pointer' }}
            title="Edit event dan klasemen"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => navigate(`/admin/events/edit/${info.row.original.id}`)}
            style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#CA8A04', cursor: 'pointer' }}
            title="Kelola klasemen"
          >
            <Medal size={18} />
          </button>
          <button
            onClick={() => handleDelete(info.row.original.id)}
            style={{ padding: '0.4rem', border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer' }}
            title="Hapus"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: filteredEvents,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (loading) return <div>Memuat data event...</div>

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Manajemen Event & Medali</h1>
          <p style={{ margin: '0.35rem 0 0', color: '#64748B' }}>Kelola event resmi dan klasemen medali per event.</p>
        </div>
        <button
          onClick={() => navigate('/admin/events/new')}
          style={{ background: '#C8102E', color: 'white', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus size={18} />
          Event Baru
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <SummaryCard label="Total Event" value={events.length} color="#0F172A" icon={<CalendarRange size={18} />} />
        <SummaryCard label="Mendatang" value={events.filter((item) => item.status === 'UPCOMING').length} color="#2563EB" icon={<CalendarRange size={18} />} />
        <SummaryCard label="Berlangsung" value={events.filter((item) => item.status === 'ONGOING').length} color="#16A34A" icon={<CalendarRange size={18} />} />
      </div>

      <div style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <div style={{ position: 'relative', maxWidth: '420px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari event, lokasi, atau tipe..."
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', border: '1px solid #E2E8F0', borderRadius: '10px', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: '#64748B' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
                  Belum ada event yang cocok dengan pencarian.
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ padding: '1rem 1.5rem', fontSize: '0.95rem', verticalAlign: 'top' }}>
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

function SummaryCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', color }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        {icon}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A' }}>{value}</div>
    </div>
  )
}
