<?php

namespace App\Service;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Service to initialize PHP configuration settings
 * Currently handles mbstring encoding configuration
 */
class PhpConfigInitializer implements EventSubscriberInterface
{
    private string $encoding;

    public function __construct(string $encoding = 'UTF-8')
    {
        $this->encoding = $encoding;
    }

    /**
     * {@inheritdoc}
     */
    public static function getSubscribedEvents(): array
    {
        return [
            // We use a high priority to ensure encoding is set early
            KernelEvents::REQUEST => ['onKernelRequest', 255],
        ];
    }

    /**
     * Sets the PHP mbstring internal encoding
     */
    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        // Set the internal character encoding
        if (function_exists('mb_internal_encoding')) {
            mb_internal_encoding($this->encoding);
        }

        // Set the HTTP output encoding
        if (function_exists('mb_http_output')) {
            mb_http_output($this->encoding);
        }

        // Set default regex encoding
        if (function_exists('mb_regex_encoding')) {
            mb_regex_encoding($this->encoding);
        }
    }
} 