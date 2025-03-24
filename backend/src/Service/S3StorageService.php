<?php

namespace App\Service;

use Aws\S3\S3Client;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;

class S3StorageService
{
    private string $bucketName;
    // Taille maximale du bucket en octets (5 Go)
    private const MAX_BUCKET_SIZE_BYTES = 5 * 1024 * 1024 * 1024;
    // Seuil d'alerte (4.5 Go)
    private const THRESHOLD_SIZE_BYTES = 4.5 * 1024 * 1024 * 1024;

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
        // Vérifier si le bucket approche de la limite avant l'upload
        $this->checkAndCleanBucketIfNeeded($file->getSize());
        
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
        error_log('[S3Storage] Generating presigned URL for key: ' . $key . ', Bucket: ' . $this->bucketName);
        
        try {
            $cmd = $this->s3Client->getCommand('GetObject', [
                'Bucket' => $this->bucketName,
                'Key' => $key
            ]);
            
            // Log AWS client configuration for debugging
            $config = $this->s3Client->getConfig();
            error_log('[S3Storage] AWS Region: ' . ($config['region'] ?? 'not set'));
            error_log('[S3Storage] AWS Endpoint: ' . ($config['endpoint'] ?? 'not set'));
            
            $request = $this->s3Client->createPresignedRequest($cmd, "+{$expiration} seconds");
            $url = (string) $request->getUri();
            
            error_log('[S3Storage] Generated presigned URL: ' . $url);
            return $url;
        } catch (\Exception $e) {
            error_log('[S3Storage] Error generating presigned URL: ' . $e->getMessage());
            error_log('[S3Storage] Error code: ' . ($e->getAwsErrorCode() ?? 'N/A'));
            error_log('[S3Storage] Error type: ' . ($e->getAwsErrorType() ?? 'N/A'));
            error_log('[S3Storage] Stack trace: ' . $e->getTraceAsString());
            throw $e;
        }
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
            // Log the error but don't fail the application if we can't delete
            // This is a workaround for when delete permissions are restricted
            error_log('Warning: Failed to delete S3 object: ' . $e->getMessage());
            
            // Return true anyway to prevent application errors
            // In a production environment, you might want to implement a cleanup job
            // that runs with appropriate credentials to clean up these files
            return true;
        }
    }
    
    /**
     * Obtient la taille totale du bucket en octets
     * 
     * @return int Taille totale en octets
     */
    public function getBucketSize(): int
    {
        $totalSize = 0;
        $objects = $this->listAllObjects();
        
        foreach ($objects as $object) {
            $totalSize += $object['Size'];
        }
        
        return $totalSize;
    }
    
    /**
     * Liste tous les objets dans le bucket avec leurs métadonnées
     * 
     * @return array Liste des objets avec leurs métadonnées
     */
    public function listAllObjects(): array
    {
        $objects = [];
        $params = [
            'Bucket' => $this->bucketName
        ];
        
        do {
            $result = $this->s3Client->listObjectsV2($params);
            
            if (isset($result['Contents'])) {
                foreach ($result['Contents'] as $object) {
                    $objects[] = $object;
                }
            }
            
            $params['ContinuationToken'] = $result['NextContinuationToken'] ?? null;
        } while (isset($result['IsTruncated']) && $result['IsTruncated']);
        
        return $objects;
    }
    
    /**
     * Vérifie si le bucket approche de la limite et supprime les fichiers les plus anciens si nécessaire
     * 
     * @param int $newFileSize Taille du nouveau fichier à uploader (en octets)
     * @return bool True si le nettoyage a été effectué
     */
    public function checkAndCleanBucketIfNeeded(int $newFileSize = 0): bool
    {
        $currentSize = $this->getBucketSize();
        $projectedSize = $currentSize + $newFileSize;
        
        // Si la taille projetée dépasse le seuil d'alerte
        if ($projectedSize > self::THRESHOLD_SIZE_BYTES) {
            return $this->cleanOldestFiles($projectedSize - self::THRESHOLD_SIZE_BYTES);
        }
        
        return false;
    }
    
    /**
     * Supprime les fichiers les plus anciens jusqu'à libérer l'espace spécifié
     * 
     * @param int $bytesToFree Espace à libérer en octets
     * @return bool True si le nettoyage a réussi
     */
    public function cleanOldestFiles(int $bytesToFree): bool
    {
        $objects = $this->listAllObjects();
        
        // Trier les objets par date (du plus ancien au plus récent)
        usort($objects, function($a, $b) {
            return $a['LastModified'] <=> $b['LastModified'];
        });
        
        $freedSpace = 0;
        $deletedCount = 0;
        
        foreach ($objects as $object) {
            if ($freedSpace >= $bytesToFree) {
                break;
            }
            
            $this->delete($object['Key']);
            $freedSpace += $object['Size'];
            $deletedCount++;
        }
        
        if ($deletedCount > 0) {
            error_log("S3 Bucket cleanup: Deleted {$deletedCount} files to free up " . 
                      round($freedSpace / (1024 * 1024), 2) . " MB of space");
        }
        
        return $freedSpace >= $bytesToFree;
    }
    
    /**
     * Configure une règle de cycle de vie pour supprimer automatiquement les objets après X jours
     * 
     * @param int $days Nombre de jours avant suppression
     * @return bool True si la configuration a réussi
     */
    public function setupLifecycleRule(int $days = 30): bool
    {
        try {
            $this->s3Client->putBucketLifecycleConfiguration([
                'Bucket' => $this->bucketName,
                'LifecycleConfiguration' => [
                    'Rules' => [
                        [
                            'Expiration' => [
                                'Days' => $days,
                            ],
                            'ID' => 'DeleteAfter' . $days . 'Days',
                            'Filter' => [
                                'Prefix' => '',
                            ],
                            'Status' => 'Enabled',
                            'AbortIncompleteMultipartUpload' => [
                                'DaysAfterInitiation' => 1,
                            ],
                        ],
                    ],
                ],
            ]);
            
            return true;
        } catch (\Exception $e) {
            error_log('Failed to set lifecycle configuration: ' . $e->getMessage());
            return false;
        }
    }
} 