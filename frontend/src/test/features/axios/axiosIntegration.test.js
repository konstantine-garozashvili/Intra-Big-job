import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axiosInstance from '@/lib/axios';
import apiService from '@/lib/services/apiService';
import addressService from '@/lib/services/addressService';
import documentService from '@/pages/Global/Profile/services/documentService';

// Mock axios instances
vi.mock('@/lib/axios', () => {
  const mockAxiosInstance = {
    get: vi.fn().mockResolvedValue({ data: { success: true } }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
    put: vi.fn().mockResolvedValue({ data: { success: true } }),
    delete: vi.fn().mockResolvedValue({ data: { success: true } }),
    patch: vi.fn().mockResolvedValue({ data: { success: true } }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  };

  return {
    default: mockAxiosInstance,
    axiosInstance: mockAxiosInstance,
    addressApiInstance: {
      ...mockAxiosInstance,
      get: vi.fn().mockResolvedValue({ 
        data: { 
          features: [{ properties: { city: 'Paris' } }] 
        } 
      })
    },
    externalAxiosInstance: { ...mockAxiosInstance }
  };
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Axios Integration Tests', () => {
  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
    localStorageMock.clear();
    
    // Setup token in localStorage
    localStorageMock.setItem('token', 'test-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('apiService Integration', () => {
    it('should use axiosInstance for GET requests', async () => {
      // Call apiService method
      await apiService.get('/test-endpoint');
      
      // Verify the correct axios instance was used
      expect(axiosInstance.get).toHaveBeenCalled();
    });
    
    it('should use axiosInstance for POST requests', async () => {
      // Call apiService method
      const testData = { name: 'Test' };
      await apiService.post('/test-endpoint', testData);
      
      // Verify the correct axios instance was used
      expect(axiosInstance.post).toHaveBeenCalled();
      expect(axiosInstance.post.mock.calls[0][1]).toEqual(testData);
    });
  });
  
  describe('addressService Integration', () => {
    it('should correctly call addressApiInstance for search', async () => {
      // Import the specific instance used in addressService
      const { addressApiInstance } = await import('@/lib/axios');
      
      // Call addressService method
      await addressService.searchAddresses('Paris');
      
      // Verify the address API instance was used with correct parameters
      expect(addressApiInstance.get).toHaveBeenCalledWith('/search', {
        params: expect.objectContaining({
          q: 'Paris'
        })
      });
    });
    
    it('should correctly process address API response', async () => {
      // Call service method
      const result = await addressService.reverseGeocode(48.8566, 2.3522);
      
      // Verify result contains expected data from mock
      expect(result).toEqual(expect.objectContaining({
        properties: expect.objectContaining({
          city: 'Paris'
        })
      }));
    });
  });
  
  describe('documentService Integration', () => {
    it('should use axiosInstance for document operations', async () => {
      // Call documentService method
      await documentService.getDocuments();
      
      // Verify the correct axios instance was used
      expect(axiosInstance.get).toHaveBeenCalledWith('/documents');
    });
    
    it('should handle FormData correctly in document uploads', async () => {
      // Setup: mock FormData
      global.FormData = class FormData {
        constructor() {
          this.data = {};
        }
        
        append(key, value) {
          this.data[key] = value;
        }
        
        get(key) {
          return this.data[key];
        }
      };
      
      // Create test FormData
      const formData = new FormData();
      formData.append('file', new Blob(['test'], { type: 'application/pdf' }));
      formData.append('type', 'CV');
      
      // Call uploadCV method
      await documentService.uploadCV(formData);
      
      // Verify axiosInstance.post was called with FormData
      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/documents/upload/cv',
        expect.any(FormData)
      );
    });
  });
}); 