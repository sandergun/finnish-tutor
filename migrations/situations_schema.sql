-- Create situations table
CREATE TABLE IF NOT EXISTS situations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description_ru TEXT,
  level TEXT DEFAULT 'A1', -- Difficulty level
  theory TEXT,            -- Theoretical context
  finnish_fact TEXT,      -- Unique fact about Finland
  steps JSONB NOT NULL,    -- Array of steps
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_id TEXT -- Optional: Link to user who created it (if admin)
);

-- Create user_situation_progress table
CREATE TABLE IF NOT EXISTS user_situation_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL, 
  situation_id UUID REFERENCES situations(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attempts INTEGER DEFAULT 0, 
  UNIQUE(user_id, situation_id)
);

-- Enable RLS
ALTER TABLE situations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_situation_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to ensure idempotency
DROP POLICY IF EXISTS "Public situations are viewable by everyone" ON situations;
DROP POLICY IF EXISTS "Users can view own situation progress" ON user_situation_progress;
DROP POLICY IF EXISTS "Users can update own situation progress" ON user_situation_progress;

-- Re-create policies
DROP POLICY IF EXISTS "Public situations are accessible by everyone" ON situations;
CREATE POLICY "Public situations are accessible by everyone" ON situations
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Users can view own situation progress" ON user_situation_progress;
CREATE POLICY "Users can view own situation progress" ON user_situation_progress
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own situation progress" ON user_situation_progress;
CREATE POLICY "Users can update own situation progress" ON user_situation_progress
  FOR ALL 
  USING (true)
  WITH CHECK (true);
