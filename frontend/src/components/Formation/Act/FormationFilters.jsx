import React, { useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

const FormationFilters = ({ filters, onFilterChange, specializations }) => {
  // Log uniquement les changements de valeurs des filtres
  useEffect(() => {
    console.log('🎯 [DEBUG] FormationFilters State:', {
      currentSpecialization: filters.specialization,
      availableSpecializations: specializations.map(s => ({
        id: s.id,
        name: s.name
      }))
    });
  }, [filters.specialization, specializations]);

  return (
    <div className="w-full p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm space-y-4 md:space-y-0 md:flex md:gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
        <Input
          placeholder="Rechercher une formation..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select
        value={filters.specialization || 'all'}
        onValueChange={(value) => onFilterChange('specialization', value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Spécialisation" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les spécialisations</SelectItem>
          {specializations.map(spec => (
            <SelectItem 
              key={spec.id} 
              value={spec.id.toString()}
              className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              {spec.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sortBy}
        onValueChange={(value) => onFilterChange('sortBy', value)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Trier par" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dateStart">Date de début</SelectItem>
          <SelectItem value="name">Nom</SelectItem>
          <SelectItem value="capacity">Capacité</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        onClick={() => onFilterChange('reset')}
        className="flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20"
      >
        <Filter className="w-4 h-4" />
        Réinitialiser
      </Button>
    </div>
  );
};

export default FormationFilters; 