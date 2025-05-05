import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formationService } from '../../../services/formation.service';
import FormationCard from './FormationCard';
import FormationFilters from './FormationFilters';
import ViewToggle from './ViewToggle';

const Act = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    sortBy: 'dateStart'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [formationsData, specializationsData] = await Promise.all([
          formationService.getAllFormations(),
          formationService.getSpecializations()
        ]);
        setFormations(formationsData);
        setSpecializations(specializationsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    if (key === 'reset') {
      setFilters({
        search: '',
        specialization: '',
        sortBy: 'dateStart'
      });
      return;
    }
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRequestJoin = (formationId) => {
    // Cette fonction sera implémentée plus tard pour gérer les demandes
    console.log('Demande pour rejoindre la formation:', formationId);
  };

  const filteredFormations = formations
    .filter(formation => {
      const matchesSearch = formation.name.toLowerCase()
        .includes(filters.search.toLowerCase()) ||
        formation.description?.toLowerCase()
          .includes(filters.search.toLowerCase());
      
      const matchesSpecialization = !filters.specialization ||
        formation.specializationId === filters.specialization;

      return matchesSearch && matchesSpecialization;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'capacity':
          return b.capacity - a.capacity;
        case 'dateStart':
        default:
          return new Date(a.dateStart) - new Date(b.dateStart);
      }
    });

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">
            Formations disponibles
          </h1>
          <p className="text-muted-foreground">
            Découvrez nos formations et rejoignez celle qui vous correspond
          </p>
        </div>

        <FormationFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          specializations={specializations}
        />

        <div className="flex justify-end">
          <ViewToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        <div className={`
          grid gap-6
          ${viewMode === 'grid' 
            ? 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2' 
            : 'grid-cols-1'
          }
          ${viewMode === 'list' ? 'max-w-[1200px] mx-auto' : ''}
        `}>
          {filteredFormations.map(formation => (
            <FormationCard
              key={formation.id}
              formation={formation}
              onRequestJoin={handleRequestJoin}
              viewMode={viewMode}
            />
          ))}
        </div>

        {!loading && filteredFormations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              Aucune formation ne correspond à vos critères
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Act; 