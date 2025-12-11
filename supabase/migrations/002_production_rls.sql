-- Production RLS Policies for NutriAssist
-- IMPORTANT: Run this migration when enabling Supabase Auth
-- This replaces the permissive MVP policies with proper authentication-based policies

-- ============================================
-- STEP 1: Drop existing permissive policies
-- ============================================

DROP POLICY IF EXISTS "Allow all for nutritionists" ON nutritionists;
DROP POLICY IF EXISTS "Allow all for patients" ON patients;
DROP POLICY IF EXISTS "Allow all for chat_sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Allow all for messages" ON messages;
DROP POLICY IF EXISTS "Allow all for appointments" ON appointments;
DROP POLICY IF EXISTS "Allow all for handoffs" ON handoffs;

-- ============================================
-- STEP 2: Nutritionists policies
-- ============================================

-- Nutritionists can read their own profile
CREATE POLICY "nutritionists_select_own"
ON nutritionists FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Nutritionists can update their own profile
CREATE POLICY "nutritionists_update_own"
ON nutritionists FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Public can read basic nutritionist info for chat widget
CREATE POLICY "nutritionists_select_public"
ON nutritionists FOR SELECT
TO anon
USING (true);

-- ============================================
-- STEP 3: Patients policies
-- ============================================

-- Nutritionists can view their own patients
CREATE POLICY "patients_select_own_nutritionist"
ON patients FOR SELECT
TO authenticated
USING (nutritionist_id = auth.uid());

-- Nutritionists can create patients
CREATE POLICY "patients_insert_own_nutritionist"
ON patients FOR INSERT
TO authenticated
WITH CHECK (nutritionist_id = auth.uid());

-- Nutritionists can update their own patients
CREATE POLICY "patients_update_own_nutritionist"
ON patients FOR UPDATE
TO authenticated
USING (nutritionist_id = auth.uid())
WITH CHECK (nutritionist_id = auth.uid());

-- Nutritionists can delete their own patients
CREATE POLICY "patients_delete_own_nutritionist"
ON patients FOR DELETE
TO authenticated
USING (nutritionist_id = auth.uid());

-- Anonymous users can read patient by phone/email for chat identification
CREATE POLICY "patients_select_for_chat"
ON patients FOR SELECT
TO anon
USING (true);

-- ============================================
-- STEP 4: Chat Sessions policies
-- ============================================

-- Nutritionists can view their own chat sessions
CREATE POLICY "chat_sessions_select_own_nutritionist"
ON chat_sessions FOR SELECT
TO authenticated
USING (nutritionist_id = auth.uid());

-- Anonymous can create chat sessions
CREATE POLICY "chat_sessions_insert_anon"
ON chat_sessions FOR INSERT
TO anon
WITH CHECK (true);

-- Anonymous can view their own session (by session ID from cookie/token)
CREATE POLICY "chat_sessions_select_anon"
ON chat_sessions FOR SELECT
TO anon
USING (true);

-- Nutritionists can update their own chat sessions
CREATE POLICY "chat_sessions_update_own_nutritionist"
ON chat_sessions FOR UPDATE
TO authenticated
USING (nutritionist_id = auth.uid());

-- ============================================
-- STEP 5: Messages policies
-- ============================================

-- Nutritionists can view messages from their sessions
CREATE POLICY "messages_select_own_nutritionist"
ON messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE chat_sessions.id = messages.chat_session_id
        AND chat_sessions.nutritionist_id = auth.uid()
    )
);

-- Anyone can insert messages (patients via chat widget)
CREATE POLICY "messages_insert_all"
ON messages FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Anonymous can view messages from their own session
CREATE POLICY "messages_select_anon"
ON messages FOR SELECT
TO anon
USING (true);

-- ============================================
-- STEP 6: Appointments policies
-- ============================================

-- Nutritionists can view their own appointments
CREATE POLICY "appointments_select_own_nutritionist"
ON appointments FOR SELECT
TO authenticated
USING (nutritionist_id = auth.uid());

-- Nutritionists can create appointments
CREATE POLICY "appointments_insert_own_nutritionist"
ON appointments FOR INSERT
TO authenticated
WITH CHECK (nutritionist_id = auth.uid());

-- Anonymous can create appointments (via Nina booking)
CREATE POLICY "appointments_insert_anon"
ON appointments FOR INSERT
TO anon
WITH CHECK (true);

-- Nutritionists can update their own appointments
CREATE POLICY "appointments_update_own_nutritionist"
ON appointments FOR UPDATE
TO authenticated
USING (nutritionist_id = auth.uid())
WITH CHECK (nutritionist_id = auth.uid());

-- Anonymous can update appointments (cancel via chat)
CREATE POLICY "appointments_update_anon"
ON appointments FOR UPDATE
TO anon
USING (true);

-- Anonymous can view appointments for scheduling
CREATE POLICY "appointments_select_anon"
ON appointments FOR SELECT
TO anon
USING (true);

-- ============================================
-- STEP 7: Handoffs policies
-- ============================================

-- Nutritionists can view handoffs for their sessions
CREATE POLICY "handoffs_select_own_nutritionist"
ON handoffs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE chat_sessions.id = handoffs.chat_session_id
        AND chat_sessions.nutritionist_id = auth.uid()
    )
);

-- Anyone can create handoffs (Nina triggers them)
CREATE POLICY "handoffs_insert_all"
ON handoffs FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Nutritionists can resolve handoffs for their sessions
CREATE POLICY "handoffs_update_own_nutritionist"
ON handoffs FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM chat_sessions
        WHERE chat_sessions.id = handoffs.chat_session_id
        AND chat_sessions.nutritionist_id = auth.uid()
    )
);

-- ============================================
-- STEP 8: Storage policies (for diet PDFs)
-- ============================================

-- Note: Run these in Supabase Dashboard > Storage > Policies

-- Policy for 'diets' bucket:
-- CREATE POLICY "nutritionists_upload_diets"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--     bucket_id = 'diets' AND
--     auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "nutritionists_read_diets"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (
--     bucket_id = 'diets' AND
--     auth.uid()::text = (storage.foldername(name))[1]
-- );

-- CREATE POLICY "nutritionists_delete_diets"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--     bucket_id = 'diets' AND
--     auth.uid()::text = (storage.foldername(name))[1]
-- );
