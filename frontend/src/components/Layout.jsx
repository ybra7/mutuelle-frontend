import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Wallet,
  BookOpen, Menu, X, TrendingUp, Home, LogOut, Shield, User
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ADMIN_NAV = [
  { path: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/membres',     label: 'Membres',     icon: Users },
  { path: '/cotisations', label: 'Cotisations', icon: Wallet },
  { path: '/suivi',       label: 'Suivi',       icon: TrendingUp },
  { path: '/guide',       label: 'Guide',       icon: BookOpen },
]
const MEMBRE_NAV = [
  { path: '/mon-espace', label: 'Mon Espace', icon: Home },
  { path: '/guide',      label: 'Guide',      icon: BookOpen },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const location        = useLocation()
  const { user, logout } = useAuth()

  const isAdmin    = user?.role === 'admin'
  const NAV_ITEMS  = isAdmin ? ADMIN_NAV : MEMBRE_NAV
  const currentLabel = NAV_ITEMS.find(n => location.pathname.startsWith(n.path))?.label ?? ''
  const displayName  = isAdmin ? 'Administrateur' : (user?.membre?.nom ?? user?.username ?? '')
  const initials     = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  async function handleLogout() {
    await logout()
    toast.success('Déconnexion réussie')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {open && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed lg:relative inset-y-0 left-0 z-30 w-64 flex flex-col bg-navy-800 border-r border-white/5 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gold-500 flex items-center justify-center shadow-lg shadow-gold-500/30">
            <span className="text-navy-900 font-display font-bold text-lg">M</span>
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">Mutuelle</p>
            <p className="text-xs text-white/40 leading-tight">de Solidarité</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden text-white/40 hover:text-white"><X size={18} /></button>
        </div>

        <div className="px-4 pt-4 pb-1">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${isAdmin ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
            {isAdmin ? <Shield size={12} /> : <User size={12} />}
            {isAdmin ? 'Administrateur' : 'Espace Membre'}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink key={path} to={path} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-gold-400 text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{displayName}</p>
              <p className="text-[10px] text-white/30 font-mono">{user?.username}</p>
            </div>
            <button onClick={handleLogout} title="Déconnexion" className="text-white/25 hover:text-red-400 transition-colors flex-shrink-0"><LogOut size={15} /></button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-navy-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="lg:hidden text-white/50 hover:text-white"><Menu size={20} /></button>
            <h1 className="font-display font-semibold text-white/80 text-base">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 font-mono hidden sm:block">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <button onClick={handleLogout} className="hidden sm:flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors">
              <LogOut size={13} /> Déconnexion
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">{children}</main>
      </div>
    </div>
  )
}
