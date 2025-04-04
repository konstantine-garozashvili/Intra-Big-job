import { cn } from '@/lib/utils';
import { Briefcase, GraduationCap, School, User, UserRound } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Composant affichant la liste des suggestions de recherche
 */
export function SearchSuggestionsList({
  isLoading,
  error,
  suggestions, 
  searchQuery,
  activeSuggestion, 
  onSuggestionClick,
  roleSuggestions = [],
  showRoleSuggestions = false,
  includeDescription = true,
}) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
        Recherche en cours...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-red-500">
        Erreur lors de la recherche
      </div>
    );
  }

  if (
    (!suggestions || suggestions.length === 0) &&
    (!roleSuggestions || roleSuggestions.length === 0)
  ) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Aucun résultat pour &quot;{searchQuery}&quot;
      </div>
    );
  }

  // Fonction pour obtenir l&apos;icône correspondant au rôle
  const getRoleIcon = (role) => {
    switch (role) {
      case 'ROLE_STUDENT':
        return <GraduationCap className="h-4 w-4" />;
      case 'ROLE_TEACHER':
        return <School className="h-4 w-4" />;
      case 'ROLE_HR':
      case 'ROLE_ADMIN':
      case 'ROLE_SUPER_ADMIN':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="overflow-y-auto max-h-[300px]">
      {showRoleSuggestions && roleSuggestions && roleSuggestions.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500">
            Rechercher par rôle
          </div>
          {roleSuggestions.map((role, index) => (
            <div
              key={`role-${index}`}
      className={cn(
                'flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50',
                activeSuggestion === index && 'bg-gray-50'
              )}
              data-suggestion-index={index}
              data-suggestion-type="role"
              onClick={() => onSuggestionClick(role, 'role')}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 mr-3">
                {getRoleIcon(role)}
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  {role === 'ROLE_STUDENT'
                    ? 'Étudiants'
                    : role === 'ROLE_TEACHER'
                    ? 'Professeurs'
                    : role === 'ROLE_HR'
                    ? 'Ressources Humaines'
                    : role === 'ROLE_ADMIN'
                    ? 'Administrateurs'
                    : role === 'ROLE_SUPER_ADMIN'
                    ? 'Super Administrateurs'
                    : role}
                </div>
              </div>
          </div>
          ))}
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-gray-500">
            Personnes
          </div>
          {suggestions.map((suggestion, index) => {
            const actualIndex = showRoleSuggestions
              ? index + roleSuggestions.length
              : index;
            
            return (
              <div
                key={`suggestion-${suggestion.id || index}`}
                className={cn(
                  'flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50',
                  activeSuggestion === actualIndex && 'bg-gray-50'
                )}
                data-suggestion-index={actualIndex}
                data-suggestion-type="user"
                onClick={() => onSuggestionClick(suggestion, 'user')}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                  {suggestion.profileImageUrl ? (
                    <img
                      src={suggestion.profileImageUrl}
                      alt={`${suggestion.firstName} ${suggestion.lastName}`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {suggestion.firstName} {suggestion.lastName}
                  </div>
                  {includeDescription && suggestion.role && (
                    <div className="text-xs text-gray-500">
                      {suggestion.role === 'ROLE_STUDENT'
                        ? 'Étudiant'
                        : suggestion.role === 'ROLE_TEACHER'
                        ? 'Professeur'
                        : suggestion.role === 'ROLE_HR'
                        ? 'Ressources Humaines'
                        : suggestion.role === 'ROLE_ADMIN'
                        ? 'Administrateur'
                        : suggestion.role === 'ROLE_SUPER_ADMIN'
                        ? 'Super Administrateur'
                        : suggestion.role}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

SearchSuggestionsList.propTypes = {
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  suggestions: PropTypes.array,
  searchQuery: PropTypes.string,
  activeSuggestion: PropTypes.number,
  onSuggestionClick: PropTypes.func.isRequired,
  roleSuggestions: PropTypes.array,
  showRoleSuggestions: PropTypes.bool,
  includeDescription: PropTypes.bool
}; 