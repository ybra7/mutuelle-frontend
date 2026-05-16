import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Membres from './pages/Membres'
import Cotisations from './pages/Cotisations'
import Suivi from './pages/Suivi'
import Guide from './pages/Guide'
import MonEspace from './pages/MonEspace'
import { Spinner } from './components/ui'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900">
      <Spinner size={36} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/mon-espace" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900">
      <Spinner size={36} />
    </div>
  )
  if (user) return <Navigate to={user.role === 'admin' ? '/dashboard' : '/mon-espace'} replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Publique */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      {/* Protégées — wrappées dans Layout */}
      <Route path="/*" element={
        <PrivateRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to={user?.role === 'admin' ? '/dashboard' : '/mon-espace'} replace />} />

              {/* Admin seulement */}
              <Route path="/dashboard"   element={<PrivateRoute adminOnly><Dashboard /></PrivateRoute>} />
              <Route path="/membres"     element={<PrivateRoute adminOnly><Membres /></PrivateRoute>} />
              <Route path="/cotisations" element={<PrivateRoute adminOnly><Cotisations /></PrivateRoute>} />
              <Route path="/suivi"       element={<PrivateRoute adminOnly><Suivi /></PrivateRoute>} />

              {/* Membre */}
              <Route path="/mon-espace" element={<MonEspace />} />

              {/* Commun */}
              <Route path="/guide" element={<Guide />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
