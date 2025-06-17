import React from 'react'
import { Music, LogOut, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mr-3">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">MusicVault</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}