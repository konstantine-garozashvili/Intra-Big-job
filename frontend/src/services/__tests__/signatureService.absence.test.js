import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import signatureService from '../../lib/services/signatureService';
import apiService from '../../lib/services/apiService';

vi.mock('../../lib/services/apiService');

describe('signatureService absences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAbsencesByFormation appelle la bonne URL sans params', async () => {
    apiService.get.mockResolvedValue({ success: true, absents: [] });
    const res = await signatureService.getAbsencesByFormation(42);
    expect(apiService.get).toHaveBeenCalledWith('/api/signatures/absences/formation/42');
    expect(res).toEqual({ success: true, absents: [] });
  });

  it('getAbsencesByFormation appelle la bonne URL avec params', async () => {
    apiService.get.mockResolvedValue({ success: true, absents: [{ id: 1 }] });
    const res = await signatureService.getAbsencesByFormation(99, { date: '2025-05-05', period: 'morning' });
    expect(apiService.get).toHaveBeenCalledWith('/api/signatures/absences/formation/99?date=2025-05-05&period=morning');
    expect(res.absents[0].id).toBe(1);
  });

  it('getAbsencesByUser appelle la bonne URL sans params', async () => {
    apiService.get.mockResolvedValue({ success: true, absences: [] });
    const res = await signatureService.getAbsencesByUser(16);
    expect(apiService.get).toHaveBeenCalledWith('/api/signatures/absences/user/16');
    expect(res.success).toBe(true);
  });

  it('getAbsencesByUser appelle la bonne URL avec tous les params', async () => {
    apiService.get.mockResolvedValue({ success: true, absences: [{ date: '2025-05-05' }] });
    const res = await signatureService.getAbsencesByUser(16, { formationId: 11, date: '2025-05-05', period: 'afternoon' });
    expect(apiService.get).toHaveBeenCalledWith('/api/signatures/absences/user/16?formationId=11&date=2025-05-05&period=afternoon');
    expect(res.absences[0].date).toBe('2025-05-05');
  });

  it('propage les erreurs de l\'API', async () => {
    apiService.get.mockRejectedValue(new Error('API error'));
    await expect(signatureService.getAbsencesByFormation(1)).rejects.toThrow('API error');
    await expect(signatureService.getAbsencesByUser(1)).rejects.toThrow('API error');
  });
}); 