import React from 'react'
import { useAuth } from './hooks/useAuth'
import { AuthForm } from './components/Auth/AuthForm'
import { Dashboard } from './components/Dashboard/Dashboard'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return user ? <Dashboard /> : <AuthForm />
}

export default App