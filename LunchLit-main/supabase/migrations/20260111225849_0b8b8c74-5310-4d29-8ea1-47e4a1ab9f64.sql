-- Create audit log table for role changes and admin actions
CREATE TABLE public.role_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL, -- 'role_added', 'role_removed', 'role_updated', 'permission_changed', 'bulk_assignment'
  performed_by uuid NOT NULL,
  target_user_id uuid,
  target_role_id uuid,
  custom_role_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.role_audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs (via authenticated users with admin role)
CREATE POLICY "Admins can insert audit logs"
ON public.role_audit_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_audit_logs_created_at ON public.role_audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action_type ON public.role_audit_logs(action_type);
CREATE INDEX idx_audit_logs_target_user ON public.role_audit_logs(target_user_id);

-- Add highest_role_icon to cache user's display role in discussions (for performance)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_role_icon text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS display_role_color text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS display_role_priority integer DEFAULT 0;