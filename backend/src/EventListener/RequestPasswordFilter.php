<?php

namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Filtre de requête qui vérifie la taille du mot de passe pour toutes les requêtes d'inscription
 * Ce filtre est prioritaire (priorité 255) et intercepte les requêtes avant qu'elles n'atteignent les contrôleurs
 */
class RequestPasswordFilter
{
    // Constante de limite absolue du mot de passe
    private const MAX_PASSWORD_LENGTH = 50;

    /**
     * Intercepte les requêtes entrantes pour vérifier la taille du mot de passe
     */
    public function __invoke(RequestEvent $event): void
    {
        $request = $event->getRequest();
        
        // Ignorer toutes les requêtes qui ne sont pas des POST vers /api/register
        if (!$request->isMethod('POST') || !str_contains($request->getPathInfo(), '/api/register')) {
            return;
        }
        
        error_log("[RequestPasswordFilter] Intercepté une requête POST vers " . $request->getPathInfo());
        
        // Vérifier si le contenu est du JSON
        $contentType = $request->headers->get('Content-Type');
        if (!$contentType || !str_contains($contentType, 'application/json')) {
            error_log("[RequestPasswordFilter] Contenu non-JSON ignoré: " . $contentType);
            return;
        }

        try {
            // Récupérer le contenu de la requête
            $content = $request->getContent();
            $data = json_decode($content, true);
            
            // Si aucun contenu JSON valide, ignorer
            if ($data === null) {
                error_log("[RequestPasswordFilter] JSON invalide ignoré");
                return;
            }
            
            // Vérifier si un mot de passe est présent
            if (!isset($data['password'])) {
                error_log("[RequestPasswordFilter] Pas de mot de passe trouvé");
                return;
            }
            
            // Forcer la conversion en string
            $password = (string) $data['password'];
            
            // Journaliser pour le débogage
            error_log("[RequestPasswordFilter] Vérification du mot de passe - Type: " . gettype($data['password']));
            
            // Mesurer la longueur exacte en octets (pour les caractères spéciaux)
            $passwordLength = mb_strlen($password, '8bit');
            error_log("[RequestPasswordFilter] Longueur du mot de passe: " . $passwordLength . " caractères");
            
            // Si le mot de passe dépasse la longueur maximale, bloquer immédiatement
            if ($passwordLength > self::MAX_PASSWORD_LENGTH) {
                error_log("[RequestPasswordFilter] BLOCAGE CRITIQUE: Mot de passe trop long (" . $passwordLength . " caractères)");
                
                // Créer une réponse d'erreur
                $response = new JsonResponse([
                    'success' => false,
                    'message' => 'Le mot de passe ne doit pas dépasser ' . self::MAX_PASSWORD_LENGTH . ' caractères',
                    'error_code' => 'PASSWORD_TOO_LONG',
                    'error_details' => [
                        'field' => 'password',
                        'max_length' => self::MAX_PASSWORD_LENGTH,
                        'actual_length' => $passwordLength
                    ]
                ], Response::HTTP_BAD_REQUEST);
                
                // Remplacer la réponse de la requête et arrêter le traitement
                $event->setResponse($response);
                $event->stopPropagation();
                return;
            }
        } catch (\Exception $e) {
            // En cas d'erreur, journaliser mais ne pas bloquer
            error_log("[RequestPasswordFilter] Erreur lors de la vérification du mot de passe: " . $e->getMessage());
            return;
        }
    }
} 