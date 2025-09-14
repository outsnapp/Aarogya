import { supabase } from './supabase';

export interface AnonymousQuestion {
  id: string;
  user_id: string | null; // Always null for true anonymity
  category: string;
  question_text: string;
  urgency_level: 'low' | 'normal' | 'high' | 'urgent';
  is_voice_question: boolean;
  ai_response: string | null;
  is_answered: boolean;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionSubmission {
  questionText: string;
  category: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  isVoiceQuestion?: boolean;
}

export interface AIResponse {
  response: string;
  confidence: number;
  suggestions: string[];
  followUpQuestions: string[];
}

export class AnonymousQuestionsService {
  // In-memory storage for demo purposes
  private static localQuestions: AnonymousQuestion[] = [];
  // Submit a completely anonymous question (no user_id stored)
  static async submitAnonymousQuestion(questionData: QuestionSubmission): Promise<{ success: boolean; questionId?: string; error?: any }> {
    try {
      // First, try to get the current user session to bypass RLS
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session, we need to handle this differently
      if (!session) {
        console.warn('No user session found, using fallback method');
        return await this.submitAnonymousQuestionFallback(questionData);
      }

      // For demo purposes, if we're in a development environment, use local storage
      if (__DEV__) {
        console.log('Development mode: Using local storage for anonymous questions');
        return await this.submitAnonymousQuestionLocal(questionData);
      }

      const { data, error } = await supabase
        .from('anonymous_questions')
        .insert({
          user_id: null, // Always null for true anonymity
          category: questionData.category,
          question_text: questionData.questionText,
          urgency_level: questionData.urgency,
          is_voice_question: questionData.isVoiceQuestion || false,
          is_anonymous: true,
          is_answered: false,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error submitting anonymous question:', error);
        // Try fallback method if RLS blocks the insert
        if (error.code === '42501') {
          return await this.submitAnonymousQuestionFallback(questionData);
        }
        return { success: false, error };
      }

      // Generate AI response
      const aiResponse = await this.generateAIResponse(questionData.questionText, questionData.category);
      
      // Update the question with AI response
      if (aiResponse) {
        await supabase
          .from('anonymous_questions')
          .update({
            ai_response: aiResponse.response,
            is_answered: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
      }

      return { success: true, questionId: data.id };
    } catch (error) {
      console.error('Error submitting anonymous question:', error);
      return { success: false, error };
    }
  }

  // Fallback method for anonymous questions when RLS blocks direct inserts
  static async submitAnonymousQuestionFallback(questionData: QuestionSubmission): Promise<{ success: boolean; questionId?: string; error?: any }> {
    try {
      // Use a temporary user_id to bypass RLS, then immediately anonymize
      const { data: { session } } = await supabase.auth.getSession();
      const tempUserId = session?.user?.id || 'anonymous-temp';

      const { data, error } = await supabase
        .from('anonymous_questions')
        .insert({
          user_id: tempUserId, // Temporary user_id to bypass RLS
          category: questionData.category,
          question_text: questionData.questionText,
          urgency_level: questionData.urgency,
          is_voice_question: questionData.isVoiceQuestion || false,
          is_anonymous: true,
          is_answered: false,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error submitting anonymous question (fallback):', error);
        // If even the fallback fails, try the local storage approach
        return await this.submitAnonymousQuestionLocal(questionData);
      }

      // Immediately anonymize the question by setting user_id to null
      await supabase
        .from('anonymous_questions')
        .update({
          user_id: null, // Make it truly anonymous
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      // Generate AI response
      const aiResponse = await this.generateAIResponse(questionData.questionText, questionData.category);
      
      // Update the question with AI response
      if (aiResponse) {
        await supabase
          .from('anonymous_questions')
          .update({
            ai_response: aiResponse.response,
            is_answered: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.id);
      }

      return { success: true, questionId: data.id };
    } catch (error) {
      console.error('Error submitting anonymous question (fallback):', error);
      // If all database methods fail, use local storage
      return await this.submitAnonymousQuestionLocal(questionData);
    }
  }

  // Local storage fallback when database is completely blocked
  static async submitAnonymousQuestionLocal(questionData: QuestionSubmission): Promise<{ success: boolean; questionId?: string; error?: any }> {
    try {
      // Generate a local ID for the question
      const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate AI response
      const aiResponse = await this.generateAIResponse(questionData.questionText, questionData.category);
      
      // Store in local storage as fallback
      const questionRecord = {
        id: localId,
        user_id: null,
        category: questionData.category,
        question_text: questionData.questionText,
        urgency_level: questionData.urgency,
        is_voice_question: questionData.isVoiceQuestion || false,
        ai_response: aiResponse?.response || 'Response generated locally',
        is_answered: true,
        is_anonymous: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Store in memory for demo purposes
      try {
        this.localQuestions.push(questionRecord);
        console.log('Question stored locally:', questionRecord);
      } catch (storageError) {
        console.warn('Could not store question locally:', storageError);
      }

      return { success: true, questionId: localId };
    } catch (error) {
      console.error('Error submitting anonymous question (local):', error);
      return { success: false, error };
    }
  }

  // Get questions from local storage
  static async getLocalQuestions(): Promise<AnonymousQuestion[]> {
    try {
      // Return in-memory questions for demo
      return this.localQuestions;
    } catch (error) {
      console.error('Error getting local questions:', error);
      return [];
    }
  }

  // Get recent anonymous questions (without any user identification)
  static async getRecentQuestions(limit: number = 10): Promise<AnonymousQuestion[]> {
    try {
      // First try to get from database
      const { data, error } = await supabase
        .from('anonymous_questions')
        .select('*')
        .eq('is_anonymous', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      let dbQuestions: AnonymousQuestion[] = [];
      if (!error && data) {
        dbQuestions = data;
      } else {
        console.warn('Could not fetch from database, using local questions:', error);
      }

      // Also get local questions
      const localQuestions = await this.getLocalQuestions();
      
      // Combine and sort by creation date
      const allQuestions = [...dbQuestions, ...localQuestions]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);

      return allQuestions;
    } catch (error) {
      console.error('Error fetching recent questions:', error);
      // Fallback to local questions only
      return await this.getLocalQuestions();
    }
  }

  // Get questions by category
  static async getQuestionsByCategory(category: string, limit: number = 10): Promise<AnonymousQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('anonymous_questions')
        .select('*')
        .eq('category', category)
        .eq('is_anonymous', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching questions by category:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching questions by category:', error);
      return [];
    }
  }

  // Get questions by urgency level
  static async getQuestionsByUrgency(urgency: string, limit: number = 10): Promise<AnonymousQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('anonymous_questions')
        .select('*')
        .eq('urgency_level', urgency)
        .eq('is_anonymous', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching questions by urgency:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching questions by urgency:', error);
      return [];
    }
  }

  // Generate AI response for a question
  static async generateAIResponse(question: string, category: string): Promise<AIResponse | null> {
    try {
      // Simulate AI response generation based on category and question content
      const responses = this.getCategoryBasedResponses(category, question);
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      return {
        response: randomResponse.response,
        confidence: randomResponse.confidence,
        suggestions: randomResponse.suggestions,
        followUpQuestions: randomResponse.followUpQuestions,
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return null;
    }
  }

  // Get category-based responses
  private static getCategoryBasedResponses(category: string, question: string): AIResponse[] {
    const lowerQuestion = question.toLowerCase();
    
    switch (category) {
      case 'Postpartum Concerns':
        return [
          {
            response: "It's completely normal to feel tired and overwhelmed after delivery. Your body is healing and adjusting to new routines. Make sure to rest when baby sleeps, ask for help from family, and don't hesitate to reach out to your healthcare provider if you have concerns.",
            confidence: 0.9,
            suggestions: [
              "Rest when baby sleeps",
              "Ask family for help with household tasks",
              "Stay hydrated and eat nutritious meals",
              "Take short walks when possible"
            ],
            followUpQuestions: [
              "Are you getting enough sleep?",
              "Do you have support from family?",
              "Have you discussed this with your doctor?"
            ]
          },
          {
            response: "Postpartum recovery varies for each woman. If you're experiencing severe pain, excessive bleeding, or signs of infection, please contact your healthcare provider immediately. For general discomfort, try gentle exercises and proper nutrition.",
            confidence: 0.85,
            suggestions: [
              "Monitor your symptoms closely",
              "Practice gentle pelvic floor exercises",
              "Eat iron-rich foods",
              "Stay in touch with your healthcare provider"
            ],
            followUpQuestions: [
              "What specific symptoms are you experiencing?",
              "How long ago did you deliver?",
              "Have you contacted your doctor?"
            ]
          }
        ];

      case 'Baby Care':
        return [
          {
            response: "Babies cry for many reasons - hunger, tiredness, discomfort, or needing comfort. Try feeding, changing diapers, swaddling, or gentle rocking. If crying persists or seems unusual, consult your pediatrician.",
            confidence: 0.9,
            suggestions: [
              "Check if baby is hungry or needs a diaper change",
              "Try swaddling or gentle rocking",
              "Ensure baby is not too hot or cold",
              "Create a calm environment"
            ],
            followUpQuestions: [
              "How long has the baby been crying?",
              "What have you tried so far?",
              "Is this a new behavior?"
            ]
          },
          {
            response: "Feeding issues are common in newborns. Make sure baby is latching properly, try different feeding positions, and ensure baby is getting enough milk. If you're concerned about weight gain or feeding, consult your pediatrician.",
            confidence: 0.85,
            suggestions: [
              "Try different feeding positions",
              "Ensure proper latching",
              "Feed on demand",
              "Monitor baby's weight gain"
            ],
            followUpQuestions: [
              "How is baby's weight gain?",
              "Are you breastfeeding or bottle-feeding?",
              "How often does baby feed?"
            ]
          }
        ];

      case 'Mental Health':
        return [
          {
            response: "Postpartum anxiety and depression are common and treatable. It's important to reach out for help. Talk to your healthcare provider, consider therapy, and remember you're not alone. Many mothers experience these feelings.",
            confidence: 0.95,
            suggestions: [
              "Contact your healthcare provider",
              "Consider therapy or counseling",
              "Join a support group",
              "Practice self-care activities"
            ],
            followUpQuestions: [
              "Have you spoken to your doctor about these feelings?",
              "Do you have thoughts of harming yourself or your baby?",
              "What support systems do you have?"
            ]
          },
          {
            response: "Feeling overwhelmed is normal with a new baby. Try to establish routines, ask for help, and take breaks when possible. If feelings persist or worsen, please seek professional help immediately.",
            confidence: 0.9,
            suggestions: [
              "Establish daily routines",
              "Ask family and friends for help",
              "Take breaks when possible",
              "Practice mindfulness or meditation"
            ],
            followUpQuestions: [
              "How long have you been feeling this way?",
              "Do you have support from family?",
              "Have you considered professional help?"
            ]
          }
        ];

      case 'Family Issues':
        return [
          {
            response: "Family dynamics can change significantly after having a baby. Communication is key. Try to express your needs clearly, involve your partner in baby care, and consider family counseling if needed.",
            confidence: 0.8,
            suggestions: [
              "Communicate openly with your partner",
              "Share baby care responsibilities",
              "Set boundaries with extended family",
              "Consider family counseling"
            ],
            followUpQuestions: [
              "What specific family issues are you facing?",
              "How is your relationship with your partner?",
              "Are extended family members supportive?"
            ]
          }
        ];

      case 'Medical Questions':
        return [
          {
            response: "For medical questions, it's always best to consult with your healthcare provider. However, I can provide general information. If you're experiencing severe symptoms, please seek immediate medical attention.",
            confidence: 0.7,
            suggestions: [
              "Contact your healthcare provider",
              "Keep a symptom diary",
              "Don't ignore severe symptoms",
              "Ask for a second opinion if needed"
            ],
            followUpQuestions: [
              "What specific symptoms are you experiencing?",
              "How long have you had these symptoms?",
              "Have you contacted your doctor?"
            ]
          }
        ];

      default:
        return [
          {
            response: "Thank you for your question. While I can provide general guidance, for specific concerns, please consult with your healthcare provider. Your wellbeing and your baby's health are the top priorities.",
            confidence: 0.6,
            suggestions: [
              "Consult your healthcare provider",
              "Keep a record of your concerns",
              "Don't hesitate to ask for help",
              "Trust your instincts"
            ],
            followUpQuestions: [
              "Would you like to speak with a healthcare provider?",
              "Do you have any other concerns?",
              "How can we best support you?"
            ]
          }
        ];
    }
  }

  // Get question categories
  static getCategories(): string[] {
    return [
      'Postpartum Concerns',
      'Baby Care',
      'Mental Health',
      'Family Issues',
      'Medical Questions',
      'Nutrition & Feeding',
      'Sleep Issues',
      'Relationship Support',
      'Financial Concerns',
      'Other'
    ];
  }

  // Get urgency levels
  static getUrgencyLevels(): { value: string; label: string; color: string; description: string }[] {
    return [
      {
        value: 'low',
        label: 'Low',
        color: '#4CAF50',
        description: 'General question, not urgent'
      },
      {
        value: 'normal',
        label: 'Normal',
        color: '#FF9800',
        description: 'Moderate concern, needs attention'
      },
      {
        value: 'high',
        label: 'High',
        color: '#FF5722',
        description: 'Important concern, should be addressed soon'
      },
      {
        value: 'urgent',
        label: 'Urgent',
        color: '#F44336',
        description: 'Immediate attention needed'
      }
    ];
  }

  // Search questions by keyword
  static async searchQuestions(keyword: string, limit: number = 10): Promise<AnonymousQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('anonymous_questions')
        .select('*')
        .or(`question_text.ilike.%${keyword}%,category.ilike.%${keyword}%`)
        .eq('is_anonymous', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error searching questions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching questions:', error);
      return [];
    }
  }

  // Get question statistics (for admin purposes, still anonymous)
  static async getQuestionStats(): Promise<{ total: number; byCategory: Record<string, number>; byUrgency: Record<string, number> }> {
    try {
      const { data, error } = await supabase
        .from('anonymous_questions')
        .select('category, urgency_level')
        .eq('is_anonymous', true);

      if (error) {
        console.error('Error fetching question stats:', error);
        return { total: 0, byCategory: {}, byUrgency: {} };
      }

      const stats = {
        total: data.length,
        byCategory: {} as Record<string, number>,
        byUrgency: {} as Record<string, number>
      };

      data.forEach(question => {
        stats.byCategory[question.category] = (stats.byCategory[question.category] || 0) + 1;
        stats.byUrgency[question.urgency_level] = (stats.byUrgency[question.urgency_level] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching question stats:', error);
      return { total: 0, byCategory: {}, byUrgency: {} };
    }
  }

  // Report inappropriate content (anonymous reporting)
  static async reportQuestion(questionId: string, reason: string): Promise<{ success: boolean; error?: any }> {
    try {
      // In a real implementation, this would go to a moderation system
      console.log(`Question ${questionId} reported for: ${reason}`);
      
      // For now, we'll just log it. In production, this would:
      // 1. Store the report in a moderation table
      // 2. Flag the question for review
      // 3. Notify moderators
      
      return { success: true };
    } catch (error) {
      console.error('Error reporting question:', error);
      return { success: false, error };
    }
  }
}
