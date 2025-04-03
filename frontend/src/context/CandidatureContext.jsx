import React, { createContext, useContext, useState } from 'react';

const CandidatureContext = createContext();

export function CandidatureProvider({ children }) {
  const [candidatures, setCandidatures] = useState([]);

  const addCandidature = (candidature) => {
    setCandidatures([...candidatures, candidature]);
  };

  const updateCandidature = (id, updates) => {
    setCandidatures(
      candidatures.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  return (
    <CandidatureContext.Provider value={{ candidatures, addCandidature, updateCandidature }}>
      {children}
    </CandidatureContext.Provider>
  );
}

export function useCandidature() {
  return useContext(CandidatureContext);
} 