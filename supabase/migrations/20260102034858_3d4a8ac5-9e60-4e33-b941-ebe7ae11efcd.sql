-- Create table for allowed email domains
CREATE TABLE public.allowed_email_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  auto_assign_role public.app_role NOT NULL DEFAULT 'student',
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.allowed_email_domains ENABLE ROW LEVEL SECURITY;

-- Everyone can view domains (needed for signup validation)
CREATE POLICY "Anyone can view allowed domains"
ON public.allowed_email_domains
FOR SELECT
USING (true);

-- Only admins can manage domains
CREATE POLICY "Admins can insert domains"
ON public.allowed_email_domains
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update domains"
ON public.allowed_email_domains
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete domains"
ON public.allowed_email_domains
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to check email domain and return role
CREATE OR REPLACE FUNCTION public.get_role_for_email_domain(_email text)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auto_assign_role 
  FROM public.allowed_email_domains 
  WHERE _email LIKE '%@' || domain
  LIMIT 1
$$;

-- Create function to auto-assign role on user creation based on email
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.app_role;
  _school_id uuid;
BEGIN
  -- Get role for email domain
  SELECT auto_assign_role, school_id INTO _role, _school_id
  FROM public.allowed_email_domains
  WHERE NEW.email LIKE '%@' || domain
  LIMIT 1;
  
  -- If a matching domain was found, create the role
  IF _role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, school_id, email_domain)
    VALUES (NEW.id, _role, _school_id, split_part(NEW.email, '@', 2));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign roles on signup
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();