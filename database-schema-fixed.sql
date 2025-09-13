-- Aarogya App Database Schema for Supabase (FIXED VERSION)
-- Copy and paste this entire code into your Supabase SQL Editor

-- Create custom types for better data validation
CREATE TYPE delivery_type AS ENUM ('normal_delivery', 'c_section');
CREATE TYPE bmi_status AS ENUM ('underweight', 'normal', 'overweight', 'obese');
CREATE TYPE language_preference AS ENUM ('hindi', 'english', 'telugu', 'tamil', 'kannada', 'malayalam');

-- Users Profile Table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL, -- ADDED: This was missing from the original schema
    name TEXT NOT NULL,
    phone TEXT,
    mother_dob DATE,
    mother_height DECIMAL(5,2), -- in cm
    mother_weight DECIMAL(5,2), -- in kg
    mother_bmi DECIMAL(4,1),
    mother_bmi_status bmi_status,
    baby_dob DATE,
    baby_height DECIMAL(5,2), -- in cm
    baby_weight DECIMAL(5,2), -- in kg
    baby_medical_conditions TEXT,
    delivery_type delivery_type,
    preferred_language language_preference DEFAULT 'english',
    voice_sms_consent BOOLEAN DEFAULT false,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Contacts Table
CREATE TABLE public.emergency_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Baby Profile Table (for detailed baby tracking)
CREATE TABLE public.baby_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    birth_weight DECIMAL(5,2),
    birth_height DECIMAL(5,2),
    current_weight DECIMAL(5,2),
    current_height DECIMAL(5,2),
    medical_conditions TEXT,
    allergies TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Baby Growth Tracking
CREATE TABLE public.baby_growth (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    baby_id UUID REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    head_circumference DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Baby Milestones
CREATE TABLE public.baby_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    baby_id UUID REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
    milestone_type TEXT NOT NULL, -- 'motor', 'social', 'cognitive', 'language'
    milestone_name TEXT NOT NULL,
    expected_age_months INTEGER,
    achieved_date DATE,
    is_achieved BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Baby Feeding Tracking
CREATE TABLE public.baby_feeding (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    baby_id UUID REFERENCES public.baby_profiles(id) ON DELETE CASCADE,
    feeding_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    feeding_type TEXT NOT NULL, -- 'breastfeeding', 'bottle', 'solid'
    amount_ml INTEGER,
    duration_minutes INTEGER,
    food_items TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mother Health Metrics
CREATE TABLE public.mother_health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight DECIMAL(5,2),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_hours DECIMAL(3,1),
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mother Nutrition Tracking
CREATE TABLE public.mother_nutrition (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    calories INTEGER,
    protein_g DECIMAL(5,2),
    iron_mg DECIMAL(5,2),
    calcium_mg DECIMAL(6,2),
    water_ml INTEGER,
    food_items TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anonymous Questions
CREATE TABLE public.anonymous_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    urgency_level TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    is_voice_question BOOLEAN DEFAULT false,
    ai_response TEXT,
    is_answered BOOLEAN DEFAULT false,
    is_anonymous BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Voice Check-ins
CREATE TABLE public.voice_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    checkin_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    transcript TEXT,
    ai_analysis TEXT,
    risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high'
    mood_detected TEXT,
    recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Language Preferences
CREATE TABLE public.language_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    primary_language language_preference DEFAULT 'english',
    secondary_language language_preference,
    voice_recognition_language language_preference DEFAULT 'english',
    text_display_language language_preference DEFAULT 'english',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery Timeline
CREATE TABLE public.recovery_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    phase_name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    progress_percentage INTEGER DEFAULT 0,
    milestones TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_phone ON public.user_profiles(phone);
CREATE INDEX idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX idx_baby_profiles_user_id ON public.baby_profiles(user_id);
CREATE INDEX idx_baby_growth_baby_id ON public.baby_growth(baby_id);
CREATE INDEX idx_baby_growth_date ON public.baby_growth(recorded_date);
CREATE INDEX idx_mother_health_user_id ON public.mother_health_metrics(user_id);
CREATE INDEX idx_mother_health_date ON public.mother_health_metrics(recorded_date);
CREATE INDEX idx_voice_checkins_user_id ON public.voice_checkins(user_id);
CREATE INDEX idx_voice_checkins_date ON public.voice_checkins(checkin_date);
CREATE INDEX idx_anonymous_questions_user_id ON public.anonymous_questions(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_growth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baby_feeding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mother_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mother_nutrition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_timeline ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Users can only access their own data)
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own emergency contacts" ON public.emergency_contacts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own baby profiles" ON public.baby_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own baby growth" ON public.baby_growth
    FOR ALL USING (auth.uid() = (SELECT user_id FROM public.baby_profiles WHERE id = baby_id));

CREATE POLICY "Users can view own baby milestones" ON public.baby_milestones
    FOR ALL USING (auth.uid() = (SELECT user_id FROM public.baby_profiles WHERE id = baby_id));

CREATE POLICY "Users can view own baby feeding" ON public.baby_feeding
    FOR ALL USING (auth.uid() = (SELECT user_id FROM public.baby_profiles WHERE id = baby_id));

CREATE POLICY "Users can view own health metrics" ON public.mother_health_metrics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own nutrition" ON public.mother_nutrition
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own questions" ON public.anonymous_questions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own checkins" ON public.voice_checkins
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own language preferences" ON public.language_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own recovery timeline" ON public.recovery_timeline
    FOR ALL USING (auth.uid() = user_id);

-- Create functions for automatic BMI calculation
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mother_height IS NOT NULL AND NEW.mother_weight IS NOT NULL THEN
        NEW.mother_bmi := ROUND((NEW.mother_weight / POWER(NEW.mother_height / 100.0, 2))::numeric, 1);
        
        -- Set BMI status
        IF NEW.mother_bmi < 18.5 THEN
            NEW.mother_bmi_status := 'underweight';
        ELSIF NEW.mother_bmi < 25 THEN
            NEW.mother_bmi_status := 'normal';
        ELSIF NEW.mother_bmi < 30 THEN
            NEW.mother_bmi_status := 'overweight';
        ELSE
            NEW.mother_bmi_status := 'obese';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for BMI calculation
CREATE TRIGGER trigger_calculate_bmi
    BEFORE INSERT OR UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION calculate_bmi();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_baby_profiles_updated_at
    BEFORE UPDATE ON public.baby_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_anonymous_questions_updated_at
    BEFORE UPDATE ON public.anonymous_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_language_preferences_updated_at
    BEFORE UPDATE ON public.language_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database schema created successfully! All tables, indexes, policies, and triggers are ready.' as status;
