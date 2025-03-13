<?php

namespace App\Controller;

use App\Entity\Message;
use App\Repository\MessageRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;

#[Route('/api/messages')]
class MessageController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;
    private MessageRepository $messageRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        MessageRepository $messageRepository
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->messageRepository = $messageRepository;
    }

    #[Route('', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $limit = $request->query->getInt('limit', 20);
        $offset = $request->query->getInt('offset', 0);
        
        $messages = $this->messageRepository->findGlobalMessages($limit, $offset);
        
        $context = [
            'groups' => ['message:read'],
            AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function ($object) {
                return $object->getId();
            },
            'enable_max_depth' => true,
            'json_encode_options' => JSON_PRETTY_PRINT
        ];
        
        return $this->json([
            'messages' => json_decode($this->serializer->serialize($messages, 'json', $context), true)
        ]);
    }

    #[Route('/recent', methods: ['GET'])]
    public function recent(): JsonResponse
    {
        $messages = $this->messageRepository->findRecentGlobalMessages();
        
        $context = [
            'groups' => ['message:read'],
            AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function ($object) {
                return $object->getId();
            },
            'enable_max_depth' => true,
            'json_encode_options' => JSON_PRETTY_PRINT
        ];
        
        return $this->json([
            'messages' => json_decode($this->serializer->serialize($messages, 'json', $context), true)
        ]);
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        try {
            // Get the user from the token
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            // Get the request data
            $data = json_decode($request->getContent(), true);
            
            // Validate required fields
            if (!isset($data['content']) || empty($data['content'])) {
                return $this->json(['message' => 'Content is required'], Response::HTTP_BAD_REQUEST);
            }
            
            // Create a new message
            $message = new Message();
            $message->setSender($user);
            $message->setContent($data['content']);
            $message->setIsGlobal(true);
            $message->addReadBy($user->getId());
            
            // Save to database
            $this->entityManager->persist($message);
            $this->entityManager->flush();
            
            $context = [
                'groups' => ['message:read'],
                AbstractNormalizer::CIRCULAR_REFERENCE_HANDLER => function ($object) {
                    return $object->getId();
                },
                'enable_max_depth' => true,
                'json_encode_options' => JSON_PRETTY_PRINT
            ];
            
            // Return success response with the created message
            return $this->json([
                'message' => 'Message sent successfully',
                'data' => json_decode($this->serializer->serialize($message, 'json', $context), true)
            ], Response::HTTP_CREATED);
            
        } catch (\Exception $e) {
            // Return error response
            return $this->json([
                'message' => 'Error sending message: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/read', methods: ['POST'])]
    public function markAsRead(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
        }

        $message = $this->messageRepository->find($id);
        if (!$message) {
            return $this->json(['message' => 'Message not found'], Response::HTTP_NOT_FOUND);
        }

        // Mark message as read by current user
        $message->addReadBy($user->getId());
        $this->entityManager->flush();

        return $this->json([
            'message' => 'Message marked as read'
        ]);
    }
}
