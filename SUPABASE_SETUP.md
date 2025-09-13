# 🚀 Supabase Setup Guide for Aarogya App

## 📋 Complete Setup Instructions

### 1. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/Login with your account
4. Click "New Project"
5. Choose your organization
6. Fill in project details:
   - **Name**: `aarogya-app`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your location
7. Click "Create new project"
8. Wait for the project to be created (2-3 minutes)

### 2. Run SQL Schema
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire content from `database/schema.sql` file
4. Paste it into the SQL editor
5. Click **"Run"** button
6. You should see: "Database schema created successfully! 🎉"

### 3. Get Your Credentials
1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 4. Configure Environment Variables
1. In your project folder (`1/`), create a file called `.env`
2. Add your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Replace the values with your actual credentials from step 3!**

### 5. Update Supabase Configuration
1. Open `lib/supabase.ts`
2. The file should automatically use your environment variables
3. If you see "YOUR_SUPABASE_URL" in the app, it means the `.env` file is not set up correctly

### 6. Enable Email Authentication (Optional)
1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Under **Auth Providers**, make sure **Email** is enabled
3. You can customize email templates if needed

### 7. Test the Setup
1. Run your app: `npm start`
2. Try to sign up with a test email
3. Check your Supabase dashboard → **Authentication** → **Users**
4. You should see the new user appear
5. Go to **Table Editor** and check that `user_profiles` table has data

## 🔧 Troubleshooting

### Error: "Invalid API key"
- Double-check your `.env` file
- Make sure there are no spaces around the `=` sign
- Restart your development server after changing `.env`

### Error: "Failed to save onboarding data"
- Check that all SQL tables were created successfully
- Go to **Table Editor** in Supabase and verify tables exist
- Check the browser console for detailed error messages

### Error: "Row Level Security policy violation"
- Make sure you're logged in before trying to save data
- Check that the RLS policies were created correctly in the SQL script

### Users can't sign up
- Check **Authentication** → **Settings** → **Auth Providers**
- Make sure **Email** provider is enabled
- Check if email confirmations are required (you can disable for testing)

## 📊 Database Tables Created

The SQL script creates these tables:
- `user_profiles` - User information and BMI data
- `baby_profiles` - Baby information and medical conditions
- `emergency_contacts` - Emergency contact details
- `baby_milestones` - Developmental milestones tracking
- `baby_feeding` - Feeding schedule and data
- `baby_growth` - Height/weight growth tracking
- `anonymous_questions` - Anonymous Q&A system
- `mother_nutrition` - Mother's nutrition tracking
- `mother_health_metrics` - Health metrics and check-ins
- `language_preferences` - Multi-language settings
- `health_checkins` - Daily health check-ins
- `ai_insights` - AI-generated insights and recommendations

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Anonymous questions are properly handled
- Secure authentication with Supabase Auth

## 🎯 Features Implemented

### Authentication System
- ✅ Sign up with email/password
- ✅ Sign in with existing account
- ✅ Password validation and security
- ✅ User profile creation
- ✅ Session management

### Data Storage
- ✅ Complete onboarding data saving
- ✅ BMI calculation and storage
- ✅ Baby profile with medical conditions
- ✅ Emergency contacts management
- ✅ Language preferences
- ✅ Real-time data synchronization

### App Flow
- ✅ Splash screen with auth check
- ✅ Redirect to login if not authenticated
- ✅ Onboarding with database integration
- ✅ Error handling and user feedback
- ✅ Loading states and progress indicators

## 📱 App Flow After Setup

1. **Splash Screen** → Checks if user is logged in
2. **Login/Signup** → If not logged in
3. **Onboarding** → Collects data and saves to database
4. **Timeline Preview** → Shows personalized journey
5. **Dashboard** → Main app with all features

## 🛠️ Next Steps

After setup is complete, you can:
- Test the complete user flow
- Add more data to existing users
- Implement additional features like:
  - Baby feeding tracking
  - Health check-ins
  - Anonymous questions
  - Nutrition tracking
  - Multi-language support

## 🆘 Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your `.env` file is correct
3. Make sure all SQL tables were created
4. Check Supabase dashboard for authentication issues
5. Restart your development server after any config changes

Happy coding! 🎉
