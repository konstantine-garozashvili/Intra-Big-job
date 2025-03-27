<?php

namespace App\Service;

class ValidationService
{
    /**
     * Vérifie si une URL LinkedIn est valide
     * @param string|null $url L'URL à valider
     * @return bool True si l'URL est valide ou vide
     */
    public function isValidLinkedInUrl(?string $url): bool
    {
        error_log('ValidationService - Validation URL LinkedIn: ' . ($url ?? 'null'));
        
        if (empty($url)) {
            error_log('ValidationService - URL vide, considérée comme valide');
            return true;
        }

        // Vérifier que l'URL commence par https://
        if (!str_starts_with($url, 'https://')) {
            error_log('ValidationService - URL invalide: ne commence pas par https://');
            return false;
        }

        // Vérifier que c'est une URL LinkedIn valide
        // Accepter les URLs avec ou sans www, et avec des tirets dans le nom d'utilisateur
        if (!(str_starts_with($url, 'https://www.linkedin.com/in/') || 
              str_starts_with($url, 'https://linkedin.com/in/'))) {
            error_log('ValidationService - URL invalide: format LinkedIn incorrect');
            return false;
        }
        
        // Vérifier que l'URL contient /in/ et qu'il y a un nom d'utilisateur après
        if (strpos($url, '/in/') === false) {
            error_log('ValidationService - URL invalide: ne contient pas /in/');
            return false;
        }
        
        // Extraire le nom d'utilisateur après /in/
        $parts = explode('/in/', $url);
        if (count($parts) < 2 || empty($parts[1])) {
            error_log('ValidationService - URL invalide: pas de nom d\'utilisateur après /in/');
            return false;
        }
        
        // Le nom d'utilisateur peut contenir des tirets, des points, des underscores
        // On accepte tous les formats valides de LinkedIn
        error_log('ValidationService - URL LinkedIn valide: ' . $url);
        return true;
    }

    /**
     * Vérifie si une URL de portfolio est valide
     * @param string|null $url L'URL à valider
     * @return bool True si l'URL est valide ou vide
     */
    public function isValidPortfolioUrl(?string $url): bool
    {
        if (empty($url)) {
            return true;
        }

        // Vérifier que l'URL commence par https://
        return str_starts_with($url, 'https://');
    }
}