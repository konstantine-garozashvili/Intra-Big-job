import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFormationTeachers } from '../useFormationTeachers';
import { formationTeacherService } from '../../services/formationTeacher.service';
import { toast } from 'sonner';

// Mock des dépendances
vi.mock('../../services/formationTeacher.service');
vi.mock('sonner');

describe('useFormationTeachers', () => {
  let queryClient;

  beforeEach(() => {
    // Réinitialiser les mocks
    vi.clearAllMocks();

    // Configurer un nouveau QueryClient pour chaque test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('Queries', () => {
    it('should fetch available teachers', async () => {
      // Arrange
      const mockTeachers = [
        { id: 1, firstName: 'John', lastName: 'Doe' }
      ];
      vi.mocked(formationTeacherService.getAvailableTeachers).mockResolvedValue(mockTeachers);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.availableTeachers).toEqual(mockTeachers);
      });
      expect(formationTeacherService.getAvailableTeachers).toHaveBeenCalled();
    });

    it('should fetch all formation teachers', async () => {
      // Arrange
      const mockFormationTeachers = [
        { id: 1, isMainTeacher: true, user: { id: 1, firstName: 'John' } }
      ];
      vi.mocked(formationTeacherService.getAllFormationTeachers).mockResolvedValue(mockFormationTeachers);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.allFormationTeachers).toEqual(mockFormationTeachers);
      });
      expect(formationTeacherService.getAllFormationTeachers).toHaveBeenCalled();
    });

    it('should fetch stats', async () => {
      // Arrange
      const mockStats = {
        totalTeachers: 10,
        totalFormations: 5,
        teachersPerFormation: []
      };
      vi.mocked(formationTeacherService.getStats).mockResolvedValue(mockStats);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });

      // Assert
      await waitFor(() => {
        expect(result.current.stats).toEqual(mockStats);
      });
      expect(formationTeacherService.getStats).toHaveBeenCalled();
    });
  });

  describe('Mutations', () => {
    it('should create a formation teacher relation', async () => {
      // Arrange
      const mockResponse = { id: 1, isMainTeacher: false };
      vi.mocked(formationTeacherService.create).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });
      
      await act(async () => {
        await result.current.createTeacher({
          formationId: 1,
          userId: 1,
          isMainTeacher: false
        });
      });

      // Assert
      expect(formationTeacherService.create).toHaveBeenCalledWith(1, 1, false);
      expect(toast.success).toHaveBeenCalledWith('Enseignant ajouté avec succès');
    });

    it('should update a formation teacher relation', async () => {
      // Arrange
      const mockResponse = { id: 1, isMainTeacher: true };
      vi.mocked(formationTeacherService.update).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });
      
      await act(async () => {
        await result.current.updateTeacher({
          id: 1,
          isMainTeacher: true
        });
      });

      // Assert
      expect(formationTeacherService.update).toHaveBeenCalledWith(1, true);
      expect(toast.success).toHaveBeenCalledWith('Statut de l\'enseignant mis à jour avec succès');
    });

    it('should delete a formation teacher relation', async () => {
      // Arrange
      vi.mocked(formationTeacherService.delete).mockResolvedValue(true);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });
      
      await act(async () => {
        await result.current.deleteTeacher(1);
      });

      // Assert
      expect(formationTeacherService.delete).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('Enseignant retiré avec succès');
    });

    it('should perform batch update', async () => {
      // Arrange
      const updates = [
        { id: 1, isMainTeacher: true },
        { id: 2, isMainTeacher: false }
      ];
      vi.mocked(formationTeacherService.batchUpdate).mockResolvedValue([
        { id: 1, success: true },
        { id: 2, success: true }
      ]);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });
      
      await act(async () => {
        await result.current.batchUpdateTeachers(updates);
      });

      // Assert
      expect(formationTeacherService.batchUpdate).toHaveBeenCalledWith(updates);
      expect(toast.success).toHaveBeenCalledWith('Mise à jour par lot effectuée avec succès');
    });
  });

  describe('Error handling', () => {
    it('should handle creation error', async () => {
      // Arrange
      const error = new Error('Creation failed');
      vi.mocked(formationTeacherService.create).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });
      
      await act(async () => {
        try {
          await result.current.createTeacher({
            formationId: 1,
            userId: 1,
            isMainTeacher: false
          });
        } catch {}
      });

      // Assert
      expect(toast.error).toHaveBeenCalledWith(error.message);
    });

    it('should handle update error', async () => {
      // Arrange
      const error = new Error('Update failed');
      vi.mocked(formationTeacherService.update).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });
      
      await act(async () => {
        try {
          await result.current.updateTeacher({
            id: 1,
            isMainTeacher: true
          });
        } catch {}
      });

      // Assert
      expect(toast.error).toHaveBeenCalledWith(error.message);
    });

    it('should handle delete error', async () => {
      // Arrange
      const error = new Error('Delete failed');
      vi.mocked(formationTeacherService.delete).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });
      
      await act(async () => {
        try {
          await result.current.deleteTeacher(1);
        } catch {}
      });

      // Assert
      expect(toast.error).toHaveBeenCalledWith(error.message);
    });

    it('should handle batch update error', async () => {
      // Arrange
      const error = new Error('Batch update failed');
      vi.mocked(formationTeacherService.batchUpdate).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });
      
      await act(async () => {
        try {
          await result.current.batchUpdateTeachers([
            { id: 1, isMainTeacher: true }
          ]);
        } catch {}
      });

      // Assert
      expect(toast.error).toHaveBeenCalledWith(error.message);
    });
  });

  describe('Utility functions', () => {
    it('should get teachers by formation', async () => {
      // Arrange
      const mockTeachers = [{ id: 1, firstName: 'John', lastName: 'Doe' }];
      vi.mocked(formationTeacherService.getTeachersByFormation).mockResolvedValue(mockTeachers);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });
      const teachers = await result.current.getTeachersByFormation(1);

      // Assert
      expect(teachers).toEqual(mockTeachers);
      expect(formationTeacherService.getTeachersByFormation).toHaveBeenCalledWith(1);
    });

    it('should get formations by teacher', async () => {
      // Arrange
      const mockFormations = [{ id: 1, name: 'Formation 1' }];
      vi.mocked(formationTeacherService.getFormationsByTeacher).mockResolvedValue(mockFormations);

      // Act
      const { result } = renderHook(() => useFormationTeachers(), { wrapper });
      const formations = await result.current.getFormationsByTeacher(1);

      // Assert
      expect(formations).toEqual(mockFormations);
      expect(formationTeacherService.getFormationsByTeacher).toHaveBeenCalledWith(1);
    });
  });
}); 