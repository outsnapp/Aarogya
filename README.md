# Aarogya - AI-Powered Maternal & Child Health Companion 🤱

> A revolutionary voice-first AI companion that predicts postpartum complications before they become serious, featuring AI pattern recognition, real-time family network activation, and direct ASHA worker integration.

## 🌟 Problem Statement

Maternal and infant mortality rates remain critically high in rural areas due to:
- **Limited access to healthcare professionals** in remote regions
- **Delayed detection of postpartum complications** leading to preventable deaths
- **Communication barriers** between mothers and healthcare workers
- **Lack of continuous monitoring** after delivery
- **Family members unaware** of warning signs and emergency protocols
- **Language barriers** preventing effective healthcare communication

## 💡 Proposed Solution

**Aarogya** addresses these challenges through:

### 🎯 **Core Features**
- **Voice-First Interaction**: Natural conversation in local languages
- **AI Pattern Recognition**: Predicts complications before they become serious
- **Real-Time Family Network**: Automatic alerts to family members during emergencies
- **ASHA Worker Integration**: Direct connection to local health workers
- **SMS-Based Reach**: Works without internet for rural accessibility
- **Predictive Health Monitoring**: Continuous tracking with AI-powered insights

### 🔬 **AI-Powered Health Intelligence**
- Pattern analysis of maternal health indicators
- Early warning system for postpartum complications
- Personalized recovery timeline predictions
- Risk assessment with color-coded alerts

## 📱 App Screens Overview

### **Screen 1: Splash Screen**
- Beautiful animated logo with pastel design
- Auto-navigation based on user authentication status
- Smooth gradient animations and welcome messaging

### **Screen 2: Authentication**
- **Login**: Secure email/password authentication
- **Signup**: New user registration with profile creation
- Integrated with Supabase authentication system

### **Screen 3: Voice-First Onboarding**
- Revolutionary 12-step voice conversation setup
- Collects maternal health data (height, weight, BMI)
- Baby profile creation with delivery type
- Text fallback for accessibility
- Progress tracking with animations

### **Screen 4: AI Recovery Dashboard**
- Personalized health insights and recommendations
- Smart alerts based on AI pattern analysis
- Quick action buttons for common tasks
- Real-time health status indicators
- BMI tracking and health metrics

### **Screen 5: AI Recovery Timeline**
- Interactive timeline showing recovery phases
- Milestone tracking with progress indicators
- Personalized tips and recommendations
- Current phase highlighting with next steps
- Educational content about postpartum recovery

### **Screen 6: Smart Alert System**
- AI-powered risk assessment
- Automatic family network activation
- Emergency contact notifications
- ASHA worker alert system
- Color-coded risk levels (Green/Yellow/Red)

### **Screen 7: Voice Check-in**
- Natural conversation flow for daily health checks
- Voice recording with waveform animations
- AI analysis of voice patterns and responses
- Symptom tracking and pattern recognition

### **Screen 8: ASHA Worker Dashboard**
- Health worker profile and contact information
- Real-time patient monitoring capabilities
- Communication tools (call, SMS, video)
- Emergency response features
- Patient list and priority alerts

### **Screen 9: Family Network & Emergency Contacts**
- Emergency contact management
- Real-time notification settings
- Quick action buttons for family alerts
- Privacy controls and permissions
- Location sharing capabilities

### **Screen 10: Child Care Tracking**
- Baby growth monitoring and milestones
- Feeding and sleep pattern tracking
- Vaccination schedule management
- Health metrics visualization
- Pediatric guidance and tips

### **Screen 11: Mother Health Monitoring**
- Postpartum health tracking
- Mood and mental health assessment
- Physical recovery monitoring
- Medication reminders
- Health trend analysis

### **Screen 12: Anonymous Questions**
- Safe space for sensitive health questions
- AI-powered response system
- Complete privacy and anonymity
- Cultural sensitivity features
- Expert-reviewed answers

### **Screen 13: Multilingual Settings**
- Support for multiple Indian languages
- Voice recognition in local dialects
- Text display language preferences
- Cultural adaptation features

### **Screen 14: Profile Management**
- User profile editing and updates
- Health data management
- Privacy settings and controls
- Account preferences

### **Screen 15: SMS Demo**
- Demonstration of SMS-based features
- Offline functionality showcase
- Rural accessibility features
- Emergency SMS protocols

## 🛠 Tech Stack

### **Frontend**
- **React Native** with Expo SDK
- **Expo Router** for file-based navigation
- **React Native Reanimated** for smooth animations
- **React Native SVG** for custom graphics and icons
- **TypeScript** for type safety

### **Backend & Database**
- **Supabase** for backend-as-a-service
- **PostgreSQL** database with Row Level Security
- **Real-time subscriptions** for live updates
- **Supabase Auth** for user authentication

### **External Services**
- **Twilio** for SMS functionality
- **AsyncStorage** for local data persistence
- **Expo Linear Gradient** for beautiful UI effects

### **Development Tools**
- **Expo CLI** for development and deployment
- **Metro Bundler** for JavaScript bundling
- **TypeScript** compiler for type checking
- **ESLint** for code quality

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Expo CLI installed globally
- **Expo Go app** on your mobile device

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd aarogya-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file with your Supabase and Twilio credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_TWILIO_ACCOUNT_SID=your_twilio_sid
EXPO_PUBLIC_TWILIO_AUTH_TOKEN=your_twilio_token
```

4. **Set up the database**
- Copy the contents of `database-schema-FINAL-WORKING.sql`
- Paste and run it in your Supabase SQL Editor

### 📱 Running the App

**Start the development server:**
```bash
npx expo start
```

**To test on your mobile device:**

1. **Download the Expo Go app** from:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan the QR code** that appears in your terminal or browser
   - **iOS**: Use the built-in Camera app to scan the QR code
   - **Android**: Use the Expo Go app to scan the QR code

3. **The app will load** directly on your device for testing

### 🔧 Development Commands

```bash
# Start development server
npx expo start

# Start with specific platform
npx expo start --ios
npx expo start --android

# Start with tunnel for external testing
npx expo start --tunnel

# Clear cache if needed
npx expo start --clear
```

## 🎯 Key Features Implemented

### **Voice-First Experience**
- Natural conversation flows in multiple languages
- Voice recording with real-time waveform visualization
- Text fallback modals for accessibility
- Voice-to-text processing simulation

### **AI-Powered Intelligence**
- Pattern recognition for health data analysis
- Predictive algorithms for complication detection
- Personalized recommendations and insights
- Risk assessment with automated alerts

### **Family Network Integration**
- Real-time emergency notifications
- Automatic family member alerts
- Location sharing capabilities
- Privacy controls and consent management

### **Healthcare Worker Connection**
- Direct ASHA worker communication
- Real-time patient monitoring
- Emergency response protocols
- Multi-channel communication (voice, SMS, video)

### **Rural Accessibility**
- SMS-based functionality for offline use
- Multi-language support
- Simple, intuitive interface design
- Low-bandwidth optimizations

## 🎨 Design System

### **Color Palette**
- **Primary**: Soft Teal (#A8E6CF) - Calming and trustworthy
- **Secondary**: Pastel Pink (#FFD1DC) - Warm and nurturing
- **Background**: Soft Cream (#FFF8F3) - Clean and comfortable
- **Warning**: Soft Amber (#FFE4B5) - Gentle alerts
- **Error**: Soft Coral (#FFA07A) - Non-threatening errors

### **Typography**
- **Headings**: System font with medium weight
- **Body**: System font with regular weight
- **Captions**: System font with light weight
- Responsive sizing for accessibility

### **Animations**
- Smooth transitions with easing curves
- Staggered component animations
- Interactive feedback for user actions
- Loading states and progress indicators

## 🔒 Security & Privacy

- **End-to-end encryption** for sensitive health data
- **Row Level Security** in database
- **HIPAA-compliant** data handling
- **Anonymous question** feature for privacy
- **Consent management** for family notifications

## 🌍 Accessibility

- **Multi-language support** for Indian languages
- **Voice-first interface** for low-literacy users
- **High contrast** color schemes
- **Large touch targets** for easy interaction
- **Screen reader compatibility**

## 📊 Impact Metrics

- **Reduced maternal mortality** through early detection
- **Faster emergency response** via family network activation
- **Improved healthcare access** in rural areas
- **Enhanced patient engagement** through voice interaction
- **Better health outcomes** via continuous monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ for improving maternal and child health outcomes in rural India.

## 📞 Support

For support and questions, please contact:
- Email: support@aarogya.health
- Documentation: [Setup Guides](./SMS_SETUP_GUIDE.md)

---

**Aarogya** - Empowering mothers, protecting families, saving lives through AI-powered healthcare. 🌟