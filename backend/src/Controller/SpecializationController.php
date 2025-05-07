<?php

namespace App\Controller;

use App\Entity\Specialization;
use App\Repository\SpecializationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Domain;
use App\Domains\Global\Repository\DomainRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Psr\Log\LoggerInterface;
use App\Repository\FormationRepository;

#[Route('/api')]
class SpecializationController extends AbstractController
{
    public function __construct(
        private readonly SpecializationRepository $specializationRepository,
        private readonly DomainRepository $domainRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $logger,
        private readonly FormationRepository $formationRepository
    ) {
    }

    /**
     * Récupère toutes les spécialisations
     */
    #[Route('/specializations', name: 'api_specializations_list', methods: ['GET'])]
    public function getAllSpecializations(): JsonResponse
    {
        $specializations = $this->specializationRepository->findAll();
        
        $data = array_map(function(Specialization $specialization) {
            return [
                'id' => $specialization->getId(),
                'name' => $specialization->getName(),
                'domain' => $specialization->getDomain() ? [
                    'id' => $specialization->getDomain()->getId(),
                    'name' => $specialization->getDomain()->getName()
                ] : null
            ];
        }, $specializations);

        return $this->json([
            'success' => true,
            'data' => [
                'specializations' => $data
            ]
        ]);
    }

    /**
     * Récupère une spécialisation par son ID
     */
    #[Route('/specializations/{id}', name: 'api_specializations_get', methods: ['GET'])]
    public function getSpecialization(int $id): JsonResponse
    {
        $specialization = $this->specializationRepository->find($id);

        if (!$specialization) {
            return $this->json([
                'success' => false,
                'message' => 'Spécialisation non trouvée'
            ], 404);
        }

        $data = [
            'id' => $specialization->getId(),
            'name' => $specialization->getName(),
            'domain' => $specialization->getDomain() ? [
                'id' => $specialization->getDomain()->getId(),
                'name' => $specialization->getDomain()->getName()
            ] : null
        ];

        return $this->json([
            'success' => true,
            'data' => [
                'specialization' => $data
            ]
        ]);
    }

    /**
     * Liste tous les domaines
     */
    #[Route('/domains', name: 'api_domains_list', methods: ['GET'])]
    #[IsGranted('ROLE_RECRUITER')]
    public function getAllDomains(): JsonResponse
    {
        try {
            $this->logger->info('Attempting to get all domains');
            
            if (!$this->getUser()) {
                $this->logger->error('No user found in session');
                return $this->json(['success' => false, 'message' => 'User not authenticated'], 401);
            }

            $this->logger->info('User roles: ' . implode(', ', $this->getUser()->getRoles()));
            
            $domains = $this->domainRepository->findAll();
            $this->logger->info('Found ' . count($domains) . ' domains');
            
            $data = array_map(function(Domain $domain) {
                return [
                    'id' => $domain->getId(),
                    'name' => $domain->getName(),
                    'description' => $domain->getDescription(),
                ];
            }, $domains);
            
            return $this->json([
                'success' => true,
                'data' => [ 'domains' => $data ]
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Error in getAllDomains: ' . $e->getMessage());
            return $this->json([
                'success' => false,
                'message' => 'Internal server error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crée une nouvelle spécialisation
     */
    #[Route('/specializations', name: 'api_specializations_create', methods: ['POST'])]
    #[IsGranted('ROLE_RECRUITER')]
    public function createSpecialization(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!isset($data['name'], $data['domainId'])) {
            return $this->json(['success' => false, 'message' => 'Champs requis manquants'], 400);
        }
        $domain = $this->domainRepository->find($data['domainId']);
        if (!$domain) {
            return $this->json(['success' => false, 'message' => 'Domaine non trouvé'], 404);
        }
        $specialization = new Specialization();
        $specialization->setName($data['name']);
        $specialization->setDomain($domain);
        $this->entityManager->persist($specialization);
        $this->entityManager->flush();
        return $this->json([
            'success' => true,
            'data' => [
                'specialization' => [
                    'id' => $specialization->getId(),
                    'name' => $specialization->getName(),
                    'domain' => [
                        'id' => $domain->getId(),
                        'name' => $domain->getName(),
                    ]
                ]
            ]
        ], 201);
    }

    /**
     * Supprime une spécialisation
     */
    #[Route('/specializations/{id}', name: 'api_specializations_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_RECRUITER')]
    public function deleteSpecialization(int $id): JsonResponse
    {
        try {
            $this->logger->info('Attempting to delete specialization', ['id' => $id]);
            
            $specialization = $this->specializationRepository->find($id);
            if (!$specialization) {
                $this->logger->error('Specialization not found', ['id' => $id]);
                return $this->json([
                    'success' => false,
                    'message' => 'Spécialisation non trouvée'
                ], 404);
            }

            // Check if any formations are using this specialization
            $formations = $this->formationRepository->findBy(['specialization' => $specialization]);
            if (count($formations) > 0) {
                $this->logger->warning('Cannot delete specialization in use', [
                    'id' => $id,
                    'formationCount' => count($formations)
                ]);
                return $this->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer cette spécialisation car elle est utilisée par ' . count($formations) . ' formation(s)',
                    'formationsCount' => count($formations)
                ], 400);
            }

            $this->entityManager->remove($specialization);
            $this->entityManager->flush();

            $this->logger->info('Specialization deleted successfully', ['id' => $id]);
            return $this->json([
                'success' => true,
                'message' => 'Spécialisation supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            $this->logger->error('Error deleting specialization: ' . $e->getMessage(), [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la spécialisation',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}