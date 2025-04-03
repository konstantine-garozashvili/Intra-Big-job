<?php

namespace App\EventSubscriber;

use App\Entity\User;
use App\Event\UserProfileUpdatedEvent;
use App\Service\User\UserProfileAggregator;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\Security\Core\Event\AuthenticationSuccessEvent;

class UserDataSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly UserProfileAggregator $userProfileAggregator
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            AuthenticationSuccessEvent::class => 'onAuthenticationSuccess',
            UserProfileUpdatedEvent::class => 'onUserProfileUpdated',
        ];
    }

    /**
     * Déclenché lors d'une authentification réussie
     */
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getAuthenticationToken()->getUser();
        
        if (!$user instanceof User) {
            return;
        }
        
        // Ici, vous pouvez initialiser des données importantes ou effectuer des actions
        // nécessaires lors de l'authentification de l'utilisateur
    }

    /**
     * Déclenché lorsque le profil utilisateur est mis à jour
     */
    public function onUserProfileUpdated(UserProfileUpdatedEvent $event): void
    {
        $user = $event->getUser();
        
        // Logique pour mettre à jour ou invalider le cache, synchroniser des données, etc.
    }
} 