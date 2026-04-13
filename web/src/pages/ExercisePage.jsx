import { useState, useMemo } from 'react'
import { ChevronRight, Flame, Zap, Clock, Target, Search, TrendingUp } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import ReadinessRing from '../components/ReadinessRing'
import StatPill from '../components/StatPill'
import ExerciseDetails from '../components/ExerciseDetails'
import { useApp } from '../store/AppContext'
import { EXERCISES } from '../data/exercises'
import { getExerciseLogs, recommendProgression } from '../engine/fitness'

const exerciseCategories = ['All', 'compound', 'isolation', 'bodyweight', 'conditioning', 'sport']

const getExerciseIcon = (ex) => {
  if (ex.category === 'bodyweight') return '🤸'
  if (ex.category === 'conditioning') return '🏃'
  if (ex.targetMuscle === 'chest') return '😤'
  if (ex.targetMuscle === 'back') return '🦍'
  if (ex.targetMuscle === 'quads' || ex.targetMuscle === 'hamstrings') return '🦵'
  if (ex.targetMuscle === 'calves') return '🦶'
  if (ex.targetMuscle === 'shoulders') return '🙌'
  if (ex.targetMuscle === 'biceps' || ex.targetMuscle === 'triceps') return '💪'
  return '🏋️'
}

export default function ExercisePage() {
  const { state, metrics, savedPlans } = useApp()
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeExerciseId, setActiveExerciseId] = useState(null)

  const profile = state.profile
  const activePlan = savedPlans.find(p => p.id === state.activePlanId) || savedPlans[0]

  const mappedExercises = useMemo(() => {
    if (!profile || !metrics) return []
    const filtered = activeCategory === 'All' ? EXERCISES : EXERCISES.filter(e => e.category === activeCategory)

    return filtered.map(ex => {
      const logs = getExerciseLogs(state.workoutLogs, ex.id)
      const latestLog = logs[0]
      const prog = recommendProgression(profile, metrics, ex, state.workoutLogs)

      let lastWeight = 'No history'
      let setsRepStr = '—'
      if (latestLog && latestLog.sets.length > 0) {
        const topSet = [...latestLog.sets].sort((a, b) =>
          b.weightKg === a.weightKg ? b.reps - a.reps : b.weightKg - a.weightKg
        )[0]
        lastWeight = ex.category === 'bodyweight' && topSet.weightKg === 0 ? 'BW' : `${topSet.weightKg}kg`
        setsRepStr = `${latestLog.sets.length}×${topSet.reps}`
      }

      const trend =
        prog.incrementKg > 0 ? `+${prog.incrementKg}kg` :
        prog.incrementKg < 0 ? `${prog.incrementKg}kg` : 'Hold'

      return { id: ex.id, name: ex.name, muscle: ex.targetMuscle, lastWeight, trend, sets: setsRepStr, icon: getExerciseIcon(ex) }
    })
  }, [activeCategory, state.workoutLogs, profile, metrics])

  if (!profile || !metrics) return null

  // Detail view overlay
  if (activeExerciseId) {
    return (
      <ExerciseDetails
        exerciseId={activeExerciseId}
        onBack={() => setActiveExerciseId(null)}
      />
    )
  }

  return (
    <div className="px-5 pt-14 space-y-5 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-semibold text-accent tracking-widest uppercase">FITOS</span>
          </div>
          <h1 className="text-[26px] font-bold leading-tight text-white">
            Readiness-first<br />training intelligence.
          </h1>
          <p className="text-sm text-white/40 mt-2">
            {metrics.consistencyRank > 80 ? 'Elite' : metrics.consistencyRank > 50 ? 'Strong' : 'Rookie'} · {metrics.bodyCompositionLabel} · {profile.primaryGoal}
          </p>
        </div>
        <ReadinessRing score={metrics.readinessScore} size={90} />
      </div>

      {/* Stat Row */}
      <div className="flex gap-3">
        <StatPill label="Stress" value={metrics.stressScore} color="red" />
        <StatPill label="Recovery" value={metrics.recoveryPotential} color="green" />
        <StatPill label="Load Cap" value={metrics.safeProgressionRangePct} color="yellow" unit="%" />
      </div>

      {/* Today's Session Card */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent to-accent-dim" />
          <div>
            <h3 className="text-base font-semibold text-white">Today's Session</h3>
            <p className="text-xs text-white/40">{activePlan ? activePlan.name : 'Full Body'}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full">
            <Zap size={13} />
            {metrics.trainingLoadSuitability}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.04] rounded-xl p-3 text-center">
            <Flame size={16} className="text-energy mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{metrics.totalWeightLiftedWeek}</p>
            <p className="text-[10px] text-white/40">kg/wk</p>
          </div>
          <div className="bg-white/[0.04] rounded-xl p-3 text-center">
            <Clock size={16} className="text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{metrics.totalSetsWeek}</p>
            <p className="text-[10px] text-white/40">sets/wk</p>
          </div>
          <div className="bg-white/[0.04] rounded-xl p-3 text-center">
            <Target size={16} className="text-recovery mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{activePlan ? activePlan.days.length : 0}</p>
            <p className="text-[10px] text-white/40">train days</p>
          </div>
        </div>
      </GlassCard>

      {/* Weight Memory List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            <h3 className="text-base font-semibold text-white">Weight Memory</h3>
          </div>
          <Search size={18} className="text-white/40" />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {exerciseCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:border-white/10 hover:text-white/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2.5">
          {mappedExercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setActiveExerciseId(ex.id)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-white/[0.04] to-transparent border border-white/[0.05] hover:border-white/10 active:scale-[0.99] transition-all group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg shrink-0">
                {ex.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">{ex.name}</p>
                  <span className="text-[10px] bg-white/[0.06] text-white/40 px-2 py-0.5 rounded-full capitalize shrink-0">{ex.muscle}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-white/40">{ex.lastWeight}</span>
                  <span className={`text-xs font-medium ${
                    ex.trend === 'Hold' ? 'text-white/40' :
                    ex.trend.startsWith('+') ? 'text-recovery' : 'text-stress'
                  }`}>{ex.trend}</span>
                  <span className="text-xs text-white/30">{ex.sets}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors shrink-0" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}