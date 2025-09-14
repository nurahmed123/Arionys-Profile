-- Create profiles table with proper RLS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  theme TEXT DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Allow public read access to profiles for public profile pages
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- Create profile_blocks table
CREATE TABLE IF NOT EXISTS public.profile_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profile_blocks
ALTER TABLE public.profile_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile_blocks
CREATE POLICY "blocks_select_own" ON public.profile_blocks
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE auth.uid() = id
    )
  );

CREATE POLICY "blocks_insert_own" ON public.profile_blocks
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM public.profiles WHERE auth.uid() = id
    )
  );

CREATE POLICY "blocks_update_own" ON public.profile_blocks
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE auth.uid() = id
    )
  );

CREATE POLICY "blocks_delete_own" ON public.profile_blocks
  FOR DELETE USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE auth.uid() = id
    )
  );

-- Allow public read access to visible blocks for public profile pages
CREATE POLICY "blocks_select_public" ON public.profile_blocks
  FOR SELECT USING (is_visible = true);

-- Create trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'username', 'user_' || substr(NEW.id::text, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profile_blocks_updated_at
  BEFORE UPDATE ON public.profile_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
