import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ProfileView from '../ProfileView';
import { useCurrentProfile, usePublicProfile } from '../../hooks/useProfileQueries';

// Mock the profile query hooks
vi.mock('../../hooks/useProfileQueries', () => ({
  useCurrentProfile: vi.fn(),
  usePublicProfile: vi.fn(),
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
      profilePicturePath: null,
      nationality: { name: 'French' },
      specialization: { name: 'Web Development' },
    },
    studentProfile: {
      isSeekingInternship: true,
      isSeekingApprenticeship: false,
      portfolioUrl: 'https://portfolio.example.com',
      situationType: { name: 'En formation' },
    },
    diplomas: [
      {
        name: 'Bachelor in Computer Science',
        obtainedAt: '2023-06-15',
      },
    ],
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

// Wrapper component for providing necessary context
const TestWrapper = ({ children, initialEntries = ['/'] }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={children} />
        <Route path="/profile/:userId" element={children} />
      </Routes>
    </MemoryRouter>
  </QueryClientProvider>
);

describe('ProfileView Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders current user profile successfully', async () => {
    // Mock current profile hook
    useCurrentProfile.mockReturnValue({
      data: mockUserData,
      isLoading: false,
      error: null,
    });

    usePublicProfile.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileView />
      </TestWrapper>
    );

    // Wait for the component to render and verify content
    await waitFor(() => {
      // Use getByRole with name to find the heading
      expect(screen.getByRole('heading', { name: /John Doe/i })).toBeDefined();
      // Check for specialization
      expect(screen.getByText('Web Development')).toBeDefined();
      // Check for role badge
      expect(screen.getByText('STUDENT')).toBeDefined();
      // Check for internship badge
      expect(screen.getByText('Recherche Stage')).toBeDefined();
      // Check for edit profile button (only visible on current user profile)
      expect(screen.getByText('Modifier le profil')).toBeDefined();
    });
  });

  it('renders public profile successfully', async () => {
    // Mock public profile hook
    usePublicProfile.mockReturnValue({
      data: mockUserData,
      isLoading: false,
      error: null,
    });

    useCurrentProfile.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper initialEntries={['/profile/1']}>
        <ProfileView />
      </TestWrapper>
    );

    // Wait for the component to render and verify content
    await waitFor(() => {
      // Use getByRole with name to find the heading
      expect(screen.getByRole('heading', { name: /John Doe/i })).toBeDefined();
      // Check for specialization
      expect(screen.getByText('Web Development')).toBeDefined();
      // Check for role badge
      expect(screen.getByText('STUDENT')).toBeDefined();
      // Verify that private information is not displayed
      expect(screen.queryByText('john.doe@example.com')).toBeNull();
      // Edit profile button should not be visible on public profile
      expect(screen.queryByText('Modifier le profil')).toBeNull();
    });
  });

  it('shows loading state', () => {
    useCurrentProfile.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <TestWrapper>
        <ProfileView />
      </TestWrapper>
    );

    // Verify loading skeleton is displayed
    expect(screen.getByTestId('profile-loading')).toBeDefined();
  });

  it('shows error state', async () => {
    const errorMessage = 'Failed to load profile';
    useCurrentProfile.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error(errorMessage),
    });

    render(
      <TestWrapper>
        <ProfileView />
      </TestWrapper>
    );

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeDefined();
    });
  });
}); 