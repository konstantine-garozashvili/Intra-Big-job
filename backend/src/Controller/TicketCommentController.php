<?php

namespace App\Controller;

use App\Entity\Ticket;
use App\Entity\TicketComment;
use App\Entity\User;
use App\Repository\TicketCommentRepository;
use App\Repository\TicketRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/tickets/{id}/comments')]
class TicketCommentController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;
    private TicketRepository $ticketRepository;
    private TicketCommentRepository $commentRepository;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        TicketRepository $ticketRepository,
        TicketCommentRepository $commentRepository
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->ticketRepository = $ticketRepository;
        $this->commentRepository = $commentRepository;
    }

    #[Route('', methods: ['GET'])]
    public function getTicketComments(string $id): JsonResponse
    {
        $ticket = $this->ticketRepository->find((int)$id);
        
        if (!$ticket) {
            return $this->json(['message' => 'Ticket non trouvé'], Response::HTTP_NOT_FOUND);
        }
        
        /** @var User $user */
        $user = $this->getUser();
        
        // Check if user is admin or the creator of the ticket
        $isAdmin = false;
        foreach ($user->getUserRoles() as $userRole) {
            if (in_array($userRole->getRole()->getName(), ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])) {
                $isAdmin = true;
                break;
            }
        }
        
        if (!$isAdmin && $ticket->getCreator()->getId() !== $user->getId()) {
            return $this->json(['message' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }
        
        $comments = $this->commentRepository->findByTicket($ticket->getId());
        
        return $this->json([
            'success' => true,
            'comments' => $comments
        ], Response::HTTP_OK, [], ['groups' => 'comment:read']);
    }

    #[Route('', methods: ['POST'])]
    public function addComment(string $id, Request $request): JsonResponse
    {
        try {
            error_log("addComment called for ticket ID: " . $id);
            
            $ticket = $this->ticketRepository->find((int)$id);
            
            if (!$ticket) {
                error_log("Ticket not found: " . $id);
                return $this->json(['message' => 'Ticket non trouvé'], Response::HTTP_NOT_FOUND);
            }
            
            error_log("Found ticket: ID=" . $ticket->getId() . ", Title=" . $ticket->getTitle());
            
            /** @var User $user */
            $user = $this->getUser();
            error_log("User authenticated: ID=" . $user->getId() . ", Email=" . $user->getEmail());
            
            // Check if user is admin or the creator of the ticket - check both ways
            $isAdmin = false;
            
            // Method 1: Check directly on the security user
            if ($this->isGranted('ROLE_ADMIN') || $this->isGranted('ROLE_SUPER_ADMIN')) {
                error_log("Admin check via isGranted: TRUE");
                $isAdmin = true;
            } else {
                error_log("Admin check via isGranted: FALSE");
                
                // Method 2: Check via user roles as a fallback
                foreach ($user->getUserRoles() as $userRole) {
                    $roleName = $userRole->getRole()->getName();
                    error_log("User role: " . $roleName);
                    if (in_array($roleName, ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])) {
                        error_log("Admin role found: " . $roleName);
                        $isAdmin = true;
                        break;
                    }
                }
            }
            
            error_log("Admin check final result: " . ($isAdmin ? 'Is Admin' : 'Not Admin'));
            error_log("Creator check: User ID=" . $user->getId() . ", Ticket Creator ID=" . $ticket->getCreator()->getId());
            error_log("Creator match: " . ($ticket->getCreator()->getId() === $user->getId() ? 'Yes' : 'No'));
            
            if (!$isAdmin && $ticket->getCreator()->getId() !== $user->getId()) {
                error_log("Access denied: User is not admin and not ticket creator");
                return $this->json(['message' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
            }
            
            $data = json_decode($request->getContent(), true);
            error_log("Comment data received: " . json_encode($data));
            
            if (!isset($data['content']) || empty(trim($data['content']))) {
                error_log("Comment content is empty or missing");
                return $this->json(['message' => 'Le contenu du commentaire est requis'], Response::HTTP_BAD_REQUEST);
            }
            
            $comment = new TicketComment();
            $comment->setContent($data['content']);
            $comment->setTicket($ticket);
            $comment->setAuthor($user);
            
            // Set isFromAdmin based on user role
            if (isset($data['isFromAdmin']) && $data['isFromAdmin'] && $isAdmin) {
                error_log("Setting comment as admin comment");
                $comment->setIsFromAdmin(true);
            } else {
                $comment->setIsFromAdmin(false);
            }
            
            error_log("Persisting comment");
            $this->entityManager->persist($comment);
            $this->entityManager->flush();
            
            // Also update the ticket's updatedAt timestamp
            $ticket->setUpdatedAt(new \DateTimeImmutable());
            $this->entityManager->flush();
            
            error_log("Comment added successfully");
            return $this->json([
                'success' => true,
                'message' => 'Commentaire ajouté avec succès',
                'comment' => $comment
            ], Response::HTTP_CREATED, [], ['groups' => 'comment:read']);
            
        } catch (\Exception $e) {
            error_log("Exception in addComment: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Erreur serveur: ' . $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 