-- Migration to add missing columns to emergency_contacts table
-- Run this in your Supabase SQL Editor to fix the "column emergency_contacts.email does not exist" error

-- Add missing columns to emergency_contacts table
ALTER TABLE public.emergency_contacts 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'secondary',
ADD COLUMN IF NOT EXISTS is_emergency_contact BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_receive_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_receive_emergency_alerts BOOLEAN DEFAULT true;

-- Update existing records to have default values
UPDATE public.emergency_contacts 
SET 
    type = 'secondary',
    is_emergency_contact = false,
    can_receive_updates = true,
    can_receive_emergency_alerts = true
WHERE type IS NULL OR is_emergency_contact IS NULL OR can_receive_updates IS NULL OR can_receive_emergency_alerts IS NULL;

-- Success message
SELECT 'Migration completed successfully! emergency_contacts table now has all required columns.' as status;
