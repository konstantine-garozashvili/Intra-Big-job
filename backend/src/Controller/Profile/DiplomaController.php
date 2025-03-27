<?php

namespace App\Controller\Profile;

use App\Entity\User;
use App\Repository\DiplomaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\SecurityBundle\Security;

#[Route('/api/profile')]
class DiplomaController extends AbstractController
{
    private $security;
    private $entityManager;
    private $diplomaRepository;
    
    public function __construct(
        Security $security,
        EntityManagerInterface $entityManager,
        DiplomaRepository $diplomaRepository
    ) {
        $this->security = $security;
        $this->entityManager = $entityManager;
        $this->diplomaRepository = $diplomaRepository;
    }

    /**
     * Récupère les diplômes de l'utilisateur
     */
    #[Route('/diplomas', name: 'api_profile_diplomas', methods: ['GET'])]
    public function getUserDiplomas(): JsonResponse
    {
        /** @var User $user */
        $user = $this->security->getUser();
        
        if (!$user) {
            return $this->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
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
     * Ajoute un nouveau diplôme
     */
    #[Route('/diplomas', name: 'api_profile_add_diploma', methods: ['POST'])]
    public function addDiploma(Request $request): JsonResponse
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
                'message' => 'Le nom du diplôme est requis'
            ], 400);
        }
        
        $diploma = new UserDiploma();
        $diploma->setName($data['name']);
        $diploma->setUser($user);
        
        if (isset($data['obtainedAt'])) {
            $diploma->setObtainedAt(new \DateTime($data['obtainedAt']));
        }
        
        $this->entityManager->persist($diploma);
        $this->entityManager->flush();
        
        return $this->json([
            'success' => true,
            'message' => 'Diplôme ajouté avec succès'
        ]);
    }
}
