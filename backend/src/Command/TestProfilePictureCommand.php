<?php

namespace App\Command;

use App\Entity\User;
use App\Service\DocumentStorageFactory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\HttpFoundation\File\UploadedFile;

#[AsCommand(
    name: 'app:test:profile-picture',
    description: 'Test profile picture upload functionality',
)]
class TestProfilePictureCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private DocumentStorageFactory $storageFactory
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::REQUIRED, 'Email of the user to update')
            ->addArgument('image-path', InputArgument::REQUIRED, 'Path to the image file to upload');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $email = $input->getArgument('email');
        $imagePath = $input->getArgument('image-path');
        
        // Normalize path for Docker environment
        $imagePath = str_replace('\\', '/', $imagePath);
        
        $io->title('Testing Profile Picture Upload');
        $io->note("Using image path: {$imagePath}");

        // Find the user
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if (!$user) {
            $io->error("User with email {$email} not found");
            return Command::FAILURE;
        }

        $io->section('User found');
        $io->table(['Property', 'Value'], [
            ['ID', $user->getId()],
            ['Name', $user->getFirstName() . ' ' . $user->getLastName()],
            ['Email', $user->getEmail()],
            ['Current Profile Picture', $user->getProfilePicturePath() ?: 'None']
        ]);

        // Check if the image file exists with detailed error reporting
        if (!file_exists($imagePath)) {
            $io->error([
                "Image file not found at: {$imagePath}",
                "Current working directory: " . getcwd(),
                "Please ensure the file exists and is accessible from the container.",
                "For Docker environments, copy the file to the container first:",
                "docker cp /path/on/host/image.jpg container-name:/tmp/image.jpg",
                "Then use the container path: /tmp/image.jpg"
            ]);
            return Command::FAILURE;
        }

        // Display file information before creating UploadedFile
        $io->section('File Information');
        $io->table(['Property', 'Value'], [
            ['Path', $imagePath],
            ['Exists', file_exists($imagePath) ? 'Yes' : 'No'],
            ['Readable', is_readable($imagePath) ? 'Yes' : 'No'],
            ['Size', file_exists($imagePath) ? filesize($imagePath) . ' bytes' : 'N/A'],
            ['MIME Type', file_exists($imagePath) ? (function_exists('mime_content_type') ? mime_content_type($imagePath) : 'Unknown') : 'N/A']
        ]);

        // Create an UploadedFile instance
        try {
            $mimeType = function_exists('mime_content_type') ? mime_content_type($imagePath) : 'application/octet-stream';
            $file = new UploadedFile(
                $imagePath,
                basename($imagePath),
                $mimeType,
                null,
                true // Test mode
            );
            
            $io->section('Uploading profile picture');
            $io->table(['Property', 'Value'], [
                ['File', basename($imagePath)],
                ['MIME Type', $mimeType],
                ['Size', filesize($imagePath) . ' bytes']
            ]);
            
            // Delete old profile picture if exists
            $oldPicturePath = $user->getProfilePicturePath();
            if ($oldPicturePath) {
                $io->note("Deleting old profile picture: {$oldPicturePath}");
                $this->storageFactory->delete($oldPicturePath);
            }
            
            // Upload the new profile picture
            $result = $this->storageFactory->upload($file, 'profile-pictures');
            
            if (!$result['success']) {
                $io->error('Failed to upload profile picture: ' . ($result['error'] ?? 'Unknown error'));
                return Command::FAILURE;
            }
            
            // Update user profile picture path
            $user->setProfilePicturePath($result['key']);
            $user->setUpdatedAt(new \DateTimeImmutable());
            
            $this->entityManager->flush();
            
            // Get the URL to access the profile picture
            $pictureUrl = $this->storageFactory->getDocumentUrl($result['key']);
            
            $io->success('Profile picture updated successfully');
            $io->table(['Property', 'Value'], [
                ['Key', $result['key']],
                ['URL', $pictureUrl],
                ['Original Name', $result['original_name']],
                ['MIME Type', $result['mime_type']],
                ['Size', $result['size'] . ' bytes']
            ]);
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $io->error([
                'Error creating or uploading file: ' . $e->getMessage(),
                'File: ' . $e->getFile() . ':' . $e->getLine()
            ]);
            return Command::FAILURE;
        }
    }
} 