-- Enable UPDATE and DELETE for forum_replies based on ownership
CREATE POLICY "Users can update their own replies" 
ON forum_replies FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" 
ON forum_replies FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Enable UPDATE and DELETE for forum_threads based on ownership
CREATE POLICY "Users can update their own threads" 
ON forum_threads FOR UPDATE 
TO authenticated 
USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their own threads" 
ON forum_threads FOR DELETE 
TO authenticated 
USING (auth.uid() = creator_id);
