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
        if (empty($url)) {
            return true;
        }

        // Vérifier que l'URL commence par https://
        if (!str_starts_with($url, 'https://')) {
            return false;
        }

        // Vérifier que c'est une URL LinkedIn valide
        return str_starts_with($url, 'https://www.linkedin.com/in/');
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