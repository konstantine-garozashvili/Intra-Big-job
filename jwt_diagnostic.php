<?php
// JWT and Authentication Diagnostic Tool

// Enable error display for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Function to check file permissions in octal format
function getFilePermissions($filePath) {
    if (!file_exists($filePath)) {
        return [
            'exists' => false,
            'permissions' => null,
            'octal' => null,
            'readable' => false,
            'writable' => false
        ];
    }
    
    $perms = fileperms($filePath);
    $octal = substr(sprintf('%o', $perms), -4);
    
    return [
        'exists' => true,
        'permissions' => $perms,
        'octal' => $octal,
        'readable' => is_readable($filePath),
        'writable' => is_writable($filePath),
        'owner' => posix_getpwuid(fileowner($filePath))['name'] ?? 'unknown',
        'group' => posix_getgrgid(filegroup($filePath))['name'] ?? 'unknown',
        'web_user' => exec('whoami'),
        'size' => filesize($filePath)
    ];
}

// Get current directory - CORRECTED FOR OVH
$currentDir = dirname(__FILE__);
$projectRoot = $currentDir; // This script should be in the project root

// Test basic JWT configuration
$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
        'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown',
        'current_directory' => $currentDir,
        'project_root' => $projectRoot,
        'web_user' => exec('whoami')
    ],
    'environment' => [
        'APP_ENV' => getenv('APP_ENV'),
        'APP_DEBUG' => getenv('APP_DEBUG'),
        'CORS_ALLOW_ORIGIN' => getenv('CORS_ALLOW_ORIGIN'),
        'JWT_SECRET_KEY' => getenv('JWT_SECRET_KEY'),
        'JWT_PUBLIC_KEY' => getenv('JWT_PUBLIC_KEY'),
        'JWT_PASSPHRASE' => getenv('JWT_PASSPHRASE') ? '[HIDDEN FOR SECURITY]' : 'Not set',
        'has_jwt_passphrase' => !empty(getenv('JWT_PASSPHRASE')),
    ],
    'jwt_keys' => [
        'public_key' => getFilePermissions($projectRoot . '/backend/config/jwt/public.pem'),
        'private_key' => getFilePermissions($projectRoot . '/backend/config/jwt/private.pem'),
    ],
    'env_files' => [
        'env' => getFilePermissions($projectRoot . '/backend/.env'),
        'env_dev' => getFilePermissions($projectRoot . '/backend/.env.dev'),
        'env_local' => getFilePermissions($projectRoot . '/backend/.env.local'),
    ],
    'htaccess_files' => [
        'root_htaccess' => getFilePermissions($projectRoot . '/.htaccess'),
        'backend_htaccess' => getFilePermissions($projectRoot . '/backend/public/.htaccess'),
        'backend_htaccess_ovh' => getFilePermissions($projectRoot . '/backend/public/.htaccess-ovh'),
    ]
];

// Test API endpoints
function testEndpoint($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    $headers = ['Content-Type: application/json'];
    if ($token) {
        $headers[] = "Authorization: Bearer $token";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($data && $method !== 'GET') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $info = curl_getinfo($ch);
    $error = curl_error($ch);
    curl_close($ch);
    
    return [
        'url' => $url,
        'method' => $method,
        'status_code' => $info['http_code'],
        'response' => $response ? json_decode($response, true) : null,
        'raw_response' => $response,
        'error' => $error
    ];
}

// Get base URL from the request
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$baseUrl = "$protocol://$host";

// Test login endpoint to get a token
$loginTest = testEndpoint(
    "$baseUrl/api/login_check",
    'POST',
    ['username' => 'student@bigproject.com', 'password' => 'Password123@']
);

$results['api_tests'] = [
    'login' => $loginTest
];

// If login succeeded, test authenticated endpoints
if ($loginTest['response']['token'] ?? null) {
    $token = $loginTest['response']['token'];
    
    // Test /api/me endpoint
    $results['api_tests']['me'] = testEndpoint("$baseUrl/api/me", 'GET', null, $token);
    
    // Test /api/profile endpoint
    $results['api_tests']['profile'] = testEndpoint("$baseUrl/api/profile", 'GET', null, $token);
}

// Verify file content samples (first lines only, for security)
function getFileFirstLines($path, $lines = 5) {
    if (!file_exists($path) || !is_readable($path)) {
        return "File not accessible";
    }
    
    $content = file($path, FILE_IGNORE_NEW_LINES);
    $sample = array_slice($content, 0, $lines);
    
    // Remove sensitive data from env files
    foreach ($sample as &$line) {
        if (strpos($line, 'PASSWORD') !== false || 
            strpos($line, 'SECRET') !== false || 
            strpos($line, 'KEY') !== false) {
            $line = preg_replace('/=.*/', '=[REDACTED]', $line);
        }
    }
    
    return implode("\n", $sample) . "\n...";
}

$results['file_samples'] = [
    'env_dev_sample' => getFileFirstLines($projectRoot . '/backend/.env.dev'),
    'backend_htaccess_sample' => getFileFirstLines($projectRoot . '/backend/public/.htaccess'),
    'root_htaccess_sample' => getFileFirstLines($projectRoot . '/.htaccess'),
];

// Output the results
echo json_encode($results, JSON_PRETTY_PRINT); 