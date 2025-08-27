set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.users (id, name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
    
    INSERT INTO public.user_profiles (user_id, country_code, currency)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'country_code', 'USD');
    
    RETURN NEW;
END;
$function$
;


