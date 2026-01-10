/*
  # Allow public inserts for email logs (Widget support)

  1. Security Considerations
    - The widget runs on public websites where users are not authenticated.
    - We need to allow the 'anon' role to INSERT into `email_logs`.
    - The `user_id` provided in the insert payload identifies the Merchant (data owner).
  
  2. Changes
    - Add RLS policy to allow any user (including anon) to insert rows.
    - We strictly limit this to INSERT only. SELECT/UPDATE/DELETE are still protected.
*/

CREATE POLICY "Allow public/anon to insert email logs" ON public.email_logs
  FOR INSERT 
  WITH CHECK (true);
