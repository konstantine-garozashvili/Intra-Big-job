import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import formationService from '../formationService';

// Mock axios
vi.mock('axios');

describe('Formation Service', () => {
  const mockFormation = {
    id: 1,
    name: 'Test Formation',
    promotion: '2024',
    description: 'Test Description',
    capacity: 20,
    dateStart: '2024-09-01',
    location: 'Paris',
    duration: 12
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllFormations', () => {
    it('should fetch all formations successfully', async () => {
      const mockFormations = [mockFormation];
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockFormations });

      const result = await formationService.getAllFormations();
      
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8000/api/formations');
      expect(result).toEqual(mockFormations);
    });

    it('should handle error when fetching formations fails', async () => {
      const errorMessage = 'Network Error';
      vi.mocked(axios.get).mockRejectedValueOnce(new Error(errorMessage));

      await expect(formationService.getAllFormations()).rejects.toThrow(errorMessage);
    });
  });

  describe('getFormation', () => {
    it('should fetch a single formation successfully', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockFormation });

      const result = await formationService.getFormation(1);
      
      expect(axios.get).toHaveBeenCalledWith('http://localhost:8000/api/formations/1');
      expect(result).toEqual(mockFormation);
    });

    it('should handle error when fetching a single formation fails', async () => {
      const errorMessage = 'Formation not found';
      vi.mocked(axios.get).mockRejectedValueOnce(new Error(errorMessage));

      await expect(formationService.getFormation(1)).rejects.toThrow(errorMessage);
    });
  });

  describe('createFormation', () => {
    const newFormation = {
      name: 'New Formation',
      promotion: '2024',
      description: 'New Description',
      capacity: 25,
      dateStart: '2024-10-01',
      location: 'Lyon',
      duration: 10
    };

    it('should create a formation successfully', async () => {
      vi.mocked(axios.post).mockResolvedValueOnce({ data: { ...newFormation, id: 2 } });

      const result = await formationService.createFormation(newFormation);
      
      expect(axios.post).toHaveBeenCalledWith('http://localhost:8000/api/formations', newFormation);
      expect(result).toEqual({ ...newFormation, id: 2 });
    });

    it('should handle error when creation fails', async () => {
      const errorMessage = 'Creation failed';
      vi.mocked(axios.post).mockRejectedValueOnce(new Error(errorMessage));

      await expect(formationService.createFormation(newFormation)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateFormation', () => {
    const updatedData = {
      name: 'Updated Formation',
      capacity: 30
    };

    it('should update a formation successfully', async () => {
      const updatedFormation = { ...mockFormation, ...updatedData };
      vi.mocked(axios.put).mockResolvedValueOnce({ data: updatedFormation });

      const result = await formationService.updateFormation(1, updatedData);
      
      expect(axios.put).toHaveBeenCalledWith('http://localhost:8000/api/formations/1', updatedData);
      expect(result).toEqual(updatedFormation);
    });

    it('should handle error when update fails', async () => {
      const errorMessage = 'Update failed';
      vi.mocked(axios.put).mockRejectedValueOnce(new Error(errorMessage));

      await expect(formationService.updateFormation(1, updatedData)).rejects.toThrow(errorMessage);
    });
  });

  describe('deleteFormation', () => {
    it('should delete a formation successfully', async () => {
      vi.mocked(axios.delete).mockResolvedValueOnce();

      const result = await formationService.deleteFormation(1);
      
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:8000/api/formations/1');
      expect(result).toBe(true);
    });

    it('should handle error when deletion fails', async () => {
      const errorMessage = 'Deletion failed';
      vi.mocked(axios.delete).mockRejectedValueOnce(new Error(errorMessage));

      await expect(formationService.deleteFormation(1)).rejects.toThrow(errorMessage);
    });
  });
}); 