<?php

namespace App\Service;

use Psr\Cache\CacheItemPoolInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class TimeoutService
{
    private const DEFAULT_TIMEOUT = 30;
    private const LOW_PERF_TIMEOUT = 45;
    private const PROFILE_REQUEST_TIMEOUT = 20;
    private const LOW_PERF_PROFILE_REQUEST_TIMEOUT = 30;
    private const CACHE_KEY = 'system_performance_metrics';
    private const CACHE_TTL = 3600; // 1 hour
    
    private CacheItemPoolInterface $cache;
    private LoggerInterface $logger;
    private ?HttpClientInterface $httpClient;
    
    private ?array $systemInfo = null;
    
    public function __construct(
        CacheItemPoolInterface $cache,
        LoggerInterface $logger,
        ?HttpClientInterface $httpClient = null
    ) {
        $this->cache = $cache;
        $this->logger = $logger;
        $this->httpClient = $httpClient ?? HttpClient::create();
    }
    
    /**
     * Get the appropriate timeout value based on system performance and request type
     */
    public function getTimeout(bool $isProfileRequest = false): int
    {
        $isLowPerformance = $this->isLowPerformanceEnvironment();
        
        if ($isProfileRequest) {
            return $isLowPerformance ? self::LOW_PERF_PROFILE_REQUEST_TIMEOUT : self::PROFILE_REQUEST_TIMEOUT;
        }
        
        return $isLowPerformance ? self::LOW_PERF_TIMEOUT : self::DEFAULT_TIMEOUT;
    }
    
    /**
     * Check if the current environment is a low-performance one
     */
    public function isLowPerformanceEnvironment(): bool
    {
        // Try to get cached result first
        $cacheItem = $this->cache->getItem(self::CACHE_KEY);
        
        if ($cacheItem->isHit()) {
            return $cacheItem->get()['isLowPerformance'] ?? false;
        }
        
        // Perform the actual check
        $isLowPerformance = $this->detectLowPerformanceEnvironment();
        
        // Cache the result
        $cacheItem->set([
            'isLowPerformance' => $isLowPerformance,
            'lastChecked' => new \DateTime(),
            'metrics' => $this->systemInfo
        ]);
        $cacheItem->expiresAfter(self::CACHE_TTL);
        $this->cache->save($cacheItem);
        
        return $isLowPerformance;
    }
    
    /**
     * Detect if the current environment is a low-performance one
     */
    private function detectLowPerformanceEnvironment(): bool
    {
        $this->systemInfo = [];
        
        // Get system information
        $cpuInfo = $this->getCpuInfo();
        $memoryInfo = $this->getMemoryInfo();
        $loadInfo = $this->getSystemLoad();
        
        $this->systemInfo = array_merge($this->systemInfo, $cpuInfo, $memoryInfo, $loadInfo);
        
        // Analyze information to determine if it's a low-performance environment
        $isLowPerformance = false;
        
        // CPU cores threshold (fewer than 4 cores is considered low performance)
        if (($cpuInfo['cpuCores'] ?? 8) < 4) {
            $isLowPerformance = true;
        }
        
        // Memory threshold (less than 4GB is considered low performance)
        if (($memoryInfo['totalMemoryGB'] ?? 8) < 4) {
            $isLowPerformance = true;
        }
        
        // Load average threshold (higher than 2.0 per core is considered heavy load)
        $loadPerCore = ($loadInfo['loadAvg1'] ?? 0) / max(1, ($cpuInfo['cpuCores'] ?? 1));
        if ($loadPerCore > 2.0) {
            $isLowPerformance = true;
        }
        
        $this->logger->info('Performance environment detection', [
            'isLowPerformance' => $isLowPerformance,
            'metrics' => $this->systemInfo
        ]);
        
        return $isLowPerformance;
    }
    
    /**
     * Get CPU information
     */
    private function getCpuInfo(): array
    {
        $result = ['cpuCores' => 8]; // Default fallback
        
        try {
            if (function_exists('sys_getloadavg') && PHP_OS !== 'WIN32' && PHP_OS !== 'WINNT') {
                // Try to get CPU cores on Linux/Unix systems
                if (is_readable('/proc/cpuinfo')) {
                    $cpuinfo = file_get_contents('/proc/cpuinfo');
                    preg_match_all('/^processor/m', $cpuinfo, $matches);
                    $result['cpuCores'] = count($matches[0]);
                } else {
                    // Try using shell command as fallback
                    $cmd = 'nproc 2>&1';
                    $cores = shell_exec($cmd);
                    if (is_numeric(trim($cores))) {
                        $result['cpuCores'] = (int)trim($cores);
                    }
                }
            } elseif (PHP_OS === 'WIN32' || PHP_OS === 'WINNT') {
                // Windows-specific (using environment variable)
                $result['cpuCores'] = (int)($_SERVER['NUMBER_OF_PROCESSORS'] ?? 8);
            }
        } catch (\Throwable $e) {
            $this->logger->warning('Failed to get CPU information', ['error' => $e->getMessage()]);
        }
        
        return $result;
    }
    
    /**
     * Get memory information
     */
    private function getMemoryInfo(): array
    {
        $result = ['totalMemoryGB' => 8, 'freeMemoryGB' => 4]; // Default fallback
        
        try {
            if (PHP_OS !== 'WIN32' && PHP_OS !== 'WINNT') {
                // Try to get memory info on Linux/Unix systems
                if (is_readable('/proc/meminfo')) {
                    $meminfo = file_get_contents('/proc/meminfo');
                    
                    // Extract total memory
                    if (preg_match('/MemTotal:\s+(\d+) kB/i', $meminfo, $matches)) {
                        $result['totalMemoryGB'] = round((int)$matches[1] / 1024 / 1024, 2);
                    }
                    
                    // Extract free memory (including buffers/cache)
                    if (preg_match('/MemAvailable:\s+(\d+) kB/i', $meminfo, $matches)) {
                        $result['freeMemoryGB'] = round((int)$matches[1] / 1024 / 1024, 2);
                    }
                }
            } elseif (PHP_OS === 'WIN32' || PHP_OS === 'WINNT') {
                // For Windows, use a limited approach with PHP memory limits
                $memoryLimit = ini_get('memory_limit');
                if (preg_match('/^(\d+)(.)$/', $memoryLimit, $matches)) {
                    $value = (int)$matches[1];
                    $unit = strtolower($matches[2]);
                    
                    if ($unit === 'g') {
                        $result['totalMemoryGB'] = $value;
                    } elseif ($unit === 'm') {
                        $result['totalMemoryGB'] = $value / 1024;
                    }
                    
                    // Estimate free memory as 50% of total for Windows (crude approximation)
                    $result['freeMemoryGB'] = $result['totalMemoryGB'] / 2;
                }
            }
        } catch (\Throwable $e) {
            $this->logger->warning('Failed to get memory information', ['error' => $e->getMessage()]);
        }
        
        return $result;
    }
    
    /**
     * Get system load information
     */
    private function getSystemLoad(): array
    {
        $result = ['loadAvg1' => 0, 'loadAvg5' => 0, 'loadAvg15' => 0];
        
        try {
            if (function_exists('sys_getloadavg') && PHP_OS !== 'WIN32' && PHP_OS !== 'WINNT') {
                $load = sys_getloadavg();
                $result['loadAvg1'] = $load[0];
                $result['loadAvg5'] = $load[1];
                $result['loadAvg15'] = $load[2];
            }
        } catch (\Throwable $e) {
            $this->logger->warning('Failed to get system load information', ['error' => $e->getMessage()]);
        }
        
        return $result;
    }
} 