<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\DiplomaRepository;
use App\Repository\AddressRepository;
use App\Repository\UserRepository;
use App\Domains\Student\Repository\StudentProfileRepository;
use App\Domains\Global\Document\Entity\Document;
use App\Domains\Global\Document\Entity\DocumentType;
use App\Domains\Global\Document\Repository\DocumentRepository;
use App\Domains\Global\Document\Repository\DocumentTypeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/profil')]
class ProfilController extends AbstractController
{
    private $security;
    private $serializer;
    private $entityManager;
    private $userRepository;
    private $studentProfileRepository;
    private $documentRepository;
    private $documentTypeRepository;
    
    public function __construct(
        Security $security,
        SerializerInterface $serializer,
        EntityManagerInterface $entityManager,
        UserRepository $userRepository,
        StudentProfileRepository $studentProfileRepository,
        DocumentRepository $documentRepository,
        DocumentTypeRepository $documentTypeRepository
    ) {
        $this->security = $security;
        $this->serializer = $serializer;
        $this->entityManager = $entityManager;
        $this->userRepository = $userRepository;
        $this->studentProfileRepository = $studentProfileRepository;
        $this->documentRepository = $documentRepository;
        $this->documentTypeRepository = $documentTypeRepository;
    }

    /**
     * Récupère toutes les données utilisateur pour le profil
     */
    #[Route('/user-data', name: 'api_profil_user_data', methods: ['GET'])]
    public function getUserProfilData(): JsonResponse
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
                'linkedinUrl' => $user->getLinkedinUrl(),
                'nationality' => $user->getNationality() ? [
                    'id' => $user->getNationality()->getId(),
                    'name' => $user->getNationality()->getName(),
                ] : null,
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
            ]
        ];
        
        return $this->json([
            'success' => true,
            'data' => $userData
        ]);
    }
    
    /**
     * Récupère les diplômes de l'utilisateur
     */
    #[Route('/diplomas', name: 'api_profil_diplomas', methods: ['GET'])]
    public function getUserDiplomas(DiplomaRepository $diplomaRepository): JsonResponse
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
        
        $diplomas = [];
        foreach ($user->getDiplomas() as $diploma) {
            $diplomas[] = [
                'id' => $diploma->getId(),
                'name' => $diploma->getName(),
                'obtainedAt' => $diploma->obtainedAt ? $diploma->obtainedAt->format('Y-m-d') : null,
            ];
        }
        
        // Trier les diplômes par date d'obtention (du plus récent au plus ancien)
        usort($diplomas, function($a, $b) {
            if (!isset($a['obtainedAt']) || !isset($b['obtainedAt'])) {
                return 0;
            }
            return strtotime($b['obtainedAt']) - strtotime($a['obtainedAt']);
        });
        
        return $this->json([
            'success' => true,
            'data' => [
                'diplomas' => $diplomas
            ]
        ]);
    }
    
    /**
     * Récupère les adresses de l'utilisateur
     */
    #[Route('/addresses', name: 'api_profil_addresses', methods: ['GET'])]
    public function getUserAddresses(AddressRepository $addressRepository): JsonResponse
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
        
        return $this->json([
            'success' => true,
            'data' => [
                'addresses' => $addresses
            ]
        ]);
    }
    
    /**
     * Récupère les statistiques de l'utilisateur
     */
    #[Route('/stats', name: 'api_profil_stats', methods: ['GET'])]
    public function getUserStats(): JsonResponse
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
        
        $stats = [
            'profile' => [
                'completionPercentage' => $this->calculateProfileCompletionPercentage($user),
            ],
            'memberSince' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d') : null,
            'daysSinceRegistration' => $user->getCreatedAt() ? (new \DateTime())->diff($user->getCreatedAt())->days : null,
        ];
        
        return $this->json([
            'success' => true,
            'data' => [
                'stats' => $stats
            ]
        ]);
    }
    
    /**
     * Récupère toutes les données complètes nécessaires pour le profil en une seule requête
     */
    #[Route('/consolidated', name: 'api_profil_consolidated', methods: ['GET'])]
    public function getConsolidatedProfile(): JsonResponse
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
        
        // Si l'utilisateur est un étudiant, récupérer son profil étudiant avec les relations
        $studentProfile = null;
        if ($user->getStudentProfile()) {
            $studentProfile = $this->studentProfileRepository->findByUserWithRelations($user->getId());
        }
        
        // Récupérer les documents de l'utilisateur
        $documents = $this->documentRepository->findBy(['user' => $user]);
        $documentsArray = [];
        
        foreach ($documents as $document) {
            $documentsArray[] = [
                'id' => $document->getId(),
                'name' => $document->getName(),
                'path' => $document->getPath(),
                'type' => $document->getDocumentType() ? $document->getDocumentType()->getCode() : null,
                'documentType' => $document->getDocumentType() ? [
                    'id' => $document->getDocumentType()->getId(),
                    'name' => $document->getDocumentType()->getName(),
                    'code' => $document->getDocumentType()->getCode(),
                ] : null,
                'createdAt' => $document->getUploadedAt() ? $document->getUploadedAt()->format('Y-m-d H:i:s') : null,
                'updatedAt' => $document->getUpdatedAt() ? $document->getUpdatedAt()->format('Y-m-d H:i:s') : null,
            ];
        }
        
        // Construire la réponse complète avec toutes les données du profil
        $response = [
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->getId(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'fullName' => $user->getFirstName() . ' ' . $user->getLastName(),
                    'email' => $user->getEmail(),
                    'phoneNumber' => $user->getPhoneNumber(),
                    'linkedinUrl' => $user->getLinkedinUrl(),
                    'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
                    'age' => $user->getBirthDate() ? (new \DateTime())->diff($user->getBirthDate())->y : null,
                    'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
                    'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                    'isEmailVerified' => $user->isEmailVerified(),
                    'linkedinUrl' => $user->getLinkedinUrl(),
                    'nationality' => $user->getNationality() ? [
                        'id' => $user->getNationality()->getId(),
                        'name' => $user->getNationality()->getName(),
                        'code' => $user->getNationality()->getCode(),
                    ] : null,
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
                ],
                'diplomas' => $this->getUserDiplomasArray($user),
                'addresses' => $this->getUserAddressesArray($user),
                'documents' => $documentsArray,
                'stats' => [
                    'profile' => [
                        'completionPercentage' => $this->calculateProfileCompletionPercentage($user),
                    ],
                    'memberSince' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d') : null,
                    'daysSinceRegistration' => $user->getCreatedAt() ? (new \DateTime())->diff($user->getCreatedAt())->days : null,
                ]
            ]
        ];
        
        // Ajouter les données du profil étudiant si disponibles
        if ($studentProfile) {
            $response['data']['studentProfile'] = [
                'id' => $studentProfile->getId(),
                'isSeekingInternship' => $studentProfile->isSeekingInternship(),
                'isSeekingApprenticeship' => $studentProfile->isSeekingApprenticeship(),
                'currentInternshipCompany' => $studentProfile->getCurrentInternshipCompany(),
                'internshipStartDate' => $studentProfile->getInternshipStartDate() ? $studentProfile->getInternshipStartDate()->format('Y-m-d') : null,
                'internshipEndDate' => $studentProfile->getInternshipEndDate() ? $studentProfile->getInternshipEndDate()->format('Y-m-d') : null,
                'portfolioUrl' => $studentProfile->getPortfolioUrl(),
                'situationType' => $studentProfile->getSituationType() ? [
                    'id' => $studentProfile->getSituationType()->getId(),
                    'name' => $studentProfile->getSituationType()->getName(),
                    'description' => $studentProfile->getSituationType()->getDescription(),
                ] : null,
                'createdAt' => $studentProfile->getCreatedAt() ? $studentProfile->getCreatedAt()->format('Y-m-d H:i:s') : null,
                'updatedAt' => $studentProfile->getUpdatedAt() ? $studentProfile->getUpdatedAt()->format('Y-m-d H:i:s') : null,
            ];
        }
        
        return $this->json($response);
    }
    
    /**
     * Récupère le profil public d'un utilisateur par son ID
     */
    #[Route('/public/{id}', name: 'api_profil_public', methods: ['GET'])]
    public function getPublicProfile(int $id): JsonResponse
    {
        // Vérifier si l'utilisateur existe
        $user = $this->userRepository->findOneWithAllRelations($id);
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }
        
        // Récupérer le profil étudiant si disponible
        $studentProfile = null;
        if ($user->getStudentProfile()) {
            $studentProfile = $this->studentProfileRepository->findByUserWithRelations($user->getId());
        }
        
        // Construire la réponse avec uniquement les données publiques
        $response = [
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->getId(),
                    'firstName' => $user->getFirstName(),
                    'lastName' => $user->getLastName(),
                    'fullName' => $user->getFirstName() . ' ' . $user->getLastName(),
                    'profilePicturePath' => $user->getProfilePicturePath(),
                    'nationality' => $user->getNationality() ? [
                        'name' => $user->getNationality()->getName(),
                    ] : null,
                    'specialization' => $user->getSpecialization() ? [
                        'id' => $user->getSpecialization()->getId(),
                        'name' => $user->getSpecialization()->getName(),
                        'domain' => $user->getSpecialization()->getDomain() ? [
                            'id' => $user->getSpecialization()->getDomain()->getId(),
                            'name' => $user->getSpecialization()->getDomain()->getName(),
                        ] : null,
                    ] : null,
                    'linkedinUrl' => $user->getLinkedinUrl(),
                    'roles' => $this->getUserRolesAsArray($user),
                ],
                'diplomas' => $this->getUserDiplomasArray($user),
            ]
        ];
        
        // Ajouter les données du profil étudiant si disponibles
        if ($studentProfile) {
            $response['data']['studentProfile'] = [
                'isSeekingInternship' => $studentProfile->isSeekingInternship(),
                'isSeekingApprenticeship' => $studentProfile->isSeekingApprenticeship(),
                'currentInternshipCompany' => $studentProfile->getCurrentInternshipCompany(),
                'internshipStartDate' => $studentProfile->getInternshipStartDate() ? $studentProfile->getInternshipStartDate()->format('Y-m-d') : null,
                'internshipEndDate' => $studentProfile->getInternshipEndDate() ? $studentProfile->getInternshipEndDate()->format('Y-m-d') : null,
                'portfolioUrl' => $studentProfile->getPortfolioUrl(),
                'situationType' => $studentProfile->getSituationType() ? [
                    'name' => $studentProfile->getSituationType()->getName(),
                ] : null,
            ];
        }
        
        return $this->json($response);
    }
    
    /**
     * Met à jour l'adresse de l'utilisateur
     */
    #[Route('/address', name: 'api_profil_address_update', methods: ['PUT'])]
    public function updateUserAddress(
        Request $request,
        EntityManagerInterface $entityManager,
        AddressRepository $addressRepository
    ): JsonResponse {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        try {
            $data = json_decode($request->getContent(), true);
            
            // Récupérer l'adresse existante ou en créer une nouvelle
            $address = null;
            if (!$user->getAddresses()->isEmpty()) {
                $address = $user->getAddresses()->first();
            } else {
                $address = new \App\Entity\Address();
                $address->setUser($user);
                $entityManager->persist($address);
            }
            
            // Mise à jour des champs de l'adresse
            if (isset($data['name'])) {
                $address->setName($data['name']);
            }
            
            if (isset($data['complement'])) {
                $address->setComplement($data['complement']);
            }
            
            // Gestion du code postal
            if (isset($data['postalCode']) && isset($data['postalCode']['code'])) {
                $postalCode = $entityManager->getRepository(\App\Entity\PostalCode::class)->findOneBy(['code' => $data['postalCode']['code']]);
                
                if (!$postalCode) {
                    // Créer un nouveau code postal si nécessaire
                    $postalCode = new \App\Entity\PostalCode();
                    $postalCode->setCode($data['postalCode']['code']);
                    $entityManager->persist($postalCode);
                }
                
                $address->setPostalCode($postalCode);
            }
            
            // Gestion de la ville
            if (isset($data['city']) && isset($data['city']['name'])) {
                $city = $entityManager->getRepository(\App\Entity\City::class)->findOneBy(['name' => $data['city']['name']]);
                
                if (!$city) {
                    // Créer une nouvelle ville si nécessaire
                    $city = new \App\Entity\City();
                    $city->setName($data['city']['name']);
                    $entityManager->persist($city);
                }
                
                $address->setCity($city);
            }
            
            // Sauvegarder les modifications
            $entityManager->flush();
            
            // Récupérer l'adresse mise à jour
            $updatedAddress = [
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
            
            return $this->json([
                'success' => true,
                'message' => 'Adresse mise à jour avec succès',
                'data' => [
                    'address' => $updatedAddress
                ]
            ]);
            
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour de l\'adresse: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Méthodes privées utilitaires
     */
    private function getUserRolesAsArray(User $user): array
    {
        $roles = [];
        foreach ($user->getUserRoles() as $userRole) {
            $roles[] = [
                'id' => $userRole->getRole()->getId(),
                'name' => $userRole->getRole()->getName(),
            ];
        }
        return $roles;
    }
    
    private function calculateProfileCompletionPercentage(User $user): float
    {
        // Nouveaux critères de complétude:
        // 1. CV en PDF
        // 2. Lien LinkedIn
        // 3. Au moins un diplôme
        
        // Initialiser les flags pour chaque critère
        $hasCv = false;
        $hasLinkedIn = !empty($user->getLinkedinUrl());
        $hasDiploma = count($user->getDiplomas()) > 0;
        
        // Vérifier le CV (document de type 'CV')
        try {
            // Trouver le type de document CV
            $cvType = $this->documentTypeRepository->findOneBy(['code' => 'CV']);
            
            if ($cvType) {
                // Vérifier si l'utilisateur a un document CV
                $cvDocuments = $this->documentRepository->findBy([
                    'user' => $user,
                    'documentType' => $cvType,
                ]);
                
                $hasCv = count($cvDocuments) > 0;
            }
        } catch (\Exception $e) {
            // En cas d'erreur, on considère que l'utilisateur n'a pas de CV
            $hasCv = false;
        }
        
        // Compteur de critères remplis
        $filledCriteria = 0;
        if ($hasCv) $filledCriteria++;
        if ($hasLinkedIn) $filledCriteria++;
        if ($hasDiploma) $filledCriteria++;
        
        // Calcul du pourcentage (3 critères au total)
        return ($filledCriteria / 3) * 100;
    }
    
    private function getUserDataArray(User $user): array
    {
        return [
            'id' => $user->getId(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'email' => $user->getEmail(),
            'phoneNumber' => $user->getPhoneNumber(),
            'linkedinUrl' => $user->getLinkedinUrl(),
            'birthDate' => $user->getBirthDate() ? $user->getBirthDate()->format('Y-m-d') : null,
            'createdAt' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d H:i:s') : null,
            'updatedAt' => $user->getUpdatedAt() ? $user->getUpdatedAt()->format('Y-m-d H:i:s') : null,
            'isEmailVerified' => $user->isEmailVerified(),
            'linkedinUrl' => $user->getLinkedinUrl(),
            'nationality' => $user->getNationality() ? [
                'id' => $user->getNationality()->getId(),
                'name' => $user->getNationality()->getName(),
            ] : null,
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
        ];
    }
    
    private function getUserDiplomasArray(User $user): array
    {
        $diplomas = [];
        foreach ($user->getDiplomas() as $diploma) {
            $diplomas[] = [
                'id' => $diploma->getId(),
                'name' => $diploma->getName(),
                'obtainedAt' => $diploma->obtainedAt ? $diploma->obtainedAt->format('Y-m-d') : null,
            ];
        }
        
        // Trier les diplômes par date d'obtention (du plus récent au plus ancien)
        usort($diplomas, function($a, $b) {
            if (!isset($a['obtainedAt']) || !isset($b['obtainedAt'])) {
                return 0;
            }
            return strtotime($b['obtainedAt']) - strtotime($a['obtainedAt']);
        });
        
        return $diplomas;
    }
    
    private function getUserAddressesArray(User $user): array
    {
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
        
        return $addresses;
    }
    
    private function getUserStatsArray(User $user): array
    {
        return [
            'profile' => [
                'completionPercentage' => $this->calculateProfileCompletionPercentage($user),
            ],
            'memberSince' => $user->getCreatedAt() ? $user->getCreatedAt()->format('Y-m-d') : null,
            'daysSinceRegistration' => $user->getCreatedAt() ? (new \DateTime())->diff($user->getCreatedAt())->days : null,
        ];
    }
    
} 