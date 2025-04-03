import { create } from 'zustand';

export const useCandidatureStore = create((set) => ({
  candidatures: [],
  addCandidature: (candidature) => 
    set((state) => ({ 
      candidatures: [...state.candidatures, candidature] 
    })),
  updateCandidature: (id, updates) =>
    set((state) => ({
      candidatures: state.candidatures.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    })),
})); 