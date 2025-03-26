<?php

namespace App\EventListener;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class JWTAuthenticationListener
{
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
    }
} 