<?php
/**
 * Simple test script for login endpoint
 */

// Configuration
$endpoint = 'https://bigproject-development.konstantine.fr/api/login_check';
$credentials = [
    'username' => 'admin@bigproject.com',
    'password' => 'Password123@'
];

echo "Testing login endpoint: $endpoint\n";
echo "Using credentials: " . $credentials['username'] . "\n";

// Initialize cURL session
$ch = curl_init($endpoint);

// Configure the request
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($credentials));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Skip SSL verification for testing

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

// Close cURL session
curl_close($ch);

// Display results
echo "HTTP Status Code: $httpCode\n";
if ($error) {
    echo "Error: $error\n";
} else {
    // Try to parse JSON response
    $data = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "Response (JSON):\n";
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
        
        // Check if we got a token
        if (isset($data['token'])) {
            echo "\nLogin successful! Got JWT token.\n";
            
            // Let's test an authenticated endpoint
            echo "\nNow testing /api/me with the token...\n";
            
            $ch = curl_init('https://bigproject-development.konstantine.fr/api/me');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $data['token'],
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            
            $meResponse = curl_exec($ch);
            $meHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $meError = curl_error($ch);
            
            curl_close($ch);
            
            echo "HTTP Status Code: $meHttpCode\n";
            if ($meError) {
                echo "Error: $meError\n";
            } else {
                $meData = json_decode($meResponse, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    echo "Response (JSON):\n";
                    echo json_encode($meData, JSON_PRETTY_PRINT) . "\n";
                } else {
                    echo "Raw response: " . $meResponse . "\n";
                }
            }
        }
    } else {
        echo "Raw response: " . $response . "\n";
    }
} 