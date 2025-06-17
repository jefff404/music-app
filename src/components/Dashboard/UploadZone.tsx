import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Music, X, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

interface UploadZoneProps {
  onUploadComplete?: () => void
}

interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const { user } = useAuth()

  const uploadFile = async (file: File) => {
    if (!user) return

    const uploadId = Date.now().toString()
    const fileName = `${uploadId}_${file.name}`
    
    // Add to uploads list
    setUploads(prev => [...prev, {
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }])

    try {
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('music')
        .upload(`tracks/${user.id}/${fileName}`, file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100
            setUploads(prev => prev.map(upload => 
              upload.fileName === file.name 
                ? { ...upload, progress: percent }
                : upload
            ))
          }
        })

      if (uploadError) throw uploadError

      // Get file URL
      const { data: urlData } = supabase.storage
        .from('music')
        .getPublicUrl(`tracks/${user.id}/${fileName}`)

      // Get audio metadata
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const arrayBuffer = await file.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      const duration = audioBuffer.duration

      // Save track metadata to database
      const { error: dbError } = await supabase
        .from('tracks')
        .insert({
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          artist: 'Unknown Artist',
          file_url: urlData.publicUrl,
          file_name: fileName,
          file_size: file.size,
          duration: Math.round(duration),
          user_id: user.id
        })

      if (dbError) throw dbError

      // Mark as completed
      setUploads(prev => prev.map(upload => 
        upload.fileName === file.name 
          ? { ...upload, status: 'completed', progress: 100 }
          : upload
      ))

      onUploadComplete?.()

    } catch (error: any) {
      console.error('Upload error:', error)
      setUploads(prev => prev.map(upload => 
        upload.fileName === file.name 
          ? { ...upload, status: 'error', error: error.message }
          : upload
      ))
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(uploadFile)
  }, [user])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.aac']
    },
    multiple: true
  })

  const removeUpload = (fileName: string) => {
    setUploads(prev => prev.filter(upload => upload.fileName !== fileName))
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50/50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragActive ? 'Déposez vos fichiers ici' : 'Uploadez vos musiques'}
          </h3>
          
          <p className="text-gray-500 mb-4">
            Glissez-déposez vos fichiers audio ou cliquez pour sélectionner
          </p>
          
          <div className="text-sm text-gray-400">
            Formats supportés: MP3, WAV, FLAC, M4A, AAC
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Uploads en cours</h4>
          
          {uploads.map((upload, index) => (
            <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Music className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {upload.fileName}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {upload.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {upload.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  
                  <button
                    onClick={() => removeUpload(upload.fileName)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {upload.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              )}
              
              {upload.status === 'error' && upload.error && (
                <p className="text-sm text-red-600 mt-1">{upload.error}</p>
              )}
              
              {upload.status === 'completed' && (
                <p className="text-sm text-green-600 mt-1">Upload terminé</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}