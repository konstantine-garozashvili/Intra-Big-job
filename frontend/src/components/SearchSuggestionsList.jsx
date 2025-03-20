import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { ROLES } from '../features/roles/roleContext';
import { getRoleDisplayFormat } from '../lib/utils/roleDisplay.jsx';
import { SearchSuggestionItem } from './SearchSuggestionItem';

export const SearchSuggestionsList = ({ 
  suggestions, 
  isRoleSearch, 
  activeSuggestion, 
  setActiveSuggestion, 
  handleSuggestionClick,
  allowedSearchRoles,
  hasRole,
  hasAnyRole,
  suggestionsRef,
  query,
  containerWidth,
  dropdownPosition,
  handleKeyDown
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "search-dropdown-portal overflow-hidden bg-white rounded-xl shadow-xl border border-gray-100",
        "max-h-[300px] md:max-h-[400px]"
      )}
      style={{ 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
        position: 'absolute',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: dropdownPosition.width ? `${dropdownPosition.width}px` : (containerWidth > 0 ? `${containerWidth}px` : '100%')
      }}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {suggestions.length === 0 ? (
        <EmptySuggestionState 
          isRoleSearch={isRoleSearch} 
          hasRole={hasRole} 
          hasAnyRole={hasAnyRole}
          allowedSearchRoles={allowedSearchRoles}
        />
      ) : (
        <div className="overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500">
              {suggestions.length} résultat{suggestions.length > 1 ? 's' : ''} trouvé{suggestions.length > 1 ? 's' : ''}
              {isRoleSearch && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                  <Briefcase className="w-3 h-3 mr-1" />
                  Recherche par rôle
                </span>
              )}
            </p>
          </div>
          <div 
            ref={suggestionsRef}
            className="max-h-[250px] overflow-y-auto py-1 divide-y divide-gray-50"
          >
            {suggestions.map((user, index) => (
              <SearchSuggestionItem
                key={user.id || index}
                user={user}
                index={index}
                activeSuggestion={activeSuggestion}
                handleSuggestionClick={handleSuggestionClick}
                setActiveSuggestion={setActiveSuggestion}
              />
            ))}
          </div>
          
          {/* Message d'aide pour les rôles spéciaux */}
          {(hasRole(ROLES.SUPERADMIN) || hasRole(ROLES.RECRUITER) || hasRole(ROLES.TEACHER) || 
            hasRole(ROLES.STUDENT) || hasRole(ROLES.HR) || hasRole(ROLES.GUEST) || 
            hasRole(ROLES.ADMIN)) && query.length === 0 && (
            <HelpMessageForSpecialRoles 
              hasRole={hasRole} 
              hasAnyRole={hasAnyRole}
              allowedSearchRoles={allowedSearchRoles}
            />
          )}
        </div>
      )}
    </motion.div>
  );
};

const EmptySuggestionState = ({ isRoleSearch, hasRole, hasAnyRole, allowedSearchRoles }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.1 }}
    className="p-6 text-center"
  >
    <div className="flex flex-col items-center justify-center">
      {isRoleSearch ? (
        <>
          <Briefcase className="w-10 h-10 text-purple-300 mb-2" />
          <p className="text-gray-500 font-medium">Aucun utilisateur trouvé avec ce rôle</p>
          <p className="text-gray-400 text-sm mt-1">
            {hasRole(ROLES.ADMIN) && !hasRole(ROLES.SUPERADMIN) ? (
              <>En tant qu'Admin, vous ne pouvez pas rechercher les <strong>super admins</strong>. Essayez un autre rôle.</>
            ) : hasRole(ROLES.TEACHER) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN]) ? (
              <>En tant que Formateur, vous pouvez uniquement rechercher des <strong>étudiants</strong> et des personnes des <strong>ressources humaines</strong></>
            ) : hasRole(ROLES.RECRUITER) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.HR, ROLES.TEACHER]) ? (
              <>En tant que Recruteur, vous pouvez uniquement rechercher des <strong>étudiants</strong> et des <strong>formateurs</strong></>
            ) : hasRole(ROLES.HR) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN]) ? (
              <>En tant que RH, vous pouvez uniquement rechercher des <strong>étudiants</strong>, des <strong>formateurs</strong> et des <strong>recruteurs</strong></>
            ) : allowedSearchRoles.length > 0 ? (
              allowedSearchRoles.length === 1 ? (
                <>Vous pouvez uniquement rechercher des <strong>{getRoleDisplayFormat(allowedSearchRoles[0]).toLowerCase()}</strong></>
              ) : (
                <>Essayez avec un autre rôle : {allowedSearchRoles.map(role => getRoleDisplayFormat(role).toLowerCase()).join(', ')}</>
              )
            ) : (
              <>Essayez avec un autre terme de recherche</>
            )}
          </p>
        </>
      ) : (
        <>
          <Search className="w-10 h-10 text-gray-300 mb-2" />
          <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
          <p className="text-gray-400 text-sm mt-1">
            {hasRole(ROLES.ADMIN) && !hasRole(ROLES.SUPERADMIN) ? (
              <>Essayez avec un autre terme ou recherchez par rôle (à l'exception des <strong>super admins</strong>) : {allowedSearchRoles.map(role => getRoleDisplayFormat(role).toLowerCase()).join(', ')}</>
            ) : hasRole(ROLES.TEACHER) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN]) ? (
              <>Essayez avec un autre terme ou recherchez par rôle : <strong>étudiant</strong> ou <strong>ressources humaines</strong></>
            ) : hasRole(ROLES.RECRUITER) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.HR, ROLES.TEACHER]) ? (
              <>Essayez avec un autre terme ou recherchez par rôle : <strong>étudiant</strong> ou <strong>formateur</strong></>
            ) : hasRole(ROLES.HR) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN]) ? (
              <>Essayez avec un autre terme ou recherchez par rôle : <strong>étudiant</strong>, <strong>formateur</strong> ou <strong>recruteur</strong></>
            ) : allowedSearchRoles.length > 0 ? (
              allowedSearchRoles.length === 1 ? (
                <>Essayez avec un autre terme ou recherchez par le rôle <strong>{getRoleDisplayFormat(allowedSearchRoles[0]).toLowerCase()}</strong></>
              ) : (
                <>Essayez avec un autre terme ou recherchez par rôle : {allowedSearchRoles.map(role => getRoleDisplayFormat(role).toLowerCase()).join(', ')}</>
              )
            ) : (
              <>Essayez avec un autre terme de recherche</>
            )}
          </p>
        </>
      )}
    </div>
  </motion.div>
);

const HelpMessageForSpecialRoles = ({ hasRole, hasAnyRole, allowedSearchRoles }) => (
  <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
    <p>
      {hasRole(ROLES.SUPERADMIN) ? (
        <>En tant que Super Admin, vous pouvez rechercher tous les utilisateurs par nom ou par rôle : {allowedSearchRoles.map(role => 
          role !== 'SUPERADMIN' ? getRoleDisplayFormat(role).toLowerCase() : null
        ).filter(Boolean).join(', ')}</>
      ) : hasRole(ROLES.ADMIN) ? (
        <>En tant qu'Admin, vous pouvez rechercher tous les utilisateurs par nom ou par rôle, à l'exception des <strong>super admins</strong> : {allowedSearchRoles.map(role => 
          getRoleDisplayFormat(role).toLowerCase()
        ).filter(Boolean).join(', ')}</>
      ) : hasRole(ROLES.RECRUITER) && !hasRole(ROLES.SUPERADMIN) ? (
        <>En tant que Recruteur, vous pouvez uniquement rechercher des <strong>étudiants</strong> et des <strong>formateurs</strong> par nom ou par rôle</>
      ) : hasRole(ROLES.TEACHER) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN]) ? (
        <>En tant que Formateur, vous pouvez uniquement rechercher des <strong>étudiants</strong> et des personnes des <strong>ressources humaines</strong> par nom ou par rôle</>
      ) : hasRole(ROLES.STUDENT) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.TEACHER]) ? (
        <>En tant qu'Étudiant, vous pouvez rechercher des <strong>formateurs</strong>, <strong>étudiants</strong>, <strong>recruteurs</strong>, et <strong>ressources humaines</strong> par nom ou par rôle</>
      ) : hasRole(ROLES.HR) && !hasAnyRole([ROLES.ADMIN, ROLES.SUPERADMIN]) ? (
        <>En tant que RH, vous pouvez uniquement rechercher des <strong>étudiants</strong>, des <strong>formateurs</strong> et des <strong>recruteurs</strong> par nom ou par rôle</>
      ) : hasRole(ROLES.GUEST) ? (
        <>En tant qu'Invité, vous pouvez uniquement rechercher des <strong>recruteurs</strong> par nom ou par rôle</>
      ) : (
        <>Vous pouvez rechercher par nom ou par rôle</>
      )}
    </p>
  </div>
); 