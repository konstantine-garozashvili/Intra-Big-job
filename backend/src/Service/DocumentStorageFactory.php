<?php

namespace App\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * Factory service to handle document storage operations,
 * Either using S3 or local filesystem based on configuration
 */
class DocumentStorageFactory
{
    private bool $useS3;
    private string $documentDirectory;

    public function __construct(
        private S3StorageService $s3Service,
        private ParameterBagInterface $params
    ) {
        $this->useS3 = $this->params->get('aws.use_s3_storage');
        $this->documentDirectory = $this->params->get('document_directory');
        
        // Create the document directory if it doesn't exist (for local storage)
        if (!$this->useS3 && !is_dir($this->documentDirectory)) {
            mkdir($this->documentDirectory, 0777, true);
        }
    }
    
    /**
     * Upload a document file
     * 
     * @param UploadedFile $file The file to upload
     * @param string|null $directory Optional subdirectory
     * @return array Result information array
     */
    public function upload(UploadedFile $file, ?string $directory = null): array
    {
        if ($this->useS3) {
            return $this->s3Service->upload($file, $directory);
        } else {
            return $this->uploadToLocalFilesystem($file);
        }
    }
    
    /**
     * Get the URL/path to access a document
     * 
     * @param string $key The document key/filename
     * @return string The URL or path to access the document
     */
    public function getDocumentUrl(string $key): string
    {
        if ($this->useS3) {
            return $this->s3Service->getPresignedUrl($key);
        } else {
            return $this->documentDirectory . '/' . $key;
        }
    }
    
    /**
     * Get document content
     * 
     * @param string $key The document key/filename
     * @return string The document content
     */
    public function getDocumentContent(string $key): string
    {
        if ($this->useS3) {
            return $this->s3Service->getDocumentContent($key);
        } else {
            $filePath = $this->documentDirectory . '/' . $key;
            if (file_exists($filePath)) {
                return file_get_contents($filePath);
            }
            throw new \Exception("File not found: {$key}");
        }
    }
    
    /**
     * Delete a document
     * 
     * @param string $key The document key/filename
     * @return bool Success indicator
     */
    public function delete(string $key): bool
    {
        if ($this->useS3) {
            return $this->s3Service->delete($key);
        } else {
            $filePath = $this->documentDirectory . '/' . $key;
            if (file_exists($filePath)) {
                return unlink($filePath);
            }
            return false;
        }
    }
    
    /**
     * Upload to local filesystem
     * 
     * @param UploadedFile $file The file to upload
     * @return array Result information array
     */
    private function uploadToLocalFilesystem(UploadedFile $file): array
    {
        try {
            $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = preg_replace('/[^a-zA-Z0-9]/', '-', $originalFilename);
            $filename = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();
            
            $file->move($this->documentDirectory, $filename);
            
            return [
                'success' => true,
                'key' => $filename,
                'path' => $this->documentDirectory . '/' . $filename,
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
} 