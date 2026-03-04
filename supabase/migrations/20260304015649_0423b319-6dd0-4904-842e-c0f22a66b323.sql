
-- Allow anyone to view public profiles
CREATE POLICY "Anyone can view public profiles" ON public.profiles
FOR SELECT USING (is_public = true);
