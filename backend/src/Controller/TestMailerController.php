<?php

namespace App\Controller;

use App\Service\EmailService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Psr\Log\LoggerInterface;

class TestMailerController extends AbstractController
{
    private EmailService $emailService;
    private MailerInterface $mailer;
    private LoggerInterface $logger;

    public function __construct(EmailService $emailService, MailerInterface $mailer, LoggerInterface $logger)
    {
        $this->emailService = $emailService;
        $this->mailer = $mailer;
        $this->logger = $logger;
    }

    #[Route('/api/test/mail', name: 'app_test_mail', methods: ['GET'])]
    public function testMail(): JsonResponse
    {
        try {
            // Log debug info
            $this->logger->info('Début testMail: connexion à Mailtrap avec DSN: ' . ($_ENV['MAILER_DSN'] ?? 'Non disponible'));
            
            // Remplacez cette adresse par votre adresse email pour tester
            $to = 'lucas.iribaren@laplateforme.io';
            
            $subject = 'Test d\'envoi d\'email depuis l\'application';
            
            // Utilisation du service d'email avec template Twig
            $this->emailService->sendTemplate(
                $to,
                $subject,
                'emails/test_email',
                [
                    'appName' => 'Intra-Bigjob Application',
                    'testDate' => new \DateTime()
                ],
                'noreply@intrabigjob.com',
                'Intra-Bigjob Application'
            );
            
            $this->logger->info('Email envoyé avec succès à ' . $to);
            
            return new JsonResponse([
                'success' => true,
                'message' => 'Email envoyé avec succès à ' . $to,
                'mailer_dsn' => $_ENV['MAILER_DSN'] ?? 'Non disponible'
            ]);
        } catch (\Exception $e) {
            // Log complet de l'erreur
            $this->logger->error('Erreur lors de l\'envoi de l\'email: ' . $e->getMessage());
            $this->logger->error('Trace: ' . $e->getTraceAsString());
            
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'mailer_dsn' => $_ENV['MAILER_DSN'] ?? 'Non disponible'
            ], 500);
        }
    }

    #[Route('/api/test/mail/direct', name: 'app_test_mail_direct', methods: ['GET'])]
    public function testMailDirect(): JsonResponse
    {
        try {
            // Log debug info
            $this->logger->info('Début testMailDirect: connexion à Mailtrap avec DSN: ' . ($_ENV['MAILER_DSN'] ?? 'Non disponible'));
            
            // Remplacez cette adresse par votre adresse email pour tester
            $to = 'lucas.iribaren@laplateforme.io';
            
            $subject = 'Test d\'envoi d\'email direct depuis l\'application';
            
            // Utiliser directement l'interface MailerInterface pour avoir plus de contrôle
            $email = new Email();
            $email
                ->from('noreply@intrabigjob.com')
                ->to($to)
                ->subject($subject)
                ->html('<html><body>
                    <h1>Test d\'envoi d\'email direct</h1>
                    <p>Ceci est un test pour vérifier que la configuration du mailer fonctionne correctement.</p>
                    <p>Si vous recevez cet email, la configuration est correcte!</p>
                    <p>Date et heure: ' . (new \DateTime())->format('Y-m-d H:i:s') . '</p>
                </body></html>')
                ->text("Test d'envoi d'email direct\n\nCeci est un test pour vérifier que la configuration du mailer fonctionne correctement.\nSi vous recevez cet email, la configuration est correcte!");
            
            // Envoyer l'email directement
            $this->logger->info('Envoi de l\'email direct...');
            $this->mailer->send($email);
            $this->logger->info('Email direct envoyé avec succès à ' . $to);
            
            return new JsonResponse([
                'success' => true,
                'message' => 'Email direct envoyé avec succès à ' . $to,
                'mailer_dsn' => $_ENV['MAILER_DSN'] ?? 'Non disponible'
            ]);
        } catch (\Exception $e) {
            // Log complet de l'erreur
            $this->logger->error('Erreur lors de l\'envoi de l\'email direct: ' . $e->getMessage());
            $this->logger->error('Trace: ' . $e->getTraceAsString());
            
            return new JsonResponse([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'email direct: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'mailer_dsn' => $_ENV['MAILER_DSN'] ?? 'Non disponible'
            ], 500);
        }
    }
}