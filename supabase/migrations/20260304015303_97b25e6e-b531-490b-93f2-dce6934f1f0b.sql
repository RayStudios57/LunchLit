
-- Add profile visibility column
ALTER TABLE public.profiles ADD COLUMN is_public boolean DEFAULT false;

-- Create tutors table
CREATE TABLE public.tutors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  availability text,
  rating numeric DEFAULT 5.0,
  is_online boolean DEFAULT false,
  contact_info text,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

-- Everyone can view tutors
CREATE POLICY "Everyone can view tutors" ON public.tutors FOR SELECT USING (true);

-- Authenticated users can add tutors
CREATE POLICY "Authenticated users can add tutors" ON public.tutors FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Users can update their own tutors
CREATE POLICY "Users can update own tutors" ON public.tutors FOR UPDATE 
USING (auth.uid() = created_by);

-- Users can delete their own tutors, admins can delete any
CREATE POLICY "Users can delete own tutors" ON public.tutors FOR DELETE 
USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_tutors_updated_at
BEFORE UPDATE ON public.tutors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
