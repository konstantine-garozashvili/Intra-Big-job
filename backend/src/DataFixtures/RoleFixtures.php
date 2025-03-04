<?php

namespace App\DataFixtures;

use App\Entity\Role;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class RoleFixtures extends Fixture
{
    public const ROLE_ADMIN = 'role-admin';
    public const ROLE_MODERATOR = 'role-moderator';
    public const ROLE_HR = 'role-hr';
    public const ROLE_TEACHER = 'role-teacher';
    public const ROLE_STUDENT = 'role-student';
    public const ROLE_GUEST = 'role-guest';

    public function load(ObjectManager $manager): void
    {
        $roles = [
            self::ROLE_ADMIN => [
                'name' => 'ADMIN',
                'description' => 'Administrateur du système avec tous les droits'
            ],
            self::ROLE_MODERATOR => [
                'name' => 'MODERATOR',
                'description' => 'Modérateur avec droits de gestion du contenu'
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