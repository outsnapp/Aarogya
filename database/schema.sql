-- Aarogya App Database Schema
-- Copy and paste this into your Supabase SQL editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE delivery_type AS ENUM ('normal', 'c_section');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'emergency');

-- 1. User Profiles Table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    bmi DECIMAL(4,1),
    preferred_language TEXT DEFAULT 'english',
    voice_sms_consent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Baby Profiles Table
CREATE TABLE public.baby_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT,
    date_of_birth DATE NOT NULL,
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    delivery_type delivery_type,
    medical_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Emergency Contacts Table
CREATE TABLE public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Baby Milestones Table
CREATE TABLE public.baby_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
    milestone_type TEXT NOT NULL, -- 'motor', 'social', 'cognitive'
    milestone_name TEXT NOT NULL,
    expected_age_months INTEGER,
    achieved_at DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Baby Feeding Table
CREATE TABLE public.baby_feeding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
    feeding_time TIMESTAMP WITH TIME ZONE NOT NULL,
    feeding_type TEXT NOT NULL, -- 'breast', 'bottle', 'solid'
    amount_ml INTEGER,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Baby Growth Tracking Table
CREATE TABLE public.baby_growth (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    baby_id UUID NOT NULL REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    head_circumference_cm DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Anonymous Questions Table
CREATE TABLE public.anonymous_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL, -- Anonymous, so nullable
    question_text TEXT NOT NULL,
    category TEXT NOT NULL,
    urgency urgency_level DEFAULT 'medium',
    ai_response TEXT,
    is_answered BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE
);

-- 8. Mother Nutrition Table
CREATE TABLE public.mother_nutrition (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    calories INTEGER,
    protein_g DECIMAL(5,2),
    iron_mg DECIMAL(5,2),
    calcium_mg DECIMAL(5,2),
    water_liters DECIMAL(3,1),
    meal_type TEXT, -- 'breakfast', 'lunch', 'snack', 'dinner'
    food_items TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Mother Health Metrics Table
CREATE TABLE public.mother_health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_hours DECIMAL(3,1),
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Language Preferences Table
CREATE TABLE public.language_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    primary_language TEXT NOT NULL DEFAULT 'english',
    secondary_language TEXT,
    voice_recognition_language TEXT NOT NULL DEFAULT 'english',
    text_display_language TEXT NOT NULL DEFAULT 'english',
    cultural_adaptation BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Health Check-ins Table
CREATE TABLE public.health_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    overall_feeling INTEGER CHECK (overall_feeling >= 1 AND overall_feeling <= 10),
    physical_recovery INTEGER CHECK (physical_recovery >= 1 AND physical_recovery <= 10),
    emotional_wellbeing INTEGER CHECK (emotional_wellbeing >= 1 AND emotional_wellbeing <= 10),
    energy_levels INTEGER CHECK (energy_levels >= 1 AND energy_levels <= 10),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    concerns TEXT,
    voice_notes_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. AI Insights Table
CREATE TABLE public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- 'health_prediction', 'milestone_alert', 'nutrition_advice'
    insight_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    is_read BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_baby_profiles_user_id ON public.baby_profiles(user_id);
CREATE INDEX idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX idx_baby_milestones_baby_id ON public.baby_milestones(baby_id);
CREATE INDEX idx_baby_feeding_baby_id ON public.baby_feeding(baby_id);
CREATE INDEX idx_baby_feeding_date ON public.baby_feeding(feeding_time);
CREATE INDEX idx_baby_growth_baby_id ON public.baby_growth(baby_id);
CREATE INDEX idx_anonymous_questions_category ON public.anonymous_questions(category);
CREATE INDEX idx_mother_nutrition_user_id ON public.mother_nutrition(user_id);
CREATE INDEX idx_mother_nutrition_date ON public.mother_nutrition(date);
CREATE INDEX idx_mother_health_user_id ON public.mother_health_metrics(user_id);
CREATE INDEX idx_health_checkins_user_id ON public.health_checkins(user_id);
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_feeding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mother_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mother_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own baby profiles" ON public.baby_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own baby profiles" ON public.baby_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own emergency contacts" ON public.emergency_contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own emergency contacts" ON public.emergency_contacts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own baby milestones" ON public.baby_milestones
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.baby_profiles WHERE id = baby_id));

CREATE POLICY "Users can manage own baby milestones" ON public.baby_milestones
    FOR ALL USING (auth.uid() = (SELECT user_id FROM public.baby_profiles WHERE id = baby_id));

CREATE POLICY "Users can view own baby feeding" ON public.baby_feeding
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.baby_profiles WHERE id = baby_id));

CREATE POLICY "Users can manage own baby feeding" ON public.baby_feeding
    FOR ALL USING (auth.uid() = (SELECT user_id FROM public.baby_profiles WHERE id = baby_id));

CREATE POLICY "Users can view own baby growth" ON public.baby_growth
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.baby_profiles WHERE id = baby_id));

CREATE POLICY "Users can manage own baby growth" ON public.baby_growth
    FOR ALL USING (auth.uid() = (SELECT user_id FROM public.baby_profiles WHERE id = baby_id));

-- Anonymous questions - special case (can be anonymous)
CREATE POLICY "Anyone can view answered questions" ON public.anonymous_questions
    FOR SELECT USING (is_answered = true);

CREATE POLICY "Users can view own questions" ON public.anonymous_questions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create questions" ON public.anonymous_questions
    FOR INSERT WITH CHECK (true); -- Allow anonymous questions

CREATE POLICY "Users can view own nutrition" ON public.mother_nutrition
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own nutrition" ON public.mother_nutrition
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own health metrics" ON public.mother_health_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own health metrics" ON public.mother_health_metrics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own language preferences" ON public.language_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own language preferences" ON public.language_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own health checkins" ON public.health_checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own health checkins" ON public.health_checkins
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI insights" ON public.ai_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own AI insights" ON public.ai_insights
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.baby_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.language_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data for testing (optional)
-- This will be automatically removed in production

-- Sample milestone templates
INSERT INTO public.baby_milestones (baby_id, milestone_type, milestone_name, expected_age_months) VALUES
(gen_random_uuid(), 'motor', 'Holds head up', 2),
(gen_random_uuid(), 'motor', 'Sits without support', 6),
(gen_random_uuid(), 'motor', 'Crawls', 8),
(gen_random_uuid(), 'motor', 'Walks independently', 12),
(gen_random_uuid(), 'social', 'First smile', 2),
(gen_random_uuid(), 'social', 'Recognizes parents', 3),
(gen_random_uuid(), 'social', 'Plays peek-a-boo', 6),
(gen_random_uuid(), 'cognitive', 'Responds to name', 6),
(gen_random_uuid(), 'cognitive', 'Says first words', 10),
(gen_random_uuid(), 'cognitive', 'Follows simple commands', 12)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database schema created successfully! 🎉' as message;
