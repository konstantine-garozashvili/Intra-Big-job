<?php

namespace App\Controller;

use App\Service\RegistrationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;

#[Route('/api')]
class RegistrationController extends AbstractController
{
    private RegistrationService $registrationService;

    public function __construct(RegistrationService $registrationService)
    {
        $this->registrationService = $registrationService;
    }

    /**
     * Endpoint pour l'inscription d'un nouvel utilisateur
     */
    #[Route('/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        try {
            // Forcer l'encodage UTF-8 pour la requête
            $content = $request->getContent();
            $data = json_decode($content, true);
            
            // Journaliser les données reçues (sans le mot de passe)
            $logData = $data;
            if (isset($logData['password'])) {
                $logData['password'] = '***';
            }
            error_log('Données d\'inscription reçues: ' . json_encode($logData, JSON_UNESCAPED_UNICODE));
            
            // Vérifier les données requises
            if (!isset($data['email']) || !isset($data['password']) || !isset($data['firstName']) || !isset($data['lastName'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Certains champs obligatoires sont manquants'
                ], 400);
            }
            
            // Enregistrer l'utilisateur
            $user = $this->registrationService->registerUser($data);
            
            // Journaliser l'inscription réussie
            error_log('Inscription réussie pour l\'utilisateur: ' . $user->getEmail());
            
            // Retourner plus d'informations sur l'utilisateur pour faciliter l'envoi d'email
            return $this->json([
                'success' => true,
                'message' => 'Inscription réussie.',
                'userId' => $user->getId(),
                'userData' => [
                    'email' => $user->getEmail(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    // Ne pas inclure de données sensibles comme le mot de passe
                ]
            ]);
        } catch (UniqueConstraintViolationException $e) {
            error_log('Erreur d\'inscription - Email déjà utilisé: ' . ($data['email'] ?? 'inconnu'));
            return $this->json([
                'success' => false,
                'message' => 'Cette adresse email est déjà utilisée.'
            ], 409);
        } catch (\InvalidArgumentException $e) {
            error_log('Erreur d\'inscription - Données invalides: ' . $e->getMessage());
            return $this->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => json_decode($e->getMessage(), true)
            ], 400);
        } catch (\Exception $e) {
            error_log('Erreur d\'inscription - Exception: ' . $e->getMessage());
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'inscription: ' . $e->getMessage()
            ], 500);
        }
    }
}