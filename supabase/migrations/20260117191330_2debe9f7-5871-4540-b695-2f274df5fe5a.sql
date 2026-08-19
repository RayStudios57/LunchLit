-- Fix security issue: menu_uploads should require authentication
DROP POLICY IF EXISTS "Anyone can submit menu uploads" ON public.menu_uploads;
CREATE POLICY "Authenticated users can submit menu uploads"
  ON public.menu_uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix security issue: notifications should only allow system/admin inserts
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  );
$$;

-- Create policy allowing only admins to insert notifications for other users
CREATE POLICY "Admins can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Fix security issue: discussions with null school_id
DROP POLICY IF EXISTS "Users can view discussions from their school" ON public.discussions;
CREATE POLICY "Users can view discussions from their school"
  ON public.discussions
  FOR SELECT
  USING (
    -- Allow viewing if user has same school_id OR if discussion has no school (global discussions)
    school_id IS NULL
    OR school_id = (SELECT school_id FROM profiles WHERE user_id = auth.uid())
    OR public.is_admin(auth.uid())
  );

-- Add policy for admins to view all chat messages for safety monitoring
CREATE POLICY "Admins can view all chat messages for moderation"
  ON public.chat_messages
  FOR SELECT
  USING (public.is_admin(auth.uid()));