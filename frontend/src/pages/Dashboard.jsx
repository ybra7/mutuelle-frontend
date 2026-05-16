import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'
import {
  Users, UserCheck, UserX, Percent,
  TrendingUp, AlertCircle, Calendar, CreditCard
} from 'lucide-react'
import api from '../api/client'
import KPICard from '../components/KPICard'
import { Spinner, fcfa } from '../components/ui'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      {label && <p className="text-white/50 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' ? fcfa(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-800 border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p style={{ color: payload[0].payload.color }} className="font-semibold">
        {payload[0].name}: {payload[0].value} membres
      </p>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  )

  if (!data) return <p className="text-white/40 text-sm">Impossible de charger le dashboard.</p>

  const { kpi, top_debiteurs, pie_data, bar_data, evolution } = data

  const kpiCards = [
    { title: 'Total Membres',        value: kpi.total_membres,                         icon: Users,       color: 'gold',   sub: 'Membres enregistrés' },
    { title: 'Membres à Jour',       value: `${kpi.membres_a_jour}`,                   icon: UserCheck,   color: 'green',  sub: `dont ${kpi.surplus} en surplus` },
    { title: 'Membres en Retard',    value: `${kpi.membres_en_retard}`,                icon: UserX,       color: 'red',    sub: 'Paiements en souffrance' },
    { title: 'Taux de Recouvrement', value: `${kpi.tx_recouvrement}%`,                 icon: Percent,     color: 'teal',   sub: 'Membres à jour / total' },
    { title: 'Total Encaissé',       value: fcfa(kpi.total_cotisations),               icon: TrendingUp,  color: 'blue',   sub: 'Depuis le début' },
    { title: 'Montant Restant',      value: fcfa(kpi.montant_restant),                 icon: AlertCircle, color: 'orange', sub: 'Dettes actives' },
    { title: 'Cotisations ce Mois',  value: fcfa(kpi.total_ce_mois),                   icon: Calendar,    color: 'purple', sub: 'Encaissements du mois' },
    { title: 'Paiements ce Mois',    value: `${kpi.nb_paiements_mois}`,                icon: CreditCard,  color: 'cyan',   sub: 'Transactions enregistrées' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Vue d'ensemble</h1>
        <p className="page-subtitle">Tableau de bord — mise à jour automatique</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {kpiCards.map((card, i) => (
          <KPICard key={i} {...card} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Pie Chart */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-white text-sm mb-4">
            Répartition des statuts
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pie_data}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pie_data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            {pie_data.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                {d.name} <span className="ml-auto font-semibold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-white text-sm mb-4">
            Encaissé vs Restant
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bar_data} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="valeur" radius={[6,6,0,0]}>
                  {bar_data.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Débiteurs */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-white text-sm mb-4">
            Top débiteurs
          </h3>
          {top_debiteurs.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-white/25 text-sm">
              🎉 Aucun débiteur !
            </div>
          ) : (
            <div className="space-y-2">
              {top_debiteurs.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/80 flex-1 truncate">{d.nom}</span>
                  <span className="text-xs font-mono text-red-400 flex-shrink-0">
                    -{fcfa(d.dette)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Evolution line chart */}
      <div className="card p-5">
        <h3 className="font-display font-semibold text-white text-sm mb-4">
          Évolution des encaissements — 12 derniers mois
        </h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mois" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="montant" name="Encaissé"
                stroke="#E6AC1A" strokeWidth={2.5}
                dot={{ fill: '#E6AC1A', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#F4C542' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
