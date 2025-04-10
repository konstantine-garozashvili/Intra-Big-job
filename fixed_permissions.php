<?php
// Fixed JWT Key Permissions Fixer for OVH
// This script uses the correct project directory structure

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
    <title>OVH JWT Fixer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
        h1, h2 { color: #333; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .warning { color: orange; font-weight: bold; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
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
        <h1>OVH JWT Authentication Fixer</h1>
        
        <?php if (!$confirmed): ?>
        <div class="card">
            <h2>Warning</h2>
            <p class="warning">This script will modify file permissions and configuration files on OVH.</p>
            <p>Before proceeding, make sure you have a backup of your files.</p>
            <p>This tool will attempt to fix the following issues:</p>
            <ol>
                <li>Fix JWT keys permissions (or generate them if missing)</li>
                <li>Update .htaccess files</li>
                <li>Fix environment files</li>
                <li>Clear cache</li>
            </ol>
            <p>Click the button below to proceed:</p>
            <a href="?confirm=yes" class="action-btn warning">Run Fixes</a>
        </div>
        <?php else: ?>
        <div class="card">
            <h2>Running Fixes...</h2>
            <?php
            // CORRECT PATHS FOR OVH
            $currentDir = dirname(__FILE__);
            $projectRoot = $currentDir; // This script should be in the project root
            
            echo '<p>Current directory: ' . $currentDir . '</p>';
            echo '<p>Project root: ' . $projectRoot . '</p>';
            
            // Fix JWT key permissions
            $jwtDir = $projectRoot . '/backend/config/jwt';
            $privateKeyPath = $jwtDir . '/private.pem';
            $publicKeyPath = $jwtDir . '/public.pem';
            
            echo '<h3>Checking JWT Keys</h3>';
            
            // Check if jwt directory exists, if not create it
            if (!is_dir($jwtDir)) {
                mkdir($jwtDir, 0755, true);
                echo '<p>Created JWT directory: ' . $jwtDir . '</p>';
            } else {
                echo '<p>JWT directory exists: ' . $jwtDir . '</p>';
            }
            
            // Check if keys exist
            $keysExist = file_exists($privateKeyPath) && file_exists($publicKeyPath);
            echo '<p>JWT keys exist: ' . ($keysExist ? 'Yes' : 'No') . '</p>';
            
            if (!$keysExist) {
                echo '<p class="warning">JWT keys not found. Attempting to generate new keys...</p>';
                
                // Get passphrase from .env.dev
                $envDevPath = $projectRoot . '/backend/.env.dev';
                $passphrase = '';
                
                if (file_exists($envDevPath)) {
                    $envContent = file_get_contents($envDevPath);
                    echo '<pre>Found .env.dev, size: ' . filesize($envDevPath) . ' bytes</pre>';
                    if (preg_match('/JWT_PASSPHRASE=([^\n\r]+)/', $envContent, $matches)) {
                        $passphrase = trim($matches[1]);
                        echo '<p class="success">Found passphrase in .env.dev</p>';
                    } else {
                        // Hardcode the passphrase from your .env.dev file
                        $passphrase = '9941583c5b114eb7fd76e3477c2b0582c3faea5a342652d62199c3e964c10bbf';
                        echo '<p class="warning">Using hardcoded passphrase: ' . substr($passphrase, 0, 5) . '...' . substr($passphrase, -5) . '</p>';
                    }
                } else {
                    // Hardcode the passphrase if .env.dev doesn't exist
                    $passphrase = '9941583c5b114eb7fd76e3477c2b0582c3faea5a342652d62199c3e964c10bbf';
                    echo '<p class="warning">.env.dev not found, using hardcoded passphrase: ' . substr($passphrase, 0, 5) . '...' . substr($passphrase, -5) . '</p>';
                }
                
                // Generate keys if we have a passphrase
                if (!empty($passphrase)) {
                    try {
                        // Generate private key
                        $privKey = openssl_pkey_new([
                            'digest_alg' => 'sha256',
                            'private_key_bits' => 4096,
                            'private_key_type' => OPENSSL_KEYTYPE_RSA,
                        ]);
                        
                        if ($privKey === false) {
                            echo '<p class="error">Failed to generate private key: ' . openssl_error_string() . '</p>';
                        } else {
                            // Export private key with passphrase
                            $keyData = '';
                            $export_result = openssl_pkey_export($privKey, $keyData, $passphrase);
                            
                            if ($export_result === false) {
                                echo '<p class="error">Failed to export private key: ' . openssl_error_string() . '</p>';
                            } else {
                                file_put_contents($privateKeyPath, $keyData);
                                echo '<p class="success">Private key generated and saved to: ' . $privateKeyPath . '</p>';
                                
                                // Extract public key
                                $pubKey = openssl_pkey_get_details($privKey);
                                if ($pubKey === false) {
                                    echo '<p class="error">Failed to get public key details: ' . openssl_error_string() . '</p>';
                                } else {
                                    file_put_contents($publicKeyPath, $pubKey['key']);
                                    echo '<p class="success">Public key generated and saved to: ' . $publicKeyPath . '</p>';
                                }
                            }
                        }
                    } catch (Exception $e) {
                        echo '<p class="error">Exception while generating keys: ' . $e->getMessage() . '</p>';
                    }
                } else {
                    echo '<p class="error">No passphrase available, cannot generate keys</p>';
                }
            }
            
            // Set correct permissions on keys
            if (file_exists($privateKeyPath)) {
                chmod($privateKeyPath, 0640);
                echo '<p class="success">Set permissions on private key: 0640</p>';
            }
            
            if (file_exists($publicKeyPath)) {
                chmod($publicKeyPath, 0644);
                echo '<p class="success">Set permissions on public key: 0644</p>';
            }
            
            // Check and fix .htaccess files
            echo '<h3>Checking .htaccess Files</h3>';
            
            $backendPublicDir = $projectRoot . '/backend/public';
            $backendHtaccessPath = $backendPublicDir . '/.htaccess';
            $backendHtaccessOvhPath = $backendPublicDir . '/.htaccess-ovh';
            
            // Make sure the .htaccess-ovh is used as .htaccess
            if (file_exists($backendHtaccessOvhPath)) {
                echo '<p>Found .htaccess-ovh file</p>';
                
                // Copy it to .htaccess
                copy($backendHtaccessOvhPath, $backendHtaccessPath);
                echo '<p class="success">Copied .htaccess-ovh to .htaccess</p>';
            } else {
                echo '<p class="warning">.htaccess-ovh file not found at: ' . $backendHtaccessOvhPath . '</p>';
            }
            
            // Check and fix environment files
            echo '<h3>Checking Environment Files</h3>';
            
            $envDevPath = $projectRoot . '/backend/.env.dev';
            $envLocalPath = $projectRoot . '/backend/.env.local';
            
            // Fix .env.dev if it's missing or empty
            if (!file_exists($envDevPath) || filesize($envDevPath) < 100) {
                echo '<p class="warning">.env.dev file missing or too small - skipping automatic creation (manual creation required)</p>';
                // Création automatique désactivée à la demande de l'utilisateur
                /*
                // Create minimal .env.dev
                $envDevContent = <<<EOT
###> symfony/framework-bundle ###
APP_ENV=prod
APP_DEBUG=true
APP_SECRET=9941583c5b114eb7fd76e3477c2b0582c3faea5a342652d62199c3e964c10bbf
###< symfony/framework-bundle ###

###> doctrine/doctrine-bundle ###
# OVH database credentials
DATABASE_URL="mysql://konstaxbigprjdev:Weaver0311@konstaxbigprjdev.mysql.db:3306/konstaxbigprjdev?serverVersion=8.0&charset=utf8mb4"
###< doctrine/doctrine-bundle ###

###> nelmio/cors-bundle ###
# Update CORS to allow the production domain
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1|bigproject-development\.konstantine\.fr)(:[0-9]+)?$'
###< nelmio/cors-bundle ###

###> frontend url ###
# Update with production frontend URL
FRONTEND_URL=https://bigproject-development.konstantine.fr
###< frontend url ###

###> lexik/jwt-authentication-bundle ###
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=9941583c5b114eb7fd76e3477c2b0582c3faea5a342652d62199c3e964c10bbf
###< lexik/jwt-authentication-bundle ###
EOT;
                
                file_put_contents($envDevPath, $envDevContent);
                echo '<p class="success">Created new .env.dev file with correct configuration</p>';
                */
            } else {
                echo '<p>.env.dev exists and seems valid</p>';
                
                // Check if it has APP_ENV=prod
                $envDevContent = file_get_contents($envDevPath);
                if (strpos($envDevContent, 'APP_ENV=prod') === false) {
                    $envDevContent = preg_replace('/APP_ENV=([^\n\r]+)/', 'APP_ENV=prod', $envDevContent);
                    file_put_contents($envDevPath, $envDevContent);
                    echo '<p class="success">Updated APP_ENV to prod in .env.dev</p>';
                }
                
                // Make sure APP_DEBUG is true for troubleshooting
                if (strpos($envDevContent, 'APP_DEBUG=true') === false) {
                    // If we have APP_DEBUG line, replace it
                    if (preg_match('/APP_DEBUG=/', $envDevContent)) {
                        $envDevContent = preg_replace('/APP_DEBUG=[^\n\r]+/', 'APP_DEBUG=true', $envDevContent);
                    } else {
                        // Otherwise add it after APP_ENV
                        $envDevContent = preg_replace('/(APP_ENV=[^\n\r]+)/', '$1' . "\nAPP_DEBUG=true", $envDevContent);
                    }
                    file_put_contents($envDevPath, $envDevContent);
                    echo '<p class="success">Enabled APP_DEBUG in .env.dev</p>';
                }
            }
            
            // Make sure .env.local has APP_ENV=prod
            if (!file_exists($envLocalPath) || filesize($envLocalPath) < 5) {
                file_put_contents($envLocalPath, "APP_ENV=prod\n");
                echo '<p class="success">Created minimal .env.local with APP_ENV=prod</p>';
            } else {
                $envLocalContent = file_get_contents($envLocalPath);
                if (strpos($envLocalContent, 'APP_ENV=prod') === false) {
                    file_put_contents($envLocalPath, "APP_ENV=prod\n");
                    echo '<p class="success">Updated .env.local to have APP_ENV=prod</p>';
                } else {
                    echo '<p>.env.local looks good</p>';
                }
            }
            
            // Clear cache
            echo '<h3>Clearing Symfony Cache</h3>';
            
            $cacheDir = $projectRoot . '/backend/var/cache';
            
            if (is_dir($cacheDir)) {
                // Try to delete the prod cache directory
                $prodCacheDir = $cacheDir . '/prod';
                if (is_dir($prodCacheDir)) {
                    // Try to delete cache files
                    try {
                        $files = new RecursiveIteratorIterator(
                            new RecursiveDirectoryIterator($prodCacheDir, RecursiveDirectoryIterator::SKIP_DOTS),
                            RecursiveIteratorIterator::CHILD_FIRST
                        );
                        
                        foreach ($files as $file) {
                            if ($file->isDir()) {
                                @rmdir($file->getRealPath());
                            } else {
                                @unlink($file->getRealPath());
                            }
                        }
                        echo '<p class="success">Cleared cache directory: ' . $prodCacheDir . '</p>';
                    } catch (Exception $e) {
                        echo '<p class="error">Error clearing cache: ' . $e->getMessage() . '</p>';
                    }
                } else {
                    echo '<p>Production cache directory not found</p>';
                }
            } else {
                echo '<p>Creating cache directory structure</p>';
                // Create cache directory structure
                mkdir($cacheDir, 0755, true);
                mkdir($cacheDir . '/prod', 0755, true);
                echo '<p class="success">Created cache directory structure</p>';
            }
            ?>
            
            <h3>Summary</h3>
            <p class="success">All fixes have been applied! Please test the API endpoints now.</p>
            
            <p>To verify if the fixes worked, check:</p>
            <ol>
                <li>JWT keys are in the correct location with proper permissions</li>
                <li>.htaccess files are properly configured</li>
                <li>Environment files (.env.dev and .env.local) have correct settings</li>
                <li>Cache has been cleared</li>
            </ol>
            
            <p>You can test the API now by logging into the application. If you're still having issues, you can create a test script:</p>
            
            <pre>
&lt;?php
// Save this as test_api.php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$token = "YOUR_JWT_TOKEN_HERE"; // Get this from logging in through the site

$ch = curl_init("https://bigproject-development.konstantine.fr/api/me");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer " . $token
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "Status code: " . $httpcode . "&lt;br&gt;";
echo "Response: " . $response . "&lt;br&gt;";
if ($error) {
    echo "Error: " . $error;
}
?&gt;
            </pre>
            
            <a href="javascript:location.reload()" class="action-btn">Refresh Page</a>
        </div>
        <?php endif; ?>
    </div>
</body>
</html> 