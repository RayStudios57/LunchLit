-- Create custom_roles table for admin-defined roles
CREATE TABLE public.custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  color text DEFAULT '#6366f1',
  permissions jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

-- Everyone can view custom roles
CREATE POLICY "Everyone can view custom roles"
ON public.custom_roles
FOR SELECT
USING (true);

-- Only admins can manage custom roles
CREATE POLICY "Admins can manage custom roles"
ON public.custom_roles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add custom_role_id to user_roles table for custom role assignments
ALTER TABLE public.user_roles 
ADD COLUMN custom_role_id uuid REFERENCES public.custom_roles(id) ON DELETE CASCADE;

-- Add trigger for updated_at
CREATE TRIGGER update_custom_roles_updated_at
BEFORE UPDATE ON public.custom_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();