
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
ON public.direct_messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages to friends"
ON public.direct_messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM friends
    WHERE status = 'accepted'
    AND (
      (friends.user_id = auth.uid() AND friends.friend_user_id = receiver_id)
      OR (friends.friend_user_id = auth.uid() AND friends.user_id = receiver_id)
    )
  )
);

CREATE POLICY "Users can delete their own messages"
ON public.direct_messages FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);

CREATE INDEX idx_dm_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_dm_receiver ON public.direct_messages(receiver_id);
CREATE INDEX idx_dm_created ON public.direct_messages(created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
