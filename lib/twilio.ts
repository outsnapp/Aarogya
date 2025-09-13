// Twilio SMS Configuration for Real SMS Feature
import { Twilio } from 'twilio';

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

// Initialize Twilio client
export const twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export class TwilioSMSService {
  // Send SMS message
  static async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      const result = await twilioClient.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: to
      });

      console.log(`📱 SMS sent successfully: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Send welcome SMS to new user
  static async sendWelcomeSMS(phone: string, name: string, language: string = 'english'): Promise<boolean> {
    const welcomeMessages = {
      english: `Aarogya: Namaste ${name}! Welcome to Aarogya. Send your daily symptoms like: "bleeding" or "fever" or "sad". For help reply HELP.`,
      hindi: `आरोग्य: नमस्ते ${name}! आरोग्य में आपका स्वागत है। अपने लक्षण भेजें: "खून" या "बुखार" या "उदासी"। मदद के लिए HELP भेजें।`
    };

    const message = welcomeMessages[language as keyof typeof welcomeMessages] || welcomeMessages.english;
    return await this.sendSMS(phone, message);
  }

  // Send emergency SMS to family contacts
  static async sendEmergencySMS(phone: string, message: string): Promise<boolean> {
    const emergencyMessage = `Aarogya Emergency Alert: ${message} - Please check on your family member immediately.`;
    return await this.sendSMS(phone, emergencyMessage);
  }

  // Send health reminder SMS
  static async sendHealthReminder(phone: string, reminder: string): Promise<boolean> {
    const reminderMessage = `Aarogya Reminder: ${reminder} Reply with your symptoms for health check.`;
    return await this.sendSMS(phone, reminderMessage);
  }
}

// Demo function to test SMS sending
export const testSMSSending = async () => {
  console.log('🧪 Testing SMS functionality...');
  
  // Test SMS (replace with your phone number for testing)
  const testPhone = '+1234567890'; // Replace with actual test number
  const testMessage = 'Aarogya: This is a test message from your health monitoring system.';
  
  const success = await TwilioSMSService.sendSMS(testPhone, testMessage);
  
  if (success) {
    console.log('✅ SMS test successful!');
  } else {
    console.log('❌ SMS test failed!');
  }
  
  return success;
};
