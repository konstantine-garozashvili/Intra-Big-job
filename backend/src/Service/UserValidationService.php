<?php

namespace App\Service;

class UserValidationService
{
    public function validateRegistrationData(array $data): array
    {
        $errors = [];
        
        if (empty($data['firstName'])) {
            $errors['firstName'] = 'Le prénom est requis';
        }
        if (empty($data['lastName'])) {
            $errors['lastName'] = 'Le nom est requis';
        }
        if (empty($data['email'])) {
            $errors['email'] = 'L\'email est requis';
        }
        // Ajoutez d'autres validations selon vos besoins
        
        return $errors;
    }
} 