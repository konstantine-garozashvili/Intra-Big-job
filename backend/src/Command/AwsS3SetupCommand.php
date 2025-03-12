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
        $this->setHelp('This command tests your AWS connection and creates the S3 bucket if it doesn\'t exist');
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
        
        // Check S3 connection and bucket existence
        $io->section('S3 Connection Check');
        try {
            // List buckets to verify connection
            $buckets = $this->s3Client->listBuckets();
            $io->success('Successfully connected to AWS S3');
            
            // Check for our bucket
            $bucketExists = false;
            foreach ($buckets['Buckets'] as $bucket) {
                if ($bucket['Name'] === $bucketName) {
                    $bucketExists = true;
                    break;
                }
            }
            
            if ($bucketExists) {
                $io->success(sprintf('Bucket "%s" exists in your AWS account', $bucketName));
            } else {
                $io->warning(sprintf('Bucket "%s" does not exist. Attempting to create it...', $bucketName));
                
                // Create the bucket
                try {
                    $this->s3Client->createBucket([
                        'Bucket' => $bucketName,
                        'CreateBucketConfiguration' => [
                            'LocationConstraint' => $region,
                        ],
                    ]);
                    
                    // Add CORS configuration
                    $this->s3Client->putBucketCors([
                        'Bucket' => $bucketName,
                        'CORSConfiguration' => [
                            'CORSRules' => [
                                [
                                    'AllowedHeaders' => ['*'],
                                    'AllowedMethods' => ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                                    'AllowedOrigins' => ['*'], // In production, limit this to your domains
                                    'MaxAgeSeconds' => 3000,
                                ],
                            ],
                        ],
                    ]);
                    
                    $io->success(sprintf('Bucket "%s" created successfully in region %s', $bucketName, $region));
                } catch (S3Exception $e) {
                    $io->error(sprintf('Failed to create bucket: %s', $e->getMessage()));
                    return Command::FAILURE;
                }
            }
            
            // Test bucket permissions
            $io->section('Testing Bucket Permissions');
            $testKey = 'test-file-' . uniqid() . '.txt';
            $this->s3Client->putObject([
                'Bucket' => $bucketName,
                'Key' => $testKey,
                'Body' => 'This is a test file to verify bucket permissions',
            ]);
            
            $io->success('Successfully uploaded a test file to the bucket');
            
            // Get a pre-signed URL for the test file
            $command = $this->s3Client->getCommand('GetObject', [
                'Bucket' => $bucketName,
                'Key' => $testKey,
            ]);
            
            $presignedUrl = $this->s3Client->createPresignedRequest($command, '+60 minutes')->getUri();
            $io->info(sprintf('Pre-signed URL for test file: %s', $presignedUrl));
            
            // Clean up test file
            $this->s3Client->deleteObject([
                'Bucket' => $bucketName,
                'Key' => $testKey,
            ]);
            
            $io->success('Test file cleaned up');
            
        } catch (S3Exception $e) {
            $io->error(sprintf('S3 Error: %s', $e->getMessage()));
            return Command::FAILURE;
        } catch (\Exception $e) {
            $io->error(sprintf('General Error: %s', $e->getMessage()));
            return Command::FAILURE;
        }
        
        $io->success('AWS S3 is correctly configured and ready to use!');
        return Command::SUCCESS;
    }
} 