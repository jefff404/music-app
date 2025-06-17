import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Download, Trash2, Music, Clock, User } from 'lucide-react'
import { supabase, Track } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface TrackListProps {
  refreshTrigger?: number
}

export function TrackList({ refreshTrigger }: TrackListProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { user } = useAuth()

  const loadTracks = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTracks(data || [])
    } catch (error) {
      console.error('Error loading tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTracks()
  }, [user, refreshTrigger])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const playTrack = (track: Track) => {
    if (audioRef.current) {
      if (currentTrack === track.id && isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.src = track.file_url
        audioRef.current.play()
        setCurrentTrack(track.id)
        setIsPlaying(true)
      }
    }
  }

  const deleteTrack = async (track: Track) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette piste ?')) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('music')
        .remove([`tracks/${user?.id}/${track.file_name}`])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('tracks')
        .delete()
        .eq('id', track.id)

      if (dbError) throw dbError

      // Remove from local state
      setTracks(prev => prev.filter(t => t.id !== track.id))
      
      // Stop playing if this track was playing
      if (currentTrack === track.id) {
        setCurrentTrack(null)
        setIsPlaying(false)
        if (audioRef.current) {
          audioRef.current.pause()
        }
      }
    } catch (error) {
      console.error('Error deleting track:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const downloadTrack = (track: Track) => {
    const link = document.createElement('a')
    link.href = track.file_url
    link.download = track.title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune musique</h3>
        <p className="text-gray-500">Commencez par uploader vos premiers fichiers audio</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Ma bibliothèque ({tracks.length} piste{tracks.length > 1 ? 's' : ''})
      </h3>

      <div className="grid gap-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className={`bg-white rounded-xl p-4 border transition-all hover:shadow-md ${
              currentTrack === track.id ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* Play Button */}
                <button
                  onClick={() => playTrack(track)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    currentTrack === track.id && isPlaying
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {currentTrack === track.id && isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{track.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {track.artist}
                    </div>
                    {track.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDuration(track.duration)}
                      </div>
                    )}
                    <span>{formatFileSize(track.file_size)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => downloadTrack(track)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => deleteTrack(track)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTrack(null)
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  )
}