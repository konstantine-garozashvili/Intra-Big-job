<?php

// Script pour tester l'API de profil public

// Configuration
$apiUrl = 'http://localhost:8000/api/login_check';
$credentials = [
    'username' => 'superadmin@bigproject.com',
    'password' => 'Password123@'
];

// Obtenir le token d'authentification
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($credentials));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    die("Erreur lors de l'authentification: $httpCode\n$response\n");
}

$authData = json_decode($response, true);
$token = $authData['token'] ?? null;

if (!$token) {
    die("Impossible d'obtenir le token d'authentification\n");
}

echo "Token obtenu avec succès.\n";

// Tester l'API de profil public
$userId = 4; // Utilisons l'ID 4 (teacher) pour ce test
$profileUrl = "http://localhost:8000/api/profile/public/$userId";

$ch = curl_init($profileUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "Authorization: Bearer $token"
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Réponse du serveur (code $httpCode):\n";

// Formater et afficher la réponse JSON
$profileData = json_decode($response, true);
echo json_encode($profileData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";

// Vérifier si profilePictureUrl est présent
if (isset($profileData['data']['user']['profilePictureUrl'])) {
    echo "\nLe champ 'profilePictureUrl' est présent dans la réponse.\n";
    echo "Valeur: " . $profileData['data']['user']['profilePictureUrl'] . "\n";
} else {
    echo "\nLe champ 'profilePictureUrl' n'est PAS présent dans la réponse.\n";
    
    if (isset($profileData['data']['user']['profilePicturePath'])) {
        echo "Le champ 'profilePicturePath' est présent: " . $profileData['data']['user']['profilePicturePath'] . "\n";
    }
} 