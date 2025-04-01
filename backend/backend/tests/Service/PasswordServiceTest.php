<?php

namespace App\Tests\Service;

use App\Entity\User;
use App\Service\PasswordService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class PasswordServiceTest extends TestCase
{
    private $entityManager;
    private $passwordHasher;
    private $logger;
    private $passwordService;
    private $user;

    protected function setUp(): void
    {
        // Create mocks
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->passwordHasher = $this->createMock(UserPasswordHasherInterface::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        
        // Create the service
        $this->passwordService = new PasswordService(
            $this->entityManager,
            $this->passwordHasher,
            $this->logger
        );
        
        // Create a user
        $this->user = $this->createMock(User::class);
        $this->user->method('getId')->willReturn(1);
    }

    public function testChangePasswordWithCorrectCurrentPassword()
    {
        // Configure mocks
        $this->passwordHasher->method('isPasswordValid')->willReturn(true);
        $this->passwordHasher->method('hashPassword')->willReturn('hashed_new_password');
        
        $this->user->expects($this->once())
            ->method('setPassword')
            ->with('hashed_new_password');
        
        $this->user->expects($this->once())
            ->method('setUpdatedAt')
            ->with($this->isInstanceOf(\DateTimeImmutable::class));
            
        // Execute the method
        $result = $this->passwordService->changePassword(
            $this->user,
            'current_password',
            'new_password'
        );
        
        // Assert result
        $this->assertTrue($result['success']);
        $this->assertEquals('Mot de passe modifié avec succès', $result['message']);
    }
    
    public function testChangePasswordWithIncorrectCurrentPassword()
    {
        // Configure mocks
        $this->passwordHasher->method('isPasswordValid')->willReturn(false);
        
        // Execute the method
        $result = $this->passwordService->changePassword(
            $this->user,
            'wrong_password',
            'new_password'
        );
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Le mot de passe actuel est incorrect', $result['message']);
    }
    
    public function testChangePasswordWithSameNewPassword()
    {
        // Configure mocks
        $this->passwordHasher->method('isPasswordValid')->willReturn(true);
        
        // Execute the method
        $result = $this->passwordService->changePassword(
            $this->user,
            'same_password',
            'same_password'
        );
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Le nouveau mot de passe doit être différent de l\'ancien', $result['message']);
    }
    
    public function testChangePasswordWithTooShortNewPassword()
    {
        // Configure mocks
        $this->passwordHasher->method('isPasswordValid')->willReturn(true);
        
        // Execute the method with short password
        $result = $this->passwordService->changePassword(
            $this->user,
            'current_password',
            'short'
        );
        
        // Assert result
        $this->assertFalse($result['success']);
        $this->assertEquals('Le mot de passe doit contenir au moins 8 caractères', $result['message']);
    }
} 