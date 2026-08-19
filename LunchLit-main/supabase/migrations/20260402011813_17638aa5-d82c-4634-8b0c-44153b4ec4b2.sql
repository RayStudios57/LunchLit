
-- Add shared_with_friends flag to tasks
ALTER TABLE public.tasks ADD COLUMN shared_with_friends boolean DEFAULT false;

-- Allow accepted friends to view each other's class schedules
CREATE POLICY "Friends can view each other's schedules"
ON public.class_schedules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.friends
    WHERE status = 'accepted'
    AND (
      (friends.user_id = auth.uid() AND friends.friend_user_id = class_schedules.user_id)
      OR (friends.friend_user_id = auth.uid() AND friends.user_id = class_schedules.user_id)
    )
  )
);

-- Allow accepted friends to view tasks marked as shared
CREATE POLICY "Friends can view shared tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (
  shared_with_friends = true
  AND EXISTS (
    SELECT 1 FROM public.friends
    WHERE status = 'accepted'
    AND (
      (friends.user_id = auth.uid() AND friends.friend_user_id = tasks.user_id)
      OR (friends.friend_user_id = auth.uid() AND friends.user_id = tasks.user_id)
    )
  )
);
