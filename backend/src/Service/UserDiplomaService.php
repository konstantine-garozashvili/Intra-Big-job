<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\UserDiploma;
use Doctrine\Common\Collections\Collection;

/**
 * Service pour uniformiser la récupération des diplômes utilisateur
 */
class UserDiplomaService
{
    /**
     * Format les diplômes d'un utilisateur d'une manière cohérente
     * Cette méthode sera utilisée à la fois pour les profils privés et publics
     * 
     * @param User $user L'utilisateur dont on veut récupérer les diplômes
     * @return array Tableau de diplômes formatés
     */
    public function formatUserDiplomas(User $user): array
    {
        $userDiplomas = $user->getUserDiplomas();
        if ($userDiplomas->isEmpty()) {
            return [];
        }
        
        $formattedDiplomas = [];
        foreach ($userDiplomas as $userDiploma) {
            $diploma = $userDiploma->getDiploma();
            $formattedDiplomas[] = [
                'id' => $userDiploma->getId(),
                'diploma' => [
                    'id' => $diploma->getId(),
                    'name' => $diploma->getName(),
                    'institution' => $diploma->getInstitution(),
                ],
                'obtainedDate' => $userDiploma->getObtainedDate() ? $userDiploma->getObtainedDate()->format('Y-m-d') : null,
            ];
        }
        
        // Trier les diplômes par date d'obtention (du plus récent au plus ancien)
        usort($formattedDiplomas, function($a, $b) {
            if (!isset($a['obtainedDate']) || !isset($b['obtainedDate'])) {
                return 0;
            }
            return strtotime($b['obtainedDate']) - strtotime($a['obtainedDate']);
        });
        
        return $formattedDiplomas;
    }
} 