CREATE OR REPLACE FUNCTION request_recovery_token(p_email TEXT, p_secret TEXT) 
RETURNS TEXT AS $$
DECLARE
    v_user_id UUID;
    v_token TEXT;
BEGIN
    -- Validar el secreto de la Edge Function
    IF p_secret != 'MG_recovery_s3cret_2026!' THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Buscar usuario en el esquema protegido
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Generar token aleatorio
    v_token := encode(gen_random_bytes(32), 'hex');

    -- Guardar token con expiración (1 hora)
    INSERT INTO public.recovery_tokens (user_id, token, expires_at)
    VALUES (v_user_id, v_token, NOW() + INTERVAL '1 hour');

    RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
