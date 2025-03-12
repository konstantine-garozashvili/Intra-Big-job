<?php

namespace App\Tests\Controller;

use App\Entity\Diploma;
use App\Entity\User;
use App\Entity\UserDiploma;
use App\Repository\DiplomaRepository;
use App\Repository\UserDiplomaRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Controller\UserDiplomaController;

class UserDiplomaControllerTest extends TestCase
{
    private $security;
    private $serializer;
    private $entityManager;
    private $userRepository;
    private $diplomaRepository;
    private $userDiplomaRepository;
    private $validator;
    private $controller;
    private $user;
    private $diploma;
    private $userDiploma;

    protected function setUp(): void
    {
        $this->security = $this->createMock(Security::class);
        $this->serializer = $this->createMock(SerializerInterface::class);
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->userRepository = $this->createMock(UserRepository::class);
        $this->diplomaRepository = $this->createMock(DiplomaRepository::class);
        $this->userDiplomaRepository = $this->createMock(UserDiplomaRepository::class);
        $this->validator = $this->createMock(ValidatorInterface::class);

        $this->controller = new UserDiplomaController(
            $this->security,
            $this->serializer,
            $this->entityManager,
            $this->userRepository,
            $this->diplomaRepository,
            $this->userDiplomaRepository,
            $this->validator
        );

        // Create mock entities
        $this->user = $this->createMock(User::class);
        $this->user->method('getId')->willReturn(1);

        $this->diploma = $this->createMock(Diploma::class);
        $this->diploma->method('getId')->willReturn(1);
        $this->diploma->method('getName')->willReturn('Bachelor in Computer Science');
        $this->diploma->method('getInstitution')->willReturn('University A');

        $this->userDiploma = $this->createMock(UserDiploma::class);
        $this->userDiploma->method('getId')->willReturn(1);
        $this->userDiploma->method('getUser')->willReturn($this->user);
        $this->userDiploma->method('getDiploma')->willReturn($this->diploma);
        $this->userDiploma->method('getObtainedDate')->willReturn(new \DateTime('2020-06-15'));
    }

    public function testGetAvailableDiplomas()
    {
        // Arrange
        $diplomas = [$this->diploma];
        $this->diplomaRepository->expects($this->once())
            ->method('findAll')
            ->willReturn($diplomas);

        // Act
        $response = $this->controller->getAvailableDiplomas();
        $content = json_decode($response->getContent(), true);

        // Assert
        $this->assertTrue($content['success']);
        $this->assertCount(1, $content['data']);
        $this->assertEquals(1, $content['data'][0]['id']);
        $this->assertEquals('Bachelor in Computer Science', $content['data'][0]['name']);
        $this->assertEquals('University A', $content['data'][0]['institution']);
    }

    public function testGetUserDiplomas()
    {
        // Arrange
        $this->security->expects($this->once())
            ->method('getUser')
            ->willReturn($this->user);

        $userDiplomas = [$this->userDiploma];
        $this->userDiplomaRepository->expects($this->once())
            ->method('findByUserWithRelations')
            ->with($this->user)
            ->willReturn($userDiplomas);

        // Act
        $response = $this->controller->getUserDiplomas();
        $content = json_decode($response->getContent(), true);

        // Assert
        $this->assertTrue($content['success']);
        $this->assertCount(1, $content['data']);
        $this->assertEquals(1, $content['data'][0]['id']);
        $this->assertEquals(1, $content['data'][0]['diploma']['id']);
        $this->assertEquals('Bachelor in Computer Science', $content['data'][0]['diploma']['name']);
        $this->assertEquals('University A', $content['data'][0]['diploma']['institution']);
        $this->assertEquals('2020-06-15', $content['data'][0]['obtainedDate']);
    }

    public function testAddUserDiploma()
    {
        // Arrange
        $this->security->expects($this->once())
            ->method('getUser')
            ->willReturn($this->user);

        $this->diplomaRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($this->diploma);

        $this->userDiplomaRepository->expects($this->once())
            ->method('findOneBy')
            ->with(['user' => $this->user, 'diploma' => $this->diploma])
            ->willReturn(null);

        $this->validator->expects($this->once())
            ->method('validate')
            ->willReturn([]);

        $this->entityManager->expects($this->once())
            ->method('persist');
        $this->entityManager->expects($this->once())
            ->method('flush');

        $request = new Request([], [], [], [], [], [], json_encode([
            'diplomaId' => 1,
            'obtainedDate' => '2020-06-15'
        ]));

        // Act
        $response = $this->controller->addUserDiploma($request);
        $content = json_decode($response->getContent(), true);

        // Assert
        $this->assertTrue($content['success']);
        $this->assertEquals('Diplôme ajouté avec succès', $content['message']);
    }

    public function testUpdateUserDiploma()
    {
        // Arrange
        $this->security->expects($this->once())
            ->method('getUser')
            ->willReturn($this->user);

        $this->userDiplomaRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($this->userDiploma);

        $this->validator->expects($this->once())
            ->method('validate')
            ->willReturn([]);

        $this->entityManager->expects($this->once())
            ->method('flush');

        $request = new Request([], [], [], [], [], [], json_encode([
            'obtainedDate' => '2021-06-15'
        ]));

        // Act
        $response = $this->controller->updateUserDiploma(1, $request);
        $content = json_decode($response->getContent(), true);

        // Assert
        $this->assertTrue($content['success']);
        $this->assertEquals('Diplôme mis à jour avec succès', $content['message']);
    }

    public function testDeleteUserDiploma()
    {
        // Arrange
        $this->security->expects($this->once())
            ->method('getUser')
            ->willReturn($this->user);

        $this->userDiplomaRepository->expects($this->once())
            ->method('find')
            ->with(1)
            ->willReturn($this->userDiploma);

        $this->entityManager->expects($this->once())
            ->method('remove')
            ->with($this->userDiploma);
        $this->entityManager->expects($this->once())
            ->method('flush');

        // Act
        $response = $this->controller->deleteUserDiploma(1);
        $content = json_decode($response->getContent(), true);

        // Assert
        $this->assertTrue($content['success']);
        $this->assertEquals('Diplôme supprimé avec succès', $content['message']);
    }
} 