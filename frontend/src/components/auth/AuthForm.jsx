/**
 * Traite la soumission du formulaire de connexion
 * @param {FormData} data - Les données du formulaire
 */
const handleSubmit = async (data) => {
  setIsSubmitting(true);
  setError('');

  try {
    // Nettoyer le cache des rôles pour s'assurer qu'aucune donnée n'est conservée de l'utilisateur précédent
    localStorage.removeItem('userRoles');
    localStorage.removeItem('last_role');
    
    // Invalider les requêtes liées aux rôles pour assurer un rafraîchissement complet
    if (queryClient) {
      queryClient.removeQueries(['userRoles']);
      queryClient.removeQueries(['user']);
      queryClient.removeQueries(['user-data']);
    }

    // Effectuer la connexion
    const response = await authService.login(data.username, data.password);

    if (response.success) {
      toast.success("Connexion réussie! Redirection en cours...");
      
      // Déclencher l'événement de connexion réussie pour informer l'application
      window.dispatchEvent(new Event('login-success'));
      
      // Forcer un rafraîchissement des rôles avant la navigation
      await authService.forceRoleRefresh();
      
      // Déclencher des événements pour s'assurer que tous les composants sont informés
      window.dispatchEvent(new Event('role-change'));
      window.dispatchEvent(new Event('user-change'));
      
      // Permettre un court délai pour que tous les événements soient traités
      setTimeout(() => {
        // Si une URL de retour est stockée, y rediriger l'utilisateur
        const returnTo = sessionStorage.getItem('returnTo');
        if (returnTo) {
          sessionStorage.removeItem('returnTo');
          navigate(returnTo, { replace: true });
        } else {
          // Sinon, utiliser le chemin de tableau de bord par défaut
          navigate('/');
        }
      }, 300); // Délai légèrement plus long pour s'assurer que tout est chargé
    } else {
      setError(response.message || "Erreur lors de la connexion. Veuillez réessayer.");
    }
  } catch (error) {
    // Gérer les différents types d'erreurs
    if (error.response && error.response.status === 401) {
      setError("Identifiants incorrects. Veuillez vérifier votre nom d'utilisateur et votre mot de passe.");
    } else if (error.message) {
      setError(`Erreur: ${error.message}`);
    } else {
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
    console.error("Erreur de connexion:", error);
  } finally {
    setIsSubmitting(false);
  }
}; 