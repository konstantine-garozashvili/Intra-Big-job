import React from 'react';
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

const ViewToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex justify-end mb-4">
      <div
        className={`
          rounded-lg p-1 flex
          bg-secondary
          border border-muted
          shadow-sm
          transition-colors
          dark:bg-slate-800 bg-white
        `}
      >
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className={`
            flex items-center gap-2
            rounded-md
            transition-colors
            ${viewMode === 'grid'
              ? 'bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-700 dark:text-amber-300'
              : 'text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-900/20'}
          `}
        >
          <LayoutGrid
            className={`
              w-4 h-4
              ${viewMode === 'grid'
                ? 'text-amber-600 dark:text-amber-300'
                : 'text-muted-foreground'}
              transition-colors
            `}
          />
          <span>Grille</span>
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
          className={`
            flex items-center gap-2
            rounded-md
            transition-colors
            ${viewMode === 'list'
              ? 'bg-gradient-to-r from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-700 dark:text-amber-300'
              : 'text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-900/20'}
          `}
        >
          <List
            className={`
              w-4 h-4
              ${viewMode === 'list'
                ? 'text-amber-600 dark:text-amber-300'
                : 'text-muted-foreground'}
              transition-colors
            `}
          />
          <span>Liste</span>
        </Button>
      </div>
    </div>
  );
};

export default ViewToggle;