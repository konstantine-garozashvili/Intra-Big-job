<?php

namespace App\Service;

use App\Repository\MessageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class MessageCleanupService
{
    private MessageRepository $messageRepository;
    private EntityManagerInterface $entityManager;
    private LoggerInterface $logger;

    public function __construct(
        MessageRepository $messageRepository,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger
    ) {
        $this->messageRepository = $messageRepository;
        $this->entityManager = $entityManager;
        $this->logger = $logger;
    }

    /**
     * Delete messages older than the specified number of days
     *
     * @param int $days Number of days to keep messages
     * @param bool $dryRun If true, don't actually delete messages
     * @return array Result with count and status
     */
    public function cleanupOldMessages(int $days = 15, bool $dryRun = false): array
    {
        $date = new \DateTimeImmutable("-{$days} days");
        
        $this->logger->info(sprintf('Looking for messages older than %s (%d days)', $date->format('Y-m-d H:i:s'), $days));
        
        $messages = $this->messageRepository->findMessagesOlderThan($date);
        $count = count($messages);
        
        if ($count === 0) {
            $this->logger->info('No old messages to delete.');
            return [
                'success' => true,
                'count' => 0,
                'message' => 'No old messages to delete.'
            ];
        }
        
        $this->logger->info(sprintf('Found %d messages to delete.', $count));
        
        if ($dryRun) {
            $this->logger->info('Dry run mode: No messages were actually deleted.');
            return [
                'success' => true,
                'count' => $count,
                'message' => 'Dry run mode: No messages were actually deleted.'
            ];
        }
        
        try {
            foreach ($messages as $message) {
                $this->entityManager->remove($message);
            }
            
            $this->entityManager->flush();
            $this->logger->info(sprintf('Successfully deleted %d old messages.', $count));
            
            return [
                'success' => true,
                'count' => $count,
                'message' => sprintf('Successfully deleted %d old messages.', $count)
            ];
        } catch (\Exception $e) {
            $this->logger->error('An error occurred while deleting messages: ' . $e->getMessage());
            return [
                'success' => false,
                'count' => 0,
                'message' => 'An error occurred while deleting messages: ' . $e->getMessage()
            ];
        }
    }
}
