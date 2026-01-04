-- Fix function search_path for check_upload_data_size
CREATE OR REPLACE FUNCTION check_upload_data_size()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF length(NEW.upload_data::text) > 500000 THEN
    RAISE EXCEPTION 'Upload data exceeds maximum size of 500KB';
  END IF;
  RETURN NEW;
END;
$$;