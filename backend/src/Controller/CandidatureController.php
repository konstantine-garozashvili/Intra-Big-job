<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Repository\CandidatureRepository;

class CandidatureController extends AbstractController
{
    #[Route('/api/candidatures', name: 'api_candidatures', methods: ['GET'])]
    public function index(CandidatureRepository $candidatureRepository): JsonResponse
    {

        $candidatures = $candidatureRepository->findAll();
        $data = [];
        foreach ($candidatures as $candidature) {
            $data[] = [
                'id' => $candidature->getId(),
                'user' => $candidature->getUser()->getId(),
                'statut' => $candidature->getUser()->getStatut()->getLibelle(),
            ];
      

        return $this->json($data);
    }
}

} 



?>


