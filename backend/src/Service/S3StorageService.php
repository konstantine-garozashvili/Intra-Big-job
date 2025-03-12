<?php

namespace App\Service;

use Aws\S3\S3Client;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class S3StorageService
{
    private string $bucketName;

    public function __construct(
        private S3Client $s3Client,
        private SluggerInterface $slugger,
        private ParameterBagInterface $params
    ) {
        $this->bucketName = $params->get('aws.bucket_name');
    }

    /**
     * Upload a file to S3 bucket
     *
     * @param UploadedFile $file The file to upload
     * @param string|null $directory Optional subdirectory in the bucket
     * @return array File information array with URL, key, and metadata
     */
    public function upload(UploadedFile $file, ?string $directory = null): array
    {
        // Generate a unique filename
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $filename = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();
        
        // Prepare the S3 key (path within the bucket)
        $key = $directory ? trim($directory, '/') . '/' . $filename : $filename;
        
        try {
            // Upload to S3
            $result = $this->s3Client->putObject([
                'Bucket' => $this->bucketName,
                'Key' => $key,
                'SourceFile' => $file->getPathname(),
                'ContentType' => $file->getMimeType(),
                'ACL' => 'private'
            ]);
            
            return [
                'success' => true,
                'key' => $key,
                'url' => $result->get('ObjectURL'),
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize()
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get a presigned URL for a file in S3
     *
     * @param string $key The key of the file in S3
     * @param int $expiration URL expiration time in seconds (default: 10 minutes)
     * @return string The presigned URL
     */
    public function getPresignedUrl(string $key, int $expiration = 600): string
    {
        $cmd = $this->s3Client->getCommand('GetObject', [
            'Bucket' => $this->bucketName,
            'Key' => $key
        ]);
        
        $request = $this->s3Client->createPresignedRequest($cmd, "+{$expiration} seconds");
        
        return (string) $request->getUri();
    }

    /**
     * Get document content from S3
     *
     * @param string $key The key of the file in S3
     * @return string The document content
     */
    public function getDocumentContent(string $key): string
    {
        try {
            $result = $this->s3Client->getObject([
                'Bucket' => $this->bucketName,
                'Key' => $key
            ]);
            
            return (string) $result['Body'];
        } catch (\Exception $e) {
            throw new \Exception("Failed to get document content from S3: " . $e->getMessage());
        }
    }

    /**
     * Delete a file from S3
     *
     * @param string $key The key of the file to delete
     * @return bool Success indicator
     */
    public function delete(string $key): bool
    {
        try {
            $this->s3Client->deleteObject([
                'Bucket' => $this->bucketName,
                'Key' => $key
            ]);
            
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
} 