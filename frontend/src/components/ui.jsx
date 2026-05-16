// ── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ statut, large = false }) {
  const map = {
    A_JOUR:    { label: '✓ À JOUR',    cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' },
    SURPLUS:   { label: '↑ SURPLUS',   cls: 'bg-blue-500/15   text-blue-400   border border-blue-500/25'   },
    PAS_A_JOUR:{ label: '✗ EN RETARD', cls: 'bg-red-500/15    text-red-400    border border-red-500/25'    },
  }
  const s = map[statut] ?? { label: statut, cls: 'bg-white/10 text-white/50' }
  return <span className={`status-badge ${s.cls} ${large ? 'text-sm px-4 py-2' : ''}`}>{s.label}</span>
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <svg
      className="animate-spin text-gold-500"
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ message = 'Aucune donnée', icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-white/25">
      {Icon && <Icon size={36} className="mb-3 opacity-50" />}
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay animate-fade-in" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box animate-fade-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-white text-lg">{title}</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Form field ────────────────────────────────────────────────────────────────
export function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ── Formatage FCFA ─────────────────────────────────────────────────────────────
export function fcfa(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 0 }).format(n) + ' FCFA'
}
