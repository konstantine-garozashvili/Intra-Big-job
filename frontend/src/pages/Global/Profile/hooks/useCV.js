import { useApiQuery, useApiMutation } from '@/hooks/useReactQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';

// Define constant query keys at module level
export const CV_QUERY_KEYS = {
  userCV: ['userCVDocument'],
  documents: ['documents']
};

/**
 * Custom hook for managing CV document operations with React Query
 * @returns {Object} CV document data and operations
 */
export function useCV() {
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);
  
  // Reset isMountedRef on component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Query for CV document
  const cvQuery = useApiQuery(
    '/api/documents/type/CV',
    CV_QUERY_KEYS.userCV,
    {
      staleTime: 0, // Always consider data stale to ensure fresh data
      cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true
    }
  );

  // Get the first CV document if available
  const cvDocument = cvQuery.data?.data?.[0] || null;

  // Force refresh function
  const forceRefresh = useCallback(async () => {
    // Invalidate all related queries
    await Promise.all([
      queryClient.invalidateQueries({ 
        queryKey: CV_QUERY_KEYS.userCV,
        refetchType: 'all'
      }),
      queryClient.invalidateQueries({ 
        queryKey: CV_QUERY_KEYS.documents,
        refetchType: 'all'
      })
    ]);
    
    // Force immediate refetch
    return await cvQuery.refetch();
  }, [queryClient, cvQuery]);

  // Upload CV mutation
  const uploadCVMutation = useApiMutation(
    '/api/documents/upload/cv',
    'post',
    CV_QUERY_KEYS.userCV,
    {
      onMutate: async (formData) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: CV_QUERY_KEYS.userCV });
        
        // Save previous state
        const previousData = queryClient.getQueryData(CV_QUERY_KEYS.userCV);
        
        // Create temporary document for optimistic update
        const file = formData.get('file');
        if (file instanceof File) {
          // Create optimistic update data
          const tempDocument = {
            id: `temp-${Date.now()}`,
            type: 'CV',
            name: file.name,
            mime_type: file.type,
            created_at: new Date().toISOString(),
            is_temp: true
          };
          
          // Update cache immediately with optimistic data
          queryClient.setQueryData(CV_QUERY_KEYS.userCV, {
            success: true,
            data: [tempDocument]
          });
        }
        
        return { previousData };
      },
      onSuccess: async (data) => {
        if (!isMountedRef.current) return;
        
        try {
          // Verify data is valid
          if (!data || !data.success) {
            throw new Error('Invalid data received from server');
          }
          
          // Update cache with server data
          queryClient.setQueryData(CV_QUERY_KEYS.userCV, data);
          
          // Force refresh to ensure consistency
          await forceRefresh();
        } catch (error) {
          // Error handled silently
        }
      },
      onError: (error, variables, context) => {
        // Restore previous state on error
        if (context?.previousData) {
          queryClient.setQueryData(CV_QUERY_KEYS.userCV, context.previousData);
        }
      }
    }
  );

  // Delete CV mutation
  const deleteCVMutation = useApiMutation(
    (id) => `/api/documents/${id}`,
    'delete',
    CV_QUERY_KEYS.userCV,
    {
      onMutate: async (id) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: CV_QUERY_KEYS.userCV });
        
        // Save previous state
        const previousData = queryClient.getQueryData(CV_QUERY_KEYS.userCV);
        
        // Update cache immediately with optimistic data (remove the document)
        queryClient.setQueryData(CV_QUERY_KEYS.userCV, {
          success: true,
          data: []
        });
        
        return { previousData };
      },
      onSuccess: async () => {
        if (!isMountedRef.current) return;
        
        try {
          // Force refresh to ensure consistency
          await forceRefresh();
        } catch (error) {
          // Error handled silently
        }
      },
      onError: (error, variables, context) => {
        // Restore previous state on error
        if (context?.previousData) {
          queryClient.setQueryData(CV_QUERY_KEYS.userCV, context.previousData);
        }
      }
    }
  );

  // Download CV function
  const downloadCV = useCallback(async () => {
    if (!cvDocument || !cvDocument.id) {
      throw new Error('No CV document to download');
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/documents/${cvDocument.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = cvDocument.name || 'cv.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return true;
    } catch (error) {
      console.error('Error downloading CV:', error);
      throw error;
    }
  }, [cvDocument]);

  return {
    // CV document data
    cvDocument,
    isLoading: cvQuery.isLoading,
    isFetching: cvQuery.isFetching,
    isError: cvQuery.isError,
    error: cvQuery.error,
    
    // Operations
    refetch: forceRefresh,
    uploadCV: uploadCVMutation.mutate,
    deleteCV: deleteCVMutation.mutate,
    downloadCV,
    
    // Mutation states
    uploadStatus: {
      isPending: uploadCVMutation.isPending,
      isSuccess: uploadCVMutation.isSuccess,
      isError: uploadCVMutation.isError,
      error: uploadCVMutation.error
    },
    deleteStatus: {
      isPending: deleteCVMutation.isPending,
      isSuccess: deleteCVMutation.isSuccess,
      isError: deleteCVMutation.isError,
      error: deleteCVMutation.error
    }
  };
} 