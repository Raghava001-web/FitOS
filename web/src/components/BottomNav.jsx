import { Dumbbell, Play, TrendingUp, User } from 'lucide-react'

const tabs = [
  { id: 'exercise', label: 'Exercise', icon: Dumbbell },
  { id: 'shorts', label: 'Shorts', icon: Play },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/95 to-transparent pointer-events-none" />
      <div className="relative flex items-center justify-around px-4 py-3 pb-5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-accent scale-105' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <div className={`relative p-2 rounded-2xl transition-all duration-300 ${
                isActive ? 'bg-accent/10' : ''
              }`}>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-accent/5 blur-md" />
                )}
              </div>
              <span className={`text-[11px] font-medium tracking-wide transition-all ${
                isActive ? 'text-accent' : ''
              }`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}