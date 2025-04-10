<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Psr\Log\LoggerInterface;

/**
 * Contrôleur pour gérer la vérification de Google reCAPTCHA
 */
class RecaptchaController extends AbstractController
{
    /**
     * @var HttpClientInterface
     */
    private $httpClient;
    
    /**
     * @var string
     */
    private $recaptchaSecret;
    
    /**
     * @var LoggerInterface|null
     */
    private $logger;
    
    /**
     * Constructeur avec injection de dépendances
     *
     * @param HttpClientInterface $httpClient Client HTTP pour les requêtes externes
     * @param string $recaptchaSecret Clé secrète Google reCAPTCHA (à injecter via services.yaml)
     * @param LoggerInterface|null $logger Service de journalisation
     */
    public function __construct(
        HttpClientInterface $httpClient, 
        string $recaptchaSecret = null,
        LoggerInterface $logger = null
    ) {
        $this->httpClient = $httpClient;
        $this->logger = $logger;
        
        // Utiliser la clé d'environnement ou une valeur par défaut (pour le développement uniquement)
        $this->recaptchaSecret = $recaptchaSecret ?: $_ENV['RECAPTCHA_SECRET_KEY'] ?? '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';
    }
    
    /**
     * Endpoint pour vérifier un token reCAPTCHA
     *
     * @Route("/api/verify-recaptcha", name="app_verify_recaptcha", methods={"POST"})
     */
    public function verifyRecaptcha(Request $request): JsonResponse
    {
        // Récupérer le token du corps de la requête
        $data = json_decode($request->getContent(), true);
        $token = $data['token'] ?? null;
        
        // Vérifier si un token a été fourni
        if (!$token) {
            return $this->json([
                'success' => false,
                'message' => 'Token reCAPTCHA manquant'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        try {
            // Appeler l'API Google reCAPTCHA pour vérifier le token
            $response = $this->httpClient->request('POST', 'https://www.google.com/recaptcha/api/siteverify', [
                'body' => [
                    'secret' => $this->recaptchaSecret,
                    'response' => $token,
                    // Facultatif : inclure l'adresse IP de l'utilisateur pour une vérification supplémentaire
                    'remoteip' => $request->getClientIp()
                ]
            ]);
            
            // Décoder la réponse JSON
            $result = $response->toArray();
            
            // Journaliser la réponse en développement
            if ($_ENV['APP_ENV'] === 'dev' && $this->logger) {
                $this->logger->info('Réponse de vérification reCAPTCHA', $result);
            }
            
            // Vérifier si la validation a réussi
            if ($result['success'] === true) {
                // Vérifier le score pour reCAPTCHA v3 (ne s'applique pas à v2)
                if (isset($result['score'])) {
                    // La version v3 renvoie un score entre 0.0 et 1.0
                    // Vous pouvez définir votre seuil (0.5 est recommandé par Google)
                    $score = $result['score'];
                    $threshold = 0.5;
                    
                    if ($score < $threshold) {
                        return $this->json([
                            'success' => false,
                            'message' => 'Score reCAPTCHA trop bas',
                            'score' => $score
                        ], Response::HTTP_OK);
                    }
                }
                
                // La validation a réussi
                return $this->json([
                    'success' => true,
                    'message' => 'Vérification reCAPTCHA réussie'
                ], Response::HTTP_OK);
            } else {
                // Récupérer les codes d'erreur
                $errorCodes = $result['error-codes'] ?? ['unknown-error'];
                
                return $this->json([
                    'success' => false,
                    'message' => 'Échec de la vérification reCAPTCHA',
                    'errors' => $errorCodes
                ], Response::HTTP_OK);
            }
        } catch (\Exception $e) {
            // Gérer les erreurs de requête
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la vérification du reCAPTCHA: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 