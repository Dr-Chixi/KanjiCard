-- Allow admin to insert kanjis
CREATE POLICY "Admin can insert kanjis"
ON public.kanjis
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'email') = 'charif.lycee@gmail.com');

-- Allow admin to update kanjis
CREATE POLICY "Admin can update kanjis"
ON public.kanjis
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email') = 'charif.lycee@gmail.com');

-- Grant permissions (just in case)
GRANT ALL ON public.kanjis TO authenticated;
GRANT ALL ON public.kanjis TO service_role;
