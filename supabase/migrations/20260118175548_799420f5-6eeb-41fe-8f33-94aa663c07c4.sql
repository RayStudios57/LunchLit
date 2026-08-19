-- Add new columns to brag_sheet_entries for the comprehensive template
-- Academics section
ALTER TABLE public.brag_sheet_entries 
ADD COLUMN IF NOT EXISTS gpa_weighted DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS gpa_unweighted DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS test_scores JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS courses_taken JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS colleges_applying_to TEXT[];

-- Activities section enhancements  
ALTER TABLE public.brag_sheet_entries
ADD COLUMN IF NOT EXISTS position_role TEXT,
ADD COLUMN IF NOT EXISTS grades_participated TEXT[];

-- Awards section enhancements
ALTER TABLE public.brag_sheet_entries
ADD COLUMN IF NOT EXISTS year_received TEXT;

-- Create brag_sheet_insights table for insight questions
CREATE TABLE IF NOT EXISTS public.brag_sheet_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_key TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_key)
);

-- Enable RLS on brag_sheet_insights
ALTER TABLE public.brag_sheet_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for brag_sheet_insights
CREATE POLICY "Users can view their own insights"
ON public.brag_sheet_insights FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights"
ON public.brag_sheet_insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
ON public.brag_sheet_insights FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
ON public.brag_sheet_insights FOR DELETE
USING (auth.uid() = user_id);

-- Create brag_sheet_academics table for per-user academic info
CREATE TABLE IF NOT EXISTS public.brag_sheet_academics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  gpa_weighted DECIMAL(4,2),
  gpa_unweighted DECIMAL(4,2),
  test_scores JSONB DEFAULT '[]'::jsonb,
  courses JSONB DEFAULT '[]'::jsonb,
  colleges_applying TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brag_sheet_academics ENABLE ROW LEVEL SECURITY;

-- RLS policies for brag_sheet_academics
CREATE POLICY "Users can view their own academics"
ON public.brag_sheet_academics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own academics"
ON public.brag_sheet_academics FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own academics"
ON public.brag_sheet_academics FOR UPDATE
USING (auth.uid() = user_id);

-- Fix notification INSERT policy - restrict to admin or service role
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;

CREATE POLICY "Admins or system can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id OR is_admin(auth.uid()));