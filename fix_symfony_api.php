<?php
/**
 * Symfony API Fix Tool
 * 
 * This script fixes common Symfony API issues on OVH servers:
 * 1. Creates and fixes permissions for var/cache directory
 * 2. Ensures JWT configuration is correct
 * 3. Sets proper environment variables
 */

// Basic HTML styling
echo <<<HTML
<!DOCTYPE html>
<html>
<head>
    <title>Symfony API Fix Tool</title>
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
        <h1>Symfony API Fix Tool</h1>
HTML;

// Determine project structure
$currentDir = getcwd();
$backendDir = file_exists($currentDir . '/backend') 
    ? $currentDir . '/backend' 
    : $currentDir;

echo '<div class="card">';
echo '<h2>Environment Information</h2>';
echo '<p><strong>PHP Version:</strong> ' . phpversion() . '</p>';
echo '<p><strong>Server:</strong> ' . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . '</p>';
echo '<p><strong>Current Directory:</strong> ' . $currentDir . '</p>';
echo '<p><strong>Backend Directory:</strong> ' . $backendDir . '</p>';
echo '</div>';

// Current permissions
function getPermissions($path) {
    if (!file_exists($path)) {
        return [
            'exists' => false,
            'path' => $path
        ];
    }
    
    return [
        'exists' => true,
        'path' => $path,
        'permissions' => substr(sprintf('%o', fileperms($path)), -4),
        'writable' => is_writable($path)
    ];
}

// Directory paths
$varDir = $backendDir . '/var';
$cacheDir = $varDir . '/cache';
$jwtDir = $backendDir . '/config/jwt';
$srcDir = $backendDir . '/src';
$controllersDir = $srcDir . '/Controller';

// Check current permissions
echo '<div class="card">';
echo '<h2>Current Directory Permissions</h2>';

$directories = [
    'var' => $varDir,
    'cache' => $cacheDir,
    'jwt' => $jwtDir,
    'src' => $srcDir,
    'controllers' => $controllersDir
];

foreach ($directories as $name => $path) {
    $info = getPermissions($path);
    
    echo "<h3>$name Directory</h3>";
    if ($info['exists']) {
        echo '<p class="success">✓ Exists</p>';
        echo '<p>Permissions: ' . $info['permissions'] . '</p>';
        echo '<p>Writable: ' . ($info['writable'] ? 'Yes' : 'No') . '</p>';
    } else {
        echo '<p class="error">✗ Does not exist</p>';
    }
}

echo '</div>';

// Fix application
if (isset($_POST['fix_api'])) {
    echo '<div class="card">';
    echo '<h2>Applying Fixes</h2>';
    
    // Step 1: Fix directory permissions
    echo '<h3>Step 1: Fixing Directory Permissions</h3>';
    
    // Create directories if they don't exist
    if (!file_exists($varDir)) {
        if (mkdir($varDir, 0777, true)) {
            echo '<p class="success">✓ Created var directory</p>';
        } else {
            echo '<p class="error">✗ Failed to create var directory</p>';
        }
    }
    
    if (!file_exists($cacheDir)) {
        if (mkdir($cacheDir, 0777, true)) {
            echo '<p class="success">✓ Created cache directory</p>';
        } else {
            echo '<p class="error">✗ Failed to create cache directory</p>';
        }
    }
    
    // Set permissions
    if (file_exists($varDir)) {
        if (@chmod($varDir, 0777)) {
            echo '<p class="success">✓ Set var directory permissions to 777</p>';
        } else {
            echo '<p class="error">✗ Failed to set var directory permissions</p>';
            echo '<p>Trying system command...</p>';
            @system('chmod -R 777 ' . escapeshellarg($varDir));
            echo '<p>Executed: chmod -R 777 ' . htmlspecialchars($varDir) . '</p>';
        }
    }
    
    // Create prod cache directory
    $prodCacheDir = $cacheDir . '/prod';
    if (!file_exists($prodCacheDir)) {
        if (mkdir($prodCacheDir, 0777, true)) {
            echo '<p class="success">✓ Created prod cache directory</p>';
        } else {
            echo '<p class="error">✗ Failed to create prod cache directory</p>';
        }
    }
    
    // Step 2: Fix JWT configuration
    echo '<h3>Step 2: Checking JWT Configuration</h3>';
    
    // Check JWT directory
    if (!file_exists($jwtDir)) {
        if (mkdir($jwtDir, 0777, true)) {
            echo '<p class="success">✓ Created JWT directory</p>';
        } else {
            echo '<p class="error">✗ Failed to create JWT directory</p>';
        }
    } else {
        echo '<p class="success">✓ JWT directory exists</p>';
    }
    
    // Check JWT keys
    $privateKeyPath = $jwtDir . '/private.pem';
    $publicKeyPath = $jwtDir . '/public.pem';
    $keysExist = file_exists($privateKeyPath) && file_exists($publicKeyPath);
    
    if (!$keysExist) {
        echo '<p class="warning">⚠ JWT key files missing, attempting to generate them</p>';
        
        // Try to find passphrase in .env files
        $envFile = $backendDir . '/.env';
        $envLocalFile = $backendDir . '/.env.local';
        $envDevFile = $backendDir . '/.env.dev';
        
        $passphrase = '';
        
        // Check .env files for passphrase
        foreach ([$envDevFile, $envFile, $envLocalFile] as $file) {
            if (file_exists($file)) {
                $content = file_get_contents($file);
                if (preg_match('/JWT_PASSPHRASE=([^\n\r]+)/', $content, $matches)) {
                    $passphrase = trim($matches[1]);
                    echo '<p class="success">✓ Found JWT_PASSPHRASE in ' . basename($file) . '</p>';
                    break;
                }
            }
        }
        
        // If no passphrase found, use default
        if (empty($passphrase)) {
            $passphrase = '9941583c5b114eb7fd76e3477c2b0582c3faea5a342652d62199c3e964c10bbf';
            echo '<p class="warning">⚠ Using hardcoded passphrase</p>';
        }
        
        // Generate keys
        if (!empty($passphrase)) {
            // Use openssl to generate keys
            $privateKey = openssl_pkey_new([
                'digest_alg' => 'sha256',
                'private_key_bits' => 4096,
                'private_key_type' => OPENSSL_KEYTYPE_RSA,
            ]);
            
            // Export private key
            if (openssl_pkey_export($privateKey, $privateKeyPem, $passphrase)) {
                file_put_contents($privateKeyPath, $privateKeyPem);
                echo '<p class="success">✓ Generated private key</p>';
                
                // Export public key
                $keyDetails = openssl_pkey_get_details($privateKey);
                if (file_put_contents($publicKeyPath, $keyDetails['key'])) {
                    echo '<p class="success">✓ Generated public key</p>';
                } else {
                    echo '<p class="error">✗ Failed to write public key</p>';
                }
            } else {
                echo '<p class="error">✗ Failed to generate private key</p>';
            }
        }
    } else {
        echo '<p class="success">✓ JWT key files exist</p>';
    }
    
    // Fix JWT key permissions
    if (file_exists($privateKeyPath)) {
        chmod($privateKeyPath, 0640);
        echo '<p class="success">✓ Set private key permissions to 0640</p>';
    }
    
    if (file_exists($publicKeyPath)) {
        chmod($publicKeyPath, 0644);
        echo '<p class="success">✓ Set public key permissions to 0644</p>';
    }
    
    // Step 3: Fix environment configuration
    echo '<h3>Step 3: Setting Up Environment Configuration</h3>';
    
    // Environment files
    $envFile = $backendDir . '/.env';
    $envLocalFile = $backendDir . '/.env.local';
    $envLocalExists = file_exists($envLocalFile);
    
    // Create .env.local if it doesn't exist
    if (!$envLocalExists || filesize($envLocalFile) < 10) {
        echo '<p' . ($envLocalExists ? ' class="warning">⚠ Existing .env.local is empty or invalid' : ' class="warning">⚠ .env.local does not exist') . ', creating it</p>';
        
        // Get environment variables from other env files
        $envContent = file_exists($envFile) ? file_get_contents($envFile) : '';
        $envDevContent = file_exists($backendDir . '/.env.dev') ? file_get_contents($backendDir . '/.env.dev') : '';
        
        // Create .env.local content
        $envLocalContent = "APP_ENV=prod\n";
        $envLocalContent .= "APP_DEBUG=1\n";  // Enable debug temporarily to see errors
        
        // Extract JWT settings
        $jwtSettings = [];
        foreach (['JWT_SECRET_KEY', 'JWT_PUBLIC_KEY', 'JWT_PASSPHRASE'] as $key) {
            $found = false;
            foreach ([$envDevContent, $envContent] as $content) {
                if (preg_match("/$key=([^\n\r]+)/", $content, $matches)) {
                    $jwtSettings[$key] = trim($matches[1]);
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                if ($key === 'JWT_SECRET_KEY') {
                    $jwtSettings[$key] = '%kernel.project_dir%/config/jwt/private.pem';
                } elseif ($key === 'JWT_PUBLIC_KEY') {
                    $jwtSettings[$key] = '%kernel.project_dir%/config/jwt/public.pem';
                } elseif ($key === 'JWT_PASSPHRASE') {
                    $jwtSettings[$key] = $passphrase ?? '9941583c5b114eb7fd76e3477c2b0582c3faea5a342652d62199c3e964c10bbf';
                }
            }
            
            $envLocalContent .= "$key={$jwtSettings[$key]}\n";
        }
        
        // Extract DATABASE_URL
        if (preg_match('/DATABASE_URL=([^\n\r]+)/', $envDevContent . "\n" . $envContent, $matches)) {
            $envLocalContent .= "DATABASE_URL=" . trim($matches[1]) . "\n";
        }
        
        // Other important settings
        if (preg_match('/CORS_ALLOW_ORIGIN=([^\n\r]+)/', $envDevContent . "\n" . $envContent, $matches)) {
            $envLocalContent .= "CORS_ALLOW_ORIGIN=" . trim($matches[1]) . "\n";
        } else {
            $envLocalContent .= "CORS_ALLOW_ORIGIN='^https?://(localhost|127\\.0\\.0\\.1|bigproject-development\\.konstantine\\.fr)(:[0-9]+)?$'\n";
        }
        
        // Write .env.local
        if (file_put_contents($envLocalFile, $envLocalContent)) {
            echo '<p class="success">✓ Created .env.local file with the following content:</p>';
            echo '<pre>' . htmlspecialchars($envLocalContent) . '</pre>';
        } else {
            echo '<p class="error">✗ Failed to write .env.local file</p>';
        }
    } else {
        echo '<p class="success">✓ .env.local file exists</p>';
    }
    
    // Step 4: Clear cache and warm up
    echo '<h3>Step 4: Clearing Cache</h3>';
    
    // Clear cache files
    if (file_exists($cacheDir)) {
        $cacheItems = glob($cacheDir . '/*');
        foreach ($cacheItems as $item) {
            if (is_dir($item)) {
                @system('rm -rf ' . escapeshellarg($item));
            } else {
                @unlink($item);
            }
        }
        echo '<p class="success">✓ Cleared cache directory</p>';
    }
    
    // Try to warm up cache using console
    $consolePath = $backendDir . '/bin/console';
    if (file_exists($consolePath)) {
        echo '<p>Attempting to warm up cache with console command...</p>';
        $output = [];
        $command = 'cd ' . escapeshellarg($backendDir) . ' && php bin/console cache:warmup --env=prod 2>&1';
        exec($command, $output, $returnCode);
        
        if ($returnCode === 0) {
            echo '<p class="success">✓ Successfully warmed up cache</p>';
        } else {
            echo '<p class="warning">⚠ Cache warmup command returned code ' . $returnCode . '</p>';
            echo '<pre>' . htmlspecialchars(implode("\n", $output)) . '</pre>';
        }
    }
    
    echo '<h3>Complete!</h3>';
    echo '<p>All fixes have been applied. Try accessing the API endpoints now.</p>';
    echo '</div>';
}

// Form for applying fixes
echo '<div class="card">';
echo '<h2>Fix API Issues</h2>';
echo '<p>This tool will:</p>';
echo '<ol>';
echo '<li>Fix directory permissions for var/cache</li>';
echo '<li>Check and generate JWT key files if missing</li>';
echo '<li>Create proper .env.local configuration</li>';
echo '<li>Clear cache and attempt to warm it up</li>';
echo '</ol>';

echo '<form method="post">';
echo '<button type="submit" name="fix_api">Apply API Fixes</button>';
echo '</form>';
echo '</div>';

// Test API endpoints
echo '<div class="card">';
echo '<h2>Test API Endpoints</h2>';
echo '<p>After applying fixes, test these endpoints:</p>';
echo '<ul>';
echo '<li><a href="/api/login_check" target="_blank">/api/login_check</a> (POST required)</li>';
echo '<li><a href="/api/me" target="_blank">/api/me</a> (requires authentication)</li>';
echo '<li><a href="/api/profile" target="_blank">/api/profile</a> (requires authentication)</li>';
echo '</ul>';
echo '<p>Use the browser developer tools to monitor responses.</p>';
echo '</div>';

echo <<<HTML
    </div>
</body>
</html>
HTML; 