# 🚨 URGENT: Database Fix Required

## Problem
The app is showing this error:
```
Error fetching contacts from database: {"code":"42703","details":null,"hint":null,"message":"column emergency_contacts.email does not exist"}
```

## Solution
You need to run a database migration to add the missing columns.

### Steps to Fix:

1. **Open your Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to the SQL Editor

2. **Run the Migration Script**
   - Copy the contents of `database-migration-add-email-columns.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify the Fix**
   - The migration will add these missing columns to `emergency_contacts`:
     - `email` (TEXT, optional)
     - `type` (TEXT, default: 'secondary')
     - `is_emergency_contact` (BOOLEAN, default: false)
     - `can_receive_updates` (BOOLEAN, default: true)
     - `can_receive_emergency_alerts` (BOOLEAN, default: true)

4. **Test the App**
   - Restart your app
   - Try accessing the Family Network or Emergency Contacts features
   - The error should be resolved

## What Was Fixed:
- ✅ Updated database schema to include missing columns
- ✅ Updated TypeScript types to match new schema
- ✅ Created migration script for existing databases
- ✅ All services now compatible with the new schema

## Files Modified:
- `database-schema-FINAL-WORKING.sql` - Updated schema
- `lib/supabase.ts` - Updated TypeScript types
- `database-migration-add-email-columns.sql` - Migration script

The app should work perfectly after running this migration! 🎉
