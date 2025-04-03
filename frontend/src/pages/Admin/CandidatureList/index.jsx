import React from 'react';
import { PageContainer } from '@/components/shared/PageContainer';

const CandidatureList = () => {
  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Liste des Candidatures</h1>
        <div className="bg-white rounded-lg shadow p-6">
          {/* We'll add the candidature list table/grid here later */}
          <p>Liste des candidatures à venir</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default CandidatureList;
