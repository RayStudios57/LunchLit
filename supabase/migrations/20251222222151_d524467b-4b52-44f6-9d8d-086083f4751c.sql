-- Add field to track last grade progression
ALTER TABLE public.profiles 
ADD COLUMN last_grade_progression TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add a graduated flag for students who complete Senior year
ALTER TABLE public.profiles 
ADD COLUMN is_graduated BOOLEAN DEFAULT false;