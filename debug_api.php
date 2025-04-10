<?php
// Simple API debugging script

// Configuration
$api_url = 'https://bigproject-development.konstantine.fr';
$endpoints = [
    '/api/test-controller/hello',   // Working endpoint for comparison
    '/api/profile/test',            // Not working - nested controller
    '/api/simple-profile/test'      // Not working - simple controller
];

echo "=== API Debug Script ===\n\n";

foreach ($endpoints as $endpoint) {
    echo "Testing endpoint: {$endpoint}\n";
    
    $ch = curl_init($api_url . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_NOBODY, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    
    $response = curl_exec($ch);
    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    $header = substr($response, 0, $header_size);
    $body = substr($response, $header_size);
    
    echo "HTTP Code: {$http_code}\n";
    echo "Response Body:\n{$body}\n\n";
    
    curl_close($ch);
}

// Now check the PHP error log on the server
echo "To check error logs on the server, run:\n";
echo "ssh konstax@ssh.cluster027.hosting.ovh.net\n";
echo "cd ~/bigprjdev/backend\n";
echo "tail -f var/log/prod.log\n";
echo "cat /home/konstax/logs/error.log\n";
echo "\n=== End of API Debug Script ===\n";
?> 