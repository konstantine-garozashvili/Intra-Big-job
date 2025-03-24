<?php

namespace App\EventListener;

use App\Entity\User;
use App\Repository\UserStatusHistoryRepository;
use App\Repository\UserStatusRepository;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class JWTAuthenticationListener
{
    private UserStatusHistoryRepository $userStatusHistoryRepository;
    private UserStatusRepository $userStatusRepository;

    public function __construct(
        UserStatusHistoryRepository $userStatusHistoryRepository,
        UserStatusRepository $userStatusRepository
    ) {
        $this->userStatusHistoryRepository = $userStatusHistoryRepository;
        $this->userStatusRepository = $userStatusRepository;
    }

    /**
     * @param AuthenticationSuccessEvent $event
     * @return void
     */
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();

        // Vérifier si l'utilisateur est une instance de notre entité User
        if (!$user instanceof User) {
            return;
        }

        // Temporairement désactivé : Vérification de l'email
        /*if (!$user->isEmailVerified()) {
            // Empêcher l'authentification en jetant une exception
            throw new AuthenticationException('Veuillez vérifier votre adresse email avant de vous connecter.');
        }*/
        
        // Vérifier si le compte est archivé
        $currentStatusHistory = $this->userStatusHistoryRepository->findCurrentByUser($user->getId());
        
        if ($currentStatusHistory && $currentStatusHistory->getStatus()->getName() === 'Archivé') {
            throw new AuthenticationException('Votre compte a été désactivé. Veuillez contacter l\'administration pour le réactiver.');
        }
    }
} 