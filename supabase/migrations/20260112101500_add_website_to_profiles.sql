ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website text;

-- Update RLS if needed, but existing policies likely cover update for own profile
-- Just in case, ensure update policy exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
    ) THEN
        CREATE POLICY "Users can update their own profile"
            ON public.profiles
            FOR UPDATE
            USING (auth.uid() = id);
    END IF;
END
$$;
