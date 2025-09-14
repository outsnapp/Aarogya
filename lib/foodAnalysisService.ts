import { AIService } from './aiService';

export interface FoodNutrition {
  calories: number;
  protein_g: number;
  iron_mg: number;
  calcium_mg: number;
  confidence: number;
  food_name: string;
  serving_size: string;
  notes?: string;
}

export class FoodAnalysisService {
  // Cache for common Indian foods to make responses faster
  private static readonly FOOD_CACHE: Record<string, FoodNutrition> = {
    'dal': {
      calories: 120,
      protein_g: 8.5,
      iron_mg: 2.8,
      calcium_mg: 45,
      confidence: 0.95,
      food_name: 'Dal (Lentils)',
      serving_size: '1 cup (200g)',
      notes: 'Rich in protein and iron, good for postpartum recovery'
    },
    'rice': {
      calories: 130,
      protein_g: 2.7,
      iron_mg: 0.8,
      calcium_mg: 16,
      confidence: 0.95,
      food_name: 'Rice',
      serving_size: '1 cup (150g)',
      notes: 'Good source of energy, low in protein'
    },
    'roti': {
      calories: 71,
      protein_g: 2.4,
      iron_mg: 0.9,
      calcium_mg: 20,
      confidence: 0.95,
      food_name: 'Roti (Wheat Bread)',
      serving_size: '1 piece (25g)',
      notes: 'Whole wheat provides fiber and some protein'
    },
    'chapati': {
      calories: 71,
      protein_g: 2.4,
      iron_mg: 0.9,
      calcium_mg: 20,
      confidence: 0.95,
      food_name: 'Chapati',
      serving_size: '1 piece (25g)',
      notes: 'Whole wheat provides fiber and some protein'
    },
    'curd': {
      calories: 98,
      protein_g: 11,
      iron_mg: 0.1,
      calcium_mg: 364,
      confidence: 0.95,
      food_name: 'Curd (Yogurt)',
      serving_size: '1 cup (245g)',
      notes: 'Excellent source of calcium and protein'
    },
    'milk': {
      calories: 103,
      protein_g: 8,
      iron_mg: 0.1,
      calcium_mg: 276,
      confidence: 0.95,
      food_name: 'Milk',
      serving_size: '1 cup (244g)',
      notes: 'High in calcium and protein, good for bone health'
    },
    'eggs': {
      calories: 155,
      protein_g: 13,
      iron_mg: 1.2,
      calcium_mg: 56,
      confidence: 0.95,
      food_name: 'Eggs',
      serving_size: '2 large eggs (100g)',
      notes: 'Complete protein source, good for recovery'
    },
    'chicken': {
      calories: 165,
      protein_g: 31,
      iron_mg: 1.3,
      calcium_mg: 15,
      confidence: 0.95,
      food_name: 'Chicken',
      serving_size: '100g',
      notes: 'High protein, good for muscle recovery'
    },
    'fish': {
      calories: 206,
      protein_g: 22,
      iron_mg: 1.0,
      calcium_mg: 12,
      confidence: 0.95,
      food_name: 'Fish',
      serving_size: '100g',
      notes: 'High protein, omega-3 fatty acids'
    },
    'spinach': {
      calories: 23,
      protein_g: 2.9,
      iron_mg: 2.7,
      calcium_mg: 99,
      confidence: 0.95,
      food_name: 'Spinach',
      serving_size: '1 cup (30g)',
      notes: 'High in iron and calcium, great for postpartum'
    },
    'banana': {
      calories: 89,
      protein_g: 1.1,
      iron_mg: 0.3,
      calcium_mg: 5,
      confidence: 0.95,
      food_name: 'Banana',
      serving_size: '1 medium (118g)',
      notes: 'Good source of potassium and energy'
    },
    'apple': {
      calories: 52,
      protein_g: 0.3,
      iron_mg: 0.1,
      calcium_mg: 6,
      confidence: 0.95,
      food_name: 'Apple',
      serving_size: '1 medium (182g)',
      notes: 'Good source of fiber and vitamin C'
    }
  };

  /**
   * Analyze food name and return nutritional information
   * Uses cache for common foods, AI for unknown foods
   */
  static async analyzeFood(foodName: string): Promise<FoodNutrition> {
    try {
      // Clean and normalize food name
      const normalizedName = foodName.toLowerCase().trim();
      
      // Check cache first for fast response
      if (this.FOOD_CACHE[normalizedName]) {
        return this.FOOD_CACHE[normalizedName];
      }

      // Use AI for unknown foods
      return await this.analyzeFoodWithAI(foodName);
    } catch (error) {
      console.error('Error analyzing food:', error);
      // Return default values if AI fails
      return {
        calories: 100,
        protein_g: 5,
        iron_mg: 1,
        calcium_mg: 50,
        confidence: 0.3,
        food_name: foodName,
        serving_size: '1 serving',
        notes: 'Estimated values - please verify'
      };
    }
  }

  /**
   * Use AI to analyze food and extract nutritional information
   */
  private static async analyzeFoodWithAI(foodName: string): Promise<FoodNutrition> {
    const prompt = `Analyze the nutritional content of "${foodName}" for a postpartum mother in India. 

Please provide the nutritional values per typical serving size in this exact JSON format:
{
  "calories": number,
  "protein_g": number,
  "iron_mg": number,
  "calcium_mg": number,
  "confidence": number (0-1),
  "food_name": "string",
  "serving_size": "string",
  "notes": "string"
}

Consider:
- Typical Indian serving sizes
- Nutritional needs of postpartum mothers
- Common preparation methods in India
- Be conservative with estimates if unsure

Only return the JSON, no other text.`;

    try {
      const response = await AIService.generateResponse(prompt, 'nutrition_analysis');
      
      // Try to parse JSON response
      const cleanResponse = response.replace(/```json|```/g, '').trim();
      const nutritionData = JSON.parse(cleanResponse);
      
      // Validate and return
      return {
        calories: Math.round(nutritionData.calories || 100),
        protein_g: Math.round((nutritionData.protein_g || 5) * 10) / 10,
        iron_mg: Math.round((nutritionData.iron_mg || 1) * 10) / 10,
        calcium_mg: Math.round(nutritionData.calcium_mg || 50),
        confidence: Math.min(Math.max(nutritionData.confidence || 0.7, 0), 1),
        food_name: nutritionData.food_name || foodName,
        serving_size: nutritionData.serving_size || '1 serving',
        notes: nutritionData.notes || 'AI analyzed nutritional content'
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return default values if parsing fails
      return {
        calories: 100,
        protein_g: 5,
        iron_mg: 1,
        calcium_mg: 50,
        confidence: 0.3,
        food_name: foodName,
        serving_size: '1 serving',
        notes: 'Could not analyze - estimated values'
      };
    }
  }

  /**
   * Get common Indian foods for suggestions
   */
  static getCommonFoods(): string[] {
    return Object.keys(this.FOOD_CACHE).map(key => 
      this.FOOD_CACHE[key].food_name
    );
  }

  /**
   * Search for foods by name (for autocomplete)
   */
  static searchFoods(query: string): string[] {
    const normalizedQuery = query.toLowerCase();
    return Object.keys(this.FOOD_CACHE)
      .filter(key => 
        key.includes(normalizedQuery) || 
        this.FOOD_CACHE[key].food_name.toLowerCase().includes(normalizedQuery)
      )
      .map(key => this.FOOD_CACHE[key].food_name)
      .slice(0, 5); // Limit to 5 suggestions
  }
}
