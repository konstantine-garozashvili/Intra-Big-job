<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class VerificationService
{
    private EntityManagerInterface $entityManager;
    private EmailService $emailService;
    private UrlGeneratorInterface $urlGenerator;
    private string $frontendUrl;
    
    public function __construct(
        EntityManagerInterface $entityManager,
        EmailService $emailService,
        UrlGeneratorInterface $urlGenerator
    ) {
        $this->entityManager = $entityManager;
        $this->emailService = $emailService;
        $this->urlGenerator = $urlGenerator;
        $this->frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:5173';
    }
    
    /**
     * Génère un token de vérification pour un utilisateur
     */
    public function generateVerificationToken(User $user): string
    {
        // Générer un token unique
        $token = bin2hex(random_bytes(32));
        
        // Enregistrer le token dans l'entité utilisateur
        $user->setVerificationToken($token);
        $user->setIsEmailVerified(false);
        
        // Persister les changements
        $this->entityManager->persist($user);
        $this->entityManager->flush();
        
        return $token;
    }
    
    /**
     * Envoie un email de confirmation à l'utilisateur
     */
    public function sendVerificationEmail(User $user): void
    {
        // Générer un nouveau token si l'utilisateur n'en a pas
        if (!$user->getVerificationToken()) {
            $this->generateVerificationToken($user);
        }
        
        // Générer l'URL de vérification en utilisant l'API backend
        $apiVerificationUrl = $this->urlGenerator->generate(
            'verify_email',
            ['token' => $user->getVerificationToken()],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
        
        // Envoyer l'email avec le template
        $this->emailService->sendTemplate(
            $user->getEmail(),
            'Confirmation de votre compte',
            'emails/verification',
            [
                'user' => $user,
                'verificationUrl' => $apiVerificationUrl
            ],
            'no-reply@bigproject.com',
            'Big Project'
        );
    }
    
    /**
     * Vérifie un token de confirmation et active le compte si valide
     */
    public function verifyEmail(string $token): ?User
    {
        // Rechercher l'utilisateur par token
        $user = $this->entityManager->getRepository(User::class)
            ->findOneBy(['verificationToken' => $token]);
        
        if (!$user) {
            return null;
        }
        
        // Marquer l'email comme vérifié
        $user->setIsEmailVerified(true);
        $user->setVerificationToken(null); // Réinitialiser le token après usage
        
        // Persister les changements
        $this->entityManager->persist($user);
        $this->entityManager->flush();
        
        return $user;
    }
} 