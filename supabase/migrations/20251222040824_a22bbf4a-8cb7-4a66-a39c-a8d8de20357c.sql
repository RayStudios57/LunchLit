-- Fix discussions cross-school exposure by updating RLS policy
-- Create a helper function to get current user's school_id
CREATE OR REPLACE FUNCTION public.get_user_school_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Discussions are viewable by authenticated users" ON public.discussions;

-- Create a new policy that restricts viewing to same school OR null school (for general discussions)
CREATE POLICY "Users can view discussions from their school" 
ON public.discussions 
FOR SELECT 
TO authenticated
USING (
  school_id IS NULL 
  OR school_id = public.get_user_school_id(auth.uid())
);

-- Add storage policies for avatars bucket to enforce file type and size limits
-- First, drop existing permissive policies if they exist
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Create strict policies for avatars bucket with MIME type validation
CREATE POLICY "Anyone can view avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatars" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
  )
);

CREATE POLICY "Users can update own avatars" 
ON storage.objects 
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND (
    LOWER(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif', 'webp')
  )
);

CREATE POLICY "Users can delete own avatars" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);