<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class AddressApiController extends AbstractController
{
    private string $apiAddressUrl;

    public function __construct()
    {
        $this->apiAddressUrl = 'https://api-adresse.data.gouv.fr';
    }

    /**
     * Proxy pour l'API de recherche d'adresses
     */
    #[Route('/address/search', name: 'api_address_search', methods: ['GET'])]
    public function searchAddress(Request $request): JsonResponse
    {
        // Récupération des paramètres de la requête
        $query = $request->query->get('q');
        $limit = $request->query->get('limit', 5);
        $type = $request->query->get('type', 'housenumber');
        $autocomplete = $request->query->get('autocomplete', 1);

        if (!$query || strlen($query) < 3) {
            return $this->json(['features' => []], 200);
        }

        try {
            // Construire l'URL de l'API
            $url = sprintf(
                '%s/search?q=%s&limit=%d&type=%s&autocomplete=%d',
                $this->apiAddressUrl,
                urlencode($query),
                $limit,
                $type,
                $autocomplete
            );

            // Utiliser curl pour faire l'appel API
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            if (curl_error($ch)) {
                throw new \Exception('Erreur cURL: ' . curl_error($ch));
            }
            
            curl_close($ch);
            
            if ($httpCode >= 400) {
                throw new \Exception('Erreur API Adresse: Code HTTP ' . $httpCode);
            }
            
            // Décoder et retourner la réponse
            $data = json_decode($response, true);
            return $this->json($data, 200);
            
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue lors de la recherche d\'adresse',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Proxy pour l'API de géocodage inverse
     */
    #[Route('/address/reverse', name: 'api_address_reverse', methods: ['GET'])]
    public function reverseGeocode(Request $request): JsonResponse
    {
        // Récupération des paramètres de la requête
        $lon = $request->query->get('lon');
        $lat = $request->query->get('lat');

        if (!$lon || !$lat) {
            return $this->json([
                'error' => 'Les coordonnées (lon, lat) sont requises'
            ], 400);
        }

        try {
            // Construire l'URL de l'API
            $url = sprintf(
                '%s/reverse?lon=%s&lat=%s',
                $this->apiAddressUrl,
                urlencode($lon),
                urlencode($lat)
            );

            // Utiliser curl pour faire l'appel API
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            if (curl_error($ch)) {
                throw new \Exception('Erreur cURL: ' . curl_error($ch));
            }
            
            curl_close($ch);
            
            if ($httpCode >= 400) {
                throw new \Exception('Erreur API Adresse: Code HTTP ' . $httpCode);
            }
            
            // Décoder et retourner la réponse
            $data = json_decode($response, true);
            return $this->json($data, 200);
            
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Une erreur est survenue lors du géocodage inverse',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
