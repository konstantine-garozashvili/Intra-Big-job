<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Repository\DiplomaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/profile')]
class ProfileDataController extends AbstractController
{
    private $security;
    private $serializer;
    private $entityManager;
    private $userRepository;
    private $diplomaRepository;
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        DiplomaRepository $diplomaRepository
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->diplomaRepository = $diplomaRepository;
    }

    /**
     * Récupère toutes les données utilisateur pour le profil
     */
    #[Route('/user-data', name: 'api_profile_user_data', methods: ['GET'])]
    public function getUserProfileData(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Récupérer l'utilisateur avec toutes ses relations chargées
        $user = $this->userRepository->findOneWithAllRelations($user->getId());
        
        // Formatter les adresses
        $addresses = [];
        foreach ($user->getAddresses() as $address) {
            $addresses[] = [
                'id' => $address->getId(),
                'name' => $address->getName(),
                'complement' => $address->getComplement(),
                'postalCode' => $address->getPostalCode() ? [
                    'id' => $address->getPostalCode()->getId(),
                    'code' => $address->getPostalCode()->getCode(),
                ] : null,
                'city' => $address->getCity() ? [
                    'id' => $address->getCity()->getId(),
                    'name' => $address->getCity()->getName(),
                ] : null,
            ];
        }
        
        // Formatter les diplômes
        $diplomas = [];
        foreach ($user->getDiplomas() as $diploma) {
            $diplomas[] = [
                'id' => $diploma->getId(),
                'name' => $diploma->getName(),
                'obtainedAt' => $diploma->getObtainedAt() ? $diploma->getObtainedAt()->format('Y-m-d') : null,
                'institution' => $diploma->getInstitution() ? $diploma->getInstitution()->getName() : null,
                'location' => $diploma->getLocation(),
            ];
        }
        
        // Récupérer les données utilisateur avec les relations
        $userData = [
            'user' => [
                'id' => $user->getId(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'email' => $user->getEmail(),
                'phoneNumber' => $user->getPhoneNumber(),
                'linkedinUrl' => $user->getLinkedinUrl(),
                'profilePicturePath' => $user->getProfilePicturePath(),
                'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
                'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                'isEmailVerified' => $user->isEmailVerified(),
                'nationality' => $user->getNationality() ? [
                    'id' => $user->getNationality()->getId(),
                    'name' => $user->getNationality()->getName(),
                ] : null,
                'cvFilePath' => $user->getCvFilePath(),
                'theme' => $user->getTheme() ? [
                    'id' => $user->getTheme()->getId(),
                    'name' => $user->getTheme()->getName(),
                ] : null,
                'roles' => $this->getUserRolesAsArray($user),
                'specialization' => $user->getSpecialization() ? [
                    'id' => $user->getSpecialization()->getId(),
                    'name' => $user->getSpecialization()->getName(),
                    'domain' => $user->getSpecialization()->getDomain() ? [
                        'id' => $user->getSpecialization()->getDomain()->getId(),
                        'name' => $user->getSpecialization()->getDomain()->getName(),
                    ] : null,
                ] : null,
                'addresses' => $addresses,
                'diplomas' => $diplomas,
            ]
        ];
        
        // Ajouter le profil étudiant si l'utilisateur en a un
        if ($user->getStudentProfile()) {
            $studentProfile = $user->getStudentProfile();
            $userData['user']['studentProfile'] = [
                'id' => $studentProfile->getId(),
                'isSeekingInternship' => $studentProfile->isSeekingInternship(),
                'isSeekingApprenticeship' => $studentProfile->isSeekingApprenticeship(),
                'portfolioUrl' => $studentProfile->getPortfolioUrl(),
                'currentInternshipCompany' => $studentProfile->getCurrentInternshipCompany(),
                'internshipStartDate' => $studentProfile->getInternshipStartDate() ? $studentProfile->getInternshipStartDate()->format('Y-m-d') : null,
                'internshipEndDate' => $studentProfile->getInternshipEndDate() ? $studentProfile->getInternshipEndDate()->format('Y-m-d') : null,
                'situationType' => $studentProfile->getSituationType() ? [
                    'id' => $studentProfile->getSituationType()->getId(),
                    'name' => $studentProfile->getSituationType()->getName()
                ] : null,
            ];
        }
        
        return $this->json([
            'success' => true,
            'data' => $userData
        ]);
    }

    /**
     * Récupère toutes les données du profil en une seule requête
     */
    #[Route('/all', name: 'api_profile_all', methods: ['GET'])]
    public function getAllProfileData(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Récupérer les données de base du profil
        $profileData = $this->getUserProfileData()->getContent();
        $profileData = json_decode($profileData, true);
        
        // Récupérer les statistiques et autres données si nécessaire
        // ...
        
        return $this->json([
            'success' => true,
            'data' => $profileData['data']
        ]);
    }

    /**
     * Endpoint pour vérifier l'état de complétude du profil directement depuis la base de données
     */
    #[Route('/completion-status', name: 'api_profile_completion', methods: ['GET'])]
    public function getProfileCompletionStatus(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        // Charger l'utilisateur avec toutes ses relations
        $user = $this->userRepository->findOneWithAllRelations($user->getId());
        
        // Vérifier si l'utilisateur a un URL LinkedIn
        $hasLinkedIn = !empty($user->getLinkedinUrl());
        
        // Vérifier si l'utilisateur a un CV
        $hasCv = false;
        
        // Debugging
        error_log('DEBUG ProfileDataController: Checking CV status for user ID: ' . $user->getId());
        
        // 1. Vérifier directement dans les documents si un CV existe
        if (method_exists($user, 'getDocuments')) {
            $documents = $user->getDocuments();
            error_log('DEBUG ProfileDataController: User has ' . count($documents) . ' documents');
            
            foreach ($documents as $document) {
                // Vérifier plusieurs façons dont un document peut être identifié comme CV
                $documentType = $document->getDocumentType();
                
                // Debugger chaque document
                error_log('DEBUG ProfileDataController: Document ID: ' . $document->getId() . 
                         ', name: ' . $document->getName() . 
                         ', type: ' . ($documentType ? $documentType->getCode() : 'null') .
                         ', status: ' . $document->getStatus());
                
                // Vérifie le documentType.code
                if ($documentType && ($documentType->getCode() === 'CV' || $documentType->getCode() === 'cv')) {
                    error_log('DEBUG ProfileDataController: Found CV document by type code');
                    $hasCv = true;
                    break;
                }
                
                // Vérifie le nom du document
                $documentName = $document->getName();
                if ($documentName && (
                    strtolower($documentName) === 'cv' || 
                    stripos($documentName, 'cv') !== false ||
                    stripos($documentName, 'curriculum') !== false ||
                    stripos($documentName, 'resume') !== false
                )) {
                    error_log('DEBUG ProfileDataController: Found CV document by name');
                    $hasCv = true;
                    break;
                }
                
                // Vérifie le type MIME
                $mimeType = $document->getMimeType();
                if ($mimeType && $mimeType === 'application/pdf') {
                    // Si c'est un PDF, vérifie aussi le nom de fichier
                    $filename = $document->getFilename();
                    error_log('DEBUG ProfileDataController: Checking PDF filename: ' . $filename);
                    if ($filename && (
                        stripos($filename, 'cv') !== false ||
                        stripos($filename, 'curriculum') !== false ||
                        stripos($filename, 'resume') !== false
                    )) {
                        error_log('DEBUG ProfileDataController: Found CV document by PDF filename');
                        $hasCv = true;
                        break;
                    }
                }
            }
        } else {
            error_log('DEBUG ProfileDataController: User does not have getDocuments method');
        }
        
        // 2. Si aucun document n'est trouvé, vérifier également le champ cvFilePath
        if (!$hasCv && method_exists($user, 'getCvFilePath') && !empty($user->getCvFilePath())) {
            error_log('DEBUG ProfileDataController: Found CV via getCvFilePath');
            $hasCv = true;
        }
        
        // 3. Direct database query as a fallback - this should catch ALL CV documents
        if (!$hasCv) {
            error_log('DEBUG ProfileDataController: No CV found yet, trying direct database query');
            
            try {
                // Query all documents for this user_id from database
                $stmt = $this->entityManager->getConnection()->prepare(
                    'SELECT * FROM document WHERE user_id = :userId AND status = "APPROVED" AND 
                    (document_type_id IN (SELECT id FROM document_type WHERE code = "CV") OR 
                     name LIKE "%CV%" OR 
                     name LIKE "%curriculum%" OR
                     (mime_type = "application/pdf" AND filename LIKE "%cv%"))
                    LIMIT 1'
                );
                $result = $stmt->executeQuery(['userId' => $user->getId()]);
                $documents = $result->fetchAllAssociative();
                
                if (count($documents) > 0) {
                    error_log('DEBUG ProfileDataController: Found CV document via direct SQL query: ' . json_encode($documents[0]));
                    $hasCv = true;
                } else {
                    error_log('DEBUG ProfileDataController: No CV found via direct SQL query');
                }
            } catch (\Exception $e) {
                error_log('ERROR ProfileDataController: Exception in CV document query: ' . $e->getMessage());
            }
        }
        
        // Vérifier si l'utilisateur a des diplômes
        $hasDiploma = $user->getDiplomas()->count() > 0;
        
        // Calculer le pourcentage de complétion
        $completedItems = ($hasLinkedIn ? 1 : 0) + ($hasCv ? 1 : 0) + ($hasDiploma ? 1 : 0);
        $totalItems = 3;
        $completionPercentage = ($completedItems / $totalItems) * 100;
        
        return $this->json([
            'success' => true,
            'data' => [
                'hasLinkedIn' => $hasLinkedIn,
                'hasCv' => $hasCv,
                'hasDiploma' => $hasDiploma,
                'completedItems' => $completedItems,
                'totalItems' => $totalItems,
                'completionPercentage' => $completionPercentage
            ]
        ]);
    }

    /**
     * Get user roles as array
     */
    private function getUserRolesAsArray(User $user): array
    {
        return array_map(function($role) {
            return is_string($role) ? $role : $role->getName();
        }, $user->getRoles());
    }
}
