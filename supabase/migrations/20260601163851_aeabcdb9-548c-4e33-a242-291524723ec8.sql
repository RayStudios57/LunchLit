-- Daily wellness log (mood + water) per user per day
CREATE TABLE public.wellness_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  mood TEXT,
  water_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellness_logs TO authenticated;
GRANT ALL ON public.wellness_logs TO service_role;

ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own wellness logs"
ON public.wellness_logs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_wellness_logs_updated_at
BEFORE UPDATE ON public.wellness_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fitness profile per user
CREATE TABLE public.fitness_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  age INTEGER NOT NULL DEFAULT 16,
  goal TEXT,
  days_per_week INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fitness_profiles TO authenticated;
GRANT ALL ON public.fitness_profiles TO service_role;

ALTER TABLE public.fitness_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own fitness profile"
ON public.fitness_profiles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_fitness_profiles_updated_at
BEFORE UPDATE ON public.fitness_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gym routines
CREATE TABLE public.gym_routines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'New Routine',
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_routines TO authenticated;
GRANT ALL ON public.gym_routines TO service_role;

ALTER TABLE public.gym_routines ENABLE ROW LEVEL SECURITY;

-- Routine shares (so a friend can view a routine shared with them)
CREATE TABLE public.routine_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID NOT NULL REFERENCES public.gym_routines(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (routine_id, to_user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.routine_shares TO authenticated;
GRANT ALL ON public.routine_shares TO service_role;

ALTER TABLE public.routine_shares ENABLE ROW LEVEL SECURITY;

-- Helper to check if a routine is shared with the current user
CREATE OR REPLACE FUNCTION public.routine_shared_with(_routine_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.routine_shares
    WHERE routine_id = _routine_id AND to_user_id = _user_id
  )
$$;

CREATE POLICY "Users manage their own routines"
ON public.gym_routines FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view routines shared with them"
ON public.gym_routines FOR SELECT
USING (public.routine_shared_with(id, auth.uid()));

CREATE POLICY "Users can share their own routines"
ON public.routine_shares FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view shares involving them"
ON public.routine_shares FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can remove shares involving them"
ON public.routine_shares FOR DELETE
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE TRIGGER update_gym_routines_updated_at
BEFORE UPDATE ON public.gym_routines
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Workout logs (days worked out, for streaks)
CREATE TABLE public.workout_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, log_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_logs TO authenticated;
GRANT ALL ON public.workout_logs TO service_role;

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own workout logs"
ON public.workout_logs FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);