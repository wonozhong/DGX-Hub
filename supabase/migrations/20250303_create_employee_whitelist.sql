create table if not exists public.employee_whitelist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.employee_whitelist enable row level security;

-- Policies

-- 1. Admins can do everything (select, insert, update, delete)
create policy "Admins can manage whitelist"
  on public.employee_whitelist
  for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- 2. Authenticated users can check if *their own* email is whitelisted
create policy "Users can check own email"
  on public.employee_whitelist
  for select
  using (
    auth.jwt() ->> 'email' = email
  );
