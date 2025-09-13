import { supabase } from './supabase';

// SMS Service for D2Buff (Day 2 Buffer) - Fallback SMS system
export class SMSService {
  // Twilio webhook endpoint (for production)
  private static readonly TWILIO_WEBHOOK_URL = process.env.EXPO_PUBLIC_TWILIO_WEBHOOK_URL || 'https://your-app.vercel.app/api/sms/webhook';
  
  // SMS templates for different health levels
  private static readonly SMS_TEMPLATES = {
    welcome: (name: string) => 
      `Aarogya: Namaste ${name}! Welcome to Aarogya. Send your daily symptoms like: "bleeding" or "fever" or "sad". For help reply HELP.`,
    
    green: (tip: string) => 
      `Aarogya: All looks OK today. Tip: ${tip} Reply CHECK to do a quick mood check.`,
    
    yellow: (symptom: string, remedy: string) => 
      `Aarogya: Caution — we noticed ${symptom}. Try home care: ${remedy} Re-check in 24 hrs or reply HELP for more.`,
    
    red: (symptom: string) => 
      `Aarogya: ⚠️ Urgent — we found signs of ${symptom}. Please contact a doctor or nearest clinic now. If you want, reply CALL to connect to a health worker.`,
    
    help: () => 
      `Aarogya: Send symptoms like: bleeding, fever, pain, sad, tired. Reply STOP to opt out. For emergency call local health services.`,
    
    stop: () => 
      `Aarogya: You have opted out of SMS alerts. Reply START to opt back in.`
  };

  // Parse SMS text to extract symptoms
  static parseSymptoms(text: string): string[] {
    const lowerText = text.toLowerCase();
    const symptoms: string[] = [];
    
    // Keyword mapping for common symptoms
    const symptomKeywords = {
      'bleeding': ['bleeding', 'bleed', 'blood', 'discharge'],
      'fever': ['fever', 'feverish', 'hot', 'temperature'],
      'pain': ['pain', 'painful', 'ache', 'hurts'],
      'breast_pain': ['breast', 'breast pain', 'nipple', 'mastitis'],
      'urination_pain': ['urine', 'urination', 'pee', 'bladder'],
      'cramping': ['cramp', 'cramping', 'contraction'],
      'low_mood': ['sad', 'depressed', 'low', 'down', 'mood'],
      'tired': ['tired', 'exhausted', 'fatigue', 'weak'],
      'nausea': ['nausea', 'nauseous', 'vomit', 'sick'],
      'headache': ['headache', 'head pain', 'migraine']
    };

    // Check for each symptom
    Object.entries(symptomKeywords).forEach(([symptom, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        symptoms.push(symptom);
      }
    });

    return symptoms;
  }

  // Determine health risk level based on symptoms
  static assessRiskLevel(symptoms: string[]): 'green' | 'yellow' | 'red' {
    // Red flags - immediate medical attention needed
    const redFlags = ['bleeding', 'fever', 'breast_pain'];
    if (symptoms.some(symptom => redFlags.includes(symptom))) {
      return 'red';
    }

    // Yellow flags - monitor and provide guidance
    const yellowFlags = ['pain', 'urination_pain', 'cramping', 'low_mood'];
    if (symptoms.some(symptom => yellowFlags.includes(symptom))) {
      return 'yellow';
    }

    // Green - normal recovery symptoms
    return 'green';
  }

  // Generate appropriate response based on risk level
  static generateResponse(riskLevel: 'green' | 'yellow' | 'red', symptoms: string[]): string {
    switch (riskLevel) {
      case 'green':
        const greenTips = [
          'Drink warm fluids and rest',
          'Take short walks when possible',
          'Eat nutritious meals regularly',
          'Get adequate sleep'
        ];
        const randomTip = greenTips[Math.floor(Math.random() * greenTips.length)];
        return this.SMS_TEMPLATES.green(randomTip);

      case 'yellow':
        const yellowRemedies = {
          'pain': 'Apply warm compress and rest',
          'urination_pain': 'Drink plenty of water and cranberry juice',
          'cramping': 'Gentle massage and warm bath',
          'low_mood': 'Deep breathing exercises and talk to family'
        };
        const primarySymptom = symptoms[0];
        const remedy = yellowRemedies[primarySymptom as keyof typeof yellowRemedies] || 'Rest and monitor symptoms';
        return this.SMS_TEMPLATES.yellow(primarySymptom, remedy);

      case 'red':
        const redSymptom = symptoms[0];
        return this.SMS_TEMPLATES.red(redSymptom);

      default:
        return this.SMS_TEMPLATES.help();
    }
  }

  // Process incoming SMS (webhook handler)
  static async processIncomingSMS(from: string, body: string): Promise<string> {
    try {
      // Handle special commands
      if (body.toLowerCase().includes('help')) {
        return this.SMS_TEMPLATES.help();
      }
      
      if (body.toLowerCase().includes('stop')) {
        // TODO: Update user's SMS consent in database
        return this.SMS_TEMPLATES.stop();
      }

      // Find user by phone number
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone', from)
        .single();

      if (!userProfile) {
        return 'Aarogya: Phone number not registered. Please sign up in the app first.';
      }

      // Parse symptoms from SMS
      const symptoms = this.parseSymptoms(body);
      
      if (symptoms.length === 0) {
        return this.SMS_TEMPLATES.help();
      }

      // Assess risk level
      const riskLevel = this.assessRiskLevel(symptoms);

      // Store SMS check-in in database
      await this.storeSMSCheckin(userProfile.id, symptoms, riskLevel, body);

      // Generate and return response
      return this.generateResponse(riskLevel, symptoms);

    } catch (error) {
      console.error('Error processing SMS:', error);
      return 'Aarogya: Sorry, there was an error processing your message. Please try again or contact support.';
    }
  }

  // Store SMS check-in in database
  static async storeSMSCheckin(userId: string, symptoms: string[], riskLevel: string, originalText: string) {
    try {
      // Create a daily check-in record
      const { error } = await supabase
        .from('daily_checkin')
        .insert({
          user_id: userId,
          date: new Date().toISOString().split('T')[0],
          voice_transcript: originalText,
          symptoms: symptoms,
          risk_level: riskLevel,
          ai_insights: {
            source: 'sms',
            processed_at: new Date().toISOString(),
            risk_assessment: riskLevel
          },
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing SMS check-in:', error);
      }
    } catch (error) {
      console.error('Error in storeSMSCheckin:', error);
    }
  }

  // Send welcome SMS to new user
  static async sendWelcomeSMS(phone: string, name: string): Promise<boolean> {
    try {
      // In production, this would use Twilio API
      // For demo purposes, we'll simulate it
      console.log(`📱 SMS sent to ${phone}: ${this.SMS_TEMPLATES.welcome(name)}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome SMS:', error);
      return false;
    }
  }

  // Send emergency SMS to family contacts
  static async sendEmergencySMS(userId: string, message: string): Promise<boolean> {
    try {
      // Get emergency contacts
      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true);

      if (!contacts || contacts.length === 0) {
        return false;
      }

      // Send SMS to primary emergency contact
      const primaryContact = contacts[0];
      const emergencyMessage = `Aarogya Emergency Alert: ${message} - Please check on your family member immediately.`;
      
      // In production, this would use Twilio API
      console.log(`🚨 Emergency SMS sent to ${primaryContact.phone}: ${emergencyMessage}`);
      
      return true;
    } catch (error) {
      console.error('Error sending emergency SMS:', error);
      return false;
    }
  }

  // Check if user has SMS consent
  static async hasSMSConsent(userId: string): Promise<boolean> {
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('voice_sms_consent')
        .eq('id', userId)
        .single();

      return userProfile?.voice_sms_consent || false;
    } catch (error) {
      console.error('Error checking SMS consent:', error);
      return false;
    }
  }

  // Update SMS consent
  static async updateSMSConsent(userId: string, consent: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ voice_sms_consent: consent })
        .eq('id', userId);

      if (error) {
        console.error('Error updating SMS consent:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSMSConsent:', error);
      return false;
    }
  }
}

// Demo function to simulate SMS conversation
export const simulateSMSChat = () => {
  console.log('📱 SMS Demo Conversation:');
  console.log('User: "bleeding heavy"');
  console.log('Aarogya:', SMSService.generateResponse('red', ['bleeding']));
  console.log('');
  console.log('User: "tired and sad"');
  console.log('Aarogya:', SMSService.generateResponse('yellow', ['tired', 'low_mood']));
  console.log('');
  console.log('User: "help"');
  console.log('Aarogya:', SMSService.SMS_TEMPLATES.help());
};
