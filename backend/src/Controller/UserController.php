<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
class UserController extends AbstractController
{
    #[Route('/register', name: 'app_register', methods: ['POST'])]
    public function register(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        try {
            // Récupérer les données
            $data = json_decode($request->getContent(), true);

            // Valider les données basiques
            if (!isset($data['email']) || !isset($data['password']) || !isset($data['username'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'Données incomplètes. Email, mot de passe et nom d\'utilisateur requis.'
                ], 400);
            }

            // Créer un nouvel utilisateur simplifié
            $user = new User();
            $user->setEmail($data['email']);
            $user->setUsername($data['username']);

            // Hasher le mot de passe
            $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);

            // Ajouter les champs supplémentaires s'ils sont présents
            if (isset($data['firstName']) && $data['firstName']) {
                $user->setFirstName($data['firstName']);
            }
            
            if (isset($data['lastName']) && $data['lastName']) {
                $user->setLastName($data['lastName']);
            }
            
            if (isset($data['address']) && $data['address']) {
                $user->setAddress($data['address']);
            }
            
            if (isset($data['postalCode']) && $data['postalCode']) {
                $user->setPostalCode($data['postalCode']);
            }
            
            if (isset($data['city']) && $data['city']) {
                $user->setCity($data['city']);
            }
            
            if (isset($data['phone']) && $data['phone']) {
                $user->setPhone($data['phone']);
            }
            
            if (isset($data['birthDate']) && $data['birthDate']) {
                $birthDate = new \DateTime($data['birthDate']);
                $user->setBirthDate($birthDate);
            }
            
            if (isset($data['nationality']) && $data['nationality']) {
                $user->setNationality($data['nationality']);
            }
            
            if (isset($data['educationLevel']) && $data['educationLevel']) {
                $user->setEducationLevel($data['educationLevel']);
            }

            // Sauvegarder l'utilisateur
            $entityManager->persist($user);
            $entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => 'Inscription réussie !',
                'user' => [
                    'id' => $user->getId(),
                    'username' => $user->getUsername(),
                    'email' => $user->getEmail()
                ]
            ], 201);
        } catch (\Exception $e) {
            // Log l'erreur pour débogage
            error_log($e->getMessage());

            return $this->json([
                'success' => false,
                'message' => 'Une erreur est survenue: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/test', name: 'app_test', methods: ['GET'])]
    public function test(): JsonResponse
    {
        return $this->json([
            'success' => true,
            'message' => 'API Symfony fonctionnelle !'
        ]);
    }
}