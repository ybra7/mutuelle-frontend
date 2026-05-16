import { BookOpen, Users, Wallet, TrendingUp, LayoutDashboard, AlertCircle, CheckCircle, Code } from 'lucide-react'

const SECTIONS = [
  {
    icon: LayoutDashboard,
    color: 'gold',
    title: 'Dashboard',
    desc: 'Vue executive avec 8 indicateurs KPI mis à jour en temps réel.',
    items: [
      'Total Membres — nombre de membres enregistrés',
      'Membres à Jour — payé exactement ou en avance',
      'Membres en Retard — au moins un mois de retard',
      'Taux de Recouvrement — % membres à jour sur total',
      'Total Encaissé — cumul de tous les paiements',
      'Montant Restant — total des dettes actives',
      'Cotisations ce Mois — encaissements du mois courant',
      'Paiements ce Mois — nombre de transactions du mois',
    ]
  },
  {
    icon: Users,
    color: 'blue',
    title: 'Gestion des Membres',
    desc: 'Base de données centrale. Tous les calculs en dépendent.',
    items: [
      'Identifiant unique généré automatiquement (M001, M002…)',
      'Nom complet, téléphone, date d\'adhésion, cotisation mensuelle',
      'Modifier ou supprimer un membre existant',
      'Recherche en temps réel par nom ou code',
      'Statut et solde calculés automatiquement',
    ]
  },
  {
    icon: Wallet,
    color: 'green',
    title: 'Enregistrement des Cotisations',
    desc: 'Journal de caisse — chaque paiement reçu est enregistré ici.',
    items: [
      'Code paiement généré automatiquement (P001, P002…)',
      'Sélection du membre via liste déroulante',
      'ID membre rempli automatiquement (INDEX/MATCH)',
      'Choix du mois parmi liste prédéfinie (Janvier–Décembre)',
      'Montant et date de paiement',
      'Filtres par membre et par mois',
    ]
  },
  {
    icon: TrendingUp,
    color: 'teal',
    title: 'Suivi Individuel',
    desc: 'État financier exact de chaque membre en temps réel.',
    items: [
      'Total Attendu = mois écoulés depuis adhésion × cotisation mensuelle',
      'Total Payé = somme de tous les paiements du membre',
      'Solde = Payé − Attendu (+ = surplus, 0 = exact, − = dette)',
      '3 statuts : ✓ À JOUR | ↑ SURPLUS | ✗ EN RETARD',
      'Cliquer sur une ligne pour voir l\'historique des paiements',
      'Filtres par statut : Tous / À jour / En retard / Surplus',
    ]
  },
]

const FORMULES = [
  {
    label: 'Total Attendu',
    code: 'DATEDIF(date_adhesion, AUJOURD\'HUI, "m") × cotisation_mensuelle',
    note: 'Se met à jour chaque jour automatiquement'
  },
  {
    label: 'Total Payé',
    code: 'SOMME.SI(cotisations WHERE membre_id = id)',
    note: 'Somme de tous les paiements enregistrés'
  },
  {
    label: 'Solde',
    code: 'total_paye - total_attendu',
    note: 'Positif = surplus, Zéro = exact, Négatif = dette'
  },
  {
    label: 'Statut',
    code: 'SI(solde > 0) → SURPLUS | SI(solde = 0) → À JOUR | SINON → PAS À JOUR',
    note: '3 niveaux distincts — plus précis qu\'un simple OUI/NON'
  },
  {
    label: 'Taux de recouvrement',
    code: '(membres_a_jour + membres_surplus) / total_membres × 100',
    note: '100% = objectif mensuel de la mutuelle'
  },
]

const ETAPES = [
  { n: 1, title: 'Enregistrer les membres', desc: 'Aller dans Membres → Ajouter. L\'ID se génère automatiquement. Saisir nom, téléphone, date d\'adhésion et cotisation mensuelle.' },
  { n: 2, title: 'Enregistrer les paiements', desc: 'Aller dans Cotisations → Enregistrer. Sélectionner le membre dans la liste, choisir le mois, saisir le montant et la date.' },
  { n: 3, title: 'Consulter le statut', desc: 'Aller dans Suivi. Chaque membre affiche son total attendu, total payé, solde et statut calculés automatiquement.' },
  { n: 4, title: 'Analyser la situation globale', desc: 'Ouvrir le Dashboard. Les 8 KPI, les graphiques et le top débiteurs donnent une synthèse complète en un coup d\'œil.' },
]

const BONNES_PRATIQUES = [
  'Toujours saisir les dates au format correct pour que le calcul DATEDIF fonctionne',
  'Si un membre quitte la mutuelle, ne pas le supprimer — ses données historiques sont précieuses',
  'Le taux de recouvrement à 100% est l\'objectif mensuel de la mutuelle',
  'Enregistrer les paiements dès réception pour un suivi en temps réel',
  'Utiliser les filtres Suivi pour identifier rapidement les membres en retard',
]

const colorMap = {
  gold:  'border-gold-500/20   bg-gold-500/5   text-gold-400',
  blue:  'border-blue-500/20   bg-blue-500/5   text-blue-400',
  green: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
  teal:  'border-teal-500/20   bg-teal-500/5   text-teal-400',
}

export default function Guide() {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Guide d'utilisation</h1>
        <p className="page-subtitle">Documentation complète — Application Mutuelle de Solidarité v1.0</p>
      </div>

      {/* Intro */}
      <div className="card p-6 border border-gold-500/15 bg-gold-500/3">
        <div className="flex gap-3 items-start">
          <BookOpen size={20} className="text-gold-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display font-bold text-white mb-1">Présentation générale</h2>
            <p className="text-sm text-white/60 leading-relaxed">
              L'Application Mutuelle est un outil complet de gestion des cotisations pour une mutuelle de solidarité.
              Elle permet un suivi en temps réel de chaque membre, automatise tous les calculs et offre une vue
              synthétique via un tableau de bord interactif.
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div>
        <h2 className="font-display font-bold text-white mb-4">Guide pas à pas</h2>
        <div className="space-y-3">
          {ETAPES.map(e => (
            <div key={e.n} className="card p-4 border border-white/5 flex gap-4">
              <div className="w-8 h-8 rounded-xl bg-gold-500/15 text-gold-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {e.n}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{e.title}</p>
                <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div>
        <h2 className="font-display font-bold text-white mb-4">Fonctionnalités détaillées</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SECTIONS.map(s => (
            <div key={s.title} className={`card p-5 border ${colorMap[s.color]}`}>
              <div className="flex items-center gap-2 mb-3">
                <s.icon size={16} />
                <h3 className="font-display font-bold text-white text-sm">{s.title}</h3>
              </div>
              <p className="text-xs text-white/50 mb-3">{s.desc}</p>
              <ul className="space-y-1.5">
                {s.items.map((item, i) => (
                  <li key={i} className="text-xs text-white/60 flex gap-2">
                    <span className="text-white/20 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Formules */}
      <div>
        <h2 className="font-display font-bold text-white mb-4">Formules clés</h2>
        <div className="card overflow-hidden border border-white/5">
          {FORMULES.map((f, i) => (
            <div key={i} className={`px-5 py-4 ${i < FORMULES.length - 1 ? 'border-b border-white/5' : ''}`}>
              <p className="text-xs font-semibold text-gold-400 mb-1">{f.label}</p>
              <code className="text-xs font-mono text-white/70 bg-navy-900/60 px-3 py-1.5 rounded-lg block mb-1">
                {f.code}
              </code>
              <p className="text-xs text-white/35">{f.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bonnes pratiques */}
      <div>
        <h2 className="font-display font-bold text-white mb-4">Bonnes pratiques</h2>
        <div className="card p-5 border border-emerald-500/15 space-y-3">
          {BONNES_PRATIQUES.map((bp, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/65">{bp}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="card p-4 border border-white/5 flex items-center gap-3">
        <Code size={16} className="text-white/30" />
        <p className="text-xs text-white/30">
          Application Mutuelle de Solidarité v1.0 — Backend Laravel · Frontend React + Vite · Recharts
        </p>
      </div>
    </div>
  )
}
