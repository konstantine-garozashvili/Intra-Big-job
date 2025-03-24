<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\Address;
use Twig\Environment;

class EmailService
{
    private MailerInterface $mailer;
    private Environment $twig;

    public function __construct(MailerInterface $mailer, Environment $twig)
    {
        $this->mailer = $mailer;
        $this->twig = $twig;
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
} 