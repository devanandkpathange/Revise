-- ============================================
-- REVISE - SUPABASE DATABASE SCHEMA
-- ============================================

-- ============================================
-- 1. PROFILES
-- ============================================

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    username TEXT UNIQUE NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- ============================================
-- 2. PROBLEMS
-- ============================================

CREATE TABLE public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    url TEXT NOT NULL,

    date_added DATE NOT NULL,
    
    schedule_days INTEGER[] DEFAULT '{1, 4, 7}',
    
    schedule_dates DATE[],

    created_at TIMESTAMPTZ DEFAULT now(),

    UNIQUE(user_id, url)
);

ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own problems"
    ON public.problems
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own problems"
    ON public.problems
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own problems"
    ON public.problems
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own problems"
    ON public.problems
    FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX idx_problems_user_id
    ON public.problems(user_id);


-- ============================================
-- 3. REVISIONS
-- ============================================

CREATE TABLE public.revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    problem_id UUID NOT NULL
        REFERENCES public.problems(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    revision_type TEXT NOT NULL
        CHECK (
            revision_type IN (
                '1-day',
                '4-day',
                '7-day',
                'manual',
                'scheduled'
            )
        ),

    revision_day INTEGER,

    due_date DATE NOT NULL,

    completed BOOLEAN NOT NULL DEFAULT false,

    completed_date DATE,

    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.revisions ENABLE ROW LEVEL SECURITY;


-- ============================================
-- REVISION SECURITY
-- ============================================

CREATE POLICY "Users can view own revisions"
    ON public.revisions
    FOR SELECT
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1
            FROM public.problems
            WHERE problems.id = revisions.problem_id
            AND problems.user_id = auth.uid()
        )
    );


CREATE POLICY "Users can insert own revisions"
    ON public.revisions
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1
            FROM public.problems
            WHERE problems.id = revisions.problem_id
            AND problems.user_id = auth.uid()
        )
    );


CREATE POLICY "Users can update own revisions"
    ON public.revisions
    FOR UPDATE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1
            FROM public.problems
            WHERE problems.id = revisions.problem_id
            AND problems.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1
            FROM public.problems
            WHERE problems.id = revisions.problem_id
            AND problems.user_id = auth.uid()
        )
    );


CREATE POLICY "Users can delete own revisions"
    ON public.revisions
    FOR DELETE
    USING (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1
            FROM public.problems
            WHERE problems.id = revisions.problem_id
            AND problems.user_id = auth.uid()
        )
    );


-- ============================================
-- REVISION INDEXES
-- ============================================

CREATE INDEX idx_revisions_user_id
    ON public.revisions(user_id);

CREATE INDEX idx_revisions_due_date
    ON public.revisions(due_date);

CREATE INDEX idx_revisions_completed
    ON public.revisions(completed);

CREATE INDEX idx_revisions_problem_id
    ON public.revisions(problem_id);


-- ============================================
-- DONE
-- ============================================

-- ============================================
-- MIGRATION SCRIPT (IF UPDATING EXISTING DB)
-- ============================================
-- ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS schedule_days INTEGER[] DEFAULT '{1, 4, 7}';
-- ALTER TABLE public.revisions ADD COLUMN IF NOT EXISTS revision_day INTEGER;
-- ALTER TABLE public.revisions DROP CONSTRAINT revisions_revision_type_check;
-- ALTER TABLE public.revisions ADD CONSTRAINT revisions_revision_type_check CHECK (revision_type IN ('1-day', '4-day', '7-day', 'manual', 'scheduled'));
-- ALTER TABLE public.problems ADD COLUMN IF NOT EXISTS schedule_dates DATE[];