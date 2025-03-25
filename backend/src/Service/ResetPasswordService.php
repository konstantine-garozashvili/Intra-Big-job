<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;
use Psr\Log\LoggerInterface;

class ResetPasswordService
{
    private const TOKEN_TTL = 3600; // Durée de validité du token en secondes (1 heure)
    private const MIN_PASSWORD_LENGTH = 8; // Longueur minimale du mot de passe

    private EntityManagerInterface $entityManager;
    private TokenGeneratorInterface $tokenGenerator;
    private UserPasswordHasherInterface $passwordHasher;
    private EmailService $emailService;
    private ParameterBagInterface $params;
    private LoggerInterface $logger;
    private string $frontendUrl;

    public function __construct(
        EntityManagerInterface $entityManager,
        TokenGeneratorInterface $tokenGenerator,
        UserPasswordHasherInterface $passwordHasher,
        EmailService $emailService,
        ParameterBagInterface $params,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->tokenGenerator = $tokenGenerator;
        $this->passwordHasher = $passwordHasher;
        $this->emailService = $emailService;
        $this->params = $params;
        $this->logger = $logger;
        $this->frontendUrl = $params->get('app.frontend_url');
    }

    /**
     * Génère un token de réinitialisation pour l'utilisateur et envoie un email
     * 
     * @param string $email Adresse email de l'utilisateur
     * @return array Tableau contenant le résultat de l'opération et le token généré
     * @throws \Exception si une erreur se produit
     */
    public function requestReset(string $email): array
    {
        // Chercher l'utilisateur par son email (insensible à la casse)
        $repository = $this->entityManager->getRepository(User::class);
        $queryBuilder = $repository->createQueryBuilder('u');
        $user = $queryBuilder
            ->where('LOWER(u.email) = LOWER(:email)')
            ->setParameter('email', strtolower($email))
            ->getQuery()
            ->getOneOrNullResult();
        
        // Si l'utilisateur n'existe pas, ne pas révéler cette information (sécurité)
        if (!$user) {
            // Journaliser pour le débogage (à retirer en production)
            error_log("Aucun utilisateur trouvé avec l'email: " . $email);
            // On retourne un tableau sans token pour ne pas indiquer si l'email existe ou non
            return ['success' => true, 'token' => null];
        }
        
        try {
            // Générer un token sécurisé
            $resetToken = $this->tokenGenerator->generateToken();
            
            // Définir la date d'expiration (1 heure)
            $expiresAt = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->modify('+' . self::TOKEN_TTL . ' seconds'); 

            // Stocker le token et la date d'expiration
            $user->setResetPasswordToken($resetToken);
            $user->setResetPasswordExpires($expiresAt);
            
            // Persister les changements
            $this->entityManager->flush();
            
            // Au lieu d'envoyer l'email, on retourne le token
            return ['success' => true, 'token' => $resetToken];
        } catch (\Exception $e) {
            // Journaliser l'erreur
            error_log('Erreur lors de la réinitialisation de mot de passe: ' . $e->getMessage());
            // Propager l'exception pour que le contrôleur puisse la gérer
            throw $e;
        }
    }
    
    /**
     * Vérifie si un token est valide
     * 
     * @param string $token Token à vérifier
     * @return User|null L'utilisateur associé au token ou null si invalide
     */
    public function validateToken(string $token): ?User
    {
        try {
            $this->logger->info('Vérification du token: ' . substr($token, 0, 8) . '...');
            
            // Chercher l'utilisateur par le token
            $user = $this->entityManager->getRepository(User::class)->findOneBy(['resetPasswordToken' => $token]);
            
            // Si aucun utilisateur n'est trouvé
            if (!$user) {
                $this->logger->info('Aucun utilisateur trouvé avec ce token');
                return null;
            }
            
            // Vérifier si le token est valide et non expiré
            if (!$this->isTokenValid($user)) {
                $this->logger->info('Token expiré pour l\'utilisateur: ' . $user->getEmail());
                return null;
            }
            
            $this->logger->info('Token valide pour l\'utilisateur: ' . $user->getEmail());
            return $user;
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors de la validation du token: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Réinitialise le mot de passe d'un utilisateur
     * 
     * @param string $token Token de réinitialisation
     * @param string $newPassword Nouveau mot de passe
     * @return bool Succès ou échec de l'opération
     */
    public function resetPassword(string $token, string $newPassword): bool
    {
        // Valider le token et récupérer l'utilisateur
        $user = $this->validateToken($token);
        
        if (!$user) {
            return false;
        }
        
        // Valider le nouveau mot de passe
        if (strlen($newPassword) < self::MIN_PASSWORD_LENGTH) {
            return false;
        }
        
        // Hasher le nouveau mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
        
        // Mettre à jour le mot de passe
        $user->setPassword($hashedPassword);
        
        // Effacer le token et la date d'expiration
        $user->setResetPasswordToken(null);
        $user->setResetPasswordExpires(null);
        
        // Persister les changements
        $this->entityManager->flush();
        
        return true;
    }
    
    /**
     * Vérifie si le token de réinitialisation est valide et non expiré
     * 
     * @param User $user L'utilisateur à vérifier
     * @return bool True si le token est valide, false sinon
     */
    private function isTokenValid(User $user): bool
    {
        $expiresAt = $user->getResetPasswordExpires();
        
        // Vérifier si le token a une date d'expiration
        if (!$expiresAt) {
            $this->logger->info('Token sans date d\'expiration');
            return false;
        }
        
        // Vérifier si le token n'est pas expiré
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $isValid = $expiresAt > $now;
        
        $this->logger->info('Vérification validité token : ' . ($isValid ? 'Valide' : 'Expiré') . ', expire le ' . $expiresAt->format('Y-m-d H:i:s'));
        
        return $isValid;
    }
    
    /**
     * Envoie un email de réinitialisation de mot de passe à l'utilisateur
     */
    private function sendResetEmail(User $user, string $token): void
    {
        try {
            // URL de réinitialisation pour le frontend (ex: http://localhost:5173/reset-password/[token])
            $resetUrl = $this->frontendUrl . '/reset-password/' . $token;
            
            // Envoyer l'email avec le template
            $this->emailService->sendTemplate(
                $user->getEmail(),
                'Réinitialisation de votre mot de passe',
                'emails/reset_password',
                [
                    'username' => $user->getFirstName() . ' ' . $user->getLastName(),
                    'resetUrl' => $resetUrl,
                    'expiresIn' => self::TOKEN_TTL / 60, // Convertir en minutes
                ],
                'no-reply@bigproject.com', // Ajout d'un expéditeur
                'BigProject' // Nom de l'expéditeur
            );
            
            $this->logger->info('Email de réinitialisation envoyé à: ' . $user->getEmail());
        } catch (\Exception $e) {
            $this->logger->error('Échec de l\'envoi de l\'email de réinitialisation: ' . $e->getMessage());
            throw $e; // On propage l'erreur pour la gérer dans le contrôleur
        }
    }
}
