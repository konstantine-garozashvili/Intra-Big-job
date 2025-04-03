<?php

namespace App\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Écouteur pour les requêtes entrantes avant traitement par les contrôleurs
 */
class PreRequestListener implements EventSubscriberInterface
{
    /**
     * {@inheritdoc}
     */
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => ['onKernelRequest', 30], // priorité élevée
        ];
    }

    /**
     * Traite la requête entrante
     */
    public function onKernelRequest(RequestEvent $event): void
    {
        $request = $event->getRequest();
        
        // Ne traiter que les requêtes d'inscription
        if (!$request->isMethod('POST')) {
            return;
        }
        
        $path = $request->getPathInfo();
        if (!str_contains($path, '/api/register')) {
            return;
        }
        
        // Capturer le contenu de la requête
        $content = $request->getContent();
        if (empty($content)) {
            return;
        }
        
        // Décoder le JSON
        $data = json_decode($content, true);
        if (!$data || json_last_error() !== JSON_ERROR_NONE) {
            return;
        }
        
        // Validation du mot de passe
        if (isset($data['password'])) {
            $password = (string)$data['password'];
            $passwordLength = mb_strlen($password, '8bit');
            
            error_log('PreRequestListener - Mot de passe détecté - Longueur: ' . $passwordLength);
            
            // Bloquer les mots de passe trop longs
            if ($passwordLength > 50) {
                error_log('PreRequestListener - BLOCAGE: Mot de passe trop long (' . $passwordLength . ' caractères)');
                
                // Créer une réponse d'erreur
                $response = new JsonResponse([
                    'success' => false,
                    'message' => 'Le mot de passe ne doit pas dépasser 50 caractères',
                    'errors' => [
                        'password' => 'Longueur maximale dépassée (50 caractères)'
                    ]
                ], 400);
                
                // Remplacer la réponse de la requête
                $event->setResponse($response);
                return;
            }
        }
    }
} 