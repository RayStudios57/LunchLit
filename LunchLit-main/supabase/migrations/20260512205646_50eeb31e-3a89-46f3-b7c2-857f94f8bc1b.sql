
CREATE OR REPLACE FUNCTION public.protect_owner_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id uuid := '724c21f3-d6ba-497a-8ad9-a80dab24b55d'::uuid;
BEGIN
  -- Protect the owner account from losing admin role on DELETE
  IF TG_OP = 'DELETE' AND OLD.user_id = owner_id AND OLD.role = 'admin' THEN
    RAISE EXCEPTION 'Cannot remove admin role from owner account';
  END IF;

  -- Protect the owner account from having admin role changed on UPDATE
  IF TG_OP = 'UPDATE' AND OLD.user_id = owner_id AND OLD.role = 'admin' THEN
    -- If role is being changed away from admin, block it
    IF NEW.role IS DISTINCT FROM 'admin' THEN
      RAISE EXCEPTION 'Cannot change admin role for owner account';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS protect_owner_admin ON public.user_roles;

CREATE TRIGGER protect_owner_admin
BEFORE DELETE OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.protect_owner_admin_role();
