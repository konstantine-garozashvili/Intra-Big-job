/**
 * Direct manual test for axios configuration
 * 
 * This file can be run directly in the browser console to verify
 * that the axios instances work as expected with environment variables.
 */

// Test function to verify axiosInstance is correctly configured
async function testAxiosConfig() {
  try {
    // Import axiosInstance
    const axiosModule = await import('../../lib/axios');
    const { default: axiosInstance, addressApiInstance, externalAxiosInstance } = axiosModule;
    
    // Verify instances exist
    console.log('Axios instances created:', {
      axiosInstance: !!axiosInstance,
      addressApiInstance: !!addressApiInstance,
      externalAxiosInstance: !!externalAxiosInstance
    });
    
    // Check baseURL configuration
    console.log('BaseURL configurations:', {
      main: axiosInstance.defaults?.baseURL || 'Not set',
      address: addressApiInstance.defaults?.baseURL || 'Not set',
      external: externalAxiosInstance.defaults?.baseURL || 'Not set'
    });
    
    // Verify environment variable is used
    const envApiUrl = import.meta.env.VITE_API_URL;
    console.log('Environment API URL:', envApiUrl);
    
    // Check if baseURL matches environment
    const isBaseUrlFromEnv = axiosInstance.defaults?.baseURL === envApiUrl;
    console.log('BaseURL matches environment variable:', isBaseUrlFromEnv);
    
    // Test with a mock token
    localStorage.setItem('token', 'test-token-123');
    
    // Create a request config to test interceptors
    const mockRequest = { headers: {} };
    
    // Get the request interceptor
    const interceptor = axiosInstance.interceptors.request.handlers?.[0]?.fulfilled;
    
    if (typeof interceptor === 'function') {
      // Apply the interceptor
      const modifiedRequest = interceptor(mockRequest);
      
      // Check if token was added
      console.log('Authorization header added:', modifiedRequest.headers.Authorization === 'Bearer test-token-123');
    } else {
      console.log('Could not access request interceptor directly');
    }
    
    // Clean up
    localStorage.removeItem('token');
    
    console.log('Axios configuration test completed!');
    return true;
  } catch (error) {
    console.error('Error testing axios configuration:', error);
    return false;
  }
}

// Export for Vite environment
export { testAxiosConfig };

// Run test if in browser environment
if (typeof window !== 'undefined' && !import.meta.env?.VITEST) {
  console.log('Running axios config test in browser...');
  testAxiosConfig()
    .then(result => console.log('Test result:', result ? 'PASSED' : 'FAILED'))
    .catch(err => console.error('Test failed with error:', err));
} 