-- Drop existing table if it exists (WARNING: This will delete all existing data)
DROP TABLE IF EXISTS public.lotto_results;

-- Table: lotto_results
CREATE TABLE IF NOT EXISTS public.lotto_results (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    date date NOT NULL,  -- This matches your app's expected field names
    draw_num integer NOT NULL,
    numbers text NOT NULL,
    power_ball integer,
    multiplier integer,
    jackpot numeric(12,2),
    wins integer,
    last_updated timestamptz DEFAULT now(),
    date_created timestamptz DEFAULT now()
);

-- Ensure no duplicate draws by date
CREATE UNIQUE INDEX IF NOT EXISTS uniq_draw_date
    ON public.lotto_results (date);

-- Index for querying by date quickly
CREATE INDEX IF NOT EXISTS idx_draw_date
    ON public.lotto_results (date DESC);

-- Index for draw number queries
CREATE INDEX IF NOT EXISTS idx_draw_num
    ON public.lotto_results (draw_num DESC);

-- Index for jackpot queries (useful for filtering)
CREATE INDEX IF NOT EXISTS idx_jackpot
    ON public.lotto_results (jackpot DESC);

-- Composite index for date and draw number
CREATE INDEX IF NOT EXISTS idx_date_draw_num
    ON public.lotto_results (date DESC, draw_num DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.lotto_results ENABLE ROW LEVEL SECURITY;

-- ✅ Policy: Allow SELECT (read-only) for everyone
CREATE POLICY "Allow read access to everyone"
ON public.lotto_results
FOR SELECT
USING (true);

-- ✅ Policy: Allow INSERT only for service_role
CREATE POLICY "Allow inserts for service role only"
ON public.lotto_results
FOR INSERT
TO service_role
WITH CHECK (true);

-- ✅ Policy: Allow UPDATE only for service_role
CREATE POLICY "Allow updates for service role only"
ON public.lotto_results
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- ✅ Policy: Allow DELETE only for service_role
CREATE POLICY "Allow deletes for service role only"
ON public.lotto_results
FOR DELETE
TO service_role
USING (true);

-- Insert some sample data for testing
INSERT INTO public.lotto_results (date, draw_num, numbers, power_ball, multiplier, jackpot, wins) VALUES
('2024-01-15', 1001, '12|23|34|45|56', 7, 2, 50000000.00, 0),
('2024-01-12', 1000, '11|22|33|44|55', 9, 3, 45000000.00, 0),
('2024-01-10', 999, '10|21|32|43|54', 5, 2, 40000000.00, 0),
('2024-01-08', 998, '09|20|31|42|53', 8, 4, 35000000.00, 0),
('2024-01-05', 997, '08|19|30|41|52', 3, 2, 30000000.00, 0)
ON CONFLICT (date) DO NOTHING;
