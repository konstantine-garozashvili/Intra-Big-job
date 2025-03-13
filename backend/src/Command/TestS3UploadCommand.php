<?php

namespace App\Command;

use App\Service\DocumentStorageFactory;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\HttpFoundation\File\UploadedFile;

#[AsCommand(
    name: 'app:s3:test-upload',
    description: 'Upload a test file to S3 to verify integration',
)]
class TestS3UploadCommand extends Command
{
    public function __construct(
        private DocumentStorageFactory $storageFactory
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $io->title('S3 Upload Test');

        // Create a temporary test file
        $tempFilePath = tempnam(sys_get_temp_dir(), 'test_');
        file_put_contents($tempFilePath, 'This is a test file for S3 upload from Symfony ' . date('Y-m-d H:i:s'));
        
        // Create an UploadedFile instance (simulating a file upload)
        $file = new UploadedFile(
            $tempFilePath,
            'test-file.txt',
            'text/plain',
            null,
            true // Test mode
        );

        // Upload the file using our storage factory
        $result = $this->storageFactory->upload($file, 'test-uploads');

        if ($result['success']) {
            $io->success('File was successfully uploaded to S3!');
            $io->table(['Property', 'Value'], [
                ['Filename', $result['filename']],
                ['Original Name', $result['original_name']],
                ['S3 Key', $result['key']],
                ['MIME Type', $result['mime_type']],
                ['Size', $result['size']],
                ['URL', $result['url'] ?? 'N/A']
            ]);

            // Get a pre-signed URL to access the file
            $url = $this->storageFactory->getDocumentUrl($result['key']);
            $io->section('Pre-signed URL (valid for 10 minutes)');
            $io->writeln($url);

            return Command::SUCCESS;
        } else {
            $io->error('Failed to upload file to S3: ' . ($result['error'] ?? 'Unknown error'));
            return Command::FAILURE;
        }
    }
} 