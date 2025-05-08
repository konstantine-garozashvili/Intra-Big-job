import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formationTeacherService } from '../formationTeacher.service';
import apiService from '../../lib/services/apiService';

// Mock du module apiService
vi.mock('../../lib/services/apiService');

describe('FormationTeacherService', () => {
  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableTeachers', () => {
    it('should return available teachers when API call is successful', async () => {
      // Arrange
      const mockTeachers = [
        {
          id: 37,
          firstName: 'Thomas',
          lastName: 'Petit',
          email: 'teacher@bigproject.com',
          profilePicturePath: null
        }
      ];
      vi.mocked(apiService.get).mockResolvedValue({ data: mockTeachers });

      // Act
      const result = await formationTeacherService.getAvailableTeachers();

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/api/formation-teachers/available-teachers');
      expect(result).toEqual(mockTeachers);
    });

    it('should throw FormationTeacherError when API call fails', async () => {
      // Arrange
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(formationTeacherService.getAvailableTeachers()).rejects.toThrow('Failed to fetch available teachers');
    });
  });

  describe('getAllFormationTeachers', () => {
    it('should return all formation teachers when API call is successful', async () => {
      // Arrange
      const mockTeachers = [
        {
          id: 1,
          isMainTeacher: true,
          user: {
            id: 37,
            firstName: 'Thomas',
            lastName: 'Petit'
          }
        }
      ];
      vi.mocked(apiService.get).mockResolvedValue({ data: mockTeachers });

      // Act
      const result = await formationTeacherService.getAllFormationTeachers();

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/api/formation-teachers');
      expect(result).toEqual(mockTeachers);
    });

    it('should throw FormationTeacherError when API call fails', async () => {
      // Arrange
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(formationTeacherService.getAllFormationTeachers()).rejects.toThrow('Failed to fetch all formation teachers');
    });
  });

  describe('getTeachersByFormation', () => {
    it('should return teachers for a specific formation when API call is successful', async () => {
      // Arrange
      const formationId = 37;
      const mockTeachers = [
        {
          id: 1,
          isMainTeacher: true,
          user: {
            id: 37,
            firstName: 'Thomas',
            lastName: 'Petit'
          }
        }
      ];
      vi.mocked(apiService.get).mockResolvedValue({ data: mockTeachers });

      // Act
      const result = await formationTeacherService.getTeachersByFormation(formationId);

      // Assert
      expect(apiService.get).toHaveBeenCalledWith(`/api/formation-teachers/formation/${formationId}`);
      expect(result).toEqual(mockTeachers);
    });

    it('should throw FormationTeacherError when formationId is not provided', async () => {
      // Act & Assert
      await expect(formationTeacherService.getTeachersByFormation()).rejects.toThrow('Formation ID is required and must be a number');
    });
  });

  describe('getFormationsByTeacher', () => {
    it('should return formations for a specific teacher when API call is successful', async () => {
      // Arrange
      const teacherId = 37;
      const mockFormations = [
        {
          id: 1,
          name: 'Formation 1',
          isMainTeacher: true
        }
      ];
      vi.mocked(apiService.get).mockResolvedValue({ data: mockFormations });

      // Act
      const result = await formationTeacherService.getFormationsByTeacher(teacherId);

      // Assert
      expect(apiService.get).toHaveBeenCalledWith(`/api/formation-teachers/teacher/${teacherId}`);
      expect(result).toEqual(mockFormations);
    });

    it('should throw FormationTeacherError when teacherId is not provided', async () => {
      // Act & Assert
      await expect(formationTeacherService.getFormationsByTeacher()).rejects.toThrow('Teacher ID is required and must be a number');
    });
  });

  describe('getStats', () => {
    it('should return formation teacher statistics when API call is successful', async () => {
      // Arrange
      const mockStats = {
        totalTeachers: 10,
        totalFormations: 5,
        teachersPerFormation: [
          { formation_id: 1, formation_name: 'Formation 1', teacher_count: 2 }
        ]
      };
      vi.mocked(apiService.get).mockResolvedValue({ data: mockStats });

      // Act
      const result = await formationTeacherService.getStats();

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/api/formation-teachers/stats');
      expect(result).toEqual(mockStats);
    });

    it('should throw FormationTeacherError when API call fails', async () => {
      // Arrange
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(formationTeacherService.getStats()).rejects.toThrow('Failed to fetch formation teacher statistics');
    });
  });

  describe('batchUpdate', () => {
    it('should update multiple formation teachers when API call is successful', async () => {
      // Arrange
      const updates = [
        { id: 1, isMainTeacher: true },
        { id: 2, isMainTeacher: false }
      ];
      const mockResponse = [
        { id: 1, success: true },
        { id: 2, success: true }
      ];
      vi.mocked(apiService.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await formationTeacherService.batchUpdate(updates);

      // Assert
      expect(apiService.post).toHaveBeenCalledWith('/api/formation-teachers/batch', { updates });
      expect(result).toEqual(mockResponse);
    });

    it('should throw FormationTeacherError when updates array is not provided', async () => {
      // Act & Assert
      await expect(formationTeacherService.batchUpdate()).rejects.toThrow('Updates must be a non-empty array');
    });
  });

  describe('create', () => {
    it('should create a formation teacher relation when API call is successful', async () => {
      // Arrange
      const mockResponse = {
        id: 1,
        isMainTeacher: false,
        formation_id: 37,
        user_id: 37
      };
      vi.mocked(apiService.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await formationTeacherService.create(37, 37, false);

      // Assert
      expect(apiService.post).toHaveBeenCalledWith('/api/formation-teachers', {
        formation_id: 37,
        user_id: 37,
        is_main_teacher: false
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw FormationTeacherError when required parameters are missing', async () => {
      // Act & Assert
      await expect(formationTeacherService.create()).rejects.toThrow('Formation ID is required and must be a number');
      await expect(formationTeacherService.create(37)).rejects.toThrow('User ID is required and must be a number');
    });
  });

  describe('update', () => {
    it('should update a formation teacher relation when API call is successful', async () => {
      // Arrange
      const mockResponse = {
        id: 37,
        isMainTeacher: true
      };
      vi.mocked(apiService.put).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await formationTeacherService.update(37, true);

      // Assert
      expect(apiService.put).toHaveBeenCalledWith('/api/formation-teachers/37', {
        is_main_teacher: true
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw FormationTeacherError when required parameters are missing', async () => {
      // Act & Assert
      await expect(formationTeacherService.update()).rejects.toThrow('ID is required and must be a number');
      await expect(formationTeacherService.update(37)).rejects.toThrow('isMainTeacher must be a boolean');
    });
  });

  describe('delete', () => {
    it('should delete a formation teacher relation when API call is successful', async () => {
      // Arrange
      vi.mocked(apiService.delete).mockResolvedValue({ status: 204 });

      // Act
      const result = await formationTeacherService.delete(37);

      // Assert
      expect(apiService.delete).toHaveBeenCalledWith('/api/formation-teachers/37');
      expect(result).toBe(true);
    });

    it('should throw FormationTeacherError when id is not provided', async () => {
      // Act & Assert
      await expect(formationTeacherService.delete()).rejects.toThrow('ID is required and must be a number');
    });

    it('should throw FormationTeacherError when relation is not found', async () => {
      // Arrange
      vi.mocked(apiService.delete).mockRejectedValue({ response: { status: 404 } });

      // Act & Assert
      await expect(formationTeacherService.delete(37)).rejects.toThrow('Formation teacher relation not found');
    });
  });

  describe('getMyFormations', () => {
    it('should return teacher formations when API call is successful', async () => {
      // Arrange
      const mockFormations = [
        {
          id: 11,
          name: 'Développement Web Full Stack',
          promotion: '2024-A',
          description: 'Formation complète en développement web',
          isMainTeacher: true,
          formationTeacherId: 33
        },
        {
          id: 13,
          name: 'DevOps & Cloud Computing',
          promotion: '2024-A',
          description: 'Formation DevOps',
          isMainTeacher: false,
          formationTeacherId: 17
        }
      ];
      vi.mocked(apiService.get).mockResolvedValue({ data: mockFormations });

      // Act
      const result = await formationTeacherService.getMyFormations();

      // Assert
      expect(apiService.get).toHaveBeenCalledWith('/api/formation-teachers/my-formations');
      expect(result).toEqual(mockFormations);
    });

    it('should throw FormationTeacherError when API call fails', async () => {
      // Arrange
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(formationTeacherService.getMyFormations()).rejects.toThrow('Failed to fetch teacher formations');
    });
  });

  describe('getFormationDetails', () => {
    it('should return formation details with students when API call is successful', async () => {
      // Arrange
      const formationId = 11;
      const mockFormationDetails = {
        id: formationId,
        name: 'Développement Web Full Stack',
        promotion: '2024-A',
        description: 'Formation complète en développement web',
        capacity: 25,
        dateStart: '2024-09-01',
        location: 'Paris',
        duration: 12,
        isMainTeacher: true,
        specialization: {
          id: 14,
          name: 'Développement PHP'
        },
        students: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          }
        ]
      };
      vi.mocked(apiService.get).mockResolvedValue({ data: mockFormationDetails });

      // Act
      const result = await formationTeacherService.getFormationDetails(formationId);

      // Assert
      expect(apiService.get).toHaveBeenCalledWith(`/api/formations/${formationId}/teacher-view`);
      expect(result).toEqual(mockFormationDetails);
    });

    it('should throw FormationTeacherError when formationId is not provided', async () => {
      // Act & Assert
      await expect(formationTeacherService.getFormationDetails()).rejects.toThrow('Formation ID is required and must be a number');
    });

    it('should throw FormationTeacherError when API call fails', async () => {
      // Arrange
      const formationId = 11;
      vi.mocked(apiService.get).mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(formationTeacherService.getFormationDetails(formationId)).rejects.toThrow('Failed to fetch formation details');
    });
  });
}); 