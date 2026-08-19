-- Add restrictive RLS policies to meal_schedules table to prevent unauthorized modifications
-- Currently only has SELECT policy, need to block INSERT/UPDATE/DELETE

CREATE POLICY "Deny all inserts on meal_schedules" 
ON public.meal_schedules 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Deny all updates on meal_schedules" 
ON public.meal_schedules 
FOR UPDATE 
USING (false);

CREATE POLICY "Deny all deletes on meal_schedules" 
ON public.meal_schedules 
FOR DELETE 
USING (false);