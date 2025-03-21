<?php

namespace App\DataFixtures;

use App\Entity\Role;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class RoleFixtures extends Fixture
{
    public const ROLE_ADMIN = 'role-admin';
    public const ROLE_SUPERADMIN = 'role-superadmin';
    public const ROLE_HR = 'role-hr';
    public const ROLE_TEACHER = 'role-teacher';
    public const ROLE_STUDENT = 'role-student';
    public const ROLE_GUEST = 'role-guest';
    public const ROLE_RECRUITER = 'role-recruiter';

    public function load(ObjectManager $manager): void
    {
        $roles = [
            self::ROLE_ADMIN => [
                'name' => 'ADMIN',
                'description' => 'Administrateur du système avec des droits étendus'
            ],
            self::ROLE_SUPERADMIN => [
                'name' => 'SUPERADMIN',
                'description' => 'Super Administrateur avec tous les droits système'
            ],
            self::ROLE_HR => [
                'name' => 'HR',
                'description' => 'Ressources Humaines - Gestion des utilisateurs et des profils'
            ],
            self::ROLE_TEACHER => [
                'name' => 'TEACHER',
                'description' => 'Formateur - Création et gestion des formations'
            ],
            self::ROLE_STUDENT => [
                'name' => 'STUDENT',
                'description' => 'Élève - Accès aux formations et aux ressources pédagogiques'
            ],
            self::ROLE_GUEST => [
                'name' => 'GUEST',
                'description' => 'Invité - Accès limité en lecture seule'
            ],
            self::ROLE_RECRUITER => [
                'name' => 'RECRUITER',
                'description' => 'Recruteur - Gestion des candidatures et des offres d\'emploi'
            ],
        ];

        foreach ($roles as $reference => $data) {
            $role = new Role();
            $role->setName($data['name']);
            $role->setDescription($data['description']);
            $manager->persist($role);
            $this->addReference($reference, $role);
        }

        $manager->flush();
    }
} 