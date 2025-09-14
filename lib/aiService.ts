import { supabase } from './supabase';

// OpenRouter API configuration
const OPENROUTER_API_KEY = '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';
const OPENROUTER_MODEL = 'deepseek/deepseek-r1-0528-qwen3-8b:free';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export interface AIInsight {
  id?: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  created_at?: string;
}

export interface HealthAnalysis {
  overallHealth: string;
  trend: string;
  recommendations: string[];
  concerns: string[];
  strengths: string[];
  nextSteps: string[];
}

export class AIService {
  // Generate AI insights for mother health
  static async generateMotherHealthInsights(userId: string, healthData: any): Promise<AIInsight[]> {
    try {
      const prompt = this.buildMotherHealthPrompt(healthData);
      const aiResponse = await this.callOpenRouterAPI(prompt);
      
      if (aiResponse) {
        const insights = this.parseHealthInsights(aiResponse, userId);
        
        // Save insights to database (using mother_health_metrics as fallback)
        for (const insight of insights) {
          await this.saveInsight(insight);
        }
        
        return insights;
      }
      
      return [];
    } catch (error) {
      console.error('Error generating mother health insights:', error);
      return [];
    }
  }

  // Generate AI insights for baby health
  static async generateBabyHealthInsights(userId: string, babyData: any): Promise<AIInsight[]> {
    try {
      const prompt = this.buildBabyHealthPrompt(babyData);
      const aiResponse = await this.callOpenRouterAPI(prompt);
      
      if (aiResponse) {
        const insights = this.parseHealthInsights(aiResponse, userId);
        
        // Save insights to database
        for (const insight of insights) {
          await this.saveInsight(insight);
        }
        
        return insights;
      }
      
      return [];
    } catch (error) {
      console.error('Error generating baby health insights:', error);
      return [];
    }
  }

  // Generate AI response for anonymous questions
  static async generateAnonymousQuestionResponse(question: string): Promise<string> {
    try {
      const prompt = this.buildAnonymousQuestionPrompt(question);
      const aiResponse = await this.callOpenRouterAPI(prompt);
      
      return aiResponse || 'I apologize, but I cannot provide a response at this time. Please consult with a healthcare professional for medical advice.';
    } catch (error) {
      console.error('Error generating anonymous question response:', error);
      return 'I apologize, but I cannot provide a response at this time. Please consult with a healthcare professional for medical advice.';
    }
  }

  // Generate AI recovery timeline insights
  static async generateRecoveryTimelineInsights(userId: string, recoveryData: any): Promise<AIInsight[]> {
    try {
      const prompt = this.buildRecoveryTimelinePrompt(recoveryData);
      const aiResponse = await this.callOpenRouterAPI(prompt);
      
      if (aiResponse) {
        const insights = this.parseHealthInsights(aiResponse, userId);
        
        for (const insight of insights) {
          await this.saveInsight(insight);
        }
        
        return insights;
      }
      
      return [];
    } catch (error) {
      console.error('Error generating recovery timeline insights:', error);
      return [];
    }
  }

  // Generate comprehensive health analysis
  static async generateHealthAnalysis(userId: string, allHealthData: any): Promise<HealthAnalysis> {
    try {
      const prompt = this.buildHealthAnalysisPrompt(allHealthData);
      const aiResponse = await this.callOpenRouterAPI(prompt);
      
      if (aiResponse) {
        return this.parseHealthAnalysis(aiResponse);
      }
      
      return {
        overallHealth: 'Good',
        trend: 'stable',
        recommendations: ['Continue monitoring your health regularly'],
        concerns: [],
        strengths: ['Regular health tracking'],
        nextSteps: ['Keep up the good work']
      };
    } catch (error) {
      console.error('Error generating health analysis:', error);
      return {
        overallHealth: 'Good',
        trend: 'stable',
        recommendations: ['Continue monitoring your health regularly'],
        concerns: [],
        strengths: ['Regular health tracking'],
        nextSteps: ['Keep up the good work']
      };
    }
  }

  // Call OpenRouter API
  private static async callOpenRouterAPI(prompt: string): Promise<string | null> {
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://aarogya-app.com',
          'X-Title': 'Aarogya Health App'
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful and knowledgeable healthcare AI assistant specializing in maternal and child health. Provide accurate, evidence-based advice while always recommending consultation with healthcare professionals for medical concerns.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      return null;
    }
  }

  // Build prompts for different use cases
  private static buildMotherHealthPrompt(healthData: any): string {
    const { healthMetrics, nutritionEntries, dailyCheckIns } = healthData;
    
    let prompt = `As a healthcare AI assistant, analyze the following maternal health data and provide 3-5 specific, actionable insights:

MOTHER HEALTH DATA:
`;

    if (healthMetrics && healthMetrics.length > 0) {
      const latest = healthMetrics[0];
      prompt += `\nRecent Health Metrics:
- Weight: ${latest.weight || 'Not recorded'} kg
- Blood Pressure: ${latest.blood_pressure_systolic || 'Not recorded'}/${latest.blood_pressure_diastolic || 'Not recorded'}
- Energy Level: ${latest.energy_level || 'Not recorded'}/10
- Sleep Hours: ${latest.sleep_hours || 'Not recorded'} hours
- Mood Score: ${latest.mood_score || 'Not recorded'}/10
- Notes: ${latest.notes || 'None'}`;
    }

    if (nutritionEntries && nutritionEntries.length > 0) {
      const recent = nutritionEntries.slice(0, 3);
      prompt += `\n\nRecent Nutrition Entries:`;
      recent.forEach((entry: any, index: number) => {
        prompt += `\n${index + 1}. ${entry.meal_type}: ${entry.calories || 0} calories, ${entry.protein_g || 0}g protein, ${entry.iron_mg || 0}mg iron`;
      });
    }

    if (dailyCheckIns && dailyCheckIns.length > 0) {
      const latest = dailyCheckIns[0];
      prompt += `\n\nLatest Daily Check-in:
- Overall Wellbeing: ${latest.overall_wellbeing}/10
- Mood: ${latest.mood}
- Energy Level: ${latest.energy_level}/10
- Sleep Quality: ${latest.sleep_quality}/10
- Pain Level: ${latest.pain_level}/10
- Stress Level: ${latest.stress_level}/10
- Concerns: ${latest.concerns || 'None'}`;
    }

    prompt += `\n\nPlease provide insights in this exact JSON format:
[
  {
    "title": "Insight Title",
    "description": "Detailed description of the insight",
    "recommendation": "Specific actionable recommendation",
    "priority": "high/medium/low"
  }
]

Focus on:
1. Health trends and patterns
2. Nutritional adequacy
3. Recovery progress
4. Areas needing attention
5. Positive reinforcement for good practices

Be specific, actionable, and encouraging. Always recommend consulting healthcare professionals for medical concerns.`;

    return prompt;
  }

  private static buildBabyHealthPrompt(babyData: any): string {
    const { babyProfile, growth, milestones, feeding } = babyData;
    
    let prompt = `As a healthcare AI assistant, analyze the following baby health data and provide 3-5 specific, actionable insights:

BABY HEALTH DATA:
`;

    if (babyProfile) {
      prompt += `\nBaby Profile:
- Age: ${babyProfile.age_months || 'Unknown'} months
- Birth Weight: ${babyProfile.birth_weight || 'Unknown'} kg
- Current Weight: ${babyProfile.current_weight || 'Unknown'} kg
- Delivery Type: ${babyProfile.delivery_type || 'Unknown'}`;
    }

    if (growth && growth.length > 0) {
      const latest = growth[0];
      prompt += `\n\nLatest Growth Measurements:
- Weight: ${latest.weight || 'Not recorded'} kg
- Height: ${latest.height || 'Not recorded'} cm
- Head Circumference: ${latest.head_circumference || 'Not recorded'} cm
- Date: ${latest.measurement_date || 'Unknown'}`;
    }

    if (milestones && milestones.length > 0) {
      prompt += `\n\nRecent Milestones:`;
      milestones.slice(0, 3).forEach((milestone: any, index: number) => {
        prompt += `\n${index + 1}. ${milestone.milestone_type}: ${milestone.description}`;
      });
    }

    if (feeding && feeding.length > 0) {
      const recent = feeding.slice(0, 3);
      prompt += `\n\nRecent Feeding Records:`;
      recent.forEach((feed: any, index: number) => {
        prompt += `\n${index + 1}. ${feed.feeding_type}: ${feed.amount || 'Unknown'} ${feed.unit || 'ml'}`;
      });
    }

    prompt += `\n\nPlease provide insights in this exact JSON format:
[
  {
    "title": "Insight Title",
    "description": "Detailed description of the insight",
    "recommendation": "Specific actionable recommendation",
    "priority": "high/medium/low"
  }
]

Focus on:
1. Growth and development patterns
2. Feeding adequacy
3. Milestone achievements
4. Areas needing attention
5. Positive reinforcement for good practices

Be specific, actionable, and encouraging. Always recommend consulting pediatricians for medical concerns.`;

    return prompt;
  }

  private static buildAnonymousQuestionPrompt(question: string): string {
    return `As a healthcare AI assistant, please provide a helpful and informative response to this anonymous health question. Be supportive, evidence-based, and always recommend consulting healthcare professionals for medical concerns.

Question: "${question}"

Please provide a clear, helpful response that:
1. Addresses the question directly
2. Provides evidence-based information
3. Offers practical advice when appropriate
4. Emphasizes the importance of professional medical consultation
5. Is encouraging and supportive

Keep the response concise but comprehensive (2-3 paragraphs maximum).`;
  }

  private static buildRecoveryTimelinePrompt(recoveryData: any): string {
    let prompt = `As a healthcare AI assistant, analyze the following postpartum recovery data and provide insights:

RECOVERY DATA:
`;

    if (recoveryData.milestones) {
      prompt += `\nRecovery Milestones:`;
      recoveryData.milestones.forEach((milestone: any, index: number) => {
        prompt += `\n${index + 1}. ${milestone.title}: ${milestone.description}`;
      });
    }

    if (recoveryData.predictions) {
      prompt += `\n\nRecovery Predictions:`;
      recoveryData.predictions.forEach((prediction: any, index: number) => {
        prompt += `\n${index + 1}. ${prediction.title}: ${prediction.description}`;
      });
    }

    prompt += `\n\nPlease provide insights in this exact JSON format:
[
  {
    "title": "Recovery Insight Title",
    "description": "Detailed description of the recovery insight",
    "recommendation": "Specific actionable recommendation for recovery",
    "priority": "high/medium/low"
  }
]

Focus on:
1. Recovery progress and timeline
2. Physical healing milestones
3. Emotional wellbeing
4. Areas needing attention
5. Encouragement and positive reinforcement

Be specific, actionable, and encouraging. Always recommend consulting healthcare professionals for medical concerns.`;

    return prompt;
  }

  private static buildHealthAnalysisPrompt(allHealthData: any): string {
    return `As a healthcare AI assistant, provide a comprehensive health analysis based on the following data:

${JSON.stringify(allHealthData, null, 2)}

Please provide a comprehensive analysis in this exact JSON format:
{
  "overallHealth": "Excellent/Good/Fair/Needs Attention",
  "trend": "improving/stable/declining",
  "recommendations": ["Specific recommendation 1", "Specific recommendation 2"],
  "concerns": ["Any concerns identified"],
  "strengths": ["Positive aspects identified"],
  "nextSteps": ["Next steps to take"]
}

Focus on providing actionable insights and always recommend professional medical consultation when appropriate.`;
  }

  // Parse AI responses
  private static parseHealthInsights(aiResponse: string, userId: string): AIInsight[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]);
        return insights.map((insight: any, index: number) => ({
          id: `ai-insight-${Date.now()}-${index}`,
          user_id: userId,
          category: 'ai_generated',
          title: insight.title || 'Health Insight',
          description: insight.description || 'AI-generated health insight',
          recommendation: insight.recommendation || 'Continue monitoring your health',
          priority: insight.priority || 'medium',
          created_at: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error parsing AI insights:', error);
    }

    // Fallback: create a single insight from the response
    return [{
      id: `ai-insight-${Date.now()}`,
      user_id: userId,
      category: 'ai_generated',
      title: 'AI Health Insight',
      description: aiResponse.substring(0, 200) + '...',
      recommendation: 'Please review the full insight and consult with healthcare professionals as needed.',
      priority: 'medium',
      created_at: new Date().toISOString()
    }];
  }

  private static parseHealthAnalysis(aiResponse: string): HealthAnalysis {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing health analysis:', error);
    }

    return {
      overallHealth: 'Good',
      trend: 'stable',
      recommendations: ['Continue monitoring your health regularly'],
      concerns: [],
      strengths: ['Regular health tracking'],
      nextSteps: ['Keep up the good work']
    };
  }

  // Save insight to database (using mother_health_metrics as fallback)
  private static async saveInsight(insight: AIInsight): Promise<void> {
    try {
      const healthMetric = {
        user_id: insight.user_id,
        recorded_date: new Date().toISOString().split('T')[0],
        notes: `AI INSIGHT: ${insight.title} | ${insight.description} | RECOMMENDATION: ${insight.recommendation} | PRIORITY: ${insight.priority}`
      };

      await supabase
        .from('mother_health_metrics')
        .insert([healthMetric]);
    } catch (error) {
      console.error('Error saving AI insight:', error);
    }
  }

  // Get AI insights from database
  static async getAIInsights(userId: string, limit: number = 5): Promise<AIInsight[]> {
    try {
      const { data, error } = await supabase
        .from('mother_health_metrics')
        .select('*')
        .eq('user_id', userId)
        .like('notes', 'AI INSIGHT:%')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(metric => {
        const notes = metric.notes || '';
        const parts = notes.split(' | ');
        
        return {
          id: metric.id,
          user_id: metric.user_id,
          category: 'ai_generated',
          title: parts[0]?.replace('AI INSIGHT: ', '') || 'AI Insight',
          description: parts[1] || 'AI-generated health insight',
          recommendation: parts[2]?.replace('RECOMMENDATION: ', '') || 'Continue monitoring your health',
          priority: parts[3]?.replace('PRIORITY: ', '') as 'low' | 'medium' | 'high' || 'medium',
          created_at: metric.created_at
        };
      });
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      return [];
    }
  }
}
