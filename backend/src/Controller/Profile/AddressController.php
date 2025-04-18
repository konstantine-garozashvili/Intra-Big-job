<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Entity\Address;
use App\Entity\City;
use App\Entity\PostalCode;
use App\Repository\AddressRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;

class AddressController extends AbstractController
{
    private Security $security;
    private EntityManagerInterface $entityManager;
    private AddressRepository $addressRepository;
    
    public function __construct(
        Security $security,
        EntityManagerInterface $entityManager,
        AddressRepository $addressRepository
    ) {
        $this->security = $security;
        $this->entityManager = $entityManager;
        $this->addressRepository = $addressRepository;
    }

    /**
     * Récupère les adresses de l'utilisateur
     */
    #[Route('/addresses', name: 'api_profile_addresses', methods: ['GET'])]
    public function getUserAddresses(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
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
     * Ajoute une nouvelle adresse
     */
    #[Route('/addresses', name: 'api_profile_add_address', methods: ['POST'])]
    public function addAddress(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['name'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le nom de l\'adresse est requis'
            ], 400);
        }
        
        // Validate required fields
        if (!isset($data['postalCode']) || !isset($data['city'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le code postal et la ville sont requis'
            ], 400);
        }
        
        $postalCode = null;
        $city = null;
        
        // Process city first
        if (isset($data['city']['id'])) {
            $city = $this->addressRepository->findCity($data['city']['id']);
        } else if (isset($data['city']['name'])) {
            $city = $this->entityManager->getRepository(City::class)
                ->findOneBy(['name' => $data['city']['name']]);
            
            // Create new city if not found
            if (!$city && !empty($data['city']['name'])) {
                $city = new City();
                $city->setName($data['city']['name']);
                $this->entityManager->persist($city);
                $this->entityManager->flush(); // Flush to get an ID for the city
            }
        }
        
        if (!$city) {
            return $this->json([
                'success' => false,
                'message' => 'La ville est requise'
            ], 400);
        }
        
        // Now process postal code with city available
        if (isset($data['postalCode']['id'])) {
            $postalCode = $this->addressRepository->findPostalCode($data['postalCode']['id']);
        } else if (isset($data['postalCode']['code'])) {
            $postalCode = $this->entityManager->getRepository(PostalCode::class)
                ->findOneBy(['code' => $data['postalCode']['code']]);
            
            // Create new postal code if not found
            if (!$postalCode && !empty($data['postalCode']['code'])) {
                $postalCode = new PostalCode();
                $postalCode->setCode($data['postalCode']['code']);
                $postalCode->setCity($city); // Set the city relationship
                $this->entityManager->persist($postalCode);
            }
        }
        
        if (!$postalCode) {
            return $this->json([
                'success' => false,
                'message' => 'Le code postal est requis'
            ], 400);
        }
        
        $address = new Address();
        $address->setName($data['name']);
        $address->setUser($user);
        
        if (isset($data['complement'])) {
            $address->setComplement($data['complement']);
        } else {
            $address->setComplement(null);
        }
        
        $address->setPostalCode($postalCode);
        $address->setCity($city);
        
        $this->entityManager->persist($address);
        $this->entityManager->flush();
        
        return $this->json([
            'success' => true,
            'message' => 'Adresse ajoutée avec succès'
        ]);
    }

    /**
     * Met à jour l'adresse de l'utilisateur
     */
    #[Route('/addresses/{id}', name: 'api_profile_update_address', methods: ['PUT'])]
    public function updateAddress(Request $request, int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $address = $this->addressRepository->find($id);
        if (!$address) {
            return $this->json([
                'success' => false,
                'message' => 'Adresse non trouvée'
            ], 404);
        }

        // Vérifier si l'utilisateur est autorisé à modifier cette adresse
        if (!in_array('ROLE_ADMIN', $user->getRoles()) && 
            !in_array('ROLE_GUEST', $user->getRoles()) && 
            $address->getUser() !== $user) {
            return $this->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à modifier cette adresse'
            ], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['name'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le nom de l\'adresse est requis'
            ], 400);
        }
        
        // Validate required fields
        if (!isset($data['postalCode']) || !isset($data['city'])) {
            return $this->json([
                'success' => false,
                'message' => 'Le code postal et la ville sont requis'
            ], 400);
        }

        $postalCode = null;
        $city = null;
        
        // Process city first
        if (isset($data['city']['id'])) {
            $city = $this->addressRepository->findCity($data['city']['id']);
        } else if (isset($data['city']['name'])) {
            $city = $this->entityManager->getRepository(City::class)
                ->findOneBy(['name' => $data['city']['name']]);
            
            // Create new city if not found
            if (!$city && !empty($data['city']['name'])) {
                $city = new City();
                $city->setName($data['city']['name']);
                $this->entityManager->persist($city);
                $this->entityManager->flush(); // Flush to get an ID for the city
            }
        }
        
        if (!$city) {
            return $this->json([
                'success' => false,
                'message' => 'La ville est requise'
            ], 400);
        }
        
        // Now process postal code with city available
        if (isset($data['postalCode']['id'])) {
            $postalCode = $this->addressRepository->findPostalCode($data['postalCode']['id']);
        } else if (isset($data['postalCode']['code'])) {
            $postalCode = $this->entityManager->getRepository(PostalCode::class)
                ->findOneBy(['code' => $data['postalCode']['code']]);
            
            // Create new postal code if not found
            if (!$postalCode && !empty($data['postalCode']['code'])) {
                $postalCode = new PostalCode();
                $postalCode->setCode($data['postalCode']['code']);
                $postalCode->setCity($city); // Set the city relationship
                $this->entityManager->persist($postalCode);
            }
        }
        
        if (!$postalCode) {
            return $this->json([
                'success' => false,
                'message' => 'Le code postal est requis'
            ], 400);
        }

        $address->setName($data['name']);
        
        if (isset($data['complement'])) {
            $address->setComplement($data['complement']);
        } else {
            $address->setComplement(null);
        }
        
        $address->setPostalCode($postalCode);
        $address->setCity($city);

        $this->entityManager->flush();

        return $this->json([
            'success' => true,
            'message' => 'Adresse mise à jour avec succès'
        ]);
    }
}
