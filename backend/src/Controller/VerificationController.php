<?php

namespace App\Controller;

use App\Entity\User;
use App\Service\VerificationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class VerificationController extends AbstractController
{
    private VerificationService $verificationService;
    private string $frontendUrl;
    private EntityManagerInterface $entityManager;

    public function __construct(
        VerificationService $verificationService,
        EntityManagerInterface $entityManager
    ) {
        $this->verificationService = $verificationService;
        $this->entityManager = $entityManager;
        $this->frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:5173';
    }

    /**
     * Endpoint pour vérifier l'email avec le token
     */
    #[Route('/api/verify-email/{token}', name: 'verify_email', methods: ['GET'])]
    public function verifyEmail(string $token): Response
    {
        $user = $this->verificationService->verifyEmail($token);

        if (!$user) {
            // Rediriger vers la page d'erreur du frontend si le token est invalide
            return new RedirectResponse($this->frontendUrl . '/verification-error');
        }

        // Rediriger vers la page de succès du frontend
        return new RedirectResponse($this->frontendUrl . '/verification-success');
    }

    /**
     * Page de succès de vérification (fallback si le frontend n'est pas disponible)
     */
    #[Route('/verification-success', name: 'verification_success', methods: ['GET'])]
    public function verificationSuccess(): Response
    {
        return $this->render('verification/success.html.twig');
    }

    /**
     * Page d'erreur de vérification (fallback si le frontend n'est pas disponible)
     */
    #[Route('/verification-error', name: 'verification_error', methods: ['GET'])]
    public function verificationError(): Response
    {
        return $this->render('verification/error.html.twig');
    }

    /**
     * Endpoint pour renvoyer l'email de vérification
     */
    #[Route('/api/resend-verification-email', name: 'resend_verification_email', methods: ['POST'])]
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            
            if (!isset($data['email'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Email requis'
                ], 400);
            }
            
            $userRepository = $this->entityManager->getRepository(User::class);
            $user = $userRepository->findOneBy(['email' => $data['email']]);
            
            if (!$user) {
                return $this->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }
            
            if ($user->isEmailVerified()) {
                return $this->json([
                    'success' => false,
                    'message' => 'Email déjà vérifié'
                ], 400);
            }
            
            $this->verificationService->sendVerificationEmail($user);
            
            return $this->json([
                'success' => true,
                'message' => 'Email de vérification renvoyé avec succès'
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'envoi de l\'email: ' . $e->getMessage()
            ], 500);
        }
    }
} 