-- Create table for creator social links (editable by owner only)
CREATE TABLE public.creator_social_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_social_links ENABLE ROW LEVEL SECURITY;

-- Anyone can view social links
CREATE POLICY "Anyone can view creator social links"
ON public.creator_social_links
FOR SELECT
USING (true);

-- Only owner can manage social links (using email check)
CREATE POLICY "Only owner can insert social links"
ON public.creator_social_links
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'kutturam0912@gmail.com'
  )
);

CREATE POLICY "Only owner can update social links"
ON public.creator_social_links
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'kutturam0912@gmail.com'
  )
);

CREATE POLICY "Only owner can delete social links"
ON public.creator_social_links
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'kutturam0912@gmail.com'
  )
);

-- Create table for user suggestions
CREATE TABLE public.user_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'feature',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can view all suggestions
CREATE POLICY "Anyone can view suggestions"
ON public.user_suggestions
FOR SELECT
USING (true);

-- Authenticated users can submit suggestions
CREATE POLICY "Authenticated users can submit suggestions"
ON public.user_suggestions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own suggestions
CREATE POLICY "Users can update own suggestions"
ON public.user_suggestions
FOR UPDATE
USING (auth.uid() = user_id);

-- Insert default social links
INSERT INTO public.creator_social_links (platform, url, icon, display_order) VALUES
('email', 'mailto:kutturam0912@gmail.com', 'Mail', 1),
('github', 'https://github.com/ramakrishnakrishna', 'Github', 2),
('linkedin', 'https://linkedin.com/in/ramakrishnakrishna', 'Linkedin', 3);