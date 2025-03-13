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

#[Route('/api/chat')]
class ChatController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private MessageRepository $messageRepository;
    private SerializerInterface $serializer;

    public function __construct(
        EntityManagerInterface $entityManager,
        MessageRepository $messageRepository,
        SerializerInterface $serializer
    ) {
        $this->entityManager = $entityManager;
        $this->messageRepository = $messageRepository;
        $this->serializer = $serializer;
    }

    #[Route('/messages', name: 'app_chat_messages', methods: ['GET'])]
    public function getMessages(): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
        $user = $this->getUser();

        // Get global messages
        $messages = $this->messageRepository->findGlobalMessages(50, 0);

        // Format messages for the frontend
        $formattedMessages = [];
        foreach ($messages as $message) {
            $sender = $message->getSender();
            $roles = [];
            
            foreach ($sender->getUserRoles() as $userRole) {
                $roles[] = $userRole->getRole()->getName();
            }
            
            $isTeacher = in_array('ROLE_TEACHER', $roles);
            
            $formattedMessages[] = [
                'id' => $message->getId(),
                'text' => $message->getContent(),
                'sender' => $sender->getFirstName() . ' ' . $sender->getLastName() . ($isTeacher ? ' (Teacher)' : ' (Student)'),
                'senderId' => $sender->getId(),
                'timestamp' => $message->getCreatedAt()->format('c'),
                'isMine' => $sender->getId() === $user->getId(),
                'read' => $message->isReadBy($user->getId())
            ];
        }

        // Mark messages as read
        foreach ($messages as $message) {
            if (!$message->isReadBy($user->getId())) {
                $message->addReadBy($user->getId());
            }
        }
        
        $this->entityManager->flush();

        return $this->json([
            'messages' => $formattedMessages
        ]);
    }

    #[Route('/messages', name: 'app_chat_send_message', methods: ['POST'])]
    public function sendMessage(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
        $user = $this->getUser();
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['text']) || empty(trim($data['text']))) {
            return $this->json([
                'error' => 'Message text is required'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        $message = new Message();
        $message->setSender($user);
        $message->setContent($data['text']);
        $message->setIsGlobal(true);
        $message->addReadBy($user->getId());
        
        $this->entityManager->persist($message);
        $this->entityManager->flush();
        
        // Get roles for the sender
        $roles = [];
        foreach ($user->getUserRoles() as $userRole) {
            $roles[] = $userRole->getRole()->getName();
        }
        
        $isTeacher = in_array('ROLE_TEACHER', $roles);
        
        return $this->json([
            'message' => [
                'id' => $message->getId(),
                'text' => $message->getContent(),
                'sender' => $user->getFirstName() . ' ' . $user->getLastName() . ($isTeacher ? ' (Teacher)' : ' (Student)'),
                'senderId' => $user->getId(),
                'timestamp' => $message->getCreatedAt()->format('c'),
                'isMine' => true,
                'read' => true
            ]
        ], Response::HTTP_CREATED);
    }

    #[Route('/messages/read', name: 'app_chat_mark_read', methods: ['POST'])]
    public function markMessagesAsRead(Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
        $user = $this->getUser();
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['messageIds']) || !is_array($data['messageIds'])) {
            return $this->json([
                'error' => 'Message IDs are required'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        $messageIds = $data['messageIds'];
        $messages = $this->messageRepository->findBy(['id' => $messageIds]);
        
        foreach ($messages as $message) {
            if (!$message->isReadBy($user->getId())) {
                $message->addReadBy($user->getId());
            }
        }
        
        $this->entityManager->flush();
        
        return $this->json([
            'success' => true,
            'markedAsRead' => count($messages)
        ]);
    }

    #[Route('/messages/unread', name: 'app_chat_unread_count', methods: ['GET'])]
    public function getUnreadCount(): JsonResponse
    {
        $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
        $user = $this->getUser();
        
        $unreadMessages = $this->messageRepository->findUnreadMessagesForUser($user->getId());
        
        return $this->json([
            'unreadCount' => count($unreadMessages)
        ]);
    }
}
