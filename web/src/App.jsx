import { AppProvider, useApp } from './store/AppContext'
import BottomNav from './components/BottomNav'
import ExercisePage from './pages/ExercisePage'
import ShortsPage from './pages/ShortsPage'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'
import OnboardingPage from './pages/OnboardingPage'

function AppContent() {
  const { state, setTab, completeOnboarding } = useApp()
  const tab = state.tab

  if (!state.hydrated) {
    return <div className="h-full flex items-center justify-center bg-dark-950 text-white font-mono">Loading...</div>
  }

  // Show onboarding when no profile exists
  if (!state.profile) {
    return (
      <div className="h-full flex flex-col bg-dark-950 max-w-[430px] mx-auto relative overflow-hidden">
        <OnboardingPage onComplete={completeOnboarding} />
      </div>
    )
  }

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
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}