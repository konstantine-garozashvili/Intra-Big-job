<?php

namespace App\Controller;

use App\Service\AuthService;
use App\Service\RefreshTokenService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Psr\Log\LoggerInterface;

#[Route('/api')]
class AuthController extends AbstractController
{
    private AuthService $authService;
    private JWTTokenManagerInterface $jwtManager;
    private RefreshTokenService $refreshTokenService;
    private ParameterBagInterface $params;
    private LoggerInterface $logger;

    public function __construct(
        AuthService $authService,
        JWTTokenManagerInterface $jwtManager,
        RefreshTokenService $refreshTokenService,
        ParameterBagInterface $params,
        LoggerInterface $logger
    ) {
        $this->authService = $authService;
        $this->jwtManager = $jwtManager;
        $this->refreshTokenService = $refreshTokenService;
        $this->params = $params;
        $this->logger = $logger;
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        return $this->json([
            'success' => true,
            'user' => $this->authService->getUserInfo($user)
        ]);
    }
    
    #[Route('/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        $this->logger->info('Début de la demande de déconnexion');
        
        try {
            // Log la requête
            $this->logger->info('Contenu de la requête: ' . $request->getContent());
            
            // Récupérer le refresh token depuis la requête
            $content = json_decode($request->getContent(), true);
            $this->logger->info('Contenu JSON décodé: ' . json_encode($content));
            
            $paramName = $this->params->get('refresh_token.token_parameter_name');
            $this->logger->info('Nom du paramètre de refresh token: ' . $paramName);
            
            $refreshTokenString = $content[$paramName] ?? null;
            $this->logger->info('Refresh token trouvé: ' . ($refreshTokenString ? 'Oui' : 'Non'));
            
            if (!$refreshTokenString) {
                $this->logger->warning('Aucun refresh token fourni dans la requête');
                return $this->json([
                    'success' => false,
                    'message' => 'Refresh token non fourni'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            // Trouver et révoquer le token
            $this->logger->info('Recherche du token: ' . $refreshTokenString);
            $token = $this->refreshTokenService->findOneBy(['refreshToken' => $refreshTokenString]);
            
            if ($token) {
                $this->logger->info('Token trouvé, ID: ' . $token->getId() . ', Username: ' . $token->getUsername());
                
                // Vérification de sécurité: l'utilisateur peut-il révoquer ce token?
                $currentUser = $this->getUser();
                if ($currentUser) {
                    $this->logger->info('Utilisateur actuel: ' . $currentUser->getUserIdentifier());
                    
                    // Seul l'utilisateur propriétaire du token ou un admin peut le révoquer
                    if ($token->getUsername() !== $currentUser->getUserIdentifier() && !$this->isGranted('ROLE_ADMIN')) {
                        $this->logger->warning('Accès refusé: Tentative de suppression du token d\'un autre utilisateur');
                        throw new AccessDeniedException('Vous n\'avez pas le droit de supprimer ce token');
                    }
                } else {
                    $this->logger->warning('Aucun utilisateur authentifié pour cette requête de déconnexion');
                    // C'est probablement la source de votre erreur "Access Denied" si la route nécessite une authentification
                    $this->logger->warning('Vérifiez la configuration de sécurité pour cette route dans security.yaml');
                }
                
                try {
                    $this->logger->info('Tentative de suppression du token');
                    $this->refreshTokenService->remove($token);
                    $this->logger->info('Token supprimé avec succès');
                    
                    return $this->json([
                        'success' => true,
                        'message' => 'Déconnexion réussie'
                    ]);
                } catch (\Exception $e) {
                    $this->logger->error('Erreur lors de la suppression du token: ' . $e->getMessage());
                    $this->logger->error('Trace: ' . $e->getTraceAsString());
                    throw $e;
                }
            } else {
                $this->logger->warning('Token non trouvé dans la base de données');
                return $this->json([
                    'success' => false,
                    'message' => 'Token invalide ou déjà révoqué'
                ], Response::HTTP_BAD_REQUEST);
            }
        } catch (AccessDeniedException $e) {
            $this->logger->error('Accès refusé: ' . $e->getMessage());
            
            return $this->json([
                'success' => false,
                'message' => 'Accès refusé',
                'error' => $e->getMessage()
            ], Response::HTTP_FORBIDDEN);
        } catch (\Exception $e) {
            // Log l'erreur
            $this->logger->error('Erreur lors de la déconnexion: ' . $e->getMessage());
            $this->logger->error('Trace: ' . $e->getTraceAsString());
            
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la déconnexion',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Endpoint pour changer le mot de passe de l'utilisateur connecté
     */
    #[Route('/change-password', name: 'api_change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        try {
            $user = $this->getUser();
            
            if (!$user) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], Response::HTTP_UNAUTHORIZED);
            }
            
            $content = json_decode($request->getContent(), true);
            
            if (!isset($content['currentPassword']) || !isset($content['newPassword'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Veuillez fournir le mot de passe actuel et le nouveau mot de passe'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            $currentPassword = $content['currentPassword'];
            $newPassword = $content['newPassword'];
            
            // Validation avancée du nouveau mot de passe
            $passwordValidation = $this->validatePassword($newPassword);
            
            if (!$passwordValidation['isValid']) {
                $errorMessages = [];
                $errors = $passwordValidation['errors'];
                
                if ($errors['length']) {
                    $errorMessages[] = 'Le mot de passe doit contenir au moins 8 caractères';
                }
                if ($errors['upperCase']) {
                    $errorMessages[] = 'Le mot de passe doit contenir au moins une lettre majuscule';
                }
                if ($errors['lowerCase']) {
                    $errorMessages[] = 'Le mot de passe doit contenir au moins une lettre minuscule';
                }
                if ($errors['digit']) {
                    $errorMessages[] = 'Le mot de passe doit contenir au moins un chiffre';
                }
                if ($errors['specialChar']) {
                    $errorMessages[] = 'Le mot de passe doit contenir au moins un caractère spécial';
                }
                
                return $this->json([
                    'success' => false,
                    'message' => 'Le mot de passe ne respecte pas les critères de sécurité',
                    'errors' => $errorMessages
                ], Response::HTTP_BAD_REQUEST);
            }
            
            $this->authService->changePassword($user, $currentPassword, $newPassword);
            
            return $this->json([
                'success' => true,
                'message' => 'Mot de passe modifié avec succès'
            ]);
            
        } catch (AuthenticationException $e) {
            return $this->json([
                'success' => false,
                'message' => $e->getMessage()
            ], Response::HTTP_UNAUTHORIZED);
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du changement de mot de passe: ' . $e->getMessage());
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors du changement de mot de passe'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Valide un mot de passe selon des critères de complexité
     * 
     * @param string $password Mot de passe à valider
     * @return array Résultat de validation avec détails
     */
    private function validatePassword(string $password): array
    {
        $minLength = 8;
        $hasUpperCase = preg_match('/[A-Z]/', $password);
        $hasLowerCase = preg_match('/[a-z]/', $password);
        $hasDigit = preg_match('/\d/', $password);
        $hasSpecialChar = preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password);
        
        $isValid = 
            strlen($password) >= $minLength && 
            $hasUpperCase && 
            $hasLowerCase && 
            $hasDigit && 
            $hasSpecialChar;
        
        return [
            'isValid' => $isValid,
            'errors' => [
                'length' => strlen($password) < $minLength,
                'upperCase' => !$hasUpperCase,
                'lowerCase' => !$hasLowerCase,
                'digit' => !$hasDigit,
                'specialChar' => !$hasSpecialChar
            ]
        ];
    }
} 