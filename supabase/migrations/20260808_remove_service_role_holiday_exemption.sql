-- The reservations subdomain app (separate Netlify project) books via the
-- service role key, so the service_role exemption in
-- reject_booking_on_holiday() was a bypass path around holiday closures.
-- Enforce closures for every role. To take a booking on a closed day, staff
-- temporarily deactivate the holiday in /admin/holidays, book, reactivate.
CREATE OR REPLACE FUNCTION public.reject_booking_on_holiday()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  target_date date;
  check_result record;
BEGIN
  IF TG_TABLE_NAME = 'reservations' THEN
    target_date := NEW.date;
  ELSE
    target_date := NEW.delivery_date;
  END IF;

  IF target_date IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO check_result FROM public.check_date_is_holiday(target_date);

  IF check_result.is_holiday THEN
    RAISE EXCEPTION 'RESTAURANT_CLOSED: %', check_result.message
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$function$;
