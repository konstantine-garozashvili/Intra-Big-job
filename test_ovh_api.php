<?php
/**
 * OVH API Test Script
 * This script tests the JWT authentication against the OVH server
 */

$baseUrl = 'https://bigproject-development.konstantine.fr';
$loginEndpoint = '/api/login_check';

// Test credential sets
$credentials = [
    'admin' => [
        'username' => 'admin@bigproject.com',
        'password' => 'Password123@'
    ],
    'student' => [
        'username' => 'student@bigproject.com',
        'password' => 'Password123@'
    ]
];

echo "=== OVH API Connection Test ===\n\n";
echo "Server: $baseUrl\n";
echo "Testing login endpoint: $loginEndpoint\n\n";

// Function to test login
function testLogin($baseUrl, $endpoint, $credentials) {
    $url = $baseUrl . $endpoint;
    echo "Testing login with {$credentials['username']}...\n";
    
    // Initialize cURL session
    $ch = curl_init($url);
    
    // Set request options
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
    
    // Format and display results
    echo "HTTP Status Code: $httpCode\n";
    
    if ($error) {
        echo "Error: $error\n";
        return null;
    }
    
    // Try to parse the response
    $data = json_decode($response, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "Response (JSON): \n";
        if (isset($data['token'])) {
            echo "Token received: " . substr($data['token'], 0, 15) . "...\n";
            return $data['token'];
        } else {
            echo print_r($data, true) . "\n";
        }
    } else {
        echo "Response (Raw): \n";
        echo substr($response, 0, 1000) . (strlen($response) > 1000 ? "...(truncated)" : "") . "\n";
    }
    
    return null;
}

// Test each credential set
foreach ($credentials as $role => $creds) {
    echo "\n=== Testing $role login ===\n";
    $token = testLogin($baseUrl, $loginEndpoint, $creds);
    
    if ($token) {
        echo "Token successfully obtained for $role!\n";
        
        // Test a protected endpoint
        echo "\nTesting protected endpoint /api/users with token...\n";
        
        $ch = curl_init($baseUrl . '/api/users');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $token,
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        echo "HTTP Status Code: $httpCode\n";
        
        if ($httpCode === 200) {
            echo "Successfully accessed protected endpoint!\n";
        } else {
            echo "Failed to access protected endpoint.\n";
            
            // Try to parse the error response
            $data = json_decode($response, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                echo "Error response: " . print_r($data, true) . "\n";
            } else {
                echo "Raw response: " . substr($response, 0, 500) . "\n";
            }
        }
        
        curl_close($ch);
    }
    
    echo "\n" . str_repeat('-', 50) . "\n";
}

echo "\nTests completed.\n"; 