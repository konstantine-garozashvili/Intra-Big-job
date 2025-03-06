<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Csrf\TokenGenerator\TokenGeneratorInterface;

class ResetPasswordService
{
    private const TOKEN_TTL = 3600; // Durée de validité du token en secondes (1 heure)
    private const MIN_PASSWORD_LENGTH = 8; // Longueur minimale du mot de passe

    private EntityManagerInterface $entityManager;
    private TokenGeneratorInterface $tokenGenerator;
    private UserPasswordHasherInterface $passwordHasher;
    private EmailService $emailService;
    private ParameterBagInterface $params;

    public function __construct(
        EntityManagerInterface $entityManager,
        TokenGeneratorInterface $tokenGenerator,
        UserPasswordHasherInterface $passwordHasher,
        EmailService $emailService,
        ParameterBagInterface $params
    ) {
        $this->entityManager = $entityManager;
        $this->tokenGenerator = $tokenGenerator;
        $this->passwordHasher = $passwordHasher;
        $this->emailService = $emailService;
        $this->params = $params;
    }

    /**
     * Génère un token de réinitialisation pour l'utilisateur et envoie un email
     * 
     * @param string $email Adresse email de l'utilisateur
     * @return bool Succès ou échec de l'opération
     */
    public function requestReset(string $email): bool
    {
        // Chercher l'utilisateur par son email
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        
        // Si l'utilisateur n'existe pas, ne pas révéler cette information (sécurité)
        if (!$user) {
            // On retourne true pour ne pas indiquer si l'email existe ou non
            return true;
        }
        
        // Générer un token sécurisé
        $resetToken = $this->tokenGenerator->generateToken();
        
        // Définir la date d'expiration (1 heure)
        $expiresAt = new \DateTimeImmutable('+' . self::TOKEN_TTL . ' seconds');
        
        // Stocker le token et la date d'expiration
        $user->setResetPasswordToken($resetToken);
        $user->setResetPasswordExpires($expiresAt);
        
        // Persister les changements
        $this->entityManager->flush();
        
        // Envoyer l'email avec le lien de réinitialisation
        $this->sendResetEmail($user, $resetToken);
        
        return true;
    }
    
    /**
     * Vérifie si un token est valide
     * 
     * @param string $token Token à vérifier
     * @return User|null L'utilisateur associé au token ou null si invalide
     */
    public function validateToken(string $token): ?User
    {
        // Chercher l'utilisateur par le token
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['resetPasswordToken' => $token]);
        
        // Vérifier si l'utilisateur existe et si le token n'est pas expiré
        if (!$user || !$this->isTokenValid($user)) {
            return null;
        }
        
        return $user;
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
            return false;
        }
        
        // Vérifier si le token n'est pas expiré
        $now = new \DateTimeImmutable();
        
        return $expiresAt > $now;
    }
    
    /**
     * Envoie un email de réinitialisation de mot de passe
     * 
     * @param User $user L'utilisateur
     * @param string $token Le token de réinitialisation
     * @return void
     */
    private function sendResetEmail(User $user, string $token): void
    {
        $frontendUrl = $this->params->get('app.frontend_url');
        $resetUrl = $frontendUrl . '/reset-password/' . $token;
        
        // Préparer les données pour le template
        $context = [
            'username' => $user->getFirstName() . ' ' . $user->getLastName(),
            'resetUrl' => $resetUrl,
            'expiresIn' => self::TOKEN_TTL / 60, // En minutes
        ];
        
        // Envoyer l'email avec le template
        $this->emailService->sendTemplate(
            $user->getEmail(),
            'Réinitialisation de votre mot de passe',
            'emails/reset_password',
            $context
        );
    }
}
