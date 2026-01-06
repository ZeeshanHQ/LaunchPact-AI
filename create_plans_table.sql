-- Create plans table for team collaboration
create table if not exists plans (
  id text primary key,
  product_name text not null,
  blueprint jsonb not null,
  execution_plan jsonb not null,
  timeline jsonb not null,
  team_setup jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  status text default 'draft' check (status in ('draft', 'locked'))
);

-- Enable RLS
alter table plans enable row level security;

-- Policies
create policy "Users can view plans they created"
  on plans for select
  using (auth.uid() = created_by);

create policy "Users can update plans they created"
  on plans for update
  using (auth.uid() = created_by);

create policy "Users can insert plans"
  on plans for insert
  with check (auth.uid() = created_by);

-- Allow team members to view plans
create policy "Team members can view plans"
  on plans for select
  using (
    exists (
      select 1 from team_members
      where team_members.plan_id = plans.id
      and (team_members.email = (select email from auth.users where id = auth.uid()) 
           or team_members.user_id = auth.uid())
    )
  );

-- Function to handle updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger plans_updated_at
  before update on plans
  for each row
  execute procedure handle_updated_at();
