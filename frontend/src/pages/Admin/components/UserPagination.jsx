import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion } from "framer-motion";

export function UserPagination({ filteredUsers, pagination, handlePageChange, isDark }) {
    const totalPages = Math.ceil(filteredUsers.length / pagination.itemsPerPage);
    if (totalPages <= 1) return null;
    
    const currentPage = pagination.currentPage;
    const totalItems = filteredUsers.length;
    const startItem = (currentPage - 1) * pagination.itemsPerPage + 1;
    const endItem = Math.min(currentPage * pagination.itemsPerPage, totalItems);
    
    // Limiter le nombre de boutons de page affichés
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    const pageButtons = [];
    for (let i = startPage; i <= endPage; i++) {
        pageButtons.push(
            <Button
                key={i}
                variant={i === currentPage ? "default" : "outline"}
                size="icon"
                onClick={() => handlePageChange(i)}
                className={`w-9 h-9 transition-all duration-200 ${
                    i === currentPage 
                        ? isDark
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        : isDark
                            ? "hover:bg-gray-800 bg-gray-900 border-gray-700"
                            : "hover:bg-gray-100"
                }`}
            >
                {i}
            </Button>
        );
    }
    
    return (
        <motion.div 
            className="mt-6 flex flex-col items-center space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Affichage de <span className="font-medium">{startItem}</span> à{" "}
                <span className="font-medium">{endItem}</span> sur{" "}
                <span className="font-medium">{totalItems}</span> utilisateurs
            </p>
            
            <Pagination className="flex justify-center items-center gap-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`${isDark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`${isDark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {startPage > 1 && (
                    <>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(1)}
                            className={`${isDark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                        >
                            1
                        </Button>
                        {startPage > 2 && (
                            <span className="mx-1 self-center text-gray-400 hidden sm:block">
                                &#8230;
                            </span>
                        )}
                    </>
                )}
                
                <div className="flex items-center gap-2">
                    {pageButtons}
                </div>
                
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && (
                            <span className="mx-1 self-center text-gray-400 hidden sm:block">
                                &#8230;
                            </span>
                        )}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePageChange(totalPages)}
                            className={`${isDark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                        >
                            {totalPages}
                        </Button>
                    </>
                )}
                
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`${isDark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`${isDark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </Pagination>
            
            <div className="flex items-center justify-center text-sm text-gray-500 sm:hidden mt-2">
                Page <span className="font-semibold mx-1">{currentPage}</span> sur <span className="font-semibold mx-1">{totalPages}</span>
            </div>
        </motion.div>
    );
} 