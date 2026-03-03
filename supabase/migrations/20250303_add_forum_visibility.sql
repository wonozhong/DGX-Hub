-- 1. Add visibility column
alter table public.forum_threads 
add column if not exists visibility text default 'public' check (visibility in ('public', 'internal'));

-- 2. Update existing threads
update public.forum_threads set visibility = 'public' where visibility is null;

-- 3. Enable RLS (just in case)
alter table public.forum_threads enable row level security;

-- 4. Policies
-- Drop existing policies if we want strict control, but since we don't know their names, 
-- we will just add new restrictive ones. Wait, if there is a blanket allow policy, these won't help.
-- Let's try to be specific.

-- View Policy: Public threads visible to everyone
create policy "View Public Threads"
  on public.forum_threads
  for select
  using (visibility = 'public');

-- View Policy: Internal threads visible only to staff
create policy "View Internal Threads"
  on public.forum_threads
  for select
  using (
    visibility = 'internal' 
    and (auth.jwt() ->> 'role' = 'service_role' OR exists (
      select 1 from public.users 
      where id = auth.uid() 
      and role in ('employee', 'manager', 'admin')
    ))
  );

-- Create Policy: Users can create public threads
create policy "Create Public Threads"
  on public.forum_threads
  for insert
  with check (
    visibility = 'public'
  );

-- Create Policy: Staff can create internal threads
create policy "Create Internal Threads"
  on public.forum_threads
  for insert
  with check (
    visibility = 'internal'
    and exists (
      select 1 from public.users 
      where id = auth.uid() 
      and role in ('employee', 'manager', 'admin')
    )
  );
