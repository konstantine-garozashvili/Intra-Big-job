import React, { useState } from 'react';
import AllFormations from './AllFormations';
import FormationTable from '@/components/formations/FormationTable';
import { Button } from '@/components/ui/button';

export default function AdminFormationsView() {
  const [view, setView] = useState('cards'); // 'cards' ou 'table'

  return (
    <div className="max-w-7xl mx-auto py-10 px-2 md:px-0">
      <div className="flex justify-end mb-6 gap-2">
        <Button
          variant={view === 'cards' ? 'default' : 'outline'}
          onClick={() => setView('cards')}
        >
          Cartes
        </Button>
        <Button
          variant={view === 'table' ? 'default' : 'outline'}
          onClick={() => setView('table')}
        >
          Tableau
        </Button>
      </div>
      {view === 'cards' ? <AllFormations /> : <FormationTable />}
    </div>
  );
} 