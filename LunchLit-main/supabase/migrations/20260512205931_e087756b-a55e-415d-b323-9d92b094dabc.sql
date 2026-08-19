
-- Change the default so new profiles start as public
ALTER TABLE public.profiles ALTER COLUMN is_public SET DEFAULT true;

-- Update all existing profiles to be public
UPDATE public.profiles SET is_public = true WHERE is_public = false OR is_public IS NULL;
