-- Add unique constraint to username to prevent duplicates
-- This ensures that no two users can have the same username.

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Update the onboarding RPC function to specifically handle the unique constraint error
-- and provide a friendly message if needed (though the database will return an error anyway).

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

    -- Trim and validate username
    p_username := trim(p_username);
    IF length(p_username) < 3 THEN
        RAISE EXCEPTION 'Username too short';
    END IF;

    -- Perform Upsert (Insert or Update)
    -- The ON CONFLICT (user_id) handles the profile update for the current user.
    -- The UNIQUE constraint on 'username' will trigger an error if another user
    -- already has that username.
    INSERT INTO public.profiles (user_id, username, avatar_url, updated_at)
    VALUES (v_user_id, p_username, p_avatar_url, now())
    ON CONFLICT (user_id)
    DO UPDATE SET
        username = EXCLUDED.username,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = now()
    RETURNING to_jsonb(profiles.*) INTO v_result;

    RETURN v_result;
EXCEPTION
    WHEN unique_violation THEN
        -- Check if it's the username constraint
        IF SQLERRM ~ 'profiles_username_unique' THEN
            RAISE EXCEPTION 'This username is already taken.';
        ELSE
            RAISE;
        END IF;
END;
$$;
