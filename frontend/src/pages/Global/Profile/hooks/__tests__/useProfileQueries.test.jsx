import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCurrentProfile, usePublicProfile, profileKeys } from '../useProfileQueries';
import { profileService } from '../../services/profileService';

// Mock the profile service
vi.mock('../../services/profileService', () => ({
  profileService: {
    getAllProfileData: vi.fn(),
    getPublicProfile: vi.fn(),
  },
}));

// Sample user data for testing
const mockUserData = {
  data: {
    user: {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      roles: [{ name: 'STUDENT' }],
    },
  },
};

// Setup QueryClient for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper for the hooks
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Profile Query Hooks', () => {
  beforeEach(() => {
    // Clear all mocks and query cache before each test
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useCurrentProfile', () => {
    it('fetches current profile data successfully', async () => {
      // Mock the service response
      profileService.getAllProfileData.mockResolvedValue(mockUserData);

      // Render the hook
      const { result } = renderHook(() => useCurrentProfile(), { wrapper });

      // Initially should be loading
      expect(result.current.isLoading).toBe(true);

      // Wait for the query to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the data
      expect(result.current.data).toEqual(mockUserData);
      expect(profileService.getAllProfileData).toHaveBeenCalledTimes(1);
    });

    it('handles error when fetching current profile fails', async () => {
      // Mock the service to throw an error
      const error = new Error('Failed to fetch profile');
      profileService.getAllProfileData.mockRejectedValue(error);

      // Render the hook
      const { result } = renderHook(() => useCurrentProfile(), { wrapper });

      // Wait for the query to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the error
      expect(result.current.error).toBeTruthy();
      expect(result.current.error.message).toBe('Failed to fetch profile');
    });
  });

  describe('usePublicProfile', () => {
    it('fetches public profile data successfully', async () => {
      const userId = '1';
      // Mock the service response
      profileService.getPublicProfile.mockResolvedValue(mockUserData);

      // Render the hook
      const { result } = renderHook(() => usePublicProfile(userId), { wrapper });

      // Initially should be loading
      expect(result.current.isLoading).toBe(true);

      // Wait for the query to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the data
      expect(result.current.data).toEqual(mockUserData);
      expect(profileService.getPublicProfile).toHaveBeenCalledWith(userId);
      expect(profileService.getPublicProfile).toHaveBeenCalledTimes(1);
    });

    it('does not fetch when userId is not provided', () => {
      // Render the hook without userId
      const { result } = renderHook(() => usePublicProfile(null), { wrapper });

      // Should not be loading and no data should be present
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(profileService.getPublicProfile).not.toHaveBeenCalled();
    });

    it('handles error when fetching public profile fails', async () => {
      const userId = '1';
      // Mock the service to throw an error
      const error = new Error('Failed to fetch public profile');
      profileService.getPublicProfile.mockRejectedValue(error);

      // Render the hook
      const { result } = renderHook(() => usePublicProfile(userId), { wrapper });

      // Wait for the query to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify the error
      expect(result.current.error).toBeTruthy();
      expect(result.current.error.message).toBe('Failed to fetch public profile');
    });
  });

  describe('profileKeys', () => {
    it('generates correct query keys', () => {
      const userId = '1';
      
      expect(profileKeys.all).toEqual(['profile']);
      expect(profileKeys.current()).toEqual(['profile', 'current']);
      expect(profileKeys.public(userId)).toEqual(['profile', 'public', userId]);
    });
  });
}); 