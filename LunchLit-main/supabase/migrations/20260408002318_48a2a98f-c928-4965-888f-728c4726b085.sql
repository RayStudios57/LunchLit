
-- Create a secure function to award achievements
CREATE OR REPLACE FUNCTION public.award_achievement(_user_id uuid, _badge_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate badge_key length
  IF length(_badge_key) > 100 THEN
    RAISE EXCEPTION 'Invalid badge key';
  END IF;

  -- Only allow the user themselves to trigger their own achievement
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Cannot award achievements for other users';
  END IF;

  -- Insert if not already exists
  INSERT INTO public.user_achievements (user_id, badge_key)
  VALUES (_user_id, _badge_key)
  ON CONFLICT DO NOTHING;
END;
$$;
