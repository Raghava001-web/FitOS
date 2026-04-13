import { useState } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, Play, Volume2, VolumeX, ChevronUp, ChevronDown, Verified } from 'lucide-react'

import { SHORTS_FEED } from '../data/mockContent'

// We map SHORTS_FEED to include some mock social data for the UI
const shorts = SHORTS_FEED.map((short, i) => ({
  id: short.id,
  user: short.athlete,
  handle: '@' + short.athlete.toLowerCase().replace(/[^a-z]/g, ''),
  verified: true,
  avatar: ['💪', '🧠', '🔥'][i % 3],
  caption: short.caption,
  likes: Math.floor(Math.random() * 30 + 10) + 'K',
  comments: Math.floor(Math.random() * 3 + 1) + 'K',
  shares: Math.floor(Math.random() * 2000 + 500),
  gradient: ['from-rose-900/40 via-dark-900 to-dark-950', 'from-blue-900/40 via-dark-900 to-dark-950', 'from-amber-900/40 via-dark-900 to-dark-950'][i % 3],
  tag: short.tags[0],
  duration: short.duration,
}))

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
      <div className={`absolute inset-0 bg-gradient-to-b ${short.gradient} transition-all duration-700`} />

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
          <div className={`p-2.5 rounded-full transition-all ${liked[short.id] ? 'bg-red-500/20' : 'bg-white/[0.06] group-hover:bg-white/10'}`}>
            <Heart
              size={22}
              className={`transition-all ${liked[short.id] ? 'text-red-500 fill-red-500 scale-110' : 'text-white/70'}`}
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
          <div className={`p-2.5 rounded-full transition-all ${saved[short.id] ? 'bg-accent/20' : 'bg-white/[0.06] group-hover:bg-white/10'}`}>
            <Bookmark
              size={22}
              className={`transition-all ${saved[short.id] ? 'text-accent fill-accent' : 'text-white/70'}`}
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
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-6 bg-accent' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}