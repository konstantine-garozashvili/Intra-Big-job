<?php

namespace App\EventListener;

use App\Service\MessageCleanupService;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpKernel\Event\TerminateEvent;

class MessageCleanupListener
{
    private MessageCleanupService $messageCleanupService;
    private LoggerInterface $logger;
    private string $cacheDir;
    private int $cleanupInterval;
    private int $daysToKeep;

    public function __construct(
        MessageCleanupService $messageCleanupService,
        LoggerInterface $logger,
        string $cacheDir,
        int $cleanupInterval = 86400, // Default: 24 hours in seconds
        int $daysToKeep = 15
    ) {
        $this->messageCleanupService = $messageCleanupService;
        $this->logger = $logger;
        $this->cacheDir = $cacheDir;
        $this->cleanupInterval = $cleanupInterval;
        $this->daysToKeep = $daysToKeep;
    }

    public function onKernelTerminate(TerminateEvent $event): void
    {
        // Only run on a small percentage of requests to avoid performance impact
        if (random_int(1, 100) > 5) { // 5% chance to run
            return;
        }

        $lockFile = $this->cacheDir . '/message_cleanup.lock';
        $lastRunFile = $this->cacheDir . '/message_cleanup_last_run.txt';

        // Check if cleanup is already running
        if (file_exists($lockFile)) {
            $this->logger->debug('Message cleanup is already running or lock file exists');
            return;
        }

        // Check when the cleanup was last run
        $lastRun = file_exists($lastRunFile) ? (int)file_get_contents($lastRunFile) : 0;
        $now = time();

        // Only run if enough time has passed since last run
        if ($now - $lastRun < $this->cleanupInterval) {
            return;
        }

        try {
            // Create lock file
            file_put_contents($lockFile, $now);

            $this->logger->info('Starting automated message cleanup');
            $result = $this->messageCleanupService->cleanupOldMessages($this->daysToKeep, false);
            
            if ($result['success']) {
                $this->logger->info('Automated message cleanup completed: ' . $result['message']);
                // Update last run time
                file_put_contents($lastRunFile, $now);
            } else {
                $this->logger->error('Automated message cleanup failed: ' . $result['message']);
            }
        } catch (\Exception $e) {
            $this->logger->error('Error during automated message cleanup: ' . $e->getMessage());
        } finally {
            // Always remove lock file
            if (file_exists($lockFile)) {
                unlink($lockFile);
            }
        }
    }
}
