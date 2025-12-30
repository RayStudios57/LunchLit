-- Create user roles enum and table for role-based access
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'counselor', 'student');

-- Create user roles table (following security best practices)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  email_domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to check if user is a verifier (teacher or counselor)
CREATE OR REPLACE FUNCTION public.is_verifier(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('teacher', 'counselor')
  )
$$;

-- Security definer function to get verifier's school_id
CREATE OR REPLACE FUNCTION public.get_verifier_school_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id 
  FROM public.user_roles 
  WHERE user_id = _user_id 
    AND role IN ('teacher', 'counselor')
  LIMIT 1
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create menu_uploads table for school menu submissions
CREATE TABLE public.menu_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  school_email TEXT NOT NULL,
  upload_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on menu_uploads
ALTER TABLE public.menu_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for menu_uploads
CREATE POLICY "Anyone can submit menu uploads"
ON public.menu_uploads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all menu uploads"
ON public.menu_uploads
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update menu uploads"
ON public.menu_uploads
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Update brag_sheet_entries RLS to allow verifiers to view entries from their school
CREATE POLICY "Verifiers can view entries from their school"
ON public.brag_sheet_entries
FOR SELECT
USING (
  public.is_verifier(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = brag_sheet_entries.user_id 
    AND p.school_id = public.get_verifier_school_id(auth.uid())
  )
);

-- Allow verifiers to update verification status
CREATE POLICY "Verifiers can verify entries from their school"
ON public.brag_sheet_entries
FOR UPDATE
USING (
  public.is_verifier(auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = brag_sheet_entries.user_id 
    AND p.school_id = public.get_verifier_school_id(auth.uid())
  )
);

-- Add trigger for menu_uploads updated_at
CREATE TRIGGER update_menu_uploads_updated_at
BEFORE UPDATE ON public.menu_uploads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();