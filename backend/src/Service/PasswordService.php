<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Psr\Log\LoggerInterface;

class PasswordService
{
    private const MIN_PASSWORD_LENGTH = 8; // Longueur minimale du mot de passe

    private EntityManagerInterface $entityManager;
    private UserPasswordHasherInterface $passwordHasher;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->passwordHasher = $passwordHasher;
        $this->logger = $logger;
    }

    /**
     * Change le mot de passe d'un utilisateur
     * 
     * @param User $user Utilisateur dont le mot de passe doit être changé
     * @param string $currentPassword Mot de passe actuel
     * @param string $newPassword Nouveau mot de passe
     * @return array Tableau avec 'success' (bool) et 'message' (string)
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): array
    {
        // Vérifier que le mot de passe actuel est correct
        if (!$this->passwordHasher->isPasswordValid($user, $currentPassword)) {
            return [
                'success' => false,
                'message' => 'Le mot de passe actuel est incorrect'
            ];
        }
        
        // Vérifier que le nouveau mot de passe est différent de l'ancien
        if ($currentPassword === $newPassword) {
            return [
                'success' => false,
                'message' => 'Le nouveau mot de passe doit être différent de l\'ancien'
            ];
        }
        
        // Vérifier la longueur minimale du mot de passe
        if (strlen($newPassword) < self::MIN_PASSWORD_LENGTH) {
            return [
                'success' => false,
                'message' => 'Le mot de passe doit contenir au moins ' . self::MIN_PASSWORD_LENGTH . ' caractères'
            ];
        }
        
        try {
            // Hasher le nouveau mot de passe
            $hashedPassword = $this->passwordHasher->hashPassword($user, $newPassword);
            
            // Mettre à jour le mot de passe
            $user->setPassword($hashedPassword);
            $user->setUpdatedAt(new \DateTimeImmutable());
            
            // Enregistrer les modifications
            $this->entityManager->flush();
            
            $this->logger->info('Mot de passe changé avec succès pour l\'utilisateur ID: ' . $user->getId());
            
            return [
                'success' => true,
                'message' => 'Mot de passe modifié avec succès'
            ];
        } catch (\Exception $e) {
            $this->logger->error('Erreur lors du changement de mot de passe: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Une erreur est survenue lors du changement de mot de passe'
            ];
        }
    }
} 