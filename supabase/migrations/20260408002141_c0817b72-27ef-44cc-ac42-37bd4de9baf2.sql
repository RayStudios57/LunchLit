
-- 1. Make brag-sheet-images bucket private
UPDATE storage.buckets SET public = false WHERE id = 'brag-sheet-images';

-- 2. Fix brag-sheet-images SELECT policy to be owner-scoped
DROP POLICY IF EXISTS "Users can view brag sheet images" ON storage.objects;
CREATE POLICY "Users can view own brag sheet images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'brag-sheet-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- 3. Fix menu_uploads INSERT policy to bind to user identity
DROP POLICY IF EXISTS "Authenticated users can submit their own menu uploads" ON public.menu_uploads;
CREATE POLICY "Authenticated users can submit menu uploads"
ON public.menu_uploads FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Fix user_suggestions SELECT policy - only own suggestions
DROP POLICY IF EXISTS "Anyone can view suggestions" ON public.user_suggestions;
CREATE POLICY "Users can view their own suggestions"
ON public.user_suggestions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all suggestions"
ON public.user_suggestions FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 5. Remove user self-insert on achievements (should be server-side only)
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;
