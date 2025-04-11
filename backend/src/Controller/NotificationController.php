<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\Routing\Attribute\Route;

class NotificationController extends AbstractController{
    #[Route('/publish', name: 'publish')]
    public function publish(HubInterface $hub): Response
    {
        $topic = 'https://example.com/my-private-topic';
        $data = [
            'status' => '🔔 NOUVELLE NOTIFICATION: Le tacos est vraiment bon!', 
            'time' => time(),
            'id' => uniqid()
        ];
        
        // Créer la mise à jour avec le topic et les données
        $update = new Update(
            $topic,
            json_encode($data),
            false // private = false, donc c'est public (important pour les tests)
        );

        // Publier la mise à jour
        $hub->publish($update);

        return new Response(json_encode([
            'success' => true,
            'message' => 'Le tacos est vraiment bon!',
            'topic' => $topic,
            'data' => $data
        ]), 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => 'http://localhost:5173',
            'Access-Control-Allow-Credentials' => 'true'
        ]);
    }

    #[Route('/mercure-info', name: 'mercure_info')]
    public function mercureInfo(): Response
    {
        $mercureUrl = $_ENV['MERCURE_URL'] ?? 'Not configured';
        $mercurePublicUrl = $_ENV['MERCURE_PUBLIC_URL'] ?? 'Not configured';
        
        return new Response(json_encode([
            'mercure_url' => $mercureUrl,
            'mercure_public_url' => $mercurePublicUrl,
            'topic' => 'https://example.com/my-private-topic'
        ]), 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => 'http://localhost:5173',
            'Access-Control-Allow-Credentials' => 'true'
        ]);
    }

    #[Route('/notify-document', name: 'notify_document', methods: ['POST', 'OPTIONS'])]
    public function notifyDocument(Request $request, HubInterface $hub): Response
    {
        // Gérer les requêtes préflight OPTIONS pour CORS
        if ($request->getMethod() === 'OPTIONS') {
            return new Response('', 200, [
                'Access-Control-Allow-Origin' => 'http://localhost:5173',
                'Access-Control-Allow-Methods' => 'POST, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials' => 'true',
                'Access-Control-Max-Age' => '3600'
            ]);
        }
        
        // Récupérer les données du document depuis la requête
        $content = json_decode($request->getContent(), true);
        
        if (!isset($content['documentId']) || !isset($content['documentName'])) {
            return new Response(json_encode([
                'success' => false,
                'message' => 'Les données du document sont manquantes'
            ]), 400, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => 'http://localhost:5173',
                'Access-Control-Allow-Credentials' => 'true'
            ]);
        }
        
        // Définir le topic spécifique pour les documents
        $topic = 'https://example.com/documents';
        
        // Créer les données de notification
        $data = [
            'type' => 'document_added',
            'documentId' => $content['documentId'],
            'documentName' => $content['documentName'],
            'addedBy' => $content['addedBy'] ?? 'Utilisateur',
            'timestamp' => time()
        ];
        
        // Créer la mise à jour
        $update = new Update(
            $topic,
            json_encode($data),
            false // Public pour que tous les utilisateurs concernés puissent voir
        );
        
        // Publier la mise à jour
        $hub->publish($update);
        
        return new Response(json_encode([
            'success' => true,
            'message' => 'Notification de document publiée',
            'topic' => $topic,
            'data' => $data
        ]), 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => 'http://localhost:5173',
            'Access-Control-Allow-Credentials' => 'true'
        ]);
    }
}

?>