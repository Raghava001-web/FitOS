const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'web');

const files = {
  'package.json': `{
  "name": "fitos",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@tailwindcss/vite": "^4.2.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "lucide-react": "^1.8.0",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.4"
  }
}`,

  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>FITOS</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,

  'vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 8081,
    allowedHosts: true,
  },
})`,

  'src/main.jsx': `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`,

  'src/index.css': `@import "tailwindcss";

@theme {
  --color-dark-950: #060a14;
  --color-dark-900: #0a0e1a;
  --color-dark-800: #111827;
  --color-dark-700: #1a2236;
  --color-dark-600: #243049;
  --color-dark-500: #2d3a54;
  --color-accent: #22d3ee;
  --color-accent-dim: #0e7490;
  --color-energy: #facc15;
  --color-recovery: #4ade80;
  --color-stress: #f87171;
  --color-brand: #22d3ee;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html, body, #root {
  height: 100%;
  background: var(--color-dark-950);
  color: white;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
}

::-webkit-scrollbar { width: 0; height: 0; }`,

  'src/App.jsx': `import { useState } from 'react'
import BottomNav from './components/BottomNav'
import ExercisePage from './pages/ExercisePage'
import ShortsPage from './pages/ShortsPage'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  const [tab, setTab] = useState('exercise')

  return (
    <div className="h-full flex flex-col bg-dark-950 max-w-[430px] mx-auto relative overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
        {tab === 'exercise' && <ExercisePage />}
        {tab === 'shorts' && <ShortsPage />}
        {tab === 'progress' && <ProgressPage />}
        {tab === 'profile' && <ProfilePage />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}`,

  'src/components/GlassCard.jsx': `export default function GlassCard({ children, className = '', glow = '' }) {
  return (
    <div className={\`
      relative rounded-2xl p-4
      bg-gradient-to-br from-white/[0.06] to-white/[0.02]
      border border-white/[0.06]
      backdrop-blur-xl
      \${glow}
      \${className}
    \`}>
      {children}
    </div>
  )
}`,

  'src/components/ReadinessRing.jsx': `export default function ReadinessRing({ score = 60, size = 100 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#facc15' : '#f87171'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={\`\${color}40\`} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{ filter: 'blur(6px)', transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold tracking-tight" style={{ color }}>{score}</span>
      </div>
    </div>
  )
}`,

  'src/components/StatPill.jsx': `export default function StatPill({ label, value, color = 'cyan', unit = '' }) {
  const colors = {
    cyan: { dot: 'bg-accent', text: 'text-accent', border: 'border-accent/20', bg: 'bg-accent/5' },
    green: { dot: 'bg-recovery', text: 'text-recovery', border: 'border-recovery/20', bg: 'bg-recovery/5' },
    yellow: { dot: 'bg-energy', text: 'text-energy', border: 'border-energy/20', bg: 'bg-energy/5' },
    red: { dot: 'bg-stress', text: 'text-stress', border: 'border-stress/20', bg: 'bg-stress/5' },
  }
  const c = colors[color] || colors.cyan

  return (
    <div className={\`flex-1 rounded-2xl border \${c.border} \${c.bg} p-3\`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={\`w-1.5 h-1.5 rounded-full \${c.dot}\`} />
        <span className="text-[11px] font-medium text-white/50 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={\`text-xl font-bold \${c.text}\`}>{value}</span>
        {unit && <span className="text-xs text-white/30">{unit}</span>}
      </div>
    </div>
  )
}`,

  'src/components/BottomNav.jsx': `import { Dumbbell, Play, TrendingUp, User } from 'lucide-react'

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
              className={\`flex flex-col items-center gap-1 transition-all duration-300 \${
                isActive ? 'text-accent scale-105' : 'text-white/40 hover:text-white/60'
              }\`}
            >
              <div className={\`relative p-2 rounded-2xl transition-all duration-300 \${
                isActive ? 'bg-accent/10' : ''
              }\`}>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-accent/5 blur-md" />
                )}
              </div>
              <span className={\`text-[11px] font-medium tracking-wide transition-all \${
                isActive ? 'text-accent' : ''
              }\`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}`,

  'src/pages/ExercisePage.jsx': `import { useState } from 'react'
import { ChevronRight, Flame, Zap, Clock, Target, Search, TrendingUp, Dumbbell, Heart } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import ReadinessRing from '../components/ReadinessRing'
import StatPill from '../components/StatPill'

const exerciseCategories = ['All', 'Push', 'Pull', 'Legs', 'Core', 'Cardio']

const exercises = [
  { name: 'Bench Press', muscle: 'Chest', lastWeight: '80kg', trend: '+2.5kg', sets: '4×8', icon: '🏋️' },
  { name: 'Barbell Squat', muscle: 'Quads', lastWeight: '100kg', trend: '+5kg', sets: '4×6', icon: '🦵' },
  { name: 'Deadlift', muscle: 'Back', lastWeight: '120kg', trend: '+5kg', sets: '3×5', icon: '💪' },
  { name: 'Overhead Press', muscle: 'Shoulders', lastWeight: '50kg', trend: '+2.5kg', sets: '4×8', icon: '🙌' },
  { name: 'Pull-ups', muscle: 'Lats', lastWeight: 'BW+10kg', trend: '+2kg', sets: '4×10', icon: '🧗' },
  { name: 'Romanian DL', muscle: 'Hamstrings', lastWeight: '90kg', trend: '+5kg', sets: '3×10', icon: '🔥' },
]

export default function ExercisePage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchOpen, setSearchOpen] = useState(false)

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
          <p className="text-sm text-white/40 mt-2">Rank Rookie · Average profile · lean body</p>
        </div>
        <ReadinessRing score={60} size={90} />
      </div>

      {/* Stat Row */}
      <div className="flex gap-3">
        <StatPill label="Stress" value={43} color="red" />
        <StatPill label="Recovery" value={83} color="green" />
        <StatPill label="Progress" value="5%" color="yellow" />
      </div>

      {/* Today's Session Card */}
      <GlassCard className="overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent to-accent-dim" />
          <div>
            <h3 className="text-base font-semibold text-white">Today's Session</h3>
            <p className="text-xs text-white/40">Full Body + Skill Work</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 bg-accent/10 text-accent text-xs font-medium px-3 py-1.5 rounded-full">
            <Zap size={13} />
            Ready
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/[0.04] rounded-xl p-3 text-center">
            <Flame size={16} className="text-energy mx-auto mb-1" />
            <p className="text-lg font-bold text-white">420</p>
            <p className="text-[10px] text-white/40">est. kcal</p>
          </div>
          <div className="bg-white/[0.04] rounded-xl p-3 text-center">
            <Clock size={16} className="text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-white">55</p>
            <p className="text-[10px] text-white/40">minutes</p>
          </div>
          <div className="bg-white/[0.04] rounded-xl p-3 text-center">
            <Target size={16} className="text-recovery mx-auto mb-1" />
            <p className="text-lg font-bold text-white">6</p>
            <p className="text-[10px] text-white/40">exercises</p>
          </div>
        </div>
        <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-accent to-cyan-400 text-dark-900 font-semibold text-sm transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] active:scale-[0.98]">
          Start Workout
        </button>
      </GlassCard>

      {/* Weight Memory */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            <h3 className="text-base font-semibold text-white">Weight Memory</h3>
          </div>
          <button onClick={() => setSearchOpen(!searchOpen)}>
            <Search size={18} className="text-white/40 hover:text-white/70 transition-colors" />
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          {exerciseCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={\`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 \${
                activeCategory === cat
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:border-white/10 hover:text-white/70'
              }\`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exercise Cards */}
        <div className="space-y-2.5">
          {exercises.map((ex, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-white/[0.04] to-transparent border border-white/[0.05] hover:border-white/10 transition-all group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg">
                {ex.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">{ex.name}</p>
                  <span className="text-[10px] bg-white/[0.06] text-white/40 px-2 py-0.5 rounded-full">{ex.muscle}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-white/40">{ex.lastWeight}</span>
                  <span className="text-xs text-recovery font-medium">{ex.trend}</span>
                  <span className="text-xs text-white/30">{ex.sets}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}`,

  'src/pages/ShortsPage.jsx': `import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, Play, Volume2, VolumeX, ChevronUp, ChevronDown, Verified } from 'lucide-react'

const shorts = [
  {
    id: 1,
    user: 'Mike Thurston',
    handle: '@mikethurston',
    verified: true,
    avatar: '💪',
    caption: 'The only chest exercise you need for mass 🔥',
    likes: '24.5K',
    comments: '1.2K',
    shares: '890',
    gradient: 'from-rose-900/40 via-dark-900 to-dark-950',
    tag: 'Chest',
    duration: '0:45',
  },
  {
    id: 2,
    user: 'Jeff Nippard',
    handle: '@jeffnippard',
    verified: true,
    avatar: '🧠',
    caption: 'Science-based leg day routine for growth',
    likes: '18.2K',
    comments: '956',
    shares: '1.1K',
    gradient: 'from-blue-900/40 via-dark-900 to-dark-950',
    tag: 'Legs',
    duration: '1:02',
  },
  {
    id: 3,
    user: 'Natacha Océane',
    handle: '@natachaoceane',
    verified: true,
    avatar: '🔥',
    caption: 'No-equipment full body HIIT workout',
    likes: '32.1K',
    comments: '2.4K',
    shares: '3.2K',
    gradient: 'from-amber-900/40 via-dark-900 to-dark-950',
    tag: 'HIIT',
    duration: '0:58',
  },
]

export default function ShortsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [liked, setLiked] = useState({})
  const [saved, setSaved] = useState({})
  const [muted, setMuted] = useState(false)
  const short = shorts[currentIndex]

  const next = () => setCurrentIndex(i => Math.min(i + 1, shorts.length - 1))
  const prev = () => setCurrentIndex(i => Math.max(i - 1, 0))

  return (
    <div className="h-full relative animate-[fadeIn_0.4s_ease-out]">
      {/* Background gradient */}
      <div className={\`absolute inset-0 bg-gradient-to-b \${short.gradient} transition-all duration-700\`} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-4">
        <h2 className="text-lg font-bold text-white">Shorts</h2>
        <button onClick={() => setMuted(!muted)} className="text-white/50 hover:text-white/80 transition-colors">
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      {/* Content area */}
      <div className="relative z-10 flex flex-col items-center justify-center px-5" style={{ height: 'calc(100% - 220px)' }}>
        {/* Fake video placeholder */}
        <div className="w-full aspect-[9/12] max-h-[400px] rounded-3xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-dark-950/80" />
          <div className="text-7xl opacity-30">{short.avatar}</div>
          <button className="absolute inset-0 flex items-center justify-center group">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
              <Play size={28} className="text-white ml-1" fill="white" />
            </div>
          </button>
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {short.duration}
          </div>
          <div className="absolute top-4 left-4 bg-accent/20 backdrop-blur-sm text-accent text-xs font-semibold px-3 py-1 rounded-full">
            {short.tag}
          </div>
        </div>

        {/* User info */}
        <div className="w-full mt-5">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">
              {short.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white">{short.user}</span>
                {short.verified && <Verified size={14} className="text-accent" fill="rgba(34,211,238,0.2)" />}
              </div>
              <span className="text-xs text-white/35">{short.handle}</span>
            </div>
            <button className="ml-auto text-xs font-semibold text-accent border border-accent/30 px-4 py-1.5 rounded-full hover:bg-accent/10 transition-all">
              Follow
            </button>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{short.caption}</p>
        </div>
      </div>

      {/* Action buttons - right side */}
      <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-5">
        <button
          onClick={() => setLiked(l => ({ ...l, [short.id]: !l[short.id] }))}
          className="flex flex-col items-center gap-1 group"
        >
          <div className={\`p-2.5 rounded-full transition-all \${liked[short.id] ? 'bg-red-500/20' : 'bg-white/[0.06] group-hover:bg-white/10'}\`}>
            <Heart
              size={22}
              className={\`transition-all \${liked[short.id] ? 'text-red-500 fill-red-500 scale-110' : 'text-white/70'}\`}
            />
          </div>
          <span className="text-[11px] text-white/50">{short.likes}</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2.5 rounded-full bg-white/[0.06] group-hover:bg-white/10 transition-all">
            <MessageCircle size={22} className="text-white/70" />
          </div>
          <span className="text-[11px] text-white/50">{short.comments}</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2.5 rounded-full bg-white/[0.06] group-hover:bg-white/10 transition-all">
            <Share2 size={22} className="text-white/70" />
          </div>
          <span className="text-[11px] text-white/50">{short.shares}</span>
        </button>
        <button
          onClick={() => setSaved(s => ({ ...s, [short.id]: !s[short.id] }))}
          className="group"
        >
          <div className={\`p-2.5 rounded-full transition-all \${saved[short.id] ? 'bg-accent/20' : 'bg-white/[0.06] group-hover:bg-white/10'}\`}>
            <Bookmark
              size={22}
              className={\`transition-all \${saved[short.id] ? 'text-accent fill-accent' : 'text-white/70'}\`}
            />
          </div>
        </button>
      </div>

      {/* Navigation arrows */}
      <div className="absolute left-4 bottom-32 z-20 flex flex-col gap-2">
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className="p-2 rounded-full bg-white/[0.06] hover:bg-white/10 transition-all disabled:opacity-20"
        >
          <ChevronUp size={18} className="text-white/70" />
        </button>
        <button
          onClick={next}
          disabled={currentIndex === shorts.length - 1}
          className="p-2 rounded-full bg-white/[0.06] hover:bg-white/10 transition-all disabled:opacity-20"
        >
          <ChevronDown size={18} className="text-white/70" />
        </button>
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {shorts.map((_, i) => (
          <div
            key={i}
            className={\`h-1 rounded-full transition-all duration-300 \${
              i === currentIndex ? 'w-6 bg-accent' : 'w-1.5 bg-white/20'
            }\`}
          />
        ))}
      </div>
    </div>
  )
}`,

  'src/pages/ProgressPage.jsx': `import { useState } from 'react'
import { TrendingUp, Droplets, Flame, Apple, Target, Calendar, ChevronRight, Plus } from 'lucide-react'
import GlassCard from '../components/GlassCard'

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const weekData = [85, 60, 90, 45, 70, 0, 0]
const todayIndex = 4 // Friday

const meals = [
  { time: '8:00 AM', name: 'Oatmeal + Protein', cals: 420, protein: 35, emoji: '🥣' },
  { time: '12:30 PM', name: 'Chicken & Rice Bowl', cals: 650, protein: 48, emoji: '🍗' },
  { time: '3:00 PM', name: 'Protein Shake', cals: 180, protein: 30, emoji: '🥤' },
  { time: '7:00 PM', name: 'Salmon & Veggies', cals: 520, protein: 42, emoji: '🐟' },
]

const macros = [
  { name: 'Protein', current: 155, target: 180, unit: 'g', color: 'bg-accent' },
  { name: 'Carbs', current: 220, target: 280, unit: 'g', color: 'bg-energy' },
  { name: 'Fats', current: 55, target: 70, unit: 'g', color: 'bg-rose-400' },
]

export default function ProgressPage() {
  return (
    <div className="px-5 pt-14 space-y-5 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Progress</h1>
          <p className="text-sm text-white/40 mt-0.5">Friday, April 12</p>
        </div>
        <button className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06] hover:border-white/10 transition-all">
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
            <p className="text-xl font-bold text-white">1,770</p>
            <p className="text-[10px] text-white/40">calories</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.04]">
            <Droplets size={18} className="text-blue-400 mx-auto mb-1.5" />
            <p className="text-xl font-bold text-white">2.4L</p>
            <p className="text-[10px] text-white/40">water</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-white/[0.04]">
            <Target size={18} className="text-recovery mx-auto mb-1.5" />
            <p className="text-xl font-bold text-white">155g</p>
            <p className="text-[10px] text-white/40">protein</p>
          </div>
        </div>
      </GlassCard>

      {/* Week Activity */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-recovery to-green-700" />
          <h3 className="text-base font-semibold text-white">Week Activity</h3>
          <span className="ml-auto text-xs text-white/30">5/7 days</span>
        </div>
        <div className="flex items-end justify-between gap-2 h-24 px-1">
          {weekDays.map((day, i) => {
            const height = weekData[i]
            const isToday = i === todayIndex
            const isFuture = i > todayIndex
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full h-20 flex items-end">
                  <div
                    className={\`w-full rounded-lg transition-all duration-500 \${
                      isFuture ? 'bg-white/[0.04]' :
                      isToday ? 'bg-gradient-to-t from-accent to-cyan-300' :
                      height >= 70 ? 'bg-gradient-to-t from-recovery/60 to-recovery/30' :
                      height >= 40 ? 'bg-gradient-to-t from-energy/60 to-energy/30' :
                      'bg-white/[0.08]'
                    }\`}
                    style={{ height: \`\${isFuture ? 20 : Math.max(height, 8)}%\` }}
                  />
                </div>
                <span className={\`text-[11px] font-medium \${
                  isToday ? 'text-accent' : isFuture ? 'text-white/20' : 'text-white/40'
                }\`}>{day}</span>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Macros */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-accent to-accent-dim" />
          <h3 className="text-base font-semibold text-white">Macros</h3>
        </div>
        <div className="space-y-4">
          {macros.map((macro, i) => {
            const pct = Math.round((macro.current / macro.target) * 100)
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white/70">{macro.name}</span>
                  <span className="text-xs text-white/40">{macro.current}/{macro.target}{macro.unit}</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={\`h-full rounded-full \${macro.color} transition-all duration-1000\`}
                    style={{ width: \`\${Math.min(pct, 100)}%\` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </GlassCard>

      {/* Food Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Apple size={16} className="text-recovery" />
            <h3 className="text-base font-semibold text-white">Food Log</h3>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-medium text-accent bg-accent/10 px-3 py-1.5 rounded-full hover:bg-accent/20 transition-all">
            <Plus size={14} />
            Add Meal
          </button>
        </div>
        <div className="space-y-2.5">
          {meals.map((meal, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-white/[0.04] to-transparent border border-white/[0.05] hover:border-white/10 transition-all group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.06] flex items-center justify-center text-lg">
                {meal.emoji}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{meal.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-white/40">{meal.time}</span>
                  <span className="text-xs text-energy">{meal.cals} kcal</span>
                  <span className="text-xs text-accent">{meal.protein}g protein</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      <div className="h-8" />
    </div>
  )
}`,

  'src/pages/ProfilePage.jsx': `import { Settings, ChevronRight, Award, FileText, Bell, Moon, HelpCircle, LogOut, Edit3, Shield, Star } from 'lucide-react'
import GlassCard from '../components/GlassCard'
import ReadinessRing from '../components/ReadinessRing'
import StatPill from '../components/StatPill'

const menuItems = [
  { icon: FileText, label: 'Medical Notes', desc: 'Health records & history', color: 'text-blue-400' },
  { icon: Award, label: 'Achievements', desc: '12 badges earned', color: 'text-energy' },
  { icon: Star, label: 'Progress Report', desc: 'Shareable progress card', color: 'text-accent' },
  { icon: Bell, label: 'Notifications', desc: 'Reminders & alerts', color: 'text-recovery' },
  { icon: Moon, label: 'Appearance', desc: 'Dark mode enabled', color: 'text-purple-400' },
  { icon: HelpCircle, label: 'Help & FAQ', desc: 'Get support', color: 'text-white/50' },
]

export default function ProfilePage() {
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
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
              <Edit3 size={11} className="text-dark-900" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Athlete</h2>
            <p className="text-xs text-white/40 mt-0.5">athlete@fitos.app · goal: lean body</p>
          </div>
        </div>

        <div className="flex gap-3">
          <StatPill label="Rank" value="Rookie" color="cyan" />
          <StatPill label="BMI" value="24.1" color="yellow" />
          <StatPill label="Readiness" value={60} color="green" />
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

        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.05] mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-accent" />
            <h4 className="text-sm font-semibold text-white">Full-Body + Skill</h4>
          </div>
          <p className="text-xs text-white/40 leading-relaxed">Lean physique with athletic skill slots.</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {['Full Body', 'Skill Work', 'Full Body', 'Conditioning'].map((tag, i) => (
              <span key={i} className="text-[10px] font-medium text-white/50 bg-white/[0.06] px-2.5 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.04] text-center">
            <p className="text-[10px] text-white/40 mb-1">Goal now</p>
            <p className="text-sm font-semibold text-white">lean body</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.04] text-center">
            <p className="text-[10px] text-white/40 mb-1">Food style</p>
            <p className="text-sm font-semibold text-white">high-protein</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.04] text-center">
            <p className="text-[10px] text-white/40 mb-1">Reminders</p>
            <p className="text-sm font-semibold text-white">on</p>
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
}`
};

function copyFiles() {
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(root, relativePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content);
    console.log('Created: ' + fullPath);
  }
}

copyFiles();
