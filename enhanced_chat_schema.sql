-- Enhanced Team Chat Schema
-- This migration adds read receipts, typing indicators, and improved team messaging

-- =============================================
-- 1. MESSAGE READ STATUS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS message_read_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES team_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON message_read_status(user_id);

-- Enable RLS
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view read status for messages in their teams
CREATE POLICY "Users can view read status for their team messages"
  ON message_read_status FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_messages tm
      WHERE tm.id = message_read_status.message_id
      AND (
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.plan_id = tm.plan_id
          AND team_members.user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM plans
          WHERE plans.id = tm.plan_id
          AND plans.created_by = auth.uid()
        )
      )
    )
  );

-- Policy: Users can insert their own read status
CREATE POLICY "Users can insert their own read status"
  ON message_read_status FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own read status
CREATE POLICY "Users can update their own read status"
  ON message_read_status FOR UPDATE
  USING (user_id = auth.uid());

-- =============================================
-- 2. TYPING INDICATORS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, user_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_typing_indicators_plan_id ON typing_indicators(plan_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user_id ON typing_indicators(user_id);

-- Enable RLS
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Policy: Team members can view typing indicators
CREATE POLICY "Team members can view typing indicators"
  ON typing_indicators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.plan_id = typing_indicators.plan_id
      AND team_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM plans
      WHERE plans.id = typing_indicators.plan_id
      AND plans.created_by = auth.uid()
    )
  );

-- Policy: Users can insert/update their own typing status
CREATE POLICY "Users can manage their own typing status"
  ON typing_indicators FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- 3. ENHANCE TEAM_MESSAGES TABLE
-- =============================================
-- Add additional columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='team_messages' AND column_name='edited_at') THEN
    ALTER TABLE team_messages ADD COLUMN edited_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='team_messages' AND column_name='is_deleted') THEN
    ALTER TABLE team_messages ADD COLUMN is_deleted BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='team_messages' AND column_name='reply_to_id') THEN
    ALTER TABLE team_messages ADD COLUMN reply_to_id UUID REFERENCES team_messages(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================
-- 4. HELPER FUNCTIONS
-- =============================================

-- Function to get unread message count for a user in a team
CREATE OR REPLACE FUNCTION get_unread_count(p_plan_id TEXT, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO unread_count
  FROM team_messages tm
  WHERE tm.plan_id = p_plan_id
    AND tm.user_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM message_read_status mrs
      WHERE mrs.message_id = tm.id
        AND mrs.user_id = p_user_id
        AND mrs.read_at IS NOT NULL
    );
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all messages as read for a user in a team
CREATE OR REPLACE FUNCTION mark_messages_read(p_plan_id TEXT, p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert read status for all unread messages
  INSERT INTO message_read_status (message_id, user_id, read_at)
  SELECT tm.id, p_user_id, NOW()
  FROM team_messages tm
  WHERE tm.plan_id = p_plan_id
    AND tm.user_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM message_read_status mrs
      WHERE mrs.message_id = tm.id
        AND mrs.user_id = p_user_id
    )
  ON CONFLICT (message_id, user_id) 
  DO UPDATE SET read_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. ENABLE REALTIME
-- =============================================
-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE message_read_status;
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;

-- =============================================
-- 6. CREATE VIEW FOR TEAM CHAT LIST
-- =============================================
CREATE OR REPLACE VIEW user_team_chats AS
SELECT 
  p.id as plan_id,
  p.product_name,
  p.blueprint,
  p.created_by,
  tm.user_id,
  tm.email,
  tm.name as member_name,
  tm.role,
  tm.expertise,
  (
    SELECT json_build_object(
      'content', last_msg.content,
      'sender_name', last_msg.sender_name,
      'created_at', last_msg.created_at
    )
    FROM team_messages last_msg
    WHERE last_msg.plan_id = p.id
    ORDER BY last_msg.created_at DESC
    LIMIT 1
  ) as last_message,
  (
    SELECT COUNT(*)::INTEGER
    FROM team_members tm2
    WHERE tm2.plan_id = p.id
  ) as member_count
FROM plans p
INNER JOIN team_members tm ON tm.plan_id = p.id
WHERE tm.user_id = auth.uid() OR p.created_by = auth.uid();

-- Grant access to the view
GRANT SELECT ON user_team_chats TO authenticated;

COMMENT ON TABLE message_read_status IS 'Tracks read receipts for team messages';
COMMENT ON TABLE typing_indicators IS 'Tracks real-time typing indicators for team chats';
COMMENT ON FUNCTION get_unread_count IS 'Returns unread message count for a user in a specific team';
COMMENT ON FUNCTION mark_messages_read IS 'Marks all messages as read for a user in a specific team';
