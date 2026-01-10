-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view all other users (needed for chat/search)
CREATE POLICY "Users can view all profiles" 
ON users FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Allow users to insert their own profile
-- This is crucial for the authStore.ts logic where it creates the profile if missing
CREATE POLICY "Users can insert their own profile" 
ON users FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Policy: Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Ensure other tables also have RLS enabled and basic policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Tasks Policies
CREATE POLICY "Users can view tasks they created or are assigned to" 
ON tasks FOR SELECT 
TO authenticated 
USING (auth.uid() = creator_id OR auth.uid() = assignee_id);

CREATE POLICY "Users can create tasks" 
ON tasks FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update tasks they created or are assigned to" 
ON tasks FOR UPDATE 
TO authenticated 
USING (auth.uid() = creator_id OR auth.uid() = assignee_id);

-- Messages Policies
CREATE POLICY "Users can view their own messages" 
ON messages FOR SELECT 
TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" 
ON messages FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update (mark read) messages sent to them" 
ON messages FOR UPDATE 
TO authenticated 
USING (auth.uid() = receiver_id);

-- Forum Policies (Open for all authenticated users)
CREATE POLICY "Users can view all threads" ON forum_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create threads" ON forum_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can view all replies" ON forum_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create replies" ON forum_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Friendships Policies
CREATE POLICY "Users can view their own friendships" 
ON friendships FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" 
ON friendships FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships" 
ON friendships FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR auth.uid() = friend_id);
