<?php
// Simple API Error Test
// This script will attempt to login and test authenticated endpoints

// Turn on all error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html>
<head>
    <title>API Error Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .container { max-width: 1000px; margin: 0 auto; }
        .card { border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin-bottom: 20px; }
        h1, h2 { color: #333; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <div class="container">
        <h1>API Error Test</h1>
        
        <?php
        echo '<div class="card">';
        echo '<h2>Server Environment</h2>';
        echo '<p><strong>PHP Version:</strong> ' . phpversion() . '</p>';
        echo '<p><strong>Server:</strong> ' . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . '</p>';
        echo '<p><strong>Document Root:</strong> ' . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . '</p>';
        echo '</div>';
        
        // Test if JWT keys exist
        $privateKeyPath = realpath(__DIR__ . '/../backend/config/jwt/private.pem');
        $publicKeyPath = realpath(__DIR__ . '/../backend/config/jwt/public.pem');
        
        echo '<div class="card">';
        echo '<h2>JWT Key Files</h2>';
        echo '<p><strong>Private Key:</strong> ' . (file_exists($privateKeyPath) ? 
             '<span class="success">Exists</span> (' . substr(sprintf('%o', fileperms($privateKeyPath)), -4) . ')' : 
             '<span class="error">Missing</span>') . '</p>';
        echo '<p><strong>Public Key:</strong> ' . (file_exists($publicKeyPath) ? 
             '<span class="success">Exists</span> (' . substr(sprintf('%o', fileperms($publicKeyPath)), -4) . ')' : 
             '<span class="error">Missing</span>') . '</p>';
        echo '</div>';
        
        // Test login endpoint
        $baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
        
        echo '<div class="card">';
        echo '<h2>Login Test</h2>';
        
        $ch = curl_init("$baseUrl/api/login_check");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'username' => 'student@bigproject.com',
            'password' => 'Password123@'
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $response = curl_exec($ch);
        $info = curl_getinfo($ch);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($info['http_code'] === 200 && $response) {
            echo '<p class="success">Login successful!</p>';
            $responseData = json_decode($response, true);
            $token = $responseData['token'] ?? null;
            
            if ($token) {
                echo '<p><strong>Token received:</strong> ' . substr($token, 0, 20) . '...</p>';
                
                // Test authenticated endpoints
                echo '</div><div class="card">';
                echo '<h2>Authenticated API Tests</h2>';
                
                // Function to test an authenticated endpoint
                function testAuthEndpoint($url, $token) {
                    $ch = curl_init($url);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, [
                        'Content-Type: application/json',
                        "Authorization: Bearer $token"
                    ]);
                    
                    $response = curl_exec($ch);
                    $info = curl_getinfo($ch);
                    $error = curl_error($ch);
                    curl_close($ch);
                    
                    echo '<h3>' . basename($url) . ' Endpoint</h3>';
                    echo '<p><strong>Status Code:</strong> ' . $info['http_code'] . '</p>';
                    
                    if ($info['http_code'] === 200) {
                        echo '<p class="success">Request successful!</p>';
                    } else {
                        echo '<p class="error">Request failed with status ' . $info['http_code'] . '</p>';
                    }
                    
                    if ($error) {
                        echo '<p><strong>Error:</strong> ' . $error . '</p>';
                    }
                    
                    echo '<p><strong>Response:</strong></p>';
                    echo '<pre>' . htmlspecialchars($response) . '</pre>';
                }
                
                // Test /api/me endpoint
                testAuthEndpoint("$baseUrl/api/me", $token);
                
                // Test /api/profile endpoint
                testAuthEndpoint("$baseUrl/api/profile", $token);
            } else {
                echo '<p class="error">No token found in response!</p>';
                echo '<p><strong>Raw Response:</strong></p>';
                echo '<pre>' . htmlspecialchars($response) . '</pre>';
            }
        } else {
            echo '<p class="error">Login failed with status code: ' . $info['http_code'] . '</p>';
            if ($error) {
                echo '<p><strong>Error:</strong> ' . $error . '</p>';
            }
            echo '<p><strong>Response:</strong></p>';
            echo '<pre>' . htmlspecialchars($response) . '</pre>';
        }
        
        echo '</div>';
        
        // Check environment files
        echo '<div class="card">';
        echo '<h2>Environment Files</h2>';
        
        $envFiles = [
            'backend/.env' => realpath(__DIR__ . '/../backend/.env'),
            'backend/.env.dev' => realpath(__DIR__ . '/../backend/.env.dev'),
            'backend/.env.local' => realpath(__DIR__ . '/../backend/.env.local')
        ];
        
        foreach ($envFiles as $name => $path) {
            $exists = file_exists($path);
            $size = $exists ? filesize($path) : 0;
            echo '<p><strong>' . $name . ':</strong> ' . 
                ($exists ? '<span class="success">Exists</span> (Size: ' . $size . ' bytes)' : 
                '<span class="error">Missing</span>') . '</p>';
        }
        
        echo '</div>';
        ?>
    </div>
</body>
</html> 