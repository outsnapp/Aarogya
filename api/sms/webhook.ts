// Real SMS Webhook Handler for Twilio
// This handles incoming SMS messages from rural users

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// SMS Service for real SMS processing
class RealSMSService {
  // Parse SMS text to extract symptoms
  static parseSymptoms(text: string): string[] {
    const lowerText = text.toLowerCase();
    const symptoms: string[] = [];
    
    // Keyword mapping for common symptoms
    const symptomKeywords = {
      'bleeding': ['bleeding', 'bleed', 'blood', 'discharge', 'rakta', 'खून'],
      'fever': ['fever', 'feverish', 'hot', 'temperature', 'bukhar', 'बुखार'],
      'pain': ['pain', 'painful', 'ache', 'hurts', 'dard', 'दर्द'],
      'breast_pain': ['breast', 'breast pain', 'nipple', 'mastitis', 'स्तन'],
      'urination_pain': ['urine', 'urination', 'pee', 'bladder', 'peshab', 'पेशाब'],
      'cramping': ['cramp', 'cramping', 'contraction', 'sukna', 'सूखना'],
      'low_mood': ['sad', 'depressed', 'low', 'down', 'mood', 'udaas', 'उदास'],
      'tired': ['tired', 'exhausted', 'fatigue', 'weak', 'thakaan', 'थकान'],
      'nausea': ['nausea', 'nauseous', 'vomit', 'sick', 'ultii', 'उल्टी'],
      'headache': ['headache', 'head pain', 'migraine', 'sir dard', 'सिर दर्द']
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
  static generateResponse(riskLevel: 'green' | 'yellow' | 'red', symptoms: string[], language: string = 'english'): string {
    const templates = {
      english: {
        green: (tip: string) => `Aarogya: All looks OK today. Tip: ${tip} Reply CHECK for mood check.`,
        yellow: (symptom: string, remedy: string) => `Aarogya: Caution — we noticed ${symptom}. Try: ${remedy} Re-check in 24 hrs or reply HELP.`,
        red: (symptom: string) => `Aarogya: ⚠️ URGENT — signs of ${symptom}. Contact doctor NOW. Reply CALL for health worker.`,
        help: () => `Aarogya: Send symptoms like: bleeding, fever, pain, sad, tired. Reply STOP to opt out.`,
        welcome: (name: string) => `Aarogya: Namaste ${name}! Send symptoms like: "bleeding" or "fever". Reply HELP for help.`
      },
      hindi: {
        green: (tip: string) => `आरोग्य: आज सब ठीक है। सुझाव: ${tip} मूड चेक के लिए CHECK भेजें।`,
        yellow: (symptom: string, remedy: string) => `आरोग्य: सावधान — ${symptom} दिखा। करें: ${remedy} 24 घंटे में फिर चेक करें।`,
        red: (symptom: string) => `आरोग्य: ⚠️ जरूरी — ${symptom} के लक्षण। तुरंत डॉक्टर से मिलें।`,
        help: () => `आरोग्य: लक्षण भेजें: खून, बुखार, दर्द, उदासी। बंद करने के लिए STOP भेजें।`,
        welcome: (name: string) => `आरोग्य: नमस्ते ${name}! लक्षण भेजें: "खून" या "बुखार"। मदद के लिए HELP भेजें।`
      }
    };

    const langTemplates = templates[language as keyof typeof templates] || templates.english;

    switch (riskLevel) {
      case 'green':
        const greenTips = [
          'Drink warm fluids and rest',
          'Take short walks when possible',
          'Eat nutritious meals regularly',
          'Get adequate sleep'
        ];
        const randomTip = greenTips[Math.floor(Math.random() * greenTips.length)];
        return langTemplates.green(randomTip);

      case 'yellow':
        const yellowRemedies = {
          'pain': 'Apply warm compress and rest',
          'urination_pain': 'Drink plenty of water',
          'cramping': 'Gentle massage and warm bath',
          'low_mood': 'Deep breathing exercises'
        };
        const primarySymptom = symptoms[0];
        const remedy = yellowRemedies[primarySymptom as keyof typeof yellowRemedies] || 'Rest and monitor';
        return langTemplates.yellow(primarySymptom, remedy);

      case 'red':
        const redSymptom = symptoms[0];
        return langTemplates.red(redSymptom);

      default:
        return langTemplates.help();
    }
  }

  // Process incoming SMS
  static async processIncomingSMS(from: string, body: string): Promise<string> {
    try {
      console.log(`📱 Received SMS from ${from}: ${body}`);

      // Handle special commands
      if (body.toLowerCase().includes('help')) {
        return this.generateResponse('green', [], 'english');
      }
      
      if (body.toLowerCase().includes('stop')) {
        // Update user's SMS consent
        await this.updateSMSConsent(from, false);
        return 'Aarogya: You have opted out of SMS alerts. Reply START to opt back in.';
      }

      if (body.toLowerCase().includes('start')) {
        // Opt back in
        await this.updateSMSConsent(from, true);
        return 'Aarogya: Welcome back! You can now receive health alerts. Send symptoms for guidance.';
      }

      // Find user by phone number
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('phone', from)
        .single();

      if (!userProfile) {
        // New user - send welcome message
        return this.generateResponse('green', [], 'english');
      }

      // Parse symptoms from SMS
      const symptoms = this.parseSymptoms(body);
      
      if (symptoms.length === 0) {
        return this.generateResponse('green', [], userProfile.preferred_language || 'english');
      }

      // Assess risk level
      const riskLevel = this.assessRiskLevel(symptoms);

      // Store SMS check-in in database
      await this.storeSMSCheckin(userProfile.id, symptoms, riskLevel, body);

      // Send emergency alert if red
      if (riskLevel === 'red') {
        await this.sendEmergencyAlert(userProfile.id, symptoms[0]);
      }

      // Generate and return response
      return this.generateResponse(riskLevel, symptoms, userProfile.preferred_language || 'english');

    } catch (error) {
      console.error('Error processing SMS:', error);
      return 'Aarogya: Sorry, there was an error. Please try again or contact support.';
    }
  }

  // Store SMS check-in in database
  static async storeSMSCheckin(userId: string, symptoms: string[], riskLevel: string, originalText: string) {
    try {
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

  // Send emergency alert to family contacts
  static async sendEmergencyAlert(userId: string, symptom: string) {
    try {
      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true);

      if (contacts && contacts.length > 0) {
        const primaryContact = contacts[0];
        const emergencyMessage = `Aarogya Emergency Alert: ${symptom} detected. Please check on your family member immediately.`;
        
        // In production, this would send actual SMS via Twilio
        console.log(`🚨 Emergency SMS would be sent to ${primaryContact.phone}: ${emergencyMessage}`);
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
    }
  }

  // Update SMS consent
  static async updateSMSConsent(phone: string, consent: boolean) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ voice_sms_consent: consent })
        .eq('phone', phone);

      if (error) {
        console.error('Error updating SMS consent:', error);
      }
    } catch (error) {
      console.error('Error in updateSMSConsent:', error);
    }
  }
}

// Twilio webhook handler
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;

    console.log(`📱 Twilio webhook received: From ${from}, Body: ${body}`);

    // Process the SMS
    const response = await RealSMSService.processIncomingSMS(from, body);

    // Return Twilio TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${response}</Message>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error('Error in SMS webhook:', error);
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Aarogya: Sorry, there was an error processing your message. Please try again.</Message>
</Response>`;

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

// Handle GET requests (for webhook verification)
export async function GET() {
  return new NextResponse('SMS Webhook is active', { status: 200 });
}
