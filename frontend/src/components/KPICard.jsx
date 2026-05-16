export default function KPICard({ title, value, sub, icon: Icon, color = 'gold', trend }) {
  const colors = {
    gold:  { ring: 'border-gold-500/20',  icon: 'bg-gold-500/15  text-gold-400',  glow: 'shadow-gold-500/10'  },
    green: { ring: 'border-emerald-500/20', icon: 'bg-emerald-500/15 text-emerald-400', glow: 'shadow-emerald-500/10' },
    red:   { ring: 'border-red-500/20',   icon: 'bg-red-500/15   text-red-400',   glow: 'shadow-red-500/10'   },
    blue:  { ring: 'border-blue-500/20',  icon: 'bg-blue-500/15  text-blue-400',  glow: 'shadow-blue-500/10'  },
    purple:{ ring: 'border-purple-500/20',icon: 'bg-purple-500/15 text-purple-400',glow: 'shadow-purple-500/10'},
    teal:  { ring: 'border-teal-500/20',  icon: 'bg-teal-500/15  text-teal-400',  glow: 'shadow-teal-500/10'  },
    orange:{ ring: 'border-orange-500/20',icon: 'bg-orange-500/15 text-orange-400',glow: 'shadow-orange-500/10'},
    cyan:  { ring: 'border-cyan-500/20',  icon: 'bg-cyan-500/15  text-cyan-400',  glow: 'shadow-cyan-500/10'  },
  }
  const c = colors[color] ?? colors.gold

  return (
    <div className={`card p-5 border ${c.ring} shadow-lg ${c.glow} hover:scale-[1.02] transition-transform duration-200 cursor-default`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2 truncate">{title}</p>
          <p className="font-display font-bold text-2xl text-white leading-tight truncate">{value ?? '—'}</p>
          {sub && <p className="text-xs text-white/40 mt-1 truncate">{sub}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3 ${c.icon}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  )
}
