import { useMemo, useState } from 'react'
import { Flame, Droplets, Target, Calendar, ChevronRight, Plus, CheckCircle2, Circle, Trophy, Zap, Search, X, Apple } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import { useApp } from '../store/AppContext'
import { FOOD_LIBRARY } from '../data/mockContent'

const localDateKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

const categoryColors = {
  Gym: 'text-accent border-accent/20 bg-accent/5',
  Water: 'text-blue-400 border-blue-400/20 bg-blue-400/5',
  Tablets: 'text-rose-400 border-rose-400/20 bg-rose-400/5',
  Sleep: 'text-purple-400 border-purple-400/20 bg-purple-400/5',
  Meals: 'text-energy border-energy/20 bg-energy/5',
  Recovery: 'text-recovery border-recovery/20 bg-recovery/5',
  Custom: 'text-white/60 border-white/10 bg-white/[0.04]',
}

export default function ProgressPage() {
  const { state, dietPlan, completeHabitSlot, logFood } = useApp()
  const [foodSearchOpen, setFoodSearchOpen] = useState(false)
  const [foodQuery, setFoodQuery] = useState('')

  const todayKey = localDateKey()
  const todayTotals = state.dailyTotals[todayKey] || { calories: 0, protein: 0, carbs: 0, fats: 0 }

  const todayFood = useMemo(
    () => state.foodLogs.filter(f => f.loggedAt.startsWith(todayKey)),
    [state.foodLogs, todayKey]
  )

  const filteredFoods = useMemo(() => {
    if (!foodQuery.trim()) return FOOD_LIBRARY
    const q = foodQuery.toLowerCase()
    return FOOD_LIBRARY.filter(f => f.name.toLowerCase().includes(q) || f.tags.some(t => t.toLowerCase().includes(q)))
  }, [foodQuery])

  const macros = dietPlan
    ? [
        { name: 'Protein', current: todayTotals.protein, target: dietPlan.protein, unit: 'g', color: 'bg-accent' },
        { name: 'Carbs', current: todayTotals.carbs, target: dietPlan.carbs, unit: 'g', color: 'bg-energy' },
        { name: 'Fats', current: todayTotals.fats, target: dietPlan.fats, unit: 'g', color: 'bg-rose-400' },
      ]
    : []

  // Build week activity from workout logs
  const weekActivity = useMemo(() => {
    const days = Array(7).fill(0)
    state.workoutLogs.forEach(log => {
      const logDate = new Date(log.date)
      const dayIdx = logDate.getDay() === 0 ? 6 : logDate.getDay() - 1
      // Only count current week
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - todayIndex)
      startOfWeek.setHours(0,0,0,0)
      if (logDate >= startOfWeek) days[dayIdx] = Math.min(days[dayIdx] + 30, 100)
    })
    return days
  }, [state.workoutLogs])

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="px-5 pt-14 space-y-5 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Progress</h1>
          <p className="text-sm text-white/40 mt-0.5">{dateStr}</p>
        </div>
        <button className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06]">
          <Calendar size={18} className="text-white/50" />
        </button>
      </div>

      {/* Daily Summary */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-energy to-amber-600" />
          <h3 className="text-base font-semibold text-white">Daily Summary</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-xl bg-white/[0.04]">
            <Flame size={18} className="text-energy mx-auto mb-1.5" />
            <p className="text-xl font-bold text-white">{todayTotals.calories}</p>
            <p className="text-[10px] text-white/40">calories</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.04]">
            <Droplets size={18} className="text-blue-400 mx-auto mb-1.5" />
            <p className="text-xl font-bold text-white">{state.dailyStreak.current}</p>
            <p className="text-[10px] text-white/40">day streak</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.04]">
            <Target size={18} className="text-recovery mx-auto mb-1.5" />
            <p className="text-xl font-bold text-white">{todayTotals.protein}g</p>
            <p className="text-[10px] text-white/40">protein</p>
          </div>
        </div>
      </GlassCard>

      {/* Week Activity */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-recovery to-green-700" />
          <h3 className="text-base font-semibold text-white">Week Activity</h3>
        </div>
        <div className="flex items-end justify-between gap-2 h-20 px-1">
          {weekDays.map((day, i) => {
            const height = weekActivity[i]
            const isToday = i === todayIndex
            const isFuture = i > todayIndex
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full h-16 flex items-end">
                  <div
                    className={`w-full rounded-lg transition-all duration-700 ${
                      isFuture ? 'bg-white/[0.04]' :
                      isToday && height > 0 ? 'bg-gradient-to-t from-accent to-cyan-300' :
                      isToday ? 'bg-accent/20' :
                      height >= 60 ? 'bg-gradient-to-t from-recovery/60 to-recovery/30' :
                      height > 0 ? 'bg-gradient-to-t from-energy/60 to-energy/30' :
                      'bg-white/[0.06]'
                    }`}
                    style={{ height: `${isFuture ? 18 : Math.max(height, 10)}%` }}
                  />
                </div>
                <span className={`text-[11px] font-medium ${isToday ? 'text-accent' : isFuture ? 'text-white/20' : 'text-white/40'}`}>{day}</span>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Macros */}
      {macros.length > 0 && (
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent to-accent-dim" />
            <h3 className="text-base font-semibold text-white">Macros</h3>
            {dietPlan && (
              <span className="ml-auto text-xs text-white/30">{dietPlan.calories} kcal target</span>
            )}
          </div>
          <div className="space-y-4">
            {macros.map((macro) => {
              const pct = macro.target > 0 ? Math.round((macro.current / macro.target) * 100) : 0
              return (
                <div key={macro.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-white/70">{macro.name}</span>
                    <span className="text-xs text-white/40">{macro.current}/{macro.target}{macro.unit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${macro.color} transition-all duration-1000`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      )}

      {/* Habit Tracker */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-energy" />
            <h3 className="text-base font-semibold text-white">Daily Habits</h3>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full">
            <Plus size={14} />
            Add
          </button>
        </div>

        {state.habits.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-6">No habits yet. Tap Add to create one.</p>
        ) : (
          <div className="space-y-3">
            {state.habits.map(habit => {
              const colorClass = categoryColors[habit.category] || categoryColors.Custom
              const completedAll = habit.timeSlots.length > 0 && habit.completedSlotsToday.length >= habit.timeSlots.length

              return (
                <div
                  key={habit.id}
                  className={`p-4 rounded-2xl border transition-all ${completedAll ? 'border-recovery/30 bg-recovery/5' : 'border-white/[0.06] bg-white/[0.03]'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${colorClass}`}>
                        {habit.category}
                      </div>
                      <span className="text-sm font-semibold text-white">{habit.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {completedAll && <Trophy size={14} className="text-energy" />}
                      <span className="text-xs font-bold text-white/50">{habit.streak}🔥</span>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="flex flex-wrap gap-2">
                    {habit.timeSlots.map(slot => {
                      const done = habit.completedSlotsToday.includes(slot)
                      return (
                        <button
                          key={slot}
                          onClick={() => !done && completeHabitSlot(habit.id, slot)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            done
                              ? 'bg-recovery/15 border-recovery/30 text-recovery'
                              : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20 hover:text-white/70'
                          }`}
                        >
                          {done ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                          {slot}
                        </button>
                      )
                    })}
                  </div>

                  {/* Progress micro bar */}
                  {habit.timeSlots.length > 1 && (
                    <div className="mt-3 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-recovery transition-all duration-500"
                        style={{ width: `${(habit.completedSlotsToday.length / habit.timeSlots.length) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Food Log + Search */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Apple size={16} className="text-recovery" />
            <h3 className="text-base font-semibold text-white">Food Log</h3>
          </div>
          <button
            onClick={() => setFoodSearchOpen(!foodSearchOpen)}
            className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full hover:bg-accent/20 transition-all"
          >
            {foodSearchOpen ? <X size={14} /> : <Plus size={14} />}
            {foodSearchOpen ? 'Close' : 'Add Meal'}
          </button>
        </div>

        {/* Food search panel */}
        {foodSearchOpen && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08]">
              <Search size={14} className="text-white/30" />
              <input
                type="text"
                value={foodQuery}
                onChange={(e) => setFoodQuery(e.target.value)}
                placeholder="Search food..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-xl">
              {filteredFoods.map(food => (
                <button
                  key={food.id}
                  onClick={() => { logFood(food); setFoodSearchOpen(false); setFoodQuery(''); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-all text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{food.name}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{food.calories} kcal · {food.protein}g P · {food.carbs}g C · {food.fats}g F</p>
                  </div>
                  <Plus size={14} className="text-accent shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Today's log */}
        {todayFood.length === 0 && !foodSearchOpen ? (
          <p className="text-xs text-white/30 text-center py-4">No meals logged today.</p>
        ) : (
          <div className="space-y-2">
            {todayFood.map((meal, i) => {
              const d = new Date(meal.loggedAt)
              const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-base">🍽️</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{meal.name}</p>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-xs text-white/40">{timeStr}</span>
                      <span className="text-xs text-energy">{meal.calories} kcal</span>
                      <span className="text-xs text-accent">{meal.protein}g protein</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="h-8" />
    </div>
  )
}