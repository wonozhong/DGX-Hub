alter table public.users 
add column if not exists last_seen timestamp with time zone default timezone('utc'::text, now());

-- Allow users to update their own last_seen without restricted policies
-- (The existing update policy should cover this, but let's ensure it works smoothly)
