-- Create team_members table for team collaboration
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  expertise TEXT,
  role TEXT NOT NULL,
  approval_required BOOLEAN DEFAULT FALSE,
  has_approved BOOLEAN DEFAULT FALSE,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  invite_token TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view team members for plans they created
CREATE POLICY "Plan creators can view team members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = team_members.plan_id
      AND plans.created_by = auth.uid()
    )
  );

-- Policy: Users can view team members for plans they are members of
CREATE POLICY "Team members can view their own membership"
  ON public.team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Plan creators can insert team members
CREATE POLICY "Plan creators can add team members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = team_members.plan_id
      AND plans.created_by = auth.uid()
    )
  );

-- Policy: Team members can update their own approval status
CREATE POLICY "Team members can update their approval"
  ON public.team_members FOR UPDATE
  USING (
    user_id = auth.uid()
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Plan creators can update team members
CREATE POLICY "Plan creators can update team members"
  ON public.team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = team_members.plan_id
      AND plans.created_by = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_members_plan_id ON public.team_members(plan_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_invite_token ON public.team_members(invite_token);



