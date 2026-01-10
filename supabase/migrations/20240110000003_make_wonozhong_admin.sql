-- Update user role to admin for wonozhong@gmail.com
UPDATE public.users
SET role = 'admin'
WHERE email = 'wonozhong@gmail.com';
