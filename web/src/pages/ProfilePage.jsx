import { Settings, ChevronRight, Award, FileText, Bell, Moon, HelpCircle, LogOut, Edit3, Shield, Star } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import StatPill from '../components/StatPill'
import { useApp } from '../store/AppContext'

const menuItems = [
  { icon: FileText, label: 'Medical Notes', desc: 'Health records & history', color: 'text-blue-400' },
  { icon: Award, label: 'Achievements', desc: 'Badges and unlocked milestones', color: 'text-energy' },
  { icon: Star, label: 'Progress Report', desc: 'Shareable progress card', color: 'text-accent' },
  { icon: Bell, label: 'Notifications', desc: 'Reminders & alerts', color: 'text-recovery' },
  { icon: Moon, label: 'Appearance', desc: 'Dark mode enabled', color: 'text-purple-400' },
  { icon: HelpCircle, label: 'Help & FAQ', desc: 'Get support', color: 'text-white/50' },
]

export default function ProfilePage() {
  const { state, metrics, rank, savedPlans } = useApp()
  const profile = state.profile
  const activePlan = savedPlans.find(p => p.id === state.activePlanId) || savedPlans[0]
  
  if (!profile || !metrics) return null;

  return (
    <div className="px-5 pt-14 space-y-5 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <button className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06] hover:border-white/10 transition-all">
          <Settings size={18} className="text-white/50" />
        </button>
      </div>

      {/* Profile Card */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent to-accent-dim" />
          <div>
            <p className="text-xs text-white/40">Personal details, goals, medical notes, achievements, reports, and your shareable progress card.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{profile.name[0]?.toUpperCase()}</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <Edit3 size={11} className="text-dark-900" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{profile.name}</h2>
            <p className="text-xs text-white/40 mt-0.5">{profile.email} · goal: {profile.primaryGoal}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <StatPill label="Rank" value={rank} color="cyan" />
          <StatPill label="BMI" value={metrics.bmi} color="yellow" />
          <StatPill label="Readiness" value={metrics.readinessScore} color="green" />
        </div>
      </GlassCard>

      {/* Saved Plan */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-energy to-amber-600" />
          <div>
            <h3 className="text-base font-semibold text-white">Saved plan + goal history</h3>
            <p className="text-xs text-white/40">Active split, current food style, and plan direction.</p>
          </div>
        </div>

        {activePlan && (
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.05] mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-accent" />
              <h4 className="text-sm font-semibold text-white">{activePlan.name}</h4>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">{activePlan.rationale}</p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {activePlan.days.map((tag, i) => (
                <span key={i} className="text-[10px] font-medium text-white/50 bg-white/[0.06] px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.04] text-center flex flex-col justify-between">
            <p className="text-[10px] text-white/40 mb-1">Goal now</p>
            <p className="text-sm font-semibold text-white capitalize line-clamp-2 leading-tight">{profile.primaryGoal}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.04] text-center flex flex-col justify-between">
            <p className="text-[10px] text-white/40 mb-1">Food style</p>
            <p className="text-sm font-semibold text-white capitalize line-clamp-2 leading-tight">{profile.foodPreference}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.04] text-center flex flex-col justify-between">
            <p className="text-[10px] text-white/40 mb-1">Reminders</p>
            <p className="text-sm font-semibold text-white capitalize line-clamp-2 leading-tight">{profile.reminderMode === "notifications" ? "on" : "off"}</p>
          </div>
        </div>
      </GlassCard>

      {/* Menu Items */}
      <div className="space-y-1.5">
        {menuItems.map((item, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-white/[0.03] transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
              <item.icon size={18} className={item.color} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-white/35">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-white/15 group-hover:text-white/30 transition-colors" />
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <button className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-red-500/10 hover:bg-red-500/5 transition-all text-red-400/70 hover:text-red-400">
        <LogOut size={16} />
        <span className="text-sm font-medium">Sign Out</span>
      </button>

      <div className="h-8" />
    </div>
  )
}