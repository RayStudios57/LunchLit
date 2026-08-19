
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invitee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'accepted',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (invitee_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Records a referral for the currently authenticated (newly signed-up) user
-- and notifies the inviter. Self-referrals and duplicates are ignored.
CREATE OR REPLACE FUNCTION public.record_referral(_inviter_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invitee uuid := auth.uid();
  _invitee_name text;
BEGIN
  IF _invitee IS NULL OR _inviter_id IS NULL OR _inviter_id = _invitee THEN
    RETURN;
  END IF;

  -- Only record the first referral for this invitee
  IF EXISTS (SELECT 1 FROM public.referrals WHERE invitee_id = _invitee) THEN
    RETURN;
  END IF;

  INSERT INTO public.referrals (inviter_id, invitee_id, status)
  VALUES (_inviter_id, _invitee, 'accepted');

  SELECT full_name INTO _invitee_name
  FROM public.profiles WHERE user_id = _invitee;

  -- Notify the inviter that their invite was accepted
  INSERT INTO public.notifications (user_id, title, message, type, data)
  VALUES (
    _inviter_id,
    'Invite accepted! 🎉',
    COALESCE(_invitee_name, 'A new student') || ' joined LunchLIT using your invite link.',
    'referral_accepted',
    jsonb_build_object('invitee_id', _invitee)
  );

  -- Award the inviter the "Spread the Word" badge
  INSERT INTO public.user_achievements (user_id, badge_key)
  VALUES (_inviter_id, 'inviter')
  ON CONFLICT DO NOTHING;
END;
$$;

-- When a referred friend unlocks a badge, notify their inviter.
CREATE OR REPLACE FUNCTION public.notify_inviter_on_badge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inviter uuid;
  _friend_name text;
BEGIN
  SELECT inviter_id INTO _inviter
  FROM public.referrals
  WHERE invitee_id = NEW.user_id;

  IF _inviter IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT full_name INTO _friend_name
  FROM public.profiles WHERE user_id = NEW.user_id;

  INSERT INTO public.notifications (user_id, title, message, type, data)
  VALUES (
    _inviter,
    'A friend unlocked a badge! 🏅',
    COALESCE(_friend_name, 'A friend you invited') || ' just unlocked the "' || NEW.badge_key || '" badge.',
    'friend_badge',
    jsonb_build_object('friend_id', NEW.user_id, 'badge_key', NEW.badge_key)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_inviter_on_badge_trigger
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW EXECUTE FUNCTION public.notify_inviter_on_badge();
