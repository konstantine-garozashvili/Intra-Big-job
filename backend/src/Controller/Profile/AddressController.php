<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Entity\Address;
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
        
        $address = new Address();
        $address->setName($data['name']);
        $address->setUser($user);
        
        if (isset($data['complement'])) {
            $address->setComplement($data['complement']);
        }
        
        if (isset($data['postalCodeId'])) {
            $postalCode = $this->addressRepository->findPostalCode($data['postalCodeId']);
            if ($postalCode) {
                $address->setPostalCode($postalCode);
            }
        }
        
        if (isset($data['cityId'])) {
            $city = $this->addressRepository->findCity($data['cityId']);
            if ($city) {
                $address->setCity($city);
            }
        }
        
        $this->entityManager->persist($address);
        $this->entityManager->flush();
        
        return $this->json([
            'success' => true,
            'message' => 'Adresse ajoutée avec succès'
        ]);
    }
}
