<?php

namespace App\Domains\Global\Document\Controller;

use App\Domains\Global\Document\Entity\Document;
use App\Domains\Global\Document\Entity\DocumentType;
use App\Domains\Global\Document\Entity\DocumentHistory;
use App\Domains\Global\Document\Repository\DocumentRepository;
use App\Domains\Global\Document\Repository\DocumentTypeRepository;
use App\Entity\User;
use App\Enum\DocumentStatus;
use App\Enum\DocumentAction;
use App\Repository\UserRepository;
use App\Service\DocumentStorageFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpClient\NativeHttpClient;
use Psr\Log\LoggerInterface;

#[Route('/documents')]
class DocumentController extends AbstractController
{
    private const CV_DOCUMENT_TYPE_CODE = 'CV'; // Assuming 'CV' is the code for CV document type
    private ?LoggerInterface $logger = null;
    
    public function __construct(
        private EntityManagerInterface $entityManager,
        private DocumentRepository $documentRepository,
        private DocumentTypeRepository $documentTypeRepository,
        private UserRepository $userRepository,
        private SluggerInterface $slugger,
        private string $documentDirectory,
        private DocumentStorageFactory $storageFactory,
        LoggerInterface $logger = null
    ) {
        // The $documentDirectory will need to be configured in services.yaml
        $this->logger = $logger;
    }

    /**
     * Get all documents for the current user
     */
    #[Route('', name: 'app_documents_list', methods: ['GET'])]
    public function getDocuments(): JsonResponse
    {
        try {
            $user = $this->getUser();
            $documents = $this->documentRepository->findBy(['user' => $user]);
            
            error_log('DEBUG: Found ' . count($documents) . ' documents for user');
            error_log('DEBUG: Documents data: ' . json_encode($documents));
            
            return $this->json([
                'success' => true,
                'data' => $documents
            ], Response::HTTP_OK, [], ['groups' => ['document:read']]);
            
        } catch (\Exception $e) {
            error_log('DEBUG: Error in getDocuments: ' . $e->getMessage());
            return $this->json([
                'success' => false,
                'message' => 'Failed to fetch documents: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Upload CV for authenticated student or guest user
     */
    #[Route('/upload/cv', name: 'app_document_upload_cv', methods: ['POST'])]
    public function uploadCv(Request $request): JsonResponse
    {
        $user = $this->getUser();
        
        // Check if user is either a student or a guest
        $isStudent = $this->hasStudentRole($user);
        $isGuest = $this->hasGuestRole($user);
        
        if (!$isStudent && !$isGuest) {
            throw new AccessDeniedHttpException('Only students and guests can upload CV documents');
        }
        
        // Reuse common upload logic
        return $this->handleCvUpload($request, $user);
    }

    /**
     * Upload CV for a student user by SuperAdmin
     */
    #[Route('/upload/cv/{studentId}', name: 'app_document_upload_cv_for_student', methods: ['POST'])]
    #[IsGranted('ROLE_SUPER_ADMIN')]
    public function uploadCvForStudent(Request $request, int $studentId): JsonResponse
    {
        // Find the student user with all relations loaded
        $student = $this->userRepository->findOneWithAllRelations($studentId);
        
        if (!$student) {
            throw new NotFoundHttpException('Student not found');
        }
        
        // Check if the user is a student
        if (!$this->hasStudentRole($student)) {
            throw new BadRequestHttpException('The specified user is not a student');
        }
        
        // Reuse common upload logic
        return $this->handleCvUpload($request, $student);
    }

    /**
     * Common method to handle CV upload for a user
     */
    private function handleCvUpload(Request $request, User $user): JsonResponse
    {
        // Debug: Log all request parameters
        error_log('DEBUG: Request method: ' . $request->getMethod());
        error_log('DEBUG: Content-Type: ' . $request->headers->get('Content-Type'));
        
        // Debug: Log all files in the request
        error_log('DEBUG: Files in request: ' . json_encode(array_keys($request->files->all())));
        error_log('DEBUG: POST parameters: ' . json_encode(array_keys($request->request->all())));
        
        // Get the CV document type
        $cvDocumentType = $this->documentTypeRepository->findOneBy(['code' => self::CV_DOCUMENT_TYPE_CODE]);
        
        if (!$cvDocumentType) {
            error_log('DEBUG: CV document type not found with code: ' . self::CV_DOCUMENT_TYPE_CODE);
            throw new NotFoundHttpException('CV document type not found');
        }
        
        // Get the uploaded file - try multiple possible field names
        $file = $request->files->get('file');
        
        if (!$file) {
            // Try alternative field names
            error_log('DEBUG: File not found with field name "file", trying alternatives...');
            $file = $request->files->get('cv');
            
            if (!$file) {
                $file = $request->files->get('document');
            }
            
            if (!$file) {
                // Log all available file keys for debugging
                error_log('DEBUG: No file found in any common field names. Available files: ' . json_encode($request->files->all()));
                throw new BadRequestHttpException('No file uploaded');
            }
        }
        
        error_log('DEBUG: File found! Name: ' . $file->getClientOriginalName() . ', Size: ' . $file->getSize() . ', MIME: ' . $file->getMimeType());
        
        // Check if file type is allowed
        $mimeType = $file->getMimeType();
        $allowedMimeTypes = $cvDocumentType->getAllowedMimeTypes();
        
        error_log('DEBUG: Allowed mime types: ' . json_encode($allowedMimeTypes));
        
        if (!in_array($mimeType, $allowedMimeTypes)) {
            throw new BadRequestHttpException('File type not allowed. Allowed types: ' . implode(', ', $allowedMimeTypes));
        }
        
        // Check file size
        $fileSize = $file->getSize();
        $maxFileSize = $cvDocumentType->getMaxFileSize();
        
        if ($fileSize > $maxFileSize) {
            $maxFileSizeMB = $maxFileSize / (1024 * 1024);
            throw new BadRequestHttpException("File size exceeds the maximum allowed size ($maxFileSizeMB MB)");
        }
        
        // Check if user already has a CV document
        $existingCv = $this->documentRepository->findOneBy([
            'user' => $user,
            'documentType' => $cvDocumentType
        ]);
        
        try {
            // Use the storage factory to upload the file (to S3 or local storage depending on config)
            $uploadResult = $this->storageFactory->upload($file, 'cv-uploads/' . $user->getId());
            
            if (!$uploadResult['success']) {
                throw new FileException('Failed to upload file: ' . ($uploadResult['error'] ?? 'Unknown error'));
            }
            
            // Create new document or update existing one
            if ($existingCv) {
                // Delete the old file from storage
                $this->storageFactory->delete($existingCv->getFilename());
                
                // Update existing document
                $document = $existingCv;
                $document->setName($file->getClientOriginalName());
                $document->setFilename($uploadResult['key']);
                $document->setMimeType($mimeType);
                $document->setSize($fileSize);
                $document->setPath($uploadResult['url'] ?? $uploadResult['key']);
                $document->setStatus(DocumentStatus::APPROVED);
                $document->setUpdatedAt(new \DateTime());
                $document->setValidatedAt(new \DateTime());
                $document->setValidatedBy($this->getUser() ?: $user);
                
                // Create history entry for update
                $history = new DocumentHistory();
                $history->setDocument($document);
                $history->setUser($this->getUser() ?: $user);
                $history->setAction(DocumentAction::UPDATED);
                $history->setDetails(['previousFilename' => $existingCv->getFilename()]);
                $history->setCreatedAt(new \DateTime());
                
                $this->entityManager->persist($history);
                
                // Add validation history entry
                $validationHistory = new DocumentHistory();
                $validationHistory->setDocument($document);
                $validationHistory->setUser($this->getUser() ?: $user);
                $validationHistory->setAction(DocumentAction::VALIDATED);
                $validationHistory->setDetails(['automatic' => true]);
                $validationHistory->setCreatedAt(new \DateTime());
                
                $this->entityManager->persist($validationHistory);
            } else {
                // Create new document
                $document = new Document();
                $document->setUser($user);
                $document->setDocumentType($cvDocumentType);
                $document->setName($file->getClientOriginalName());
                $document->setFilename($uploadResult['key']);
                $document->setMimeType($mimeType);
                $document->setSize($fileSize);
                $document->setPath($uploadResult['url'] ?? $uploadResult['key']);
                $document->setStatus(DocumentStatus::APPROVED);
                $document->setValidatedAt(new \DateTime());
                $document->setValidatedBy($this->getUser() ?: $user);
                
                // Create history entry for creation
                $history = new DocumentHistory();
                $history->setDocument($document);
                $history->setUser($this->getUser() ?: $user);
                $history->setAction(DocumentAction::CREATED);
                $history->setCreatedAt(new \DateTime());
                
                $this->entityManager->persist($document);
                $this->entityManager->persist($history);
                
                // Add validation history entry
                $validationHistory = new DocumentHistory();
                $validationHistory->setDocument($document);
                $validationHistory->setUser($this->getUser() ?: $user);
                $validationHistory->setAction(DocumentAction::VALIDATED);
                $validationHistory->setDetails(['automatic' => true]);
                $validationHistory->setCreatedAt(new \DateTime());
                
                $this->entityManager->persist($validationHistory);
            }
            
            $this->entityManager->flush();
            
            // Create notification for document upload success
            $this->createDocumentNotification(
                $user, 
                'Document téléchargé avec succès', 
                "Votre document {$document->getName()} a été téléchargé avec succès.", 
                'DOCUMENT_UPLOADED',
                '/documents'
            );
            
            return $this->json([
                'success' => true,
                'message' => 'CV uploaded successfully',
                'document' => [
                    'id' => $document->getId(),
                    'name' => $document->getName(),
                    'status' => $document->getStatus()->value,
                    'uploadedAt' => $document->getUploadedAt()->format('Y-m-d H:i:s')
                ]
            ], Response::HTTP_OK);
        } catch (FileException $e) {
            return $this->json([
                'success' => false,
                'message' => 'Failed to upload file: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Download a document by ID
     */
    #[Route('/{id}/download', name: 'app_document_download', methods: ['GET'])]
    public function downloadDocument(int $id): Response
    {
        $document = $this->documentRepository->find($id);
        
        if (!$document) {
            throw new NotFoundHttpException('Document not found');
        }
        
        // Check permissions
        $this->checkDocumentAccessPermission($document);
        
        $path = $document->getPath();
        $filename = $document->getFilename();
        
        // Log the download in history
        $history = new DocumentHistory();
        $history->setDocument($document);
        $history->setUser($this->getUser());
        $history->setAction(DocumentAction::DOWNLOADED);
        $history->setCreatedAt(new \DateTime());
        
        $this->entityManager->persist($history);
        $this->entityManager->flush();
        
        // Check if the path is a URL (S3) or a local file
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            try {
                // For S3 files, stream the content through our backend
                $content = $this->storageFactory->getDocumentContent($filename);
                $mimeType = $document->getMimeType() ?? 'application/octet-stream';
                
                $response = new Response($content);
                $response->headers->set('Content-Type', $mimeType);
                $response->headers->set('Content-Disposition', 'attachment; filename="' . $document->getName() . '"');
                
                return $response;
            } catch (\Exception $e) {
                return $this->json([
                    'success' => false,
                    'message' => 'Failed to download file: ' . $e->getMessage(),
                    'code' => 'SERVER_ERROR'
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        }
        
        try {
            // For local files, use the file() method
            return $this->file($path, $document->getName());
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Failed to download file: ' . $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Delete a document by ID
     */
    #[Route('/{id}', name: 'app_document_delete', methods: ['DELETE'])]
    public function deleteDocument(int $id): JsonResponse
    {
        $document = $this->documentRepository->find($id);
        
        if (!$document) {
            throw new NotFoundHttpException('Document not found');
        }
        
        // Check permissions
        $this->checkDocumentAccessPermission($document);
        
        try {
            // Delete the file using the storage factory
            $filename = $document->getFilename();
            $this->storageFactory->delete($filename);
            
            // Remove the document from the database
            $this->entityManager->remove($document);
            $this->entityManager->flush();
            
            // Create notification for document deletion
            $this->createDocumentNotification(
                $document->getUser(),
                'Document supprimé',
                "Votre document {$document->getName()} a été supprimé avec succès.",
                'DOCUMENT_DELETED',
                '/documents'
            );
            
            return $this->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Failed to delete document: ' . $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Check if user has permission to access the document
     */
    private function checkDocumentAccessPermission(Document $document): void
    {
        $user = $this->getUser();
        
        // SuperAdmin can access any document
        if ($this->isGranted('ROLE_SUPER_ADMIN')) {
            return;
        }
        
        // Users can access their own documents
        if ($document->getUser() === $user) {
            return;
        }
        
        // Other role-based permissions can be added here
        
        throw new AccessDeniedHttpException('You do not have permission to access this document');
    }
    
    /**
     * Check if user has student role
     */
    private function hasStudentRole(User $user): bool
    {
        foreach ($user->getRoles() as $role) {
            if ($role === 'ROLE_STUDENT') {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if user has the GUEST role
     */
    private function hasGuestRole(User $user): bool
    {
        foreach ($user->getRoles() as $role) {
            if ($role === 'ROLE_GUEST') {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get documents by type for the current user
     */
    #[Route('/type/{type}', name: 'app_documents_by_type', methods: ['GET'])]
    public function getDocumentsByType(string $type): JsonResponse
    {
        try {
            $user = $this->getUser();
            $documentType = $this->documentTypeRepository->findOneBy(['code' => strtoupper($type)]);
            
            if (!$documentType) {
                return $this->json([
                    'success' => false,
                    'message' => 'Document type not found'
                ], Response::HTTP_NOT_FOUND);
            }
            
            $documents = $this->documentRepository->findBy([
                'user' => $user,
                'documentType' => $documentType
            ]);
            
            error_log('DEBUG: Found ' . count($documents) . ' documents of type ' . $type . ' for user');
            
            return $this->json([
                'success' => true,
                'data' => $documents
            ], Response::HTTP_OK, [], ['groups' => ['document:read']]);
            
        } catch (\Exception $e) {
            error_log('DEBUG: Error in getDocumentsByType: ' . $e->getMessage());
            return $this->json([
                'success' => false,
                'message' => 'Failed to fetch documents: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a document-related notification in Firebase
     */
    private function createDocumentNotification(User $recipient, string $title, string $message, string $type, string $targetUrl = null): void
    {
        try {
            // Get the Firebase database URL from environment or configuration
            $firebaseUrl = $this->getParameter('firebase_database_url') ?? 'https://firestore.googleapis.com/v1/projects/bigproject-d6daf/databases/(default)/documents';
            
            // Ensure userId is always converted to string to match frontend expectations
            $userId = (string)$recipient->getId();
            
            // Log important debugging information
            $this->logger?->info('Attempting to create notification', [
                'recipient_id' => $userId,
                'type' => $type,
                'recipient_roles' => $recipient->getRoles(),
                'title' => $title
            ]);
            
            // Force la création de la notification sans vérifier les préférences
            // pour les étudiants et guests afin de résoudre le problème temporairement
            $isStudent = in_array('ROLE_STUDENT', $recipient->getRoles());
            $isGuest = in_array('ROLE_GUEST', $recipient->getRoles());
            
            if (!$isStudent && !$isGuest) {
                // Vérifier les préférences de notification de l'utilisateur avant d'envoyer
                try {
                    // Construire le chemin pour accéder au document de préférences
                    $preferencesUrl = $firebaseUrl . '/notificationPreferences/' . $userId;
                    $client = new \Symfony\Component\HttpClient\NativeHttpClient();
                    $response = $client->request('GET', $preferencesUrl, [
                        'timeout' => 3.0,
                        'headers' => [
                            'Content-Type' => 'application/json',
                        ]
                    ]);
                    
                    if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                        $data = json_decode($response->getContent(false), true);
                        
                        // Si les préférences existent et que ce type de notification est désactivé
                        if (isset($data['fields'][$type]['booleanValue']) && $data['fields'][$type]['booleanValue'] === false) {
                            $this->logger?->info('Notification skipped: disabled by user preferences', [
                                'userId' => $userId,
                                'type' => $type
                            ]);
                            return;
                        }
                        
                        // Vérification de sécurité: s'assurer que les préférences appartiennent bien à cet utilisateur
                        if (isset($data['fields']['userId']['stringValue']) && $data['fields']['userId']['stringValue'] !== $userId) {
                            $this->logger?->error('Security issue: preferences user ID does not match recipient ID', [
                                'expectedId' => $userId,
                                'actualId' => $data['fields']['userId']['stringValue']
                            ]);
                            // Continue anyway but log the issue
                        }
                    }
                } catch (\Throwable $e) {
                    $this->logger?->info('Could not check notification preferences, creating notification anyway', [
                        'error' => $e->getMessage()
                    ]);
                    // Continue with notification creation as the default
                }
            } else {
                $this->logger?->info('Bypassing preferences check for student/guest role', [
                    'userId' => $userId,
                    'roles' => $recipient->getRoles()
                ]);
            }
            
            // Prepare the notification data
            $notificationData = [
                'recipientId' => $userId,
                'title' => $title,
                'message' => $message,
                'timestamp' => (new \DateTime())->format('c'), // ISO 8601 format
                'read' => false,
                'type' => $type,
                'userId' => $userId, // Add userId field for additional verification
                'userRoles' => json_encode($recipient->getRoles()) // Add roles for debugging
            ];
            
            if ($targetUrl) {
                $notificationData['targetUrl'] = $targetUrl;
            }
            
            // Log notification data for debugging
            $this->logger?->info('Sending notification to Firebase', [
                'userId' => $userId,
                'notificationData' => $notificationData
            ]);
            
            // Essayer une méthode de création de notification plus directe
            try {
                // Créer un ID unique pour le document
                $documentId = uniqid('notification_', true);
                
                // Construire l'URL du document spécifique
                $documentUrl = $firebaseUrl . '/notifications/' . $documentId;
                
                // Utiliser une requête POST directe pour créer le document avec un ID spécifique
                $client = new \Symfony\Component\HttpClient\NativeHttpClient();
                $response = $client->request('POST', $documentUrl, [
                    'json' => ['fields' => $this->convertToFirestoreFields($notificationData)],
                    'timeout' => 3.0,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ]
                ]);
                
                $statusCode = $response->getStatusCode();
                $this->logger?->info('Notification creation with direct method response', [
                    'statusCode' => $statusCode,
                    'content' => $response->getContent(false)
                ]);
            } catch (\Throwable $directError) {
                $this->logger?->error('Error with direct notification creation: ' . $directError->getMessage(), [
                    'exception' => get_class($directError),
                    'trace' => $directError->getTraceAsString()
                ]);
                
                // Fallback to classic method
                $client = new \Symfony\Component\HttpClient\NativeHttpClient();
                $response = $client->request('POST', $firebaseUrl . '/notifications', [
                    'json' => ['fields' => $this->convertToFirestoreFields($notificationData)],
                    'timeout' => 3.0,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ]
                ]);
            }
            
            // Log the response for debugging
            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 300) {
                $this->logger?->info('Document notification created successfully', [
                    'userId' => $userId,
                    'type' => $type,
                    'responseStatus' => $statusCode
                ]);
            } else {
                $this->logger?->error('Failed to create document notification', [
                    'userId' => $userId,
                    'type' => $type,
                    'statusCode' => $statusCode,
                    'responseContent' => $response->getContent(false)
                ]);
            }
            
            // Check if notification preferences document exists, and create it if not
            try {
                $preferencesUrl = $firebaseUrl . '/notificationPreferences/' . $userId;
                $client = new \Symfony\Component\HttpClient\NativeHttpClient();
                $response = $client->request('GET', $preferencesUrl, [
                    'timeout' => 2.0
                ]);
                
                // If preferences document doesn't exist (404), create it with defaults
                if ($response->getStatusCode() === 404) {
                    $this->logger?->info('Creating default notification preferences for user', [
                        'userId' => $userId
                    ]);
                    
                    $defaultPreferences = [
                        'userId' => $userId,
                        'ROLE_UPDATE' => true,
                        'DOCUMENT_UPLOADED' => true,
                        'DOCUMENT_DELETED' => true,
                        'DOCUMENT_APPROVED' => true,
                        'DOCUMENT_REJECTED' => true,
                        'createdAt' => (new \DateTime())->format('c')
                    ];
                    
                    $client->request('POST', $preferencesUrl, [
                        'json' => ['fields' => $this->convertToFirestoreFields($defaultPreferences)],
                        'timeout' => 3.0,
                        'headers' => [
                            'Content-Type' => 'application/json',
                        ]
                    ]);
                }
            } catch (\Throwable $e) {
                // Just log the error, don't interrupt the flow
                $this->logger?->info('Failed to check/create preferences, not critical', [
                    'error' => $e->getMessage()
                ]);
            }
        } catch (\Throwable $e) {
            // Catch and log errors but don't interrupt the main workflow
            $this->logger?->error('Error creating document notification: ' . $e->getMessage(), [
                'userId' => $recipient->getId(),
                'type' => $type,
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Convert PHP array to Firestore fields format
     */
    private function convertToFirestoreFields(array $data): array
    {
        $fields = [];
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $fields[$key] = ['stringValue' => $value];
            } elseif (is_bool($value)) {
                $fields[$key] = ['booleanValue' => $value];
            } elseif (is_numeric($value)) {
                $fields[$key] = ['integerValue' => $value];
            } elseif ($value instanceof \DateTime) {
                $fields[$key] = ['timestampValue' => $value->format(\DateTime::RFC3339)];
            } elseif (is_array($value)) {
                $fields[$key] = ['mapValue' => ['fields' => $this->convertToFirestoreFields($value)]];
            } else {
                $fields[$key] = ['nullValue' => null];
            }
        }
        return $fields;
    }
} 