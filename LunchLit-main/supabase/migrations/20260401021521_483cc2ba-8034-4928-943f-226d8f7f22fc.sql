
DROP POLICY IF EXISTS "Authenticated users can submit their own menu uploads" ON public.menu_uploads;
CREATE POLICY "Authenticated users can submit their own menu uploads"
  ON public.menu_uploads FOR INSERT TO authenticated
  WITH CHECK (true);
