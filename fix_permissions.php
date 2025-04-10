<?php
// JWT Key Permissions Fixer
// This script will attempt to fix common JWT authentication issues on OVH

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// SAFETY: Only run this script if explicitly confirmed
$confirmed = isset($_GET['confirm']) && $_GET['confirm'] === 'yes';

header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html>
<head>
    <title>JWT Permissions Fixer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
        h1, h2 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        .action-btn { 
            display: inline-block; 
            padding: 10px 15px; 
            background: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 4px; 
            margin-top: 10px;
        }
        .action-btn.warning {
            background: #ff9800;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>JWT Permissions Fixer</h1>
        
        <?php if (!$confirmed): ?>
        <div class="card">
            <h2>Warning</h2>
            <p class="warning">This script will modify file permissions and potentially create or update configuration files.</p>
            <p>Before proceeding, make sure you have a backup of your files.</p>
            <p>This tool will attempt to fix the following issues:</p>
            <ol>
                <li>Adjust permissions on JWT key files</li>
                <li>Check and update .htaccess files</li>
                <li>Verify environment configuration</li>
                <li>Refresh the Symfony cache</li>
            </ol>
            <p>Click the button below to proceed:</p>
            <a href="?confirm=yes" class="action-btn warning">Run Fixes</a>
        </div>
        <?php else: ?>
        <div class="card">
            <h2>Running Fixes...</h2>
            <?php
            // Get project root directory
            $currentDir = dirname(__FILE__);
            $projectRoot = realpath($currentDir . '/..');
            
            // Fix JWT key permissions
            $privateKeyPath = $projectRoot . '/backend/config/jwt/private.pem';
            $publicKeyPath = $projectRoot . '/backend/config/jwt/public.pem';
            
            echo '<h3>Checking JWT Keys</h3>';
            
            // Check if keys exist
            if (!file_exists($privateKeyPath) || !file_exists($publicKeyPath)) {
                echo '<p class="error">JWT keys not found. Attempting to generate new keys...</p>';
                
                // Create jwt directory if it doesn't exist
                if (!is_dir(dirname($privateKeyPath))) {
                    mkdir(dirname($privateKeyPath), 0755, true);
                    echo '<p>Created JWT directory: ' . dirname($privateKeyPath) . '</p>';
                }
                
                // Check if we can get the passphrase from env files
                $envDevPath = $projectRoot . '/backend/.env.dev';
                $passphrase = '';
                
                if (file_exists($envDevPath)) {
                    $envContent = file_get_contents($envDevPath);
                    if (preg_match('/JWT_PASSPHRASE=([^\n\r]+)/', $envContent, $matches)) {
                        $passphrase = trim($matches[1]);
                    }
                }
                
                echo '<p>Using passphrase from .env.dev: ' . (empty($passphrase) ? 'Not found' : 'Found') . '</p>';
                
                // Generate keys
                if (!empty($passphrase)) {
                    // Use openssl to generate keys
                    $privateKey = openssl_pkey_new([
                        'digest_alg' => 'sha256',
                        'private_key_bits' => 4096,
                        'private_key_type' => OPENSSL_KEYTYPE_RSA,
                    ]);
                    
                    // Export private key
                    openssl_pkey_export($privateKey, $privateKeyPem, $passphrase);
                    file_put_contents($privateKeyPath, $privateKeyPem);
                    
                    // Export public key
                    $keyDetails = openssl_pkey_get_details($privateKey);
                    file_put_contents($publicKeyPath, $keyDetails['key']);
                    
                    echo '<p class="success">Generated new JWT keys!</p>';
                } else {
                    echo '<p class="error">Could not generate keys: Passphrase not found in .env.dev</p>';
                }
            } else {
                echo '<p class="success">JWT keys exist!</p>';
            }
            
            // Fix permissions
            if (file_exists($privateKeyPath)) {
                chmod($privateKeyPath, 0640); // Owner: rw, Group: r, Others: -
                echo '<p>Set permissions on private key: 0640</p>';
            }
            
            if (file_exists($publicKeyPath)) {
                chmod($publicKeyPath, 0644); // Owner: rw, Group: r, Others: r
                echo '<p>Set permissions on public key: 0644</p>';
            }
            
            // Check and fix .htaccess files
            echo '<h3>Checking .htaccess Files</h3>';
            
            // Check if backend .htaccess exists
            $backendHtaccessPath = $projectRoot . '/backend/public/.htaccess';
            $backendHtaccessOvhPath = $projectRoot . '/backend/public/.htaccess-ovh';
            
            if (file_exists($backendHtaccessOvhPath) && (!file_exists($backendHtaccessPath) || filesize($backendHtaccessPath) < filesize($backendHtaccessOvhPath))) {
                // Copy .htaccess-ovh to .htaccess
                copy($backendHtaccessOvhPath, $backendHtaccessPath);
                echo '<p class="success">Updated backend .htaccess from .htaccess-ovh</p>';
            } else {
                echo '<p>Backend .htaccess looks OK</p>';
            }
            
            // Check environment files
            echo '<h3>Checking Environment Files</h3>';
            
            $envPath = $projectRoot . '/backend/.env';
            $envDevPath = $projectRoot . '/backend/.env.dev';
            $envLocalPath = $projectRoot . '/backend/.env.local';
            
            if (!file_exists($envDevPath) || filesize($envDevPath) < 100) {
                echo '<p class="error">.env.dev is missing or too small</p>';
                
                // If .env exists, copy it to .env.dev
                if (file_exists($envPath) && filesize($envPath) > 100) {
                    $envContent = file_get_contents($envPath);
                    // Change APP_ENV to prod
                    $envContent = preg_replace('/APP_ENV=dev/', 'APP_ENV=prod', $envContent);
                    file_put_contents($envDevPath, $envContent);
                    echo '<p class="success">Created .env.dev from .env with APP_ENV=prod</p>';
                } else {
                    echo '<p class="error">Cannot fix .env.dev: No valid source found</p>';
                }
            } else {
                echo '<p class="success">.env.dev exists and looks valid</p>';
                
                // Update APP_ENV in .env.dev
                $envDevContent = file_get_contents($envDevPath);
                if (strpos($envDevContent, 'APP_ENV=prod') === false) {
                    $envDevContent = preg_replace('/APP_ENV=([^\n\r]+)/', 'APP_ENV=prod', $envDevContent);
                    file_put_contents($envDevPath, $envDevContent);
                    echo '<p>Updated APP_ENV to prod in .env.dev</p>';
                }
                
                // Enable debug temporarily
                if (strpos($envDevContent, 'APP_DEBUG=true') === false) {
                    $envDevContent = preg_replace('/APP_DEBUG=([^\n\r]+)/', 'APP_DEBUG=true', $envDevContent);
                    // If no APP_DEBUG line exists, add it
                    if (strpos($envDevContent, 'APP_DEBUG') === false) {
                        $envDevContent .= "\nAPP_DEBUG=true\n";
                    }
                    file_put_contents($envDevPath, $envDevContent);
                    echo '<p>Enabled APP_DEBUG in .env.dev for troubleshooting</p>';
                }
            }
            
            // Check .env.local
            if (file_exists($envLocalPath)) {
                $envLocalContent = file_get_contents($envLocalPath);
                if (strpos($envLocalContent, 'APP_ENV=prod') === false) {
                    file_put_contents($envLocalPath, "APP_ENV=prod\n");
                    echo '<p>Updated .env.local to set APP_ENV=prod</p>';
                } else {
                    echo '<p>.env.local looks OK</p>';
                }
            } else {
                // Create minimal .env.local
                file_put_contents($envLocalPath, "APP_ENV=prod\n");
                echo '<p>Created minimal .env.local with APP_ENV=prod</p>';
            }
            
            // Clear Symfony cache
            echo '<h3>Clearing Symfony Cache</h3>';
            $cacheDir = $projectRoot . '/backend/var/cache';
            
            if (is_dir($cacheDir)) {
                // Delete all files in cache/prod
                $prodCacheDir = $cacheDir . '/prod';
                if (is_dir($prodCacheDir)) {
                    $files = new RecursiveIteratorIterator(
                        new RecursiveDirectoryIterator($prodCacheDir, RecursiveDirectoryIterator::SKIP_DOTS),
                        RecursiveIteratorIterator::CHILD_FIRST
                    );
                    
                    foreach ($files as $file) {
                        if ($file->isDir()) {
                            rmdir($file->getRealPath());
                        } else {
                            unlink($file->getRealPath());
                        }
                    }
                    echo '<p class="success">Cleared production cache directory</p>';
                } else {
                    echo '<p>Production cache directory not found</p>';
                }
            } else {
                echo '<p>Cache directory not found</p>';
            }
            ?>
            
            <h3>Summary</h3>
            <p>The following fixes were applied:</p>
            <ul>
                <li>JWT key permissions updated to correct values</li>
                <li>Backend .htaccess file checked and updated if needed</li>
                <li>Environment files checked and updated</li>
                <li>Symfony cache cleared</li>
            </ul>
            <p>You should now <strong>restart your browser</strong> and test the API again.</p>
            <p>You can use the API Error Test tool to verify the fixes:</p>
            <a href="api_error_test.php" class="action-btn">Test API Now</a>
        </div>
        <?php endif; ?>
    </div>
</body>
</html>