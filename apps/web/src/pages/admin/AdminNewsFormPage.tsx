import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { 
  Save, ArrowLeft, Loader2, Bold, Italic, 
  List, ListOrdered, Quote, Heading1, Heading2
} from 'lucide-react'
import api from '../../lib/axios'
import toast from 'react-hot-toast'
import { handleApiError } from '../../lib/utils'

const newsSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  category: z.string().min(1, 'Kategori wajib dipilih'),
  excerpt: z.string().optional(),
  thumbnailUrl: z.string().url('URL tidak valid').optional().or(z.literal('')),
  status: z.enum(['DRAFT', 'PUBLISHED']),
})

type NewsFormData = z.infer<typeof newsSchema>

export default function AdminNewsFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!id)

  const { register, handleSubmit, reset, setValue, watch, setError, formState: { errors } } = useForm<any>({
    resolver: zodResolver(newsSchema) as any,
    defaultValues: {
      status: 'DRAFT',
    }
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: 'Tulis isi berita di sini...' }),
    ],
    content: '',
  })

  useEffect(() => {
    if (id) {
      const loadNews = async () => {
        try {
          const res = await api.get('/news/admin')
          const news = res.data.data.find((n: any) => n.id === id)
          if (news) {
            reset({
              title: news.title,
              category: news.category,
              excerpt: news.excerpt || '',
              thumbnailUrl: news.thumbnailUrl || '',
              status: news.status as any,
            })
            editor?.commands.setContent(news.content)
          }
        } catch (error) {
          handleApiError(error)
        } finally {
          setFetching(false)
        }
      }
      if (editor) loadNews()
    }
  }, [id, reset, editor])

  const onSubmit = async (data: NewsFormData) => {
    if (!editor?.getHTML() || editor.getHTML() === '<p></p>') {
      toast.error('Konten berita tidak boleh kosong')
      return
    }

    setLoading(true)
    const payload = {
      ...data,
      content: editor.getHTML(),
    }

    try {
      if (id) {
        await api.patch(`/news/${id}`, payload)
        toast.success('Berita diperbarui')
      } else {
        await api.post('/news', payload)
        toast.success('Berita berhasil dibuat')
      }
      navigate('/admin/news')
    } catch (error: any) {
      handleApiError(error, setError)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div>Memuat...</div>

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => navigate('/admin/news')}
          style={{ background: 'white', border: '1px solid #E2E8F0', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          {id ? 'Edit Artikel' : 'Buat Artikel Baru'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Main Editor Section */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: errors.title ? '1.5px solid #EF4444' : '1px solid #E2E8F0' }}>
            <input 
              {...register('title')}
              placeholder="Masukkan Judul Berita..."
              style={{ width: '100%', fontSize: '1.5rem', fontWeight: 800, border: 'none', outline: 'none', marginBottom: '1rem' }}
            />
            {errors.title && <p style={{ color: '#EF4444', fontSize: '0.875rem' }}>{(errors.title as any).message}</p>}
            
            <div style={{ 
              border: '1px solid #E2E8F0', 
              borderRadius: '12px', 
              overflow: 'hidden'
            }}>
              {/* Toolbar */}
              <div style={{ background: '#F8FAFC', padding: '0.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                <ToolbarButton active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()} icon={Bold} />
                <ToolbarButton active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()} icon={Italic} />
                <div style={{ width: '1px', height: '24px', background: '#E2E8F0', margin: '0 0.5rem' }} />
                <ToolbarButton active={editor?.isActive('heading', { level: 1 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} icon={Heading1} />
                <ToolbarButton active={editor?.isActive('heading', { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} icon={Heading2} />
                <div style={{ width: '1px', height: '24px', background: '#E2E8F0', margin: '0 0.5rem' }} />
                <ToolbarButton active={editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()} icon={List} />
                <ToolbarButton active={editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()} icon={ListOrdered} />
                <ToolbarButton active={editor?.isActive('blockquote')} onClick={() => editor?.chain().focus().toggleBlockquote().run()} icon={Quote} />
              </div>
              
              <div style={{ padding: '1rem', minHeight: '400px' }}>
                <EditorContent editor={editor} className="prose-editor" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings Section */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'grid', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Pengaturan Publikasi</h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Kategori</label>
              <select {...register('category')} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: errors.category ? '1.5px solid #EF4444' : '1px solid #E2E8F0', background: 'white' }}>
                <option value="">Pilih Kategori</option>
                <option value="Prestasi">Prestasi</option>
                <option value="Event">Event</option>
                <option value="Organisasi">Organisasi</option>
                <option value="Sport Science">Sport Science</option>
              </select>
              {errors.category && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{(errors.category as any).message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Status</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button 
                  type="button"
                  onClick={() => setValue('status', 'DRAFT')}
                  style={{ 
                    padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', 
                    background: watch('status') === 'DRAFT' ? '#F1F5F9' : 'white',
                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
                  }}
                >
                  Draft
                </button>
                <button 
                  type="button"
                  onClick={() => setValue('status', 'PUBLISHED')}
                  style={{ 
                    padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0', 
                    background: watch('status') === 'PUBLISHED' ? '#DCFCE7' : 'white',
                    color: watch('status') === 'PUBLISHED' ? '#166534' : 'inherit',
                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer'
                  }}
                >
                  Terbit
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none', 
                background: '#0F172A', color: 'white', fontWeight: 700, 
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Simpan Artikel
            </button>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: errors.thumbnailUrl ? '1.5px solid #EF4444' : '1px solid #E2E8F0' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Thumbnail URL</label>
            <input {...register('thumbnailUrl')} placeholder="https://..." style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
            {errors.thumbnailUrl && <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{(errors.thumbnailUrl as any).message}</p>}
          </div>
        </div>
      </form>

      <style>{`
        .prose-editor { outline: none; }
        .prose-editor p { margin-bottom: 1rem; line-height: 1.6; }
        .prose-editor h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
        .prose-editor h2 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem; }
        .prose-editor ul, .prose-editor ol { margin-left: 1.5rem; margin-bottom: 1rem; }
      `}</style>
    </div>
  )
}

function ToolbarButton({ active, onClick, icon: Icon }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '6px', border: 'none', cursor: 'pointer',
        background: active ? '#E2E8F0' : 'transparent',
        color: active ? '#0F172A' : '#64748B'
      }}
    >
      <Icon size={18} />
    </button>
  )
}
