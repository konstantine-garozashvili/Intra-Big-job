<?php
// Environment Variable Fix Tool for OVH
// This script specifically targets JWT environment variable loading issues

// Turn on error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Environment Variable Fix</title>
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
        <h1>Environment Variable Fix Tool</h1>
        
        <div class="card">
            <h2>Server Environment</h2>
            <?php
            $projectRoot = dirname(__FILE__);
            echo '<p><strong>PHP Version:</strong> ' . phpversion() . '</p>';
            echo '<p><strong>Server:</strong> ' . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . '</p>';
            echo '<p><strong>Document Root:</strong> ' . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . '</p>';
            echo '<p><strong>Current Directory:</strong> ' . $projectRoot . '</p>';
            ?>
        </div>
        
        <div class="card">
            <h2>Current Environment Variables</h2>
            <?php
            $envVars = [
                'APP_ENV' => getenv('APP_ENV'),
                'APP_DEBUG' => getenv('APP_DEBUG'),
                'JWT_SECRET_KEY' => getenv('JWT_SECRET_KEY') ? '[SET]' : 'Not set',
                'JWT_PUBLIC_KEY' => getenv('JWT_PUBLIC_KEY') ? '[SET]' : 'Not set',
                'JWT_PASSPHRASE' => getenv('JWT_PASSPHRASE') ? '[SET]' : 'Not set'
            ];
            
            foreach ($envVars as $name => $value) {
                $status = $value && $value !== 'Not set' ? 'success' : 'error';
                echo '<p><strong>' . $name . ':</strong> <span class="' . $status . '">' . ($value ?: 'Not set') . '</span></p>';
            }
            ?>
        </div>
        
        <?php
        // Process fix request
        if (isset($_POST['fix_env'])) {
            echo '<div class="card">';
            echo '<h2>Applying Fixes</h2>';
            
            $backendDir = $projectRoot . '/backend';
            $envDevPath = $backendDir . '/.env.dev';
            $envLocalPath = $backendDir . '/.env.local';
            $dotEnvPath = $backendDir . '/.env';
            
            // 1. First check if we can read the current env files
            echo '<h3>Reading Environment Files</h3>';
            
            if (file_exists($envDevPath) && is_readable($envDevPath)) {
                echo '<p class="success">✓ Can read .env.dev file</p>';
                $envDevContent = file_get_contents($envDevPath);
            } else {
                echo '<p class="error">✗ Cannot read .env.dev file</p>';
                $envDevContent = null;
            }
            
            if (file_exists($dotEnvPath) && is_readable($dotEnvPath)) {
                echo '<p class="success">✓ Can read .env file</p>';
                $dotEnvContent = file_get_contents($dotEnvPath);
            } else {
                echo '<p class="error">✗ Cannot read .env file</p>';
                $dotEnvContent = null;
            }
            
            // 2. Extract JWT passphrase from env files if available
            $jwtPassphrase = null;
            if ($envDevContent) {
                if (preg_match('/JWT_PASSPHRASE\s*=\s*(.+)/', $envDevContent, $matches)) {
                    $jwtPassphrase = trim($matches[1]);
                    echo '<p class="success">✓ Found JWT_PASSPHRASE in .env.dev file</p>';
                } else {
                    echo '<p class="warning">⚠ JWT_PASSPHRASE not found in .env.dev file</p>';
                }
            }
            
            if (!$jwtPassphrase && $dotEnvContent) {
                if (preg_match('/JWT_PASSPHRASE\s*=\s*(.+)/', $dotEnvContent, $matches)) {
                    $jwtPassphrase = trim($matches[1]);
                    echo '<p class="success">✓ Found JWT_PASSPHRASE in .env file</p>';
                } else {
                    echo '<p class="warning">⚠ JWT_PASSPHRASE not found in .env file</p>';
                }
            }
            
            // 3. Update .env.local with all necessary JWT config
            echo '<h3>Updating Environment Configuration</h3>';
            
            // Get JWT key paths
            $privateKeyPath = $backendDir . '/config/jwt/private.pem';
            $publicKeyPath = $backendDir . '/config/jwt/public.pem';
            
            $privateKeyExists = file_exists($privateKeyPath);
            $publicKeyExists = file_exists($publicKeyPath);
            
            echo '<p><strong>Private Key:</strong> ' . ($privateKeyExists ? 
                 '<span class="success">Exists</span>' : '<span class="error">Missing</span>') . '</p>';
            echo '<p><strong>Public Key:</strong> ' . ($publicKeyExists ? 
                 '<span class="success">Exists</span>' : '<span class="error">Missing</span>') . '</p>';
            
            // Create a comprehensive .env.local file with explicit JWT configuration
            $newEnvLocalContent = "APP_ENV=prod\n";
            
            if ($privateKeyExists && $publicKeyExists && $jwtPassphrase) {
                $newEnvLocalContent .= "JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem\n";
                $newEnvLocalContent .= "JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem\n";
                $newEnvLocalContent .= "JWT_PASSPHRASE={$jwtPassphrase}\n";
                
                // Try to write the updated .env.local file
                if (file_put_contents($envLocalPath, $newEnvLocalContent)) {
                    echo '<p class="success">✓ Successfully updated .env.local with JWT configuration</p>';
                    echo '<pre>' . htmlspecialchars($newEnvLocalContent) . '</pre>';
                } else {
                    echo '<p class="error">✗ Failed to write .env.local file</p>';
                }
            } else {
                if (!$jwtPassphrase) {
                    echo '<p class="error">✗ Cannot update .env.local: JWT_PASSPHRASE is missing</p>';
                } else {
                    echo '<p class="error">✗ Cannot update .env.local: JWT key files are missing</p>';
                }
            }
            
            // 4. Clear Symfony cache to ensure new env vars are loaded
            echo '<h3>Clearing Symfony Cache</h3>';
            $cacheDir = $backendDir . '/var/cache';
            
            if (is_dir($cacheDir)) {
                $cacheDirContents = glob($cacheDir . '/*');
                foreach ($cacheDirContents as $item) {
                    if (is_dir($item)) {
                        array_map('unlink', glob("$item/*.*"));
                        @rmdir($item);
                    } else {
                        @unlink($item);
                    }
                }
                echo '<p class="success">✓ Cache directory cleared</p>';
            } else {
                echo '<p class="warning">⚠ Cache directory not found at: ' . $cacheDir . '</p>';
                // Try to create it
                if (@mkdir($cacheDir, 0755, true)) {
                    echo '<p class="success">✓ Cache directory created</p>';
                } else {
                    echo '<p class="error">✗ Could not create cache directory</p>';
                }
            }
            
            echo '<div class="card">';
            echo '<h2>Next Steps</h2>';
            echo '<p>1. Reload the page to see if environment variables are now loading correctly</p>';
            echo '<p>2. Test the API endpoints using the <a href="api_error_test.php">API Error Test tool</a></p>';
            echo '</div>';
            
            echo '</div>';
        } else {
            // Display the fix form
            ?>
            <div class="card">
                <h2>Fix Environment Variables</h2>
                <p>This tool will:</p>
                <ol>
                    <li>Extract JWT configuration from existing environment files</li>
                    <li>Create a properly configured .env.local file with all JWT settings</li>
                    <li>Clear the Symfony cache to reload environment variables</li>
                </ol>
                <form method="post">
                    <button type="submit" name="fix_env">Apply Environment Fixes</button>
                </form>
            </div>
            <?php
        }
        ?>
        
    </div>
</body>
</html> 