-- Allow admins to update any suggestion's status
CREATE POLICY "Admins can update all suggestions"
ON public.user_suggestions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
