import React, { useState } from 'react'
import { Music } from 'lucide-react'
import { Header } from './Header'
import { UploadZone } from './UploadZone'
import { TrackList } from './TrackList'

export function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ajouter de la musique
              </h2>
              <p className="text-gray-600">
                Uploadez vos fichiers audio dans votre bibliothèque personnelle
              </p>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <UploadZone onUploadComplete={handleUploadComplete} />
            </div>
          </div>

          {/* Library Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ma bibliothèque
              </h2>
              <p className="text-gray-600">
                Gérez et écoutez vos musiques uploadées
              </p>
            </div>
            
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-xl">
              <TrackList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total des pistes</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <Music className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Espace utilisé</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Uploads ce mois</p>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}