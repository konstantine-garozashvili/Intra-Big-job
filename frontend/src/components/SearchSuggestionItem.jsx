import React from 'react';
import { motion } from 'framer-motion';
import { User, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { getRoleIcon, getRoleColor, getFrenchRoleDisplayName } from '../lib/utils/roleDisplay.jsx';
import { Link } from 'react-router-dom';

export const SearchSuggestionItem = ({ user, index, activeSuggestion, handleSuggestionClick, setActiveSuggestion }) => {
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        backgroundColor: index === activeSuggestion ? "rgba(82, 142, 178, 0.08)" : "rgba(0,0,0,0)" 
      }}
      transition={{ 
        duration: 0.2,
        delay: index * 0.03
      }}
      whileHover={{ backgroundColor: "rgba(82, 142, 178, 0.08)" }}
      onClick={(e) => handleSuggestionClick(user, e)}
      onMouseEnter={() => setActiveSuggestion(index)}
      className={cn(
        "flex items-center px-4 py-3 cursor-pointer transition-all hover:bg-blue-50/50 dark:hover:bg-blue-800/20",
        index === activeSuggestion ? "bg-[rgba(82,142,178,0.08)] dark:bg-[rgba(120,185,221,0.15)]" : ""
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSuggestionClick(user, e);
        }
      }}
    >
      <Link to={`/profile/${user.id}`} className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#02284f] to-[#528eb2] flex items-center justify-center mr-3 shadow-sm overflow-hidden" onClick={e => e.stopPropagation()} tabIndex={-1}>
        {user.profilePictureUrl ? (
          <img
            src={user.profilePictureUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <User className="w-5 h-5 text-white" />
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.id}`} className="font-medium text-gray-800 truncate dark:text-white block hover:underline" onClick={e => e.stopPropagation()} tabIndex={-1}>
          {user.firstName} {user.lastName}
        </Link>
        <div className="flex items-center mt-1">
          {user.roles && user.roles.length > 0 ? (
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
              getRoleColor(user.roles[0])
            )}>
              {getRoleIcon(user.roles[0])}
              {getFrenchRoleDisplayName(user.roles[0])}
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              <User className="w-3 h-3 mr-1 text-gray-600 dark:text-gray-400" />
              Utilisateur
            </span>
          )}
        </div>
      </div>
      <button 
        onClick={(e) => handleSuggestionClick(user, e)} 
        className="ml-2 text-[#528eb2] p-2 rounded-full hover:bg-blue-100 transition-colors dark:text-[#78b9dd] dark:hover:bg-blue-900/30"
        aria-label={`Voir le profil de ${user.firstName} ${user.lastName}`}
      >
        <Search className="w-4 h-4" />
      </button>
    </motion.div>
  );
}; 