<?php

namespace App\Command;

use App\Service\EmailService;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:test-mailer',
    description: 'Envoie un email de test pour vérifier la configuration du mailer',
)]
class TestMailerCommand extends Command
{
    private EmailService $emailService;

    public function __construct(EmailService $emailService)
    {
        parent::__construct();
        $this->emailService = $emailService;
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Adresse email du destinataire')
            ->addArgument('method', InputArgument::OPTIONAL, 'Méthode d\'envoi (template ou direct)', 'template')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');
        $method = $input->getArgument('method');

        $io->note(sprintf('Envoi d\'un email de test à %s en utilisant la méthode %s', $email, $method));

        try {
            if ($method === 'template') {
                $this->emailService->sendTemplate(
                    $email,
                    'Test d\'envoi d\'email depuis la commande',
                    'emails/test_email',
                    [
                        'appName' => 'Votre Application',
                        'testDate' => new \DateTime()
                    ],
                    'noreply@votreapplication.com',
                    'Votre Application'
                );
            } else {
                $htmlContent = '<html><body><h1>Test d\'envoi d\'email direct</h1><p>Ceci est un test pour vérifier que la configuration du mailer fonctionne correctement.</p><p>Si vous recevez cet email, la configuration est correcte !</p></body></html>';
                $textContent = "Test d'envoi d'email direct\n\nCeci est un test pour vérifier que la configuration du mailer fonctionne correctement.\nSi vous recevez cet email, la configuration est correcte !";
                
                $this->emailService->send(
                    $email,
                    'Test d\'envoi d\'email direct depuis la commande',
                    $htmlContent,
                    $textContent,
                    'noreply@votreapplication.com',
                    'Votre Application'
                );
            }

            $io->success('Email envoyé avec succès !');
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error('Erreur lors de l\'envoi de l\'email : ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
} 