<?php
/**
 * OVH Server Fix Script
 * 
 * This script is designed to diagnose and fix common issues with the OVH server,
 * particularly focusing on directory permissions, cache folder, and environment configuration.
 */

// Basic HTML styling
echo <<<HTML
<!DOCTYPE html>
<html>
<head>
    <title>OVH Server Fix Tool</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .container { max-width: 1000px; margin: 0 auto; }
        .card { border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
        h1, h2 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        button { padding: 10px 15px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #45a049; }
    </style>
</head>
<body>
    <div class="container">
        <h1>OVH Server Fix Tool</h1>
HTML;

// Get current directory
$currentDir = getcwd();
$projectRoot = $currentDir;

// Detect if this is running on the OVH server
$isOvhServer = strpos($_SERVER['SERVER_NAME'] ?? '', 'konstantine.fr') !== false;

echo '<div class="card">';
echo '<h2>Server Environment</h2>';
echo '<p><strong>PHP Version:</strong> ' . phpversion() . '</p>';
echo '<p><strong>Server:</strong> ' . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . '</p>';
echo '<p><strong>Document Root:</strong> ' . ($_SERVER['DOCUMENT_ROOT'] ?? '') . '</p>';
echo '<p><strong>Current Directory:</strong> ' . $currentDir . '</p>';
echo '<p><strong>Running on OVH:</strong> ' . ($isOvhServer ? 'Yes' : 'No') . '</p>';
echo '</div>';

// Function to check file/directory permissions
function getFilePermissions($path) {
    if (!file_exists($path)) {
        return [
            'exists' => false,
            'path' => $path
        ];
    }
    
    $perms = fileperms($path);
    $owner = function_exists('posix_getpwuid') ? posix_getpwuid(fileowner($path)) : ['name' => 'unknown'];
    $group = function_exists('posix_getgrgid') ? posix_getgrgid(filegroup($path)) : ['name' => 'unknown'];
    
    return [
        'exists' => true,
        'path' => $path,
        'perms' => substr(sprintf('%o', $perms), -4),
        'owner' => $owner['name'] ?? 'unknown',
        'group' => $group['name'] ?? 'unknown',
        'is_writable' => is_writable($path),
        'is_readable' => is_readable($path)
    ];
}

// Detect project structure
$backendDir = file_exists($projectRoot . '/backend') ? $projectRoot . '/backend' : $projectRoot;
$varDir = $backendDir . '/var';
$cacheDir = $varDir . '/cache';
$envFile = $backendDir . '/.env';
$envLocalFile = $backendDir . '/.env.local';
$envDevFile = $backendDir . '/.env.dev';

echo '<div class="card">';
echo '<h2>Project Structure</h2>';
echo '<p><strong>Backend Directory:</strong> ' . $backendDir . '</p>';
echo '<p><strong>Var Directory:</strong> ' . $varDir . '</p>';
echo '<p><strong>Cache Directory:</strong> ' . $cacheDir . '</p>';
echo '</div>';

// Check environment files
echo '<div class="card">';
echo '<h2>Environment Files</h2>';

$envFiles = [
    '.env' => $envFile,
    '.env.local' => $envLocalFile,
    '.env.dev' => $envDevFile
];

foreach ($envFiles as $name => $path) {
    $fileInfo = getFilePermissions($path);
    
    echo '<div>';
    echo '<h3>' . $name . '</h3>';
    
    if ($fileInfo['exists']) {
        echo '<p class="success">✓ File exists</p>';
        echo '<p>Permissions: ' . $fileInfo['perms'] . '</p>';
        echo '<p>Owner: ' . $fileInfo['owner'] . '</p>';
        echo '<p>Group: ' . $fileInfo['group'] . '</p>';
        echo '<p>Writable: ' . ($fileInfo['is_writable'] ? 'Yes' : 'No') . '</p>';
        
        // Show first few lines of the env file (without sensitive data)
        $content = file_get_contents($path);
        $lines = explode("\n", $content);
        $safeContent = '';
        
        foreach ($lines as $line) {
            if (preg_match('/^(APP_ENV|APP_DEBUG|CORS_ALLOW_ORIGIN|DATABASE_URL)/', $line)) {
                $safeContent .= $line . "\n";
            } elseif (preg_match('/(PASSWORD|KEY|SECRET|PASSPHRASE)/', $line)) {
                $parts = explode('=', $line, 2);
                if (count($parts) > 1) {
                    $safeContent .= $parts[0] . '=[HIDDEN]' . "\n";
                }
            }
        }
        
        echo '<pre>' . htmlspecialchars($safeContent) . '</pre>';
    } else {
        echo '<p class="warning">⚠ File does not exist</p>';
    }
    
    echo '</div>';
}

echo '</div>';

// Check cache directory
echo '<div class="card">';
echo '<h2>Cache Directory</h2>';

$cacheInfo = getFilePermissions($cacheDir);

if ($cacheInfo['exists']) {
    echo '<p class="success">✓ Cache directory exists</p>';
    echo '<p>Permissions: ' . $cacheInfo['perms'] . '</p>';
    echo '<p>Owner: ' . $cacheInfo['owner'] . '</p>';
    echo '<p>Group: ' . $cacheInfo['group'] . '</p>';
    echo '<p>Writable: ' . ($cacheInfo['is_writable'] ? 'Yes' : 'No') . '</p>';
    
    // Check subdirectories
    $prodCacheDir = $cacheDir . '/prod';
    $prodCacheInfo = getFilePermissions($prodCacheDir);
    
    if ($prodCacheInfo['exists']) {
        echo '<p><strong>Prod Cache:</strong> Exists (Permissions: ' . $prodCacheInfo['perms'] . ', Writable: ' . ($prodCacheInfo['is_writable'] ? 'Yes' : 'No') . ')</p>';
    } else {
        echo '<p><strong>Prod Cache:</strong> Does not exist</p>';
    }
} else {
    echo '<p class="error">✗ Cache directory does not exist</p>';
}

echo '</div>';

// Check JWT Configuration
echo '<div class="card">';
echo '<h2>JWT Configuration</h2>';

$jwtDir = $backendDir . '/config/jwt';
$jwtInfo = getFilePermissions($jwtDir);
$privateKeyInfo = getFilePermissions($jwtDir . '/private.pem');
$publicKeyInfo = getFilePermissions($jwtDir . '/public.pem');

if ($jwtInfo['exists']) {
    echo '<p class="success">✓ JWT directory exists</p>';
    echo '<p>Permissions: ' . $jwtInfo['perms'] . '</p>';
    echo '<p>Writable: ' . ($jwtInfo['is_writable'] ? 'Yes' : 'No') . '</p>';
    
    if ($privateKeyInfo['exists'] && $publicKeyInfo['exists']) {
        echo '<p class="success">✓ JWT key files exist</p>';
        echo '<p>Private Key Permissions: ' . $privateKeyInfo['perms'] . '</p>';
        echo '<p>Public Key Permissions: ' . $publicKeyInfo['perms'] . '</p>';
    } else {
        echo '<p class="error">✗ JWT key files are missing</p>';
    }
} else {
    echo '<p class="error">✗ JWT directory does not exist</p>';
}

echo '</div>';

// Fix Options
echo '<div class="card">';
echo '<h2>Fix Options</h2>';

if (isset($_POST['fix_permissions'])) {
    echo '<h3>Fixing Permissions...</h3>';
    
    // Create cache directory if it doesn't exist
    if (!file_exists($cacheDir)) {
        if (@mkdir($cacheDir, 0777, true)) {
            echo '<p class="success">✓ Created cache directory</p>';
        } else {
            echo '<p class="error">✗ Failed to create cache directory</p>';
        }
    }
    
    // Fix permissions on var directory
    if (file_exists($varDir)) {
        if (@chmod($varDir, 0777)) {
            echo '<p class="success">✓ Set var directory permissions to 777</p>';
        } else {
            echo '<p class="error">✗ Failed to set var directory permissions</p>';
        }
        
        // Try using system command
        @system('chmod -R 777 ' . escapeshellarg($varDir));
        echo '<p>Executed system command: chmod -R 777 ' . htmlspecialchars($varDir) . '</p>';
    }
    
    // Clear cache
    if (file_exists($cacheDir)) {
        $cacheContents = glob($cacheDir . '/*');
        foreach ($cacheContents as $item) {
            if (is_dir($item)) {
                @system('rm -rf ' . escapeshellarg($item));
            } else {
                @unlink($item);
            }
        }
        echo '<p class="success">✓ Cleared cache directory contents</p>';
    }
    
    // Create proper .env.local if needed
    if (!file_exists($envLocalFile) || filesize($envLocalFile) < 10) {
        $envContent = '';
        
        if (file_exists($envFile)) {
            $envContent = file_get_contents($envFile);
        }
        
        $envLocalContent = "APP_ENV=prod\n";
        
        // Extract JWT configuration from .env or .env.dev
        $jwtSecretKey = '';
        $jwtPublicKey = '';
        $jwtPassphrase = '';
        
        if (preg_match('/JWT_SECRET_KEY=([^\n]+)/', $envContent, $matches)) {
            $jwtSecretKey = trim($matches[1]);
        }
        
        if (preg_match('/JWT_PUBLIC_KEY=([^\n]+)/', $envContent, $matches)) {
            $jwtPublicKey = trim($matches[1]);
        }
        
        if (preg_match('/JWT_PASSPHRASE=([^\n]+)/', $envContent, $matches)) {
            $jwtPassphrase = trim($matches[1]);
        }
        
        // If not found in .env, try .env.dev
        if (file_exists($envDevFile) && (empty($jwtSecretKey) || empty($jwtPublicKey) || empty($jwtPassphrase))) {
            $envDevContent = file_get_contents($envDevFile);
            
            if (empty($jwtSecretKey) && preg_match('/JWT_SECRET_KEY=([^\n]+)/', $envDevContent, $matches)) {
                $jwtSecretKey = trim($matches[1]);
            }
            
            if (empty($jwtPublicKey) && preg_match('/JWT_PUBLIC_KEY=([^\n]+)/', $envDevContent, $matches)) {
                $jwtPublicKey = trim($matches[1]);
            }
            
            if (empty($jwtPassphrase) && preg_match('/JWT_PASSPHRASE=([^\n]+)/', $envDevContent, $matches)) {
                $jwtPassphrase = trim($matches[1]);
            }
        }
        
        // Add JWT configuration if available
        if (!empty($jwtSecretKey)) {
            $envLocalContent .= "JWT_SECRET_KEY=$jwtSecretKey\n";
        }
        
        if (!empty($jwtPublicKey)) {
            $envLocalContent .= "JWT_PUBLIC_KEY=$jwtPublicKey\n";
        }
        
        if (!empty($jwtPassphrase)) {
            $envLocalContent .= "JWT_PASSPHRASE=$jwtPassphrase\n";
        }
        
        // Add database configuration if found
        if (preg_match('/DATABASE_URL=([^\n]+)/', $envContent, $matches)) {
            $envLocalContent .= "DATABASE_URL=" . trim($matches[1]) . "\n";
        } elseif (file_exists($envDevFile) && preg_match('/DATABASE_URL=([^\n]+)/', file_get_contents($envDevFile), $matches)) {
            $envLocalContent .= "DATABASE_URL=" . trim($matches[1]) . "\n";
        }
        
        // Write the new .env.local file
        if (file_put_contents($envLocalFile, $envLocalContent)) {
            echo '<p class="success">✓ Created/updated .env.local file with proper configuration</p>';
            echo '<pre>' . htmlspecialchars($envLocalContent) . '</pre>';
        } else {
            echo '<p class="error">✗ Failed to write .env.local file</p>';
        }
    }
}

echo '<form method="post">';
echo '<p>Click the button below to fix common issues:</p>';
echo '<ul>';
echo '<li>Fix cache directory permissions (chmod 777)</li>';
echo '<li>Clear cache directory contents</li>';
echo '<li>Create/update .env.local with proper configuration</li>';
echo '</ul>';
echo '<button type="submit" name="fix_permissions">Fix Issues</button>';
echo '</form>';

echo '</div>';

echo <<<HTML
    </div>
</body>
</html>
HTML; 