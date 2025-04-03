<?php

namespace App\Domains\Global\Notification\Service;

use App\Domains\Global\Document\Entity\Document;
use App\Domains\Global\Notification\Entity\Notification;
use App\Domains\Global\Notification\Repository\NotificationRepository;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private NotificationRepository $notificationRepository,
        private UrlGeneratorInterface $urlGenerator
    ) {
    }

    /**
     * Create a new notification
     */
    public function createNotification(
        User $user,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        ?string $targetUrl = null
    ): Notification {
        $notification = new Notification();
        $notification->setUser($user);
        $notification->setType($type);
        $notification->setTitle($title);
        $notification->setMessage($message);
        $notification->setData($data);
        $notification->setTargetUrl($targetUrl);

        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        return $notification;
    }

    /**
     * Create a notification for document approval
     */
    public function notifyDocumentApproved(Document $document): Notification
    {
        $user = $document->getUser();
        $documentType = $document->getDocumentType();
        $title = 'Document approuvé';
        $message = sprintf(
            'Votre document "%s" (%s) a été approuvé.',
            $document->getName(),
            $documentType->getName()
        );

        // Generate target URL for the document detail page
        $targetUrl = '/documents/' . $document->getId();

        // Additional data for frontend
        $data = [
            'documentId' => $document->getId(),
            'documentName' => $document->getName(),
            'documentType' => $documentType->getCode(),
            'approvedAt' => $document->getValidatedAt()?->format('Y-m-d H:i:s'),
            'approvedBy' => $document->getValidatedBy()?->getId()
        ];

        return $this->createNotification(
            $user,
            Notification::TYPE_DOCUMENT_APPROVED,
            $title,
            $message,
            $data,
            $targetUrl
        );
    }

    /**
     * Create a notification for document rejection
     */
    public function notifyDocumentRejected(Document $document): Notification
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

        // Generate target URL for the document detail page
        $targetUrl = '/documents/' . $document->getId();

        // Additional data for frontend
        $data = [
            'documentId' => $document->getId(),
            'documentName' => $document->getName(),
            'documentType' => $documentType->getCode(),
            'rejectedAt' => $document->getUpdatedAt()?->format('Y-m-d H:i:s'),
            'rejectedBy' => $document->getValidatedBy()?->getId(),
            'comment' => $document->getComment()
        ];

        return $this->createNotification(
            $user,
            Notification::TYPE_DOCUMENT_REJECTED,
            $title,
            $message,
            $data,
            $targetUrl
        );
    }

    /**
     * Create a notification for new document upload (for admins/teachers)
     */
    public function notifyDocumentUploaded(Document $document, User $recipient): Notification
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

        // Generate target URL for the document validation page
        $targetUrl = '/admin/documents/validation/' . $document->getId();

        // Additional data for frontend
        $data = [
            'documentId' => $document->getId(),
            'documentName' => $document->getName(),
            'documentType' => $documentType->getCode(),
            'uploadedAt' => $document->getUploadedAt()?->format('Y-m-d H:i:s'),
            'uploaderId' => $uploader->getId(),
            'uploaderName' => $uploader->getFirstName() . ' ' . $uploader->getLastName()
        ];

        return $this->createNotification(
            $recipient,
            Notification::TYPE_DOCUMENT_UPLOADED,
            $title,
            $message,
            $data,
            $targetUrl
        );
    }

    /**
     * Create a notification for the user when they upload a document
     */
    public function notifyUserDocumentUploaded(Document $document): Notification
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

        // Generate target URL for the document detail page
        $targetUrl = '/documents/' . $document->getId();

        // Additional data for frontend
        $data = [
            'documentId' => $document->getId(),
            'documentName' => $document->getName(),
            'documentType' => $documentType->getCode(),
            'uploadedAt' => $document->getUploadedAt()?->format('Y-m-d H:i:s')
        ];

        return $this->createNotification(
            $user,
            Notification::TYPE_DOCUMENT_UPLOADED,
            $title,
            $message,
            $data,
            $targetUrl
        );
    }

    /**
     * Get user notifications with pagination
     */
    public function getUserNotifications(User $user, int $page = 1, int $limit = 10, bool $includeRead = true): array
    {
        $offset = ($page - 1) * $limit;

        $qb = $this->entityManager->createQueryBuilder()
            ->select('n')
            ->from(Notification::class, 'n')
            ->where('n.user = :userId')
            ->setParameter('userId', $user->getId())
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset);

        if (!$includeRead) {
            $qb->andWhere('n.isRead = :isRead')
               ->setParameter('isRead', false);
        }

        $notifications = $qb->getQuery()->getResult();

        // Get total count for pagination
        $countQb = $this->entityManager->createQueryBuilder()
            ->select('COUNT(n.id)')
            ->from(Notification::class, 'n')
            ->where('n.user = :userId')
            ->setParameter('userId', $user->getId());

        if (!$includeRead) {
            $countQb->andWhere('n.isRead = :isRead')
                   ->setParameter('isRead', false);
        }

        $total = $countQb->getQuery()->getSingleScalarResult();

        return [
            'notifications' => $notifications,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ];
    }

    /**
     * Mark notifications as read
     */
    public function markAsRead(User $user, ?array $notificationIds = null): int
    {
        return $this->notificationRepository->markAsRead($user->getId(), $notificationIds);
    }

    /**
     * Get unread count for user
     */
    public function getUnreadCount(User $user): int
    {
        return $this->notificationRepository->countUnreadByUser($user->getId());
    }
}