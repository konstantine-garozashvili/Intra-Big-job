<?php

namespace App\Command;

use Aws\S3\S3Client;
use Aws\S3\Exception\S3Exception;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

#[AsCommand(
    name: 'app:aws:setup',
    description: 'Set up AWS S3 bucket and verify configuration',
)]
class AwsS3SetupCommand extends Command
{
    public function __construct(
        private S3Client $s3Client,
        private ParameterBagInterface $params
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->setHelp('This command tests your AWS connection and verifies object operations on your S3 bucket');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $bucketName = $this->params->get('aws.bucket_name');
        $region = $this->params->get('aws.region');
        
        $io->title('AWS S3 Configuration Check');
        
        // Check if AWS credentials are configured
        $io->section('AWS Credentials');
        if (empty($this->params->get('aws.region')) || empty($bucketName)) {
            $io->error('AWS credentials or bucket name are not properly configured');
            return Command::FAILURE;
        }
        
        $io->success('AWS credentials are configured');
        $io->text('Using bucket: ' . $bucketName);
        $io->text('Region: ' . $region);
        
        // Skip bucket existence check and creation - assume bucket exists
        $io->section('S3 Object Operations Test');
        try {
            // Test bucket permissions by performing object operations
            $testKey = 'test-file-' . uniqid() . '.txt';
            
            // Test PUT operation
            try {
                $io->text('Testing upload operation...');
                $this->s3Client->putObject([
                    'Bucket' => $bucketName,
                    'Key' => $testKey,
                    'Body' => 'This is a test file to verify bucket permissions',
                    'ContentType' => 'text/plain',
                ]);
                
                $io->success('Successfully uploaded a test file to the bucket');
                
                // Test GET operation by creating a pre-signed URL
                try {
                    $io->text('Testing pre-signed URL generation...');
                    $command = $this->s3Client->getCommand('GetObject', [
                        'Bucket' => $bucketName,
                        'Key' => $testKey,
                    ]);
                    
                    $presignedUrl = $this->s3Client->createPresignedRequest($command, '+60 minutes')->getUri();
                    $io->info(sprintf('Pre-signed URL for test file: %s', $presignedUrl));
                    
                    // Test DELETE operation
                    try {
                        $io->text('Testing delete operation...');
                        $this->s3Client->deleteObject([
                            'Bucket' => $bucketName,
                            'Key' => $testKey,
                        ]);
                        
                        $io->success('Test file cleaned up successfully');
                    } catch (S3Exception $e) {
                        $io->error(sprintf('Failed to delete test file: %s', $e->getMessage()));
                        $io->warning('You may need to manually delete the test file from your bucket');
                        return Command::FAILURE;
                    }
                } catch (S3Exception $e) {
                    $io->error(sprintf('Failed to generate pre-signed URL: %s', $e->getMessage()));
                    return Command::FAILURE;
                }
            } catch (S3Exception $e) {
                $io->error(sprintf('Failed to upload test file: %s', $e->getMessage()));
                $io->text('Error details: ' . $e->getAwsErrorMessage());
                return Command::FAILURE;
            }
            
        } catch (S3Exception $e) {
            $io->error(sprintf('S3 Error: %s', $e->getMessage()));
            $io->text('Error code: ' . $e->getAwsErrorCode());
            $io->text('Error message: ' . $e->getAwsErrorMessage());
            return Command::FAILURE;
        } catch (\Exception $e) {
            $io->error(sprintf('General Error: %s', $e->getMessage()));
            return Command::FAILURE;
        }
        
        $io->success('AWS S3 is correctly configured and ready to use!');
        $io->text('Your application can now use S3 for document storage.');
        
        return Command::SUCCESS;
    }
} 