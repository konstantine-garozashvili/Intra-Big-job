<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Repository\CandidatureRepository;
use App\Entity\UserSituationType;
use Doctrine\ORM\EntityManagerInterface;

#[Route('/api')]
class CandidatureController extends AbstractController
{
    #[Route('/candidatures', name: 'api_candidatures', methods: ['GET'])]
    public function index(CandidatureRepository $candidatureRepository): JsonResponse
    {
        try {
            $candidatures = $candidatureRepository->findAll();
            $data = [];
            foreach ($candidatures as $candidature) {
                $user = $candidature->getUser();
                
                // Créer un tableau avec les informations de base
                $candidatureData = [
                    'id' => $candidature->getId(),
                    'studentName' => $user->getFirstName() . ' ' . $user->getLastName(),
                    'type' => 'Non précisé',
                    'domaine' => 'Non précisé',
                    'specialite' => 'Non précisé',
                    'status' => 'Non défini'
                ];
                
                // Ajouter des informations supplémentaires si disponibles
                if (method_exists($user, 'getSpecialization') && $user->getSpecialization()) {
                    $candidatureData['specialite'] = $user->getSpecialization()->getName();
                    
                    if (method_exists($user->getSpecialization(), 'getDomain') && $user->getSpecialization()->getDomain()) {
                        $candidatureData['domaine'] = $user->getSpecialization()->getDomain()->getName();
                    }
                }
                
                // Vérifier si l'utilisateur a un profil étudiant avec un type de situation
                if (method_exists($user, 'getStudentProfile') && $user->getStudentProfile() && 
                    method_exists($user->getStudentProfile(), 'getSituationType') && 
                    $user->getStudentProfile()->getSituationType()) {
                    $candidatureData['status'] = $user->getStudentProfile()->getSituationType()->getName();
                }
                
                $data[] = $candidatureData;
            }
            
            return $this->json($data);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des candidatures: ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    #[Route('/situation-types', name: 'api_situation_types', methods: ['GET'])]
    public function getSituationTypes(EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            // Récupérer tous les types de situation depuis la base de données
            $situationTypes = $entityManager->getRepository(UserSituationType::class)->findAll();
            
            $data = [];
            foreach ($situationTypes as $situationType) {
                $data[] = [
                    'id' => $situationType->getId(),
                    'name' => $situationType->getName(),
                    'description' => $situationType->getDescription()
                ];
            }
            
            return $this->json([
                'success' => true,
                'count' => count($data),
                'situationTypes' => $data
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des types de situation: ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
    
    #[Route('/students-by-situation/{situationId}', name: 'api_students_by_situation', methods: ['GET'])]
    public function getStudentsBySituation(int $situationId, EntityManagerInterface $entityManager): JsonResponse
    {
        try {
            // Récupérer le type de situation
            $situationType = $entityManager->getRepository(UserSituationType::class)->find($situationId);
            
            if (!$situationType) {
                return $this->json([
                    'success' => false,
                    'message' => 'Type de situation non trouvé'
                ], JsonResponse::HTTP_NOT_FOUND);
            }
            
            // Récupérer tous les profils étudiants avec ce type de situation
            $studentProfiles = $entityManager->createQuery(
                'SELECT sp FROM App\Domains\Student\Entity\StudentProfile sp
                WHERE sp.situationType = :situationId'
            )->setParameter('situationId', $situationId)
             ->getResult();
            
            $data = [];
            foreach ($studentProfiles as $profile) {
                $user = $profile->getUser();
                
                // Récupérer la spécialisation
                $specialization = $user->getSpecialization() ? [
                    'name' => $user->getSpecialization()->getName(),
                    'domain' => $user->getSpecialization()->getDomain() ? 
                        $user->getSpecialization()->getDomain()->getName() : 'Non précisé'
                ] : ['name' => 'Non précisé', 'domain' => 'Non précisé'];
                
                $data[] = [
                    'id' => $user->getId(),
                    'studentName' => $user->getFirstName() . ' ' . $user->getLastName(),
                    'type' => $user->getUserRoles()[0]->getRole()->getName() ?? 'Non précisé',
                    'domaine' => $specialization['domain'],
                    'specialite' => $specialization['name'],
                    'status' => $situationType->getName()
                ];
            }
            
            return $this->json([
                'success' => true,
                'count' => count($data),
                'students' => $data,
                'situationType' => [
                    'id' => $situationType->getId(),
                    'name' => $situationType->getName(),
                    'description' => $situationType->getDescription()
                ]
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des étudiants par situation: ' . $e->getMessage()
            ], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
