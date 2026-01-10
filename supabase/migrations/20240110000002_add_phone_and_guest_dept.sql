-- Add phone_number column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);

-- Update the handle_new_user function to set default department to 'Guest' and handle phone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, department, phone_number)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'employee', -- Default role remains employee, Admin can change it later
    'Guest',    -- Default department is now Guest
    new.raw_user_meta_data->>'phone_number'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
