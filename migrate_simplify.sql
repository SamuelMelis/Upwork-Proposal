-- Migration: Simplify Proposal System
-- This removes categories and winning proposals, adds proposal rules

-- 1. Create proposal_rules table
CREATE TABLE IF NOT EXISTS proposal_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS on proposal_rules
ALTER TABLE proposal_rules ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for proposal_rules
CREATE POLICY "Allow public read access" ON proposal_rules FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON proposal_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON proposal_rules FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON proposal_rules FOR DELETE USING (true);

-- 4. Remove category_id from portfolio_items (make a new table without it)
CREATE TABLE portfolio_items_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  link text NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Copy existing portfolio data (without category_id)
INSERT INTO portfolio_items_new (id, title, link, description, created_at)
SELECT id, title, link, description, created_at FROM portfolio_items;

-- 6. Drop old portfolio_items table and rename new one
DROP TABLE IF EXISTS portfolio_items CASCADE;
ALTER TABLE portfolio_items_new RENAME TO portfolio_items;

-- 7. Enable RLS on new portfolio_items
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- 8. Create policies for portfolio_items
CREATE POLICY "Allow public read access" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON portfolio_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON portfolio_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON portfolio_items FOR DELETE USING (true);

-- 9. Drop categories and proposals tables
DROP TABLE IF EXISTS proposals CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 10. Insert default proposal rules
INSERT INTO proposal_rules (content) VALUES (
'Proposal Generation Guidelines

Keep it Human & Casual

Write naturally, like you''re speaking to a client.

Avoid over-formal or "AI-sounding" language.

Be friendly but professional.

Focus on Relevance

Tailor each proposal to the specific job description.

Highlight skills and experiences directly related to the role.

Avoid generic or unrelated information.

Show Expertise Without Overexplaining

Mention your key skills (e.g., Adobe Premiere, After Effects, motion graphics, TikTok/Meta ad editing).

Don''t go into deep technical details unless asked.

Focus on what you can do for the client, not your full workflow.

Highlight Key Strengths

Short-form ad editing, VSLs, Meta/TikTok/Instagram content.

Motion graphics, text animation, transitions, SFX.

Fast turnaround and efficiency.

Keep it Short & Precise

3–5 paragraphs max.

Stick to main points: who you are, why you fit, what you can deliver.

Avoid unnecessary background stories or unrelated skills.

Portfolio Mention

Do not explain previous works in detail.

Use phrases like:

"Here are some related previous works I have done"

"You can check out some of my recent projects here"

Always attach portfolio links.

Tailor to Platform & Style

Mention platforms you''re experienced with (Meta, TikTok, Instagram, YouTube).

Focus on trending styles if the client emphasizes them.

Mention ability to adapt content for multiple platforms when relevant.

Include Availability & Turnaround (if relevant)

Mention if you can meet deadlines, availability for calls, and typical project turnaround.

Optional AI Tool Mentions

Mention AI tools only when relevant to the job.

Keep it short: "I use MidJourney, ElevenLabs, InVideo, and Veed.io to enhance workflow and quality."

Call to Action

Close with a friendly note to encourage response:

"I''d love to jump on a quick call to discuss your vision."

"Looking forward to collaborating!"

Avoid Overloading Details

Only include information the client explicitly wants or needs.

No exhaustive workflow descriptions unless asked.

Optional Personal Touch

Add small human touches if appropriate (favorite color, enthusiasm, etc.) but keep it relevant.'
);
