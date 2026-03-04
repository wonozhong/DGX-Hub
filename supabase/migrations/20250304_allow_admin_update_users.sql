-- Drop the existing policy to replace it with a more comprehensive one
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create a new policy that allows users to update their own profile OR admins to update any profile
CREATE POLICY "Users can update their own profile or admin" 
ON users FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = id 
  OR 
  (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);
