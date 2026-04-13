export default function GlassCard({ children, className = '', glow = '' }) {
  return (
    <div className={`
      relative rounded-2xl p-4
      bg-gradient-to-br from-white/[0.06] to-white/[0.02]
      border border-white/[0.06]
      backdrop-blur-xl
      ${glow}
      ${className}
    `}>
      {children}
    </div>
  )
}