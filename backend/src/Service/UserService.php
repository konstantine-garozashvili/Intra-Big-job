<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\UserRole;
use App\Entity\Group;
use App\Entity\Diploma;
use App\Entity\Address;
use App\Entity\Signature;
use App\Entity\UserDiploma;
use App\Entity\Formation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class UserService
{
    private EntityManagerInterface $entityManager;
    
    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }
    
    /**
     * Supprime un utilisateur en gérant correctement toutes ses relations
     * 
     * @param int $userId L'ID de l'utilisateur à supprimer
     * @return bool True si la suppression a réussi
     * @throws NotFoundHttpException Si l'utilisateur n'existe pas
     * @throws \Exception Si une erreur survient pendant la suppression
     */
    public function deleteUser(int $userId): bool
    {
        $user = $this->entityManager->getRepository(User::class)->find($userId);
        
        if (!$user) {
            throw new NotFoundHttpException("Utilisateur avec l'ID $userId non trouvé");
        }
        
        // Utiliser une transaction pour assurer l'intégrité des données
        $this->entityManager->beginTransaction();
        
        try {
            // 1. Gérer la relation UserRole (OneToMany)
            error_log("Suppression des UserRoles pour l'utilisateur " . $userId);
            $userRoles = $this->entityManager->getRepository(UserRole::class)->findBy(['user' => $user]);
            foreach ($userRoles as $userRole) {
                $this->entityManager->remove($userRole);
            }
            
            // 2. Gérer la relation Formation (ManyToMany)
            // Utiliser une approche directe pour les formations
            error_log("Détachement des formations pour l'utilisateur " . $userId);
            if (method_exists($user, 'getFormations')) {
                // Requête SQL native pour enlever l'utilisateur des formations
                $conn = $this->entityManager->getConnection();
                $sql = 'DELETE FROM formation_student WHERE user_id = :userId';
                $stmt = $conn->prepare($sql);
                $result = $stmt->executeStatement(['userId' => $userId]);
                error_log("Formations détachées via SQL natif: $result");
            }
            
            // 3. Gérer la relation StudentProfile (OneToOne)
            error_log("Suppression du profil étudiant pour l'utilisateur " . $userId);
            if (method_exists($user, 'getStudentProfile')) {
                // Utiliser DQL pour trouver et supprimer le profil étudiant
                $query = $this->entityManager->createQuery(
                    'DELETE FROM App\Domains\Student\Entity\StudentProfile sp 
                     WHERE sp.user = :user'
                );
                $query->setParameter('user', $user);
                $result = $query->execute();
                error_log("Profil étudiant supprimé via DQL: $result");
            }
            
            // 4. Gérer les relations Group (OneToMany et ManyToMany)
            error_log("Gestion des relations de groupe pour l'utilisateur " . $userId);
            
            // Mise à null des références creator
            $query = $this->entityManager->createQuery(
                'UPDATE App\Entity\Group g SET g.creator = NULL WHERE g.creator = :user'
            );
            $query->setParameter('user', $user);
            $result = $query->execute();
            error_log("Groupes créateur mis à jour via DQL: $result");
            
            // Détacher l'utilisateur des groupes dont il est membre via SQL natif
            error_log("Détachement des groupes pour l'utilisateur " . $userId);
            try {
                // Essayer plusieurs variations du nom de la table possible
                try {
                    $conn = $this->entityManager->getConnection();
                    $sql = 'DELETE FROM `group_user` WHERE user_id = :userId';
                    $stmt = $conn->prepare($sql);
                    $result = $stmt->executeStatement(['userId' => $userId]);
                    error_log("Groupes membres détachés via SQL natif (group_user): $result");
                } catch (\Exception $e) {
                    try {
                        // Si la première tentative échoue, essayer avec group_member
                        $conn = $this->entityManager->getConnection();
                        $sql = 'DELETE FROM group_member WHERE user_id = :userId';
                        $stmt = $conn->prepare($sql);
                        $result = $stmt->executeStatement(['userId' => $userId]);
                        error_log("Groupes membres détachés via SQL natif (group_member): $result");
                    } catch (\Exception $e2) {
                        // Si la deuxième tentative échoue, essayer avec la casse inversée
                        $conn = $this->entityManager->getConnection();
                        $sql = 'DELETE FROM `group_member` WHERE user_id = :userId';
                        $stmt = $conn->prepare($sql);
                        $result = $stmt->executeStatement(['userId' => $userId]);
                        error_log("Groupes membres détachés via SQL natif (`group_member`): $result");
                    }
                }
            } catch (\Exception $e) {
                error_log("Erreur lors du détachement des groupes: " . $e->getMessage());
                // Continuer malgré l'erreur, ne pas bloquer le processus de suppression
            }
            
            // 5. Gérer les relations Diploma (OneToMany)
            error_log("Suppression des diplômes pour l'utilisateur " . $userId);
            try {
                // L'entité Diploma n'a pas de relation directe 'user',
                // nous utilisons UserDiploma comme entité de liaison
                $query = $this->entityManager->createQuery(
                    'DELETE FROM App\Entity\UserDiploma ud WHERE ud.user = :user'
                );
                $query->setParameter('user', $user);
                $result = $query->execute();
                error_log("Association UserDiploma supprimée via DQL: $result");
            } catch (\Exception $e) {
                error_log("Erreur lors de la suppression des UserDiploma: " . $e->getMessage());
                // Continuer le processus
            }
            
            // 6. Gérer les relations Address (OneToMany)
            error_log("Suppression des adresses pour l'utilisateur " . $userId);
            $query = $this->entityManager->createQuery(
                'DELETE FROM App\Entity\Address a WHERE a.user = :user'
            );
            $query->setParameter('user', $user);
            $result = $query->execute();
            error_log("Adresses supprimées via DQL: $result");
            
            // 7. Gérer les relations Signature (OneToMany)
            error_log("Suppression des signatures pour l'utilisateur " . $userId);
            $query = $this->entityManager->createQuery(
                'DELETE FROM App\Entity\Signature s WHERE s.user = :user'
            );
            $query->setParameter('user', $user);
            $result = $query->execute();
            error_log("Signatures supprimées via DQL: $result");
            
            // 8. Gérer les relations UserDiploma (OneToMany)
            error_log("Suppression des UserDiploma pour l'utilisateur " . $userId);
            $query = $this->entityManager->createQuery(
                'DELETE FROM App\Entity\UserDiploma ud WHERE ud.user = :user'
            );
            $query->setParameter('user', $user);
            $result = $query->execute();
            error_log("UserDiplomas supprimés via DQL: $result");
            
            // Appliquer les modifications
            $this->entityManager->flush();
            error_log("Flush des modifications réussi");
            
            // 9. Enfin, supprimer l'utilisateur lui-même
            // Utiliser DQL pour supprimer directement l'utilisateur sans charger ses collections
            try {
                $query = $this->entityManager->createQuery(
                    'DELETE FROM App\Entity\User u WHERE u.id = :userId'
                );
                $query->setParameter('userId', $userId);
                $result = $query->execute();
                error_log("Utilisateur " . $userId . " supprimé directement via DQL: $result");
            } catch (\Exception $e) {
                error_log("Erreur lors de la suppression directe de l'utilisateur: " . $e->getMessage());
                throw $e;
            }
            
            // Valider la transaction
            $this->entityManager->commit();
            error_log("Transaction validée");
            
            return true;
        } catch (\Exception $e) {
            // Annuler la transaction en cas d'erreur
            $this->entityManager->rollback();
            error_log("Erreur lors de la suppression de l'utilisateur " . $userId . ": " . $e->getMessage());
            error_log("Trace: " . $e->getTraceAsString());
            
            throw $e;
        }
    }
} 