
-- Fix the welcome email trigger to not block signup on failure
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_URL' LIMIT 1) || '/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'SUPABASE_ANON_KEY' LIMIT 1)
      ),
      body := jsonb_build_object(
        'email', NEW.email,
        'name', COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Student')
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Welcome email failed: %', SQLERRM;
  END;
  RETURN NEW;
END;
$function$;

-- Add school_end_date and use_theme_background to user_preferences
ALTER TABLE public.user_preferences 
  ADD COLUMN IF NOT EXISTS school_end_date date DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS use_theme_background boolean DEFAULT false;

-- Add friends table for cheering/collaboration
CREATE TABLE IF NOT EXISTS public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_user_id)
);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friend connections"
  ON public.friends FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

CREATE POLICY "Users can send friend requests"
  ON public.friends FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend requests they received"
  ON public.friends FOR UPDATE TO authenticated
  USING (auth.uid() = friend_user_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own friend connections"
  ON public.friends FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

-- Add cheers table
CREATE TABLE IF NOT EXISTS public.cheers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  message text DEFAULT '🎉',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cheers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cheers they sent or received"
  ON public.cheers FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send cheers"
  ON public.cheers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can delete cheers they sent"
  ON public.cheers FOR DELETE TO authenticated
  USING (auth.uid() = from_user_id);
