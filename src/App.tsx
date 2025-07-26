import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import LandingPage from './components/LandingPage'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'
import { Toaster } from './components/ui/toaster'

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'dashboard'>('landing')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // If user is authenticated, show dashboard
      if (state.user && !state.isLoading) {
        setCurrentPage('dashboard')
      } else if (!state.user && !state.isLoading) {
        setCurrentPage('landing')
      }
    })
    
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage 
          onNavigateToAuth={() => setCurrentPage('auth')}
          onNavigateToDashboard={() => setCurrentPage('dashboard')} 
        />
      )}
      {currentPage === 'auth' && (
        <AuthPage onBack={() => setCurrentPage('landing')} />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard 
          user={user} 
          onNavigateToLanding={() => setCurrentPage('landing')} 
        />
      )}
      <Toaster />
    </>
  )
}

export default App