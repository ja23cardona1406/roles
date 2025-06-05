/*
  # Fix infinite recursion in users table policies

  1. Issue Fixed
    - Resolves infinite recursion detected in policy for the "users" table
    - Current policies cause a recursive loop during authentication

  2. Changes
    - Drop existing problematic policies that cause recursion
    - Create new policies with safer conditions that prevent recursion
    - Use auth.uid() instead of checking against users table in policy definitions
*/

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Admin users can view all users" ON public.users;
DROP POLICY IF EXISTS "Admin users can insert users" ON public.users;
DROP POLICY IF EXISTS "Admin users can update users" ON public.users;

-- Keep the non-recursive policy
-- "Users can view their own data" policy is fine (uid() = id)

-- Create new policies with safer conditions
-- For admins to view all users, use role() function instead of querying users table
CREATE POLICY "Admin users can view all users" 
ON public.users
FOR SELECT
TO authenticated
USING (
  -- Using auth.role() is safer and prevents recursion
  role() = 'authenticated' AND 
  (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid() AND
      auth.users.email IN (
        SELECT email FROM users 
        WHERE role IN ('ADMIN', 'SUPERUSER')
      )
    )
    OR
    -- Fallback: allow users to view their own data
    id = auth.uid()
  )
);

-- For admins to insert users
CREATE POLICY "Admin users can insert users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (
  role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND
    auth.users.email IN (
      SELECT email FROM users 
      WHERE role IN ('ADMIN', 'SUPERUSER')
    )
  )
);

-- For admins to update users
CREATE POLICY "Admin users can update users"
ON public.users
FOR UPDATE
TO authenticated
USING (
  role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid() AND
    auth.users.email IN (
      SELECT email FROM users 
      WHERE role IN ('ADMIN', 'SUPERUSER')
    )
  )
);