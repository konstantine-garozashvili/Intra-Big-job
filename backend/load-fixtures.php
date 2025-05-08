<?php
// Direct fixture loading script for production
// Usage: php load-fixtures.php

// Connect to database using parameters from .env.dev
$dbHost = 'konstaxbigprjdev.mysql.db';
$dbName = 'konstaxbigprjdev';
$dbUser = 'konstaxbigprjdev';
$dbPass = 'Weaver0311';

try {
    $db = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected to database successfully\n";
    
    // Start transaction
    $db->beginTransaction();
    
    // Clear existing data (optional - remove if you want to keep existing data)
    echo "Clearing existing data...\n";
    $tables = [
        'role', 'ticket_status', 'ticket_service', 'theme', 
        'domain', 'user_status', 'user_situation_type'
    ];
    
    foreach ($tables as $table) {
        try {
            $db->exec("DELETE FROM $table");
            echo "  • Cleared table: $table\n";
        } catch (PDOException $e) {
            echo "  × Could not clear table $table: {$e->getMessage()}\n";
        }
    }
    
    // Load Roles
    echo "Loading roles...\n";
    $roles = [
        ['id' => 100, 'name' => 'ADMIN', 'code' => 'ADMIN', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 101, 'name' => 'SUPERADMIN', 'code' => 'SUPERADMIN', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 102, 'name' => 'HR', 'code' => 'HR', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 103, 'name' => 'TEACHER', 'code' => 'TEACHER', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 104, 'name' => 'STUDENT', 'code' => 'STUDENT', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 105, 'name' => 'GUEST', 'code' => 'GUEST', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 106, 'name' => 'RECRUITER', 'code' => 'RECRUITER', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
    ];
    
    foreach ($roles as $role) {
        try {
            $stmt = $db->prepare("INSERT INTO role (id, name, code, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
            $stmt->execute([$role['id'], $role['name'], $role['code']]);
            echo "  • Added role: {$role['name']}\n";
        } catch (PDOException $e) {
            echo "  × Failed to add role {$role['name']}: {$e->getMessage()}\n";
        }
    }
    
    // Load Ticket Statuses
    echo "Loading ticket statuses...\n";
    $statuses = [
        ['id' => 1, 'name' => 'Ouvert', 'code' => 'OPEN', 'color' => '#4CAF50', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 2, 'name' => 'En cours', 'code' => 'IN_PROGRESS', 'color' => '#2196F3', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 3, 'name' => 'En attente', 'code' => 'PENDING', 'color' => '#FF9800', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 4, 'name' => 'Résolu', 'code' => 'RESOLVED', 'color' => '#8BC34A', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 5, 'name' => 'Fermé', 'code' => 'CLOSED', 'color' => '#9E9E9E', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
    ];
    
    foreach ($statuses as $status) {
        try {
            $stmt = $db->prepare("INSERT INTO ticket_status (id, name, code, color, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())");
            $stmt->execute([$status['id'], $status['name'], $status['code'], $status['color']]);
            echo "  • Added ticket status: {$status['name']}\n";
        } catch (PDOException $e) {
            echo "  × Failed to add ticket status {$status['name']}: {$e->getMessage()}\n";
        }
    }
    
    // Load Ticket Services
    echo "Loading ticket services...\n";
    $services = [
        ['id' => 1, 'name' => 'Support Technique', 'description' => 'Aide avec les problèmes techniques', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 2, 'name' => 'Administration', 'description' => 'Questions administratives', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 3, 'name' => 'Pédagogie', 'description' => 'Questions sur le contenu des cours', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
        ['id' => 4, 'name' => 'Absences', 'description' => 'Justification des absences', 'created_at' => 'NOW()', 'updated_at' => 'NOW()'],
    ];
    
    foreach ($services as $service) {
        try {
            $stmt = $db->prepare("INSERT INTO ticket_service (id, name, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
            $stmt->execute([$service['id'], $service['name'], $service['description']]);
            echo "  • Added ticket service: {$service['name']}\n";
        } catch (PDOException $e) {
            echo "  × Failed to add ticket service {$service['name']}: {$e->getMessage()}\n";
        }
    }
    
    // Load Themes
    echo "Loading themes...\n";
    $themes = [
        ['id' => 1, 'name' => 'Light', 'code' => 'LIGHT'],
        ['id' => 2, 'name' => 'Dark', 'code' => 'DARK'],
        ['id' => 3, 'name' => 'System', 'code' => 'SYSTEM'],
    ];
    
    foreach ($themes as $theme) {
        try {
            $stmt = $db->prepare("INSERT INTO theme (id, name, code) VALUES (?, ?, ?)");
            $stmt->execute([$theme['id'], $theme['name'], $theme['code']]);
            echo "  • Added theme: {$theme['name']}\n";
        } catch (PDOException $e) {
            echo "  × Failed to add theme {$theme['name']}: {$e->getMessage()}\n";
        }
    }
    
    // Create default admin user if it doesn't exist
    echo "Creating default admin user...\n";
    try {
        $stmt = $db->prepare("SELECT COUNT(*) FROM user WHERE email = 'admin@bigproject.com'");
        $stmt->execute();
        $userExists = (int)$stmt->fetchColumn() > 0;
        
        if (!$userExists) {
            // Create admin user
            $stmt = $db->prepare("INSERT INTO user (email, firstname, lastname, password, is_verified, created_at, updated_at) 
                                 VALUES ('admin@bigproject.com', 'Admin', 'User', 
                                 '$2y$13$5AsSvCwzG3xgTfDNcUXVvOZ5TwCFW4uXZc1R8v.0X8qg7yCqZHQ4C', 1, NOW(), NOW())");
            $stmt->execute();
            $userId = $db->lastInsertId();
            
            // Assign admin role to user
            $stmt = $db->prepare("INSERT INTO user_role (user_id, role_id) VALUES (?, 100)");
            $stmt->execute([$userId]);
            echo "  • Created admin user with email: admin@bigproject.com and password: Password123@\n";
        } else {
            echo "  • Admin user already exists\n";
        }
    } catch (PDOException $e) {
        echo "  × Failed to create admin user: {$e->getMessage()}\n";
    }
    
    // Commit transaction
    $db->commit();
    echo "All data loaded successfully!\n";
    
} catch (PDOException $e) {
    // Rollback transaction on error
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "Database error: " . $e->getMessage() . "\n";
    exit(1);
} 