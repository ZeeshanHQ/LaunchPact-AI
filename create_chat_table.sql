-- Create team_messages table
CREATE TABLE team_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sender_name TEXT -- Cached name for easier display
);

-- Enable RLS
ALTER TABLE team_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view messages for their plans
CREATE POLICY "Team members can view messages"
  ON team_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.plan_id = team_messages.plan_id
      AND team_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = team_messages.plan_id
      AND plans.created_by = auth.uid()
    )
  );

-- Policy: Members can insert messages
CREATE POLICY "Team members can send messages"
  ON team_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.plan_id = team_messages.plan_id
      AND team_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = team_messages.plan_id
      AND plans.created_by = auth.uid()
    )
  );

-- Enable Realtime for this table
alter publication supabase_realtime add table team_messages;
