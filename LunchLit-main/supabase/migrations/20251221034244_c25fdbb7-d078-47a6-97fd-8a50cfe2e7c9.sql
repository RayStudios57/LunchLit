-- Add grade_level to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS grade_level text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme text DEFAULT 'default';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS calendar_sync_enabled boolean DEFAULT false;

-- Create schools table
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schools are viewable by everyone"
  ON public.schools FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify schools"
  ON public.schools FOR ALL
  USING (false);

-- Create meal_schedules table
CREATE TABLE public.meal_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  meal_date date NOT NULL,
  meal_type text NOT NULL DEFAULT 'lunch',
  menu_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meal schedules are viewable by everyone"
  ON public.meal_schedules FOR SELECT
  USING (true);

-- Update profiles to reference school
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id);

-- Create user_preferences table for theme and settings
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  theme text DEFAULT 'default',
  color_mode text DEFAULT 'system',
  calendar_sync_enabled boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Create discussions table
CREATE TABLE public.discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  school_id uuid REFERENCES public.schools(id),
  title text,
  content text NOT NULL,
  parent_id uuid REFERENCES public.discussions(id) ON DELETE CASCADE,
  category text DEFAULT 'general',
  is_pinned boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Discussions are viewable by authenticated users"
  ON public.discussions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create discussions"
  ON public.discussions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions"
  ON public.discussions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
  ON public.discussions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add triggers for updated_at
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_schedules_updated_at
  BEFORE UPDATE ON public.meal_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON public.discussions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a default school
INSERT INTO public.schools (id, name, address) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Generic High School', '123 Main Street');

-- Enable realtime for discussions
ALTER PUBLICATION supabase_realtime ADD TABLE public.discussions;