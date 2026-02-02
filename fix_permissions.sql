-- Run this in your Supabase SQL Editor to fix the permission error

-- Drop potentially conflicting policies
DROP POLICY IF EXISTS "Public situations are viewable by everyone" ON situations;
DROP POLICY IF EXISTS "Public situations are accessible by everyone" ON situations;

-- Enable full access to situations table
-- (Required because we are inserting data from the client side)
CREATE POLICY "Public situations are accessible by everyone" ON situations
  FOR ALL USING (true);
