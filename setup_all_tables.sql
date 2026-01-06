-- ============================================
-- LaunchPact AI - Complete Database Setup
-- ============================================
-- Run this file in Supabase SQL Editor to create all required tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TEAM MEMBERS TABLE
-- ============================================
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

-- Enable RLS for team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policies for team_members
CREATE POLICY "Plan creators can view team members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = team_members.plan_id
      AND plans.created_by = auth.uid()
    )
  );

CREATE POLICY "Team members can view their own membership"
  ON public.team_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Plan creators can add team members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = team_members.plan_id
      AND plans.created_by = auth.uid()
    )
  );

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

CREATE POLICY "Plan creators can update team members"
  ON public.team_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.plans
      WHERE plans.id = team_members.plan_id
      AND plans.created_by = auth.uid()
    )
  );

-- Indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_plan_id ON public.team_members(plan_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_invite_token ON public.team_members(invite_token);

-- ============================================
-- 2. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- COMPLETE!
-- ============================================
-- All required tables have been created.
-- Note: Make sure you have already run:
--   - init_database.sql (for profiles and founding_cohort)
--   - create_plans_table.sql (for plans table)
--   - create_chat_table.sql (for team_messages table)
-- ============================================

