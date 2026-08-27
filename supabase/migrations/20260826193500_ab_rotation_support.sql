-- Add rotation_day to class_schedules
ALTER TABLE public.class_schedules 
ADD COLUMN IF NOT EXISTS rotation_day text NOT NULL DEFAULT 'all';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'class_schedules_rotation_day_check'
  ) THEN
    ALTER TABLE public.class_schedules 
    ADD CONSTRAINT class_schedules_rotation_day_check 
    CHECK (rotation_day IN ('all', 'A', 'B'));
  END IF;
END $$;

-- Add rotation fields to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS schedule_rotation text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS rotation_anchor_date date,
ADD COLUMN IF NOT EXISTS rotation_anchor_letter text DEFAULT 'A',
ADD COLUMN IF NOT EXISTS rotation_skip_weekends boolean DEFAULT true;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_schedule_rotation_check'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD CONSTRAINT user_preferences_schedule_rotation_check 
    CHECK (schedule_rotation IN ('none', 'ab'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_rotation_anchor_letter_check'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD CONSTRAINT user_preferences_rotation_anchor_letter_check 
    CHECK (rotation_anchor_letter IN ('A', 'B'));
  END IF;
END $$;
