/*
  # Create tracks table and storage setup

  1. New Tables
    - `tracks`
      - `id` (uuid, primary key)
      - `title` (text, track title)
      - `artist` (text, artist name with default)
      - `genre` (text, optional genre)
      - `duration` (integer, duration in seconds)
      - `file_url` (text, public URL to the audio file)
      - `file_name` (text, stored filename)
      - `file_size` (bigint, file size in bytes)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `tracks` table
    - Add policies for authenticated users to manage their own tracks
    - Users can SELECT, INSERT, UPDATE, DELETE their own tracks only

  3. Storage
    - Instructions for creating 'music' storage bucket
    - RLS policies needed for file operations
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the tracks table
CREATE TABLE IF NOT EXISTS public.tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT DEFAULT 'Unknown Artist' NOT NULL,
  genre TEXT,
  duration INTEGER, -- Duration in seconds
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tracks table
CREATE POLICY "Users can view their own tracks" 
  ON public.tracks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracks" 
  ON public.tracks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks" 
  ON public.tracks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks" 
  ON public.tracks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS tracks_user_id_idx ON public.tracks(user_id);
CREATE INDEX IF NOT EXISTS tracks_created_at_idx ON public.tracks(created_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_tracks_updated_at ON public.tracks;
CREATE TRIGGER handle_tracks_updated_at
  BEFORE UPDATE ON public.tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();