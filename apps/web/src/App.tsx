import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import HomePage from './pages/HomePage'
import ProfilPage from './pages/ProfilPage'
import CaborPage from './pages/CaborPage'
import BeritaPage from './pages/BeritaPage'
import KontakPage from './pages/KontakPage'
import LoginPage from './pages/admin/LoginPage'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminAthletesPage from './pages/admin/AdminAthletesPage'
import AdminAthleteFormPage from './pages/admin/AdminAthleteFormPage'
import AdminCoachesPage from './pages/admin/AdminCoachesPage'
import AdminCoachFormPage from './pages/admin/AdminCoachFormPage'
import AdminNewsPage from './pages/admin/AdminNewsPage'
import AdminNewsFormPage from './pages/admin/AdminNewsFormPage'
import AdminCaborsPage from './pages/admin/AdminCaborsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminSKPage from './pages/admin/AdminSKPage'
import AdminGalleryPage from './pages/admin/AdminGalleryPage'
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminEventsPage from './pages/admin/AdminEventsPage'
import AdminEventFormPage from './pages/admin/AdminEventFormPage'

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #C8102E', borderRadius: '50%' }}></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <AdminLayout>{children}</AdminLayout>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/profil" element={<Layout><ProfilPage /></Layout>} />
        <Route path="/cabor" element={<Layout><CaborPage /></Layout>} />
        <Route path="/berita" element={<Layout><BeritaPage /></Layout>} />
        <Route path="/kontak" element={<Layout><KontakPage /></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/athletes" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN', 'COACH']}>
            <AdminAthletesPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/athletes/new" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN']}>
            <AdminAthleteFormPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/athletes/edit/:id" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN']}>
            <AdminAthleteFormPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/coaches" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN']}>
            <AdminCoachesPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/coaches/new" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN']}>
            <AdminCoachFormPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/coaches/edit/:id" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN']}>
            <AdminCoachFormPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/news" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN']}>
            <AdminNewsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/news/new" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN']}>
            <AdminNewsFormPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/news/edit/:id" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN']}>
            <AdminNewsFormPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/events" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminEventsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/events/new" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminEventFormPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/events/edit/:id" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminEventFormPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/cabors" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN']}>
            <AdminCaborsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/sk" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'CABOR_ADMIN']}>
            <AdminSKPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/gallery" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminGalleryPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/audit-logs" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminAuditLogsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <AdminSettingsPage />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
