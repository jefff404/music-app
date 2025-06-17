import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Track {
  id: string
  title: string
  artist: string
  genre?: string
  duration?: number
  file_url: string
  file_name: string
  file_size: number
  user_id: string
  created_at: string
  updated_at: string
}