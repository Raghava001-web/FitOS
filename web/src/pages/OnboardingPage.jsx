import { useState } from 'react'
import { ChevronRight, ChevronLeft, Dumbbell, Moon, Target, Utensils, User, Sparkles } from 'lucide-react'

const goalOptions = ['fat loss', 'lean body', 'bulking', 'strength gain', 'bodybuilding', 'Olympic-style fitness', 'sports-based fitness']
const stressOptions = ['low', 'moderate', 'high']
const activityOptions = ['low', 'moderate', 'high']
const recoveryOptions = ['poor', 'average', 'good']
const foodOptions = ['vegetarian', 'non-vegetarian', 'eggetarian', 'Indian', 'salad-based', 'high-protein', 'fat-loss', 'muscle-gain']

const defaultProfile = {
  name: '',
  email: '',
  weightKg: 70,
  heightCm: 170,
  bodyFatPct: 18,
  sleepHours: 7,
  sleepQuality: 3,
  workHoursPerDay: 8,
  workDaysPerWeek: 5,
  lifestyleStress: 'moderate',
  medicalNotes: 'No known issues.',
  injuries: [],
  primaryGoal: 'lean body',
  followsDiet: false,
  dietNotes: '',
  supplementNames: [],
  reminderMode: 'notifications',
  trainingDaysPerWeek: 4,
  foodPreference: 'high-protein',
  activityLevel: 'moderate',
  recoveryConsistency: 'average',
}

function ChipSelect({ options, value, onChange, multi }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isActive = multi ? value.includes(opt) : value === opt
        return (
          <button
            key={opt}
            onClick={() => {
              if (multi) {
                onChange(isActive ? value.filter(v => v !== opt) : [...value, opt])
              } else {
                onChange(opt)
              }
            }}
            className={'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ' + (
              isActive
                ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-400'
                : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/15 hover:text-white/70'
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

const STEPS = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Welcome to FitOS',
    subtitle: 'Your readiness-first gym coach. Let\'s build your profile so the engine can give you real, safe recommendations.',
  },
  {
    id: 'identity',
    icon: User,
    title: 'Who are you?',
    subtitle: 'Basic info for your profile.',
  },
  {
    id: 'body',
    icon: Dumbbell,
    title: 'Body Stats',
    subtitle: 'These numbers power your BMI, calorie targets, and progression caps.',
  },
  {
    id: 'recovery',
    icon: Moon,
    title: 'Recovery & Lifestyle',
    subtitle: 'Sleep and stress directly control your readiness score.',
  },
  {
    id: 'goal',
    icon: Target,
    title: 'Your Goal',
    subtitle: 'This drives your split, diet plan, and progression pace.',
  },
  {
    id: 'diet',
    icon: Utensils,
    title: 'Food Preference',
    subtitle: 'We\'ll generate meal suggestions that match your diet.',
  },
]

export default function OnboardingPage({ onComplete }) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState({ ...defaultProfile })

  const update = (key, val) => setProfile(prev => ({ ...prev, [key]: val }))

  const currentStep = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0
  const progress = ((step + 1) / STEPS.length) * 100

  const canProceed = () => {
    if (currentStep.id === 'identity') return profile.name.trim().length > 0
    return true
  }

  const handleNext = () => {
    if (isLast) {
      onComplete(profile)
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-500 ease-out"
          style={{ width: progress + '%' }}
        />
      </div>

      <div className="flex-1 flex flex-col px-6 pt-16 pb-8">
        {/* Back button */}
        <div className="h-8 mb-6">
          {!isFirst && (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-white/40 hover:text-white transition-colors">
              <ChevronLeft size={16} />
              <span className="text-xs">Back</span>
            </button>
          )}
        </div>

        {/* Step icon + title */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-4">
            <currentStep.icon size={22} className="text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h1>
          <p className="text-sm text-white/40 leading-relaxed">{currentStep.subtitle}</p>
        </div>

        {/* Step content */}
        <div className="flex-1 space-y-5 animate-[fadeIn_0.3s_ease-out]">
          {currentStep.id === 'welcome' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-sm text-white/60 leading-relaxed">
                  FitOS tracks your workouts, remembers your weights, manages your habits, and adjusts recommendations based on your sleep, stress, and recovery.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Readiness Engine', 'Smart Progression', 'Habit Tracker'].map((feat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-center">
                    <p className="text-[10px] text-cyan-400 font-semibold">{feat}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep.id === 'identity' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Your Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl p-3.5 text-white text-sm outline-none focus:border-cyan-400 transition-colors placeholder:text-white/20"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Email (optional)</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl p-3.5 text-white text-sm outline-none focus:border-cyan-400 transition-colors placeholder:text-white/20"
                />
              </div>
            </div>
          )}

          {currentStep.id === 'body' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Weight', key: 'weightKg', min: 30, max: 250, unit: 'kg' },
                  { label: 'Height', key: 'heightCm', min: 100, max: 250, unit: 'cm' },
                  { label: 'Body Fat %', key: 'bodyFatPct', min: 3, max: 50, unit: '%' },
                  { label: 'Train Days/wk', key: 'trainingDaysPerWeek', min: 1, max: 7, unit: 'days' },
                ].map(({ label, key, min, max, unit }) => (
                  <div key={key}>
                    <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">{label}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={profile[key]}
                        min={min}
                        max={max}
                        onChange={(e) => update(key, Number(e.target.value))}
                        className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-xl p-3 text-white text-sm font-medium text-center outline-none focus:border-cyan-400 transition-colors"
                      />
                      <span className="text-xs text-white/30">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep.id === 'recovery' && (
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider">Sleep Hours</label>
                  <span className="text-sm font-bold text-white">{profile.sleepHours}h</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={12}
                  step={0.5}
                  value={profile.sleepHours}
                  onChange={(e) => update('sleepHours', Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none bg-white/[0.1] accent-cyan-400"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-white/25">3h</span>
                  <span className="text-[9px] text-white/25">12h</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Lifestyle Stress</label>
                <ChipSelect options={stressOptions} value={profile.lifestyleStress} onChange={(v) => update('lifestyleStress', v)} />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Activity Level</label>
                <ChipSelect options={activityOptions} value={profile.activityLevel} onChange={(v) => update('activityLevel', v)} />
              </div>
              <div>
                <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Recovery Consistency</label>
                <ChipSelect options={recoveryOptions} value={profile.recoveryConsistency} onChange={(v) => update('recoveryConsistency', v)} />
              </div>
            </div>
          )}

          {currentStep.id === 'goal' && (
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-3">What are you training for?</label>
              <ChipSelect options={goalOptions} value={profile.primaryGoal} onChange={(v) => update('primaryGoal', v)} />
            </div>
          )}

          {currentStep.id === 'diet' && (
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-3">What do you eat?</label>
              <ChipSelect options={foodOptions} value={profile.foodPreference} onChange={(v) => update('foodPreference', v)} />
            </div>
          )}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-cyan-400 text-gray-900 font-bold text-sm transition-all hover:bg-cyan-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed mt-8"
        >
          {isLast ? 'Start Training' : 'Continue'}
          {!isLast && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  )
}
