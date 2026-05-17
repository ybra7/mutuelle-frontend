import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, LogIn, CheckCircle, XCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'

export default function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]         = useState({ username: '', password: '' })
  const [show, setShow]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [serverStatus, setServerStatus] = useState('checking')

  useEffect(() => {
    api.get('/ping')
      .then(() => setServerStatus('ok'))
      .catch(() => setServerStatus('error'))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (serverStatus === 'error') {
      toast.error('Le serveur est inaccessible. Veuillez réessayer.')
      return
    }
    if (!form.username || !form.password) {
      toast.error('Remplissez tous les champs')
      return
    }
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      const nom = user.role === 'admin' ? 'Administrateur' : (user.membre?.nom ?? user.username)
      toast.success(`Bienvenue, ${nom} !`)
      navigate(user.role === 'admin' ? '/dashboard' : '/mon-espace', { replace: true })
    } catch (err) {
      toast.error(err.userMessage ?? 'Identifiants incorrects')
    } finally {
      setLoading(false)
    }
  }

  const statusInfo = {
    checking: { icon: <Loader size={13} className="animate-spin" />, text: 'Vérification du serveur…', cls: 'text-white/40 border-white/10 bg-white/5' },
    ok:       { icon: <CheckCircle size={13} />, text: 'Serveur connecté', cls: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/8' },
    error:    { icon: <XCircle size={13} />, text: 'Serveur inaccessible — contactez l\'administrateur', cls: 'text-red-400 border-red-500/20 bg-red-500/8' },
  }[serverStatus]

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gold-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-gold-500/30">
            <span className="text-navy-900 font-display font-black text-3xl">M</span>
          </div>
          <h1 className="font-display font-bold text-white text-2xl">Mutuelle AEJ</h1>
          <p className="text-white/40 text-sm mt-1">Connectez-vous à votre espace</p>
        </div>

        {/* Statut serveur */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs mb-4 ${statusInfo.cls}`}>
          {statusInfo.icon}
          <span>{statusInfo.text}</span>
        </div>

        {/* Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Identifiant
              </label>
              <input
                type="text"
                placeholder="Votre identifiant"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                className="input-field w-full"
                autoFocus
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field w-full pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || serverStatus === 'checking'}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-navy-900/40 border-t-navy-900 rounded-full animate-spin" />
                : <LogIn size={16} />}
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
