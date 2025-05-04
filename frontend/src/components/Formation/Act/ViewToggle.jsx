import React from 'react';
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

const ViewToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex justify-end mb-4">
      <div className="bg-secondary rounded-lg p-1 flex">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className="flex items-center gap-2"
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Grille</span>
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
          className="flex items-center gap-2"
        >
          <List className="w-4 h-4" />
          <span>Liste</span>
        </Button>
      </div>
    </div>
  );
};

export default ViewToggle; 