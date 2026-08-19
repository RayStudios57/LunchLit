-- Add icon and priority fields to custom_roles
ALTER TABLE public.custom_roles 
ADD COLUMN IF NOT EXISTS icon text DEFAULT 'shield',
ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;