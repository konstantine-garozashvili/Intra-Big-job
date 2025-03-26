<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;
use Twig\Environment;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class EmailService
{
    private MailerInterface $mailer;
    private Environment $twig;
    private $params;

    public function __construct(
        MailerInterface $mailer,
        Environment $twig,
        ParameterBagInterface $params
    ) {
        $this->mailer = $mailer;
        $this->twig = $twig;
        $this->params = $params;
    }

    /**
     * Envoie un email simple
     *
     * @param string $to Adresse email du destinataire
     * @param string $subject Sujet de l'email
     * @param string $htmlContent Contenu HTML de l'email
     * @param string|null $textContent Contenu texte de l'email (optionnel)
     * @param string|null $fromEmail Adresse email de l'expéditeur (optionnel)
     * @param string|null $fromName Nom de l'expéditeur (optionnel)
     * @return void
     */
    public function send(
        string $to,
        string $subject,
        string $htmlContent,
        ?string $textContent = null,
        ?string $fromEmail = null,
        ?string $fromName = null
    ): void {
        $email = new Email();

        // Définir l'expéditeur (from)
        if ($fromEmail && $fromName) {
            $email->from(new Address($fromEmail, $fromName));
        } elseif ($fromEmail) {
            $email->from($fromEmail);
        }

        // Configurer l'email
        $email
            ->to($to)
            ->subject($subject)
            ->html($htmlContent);

        // Ajouter le contenu texte si fourni
        if ($textContent) {
            $email->text($textContent);
        }

        // Envoyer l'email
        $this->mailer->send($email);
    }

    /**
     * Envoie un email en utilisant un template Twig
     *
     * @param string $to Adresse email du destinataire
     * @param string $subject Sujet de l'email
     * @param string $template Chemin vers le template Twig (sans l'extension)
     * @param array $context Variables à passer au template
     * @param string|null $fromEmail Adresse email de l'expéditeur (optionnel)
     * @param string|null $fromName Nom de l'expéditeur (optionnel)
     * @return void
     */
    public function sendTemplate(
        string $to,
        string $subject,
        string $template,
        array $context = [],
        ?string $fromEmail = null,
        ?string $fromName = null
    ): void {
        // Rendre les templates HTML et texte
        $htmlContent = $this->twig->render($template . '.html.twig', $context);
        
        // Essayer de rendre la version texte si elle existe
        try {
            $textContent = $this->twig->render($template . '.txt.twig', $context);
        } catch (\Exception $e) {
            $textContent = null;
        }

        // Envoyer l'email
        $this->send($to, $subject, $htmlContent, $textContent, $fromEmail, $fromName);
    }

    public function sendAdminCreatedUserEmail(string $email, string $password, string $firstName): void
    {
        try {
            $emailMessage = (new Email())
                ->from($this->params->get('app.email.from'))
                ->to($email)
                ->subject('Vos informations de connexion')
                ->html($this->getAdminCreatedUserEmailTemplate($firstName, $email, $password));

            $this->mailer->send($emailMessage);
        } catch (\Exception $e) {
            // Log l'erreur mais ne bloque pas la création de l'utilisateur
            error_log('Erreur d\'envoi d\'email: ' . $e->getMessage());
        }
    }

    private function getAdminCreatedUserEmailTemplate(string $firstName, string $email, string $password): string
    {
        return "
            <h2>Bonjour {$firstName},</h2>
            <p>Votre compte a été créé par un administrateur. Voici vos informations de connexion :</p>
            <ul>
                <li>Email : {$email}</li>
                <li>Mot de passe temporaire : {$password}</li>
            </ul>
            <p><strong>Important :</strong> Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.</p>
            <p>Cordialement,<br>L'équipe BigJob</p>
        ";
    }
} 