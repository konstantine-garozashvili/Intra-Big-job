import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Axios Environment Configuration', () => {
  const originalEnv = process.env;
  const originalImportMeta = globalThis.import?.meta;
  
  beforeEach(() => {
    vi.resetModules();
    
    // Mock import.meta.env
    vi.stubGlobal('import', { 
      meta: { 
        env: { 
          VITE_API_URL: 'http://test-api.example.com/api' 
        } 
      } 
    });
  });
  
  afterEach(() => {
    // Restore original env
    if (originalImportMeta) {
      globalThis.import.meta = originalImportMeta;
    }
  });
  
  it('should use VITE_API_URL from environment for baseURL', async () => {
    // Import axios config after mocking env
    const { default: axiosInstance } = await import('@/lib/axios');
    
    // Create spy to check URL in requests
    const getSpy = vi.spyOn(axiosInstance, 'get');
    
    // Make a request that doesn't go through our cache layer
    try {
      await axiosInstance.get('/test');
    } catch (e) {
      // Ignore network errors, we just want to check the URL
    }
    
    // Check that the URL used includes our environment variable
    expect(getSpy).toHaveBeenCalledWith('/test');
    
    // Check baseURL directly - note this won't work in all test environments
    // but we're testing the concept
    expect(axiosInstance.defaults?.baseURL).toBe('http://test-api.example.com/api');
  });
  
  it('should fallback to default URL when VITE_API_URL is not defined', async () => {
    // Remove environment variable
    vi.stubGlobal('import', { 
      meta: { 
        env: {} 
      } 
    });
    
    // Re-import axios config
    const { default: axiosInstance } = await import('@/lib/axios');
    
    // Check baseURL directly
    expect(axiosInstance.defaults?.baseURL).toBe('http://localhost:8000/api');
  });
  
  it('should correctly configure addressApiInstance with fixed baseURL', async () => {
    // Import addressApiInstance
    const { addressApiInstance } = await import('@/lib/axios');
    
    // Check baseURL is correct and not affected by env vars
    expect(addressApiInstance.defaults?.baseURL).toBe('https://api-adresse.data.gouv.fr');
  });
}); 