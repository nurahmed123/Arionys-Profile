-- Create subscriptions table for email collection
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscriber_email TEXT NOT NULL,
    subscriber_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    source TEXT DEFAULT 'profile_block', -- track where subscription came from
    UNIQUE(profile_id, subscriber_email)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_profile_id ON public.subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON public.subscriptions(subscriber_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON public.subscriptions(created_at);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid()::text = (SELECT auth.uid()::text FROM public.profiles WHERE profiles.id = subscriptions.profile_id));

CREATE POLICY "Users can insert subscriptions to their profiles" ON public.subscriptions
    FOR INSERT WITH CHECK (auth.uid()::text = (SELECT auth.uid()::text FROM public.profiles WHERE profiles.id = subscriptions.profile_id));

CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid()::text = (SELECT auth.uid()::text FROM public.profiles WHERE profiles.id = subscriptions.profile_id));

CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions
    FOR DELETE USING (auth.uid()::text = (SELECT auth.uid()::text FROM public.profiles WHERE profiles.id = subscriptions.profile_id));

-- Allow anonymous users to subscribe (insert only)
CREATE POLICY "Anonymous users can subscribe" ON public.subscriptions
    FOR INSERT WITH CHECK (true);
