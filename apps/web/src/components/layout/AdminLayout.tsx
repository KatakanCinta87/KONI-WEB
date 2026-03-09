import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Users, UserRound, Newspaper, 
  LogOut, Menu, X, User, Settings,
  ShieldCheck, FileText, Image as ImageIcon, CalendarRange
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const displayName = user?.fullName?.trim() || user?.email || 'User'
  const userInitial = displayName.charAt(0).toUpperCase()
  const displayRole = user?.role ? user.role.replace('_', ' ') : 'USER'

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/admin/dashboard',
      roles: ['SUPER_ADMIN', 'CABOR_ADMIN', 'COACH', 'ATHLETE']
    },
    { 
      icon: Users, 
      label: 'Data Atlet', 
      path: '/admin/athletes',
      roles: ['SUPER_ADMIN', 'CABOR_ADMIN', 'COACH']
    },
    { 
      icon: UserRound, 
      label: 'Data Pelatih', 
      path: '/admin/coaches',
      roles: ['SUPER_ADMIN', 'CABOR_ADMIN']
    },
    { 
      icon: Newspaper, 
      label: 'Berita', 
      path: '/admin/news',
      roles: ['SUPER_ADMIN', 'CABOR_ADMIN']
    },
    {
      icon: CalendarRange,
      label: 'Event & Medali',
      path: '/admin/events',
      roles: ['SUPER_ADMIN']
    },
    { 
      icon: ImageIcon, 
      label: 'Galeri', 
      path: '/admin/gallery',
      roles: ['SUPER_ADMIN']
    },
    { 
      icon: FileText, 
      label: 'E-SK Cabor', 
      path: '/admin/sk',
      roles: ['SUPER_ADMIN', 'CABOR_ADMIN']
    },
    { 
      icon: ShieldCheck, 
      label: 'Audit Log', 
      path: '/admin/audit-logs',
      roles: ['SUPER_ADMIN']
    },
    { 
      icon: User, 
      label: 'Manajemen User', 
      path: '/admin/users',
      roles: ['SUPER_ADMIN']
    },
    { 
      icon: Settings, 
      label: 'Pengaturan', 
      path: '/admin/settings',
      roles: ['SUPER_ADMIN']
    },
  ]

  const filteredMenu = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? '280px' : '80px' }}
        style={{
          background: '#0F172A',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100,
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        }}
      >
        {/* Sidebar Header */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarOpen ? 'space-between' : 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)'
        }}>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.05em' }}
            >
              KONI <span style={{ color: '#C8102E' }}>CMS</span>
            </motion.span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              border: 'none', 
              color: 'white', 
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isSidebarOpen ? <X size={18} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          {filteredMenu.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                title={!isSidebarOpen ? item.label : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  color: isActive ? 'white' : '#94A3B8',
                  textDecoration: 'none',
                  fontSize: '0.925rem',
                  fontWeight: isActive ? 600 : 500,
                  background: isActive ? 'rgba(200, 16, 46, 0.15)' : 'transparent',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  marginBottom: '0.25rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                <item.icon size={20} style={{ 
                  minWidth: '20px', 
                  marginRight: isSidebarOpen ? '1rem' : '0',
                  color: isActive ? '#C8102E' : 'inherit'
                }} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer (User Info) */}
        <div style={{ 
          padding: '1.25rem', 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          {isSidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: '#C8102E', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem'
              }}>
                {userInitial}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {displayRole}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center',
              padding: '0.75rem',
              background: 'rgba(241, 245, 249, 0.05)',
              color: '#FCA5A5',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.875rem',
              fontWeight: 600
            }}
          >
            <LogOut size={18} style={{ marginRight: isSidebarOpen ? '0.75rem' : '0' }} />
            {isSidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{ 
          height: '72px', 
          background: 'white', 
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 2rem',
          justifyContent: 'space-between',
          zIndex: 90
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0F172A', fontWeight: 700 }}>
              {filteredMenu.find(i => location.pathname.startsWith(i.path))?.label || 'Panel Admin'}
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
