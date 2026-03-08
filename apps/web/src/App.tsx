import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ProfilPage from './pages/ProfilPage'
import CaborPage from './pages/CaborPage'
import BeritaPage from './pages/BeritaPage'
import KontakPage from './pages/KontakPage'

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/profil" element={<ProfilPage />} />
                <Route path="/cabor" element={<CaborPage />} />
                <Route path="/berita" element={<BeritaPage />} />
                <Route path="/kontak" element={<KontakPage />} />
            </Routes>
        </Layout>
    )
}
