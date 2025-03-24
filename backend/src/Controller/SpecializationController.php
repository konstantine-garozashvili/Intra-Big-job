<?php

namespace App\Controller;

use App\Entity\Specialization;
use App\Domains\Global\Repository\SpecializationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/specialization')]
class SpecializationController extends AbstractController
{
    private $specializationRepository;
    
    public function __construct(SpecializationRepository $specializationRepository)
    {
        $this->specializationRepository = $specializationRepository;
    }
    
    /**
     * Get a specialization by ID with its domain
     */
    #[Route('/{id}', name: 'api_specialization_get', methods: ['GET'])]
    public function getSpecialization(int $id): JsonResponse
    {
        $specialization = $this->specializationRepository->find($id);
        
        if (!$specialization) {
            return $this->json([
                'success' => false,
                'message' => 'Specialization not found'
            ], 404);
        }
        
        // Build the response with specialization and domain data
        $response = [
            'success' => true,
            'data' => [
                'id' => $specialization->getId(),
                'name' => $specialization->getName(),
                'domain' => $specialization->getDomain() ? [
                    'id' => $specialization->getDomain()->getId(),
                    'name' => $specialization->getDomain()->getName(),
                ] : null,
            ]
        ];
        
        return $this->json($response);
    }
    
    /**
     * Get all specializations
     */
    #[Route('', name: 'api_specialization_list', methods: ['GET'])]
    public function getAllSpecializations(): JsonResponse
    {
        $specializations = $this->specializationRepository->findAll();
        
        $data = [];
        foreach ($specializations as $specialization) {
            $data[] = [
                'id' => $specialization->getId(),
                'name' => $specialization->getName(),
                'domain' => $specialization->getDomain() ? [
                    'id' => $specialization->getDomain()->getId(),
                    'name' => $specialization->getDomain()->getName(),
                ] : null,
            ];
        }
        
        return $this->json([
            'success' => true,
            'data' => $data
        ]);
    }
    
    /**
     * Get specializations by domain ID
     */
    #[Route('/by-domain/{domainId}', name: 'api_specialization_by_domain', methods: ['GET'])]
    public function getSpecializationsByDomain(int $domainId): JsonResponse
    {
        $specializations = $this->specializationRepository->findByDomain($domainId);
        
        $data = [];
        foreach ($specializations as $specialization) {
            $data[] = [
                'id' => $specialization->getId(),
                'name' => $specialization->getName(),
                'domain' => $specialization->getDomain() ? [
                    'id' => $specialization->getDomain()->getId(),
                    'name' => $specialization->getDomain()->getName(),
                ] : null,
            ];
        }
        
        return $this->json([
            'success' => true,
            'data' => $data
        ]);
    }
} 