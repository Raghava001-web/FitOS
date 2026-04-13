export default function StatPill({ label, value, color = 'cyan', unit = '' }) {
  const colors = {
    cyan: { dot: 'bg-accent', text: 'text-accent', border: 'border-accent/20', bg: 'bg-accent/5' },
    green: { dot: 'bg-recovery', text: 'text-recovery', border: 'border-recovery/20', bg: 'bg-recovery/5' },
    yellow: { dot: 'bg-energy', text: 'text-energy', border: 'border-energy/20', bg: 'bg-energy/5' },
    red: { dot: 'bg-stress', text: 'text-stress', border: 'border-stress/20', bg: 'bg-stress/5' },
  }
  const c = colors[color] || colors.cyan

  return (
    <div className={`flex-1 rounded-2xl border ${c.border} ${c.bg} p-3`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-bold ${c.text}`}>{value}</span>
        {unit && <span className="text-xs text-white/30">{unit}</span>}
      </div>
    </div>
  )
}