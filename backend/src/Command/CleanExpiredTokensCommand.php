<?php

namespace App\Command;

use App\Service\RefreshTokenService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:clean-expired-tokens',
    description: 'Nettoyer les tokens de rafraîchissement expirés',
)]
class CleanExpiredTokensCommand extends Command
{
    private RefreshTokenService $refreshTokenService;

    public function __construct(RefreshTokenService $refreshTokenService)
    {
        parent::__construct();
        $this->refreshTokenService = $refreshTokenService;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $count = $this->refreshTokenService->cleanExpiredTokens();

        $io->success(sprintf('%d tokens expirés ont été supprimés.', $count));

        return Command::SUCCESS;
    }
} 