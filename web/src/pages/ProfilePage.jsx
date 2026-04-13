import { useState } from 'react'
import { Settings, ChevronRight, ChevronLeft, Award, FileText, Bell, Moon, HelpCircle, LogOut, Edit3, Shield, Star, Save, X } from 'lucide-react'
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

const goalOptions = ['fat loss', 'lean body', 'bulking', 'strength gain', 'bodybuilding', 'Olympic-style fitness', 'sports-based fitness']
const stressOptions = ['low', 'moderate', 'high']
const activityOptions = ['low', 'moderate', 'high']
const recoveryOptions = ['poor', 'average', 'good']
const foodOptions = ['vegetarian', 'non-vegetarian', 'eggetarian', 'Indian', 'salad-based', 'high-protein', 'fat-loss', 'muscle-gain']

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-400 transition-colors capitalize appearance-none cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt} value={opt} className="bg-gray-900 capitalize">{opt}</option>
        ))}
      </select>
    </div>
  )
}

function NumberField({ label, value, onChange, min, max, step, unit }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step || 1}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-xl p-3 text-sm text-white font-medium outline-none focus:border-cyan-400 transition-colors"
        />
        {unit && <span className="text-xs text-white/30 shrink-0">{unit}</span>}
      </div>
    </div>
  )
}

function SliderField({ label, value, onChange, min, max, step, labels }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] text-white/40 uppercase tracking-wider">{label}</label>
        <span className="text-xs font-bold text-white">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step || 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/[0.1] accent-cyan-400 cursor-pointer"
      />
      {labels && (
        <div className="flex justify-between mt-1">
          {labels.map((l, i) => <span key={i} className="text-[9px] text-white/25">{l}</span>)}
        </div>
      )}
    </div>
  )
}

function ProfileEditor({ profile, onSave, onCancel }) {
  const [draft, setDraft] = useState({ ...profile })

  const update = (key, val) => setDraft(prev => ({ ...prev, [key]: val }))

  return (
    <div className="px-5 pt-14 pb-24 space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors">
          <ChevronLeft size={18} />
          <span className="text-sm">Cancel</span>
        </button>
        <h1 className="text-lg font-bold text-white">Edit Profile</h1>
        <button
          onClick={() => onSave(draft)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400 text-gray-900 text-xs font-bold hover:bg-cyan-300 transition-all"
        >
          <Save size={14} />
          Save
        </button>
      </div>

      {/* Identity */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-4">Identity</h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Name</label>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Email</label>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => update('email', e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl p-3 text-sm text-white outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>
      </GlassCard>

      {/* Body Stats — these directly affect the engine */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-1">Body Stats</h3>
        <p className="text-[10px] text-white/30 mb-4">These values directly drive the progression engine.</p>
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Weight" value={draft.weightKg} onChange={(v) => update('weightKg', v)} min={30} max={250} unit="kg" />
          <NumberField label="Height" value={draft.heightCm} onChange={(v) => update('heightCm', v)} min={100} max={250} unit="cm" />
          <NumberField label="Body Fat" value={draft.bodyFatPct} onChange={(v) => update('bodyFatPct', v)} min={3} max={50} unit="%" />
          <NumberField label="Train Days/wk" value={draft.trainingDaysPerWeek} onChange={(v) => update('trainingDaysPerWeek', v)} min={1} max={7} unit="days" />
        </div>
      </GlassCard>

      {/* Recovery & Stress — these drive readiness */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-1">Recovery & Stress</h3>
        <p className="text-[10px] text-white/30 mb-4">These control your readiness score and safe progression range.</p>
        <div className="space-y-5">
          <SliderField label="Sleep Hours" value={draft.sleepHours} onChange={(v) => update('sleepHours', v)} min={3} max={12} step={0.5} labels={['3h', '6h', '9h', '12h']} />
          <SliderField label="Sleep Quality" value={draft.sleepQuality} onChange={(v) => update('sleepQuality', v)} min={1} max={5} labels={['Poor', 'Fair', 'OK', 'Good', 'Great']} />
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Work hrs/day" value={draft.workHoursPerDay} onChange={(v) => update('workHoursPerDay', v)} min={0} max={16} unit="hrs" />
            <NumberField label="Work days/wk" value={draft.workDaysPerWeek} onChange={(v) => update('workDaysPerWeek', v)} min={0} max={7} unit="days" />
          </div>
          <SelectField label="Lifestyle Stress" value={draft.lifestyleStress} options={stressOptions} onChange={(v) => update('lifestyleStress', v)} />
          <SelectField label="Activity Level" value={draft.activityLevel} options={activityOptions} onChange={(v) => update('activityLevel', v)} />
          <SelectField label="Recovery Consistency" value={draft.recoveryConsistency} options={recoveryOptions} onChange={(v) => update('recoveryConsistency', v)} />
        </div>
      </GlassCard>

      {/* Goals & Diet */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-4">Goals & Diet</h3>
        <div className="space-y-4">
          <SelectField label="Primary Goal" value={draft.primaryGoal} options={goalOptions} onChange={(v) => update('primaryGoal', v)} />
          <SelectField label="Food Preference" value={draft.foodPreference} options={foodOptions} onChange={(v) => update('foodPreference', v)} />
        </div>
      </GlassCard>

      {/* Save button at bottom */}
      <button
        onClick={() => onSave(draft)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-cyan-400 text-gray-900 font-bold text-sm hover:bg-cyan-300 active:scale-[0.98] transition-all"
      >
        <Save size={18} />
        Save Profile
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const { state, metrics, rank, savedPlans, updateProfile } = useApp()
  const [editing, setEditing] = useState(false)
  const profile = state.profile
  const activePlan = savedPlans.find(p => p.id === state.activePlanId) || savedPlans[0]

  if (!profile || !metrics) return null

  if (editing) {
    return (
      <ProfileEditor
        profile={profile}
        onSave={(updated) => { updateProfile(updated); setEditing(false); }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="px-5 pt-14 space-y-5 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <button
          onClick={() => setEditing(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-semibold hover:bg-accent/20 transition-all"
        >
          <Edit3 size={14} />
          Edit
        </button>
      </div>

      {/* Profile Card */}
      <GlassCard>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{profile.name[0]?.toUpperCase()}</span>
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

      {/* Quick Stats */}
      <GlassCard>
        <h3 className="text-sm font-semibold text-white mb-3">Your Numbers</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Weight', value: profile.weightKg + ' kg' },
            { label: 'Height', value: profile.heightCm + ' cm' },
            { label: 'Body Fat', value: profile.bodyFatPct + '%' },
            { label: 'Sleep', value: profile.sleepHours + 'h · Q' + profile.sleepQuality },
            { label: 'Stress', value: profile.lifestyleStress },
            { label: 'Recovery', value: profile.recoveryConsistency },
          ].map((stat, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-white/[0.04] text-center">
              <p className="text-[10px] text-white/40 mb-0.5">{stat.label}</p>
              <p className="text-xs font-semibold text-white capitalize">{stat.value}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Saved Plan */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-energy to-amber-600" />
          <div>
            <h3 className="text-base font-semibold text-white">Active Plan</h3>
            <p className="text-xs text-white/40">Split, food style, and direction.</p>
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
          <div className="p-3 rounded-xl bg-white/[0.04] text-center">
            <p className="text-[10px] text-white/40 mb-1">Goal</p>
            <p className="text-sm font-semibold text-white capitalize leading-tight">{profile.primaryGoal}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.04] text-center">
            <p className="text-[10px] text-white/40 mb-1">Food</p>
            <p className="text-sm font-semibold text-white capitalize leading-tight">{profile.foodPreference}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.04] text-center">
            <p className="text-[10px] text-white/40 mb-1">Reminders</p>
            <p className="text-sm font-semibold text-white capitalize leading-tight">{profile.reminderMode === "notifications" ? "On" : "Off"}</p>
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