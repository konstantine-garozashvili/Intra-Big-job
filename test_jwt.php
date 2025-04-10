<?php
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;

// Path to the private key file
$privateKeyPath = __DIR__ . '/backend/config/jwt/private.pem';

if (!file_exists($privateKeyPath)) {
    die('Private key file not found: ' . $privateKeyPath);
}

// Read the private key
$privateKey = file_get_contents($privateKeyPath);

if (empty($privateKey)) {
    die('Private key is empty');
}

// Passphrase for the private key
$passphrase = 'VeryStrongPassphrase123$'; // Set this to your actual passphrase

try {
    // Create a token payload
    $payload = [
        'iat' => time(),                        // Issued at: time when the token was generated
        'nbf' => time(),                        // Not before: before this time, the token is not valid  
        'exp' => time() + 3600,                 // Expire: token expiration time
        'username' => 'admin@bigproject.com',   // User data
        'roles' => ['ROLE_ADMIN']               // User roles
    ];

    // Create a key resource using the private key and passphrase
    $privateKeyResource = openssl_pkey_get_private($privateKey, $passphrase);
    
    if ($privateKeyResource === false) {
        $error = openssl_error_string();
        die('Failed to load private key: ' . $error);
    }
    
    $keyDetails = openssl_pkey_get_details($privateKeyResource);
    if ($keyDetails === false) {
        die('Failed to get key details');
    }
    
    echo 'Private key is valid and readable' . PHP_EOL;
    echo 'Key type: ' . ($keyDetails['type'] == OPENSSL_KEYTYPE_RSA ? 'RSA' : 'Other') . PHP_EOL;
    echo 'Bit size: ' . $keyDetails['bits'] . PHP_EOL;
    
    // Generate token using Firebase JWT library
    $token = JWT::encode($payload, $privateKey, 'RS256', null, ['kid' => '']);
    
    echo 'Generated JWT Token: ' . PHP_EOL . $token . PHP_EOL;
    
    // Test the token by making a request to a protected endpoint
    $ch = curl_init('https://bigproject-development.konstantine.fr/api/diagnostic');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo 'Response Code: ' . $httpCode . PHP_EOL;
    echo 'Response: ' . $response . PHP_EOL;
    
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
} 