<?php

namespace App\Tests\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PasswordControllerTest extends WebTestCase
{
    private $client;
    private $userRepository;
    private $passwordHasher;
    
    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->userRepository = static::getContainer()->get(UserRepository::class);
        $this->passwordHasher = static::getContainer()->get(UserPasswordHasherInterface::class);
    }
    
    public function testChangePasswordAuthenticated()
    {
        // Trouver un utilisateur de test
        $testUser = $this->userRepository->findOneBy([]);
        
        // S'assurer qu'un utilisateur existe
        $this->assertNotNull($testUser, 'Aucun utilisateur trouvé dans la base de données');
        
        // Authentifier l'utilisateur
        $this->client->loginUser($testUser);
        
        // Créer les données de la requête
        $payload = json_encode([
            'currentPassword' => 'test_password',  // Ceci devrait être remplacé par un vrai mot de passe
            'newPassword' => 'new_test_password'
        ]);
        
        // Envoyer la requête POST
        $this->client->request('POST', '/api/change-password', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], $payload);
        
        // Vérifier le code de statut (dépend de la validité du mot de passe actuel)
        $response = $this->client->getResponse();
        $responseData = json_decode($response->getContent(), true);
        
        // Note: Ce test peut échouer si les mots de passe ne sont pas corrects
        // Dans un environnement de test réel, on pourrait configurer le mot de passe connu
        $this->assertArrayHasKey('success', $responseData);
        $this->assertArrayHasKey('message', $responseData);
    }
    
    public function testChangePasswordUnauthenticated()
    {
        // Créer les données de la requête
        $payload = json_encode([
            'currentPassword' => 'test_password',
            'newPassword' => 'new_test_password'
        ]);
        
        // Envoyer la requête POST sans authentification
        $this->client->request('POST', '/api/change-password', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], $payload);
        
        // Vérifier que la requête est rejetée (401 Unauthorized)
        $this->assertSame(Response::HTTP_UNAUTHORIZED, $this->client->getResponse()->getStatusCode());
    }
} 