-- Drop previous policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update their own replies" ON forum_replies;
DROP POLICY IF EXISTS "Users can delete their own replies" ON forum_replies;
DROP POLICY IF EXISTS "Users can update their own threads" ON forum_threads;
DROP POLICY IF EXISTS "Users can delete their own threads" ON forum_threads;

-- Create comprehensive policies supporting Admin moderation

-- Forum Replies: Owner can update/delete, Admin can update/delete
CREATE POLICY "Users can update their own replies or admin" 
ON forum_replies FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can delete their own replies or admin" 
ON forum_replies FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Forum Threads: Owner can update/delete, Admin can update/delete
CREATE POLICY "Users can update their own threads or admin" 
ON forum_threads FOR UPDATE 
TO authenticated 
USING (auth.uid() = creator_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can delete their own threads or admin" 
ON forum_threads FOR DELETE 
TO authenticated 
USING (auth.uid() = creator_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
