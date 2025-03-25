import React from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

export function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange
}) {
  if (totalPages <= 1) return null;
  
  const pageItems = [];
  const maxPages = 5; // Maximum number of page links to display
  
  let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
  let endPage = Math.min(totalPages, startPage + maxPages - 1);
  
  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }
  
  // Previous button
  pageItems.push(
    <div 
      key="prev" 
      className="cursor-pointer" 
      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
    >
      <ChevronLeft className="w-4 h-4" />
    </div>
  );
  
  // Pages
  for (let i = startPage; i <= endPage; i++) {
    pageItems.push(
      <div 
        key={i}
        className={`cursor-pointer px-3 py-1 rounded-md ${currentPage === i ? 'bg-gray-200' : ''}`}
        onClick={() => onPageChange(i)}
      >
        {i}
      </div>
    );
  }
  
  // Next button
  pageItems.push(
    <div 
      key="next" 
      className="cursor-pointer" 
      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
    >
      <ChevronRight className="w-4 h-4" />
    </div>
  );
  
  return (
    <div className="flex space-x-2 mt-4">
      {pageItems}
    </div>
  );
}
