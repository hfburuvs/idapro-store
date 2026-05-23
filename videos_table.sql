-- Create videos table for idapro
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.videos (
  id SERIAL PRIMARY KEY,
  title TEXT,
  video_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read" ON public.videos
  FOR SELECT USING (true);

-- Allow authenticated insert/update/delete (for admin)
CREATE POLICY "Allow authenticated write" ON public.videos
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
