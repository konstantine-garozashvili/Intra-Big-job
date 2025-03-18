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
                'id' => 1,
                'name' => 'ADMIN',
                'description' => 'Administrateur du système avec des droits étendus'
            ],
            self::ROLE_SUPERADMIN => [
                'id' => 2,
                'name' => 'SUPERADMIN',
                'description' => 'Super Administrateur avec tous les droits système'
            ],
            self::ROLE_HR => [
                'id' => 3,
                'name' => 'HR',
                'description' => 'Ressources Humaines - Gestion des utilisateurs et des profils'
            ],
            self::ROLE_TEACHER => [
                'id' => 4,
                'name' => 'TEACHER',
                'description' => 'Formateur - Création et gestion des formations'
            ],
            self::ROLE_STUDENT => [
                'id' => 5,
                'name' => 'STUDENT',
                'description' => 'Élève - Accès aux formations et aux ressources pédagogiques'
            ],
            self::ROLE_GUEST => [
                'id' => 6,
                'name' => 'GUEST',
                'description' => 'Invité - Accès limité en lecture seule'
            ],
            self::ROLE_RECRUITER => [
                'id' => 7,
                'name' => 'RECRUITER',
                'description' => 'Recruteur - Gestion des candidatures et des offres d\'emploi'
            ],
        ];

        foreach ($roles as $reference => $data) {
            $role = new Role();
            $role->setId($data['id']);
            $role->setName($data['name']);
            $role->setDescription($data['description']);
            $manager->persist($role);
            $this->addReference($reference, $role);
        }

        $manager->flush();
    }
}