CREATE OR REPLACE FUNCTION reset_custom_password(p_token TEXT, p_new_password TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Buscar token válido, no usado y no expirado
    SELECT user_id INTO v_user_id 
    FROM public.recovery_tokens 
    WHERE token = p_token AND used = FALSE AND expires_at > NOW();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired token';
    END IF;

    -- Actualizar contraseña en el esquema auth nativo usando pgcrypto (bcrypt)
    UPDATE auth.users 
    SET password = crypt(p_new_password, gen_salt('bf', 10)),
        updated_at = NOW()
    WHERE id = v_user_id;

    -- Marcar token como usado
    UPDATE public.recovery_tokens 
    SET used = TRUE 
    WHERE token = p_token;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
