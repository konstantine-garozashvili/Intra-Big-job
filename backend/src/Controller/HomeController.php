<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\RequestStack;

class HomeController extends AbstractController
{
    private $requestStack;

    public function __construct(RequestStack $requestStack)
    {
        $this->requestStack = $requestStack;
    }

    #[Route('/', name: 'app_home')]
    public function index(): Response
    {
        // Si la requête demande du JSON, renvoyer une réponse API
        if ($this->isRequestingJson()) {
            return $this->json([
                'status' => 'success',
                'message' => 'Bienvenue sur l\'API Intra Big Job',
                'documentation' => '/api/doc',
                'version' => '1.0.0',
            ]);
        }

        // Sinon, renvoyer une page HTML
        return $this->render('home/index.html.twig', [
            'controller_name' => 'HomeController',
        ]);
    }

    /**
     * Vérifie si la requête demande du JSON
     */
    private function isRequestingJson(): bool
    {
        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return false;
        }

        $acceptHeader = $request->headers->get('Accept');
        if (str_contains($acceptHeader, 'application/json')) {
            return true;
        }

        $format = $request->getRequestFormat();
        return $format === 'json';
    }
} 