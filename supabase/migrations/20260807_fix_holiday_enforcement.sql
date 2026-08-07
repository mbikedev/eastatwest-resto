-- Holiday closures were not being enforced on bookings.
--
-- Root cause: check_date_is_holiday() referenced a non-existent "holiday_date"
-- column (the table uses start_date/end_date) and returned a bare boolean
-- instead of the record the API expects. Every call errored, and the app's
-- validation is written to fail open, so bookings sailed through on closed days.
--
-- Fix 1: rebuild the function against the real schema.
-- Fix 2: enforce closures with triggers as well, because reservations and
--        orders are inserted straight from the browser with the anon key and
--        both eastatwest.com and reservations.eastatwest.com write to this
--        same database. Staff (service_role) stay exempt.

DROP FUNCTION IF EXISTS public.check_date_is_holiday(date);

CREATE FUNCTION public.check_date_is_holiday(check_date date)
RETURNS TABLE (
  is_holiday boolean,
  holiday_id uuid,
  holiday_name text,
  message text
)
LANGUAGE plpgsql
STABLE
SET search_path TO ''
AS $function$
DECLARE
  found_holiday public.holidays%ROWTYPE;
BEGIN
  SELECT h.* INTO found_holiday
  FROM public.holidays h
  WHERE h.is_active = true
    AND (
      (h.is_recurring = false AND check_date BETWEEN h.start_date AND h.end_date)
      OR
      (
        h.is_recurring = true
        AND h.recurrence_pattern IS NOT NULL
        AND (h.recurrence_end_date IS NULL OR check_date <= h.recurrence_end_date)
        AND (
          (h.recurrence_pattern->>'type' = 'annual'
            AND (h.recurrence_pattern->>'month')::int = EXTRACT(MONTH FROM check_date)::int
            AND (h.recurrence_pattern->>'day')::int = EXTRACT(DAY FROM check_date)::int)
          OR
          (h.recurrence_pattern->>'type' = 'weekly'
            AND (h.recurrence_pattern->>'day_of_week')::int = EXTRACT(DOW FROM check_date)::int)
          OR
          (h.recurrence_pattern->>'type' = 'monthly'
            AND (h.recurrence_pattern->>'day')::int = EXTRACT(DAY FROM check_date)::int)
        )
      )
    )
  ORDER BY h.start_date
  LIMIT 1;

  IF found_holiday.id IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text, NULL::text;
  ELSE
    RETURN QUERY SELECT
      true,
      found_holiday.id,
      found_holiday.name::text,
      COALESCE(
        NULLIF(found_holiday.description, ''),
        'We are closed on this date (' || found_holiday.name || '). Please choose another date.'
      )::text;
  END IF;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.check_date_is_holiday(date) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.reject_booking_on_holiday()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $function$
DECLARE
  target_date date;
  check_result record;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

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

DROP TRIGGER IF EXISTS reservations_reject_holiday ON public.reservations;
CREATE TRIGGER reservations_reject_holiday
  BEFORE INSERT OR UPDATE OF date ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.reject_booking_on_holiday();

DROP TRIGGER IF EXISTS orders_reject_holiday ON public.orders;
CREATE TRIGGER orders_reject_holiday
  BEFORE INSERT OR UPDATE OF delivery_date ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.reject_booking_on_holiday();
