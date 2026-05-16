import { useEffect, useState, useCallback, Fragment } from 'react'
import { TrendingUp, Search, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { StatusBadge, Spinner, EmptyState, fcfa } from '../components/ui'

export default function Suivi() {
  const [suivi, setSuivi]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('TOUS')
  const [expanded, setExpanded] = useState(null)
  const [detail, setDetail]     = useState({})
  const [loadingDetail, setLoadingDetail] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/suivi')
      .then(r => setSuivi(r.data))
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = suivi.filter(m => {
    const matchSearch = !search ||
      m.nom.toLowerCase().includes(search.toLowerCase()) ||
      m.code_membre.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'TOUS' || m.statut === filter
    return matchSearch && matchFilter
  })

  async function toggleExpand(id) {
    if (expanded === id) { setExpanded(null); return }
    setExpanded(id)
    if (!detail[id]) {
      setLoadingDetail(id)
      try {
        const r = await api.get(`/suivi/${id}`)
        setDetail(p => ({ ...p, [id]: r.data }))
      } catch { toast.error('Erreur de chargement du détail') }
      finally { setLoadingDetail(null) }
    }
  }

  const stats = {
    total:      suivi.length,
    a_jour:     suivi.filter(m => m.statut === 'A_JOUR').length,
    surplus:    suivi.filter(m => m.statut === 'SURPLUS').length,
    pas_a_jour: suivi.filter(m => m.statut === 'PAS_A_JOUR').length,
    total_attendu: suivi.reduce((s, m) => s + (m.total_attendu || 0), 0),
    total_paye:    suivi.reduce((s, m) => s + (m.total_paye || 0), 0),
  }

  const tabs = [
    { key: 'TOUS',      label: 'Tous',          count: stats.total },
    { key: 'A_JOUR',    label: 'À jour',         count: stats.a_jour + stats.surplus },
    { key: 'PAS_A_JOUR',label: 'En retard',      count: stats.pas_a_jour },
    { key: 'SURPLUS',   label: 'Surplus',        count: stats.surplus },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Suivi individuel</h1>
        <p className="page-subtitle">État financier en temps réel pour chaque membre</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        <div className="card p-4 border border-white/5">
          <p className="text-xs text-white/40 mb-1">Total attendu</p>
          <p className="font-mono font-bold text-white text-lg">{fcfa(stats.total_attendu)}</p>
        </div>
        <div className="card p-4 border border-emerald-500/20">
          <p className="text-xs text-white/40 mb-1">Total encaissé</p>
          <p className="font-mono font-bold text-emerald-400 text-lg">{fcfa(stats.total_paye)}</p>
        </div>
        <div className="card p-4 border border-red-500/20">
          <p className="text-xs text-white/40 mb-1">Total dettes</p>
          <p className="font-mono font-bold text-red-400 text-lg">
            {fcfa(Math.abs(suivi.filter(m => m.solde < 0).reduce((s, m) => s + m.solde, 0)))}
          </p>
        </div>
        <div className="card p-4 border border-blue-500/20">
          <p className="text-xs text-white/40 mb-1">Total surplus</p>
          <p className="font-mono font-bold text-blue-400 text-lg">
            {fcfa(suivi.filter(m => m.solde > 0).reduce((s, m) => s + m.solde, 0))}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className="input-field pl-9"
            placeholder="Rechercher membre…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-navy-800 border border-white/5 rounded-xl p-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                filter === t.key
                  ? 'bg-gold-500 text-navy-900'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {t.label} <span className="ml-1 opacity-70">({t.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState message="Aucun membre à afficher" icon={TrendingUp} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Code', 'Nom', 'Cot./mois', 'Mois écoulés', 'Total attendu', 'Total payé', 'Solde', 'Statut', '']
                    .map(h => <th key={h} className="table-th">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <Fragment key={m.id}>
                    <tr className="table-tr cursor-pointer" onClick={() => toggleExpand(m.id)}>
                      <td className="table-td">
                        <span className="font-mono text-xs text-gold-400">{m.code_membre}</span>
                      </td>
                      <td className="table-td font-medium text-white">{m.nom}</td>
                      <td className="table-td font-mono text-xs text-white/60">{fcfa(m.cotisation_mensuelle)}</td>
                      <td className="table-td text-center">
                        <span className="bg-navy-700 px-2 py-0.5 rounded text-xs font-mono text-white/70">{m.mois_depuis_adhesion}</span>
                      </td>
                      <td className="table-td font-mono text-sm text-white/70">{fcfa(m.total_attendu)}</td>
                      <td className="table-td font-mono text-sm text-emerald-400">{fcfa(m.total_paye)}</td>
                      <td className="table-td">
                        <span className={`font-mono text-sm font-bold ${
                          m.solde > 0 ? 'text-blue-400' : m.solde === 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {m.solde > 0 ? '+' : ''}{fcfa(m.solde)}
                        </span>
                      </td>
                      <td className="table-td"><StatusBadge statut={m.statut} /></td>
                      <td className="table-td text-white/30">
                        {expanded === m.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>

                    {/* Expanded detail */}
                    {expanded === m.id && (
                      <tr>
                        <td colSpan="9" className="px-4 py-4 bg-navy-900/50 border-b border-white/5">
                          {loadingDetail === m.id ? (
                            <div className="flex justify-center py-4"><Spinner /></div>
                          ) : detail[m.id]?.cotisations?.length > 0 ? (
                            <div>
                              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                                Historique des paiements de {m.nom}
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {detail[m.id].cotisations.map(c => (
                                  <div key={c.id} className="bg-navy-800 border border-white/5 rounded-xl px-3 py-2.5">
                                    <p className="text-[10px] text-white/30 font-mono mb-0.5">{c.code_paiement}</p>
                                    <p className="text-xs font-semibold text-white/70">{c.mois}</p>
                                    <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{fcfa(c.montant_paye)}</p>
                                    <p className="text-[10px] text-white/30 mt-0.5">{c.date_paiement}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-white/30 py-2">Aucun paiement enregistré pour ce membre.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
