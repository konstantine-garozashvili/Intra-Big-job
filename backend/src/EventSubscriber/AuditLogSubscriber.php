<?php

namespace App\EventSubscriber;

use App\Entity\AuditLog;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Http\Event\LoginSuccessEvent;
use Symfony\Component\Security\Http\Event\LoginFailureEvent;
use Symfony\Component\Security\Core\User\UserInterface;

class AuditLogSubscriber implements EventSubscriberInterface
{
    private EntityManagerInterface $entityManager;
    private RequestStack $requestStack;

    public function __construct(EntityManagerInterface $entityManager, RequestStack $requestStack)
    {
        $this->entityManager = $entityManager;
        $this->requestStack = $requestStack;
    }

    public static function getSubscribedEvents(): array
    {
        return [
            LoginSuccessEvent::class => 'onLoginSuccess',
            LoginFailureEvent::class => 'onLoginFailure',
        ];
    }

    public function onLoginSuccess(LoginSuccessEvent $event): void
    {
        $user = $event->getUser();
        $request = $this->requestStack->getCurrentRequest();

        // Ensure user is an instance of our User entity if needed, or implement UserInterface
        if ($user instanceof UserInterface && $request) {
            $auditLog = new AuditLog();
            if ($user instanceof User) { // Check if it's our specific User entity to set the relation
                 $auditLog->setUser($user);
            }
            $auditLog->setActionType('LOGIN_SUCCESS');
            
            $details = json_encode([
                'user_identifier' => $user->getUserIdentifier(),
                'ip_address' => $request->getClientIp(),
                'user_agent' => $request->headers->get('User-Agent')
            ]);
            $auditLog->setDetails($details ?: '{}'); // Ensure details is always a valid JSON string

            $this->entityManager->persist($auditLog);
            $this->entityManager->flush();
        }
    }

    public function onLoginFailure(LoginFailureEvent $event): void
    {
        $request = $event->getRequest(); // Get request directly from failure event
        $passport = $event->getPassport();
        $userIdentifier = $passport?->getUser()->getUserIdentifier() ?? 'unknown'; // Get identifier if available

        if ($request) {
            $auditLog = new AuditLog();
            // User is typically null or not fully authenticated on failure
            $auditLog->setActionType('LOGIN_FAILURE');
            
            $details = json_encode([
                'user_identifier_attempted' => $userIdentifier, // Log the identifier that was attempted
                'ip_address' => $request->getClientIp(),
                'user_agent' => $request->headers->get('User-Agent'),
                'error_message' => $event->getException()->getMessageKey() // Log the reason for failure
            ]);
            $auditLog->setDetails($details ?: '{}');

            $this->entityManager->persist($auditLog);
            $this->entityManager->flush();
        }
    }
} 