
-- Add friend request toggle to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS allow_friend_requests boolean DEFAULT true;

-- Add DM notification preference
ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS direct_messages boolean DEFAULT true;

-- Create function to notify on new DM
CREATE OR REPLACE FUNCTION public.notify_on_direct_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sender_name text;
  _dm_pref boolean;
BEGIN
  -- Check if receiver wants DM notifications
  SELECT direct_messages INTO _dm_pref
  FROM public.notification_preferences
  WHERE user_id = NEW.receiver_id;

  -- Default to true if no preferences set
  IF _dm_pref IS NULL OR _dm_pref = true THEN
    SELECT full_name INTO _sender_name
    FROM public.profiles
    WHERE user_id = NEW.sender_id;

    INSERT INTO public.notifications (user_id, title, message, type, data)
    VALUES (
      NEW.receiver_id,
      'New message from ' || COALESCE(_sender_name, 'a friend'),
      LEFT(NEW.content, 100),
      'direct_message',
      jsonb_build_object('sender_id', NEW.sender_id, 'message_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_new_direct_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_direct_message();
