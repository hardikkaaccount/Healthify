import { auth } from '../firebase/config';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

class TempIntakeService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/temp-intake`;
  }

  async getAuthHeaders() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Add food entry to temporary daily intake
   * @param {object} foodData - Food entry data
   * @returns {Promise<object>} - Added food entry
   */
  async addFoodEntry(foodData) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify(foodData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to add food entry');
      }

      return result.data;
    } catch (error) {
      console.error('Error adding food entry to temp intake:', error);
      throw error;
    }
  }

  /**
   * Get today's temporary daily intake
   * @returns {Promise<object>} - Today's intake data
   */
  async getTodayIntake() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/today`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to get daily intake');
      }

      return result.data;
    } catch (error) {
      console.error('Error getting today\'s intake:', error);
      throw error;
    }
  }

  /**
   * Remove food entry from temporary daily intake
   * @param {string} entryId - Entry ID to remove
   * @returns {Promise<boolean>} - Success status
   */
  async removeFoodEntry(entryId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/${entryId}`, {
        method: 'DELETE',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to remove food entry');
      }

      return true;
    } catch (error) {
      console.error('Error removing food entry from temp intake:', error);
      throw error;
    }
  }

  /**
   * Get archived daily intake for specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<object>} - Archived intake data
   */
  async getArchivedIntake(date) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/archive/${date}`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No archived data for this date
        }
        throw new Error(result.message || 'Failed to get archived intake');
      }

      return result.data;
    } catch (error) {
      console.error('Error getting archived intake:', error);
      throw error;
    }
  }

  /**
   * Get available archive dates
   * @returns {Promise<string[]>} - Array of available dates
   */
  async getAvailableArchiveDates() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/archive-dates`, {
        method: 'GET',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to get archive dates');
      }

      return result.data;
    } catch (error) {
      console.error('Error getting archive dates:', error);
      throw error;
    }
  }

  /**
   * Compress image for storage
   * @param {string} imageBase64 - Base64 encoded image
   * @param {object} options - Compression options
   * @returns {Promise<object>} - Compression result
   */
  async compressImage(imageBase64, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/compress-image`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          image: imageBase64,
          options
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to compress image');
      }

      return result.data;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }

  /**
   * Manually trigger daily reset (for testing)
   * @returns {Promise<boolean>} - Success status
   */
  async resetDaily() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/reset`, {
        method: 'POST',
        headers
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset daily intake');
      }

      return true;
    } catch (error) {
      console.error('Error resetting daily intake:', error);
      throw error;
    }
  }

  /**
   * Format food data for temporary storage
   * @param {object} aiAnalysisResult - AI analysis result
   * @param {string} image - Optional compressed image
   * @returns {object} - Formatted food data
   */
  formatFoodDataForStorage(aiAnalysisResult, image = null) {
    return {
      name: aiAnalysisResult.foodName,
      calories: parseInt(aiAnalysisResult.calories) || 0,
      protein: parseFloat(aiAnalysisResult.nutritionFacts?.protein) || 0,
      carbs: parseFloat(aiAnalysisResult.nutritionFacts?.carbs) || 0,
      fat: parseFloat(aiAnalysisResult.nutritionFacts?.fat) || 0,
      serving_size: aiAnalysisResult.servingSize || '1 serving',
      analysis_type: 'ai_powered',
      health_score: aiAnalysisResult.healthScore || 5,
      recommendations: aiAnalysisResult.recommendation || '',
      image: image,
      metadata: {
        isHealthy: aiAnalysisResult.isHealthy,
        healthWarnings: aiAnalysisResult.healthWarnings || [],
        healthBenefits: aiAnalysisResult.healthBenefits || [],
        addedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Get intake summary for display
   * @param {object} intakeData - Intake data from API
   * @returns {object} - Formatted summary
   */
  getIntakeSummary(intakeData) {
    if (!intakeData || !intakeData.entries) {
      return {
        totalEntries: 0,
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        entries: []
      };
    }

    return {
      totalEntries: intakeData.entries.length,
      totalCalories: intakeData.totals.calories,
      totalProtein: intakeData.totals.protein,
      totalCarbs: intakeData.totals.carbs,
      totalFat: intakeData.totals.fat,
      entries: intakeData.entries.map(entry => ({
        id: entry.id,
        name: entry.name,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        servingSize: entry.serving_size,
        addedAt: entry.addedAt,
        image: entry.image,
        healthScore: entry.health_score,
        isTemporary: entry.isTemporary
      }))
    };
  }
}

const tempIntakeService = new TempIntakeService();
export default tempIntakeService;