<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Psr\Log\LoggerInterface;

class AuthService
{
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
     * Authentifie un utilisateur avec son email et mot de passe
     * 
     * @param string $email Email de l'utilisateur
     * @param string $password Mot de passe de l'utilisateur
     * @param bool $checkVerification Si true, vérifie que l'email est validé
     * @return User L'utilisateur authentifié
     * @throws AuthenticationException Si l'authentification échoue
     */
    public function authenticateUser(string $email, string $password, bool $checkVerification = true): User
    {
        $this->logger->debug('Authenticating user', ['email' => $email]);
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            $this->logger->warning('Authentication failed: User not found', ['email' => $email]);
            throw new AuthenticationException('Email ou mot de passe incorrect.');
        }

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            $this->logger->warning('Authentication failed: Invalid password', ['email' => $email]);
            throw new AuthenticationException('Email ou mot de passe incorrect.');
        }
        
        // Temporairement désactivé : Vérification de l'email
        /*if ($checkVerification && !$user->isEmailVerified()) {
            $this->logger->warning('Authentication failed: Email not verified', ['email' => $email]);
            throw new AuthenticationException('Veuillez vérifier votre adresse email avant de vous connecter.');
        }*/
        $this->logger->info('User authenticated successfully', ['email' => $email, 'user_id' => $user->getId()]);
        return $user;
    }

    /**
     * Vérifie si un utilisateur est vérifié
     * 
     * @param User $user L'utilisateur à vérifier
     * @return bool True si l'utilisateur est vérifié
     */
    public function isUserVerified(User $user): bool
    {
        return $user->isEmailVerified();
    }

    /**
     * Récupère les informations de base d'un utilisateur
     * 
     * @param User $user L'utilisateur
     * @return array Les informations de base de l'utilisateur
     */
    public function getUserInfo(User $user): array
    {
        $userId = $user->getId();
        $this->logger->info('Starting getUserInfo', ['user_id' => $userId]);

        try {
            $this->logger->debug('Fetching basic info', ['user_id' => $userId]);
            $data = [
                'id' => $userId,
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'isEmailVerified' => $user->isEmailVerified(),
            ];
            $this->logger->debug('Basic info fetched', ['user_id' => $userId]);

            $this->logger->debug('Fetching roles', ['user_id' => $userId]);
            $data['roles'] = $user->getRoles();
            $this->logger->debug('Roles fetched', ['user_id' => $userId]);

            $this->logger->debug('Fetching theme', ['user_id' => $userId]);
            $theme = $user->getTheme();
            $data['theme'] = $theme ? [
                'id' => $theme->getId(),
                'name' => $theme->getName()
            ] : null;
            $this->logger->debug('Theme fetched', ['user_id' => $userId, 'theme_id' => $theme ? $theme->getId() : 'null']);

            $this->logger->debug('Fetching specialization', ['user_id' => $userId]);
            $specialization = $user->getSpecialization();
            $data['specialization'] = $specialization ? [
                'id' => $specialization->getId(),
                'name' => $specialization->getName()
            ] : null;
            $this->logger->debug('Specialization fetched', ['user_id' => $userId, 'specialization_id' => $specialization ? $specialization->getId() : 'null']);

            $this->logger->debug('Fetching nationality', ['user_id' => $userId]);
            $nationality = $user->getNationality();
            $data['nationality'] = $nationality ? [
                'id' => $nationality->getId(),
                'name' => $nationality->getName()
            ] : null;
            $this->logger->debug('Nationality fetched', ['user_id' => $userId, 'nationality_id' => $nationality ? $nationality->getId() : 'null']);
            
            $this->logger->info('Finished getUserInfo successfully', ['user_id' => $userId]);
            return $data;

        } catch (\Throwable $e) {
            $this->logger->critical('Error in getUserInfo', [
                'user_id' => $userId,
                'exception_message' => $e->getMessage(),
                'exception_trace' => $e->getTraceAsString()
            ]);
            
            throw $e; 
        }
    }
} 