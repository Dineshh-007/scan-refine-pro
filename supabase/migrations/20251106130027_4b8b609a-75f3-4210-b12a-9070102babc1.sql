-- Fix function search path security issue by recreating the function properly
DROP TRIGGER IF EXISTS update_corrections_updated_at ON public.corrections;
DROP FUNCTION IF EXISTS public.update_corrections_updated_at();

CREATE OR REPLACE FUNCTION public.update_corrections_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_corrections_updated_at
  BEFORE UPDATE ON public.corrections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_corrections_updated_at();