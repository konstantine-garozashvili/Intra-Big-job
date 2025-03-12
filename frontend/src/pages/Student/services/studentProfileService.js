import apiService from '@/lib/services/apiService';

class StudentProfileService {
  /**
   * Get the student profile of the current authenticated user
   * @returns {Promise<Object>} The student profile data
   */
  async getMyProfile() {
    try {
      const response = await apiService.get('/api/student/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update the portfolio URL for the student
   * @param {string} portfolioUrl - The new portfolio URL
   * @returns {Promise<Object>} The updated student profile data
   */
  async updatePortfolioUrl(portfolioUrl) {
    try {
      const response = await apiService.put('/api/student/profile/portfolio-url', {
        portfolioUrl
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const studentProfileService = new StudentProfileService(); 