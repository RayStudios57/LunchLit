-- Create study_halls table for real-time tracking
CREATE TABLE public.study_halls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id),
  name text NOT NULL,
  location text NOT NULL,
  teacher text,
  capacity integer NOT NULL DEFAULT 30,
  current_occupancy integer NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  periods text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on study_halls
ALTER TABLE public.study_halls ENABLE ROW LEVEL SECURITY;

-- Everyone can view study halls
CREATE POLICY "Everyone can view study halls"
ON public.study_halls FOR SELECT
USING (true);

-- Admins can manage study halls
CREATE POLICY "Admins can manage study halls"
ON public.study_halls FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Teachers can update occupancy
CREATE POLICY "Teachers can update study hall occupancy"
ON public.study_halls FOR UPDATE
USING (has_role(auth.uid(), 'teacher'::app_role));

-- Enable realtime for study_halls
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_halls;

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  new_menu_items boolean NOT NULL DEFAULT true,
  study_hall_availability boolean NOT NULL DEFAULT true,
  grade_progression boolean NOT NULL DEFAULT true,
  discussion_replies boolean NOT NULL DEFAULT true,
  task_reminders boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view their own notification preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own notification preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own notification preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_notification_preferences_user_id ON public.notification_preferences(user_id);

-- Add check constraints to menu_uploads for security
ALTER TABLE public.menu_uploads ADD CONSTRAINT menu_uploads_school_email_check 
CHECK (school_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add size limit check via trigger for upload_data
CREATE OR REPLACE FUNCTION check_upload_data_size()
RETURNS TRIGGER AS $$
BEGIN
  IF length(NEW.upload_data::text) > 500000 THEN
    RAISE EXCEPTION 'Upload data exceeds maximum size of 500KB';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_menu_upload_size
BEFORE INSERT OR UPDATE ON public.menu_uploads
FOR EACH ROW EXECUTE FUNCTION check_upload_data_size();

-- Add updated_at trigger for study_halls
CREATE TRIGGER update_study_halls_updated_at
BEFORE UPDATE ON public.study_halls
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();