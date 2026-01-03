-- 1. Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Create discussion_categories table for custom categories
CREATE TABLE public.discussion_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    color text DEFAULT '#6366f1',
    icon text DEFAULT 'message-square',
    school_id uuid REFERENCES public.schools(id),
    created_by uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.discussion_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view categories"
ON public.discussion_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.discussion_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Add pin_discussion capability for admins - create a function
CREATE OR REPLACE FUNCTION public.toggle_discussion_pin(_discussion_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF has_role(auth.uid(), 'admin') THEN
    UPDATE public.discussions 
    SET is_pinned = NOT is_pinned 
    WHERE id = _discussion_id;
  END IF;
END;
$$;

-- 4. Create meal_dietary_tags table for admin-configurable dietary options
CREATE TABLE public.meal_dietary_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    color text DEFAULT '#10b981',
    icon text,
    school_id uuid REFERENCES public.schools(id),
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_dietary_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view dietary tags"
ON public.meal_dietary_tags
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage dietary tags"
ON public.meal_dietary_tags
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. Add is_club and show_every_day columns to class_schedules
ALTER TABLE public.class_schedules 
ADD COLUMN IF NOT EXISTS is_club boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_every_day boolean DEFAULT false;

-- 6. Allow admins to insert schools
DROP POLICY IF EXISTS "Only admins can modify schools" ON public.schools;

CREATE POLICY "Admins can insert schools"
ON public.schools
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update schools"
ON public.schools
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete schools"
ON public.schools
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Allow admins to manage meal_schedules
DROP POLICY IF EXISTS "Deny all inserts on meal_schedules" ON public.meal_schedules;
DROP POLICY IF EXISTS "Deny all updates on meal_schedules" ON public.meal_schedules;
DROP POLICY IF EXISTS "Deny all deletes on meal_schedules" ON public.meal_schedules;

CREATE POLICY "Admins can insert meal schedules"
ON public.meal_schedules
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update meal schedules"
ON public.meal_schedules
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete meal schedules"
ON public.meal_schedules
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));