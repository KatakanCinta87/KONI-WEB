import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, Image as ImageIcon, Video, FolderPlus, 
  Trash2, X, Upload, Loader2, Link as LinkIcon
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import { handleApiError } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

// ── Interfaces ───────────────────────────────────────────────

interface Album {
  id: string
  name: string
  description: string | null
  coverUrl: string | null
  _count: { items: number }
}

interface GalleryItem {
  id: string
  title: string
  type: string
  url: string
  thumbnailUrl: string | null
  albumId: string | null
  uploadedAt: string
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1').replace(/\/api\/v1\/?$/, '')

function toEmbedUrl(url: string): string {
  if (!url) return ''
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (ytMatch?.[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch?.[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return url
}

function isDirectVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg)$/i.test(url || '')
}

function resolveMediaUrl(url?: string | null): string {
  if (!url) return ''
  if (/^https?:\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`
  }
  return `${API_BASE_URL}/${url}`
}

// ── Validation Schemas ───────────────────────────────────────

const uploadSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  type: z.enum(['PHOTO', 'VIDEO']),
  url: z.string().optional(),
  albumMode: z.enum(['NONE', 'EXISTING', 'NEW']),
  albumId: z.string().optional().nullable(),
  newAlbumName: z.string().optional(),
})

type UploadFormData = z.infer<typeof uploadSchema>

export default function AdminGalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'albums' | 'items'>('albums')
  
  // Modals State
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null)
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFilePreview, setSelectedFilePreview] = useState('')

  const mediaForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { 
      type: 'PHOTO', 
      albumMode: 'NONE',
      albumId: '' 
    }
  })

  const { watch, setValue, handleSubmit, reset, setError } = mediaForm
  const albumMode = watch('albumMode')
  const mediaType = watch('type')

  const fetchData = async () => {
    try {
      const [albumRes, itemRes] = await Promise.all([
        api.get('/gallery/albums'),
        api.get('/gallery')
      ])
      setAlbums(albumRes.data.data)
      setItems(itemRes.data.data)
      
      // Update selected album if it's open to refresh its content
      if (selectedAlbum) {
        const updated = (albumRes.data.data as Album[]).find(a => a.id === selectedAlbum.id)
        if (updated) setSelectedAlbum(updated)
      }
    } catch (error) {
      console.error('Failed to fetch gallery data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreview('')
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setSelectedFilePreview(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  // ── Computed ────────────────────────────────────────────────

  const albumItems = useMemo(() => {
    if (!selectedAlbum) return []
    return items.filter(item => item.albumId === selectedAlbum.id)
  }, [items, selectedAlbum])

  const MediaThumb = ({ item }: { item: GalleryItem }) => {
    const [broken, setBroken] = useState(false)
    const src = resolveMediaUrl(item.thumbnailUrl || item.url || '')

    if (!src || broken) {
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', color: '#94A3B8' }}>
          {item.type === 'VIDEO' ? <Video size={28} /> : <ImageIcon size={28} />}
        </div>
      )
    }

    return (
      <img
        src={src}
        alt={item.title}
        onError={() => setBroken(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    )
  }

  // ── Handlers ────────────────────────────────────────────────

  const handleOpenUpload = (mode: 'NONE' | 'EXISTING' | 'NEW', albumId?: string) => {
    reset({
      type: 'PHOTO',
      albumMode: mode,
      albumId: albumId || '',
      title: '',
      newAlbumName: ''
    })
    setSelectedFile(null)
    setSelectedFilePreview('')
    setUploadModalOpen(true)
  }

  const onUploadSubmit = async (data: UploadFormData) => {
    if (data.type === 'PHOTO' && !selectedFile) {
      toast.error('Silakan pilih file foto')
      return
    }

    setSubmitting(true)
    try {
      let finalAlbumId = data.albumId

      // 1. Create new album if needed
      if (data.albumMode === 'NEW' && data.newAlbumName) {
        const albumRes = await api.post('/gallery/albums', { name: data.newAlbumName })
        finalAlbumId = albumRes.data.data.id
      }

      // 2. Upload Media
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('type', data.type)
      if (data.albumMode !== 'NONE' && finalAlbumId) {
        formData.append('albumId', finalAlbumId)
      }
      if (data.url) formData.append('url', data.url)
      if (selectedFile) formData.append('file', selectedFile)

      await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Berhasil diunggah')
      setUploadModalOpen(false)
      setSelectedFile(null)
      setSelectedFilePreview('')
      fetchData()
    } catch (error) {
      handleApiError(error, setError)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Hapus media ini?')) return
    try {
      await api.delete(`/gallery/${id}`)
      toast.success('Media dihapus')
      fetchData()
    } catch (error) {
      handleApiError(error)
    }
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat galeri...</div>

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Media Galeri</h1>
          <p style={{ color: '#64748B', marginTop: '0.25rem' }}>Kelola koleksi foto dan video KONI.</p>
        </div>
        <button 
          onClick={() => handleOpenUpload('NONE')}
          style={{ background: '#0F172A', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
        >
          <Plus size={20} />
          Unggah Baru
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #E2E8F0' }}>
        {['albums', 'items'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{ 
              padding: '1rem 0.5rem', border: 'none', background: 'none', 
              fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
              color: activeTab === tab ? '#C8102E' : '#64748B',
              borderBottom: activeTab === tab ? '3px solid #C8102E' : '3px solid transparent',
              marginBottom: '-1px', transition: 'all 0.2s'
            }}
          >
            {tab === 'albums' ? `Daftar Album (${albums.length})` : `Semua Media (${items.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'albums' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {/* Quick Create Album Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            onClick={() => handleOpenUpload('NEW')}
            style={{ background: 'white', borderRadius: '20px', border: '2px dashed #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '240px', cursor: 'pointer', color: '#94A3B8' }}
          >
            <FolderPlus size={48} strokeWidth={1.5} />
            <p style={{ fontWeight: 600, marginTop: '1rem' }}>Buat Album Baru</p>
          </motion.div>

          {albums.map(album => (
            <motion.div 
              key={album.id} 
              whileHover={{ y: -4 }}
              onClick={() => setSelectedAlbum(album)}
              style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            >
              <div style={{ height: '180px', background: '#F1F5F9', position: 'relative' }}>
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' }}>
                    <ImageIcon size={64} />
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', padding: '0.4rem 0.8rem', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(4px)', color: 'white', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ImageIcon size={14} /> {album._count.items} Foto
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{album.name}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {album.description || 'Tidak ada deskripsi album.'}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} className="media-card" onClick={() => setPreviewItem(item)} style={{ cursor: 'pointer' }}>
              <MediaThumb item={item} />
              <div className="media-overlay">
                <p>{item.title}</p>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id) }}><Trash2 size={14} /></button>
              </div>
              {item.type === 'VIDEO' && <div className="video-badge"><Video size={12} /></div>}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal Detail Album ────────────────────────────────── */}
      <AnimatePresence>
        {selectedAlbum && (
          <div className="modal-overlay" onClick={() => setSelectedAlbum(null)}>
            <motion.div 
              initial={{ opacity: 0, x: 100 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 100 }} 
              className="album-side-panel"
              onClick={e => e.stopPropagation()}
            >
              <div className="panel-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{selectedAlbum.name}</h2>
                  <button onClick={() => setSelectedAlbum(null)} className="icon-btn"><X size={24} /></button>
                </div>
                <p style={{ color: '#64748B', marginTop: '0.5rem' }}>{selectedAlbum.description}</p>
                
                <button 
                  onClick={() => handleOpenUpload('EXISTING', selectedAlbum.id)}
                  style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', background: '#C8102E', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Plus size={18} /> Tambah Foto ke Album
                </button>
              </div>

              <div className="panel-body">
                <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: '#94A3B8', letterSpacing: '0.05em', marginBottom: '1rem' }}>Isi Album ({albumItems.length})</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {albumItems.map(item => (
                    <div key={item.id} className="media-card-sm" onClick={() => setPreviewItem(item)} style={{ cursor: 'pointer' }}>
                      <MediaThumb item={item} />
                      <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id) }}><Trash2 size={12} /></button>
                    </div>
                  ))}
                  {albumItems.length === 0 && (
                    <div style={{ gridColumn: 'span 2', padding: '3rem 1rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '16px', color: '#94A3B8' }}>
                      <ImageIcon size={32} style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ fontSize: '0.875rem', margin: 0 }}>Album masih kosong</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="modal-overlay" onClick={() => setPreviewItem(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-card"
              style={{ maxWidth: '900px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{previewItem.title}</h3>
                <button onClick={() => setPreviewItem(null)} className="icon-btn"><X size={20} /></button>
              </div>
              <div style={{ background: '#0B1220', padding: '1rem' }}>
                {previewItem.type === 'VIDEO' ? (
                  isDirectVideoFile(previewItem.url) ? (
                    <video controls style={{ width: '100%', maxHeight: '70vh', borderRadius: '12px', background: 'black' }}>
                      <source src={resolveMediaUrl(previewItem.url)} />
                    </video>
                  ) : (
                    <iframe
                      src={toEmbedUrl(previewItem.url)}
                      title={previewItem.title}
                      style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '12px', background: 'black' }}
                      allowFullScreen
                    />
                  )
                ) : (
                  <img src={resolveMediaUrl(previewItem.url)} alt={previewItem.title} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px' }} />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Modal Upload Media ────────────────────────────────── */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="modal-overlay" onClick={() => setUploadModalOpen(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="modal-card"
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>Unggah Media Baru</h3>
                <button onClick={() => setUploadModalOpen(false)} className="icon-btn"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit(onUploadSubmit)} style={{ padding: '1.5rem', display: 'grid', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Tipe Media</label>
                    <select {...mediaForm.register('type')} className="form-input">
                      <option value="PHOTO">Foto (File)</option>
                      <option value="VIDEO">Video (Link)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Tujuan Album</label>
                    <select 
                      className="form-input"
                      {...mediaForm.register('albumMode')}
                      onChange={(e) => setValue('albumMode', e.target.value as any)}
                    >
                      <option value="NONE">Tanpa Album (Direct)</option>
                      <option value="EXISTING">Pilih Album Ada</option>
                      <option value="NEW">+ Buat Album Baru</option>
                    </select>
                  </div>
                </div>

                {albumMode === 'EXISTING' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                    <label className="form-label">Pilih Album</label>
                    <select {...mediaForm.register('albumId')} className="form-input">
                      <option value="">-- Pilih Album --</option>
                      {albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </motion.div>
                )}

                {albumMode === 'NEW' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                    <label className="form-label">Nama Album Baru</label>
                    <input {...mediaForm.register('newAlbumName')} className="form-input" placeholder="Masukkan nama album..." />
                  </motion.div>
                )}

                <div>
                  <label className="form-label">Judul Media</label>
                  <input {...mediaForm.register('title')} className="form-input" placeholder="Judul untuk foto/video ini..." />
                </div>

                {mediaType === 'PHOTO' ? (
                  <div style={{ display: 'grid', gap: '0.875rem' }}>
                    <div className="upload-zone">
                      <input 
                        type="file" id="file-main" accept="image/*" style={{ display: "none" }}
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <label htmlFor="file-main" style={{ cursor: "pointer" }}>
                        <Upload size={32} color={selectedFile ? "#C8102E" : "#94A3B8"} style={{ margin: "0 auto 0.5rem" }} />
                        <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>
                          {selectedFile ? selectedFile.name : 'Klik untuk Unggah Foto'}
                        </p>
                      </label>
                    </div>

                    {selectedFilePreview && (
                      <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                        <img
                          src={selectedFilePreview}
                          alt={selectedFile?.name || 'Preview upload'}
                          style={{ width: "100%", maxHeight: "280px", objectFit: "cover", display: "block" }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="form-label">Link YouTube/Vimeo</label>
                    <div style={{ position: 'relative' }}>
                      <LinkIcon size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                      <input {...mediaForm.register('url')} className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="https://..." />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={submitting} className="btn-submit">
                  {submitting ? <Loader2 className="animate-spin" /> : <Plus size={18} />}
                  Simpan Media
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); 
          backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000;
        }
        .album-side-panel {
          position: absolute; right: 0; top: 0; bottom: 0; width: 100%; max-width: 450px;
          background: white; box-shadow: -10px 0 30px rgba(0,0,0,0.1); display: flex; flex-direction: column;
        }
        .panel-header { padding: 2rem; border-bottom: 1px solid #F1F5F9; }
        .panel-body { padding: 2rem; overflow-y: auto; flex: 1; }
        .modal-card {
          background: white; width: 100%; max-width: 550px; border-radius: 24px; overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; }
        .form-label { font-size: 0.8rem; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
        .form-input { width: 100%; padding: 0.8rem; border-radius: 12px; border: 1.5px solid #E2E8F0; outline: none; transition: border-color 0.2s; font-size: 0.95rem; box-sizing: border-box; }
        .form-input:focus { border-color: #C8102E; }
        .upload-zone { border: 2px dashed #E2E8F0; padding: 2.5rem; border-radius: 16px; text-align: center; transition: all 0.2s; }
        .upload-zone:hover { border-color: #C8102E; background: #FFF1F2; }
        .btn-submit { width: 100%; padding: 1rem; background: #0F172A; color: white; border: none; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
        .media-card { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 1/1; border: 1px solid #E2E8F0; }
        .media-card img { width: 100%; height: 100%; object-fit: cover; }
        .media-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); display: flex; flex-direction: column; justify-content: flex-end; padding: 0.75rem; opacity: 0; transition: opacity 0.2s; }
        .media-card:hover .media-overlay { opacity: 1; }
        .media-overlay p { color: white; font-size: 0.7rem; margin: 0 0 0.5rem 0; font-weight: 600; }
        .media-overlay button { width: 28px; height: 28px; border-radius: 6px; border: none; background: #EF4444; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .video-badge { position: absolute; top: 0.5rem; left: 0.5rem; background: #C8102E; color: white; padding: 0.2rem 0.4rem; border-radius: 4px; }
        .media-card-sm { position: relative; border-radius: 10px; overflow: hidden; aspect-ratio: 1/1; }
        .media-card-sm img { width: 100%; height: 100%; object-fit: cover; }
        .media-card-sm .delete-btn { position: absolute; top: 0.4rem; right: 0.4rem; width: 24px; height: 24px; border-radius: 4px; border: none; background: rgba(239, 68, 68, 0.9); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .icon-btn { background: none; border: none; color: #94A3B8; cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: all 0.2s; }
        .icon-btn:hover { background: #F1F5F9; color: #0F172A; }
      `}</style>
    </div>
  )
}


