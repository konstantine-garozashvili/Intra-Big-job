import axiosInstance, { addressApiInstance, externalAxiosInstance } from '../axios';

/**
 * A simple test script to verify axios configuration is working properly.
 * This can be run directly in a browser or Node.js environment.
 */
(async function testAxiosConfig() {
  console.log('=== AXIOS CONFIGURATION TEST ===');
  console.log('Testing if environment variables are properly integrated with axios instances');

  // Check if all instances exist
  console.log('\n1. Checking if all axios instances exist:');
  console.log('Main instance:', !!axiosInstance ? '✅ Exists' : '❌ Missing');
  console.log('Address API instance:', !!addressApiInstance ? '✅ Exists' : '❌ Missing');
  console.log('External API instance:', !!externalAxiosInstance ? '✅ Exists' : '❌ Missing');

  // Check baseURL configurations
  console.log('\n2. Checking baseURL configurations:');
  console.log('Main instance baseURL:', axiosInstance.defaults?.baseURL || 'Not set');
  console.log('Address API instance baseURL:', addressApiInstance.defaults?.baseURL || 'Not set');
  console.log('External API instance baseURL:', externalAxiosInstance.defaults?.baseURL || 'Not set');

  // Check environment variables integration
  console.log('\n3. Checking environment variables integration:');
  const envApiUrl = import.meta.env.VITE_API_URL;
  console.log('VITE_API_URL:', envApiUrl);
  console.log('Main instance uses env var:', axiosInstance.defaults?.baseURL === envApiUrl ? '✅ Yes' : '❌ No');

  // Test authorization header setting from localStorage
  console.log('\n4. Testing authorization header from localStorage:');
  const testToken = 'test-authorization-token-123';
  localStorage.setItem('token', testToken);
  
  try {
    // Make a request that will trigger the interceptor
    console.log('Making test request to trigger interceptor...');
    await axiosInstance.get('/test-endpoint');
  } catch (error) {
    // Error is expected since endpoint probably doesn't exist
    console.log('Expected error occurred (endpoint likely doesn\'t exist)');
  }
  
  // Clean up
  localStorage.removeItem('token');

  // Test FormData handling
  console.log('\n5. Testing FormData content-type handling:');
  const formData = new FormData();
  formData.append('test', 'value');
  
  try {
    console.log('Making test FormData request...');
    await axiosInstance.post('/test-form-endpoint', formData);
  } catch (error) {
    // Error is expected
    console.log('Expected error occurred (endpoint likely doesn\'t exist)');
  }

  // Test address API
  console.log('\n6. Testing address API instance:');
  try {
    console.log('Making test request to address API...');
    const response = await addressApiInstance.get('/search', {
      params: { q: 'Paris', limit: 1 }
    });
    console.log('Response received:', response.status === 200 ? '✅ Success' : '❌ Failed');
  } catch (error) {
    console.error('Error making address API request:', error.message);
  }

  console.log('\n=== AXIOS CONFIGURATION TEST COMPLETED ===');
})();

export default {}; 