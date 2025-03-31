import { describe, it, expect, vi, beforeEach } from 'vitest'
import { diplomaService } from '../../../pages/Global/Profile/services/diplomaService'
import apiService from '../../../lib/services/apiService'

// Mock the API service instead of axios
vi.mock('@/lib/services/apiService', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('diplomaService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('fetches user diplomas successfully', async () => {
    const mockDiplomas = [
      { id: 1, name: 'Bachelor in Computer Science', institution: 'Tech University', obtainedDate: '2023-06-15' }
    ]
    
    apiService.get.mockResolvedValueOnce({ data: mockDiplomas })
    
    const result = await diplomaService.getUserDiplomas()
    
    expect(result).toEqual(mockDiplomas)
    expect(apiService.get).toHaveBeenCalledWith('/api/user-diplomas')
  })

  it('fetches available diplomas successfully', async () => {
    const mockDiplomas = [
      { id: 1, name: 'Bachelor in Computer Science', institution: 'Tech University' },
      { id: 2, name: 'Master in Software Engineering', institution: 'Code Academy' }
    ]
    
    apiService.get.mockResolvedValueOnce({ data: mockDiplomas })
    
    const result = await diplomaService.getAvailableDiplomas()
    
    expect(result).toEqual(mockDiplomas)
    expect(apiService.get).toHaveBeenCalledWith('/api/user-diplomas/available')
  })

  it('adds a user diploma successfully', async () => {
    const mockResponse = { message: 'Diploma added successfully' }
    const diplomaData = {
      diplomaId: 1,
      obtainedDate: '2024-03-15'
    }
    
    apiService.post.mockResolvedValueOnce({ data: mockResponse })
    
    const result = await diplomaService.addUserDiploma(diplomaData)
    
    expect(result).toEqual(mockResponse)
    expect(apiService.post).toHaveBeenCalledWith('/api/user-diplomas', diplomaData)
  })

  it('deletes a user diploma successfully', async () => {
    const mockResponse = { message: 'Diploma deleted successfully' }
    const diplomaId = 1
    
    apiService.delete.mockResolvedValueOnce({ data: mockResponse })
    
    const result = await diplomaService.deleteUserDiploma(diplomaId)
    
    expect(result).toEqual(mockResponse)
    expect(apiService.delete).toHaveBeenCalledWith(`/api/user-diplomas/${diplomaId}`)
  })

  it('handles API errors appropriately', async () => {
    const errorMessage = 'Network Error'
    apiService.get.mockRejectedValueOnce(new Error(errorMessage))
    
    await expect(diplomaService.getUserDiplomas()).rejects.toThrow(errorMessage)
  })
}) 