-- Auth Trigger Migration for NutriAssist
-- Creates nutritionist record automatically when auth user signs up
-- IMPORTANT: Apply this migration after enabling Supabase Auth

-- Function to create nutritionist record on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.nutritionists (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Nutricionista'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
