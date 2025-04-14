<?php

namespace App\Domains\Global\Notification\Service;

use App\Domains\Global\Document\Entity\Document;
use App\Domains\Global\Notification\Entity\Notification;
use App\Domains\Global\Notification\Repository\NotificationRepository;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class NotificationService
{
    private const API_BASE_URL = 'http://localhost:8000'; // URL de base de l'API

    public function __construct(
        private EntityManagerInterface $entityManager,
        private NotificationRepository $notificationRepository,
        private UrlGeneratorInterface $urlGenerator,
        private ?HubInterface $hub = null,
        private ?HttpClientInterface $httpClient = null
    ) {
    }

    /**
     * Envoie directement une notification via Mercure sans l'enregistrer en BDD
     */
    public function sendNotification(
        User $user,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        ?string $targetUrl = null
    ): bool {
        // Envoi de la notification en temps réel via Mercure 
        return $this->sendMercureNotification($user, $type, $title, $message, $data, $targetUrl);
    }

    /**
     * Notification de document approuvé
     */
    public function notifyDocumentApproved(Document $document): bool
    {
        $user = $document->getUser();
        $documentType = $document->getDocumentType();
        $title = 'Document approuvé';
        $message = sprintf(
            'Votre document "%s" (%s) a été approuvé.',
            $document->getName(),
            $documentType->getName()
        );

        // URL cible pour la page de détail du document
        $targetUrl = '/documents/' . $document->getId();

        // Données additionnelles pour le frontend
        $data = [
            'documentId' => $document->getId(),
            'documentName' => $document->getName(),
            'documentType' => $documentType->getCode(),
            'approvedAt' => $document->getValidatedAt()?->format('Y-m-d H:i:s'),
            'approvedBy' => $document->getValidatedBy()?->getId()
        ];

        // Envoi direct via Mercure
        $success = $this->sendMercureNotification(
            $user,
            Notification::TYPE_DOCUMENT_APPROVED,
            $title,
            $message,
            $data,
            $targetUrl
        );
        
        // Notification spécifique pour le changement de statut via l'API Mercure
        $this->sendDocumentStatusNotification($document, 'APPROVED', $user);
        
        return $success;
    }

    /**
     * Notification de document rejeté
     */
    public function notifyDocumentRejected(Document $document): bool
    {
        $user = $document->getUser();
        $documentType = $document->getDocumentType();
        $title = 'Document refusé';
        $message = sprintf(
            'Votre document "%s" (%s) a été refusé.',
            $document->getName(),
            $documentType->getName()
        );

        if ($document->getComment()) {
            $message .= ' Raison: ' . $document->getComment();
        }

        // URL cible pour la page de détail du document
        $targetUrl = '/documents/' . $document->getId();

        // Données additionnelles pour le frontend
        $data = [
            'documentId' => $document->getId(),
            'documentName' => $document->getName(),
            'documentType' => $documentType->getCode(),
            'rejectedAt' => $document->getUpdatedAt()?->format('Y-m-d H:i:s'),
            'rejectedBy' => $document->getValidatedBy()?->getId(),
            'comment' => $document->getComment()
        ];

        // Envoi direct via Mercure
        $success = $this->sendMercureNotification(
            $user,
            Notification::TYPE_DOCUMENT_REJECTED,
            $title,
            $message,
            $data,
            $targetUrl
        );
        
        // Notification spécifique pour le changement de statut via l'API Mercure
        $this->sendDocumentStatusNotification($document, 'REJECTED', $user);
        
        return $success;
    }

    /**
     * Notification pour un nouvel upload de document (pour admins/profs)
     */
    public function notifyDocumentUploaded(Document $document, User $recipient): bool
    {
        $uploader = $document->getUser();
        $documentType = $document->getDocumentType();
        $title = 'Nouveau document à valider';
        $message = sprintf(
            '%s %s a téléchargé un nouveau document "%s" (%s) qui nécessite une validation.',
            $uploader->getFirstName(),
            $uploader->getLastName(),
            $document->getName(),
            $documentType->getName()
        );

        // URL cible pour la page de validation du document
        $targetUrl = '/admin/documents/validation/' . $document->getId();

        // Données additionnelles pour le frontend
        $data = [
            'documentId' => $document->getId(),
            'documentName' => $document->getName(),
            'documentType' => $documentType->getCode(),
            'uploadedAt' => $document->getUploadedAt()?->format('Y-m-d H:i:s'),
            'uploaderId' => $uploader->getId(),
            'uploaderName' => $uploader->getFirstName() . ' ' . $uploader->getLastName()
        ];

        // Envoi direct via Mercure
        $success = $this->sendMercureNotification(
            $recipient,
            Notification::TYPE_DOCUMENT_UPLOADED,
            $title,
            $message,
            $data,
            $targetUrl
        );
        
        // Notification pour les admins via l'API Mercure
        $this->sendDocumentUploadAdminNotification($document, $uploader);
        
        return $success;
    }

    /**
     * Notification pour l'utilisateur quand il upload un document
     */
    public function notifyUserDocumentUploaded(Document $document): bool
    {
        $user = $document->getUser();
        $documentType = $document->getDocumentType();
        $title = 'Document téléchargé avec succès';
        $message = sprintf(
            'Votre document "%s" (%s) a été téléchargé avec succès.',
            $document->getName(),
            $documentType->getName()
        );

        // Si c'est un CV, ajouter des informations spécifiques
        if ($documentType->getCode() === 'CV') {
            $message .= ' Il est maintenant disponible pour consultation par les recruteurs.';
        }

        // URL cible pour la page de détail du document
        $targetUrl = '/documents/' . $document->getId();

        // Données additionnelles pour le frontend
        $data = [
            'documentId' => $document->getId(),
            'documentName' => $document->getName(),
            'documentType' => $documentType->getCode(),
            'uploadedAt' => $document->getUploadedAt()?->format('Y-m-d H:i:s')
        ];

        // Envoi direct via Mercure
        $success = $this->sendMercureNotification(
            $user,
            Notification::TYPE_DOCUMENT_UPLOADED,
            $title,
            $message,
            $data,
            $targetUrl
        );
        
        // Notification spécifique pour l'upload de CV via l'API Mercure
        if ($documentType->getCode() === 'CV') {
            $this->sendCvUploadNotification($document, $user);
        } else {
            // Notification générale pour les autres types de documents
            $this->sendDocumentUploadNotification($document, $user);
        }
        
        return $success;
    }

    /**
     * Envoyer une notification en temps réel via Mercure
     */
    private function sendMercureNotification(
        User $user, 
        string $type, 
        string $title, 
        string $message,
        ?array $data = null,
        ?string $targetUrl = null
    ): bool {
        // Si le hub Mercure n'est pas disponible, on ne peut pas envoyer de notification
        if (!$this->hub) {
            return false;
        }
        
        // Créer le topic spécifique à l'utilisateur
        $topic = 'https://example.com/users/' . $user->getId();
        
        // Préparer les données à envoyer
        $notificationData = [
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'targetUrl' => $targetUrl,
            'timestamp' => time()
        ];
        
        try {
            // Créer la mise à jour
            $update = new Update(
                $topic,
                json_encode($notificationData),
                true // Privé - seulement pour l'utilisateur concerné
            );
            
            // Publier la mise à jour
            $this->hub->publish($update);
            
            return true;
        } catch (\Exception $e) {
            // En cas d'erreur, on log et on renvoie false
            error_log('Erreur lors de l\'envoi de notification Mercure: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Envoyer une notification spécifique pour l'upload d'un CV via Mercure
     */
    private function sendCvUploadNotification(Document $document, User $user): void
    {
        if (!$this->httpClient) {
            return;
        }
        
        try {
            // Préparer les données pour l'API
            $data = [
                'documentId' => $document->getId(),
                'userId' => $user->getId(),
                'documentName' => $document->getName(),
                'userName' => $user->getFirstName() . ' ' . $user->getLastName(),
                'status' => $document->getStatus()->value
            ];
            
            // Appeler l'API dédiée
            $this->httpClient->request('POST', self::API_BASE_URL . '/notify-cv-upload', [
                'json' => $data,
                'headers' => [
                    'Content-Type' => 'application/json',
                ]
            ]);
        } catch (\Exception $e) {
            // Logger l'erreur mais ne pas interrompre le flux
            error_log('Erreur lors de l\'envoi de notification CV: ' . $e->getMessage());
        }
    }
    
    /**
     * Envoyer une notification pour le changement de statut d'un document
     */
    private function sendDocumentStatusNotification(Document $document, string $status, User $user): void
    {
        if (!$this->httpClient) {
            return;
        }
        
        try {
            // Préparer les données pour l'API
            $data = [
                'documentId' => $document->getId(),
                'userId' => $user->getId(),
                'documentName' => $document->getName(),
                'status' => $status,
                'oldStatus' => 'PENDING', // On suppose que c'était PENDING avant
                'comment' => $document->getComment()
            ];
            
            // Appeler l'API dédiée
            $this->httpClient->request('POST', self::API_BASE_URL . '/notify-document-status-change', [
                'json' => $data,
                'headers' => [
                    'Content-Type' => 'application/json',
                ]
            ]);
        } catch (\Exception $e) {
            // Logger l'erreur mais ne pas interrompre le flux
            error_log('Erreur lors de l\'envoi de notification de statut: ' . $e->getMessage());
        }
    }
    
    /**
     * Envoyer une notification aux administrateurs pour un nouveau document
     */
    private function sendDocumentUploadAdminNotification(Document $document, User $uploader): void
    {
        if (!$this->httpClient) {
            return;
        }
        
        try {
            // Préparer les données pour l'API
            $data = [
                'documentId' => $document->getId(),
                'documentName' => $document->getName(),
                'documentType' => $document->getDocumentType()->getCode(),
                'addedBy' => $uploader->getFirstName() . ' ' . $uploader->getLastName(),
                'status' => $document->getStatus()->value
            ];
            
            // Appeler l'API dédiée
            $this->httpClient->request('POST', self::API_BASE_URL . '/notify-document', [
                'json' => $data,
                'headers' => [
                    'Content-Type' => 'application/json',
                ]
            ]);
        } catch (\Exception $e) {
            // Logger l'erreur mais ne pas interrompre le flux
            error_log('Erreur lors de l\'envoi de notification admin: ' . $e->getMessage());
        }
    }
    
    /**
     * Envoyer une notification générale pour l'upload d'un document
     */
    private function sendDocumentUploadNotification(Document $document, User $user): void
    {
        if (!$this->httpClient) {
            return;
        }
        
        try {
            // Préparer les données pour l'API
            $data = [
                'documentId' => $document->getId(),
                'documentName' => $document->getName(),
                'documentType' => $document->getDocumentType()->getCode(),
                'addedBy' => $user->getFirstName() . ' ' . $user->getLastName(),
                'status' => $document->getStatus()->value
            ];
            
            // Appeler l'API dédiée
            $this->httpClient->request('POST', self::API_BASE_URL . '/notify-document', [
                'json' => $data,
                'headers' => [
                    'Content-Type' => 'application/json',
                ]
            ]);
        } catch (\Exception $e) {
            // Logger l'erreur mais ne pas interrompre le flux
            error_log('Erreur lors de l\'envoi de notification document: ' . $e->getMessage());
        }
    }
} 