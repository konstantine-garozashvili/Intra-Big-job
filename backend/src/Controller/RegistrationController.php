<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Psr\Log\LoggerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request, 
        EntityManagerInterface $entityManager, 
        LoggerInterface $logger,
        UserPasswordHasherInterface $passwordHasher
    ): Response
    {
        // Log les données brutes reçues
        $rawContent = $request->getContent();
        $logger->info('Données brutes reçues:', ['content' => $rawContent]);

        $data = json_decode($rawContent, true);
        
        // Vérification des données reçues
        if (!$data) {
            $logger->error('Données JSON invalides:', [
                'raw_content' => $rawContent,
                'json_last_error' => json_last_error_msg()
            ]);
            
            return $this->json([
                'error' => 'Données JSON invalides',
                'details' => json_last_error_msg(),
                'received' => $rawContent
            ], Response::HTTP_BAD_REQUEST);
        }

        // Log les données décodées
        $logger->info('Données décodées:', ['data' => $data]);

        try {
            $user = new User();
            
            // Validation des champs requis
            $requiredFields = ['firstName', 'lastName', 'email'];
            $missingFields = [];
            
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    $missingFields[] = $field;
                }
            }
            
            if (!empty($missingFields)) {
                return $this->json([
                    'error' => 'Champs requis manquants',
                    'missing_fields' => $missingFields
                ], Response::HTTP_BAD_REQUEST);
            }

            $user->setFirstName($data['firstName']);
            $user->setLastName($data['lastName']);
            $user->setBirthDate(new \DateTime($data['birthDate'] ?? 'now'));
            $user->setAddress($data['address'] ?? '');
            $user->setPostalCode($data['postalCode'] ?? '');
            $user->setCity($data['city'] ?? '');
            $user->setEmail($data['email']);
            $user->setPhone($data['phone'] ?? '');
            $user->setNationality($data['nationality'] ?? '');
            $user->setEducationLevel($data['educationLevel'] ?? '');
            
            // Générer un username basé sur l'email
            $user->setUsername($data['email']);
            
            // Générer un mot de passe temporaire et le hacher
            $tempPassword = 'temp_' . uniqid();
            $hashedPassword = $passwordHasher->hashPassword($user, $tempPassword);
            $user->setPassword($hashedPassword);

            $entityManager->persist($user);
            $entityManager->flush();

            $logger->info('Utilisateur créé avec succès:', ['id' => $user->getId()]);

            return $this->json([
                'message' => 'Utilisateur enregistré avec succès',
                'id' => $user->getId(),
                'temp_password' => $tempPassword // À supprimer en production, uniquement pour les tests
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            $logger->error('Erreur lors de l\'enregistrement:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data' => $data
            ]);

            return $this->json([
                'error' => 'Erreur lors de l\'enregistrement',
                'details' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }
} 