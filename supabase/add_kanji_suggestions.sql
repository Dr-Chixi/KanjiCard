-- Create kanji_suggestions table
CREATE TABLE IF NOT EXISTS public.kanji_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    kanji_id UUID REFERENCES public.kanjis(id) ON DELETE SET NULL, -- Null for new kanjis, Set for modifications
    kanji TEXT NOT NULL,
    onyomi TEXT[] DEFAULT '{}',
    kunyomi TEXT[] DEFAULT '{}',
    meaning_fr TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kanji_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies for kanji_suggestions

-- Users can read their own suggestions
CREATE POLICY "Users can view their own suggestions"
ON public.kanji_suggestions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own suggestions
CREATE POLICY "Users can insert their own suggestions"
ON public.kanji_suggestions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Admin (charif.lycee@gmail.com) can view all suggestions
-- Note: Hardcoding email in RLS is possible but relying on app logic for admin UI is safer for complex queries.
-- However, for RLS security, we should ideally check email.
-- Since auth.jwt() -> email might not be available directly in all contexts or might strictly rely on custom claims.
-- For simplicity and robustness given previous steps, let's allow "Select All" for the specific UUID if we know it, or just use App logic + standard RLS.
-- Let's try to fetch the UUID of the admin first or use a policy that allows everything for a specific email if possible (fetching from auth.users is tricky in RLS without security definer functions).
-- EASIER APPROACH: Let everyone SELECT (so admin can see), but restricts UPDATE to admin?
-- No, privacy. Only admin should see other's suggestions.

-- Let's stick to: Users see theirs. Admin sees all.
-- We can use a function to check is_admin, or just add a policy for the specific UUID if we knew it.
-- For now, let's rely on the fact that we'll restrict the UI. But for data safety...
-- Let's create a policy for the admin email logic if we can.
-- Actually, the user object in RLS: `(select email from auth.users where id = auth.uid()) = 'charif.lycee@gmail.com'`
-- This requires access to auth.users which is restricted.

-- ALTERNATIVE: Just add a policy for the specific User ID if we can find it.
-- Valid strategy: Use the `App.tsx` logic which checks `user.email`.
-- For the database, we can create a policy:
-- CREATE POLICY "Admin can view all" ON public.kanji_suggestions FOR SELECT TO authenticated USING (auth.jwt() ->> 'email' = 'charif.lycee@gmail.com');
-- This works if email is in JWT.

CREATE POLICY "Admin can view all suggestions"
ON public.kanji_suggestions
FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = 'charif.lycee@gmail.com');

CREATE POLICY "Admin can update suggestions"
ON public.kanji_suggestions
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'charif.lycee@gmail.com');

-- Grant permissions
GRANT ALL ON public.kanji_suggestions TO authenticated;
GRANT ALL ON public.kanji_suggestions TO service_role;
