import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import { StatusBadge, Spinner, fcfa } from '../components/ui'
import { User, CreditCard, TrendingUp, Calendar, Lock, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color = 'white' }) {
  const colors = {
    green:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    red:    'text-red-400 bg-red-500/10 border-red-500/20',
    gold:   'text-gold-400 bg-gold-500/10 border-gold-500/20',
    blue:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    white:  'text-white/80 bg-white/5 border-white/10',
  }
  return (
    <div className={`card p-4 border ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon size={16} className="opacity-70" />
        <span className="text-xs opacity-60">{label}</span>
      </div>
      <p className="font-mono font-bold text-lg">{value}</p>
    </div>
  )
}

export default function MonEspace() {
  const { user, refreshUser } = useAuth()
  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [pwForm, setPwForm]     = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [showPw, setShowPw]     = useState(false)

  useEffect(() => {
    api.get('/mon-espace')
      .then(r => setData(r.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  async function handlePwChange(e) {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) { toast.error('Les mots de passe ne correspondent pas'); return }
    if (pwForm.new_password.length < 6) { toast.error('Minimum 6 caractères'); return }
    setPwLoading(true)
    try {
      await api.put('/auth/password', { old_password: pwForm.old_password, new_password: pwForm.new_password })
      toast.success('Mot de passe mis à jour !')
      setPwForm({ old_password: '', new_password: '', confirm: '' })
      setShowPw(false)
    } catch (err) {
      toast.error(err.userMessage ?? 'Erreur')
    } finally {
      setPwLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  )
  if (!data) return <p className="text-white/40 text-sm">Impossible de charger votre espace.</p>

  const statutIcon = data.statut === 'A_JOUR' ? CheckCircle : data.statut === 'SURPLUS' ? TrendingUp : AlertCircle
  const statutColor = data.statut === 'PAS_A_JOUR' ? 'red' : data.statut === 'SURPLUS' ? 'gold' : 'green'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Mon Espace</h1>
          <p className="page-subtitle">{data.code_membre} — {data.nom}</p>
        </div>
        <StatusBadge statut={data.statut} large />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <StatCard icon={CreditCard}   label="Cotisation mensuelle" value={fcfa(data.cotisation_mensuelle)} color="gold" />
        <StatCard icon={TrendingUp}   label="Total payé"           value={fcfa(data.total_paye)}           color="green" />
        <StatCard icon={AlertCircle}  label="Total attendu"        value={fcfa(data.total_attendu)}        color="blue" />
        <StatCard icon={statutIcon}   label="Solde"
          value={(data.solde >= 0 ? '+' : '') + fcfa(data.solde)}
          color={data.solde >= 0 ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Infos personnelles */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <User size={15} className="text-gold-400" /> Informations personnelles
          </h3>
          <dl className="space-y-3">
            {[
              { k: 'Code membre',    v: data.code_membre },
              { k: 'Nom complet',    v: data.nom },
              { k: 'Téléphone',      v: data.telephone ?? '—' },
              { k: "Date d'adhésion", v: data.date_adhesion },
              { k: 'Mois d\'ancienneté', v: `${data.mois_depuis_adhesion} mois` },
            ].map(({ k, v }) => (
              <div key={k} className="flex justify-between text-sm">
                <dt className="text-white/40">{k}</dt>
                <dd className="text-white font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Statut détaillé */}
        <div className="card p-5 flex flex-col">
          <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-gold-400" /> Situation financière
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <StatusBadge statut={data.statut} large />
            {data.statut === 'PAS_A_JOUR' && (
              <p className="text-xs text-red-400 text-center">
                Vous avez un retard de <strong>{fcfa(Math.abs(data.solde))}</strong>.<br />
                Contactez l'administrateur pour régulariser.
              </p>
            )}
            {data.statut === 'SURPLUS' && (
              <p className="text-xs text-emerald-400 text-center">
                Vous avez un avance de <strong>{fcfa(data.solde)}</strong>.<br />
                Merci pour votre régularité !
              </p>
            )}
            {data.statut === 'A_JOUR' && (
              <p className="text-xs text-emerald-400 text-center">
                Vous êtes à jour dans vos paiements.<br />
                Continuez ainsi !
              </p>
            )}
          </div>
        </div>

        {/* Changer mot de passe */}
        <div className="card p-5">
          <button
            onClick={() => setShowPw(v => !v)}
            className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2 w-full"
          >
            <Lock size={15} className="text-gold-400" />
            Changer le mot de passe
            <span className="ml-auto text-white/30 text-xs">{showPw ? '▲' : '▼'}</span>
          </button>
          {showPw && (
            <form onSubmit={handlePwChange} className="space-y-3">
              {[
                { key: 'old_password', label: 'Mot de passe actuel', ph: '••••••••' },
                { key: 'new_password', label: 'Nouveau mot de passe', ph: 'min. 6 caractères' },
                { key: 'confirm',      label: 'Confirmation', ph: '••••••••' },
              ].map(({ key, label, ph }) => (
                <div key={key}>
                  <label className="block text-xs text-white/50 mb-1">{label}</label>
                  <input
                    type="password"
                    placeholder={ph}
                    value={pwForm[key]}
                    onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    className="input-field w-full text-sm py-2"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={pwLoading}
                className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {pwLoading
                  ? <span className="w-3 h-3 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                  : <CheckCircle size={14} />}
                Enregistrer
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Historique des cotisations */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2">
          <Calendar size={15} className="text-gold-400" />
          Historique de mes paiements
          <span className="ml-auto text-xs text-white/30 font-normal">{data.cotisations?.length ?? 0} enregistrement(s)</span>
        </h3>
        {!data.cotisations?.length ? (
          <p className="text-center text-white/25 text-sm py-8">Aucun paiement enregistré</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs text-white/40 font-medium pb-3 pr-4">Réf.</th>
                  <th className="text-left text-xs text-white/40 font-medium pb-3 pr-4">Mois</th>
                  <th className="text-left text-xs text-white/40 font-medium pb-3 pr-4">Date</th>
                  <th className="text-right text-xs text-white/40 font-medium pb-3">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.cotisations.map(c => (
                  <tr key={c.id} className="table-tr">
                    <td className="py-2.5 pr-4 font-mono text-xs text-white/40">{c.code_paiement}</td>
                    <td className="py-2.5 pr-4 text-white/80">{c.mois}</td>
                    <td className="py-2.5 pr-4 text-white/50 text-xs">{c.date_paiement}</td>
                    <td className="py-2.5 text-right font-mono text-emerald-400 font-semibold">
                      {fcfa(c.montant_paye)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
