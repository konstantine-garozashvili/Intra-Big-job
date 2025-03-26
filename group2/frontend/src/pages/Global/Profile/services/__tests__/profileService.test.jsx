import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService } from '../profileService';
import apiService from '@/lib/services/apiService';

// Mock the apiService
vi.mock('@/lib/services/apiService', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPublicProfile', () => {
    it('should fetch public profile data for a given user ID', async () => {
      // Mock data
      const userId = '123';
      const mockResponse = {
        data: {
          success: true,
          data: {
            user: {
              id: 123,
              firstName: 'John',
              lastName: 'Doe',
              roles: [{ name: 'STUDENT' }],
            },
          },
        },
      };

      // Mock the API response
      apiService.get.mockResolvedValue(mockResponse);

      // Call the method
      const result = await profileService.getPublicProfile(userId);

      // Assertions
      expect(apiService.get).toHaveBeenCalledTimes(1);
      expect(apiService.get).toHaveBeenCalledWith(`/api/profil/public/${userId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw an error when the API call fails', async () => {
      // Mock data
      const userId = '123';
      const errorMessage = 'User not found';
      const mockError = new Error(errorMessage);

      // Mock the API response to throw an error
      apiService.get.mockRejectedValue(mockError);

      // Call the method and expect it to throw
      await expect(profileService.getPublicProfile(userId)).rejects.toThrow(mockError);
      expect(apiService.get).toHaveBeenCalledTimes(1);
      expect(apiService.get).toHaveBeenCalledWith(`/api/profil/public/${userId}`);
    });

    it('should handle missing userId gracefully', async () => {
      // Call with undefined userId
      await expect(profileService.getPublicProfile(undefined)).rejects.toThrow('User ID is required');
      
      // Call with null userId
      await expect(profileService.getPublicProfile(null)).rejects.toThrow('User ID is required');
      
      // Call with empty string userId
      await expect(profileService.getPublicProfile('')).rejects.toThrow('User ID is required');
    });
  });
}); 