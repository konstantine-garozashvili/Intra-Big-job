<?php

namespace App\Command;

use App\Service\MessageCleanupService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:cleanup-old-messages',
    description: 'Deletes messages older than a specified number of days (default: 15)',
)]
class CleanupOldMessagesCommand extends Command
{
    private MessageCleanupService $messageCleanupService;

    public function __construct(MessageCleanupService $messageCleanupService)
    {
        parent::__construct();
        $this->messageCleanupService = $messageCleanupService;
    }

    protected function configure(): void
    {
        $this
            ->addOption('days', 'd', InputOption::VALUE_OPTIONAL, 'Number of days to keep messages', 15)
            ->addOption('dry-run', null, InputOption::VALUE_NONE, 'Run without actually deleting messages');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $days = (int) $input->getOption('days');
        $dryRun = $input->getOption('dry-run');
        
        $io->note(sprintf('Cleaning up messages older than %d days', $days));
        
        $result = $this->messageCleanupService->cleanupOldMessages($days, $dryRun);
        
        if ($result['success']) {
            if ($result['count'] > 0) {
                $io->success($result['message']);
            } else {
                $io->info($result['message']);
            }
            return Command::SUCCESS;
        } else {
            $io->error($result['message']);
            return Command::FAILURE;
        }
    }
}
