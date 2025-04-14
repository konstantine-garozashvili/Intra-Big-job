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
            'status' => $content['status'] ?? 'PENDING',
            'documentType' => $content['documentType'] ?? null,
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

    #[Route('/notify-cv-upload', name: 'notify_cv_upload', methods: ['POST', 'OPTIONS'])]
    public function notifyCvUpload(Request $request, HubInterface $hub): Response
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
        
        if (!isset($content['documentId']) || !isset($content['userId'])) {
            return new Response(json_encode([
                'success' => false,
                'message' => 'Les données du CV sont manquantes'
            ]), 400, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => 'http://localhost:5173',
                'Access-Control-Allow-Credentials' => 'true'
            ]);
        }
        
        // Topic spécifique pour l'utilisateur (notifications personnelles)
        $userTopic = 'https://example.com/users/' . $content['userId'];
        
        // Topic pour les administrateurs (pour voir tous les nouveaux CV)
        $adminTopic = 'https://example.com/admin/documents';
        
        // Données de notification pour l'utilisateur
        $userData = [
            'type' => 'cv_uploaded',
            'documentId' => $content['documentId'],
            'documentName' => $content['documentName'] ?? 'CV',
            'message' => 'Votre CV a été téléchargé avec succès',
            'status' => $content['status'] ?? 'APPROVED',
            'timestamp' => time()
        ];
        
        // Données de notification pour les administrateurs
        $adminData = [
            'type' => 'new_cv_uploaded',
            'documentId' => $content['documentId'],
            'documentName' => $content['documentName'] ?? 'CV',
            'userId' => $content['userId'],
            'userName' => $content['userName'] ?? 'Utilisateur',
            'timestamp' => time()
        ];
        
        // Créer et publier la mise à jour pour l'utilisateur
        $userUpdate = new Update(
            $userTopic,
            json_encode($userData),
            true // Privé - seulement pour l'utilisateur concerné
        );
        $hub->publish($userUpdate);
        
        // Créer et publier la mise à jour pour les administrateurs
        $adminUpdate = new Update(
            $adminTopic,
            json_encode($adminData),
            false // Public pour tous les administrateurs
        );
        $hub->publish($adminUpdate);
        
        return new Response(json_encode([
            'success' => true,
            'message' => 'Notifications de CV publiées',
            'userTopic' => $userTopic,
            'adminTopic' => $adminTopic
        ]), 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => 'http://localhost:5173',
            'Access-Control-Allow-Credentials' => 'true'
        ]);
    }

    #[Route('/notify-document-status-change', name: 'notify_document_status', methods: ['POST', 'OPTIONS'])]
    public function notifyDocumentStatusChange(Request $request, HubInterface $hub): Response
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
        
        if (!isset($content['documentId']) || !isset($content['status']) || !isset($content['userId'])) {
            return new Response(json_encode([
                'success' => false,
                'message' => 'Les données du document sont manquantes'
            ]), 400, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => 'http://localhost:5173',
                'Access-Control-Allow-Credentials' => 'true'
            ]);
        }
        
        // Topic spécifique pour l'utilisateur
        $userTopic = 'https://example.com/users/' . $content['userId'];
        
        // Créer les données de notification
        $data = [
            'type' => 'document_status_changed',
            'documentId' => $content['documentId'],
            'documentName' => $content['documentName'] ?? 'Document',
            'oldStatus' => $content['oldStatus'] ?? null,
            'newStatus' => $content['status'],
            'comment' => $content['comment'] ?? null,
            'timestamp' => time()
        ];
        
        // Message adapté selon le statut
        if ($content['status'] === 'APPROVED') {
            $data['message'] = 'Votre document a été approuvé';
        } elseif ($content['status'] === 'REJECTED') {
            $data['message'] = 'Votre document a été rejeté' . ($content['comment'] ? ' : ' . $content['comment'] : '');
        }
        
        // Créer la mise à jour
        $update = new Update(
            $userTopic,
            json_encode($data),
            true // Privé - seulement pour l'utilisateur concerné
        );
        
        // Publier la mise à jour
        $hub->publish($update);
        
        return new Response(json_encode([
            'success' => true,
            'message' => 'Notification de changement de statut publiée',
            'topic' => $userTopic,
            'data' => $data
        ]), 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => 'http://localhost:5173',
            'Access-Control-Allow-Credentials' => 'true'
        ]);
    }

    #[Route('/notify-document-deletion', name: 'notify_document_deletion', methods: ['POST', 'OPTIONS'])]
    public function notifyDocumentDeletion(Request $request, HubInterface $hub): Response
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
        
        if (!isset($content['documentId']) || !isset($content['userId']) || !isset($content['documentName'])) {
            return new Response(json_encode([
                'success' => false,
                'message' => 'Les données du document sont manquantes'
            ]), 400, [
                'Content-Type' => 'application/json',
                'Access-Control-Allow-Origin' => 'http://localhost:5173',
                'Access-Control-Allow-Credentials' => 'true'
            ]);
        }
        
        // Topic spécifique pour l'utilisateur
        $userTopic = 'https://example.com/users/' . $content['userId'];
        
        // Topic pour les administrateurs (si besoin)
        $adminTopic = 'https://example.com/admin/documents';
        
        // Créer les données de notification pour l'utilisateur
        $userData = [
            'type' => 'document_deleted',
            'documentId' => $content['documentId'],
            'documentName' => $content['documentName'],
            'message' => 'Votre document a été supprimé',
            'timestamp' => time()
        ];
        
        // Créer les données de notification pour les administrateurs (si nécessaire)
        $adminData = [
            'type' => 'document_deleted',
            'documentId' => $content['documentId'],
            'documentName' => $content['documentName'],
            'userId' => $content['userId'],
            'userName' => $content['userName'] ?? 'Utilisateur',
            'deletedBy' => $content['deletedBy'] ?? $content['userName'] ?? 'Utilisateur',
            'timestamp' => time()
        ];
        
        // Créer et publier la mise à jour pour l'utilisateur
        $userUpdate = new Update(
            $userTopic,
            json_encode($userData),
            true // Privé - seulement pour l'utilisateur concerné
        );
        $hub->publish($userUpdate);
        
        // Publier également pour les administrateurs si nécessaire
        if (isset($content['notifyAdmin']) && $content['notifyAdmin'] === true) {
            $adminUpdate = new Update(
                $adminTopic,
                json_encode($adminData),
                false // Public pour tous les administrateurs
            );
            $hub->publish($adminUpdate);
        }
        
        return new Response(json_encode([
            'success' => true,
            'message' => 'Notification de suppression publiée',
            'userTopic' => $userTopic
        ]), 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => 'http://localhost:5173',
            'Access-Control-Allow-Credentials' => 'true'
        ]);
    }
}

?>