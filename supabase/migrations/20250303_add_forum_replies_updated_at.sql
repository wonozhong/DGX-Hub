alter table public.forum_replies 
add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null;
