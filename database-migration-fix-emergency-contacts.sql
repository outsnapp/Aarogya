-- Migration to fix emergency_contacts table schema issues
-- Run this in your Supabase SQL Editor to fix the "Could not find the 'is_emergency' column" error

-- Add missing columns to emergency_contacts table if they don't exist
ALTER TABLE public.emergency_contacts 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'secondary',
ADD COLUMN IF NOT EXISTS is_emergency_contact BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_receive_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS can_receive_emergency_alerts BOOLEAN DEFAULT true;

-- Update existing records to have proper default values
UPDATE public.emergency_contacts 
SET 
    type = COALESCE(type, 'secondary'),
    is_emergency_contact = COALESCE(is_emergency_contact, false),
    is_primary = COALESCE(is_primary, false),
    can_receive_updates = COALESCE(can_receive_updates, true),
    can_receive_emergency_alerts = COALESCE(can_receive_emergency_alerts, true)
WHERE 
    type IS NULL OR 
    is_emergency_contact IS NULL OR 
    is_primary IS NULL OR
    can_receive_updates IS NULL OR 
    can_receive_emergency_alerts IS NULL;

-- Add constraints to ensure data integrity
ALTER TABLE public.emergency_contacts 
ADD CONSTRAINT check_type_values CHECK (type IN ('primary', 'secondary', 'emergency'));

-- Create index for better performance on type column
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_type ON public.emergency_contacts(type);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_emergency ON public.emergency_contacts(is_emergency_contact);

-- Success message
SELECT 'Migration completed successfully! emergency_contacts table now has all required columns and constraints.' as status;
