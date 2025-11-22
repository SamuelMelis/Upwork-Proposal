-- Migration: Add Saved Proposals Feature

-- 1. Create saved_proposals table
CREATE TABLE IF NOT EXISTS saved_proposals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content text NOT NULL,
  job_brief text, -- Optional: store the original job brief
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS on saved_proposals
ALTER TABLE saved_proposals ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for saved_proposals
CREATE POLICY "Allow public read access" ON saved_proposals FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON saved_proposals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON saved_proposals FOR DELETE USING (true);
