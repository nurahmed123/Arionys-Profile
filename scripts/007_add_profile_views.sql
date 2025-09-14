-- Add profile views tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS views_count integer DEFAULT 0;

-- Create profile views table for detailed tracking
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_ip text,
  viewer_user_agent text,
  viewed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Add unique constraint to prevent duplicate views from same IP within 24 hours
  CONSTRAINT unique_daily_view UNIQUE (profile_id, viewer_ip, DATE(viewed_at))
);

-- Enable RLS for profile views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for profile views
CREATE POLICY "views_select_own"
  ON public.profile_views FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE auth.uid() = id
    )
  );

CREATE POLICY "views_insert_public"
  ON public.profile_views FOR INSERT
  WITH CHECK (true); -- Allow anyone to insert views

-- Create function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_views(profile_uuid uuid, client_ip text, user_agent text)
RETURNS void AS $$
BEGIN
  -- Insert view record (will be ignored if duplicate due to unique constraint)
  INSERT INTO public.profile_views (profile_id, viewer_ip, viewer_user_agent)
  VALUES (profile_uuid, client_ip, user_agent)
  ON CONFLICT (profile_id, viewer_ip, DATE(viewed_at)) DO NOTHING;
  
  -- Update the profile views count
  UPDATE public.profiles 
  SET views_count = (
    SELECT COUNT(DISTINCT DATE(viewed_at) || viewer_ip) 
    FROM public.profile_views 
    WHERE profile_id = profile_uuid
  )
  WHERE id = profile_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
