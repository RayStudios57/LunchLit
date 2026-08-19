-- Create student goals table for future planning (college, career, programs)
CREATE TABLE public.student_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL DEFAULT 'college', -- college, career, program, personal
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, paused
  priority TEXT DEFAULT 'medium', -- low, medium, high
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create target schools table for college planning
CREATE TABLE public.target_schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  school_name TEXT NOT NULL,
  location TEXT,
  application_deadline DATE,
  admission_type TEXT DEFAULT 'regular', -- early_decision, early_action, regular
  status TEXT DEFAULT 'researching', -- researching, applying, applied, accepted, rejected, waitlisted, enrolled
  notes TEXT,
  is_reach BOOLEAN DEFAULT false,
  is_safety BOOLEAN DEFAULT false,
  is_match BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.student_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.target_schools ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_goals
CREATE POLICY "Users can view their own goals" ON public.student_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.student_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.student_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.student_goals FOR DELETE USING (auth.uid() = user_id);

-- Teachers/counselors can view goals for their school students (read only)
CREATE POLICY "Verifiers can view student goals" ON public.student_goals FOR SELECT USING (
  is_verifier(auth.uid()) AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = student_goals.user_id 
    AND p.school_id = get_verifier_school_id(auth.uid())
  )
);

-- RLS policies for target_schools
CREATE POLICY "Users can view their own target schools" ON public.target_schools FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own target schools" ON public.target_schools FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own target schools" ON public.target_schools FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own target schools" ON public.target_schools FOR DELETE USING (auth.uid() = user_id);

-- Teachers/counselors can view target schools for their school students (read only)
CREATE POLICY "Verifiers can view student target schools" ON public.target_schools FOR SELECT USING (
  is_verifier(auth.uid()) AND EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = target_schools.user_id 
    AND p.school_id = get_verifier_school_id(auth.uid())
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_student_goals_updated_at
  BEFORE UPDATE ON public.student_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_target_schools_updated_at
  BEFORE UPDATE ON public.target_schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();