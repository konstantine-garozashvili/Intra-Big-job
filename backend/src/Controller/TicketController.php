<?php

namespace App\Controller;

use App\Entity\Ticket;
use App\Entity\TicketService;
use App\Entity\TicketStatus;
use App\Entity\User;
use App\Repository\TicketRepository;
use App\Repository\TicketServiceRepository;
use App\Repository\TicketStatusRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use App\Repository\UserRepository;

#[Route('/api/tickets')]
class TicketController extends AbstractController
{
    private EntityManagerInterface $entityManager;
    private SerializerInterface $serializer;
    private TicketRepository $ticketRepository;
    private TicketStatusRepository $ticketStatusRepository;
    private TicketServiceRepository $ticketServiceRepository;
    private MailerInterface $mailer;

    public function __construct(
        EntityManagerInterface $entityManager,
        SerializerInterface $serializer,
        TicketRepository $ticketRepository,
        TicketStatusRepository $ticketStatusRepository,
        TicketServiceRepository $ticketServiceRepository,
        MailerInterface $mailer
    ) {
        $this->entityManager = $entityManager;
        $this->serializer = $serializer;
        $this->ticketRepository = $ticketRepository;
        $this->ticketStatusRepository = $ticketStatusRepository;
        $this->ticketServiceRepository = $ticketServiceRepository;
        $this->mailer = $mailer;
    }

    #[Route('', methods: ['GET'])]
    public function getTickets(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            
            if (!$user) {
                return $this->json([
                    'success' => false,
                    'message' => 'User not authenticated',
                    'tickets' => []
                ], Response::HTTP_UNAUTHORIZED);
            }
            
            error_log("User ID: " . $user->getId());
            error_log("User Email: " . $user->getEmail());
            
            // For admin users, get all tickets - check both ways
            $isAdmin = false;
            
            // Method 1: Check via security system
            if ($this->isGranted('ROLE_ADMIN') || $this->isGranted('ROLE_SUPER_ADMIN')) {
                error_log("Admin access granted via isGranted");
                $isAdmin = true;
            } else {
                error_log("isGranted check failed, checking user roles directly");
                
                // Method 2: Check via user roles as a fallback
                if ($user->getRoles() && is_array($user->getRoles())) {
                    error_log("User roles from getRoles(): " . implode(', ', $user->getRoles()));
                    if (in_array('ROLE_ADMIN', $user->getRoles()) || in_array('ROLE_SUPER_ADMIN', $user->getRoles())) {
                        error_log("Admin access granted via getRoles");
                        $isAdmin = true;
                    }
                }
                
                // Method 3: Check via getUserRoles if available
                if (method_exists($user, 'getUserRoles')) {
                    foreach ($user->getUserRoles() as $userRole) {
                        error_log("User role from getUserRoles: " . $userRole->getRole()->getName());
                        if (in_array($userRole->getRole()->getName(), ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])) {
                            error_log("Admin access granted via getUserRoles");
                            $isAdmin = true;
                            break;
                        }
                    }
                }
            }
            
            error_log("Is Admin: " . ($isAdmin ? 'Yes' : 'No'));
            
            // Get count of tickets directly from database
            $connection = $this->entityManager->getConnection();
            $sql = 'SELECT COUNT(*) as count FROM ticket';
            $stmt = $connection->prepare($sql);
            $result = $stmt->executeQuery();
            $totalTicketCount = $result->fetchAssociative()['count'];
            error_log("Total tickets in database: " . $totalTicketCount);
            
            if ($totalTicketCount > 0) {
                // Get sample ticket data for debugging with all fields
                $sampleSql = 'SELECT * FROM ticket LIMIT 3';
                $sampleStmt = $connection->prepare($sampleSql);
                $sampleResult = $sampleStmt->executeQuery();
                $sampleTickets = $sampleResult->fetchAllAssociative();
                
                if (!empty($sampleTickets)) {
                    error_log("Sample tickets from direct SQL: " . json_encode($sampleTickets));
                    
                    // Check for specific ticket by ID if you know one exists
                    $knownTicketId = $sampleTickets[0]['id'];
                    error_log("Looking for specific ticket with ID: " . $knownTicketId);
                    
                    $specificTicket = $this->ticketRepository->find($knownTicketId);
                    if ($specificTicket) {
                        error_log("Found ticket with repository: ID={$specificTicket->getId()}, Title={$specificTicket->getTitle()}");
                    } else {
                        error_log("ERROR: Could not find ticket with ID {$knownTicketId} using repository!");
                    }
                }
            }
            
            // Fetch tickets based on user role
            if ($isAdmin) {
                $tickets = $this->ticketRepository->findBy([], ['createdAt' => 'DESC']);
                error_log("Admin user: found " . count($tickets) . " tickets using repository");
                
                // If repository returns empty but we know there are tickets in DB, use direct SQL
                if (count($tickets) === 0 && $totalTicketCount > 0) {
                    error_log("WARNING: Database has tickets but repository returned none, using direct SQL");
                    
                    try {
                        // Get tickets directly via SQL
                        $directSql = 'SELECT t.id, t.title, t.description, t.creator_id, t.assigned_to_id, 
                                       t.status_id, t.priority, t.created_at, t.updated_at, t.resolved_at, t.service_id 
                                       FROM ticket t ORDER BY t.created_at DESC';
                        $directStmt = $connection->prepare($directSql);
                        $directResult = $directStmt->executeQuery();
                        $rawTickets = $directResult->fetchAllAssociative();
                        
                        error_log("Found " . count($rawTickets) . " tickets using direct SQL");
                        
                        // Convert raw data to ticket objects
                        $tickets = [];
                        foreach ($rawTickets as $rawTicket) {
                            $ticket = new Ticket();
                            $ticket->setId($rawTicket['id']);
                            $ticket->setTitle($rawTicket['title']);
                            $ticket->setDescription($rawTicket['description']);
                            
                            // Get creator
                            if ($rawTicket['creator_id']) {
                                $creator = $this->entityManager->getReference(User::class, $rawTicket['creator_id']);
                                $ticket->setCreator($creator);
                            }
                            
                            // Get assigned_to if exists
                            if ($rawTicket['assigned_to_id']) {
                                $assignedTo = $this->entityManager->getReference(User::class, $rawTicket['assigned_to_id']);
                                $ticket->setAssignedTo($assignedTo);
                            }
                            
                            // Get status
                            if ($rawTicket['status_id']) {
                                $status = $this->entityManager->getReference(TicketStatus::class, $rawTicket['status_id']);
                                $ticket->setStatus($status);
                            }
                            
                            // Get service if exists
                            if (!empty($rawTicket['service_id'])) {
                                $service = $this->entityManager->getReference(TicketService::class, $rawTicket['service_id']);
                                $ticket->setService($service);
                            }
                            
                            // Set other properties
                            $ticket->setPriority($rawTicket['priority']);
                            
                            // Set dates
                            if ($rawTicket['created_at']) {
                                $ticket->setCreatedAt(new \DateTimeImmutable($rawTicket['created_at']));
                            }
                            if ($rawTicket['updated_at']) {
                                $ticket->setUpdatedAt(new \DateTimeImmutable($rawTicket['updated_at']));
                            }
                            if ($rawTicket['resolved_at']) {
                                $ticket->setResolvedAt(new \DateTimeImmutable($rawTicket['resolved_at']));
                            }
                            
                            $tickets[] = $ticket;
                        }
                        
                        error_log("Successfully created " . count($tickets) . " ticket objects");
                    } catch (\Exception $sqlEx) {
                        error_log("Error fetching tickets directly via SQL: " . $sqlEx->getMessage());
                    }
                }
            } else {
                // For regular users, only get their own tickets
                $tickets = $this->ticketRepository->findByCreator($user->getId());
                error_log("Regular user: found " . count($tickets) . " tickets for user ID " . $user->getId());
            }
            
            // Debug the tickets array
            if (!empty($tickets)) {
                foreach ($tickets as $index => $ticket) {
                    error_log("Ticket #{$index}: ID={$ticket->getId()}, Title={$ticket->getTitle()}, Creator ID={$ticket->getCreator()->getId()}");
                }
            } else {
                error_log("No tickets found in repository result");
            }
            
            return $this->json([
                'success' => true,
                'tickets' => $tickets,
                'count' => count($tickets),
                'totalCount' => $totalTicketCount
            ], Response::HTTP_OK, [], ['groups' => 'ticket:read']);
        } catch (\Exception $e) {
            error_log("Exception in getTickets: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Error fetching tickets: ' . $e->getMessage(),
                'tickets' => []
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/status', methods: ['GET'])]
    public function getTicketStatuses(): JsonResponse
    {
        try {
            $statuses = $this->ticketStatusRepository->findAll();
            
            if (empty($statuses)) {
                error_log("No ticket statuses found in the database");
            } else {
                error_log("Found " . count($statuses) . " ticket statuses");
            }
            
            return $this->json([
                'success' => true,
                'statuses' => $statuses
            ], Response::HTTP_OK, [], ['groups' => 'ticket:read']);
        } catch (\Exception $e) {
            error_log("Exception in getTicketStatuses: " . $e->getMessage());
            return $this->json([
                'success' => false,
                'message' => 'Erreur serveur: ' . $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/raw-data', methods: ['GET'])]
    public function getRawTickets(): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $this->getUser();
            
            if (!$user) {
                error_log("User not authenticated in getRawTickets");
                return $this->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], Response::HTTP_UNAUTHORIZED);
            }
            
            error_log("User authenticated: ID=" . $user->getId() . ", Email=" . $user->getEmail());
            
            // Check if user is admin
            $isAdmin = false;
            
            // Method 1: Check via security system
            if ($this->isGranted('ROLE_ADMIN') || $this->isGranted('ROLE_SUPER_ADMIN')) {
                error_log("Admin access granted via isGranted");
                $isAdmin = true;
            } else {
                error_log("isGranted check failed, checking user roles directly");
                
                // Method 2: Check via user roles as a fallback
                if ($user->getRoles() && is_array($user->getRoles())) {
                    error_log("User roles from getRoles(): " . implode(', ', $user->getRoles()));
                    if (in_array('ROLE_ADMIN', $user->getRoles()) || in_array('ROLE_SUPER_ADMIN', $user->getRoles())) {
                        error_log("Admin access granted via getRoles");
                        $isAdmin = true;
                    }
                }
                
                // Method 3: Check via getUserRoles if available
                if (method_exists($user, 'getUserRoles')) {
                    foreach ($user->getUserRoles() as $userRole) {
                        error_log("User role from getUserRoles: " . $userRole->getRole()->getName());
                        if (in_array($userRole->getRole()->getName(), ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])) {
                            error_log("Admin access granted via getUserRoles");
                            $isAdmin = true;
                            break;
                        }
                    }
                }
            }
            
            if (!$isAdmin) {
                error_log("Access denied - user is not admin");
                return $this->json([
                    'success' => false,
                    'message' => 'Access denied'
                ], Response::HTTP_FORBIDDEN);
            }
            
            // Get raw data directly from database
            $connection = $this->entityManager->getConnection();
            $sql = 'SELECT t.*, s.name as status_name, u.first_name, u.last_name 
                    FROM ticket t 
                    LEFT JOIN ticket_status s ON t.status_id = s.id
                    LEFT JOIN user u ON t.creator_id = u.id
                    ORDER BY t.created_at DESC';
            $stmt = $connection->prepare($sql);
            $result = $stmt->executeQuery();
            $rawTickets = $result->fetchAllAssociative();
            
            error_log("Raw tickets query returned " . count($rawTickets) . " tickets");
            
            // Return the raw data
            return $this->json([
                'success' => true,
                'rawTickets' => $rawTickets,
                'count' => count($rawTickets)
            ], Response::HTTP_OK);
        
        } catch (\Exception $e) {
            error_log("Exception in getRawTickets: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Error fetching raw tickets: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', methods: ['GET'])]
    public function getTicket(string $id): JsonResponse
    {
        try {
            // Debug: Log the received ID
            error_log("getTicket called for ID: " . $id);
            
            // Cast to integer with validation
            $ticketId = (int)$id;
            error_log("Converted ticket ID: " . $ticketId);
            
            // Try to find the ticket
            $ticket = $this->ticketRepository->find($ticketId);
            error_log("Ticket found: " . ($ticket ? 'Yes' : 'No'));
            
            if (!$ticket) {
                return $this->json([
                    'success' => false,
                    'message' => 'Ticket non trouvé',
                    'requested_id' => $id
                ], Response::HTTP_NOT_FOUND);
            }
            
            /** @var User $user */
            $user = $this->getUser();
            error_log("User authenticated: ID=" . $user->getId() . ", Email=" . $user->getEmail());
            
            // Check if user is admin or the creator of the ticket - check both ways
            $isAdmin = false;
            
            // Method 1: Check via security system
            if ($this->isGranted('ROLE_ADMIN') || $this->isGranted('ROLE_SUPER_ADMIN')) {
                error_log("Admin access granted via isGranted");
                $isAdmin = true;
            } else {
                error_log("isGranted check failed, checking user roles directly");
                
                // Method 2: Check via user roles as a fallback
                if ($user->getRoles() && is_array($user->getRoles())) {
                    error_log("User roles from getRoles(): " . implode(', ', $user->getRoles()));
                    if (in_array('ROLE_ADMIN', $user->getRoles()) || in_array('ROLE_SUPER_ADMIN', $user->getRoles())) {
                        error_log("Admin access granted via getRoles");
                        $isAdmin = true;
                    }
                }
                
                // Method 3: Check via getUserRoles if available
                if (method_exists($user, 'getUserRoles')) {
                    foreach ($user->getUserRoles() as $userRole) {
                        error_log("User role from getUserRoles: " . $userRole->getRole()->getName());
                        if (in_array($userRole->getRole()->getName(), ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])) {
                            error_log("Admin access granted via getUserRoles");
                            $isAdmin = true;
                            break;
                        }
                    }
                }
            }
            
            error_log("Admin check final result: " . ($isAdmin ? 'Is Admin' : 'Not Admin'));
            error_log("Creator check: User ID=" . $user->getId() . ", Ticket Creator ID=" . $ticket->getCreator()->getId());
            error_log("Creator match: " . ($ticket->getCreator()->getId() === $user->getId() ? 'Yes' : 'No'));
            
            if (!$isAdmin && $ticket->getCreator()->getId() !== $user->getId()) {
                error_log("Access denied: User is not admin and not ticket creator");
                return $this->json([
                    'success' => false,
                    'message' => 'Accès refusé'
                ], Response::HTTP_FORBIDDEN);
            }
            
            error_log("Access granted to ticket #" . $ticket->getId());
            return $this->json([
                'success' => true,
                'ticket' => $ticket
            ], Response::HTTP_OK, [], ['groups' => 'ticket:read']);
            
        } catch (\Exception $e) {
            error_log("Exception in getTicket: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Erreur serveur: ' . $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('', methods: ['POST'])]
    public function createTicket(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        if (!$user) {
            return $this->json(['message' => 'Authentication required'], Response::HTTP_UNAUTHORIZED);
        }
        
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['title']) || !isset($data['description'])) {
            return $this->json(['message' => 'Title and description are required'], Response::HTTP_BAD_REQUEST);
        }
        
        // Get default "Open" status
        $openStatus = $this->ticketStatusRepository->findOneBy(['name' => 'Ouvert']);
        
        if (!$openStatus) {
            return $this->json(['message' => 'Statut par défaut introuvable'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
        
        $ticket = new Ticket();
        $ticket->setTitle($data['title']);
        $ticket->setDescription($data['description']);
        $ticket->setCreator($user);
        $ticket->setStatus($openStatus);
        
        // Set a default priority rather than allowing the user to set it
        $ticket->setPriority('Normal');
        
        // Handle service if it's present in the request
        if (isset($data['serviceId']) && !empty($data['serviceId'])) {
            $service = $this->ticketServiceRepository->find($data['serviceId']);
            if ($service) {
                $ticket->setService($service);
            } else {
                return $this->json(['message' => 'Service introuvable'], Response::HTTP_BAD_REQUEST);
            }
        }
        
        $this->entityManager->persist($ticket);
        $this->entityManager->flush();
        
                // Send email notification to user
                $this->sendEmailNotification($user, $ticket);
        
        // Notify admins about all new tickets
        $this->notifyAdmins($ticket);
        
        // Check if user is admin
        $isAdmin = false;
        if ($this->isGranted('ROLE_ADMIN') || $this->isGranted('ROLE_SUPER_ADMIN')) {
            $isAdmin = true;
        } else {
            foreach ($user->getUserRoles() as $userRole) {
                if (in_array($userRole->getRole()->getName(), ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])) {
                    $isAdmin = true;
                    break;
                }
            }
        }
        
        return $this->json([
            'success' => true,
            'message' => 'Ticket créé avec succès',
            'ticket' => $ticket,
            'isAdmin' => $isAdmin
        ], Response::HTTP_CREATED, [], ['groups' => 'ticket:read']);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function updateTicket(string $id, Request $request): JsonResponse
    {
        try {
            error_log("updateTicket called for ID: " . $id);
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
            
            // Method 1: Check via security system
            if ($this->isGranted('ROLE_ADMIN') || $this->isGranted('ROLE_SUPER_ADMIN')) {
                error_log("Admin access granted via isGranted");
                $isAdmin = true;
            } else {
                error_log("isGranted check failed, checking user roles directly");
                
                // Method 2: Check via user roles as a fallback
                if ($user->getRoles() && is_array($user->getRoles())) {
                    error_log("User roles from getRoles(): " . implode(', ', $user->getRoles()));
                    if (in_array('ROLE_ADMIN', $user->getRoles()) || in_array('ROLE_SUPER_ADMIN', $user->getRoles())) {
                        error_log("Admin access granted via getRoles");
                        $isAdmin = true;
                    }
                }
                
                // Method 3: Check via getUserRoles if available
                if (method_exists($user, 'getUserRoles')) {
                    foreach ($user->getUserRoles() as $userRole) {
                        error_log("User role from getUserRoles: " . $userRole->getRole()->getName());
                        if (in_array($userRole->getRole()->getName(), ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])) {
                            error_log("Admin access granted via getUserRoles");
                            $isAdmin = true;
                            break;
                        }
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
            error_log("Update data: " . json_encode($data));
            
            if (isset($data['title'])) {
                $ticket->setTitle($data['title']);
            }
            
            if (isset($data['description'])) {
                $ticket->setDescription($data['description']);
            }
            
            // Only admins can update priority
            if (isset($data['priority']) && $isAdmin) {
                error_log("Updating priority from " . $ticket->getPriority() . " to " . $data['priority']);
                $ticket->setPriority($data['priority']);
            }
            
            if (isset($data['statusId']) && $isAdmin) {
                error_log("Trying to update status to ID: " . $data['statusId']);
                $status = $this->ticketStatusRepository->find($data['statusId']);
                
                if ($status) {
                    error_log("Found status: " . $status->getName());
                    error_log("Updating status from " . ($ticket->getStatus() ? $ticket->getStatus()->getName() : 'null') . " to " . $status->getName());
                    $ticket->setStatus($status);
                    
                    // If status is "Resolved", set resolvedAt datetime
                    if ($status->getName() === 'Résolu') {
                        error_log("Setting resolvedAt to now");
                        $ticket->setResolvedAt(new \DateTimeImmutable());
                    }
                } else {
                    error_log("Status not found for ID: " . $data['statusId']);
                }
            }
            
            $ticket->setUpdatedAt(new \DateTimeImmutable());
            
            error_log("About to flush changes");
            $this->entityManager->flush();
            error_log("Changes flushed to database");
            
            return $this->json([
                'message' => 'Ticket updated successfully',
                'ticket' => $ticket
            ], Response::HTTP_OK, [], ['groups' => 'ticket:read']);
        } catch (\Exception $e) {
            error_log("Exception in updateTicket: " . $e->getMessage() . "\n" . $e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Erreur serveur: ' . $e->getMessage(),
                'code' => 'SERVER_ERROR'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}/assign', name: 'assign_ticket', methods: ['PUT'])]
    public function assignTicket(Request $request, Ticket $ticket, UserRepository $userRepository): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        // Check if assignedToId is provided
        if (!isset($data['assignedToId'])) {
            return $this->json([
                'message' => 'User ID is required'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        // Find the user to assign the ticket to
        $assignedTo = $userRepository->find($data['assignedToId']);
        
        if (!$assignedTo) {
            return $this->json([
                'message' => 'User not found'
            ], Response::HTTP_NOT_FOUND);
        }
        
        // Update the ticket
        $ticket->setAssignedTo($assignedTo);
        $this->entityManager->flush();
        
        return $this->json([
            'message' => 'Ticket assigned successfully',
            'ticket' => $ticket
        ], Response::HTTP_OK, [], ['groups' => 'ticket:read']);
    }

    #[Route('/actions/bulk-update-status', name: 'api_bulk_update_ticket_status', methods: ['PUT'])]
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        try {
            error_log("========= BULK UPDATE STATUS REACHED =========");
            error_log("Request content: " . $request->getContent());
            
            $user = $this->getUser();
            if (!$user) {
                error_log("Authentication failed - no user found");
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }

            error_log("Authenticated user: " . $user->getEmail());
            
            // Check if user is admin
            $isAdmin = false;
            foreach ($user->getUserRoles() as $userRole) {
                error_log("User role: " . $userRole->getRole()->getName());
                if (in_array($userRole->getRole()->getName(), ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'])) {
                    $isAdmin = true;
                    break;
                }
            }

            if (!$isAdmin) {
                error_log("Access denied - user is not admin");
                return $this->json(['message' => 'Access denied'], Response::HTTP_FORBIDDEN);
            }

            error_log("Admin access confirmed");
            $data = json_decode($request->getContent(), true);
            error_log("Decoded data: " . json_encode($data));

            if (!isset($data['ticketIds']) || !isset($data['statusId'])) {
                error_log("Missing required fields: ticketIds or statusId");
                return $this->json([
                    'success' => false,
                    'message' => 'ticketIds and statusId are required'
                ], Response::HTTP_BAD_REQUEST);
            }

            $status = $this->ticketStatusRepository->find($data['statusId']);
            if (!$status) {
                return $this->json([
                    'success' => false,
                    'message' => 'Invalid status ID'
                ], Response::HTTP_BAD_REQUEST);
            }

            $updatedCount = 0;
            $errors = [];

            foreach ($data['ticketIds'] as $ticketId) {
                $ticket = $this->ticketRepository->find($ticketId);
                if (!$ticket) {
                    $errors[] = "Ticket #{$ticketId} not found";
                    continue;
                }

                $ticket->setStatus($status);
                
                // If status is "Résolu", set resolvedAt
                if ($status->getName() === 'Résolu') {
                    $ticket->setResolvedAt(new \DateTimeImmutable());
                }

                $updatedCount++;
            }

            $this->entityManager->flush();

            return $this->json([
                'success' => true,
                'message' => "Successfully updated {$updatedCount} tickets",
                'updatedCount' => $updatedCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            error_log('Error in bulkUpdateStatus: ' . $e->getMessage());
            error_log($e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Error updating tickets: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/custom-bulk-update', methods: ['POST'])]
    public function customBulkUpdate(Request $request): JsonResponse
    {
        try {
            error_log("========= CUSTOM BULK UPDATE REACHED =========");
            
            $data = json_decode($request->getContent(), true);
            error_log("Received data: " . json_encode($data));
            
            if (!isset($data['ticketIds']) || !isset($data['statusId'])) {
                return $this->json([
                    'success' => false,
                    'message' => 'ticketIds and statusId are required'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            $status = $this->ticketStatusRepository->find($data['statusId']);
            if (!$status) {
                return $this->json([
                    'success' => false,
                    'message' => 'Invalid status ID'
                ], Response::HTTP_BAD_REQUEST);
            }
            
            $updatedCount = 0;
            $errors = [];
            
            foreach ($data['ticketIds'] as $ticketId) {
                $ticket = $this->ticketRepository->find($ticketId);
                if (!$ticket) {
                    $errors[] = "Ticket #{$ticketId} not found";
                    continue;
                }
                
                $ticket->setStatus($status);
                
                // If status is "Résolu", set resolvedAt
                if ($status->getName() === 'Résolu') {
                    $ticket->setResolvedAt(new \DateTimeImmutable());
                }
                
                $updatedCount++;
            }
            
            $this->entityManager->flush();
            
            return $this->json([
                'success' => true,
                'message' => "Successfully updated {$updatedCount} tickets",
                'updatedCount' => $updatedCount,
                'errors' => $errors
            ]);
            
        } catch (\Exception $e) {
            error_log('Error in customBulkUpdate: ' . $e->getMessage());
            error_log($e->getTraceAsString());
            return $this->json([
                'success' => false,
                'message' => 'Error updating tickets: ' . $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function notifyAdmins(Ticket $ticket): void
    {
        // In a real implementation, you would query for admin users
        // For this example, we'll just log that we would send emails to admins
        // $adminEmails = [...];
        // foreach ($adminEmails as $adminEmail) {
        //     $email = (new Email())...
        //     $this->mailer->send($email);
        // }
    }

    #[Route('/tools/debug-token', methods: ['GET'])]
    public function debugToken(): JsonResponse
    {
        try {
            $user = $this->getUser();
            if (!$user) {
                return $this->json(['message' => 'User not authenticated'], Response::HTTP_UNAUTHORIZED);
            }
            
            $debug = [
                'user_id' => $user->getId(),
                'email' => $user->getEmail(),
                'isGranted_ROLE_ADMIN' => $this->isGranted('ROLE_ADMIN'),
                'isGranted_ROLE_SUPER_ADMIN' => $this->isGranted('ROLE_SUPER_ADMIN'),
            ];
            
            // Check direct roles from security
            if (method_exists($user, 'getRoles')) {
                $debug['getRoles'] = $user->getRoles();
            }
            
            // Check UserRole entities
            if (method_exists($user, 'getUserRoles')) {
                $userRoles = [];
                foreach ($user->getUserRoles() as $userRole) {
                    $userRoles[] = $userRole->getRole()->getName();
                }
                $debug['getUserRoles'] = $userRoles;
            }
            
            return $this->json($debug);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 