-- Enable Realtime for messages table
-- This allows real-time subscriptions for chat messages in the dashboard
-- Nutritionists can see replies appear immediately without page refresh

alter publication supabase_realtime add table messages;
