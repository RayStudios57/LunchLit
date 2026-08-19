-- Create enum for brag sheet entry categories
CREATE TYPE public.brag_category AS ENUM (
  'volunteering',
  'job',
  'award',
  'internship',
  'leadership',
  'club',
  'extracurricular',
  'academic',
  'other'
);

-- Create enum for verification status (for future use)
CREATE TYPE public.verification_status AS ENUM (
  'pending',
  'verified',
  'rejected'
);

-- Create brag_sheet_entries table
CREATE TABLE public.brag_sheet_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category brag_category NOT NULL DEFAULT 'other',
  description TEXT,
  impact TEXT,
  start_date DATE,
  end_date DATE,
  is_ongoing BOOLEAN DEFAULT false,
  grade_level TEXT NOT NULL,
  school_year TEXT NOT NULL,
  hours_spent INTEGER,
  -- Future verification fields
  verification_status verification_status DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  -- Auto-suggestion tracking
  suggested_from_task_id UUID,
  is_auto_suggested BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brag_sheet_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own brag sheet entries"
ON public.brag_sheet_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own brag sheet entries"
ON public.brag_sheet_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brag sheet entries"
ON public.brag_sheet_entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brag sheet entries"
ON public.brag_sheet_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_brag_sheet_entries_updated_at
BEFORE UPDATE ON public.brag_sheet_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient queries by user and grade level
CREATE INDEX idx_brag_sheet_user_grade ON public.brag_sheet_entries(user_id, grade_level);
CREATE INDEX idx_brag_sheet_user_year ON public.brag_sheet_entries(user_id, school_year);