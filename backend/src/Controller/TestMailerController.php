<?php

namespace App\Controller;

use App\Service\EmailService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class TestMailerController extends AbstractController
{
    private EmailService $emailService;

    public function __construct(EmailService $emailService)
    {
        $this->emailService = $emailService;
    }

    #[Route('/api/test/mail', name: 'app_test_mail', methods: ['GET'])]
    public function testMail(): JsonResponse
    {
        try {
            // Remplacez cette adresse par votre adresse email pour tester
            $to = 'test@example.com';
            
            $subject = 'Test d\'envoi d\'email depuis l\'application';
            
            // Utilisation du service d'email avec template Twig
            $this->emailService->sendTemplate(
                $to,
                $subject,
                'emails/test_email',
                [
                    'appName' => 'Votre Application',
                    'testDate' => new \DateTime()
                ],
                'noreply@votreapplication.com',
                'Votre Application'
            );
            
            return $this->json([
                'success' => true,
                'message' => 'Email envoyé avec succès à ' . $to
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/api/test/mail/direct', name: 'app_test_mail_direct', methods: ['GET'])]
    public function testMailDirect(): JsonResponse
    {
        try {
            // Remplacez cette adresse par votre adresse email pour tester
            $to = 'test@example.com';
            
            $subject = 'Test d\'envoi d\'email direct depuis l\'application';
            
            $htmlContent = '
                <html>
                <body>
                    <h1>Test d\'envoi d\'email direct</h1>
                    <p>Ceci est un test pour vérifier que la configuration du mailer fonctionne correctement.</p>
                    <p>Si vous recevez cet email, la configuration est correcte !</p>
                </body>
                </html>
            ';
            
            $textContent = "Test d'envoi d'email direct\n\nCeci est un test pour vérifier que la configuration du mailer fonctionne correctement.\nSi vous recevez cet email, la configuration est correcte !";
            
            // Utilisation du service d'email sans template
            $this->emailService->send(
                $to,
                $subject,
                $htmlContent,
                $textContent,
                'noreply@votreapplication.com',
                'Votre Application'
            );
            
            return $this->json([
                'success' => true,
                'message' => 'Email direct envoyé avec succès à ' . $to
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de l\'email direct: ' . $e->getMessage()
            ], 500);
        }
    }
} 