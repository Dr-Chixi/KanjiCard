-- Function to robustly update user onboarding profile
-- bypassing RLS policies to ensure it always succeeds for the authenticated user.

CREATE OR REPLACE FUNCTION public.update_user_onboarding(
    p_username TEXT,
    p_avatar_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_result JSONB;
BEGIN
    -- Get the current authenticated user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Perform Upsert (Insert or Update)
    -- We use ON CONFLICT to handle both cases gracefully
    INSERT INTO public.profiles (user_id, username, avatar_url, updated_at)
    VALUES (v_user_id, p_username, p_avatar_url, now())
    ON CONFLICT (user_id)
    DO UPDATE SET
        username = EXCLUDED.username,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = now()
    RETURNING to_jsonb(profiles.*) INTO v_result;

    RETURN v_result;
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_user_onboarding(TEXT, TEXT) TO authenticated;
