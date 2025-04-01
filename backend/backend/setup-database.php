<?php
// This script will set up the database tables using Doctrine

require_once __DIR__ . '/vendor/autoload.php';

use Symfony\Component\Dotenv\Dotenv;
use Doctrine\DBAL\DriverManager;
use Doctrine\DBAL\Schema\Schema;

// Load environment variables
$dotenv = new Dotenv();
$dotenv->load(__DIR__ . '/.env');

// Database connection parameters
$connectionParams = [
    'dbname' => $_ENV['DATABASE_NAME'] ?? 'bigproject',
    'user' => $_ENV['DATABASE_USER'] ?? 'root',
    'password' => $_ENV['DATABASE_PASSWORD'] ?? '',
    'host' => $_ENV['DATABASE_HOST'] ?? 'localhost',
    'driver' => 'pdo_mysql',
];

try {
    // Connect to database
    $conn = DriverManager::getConnection($connectionParams);
    echo "Connected to database successfully\n";
    
    // Create schema
    $schema = new Schema();
    
    // Create user table if it doesn't exist
    if (!$conn->createSchemaManager()->tablesExist(['user'])) {
        echo "Creating user table...\n";
        $userTable = $schema->createTable('user');
        $userTable->addColumn('id', 'integer', ['autoincrement' => true]);
        $userTable->addColumn('lastName', 'string', ['length' => 255]);
        $userTable->addColumn('firstName', 'string', ['length' => 255]);
        $userTable->addColumn('email', 'string', ['length' => 255]);
        $userTable->addColumn('password', 'string', ['length' => 255]);
        $userTable->addColumn('phoneNumber', 'string', ['length' => 20]);
        $userTable->addColumn('createdAt', 'datetime_immutable');
        $userTable->addColumn('updatedAt', 'datetime_immutable', ['notnull' => false]);
        $userTable->setPrimaryKey(['id']);
        $userTable->addUniqueIndex(['email']);
    } else {
        echo "User table already exists\n";
    }
    
    // Create signature table if it doesn't exist
    if (!$conn->createSchemaManager()->tablesExist(['signature'])) {
        echo "Creating signature table...\n";
        $signatureTable = $schema->createTable('signature');
        $signatureTable->addColumn('id', 'integer', ['autoincrement' => true]);
        $signatureTable->addColumn('user_id', 'integer');
        $signatureTable->addColumn('date', 'datetime_immutable');
        $signatureTable->addColumn('location', 'string', ['length' => 255]);
        $signatureTable->addColumn('validated', 'boolean', ['default' => false]);
        $signatureTable->setPrimaryKey(['id']);
        $signatureTable->addForeignKeyConstraint('user', ['user_id'], ['id'], ['onDelete' => 'CASCADE']);
    } else {
        echo "Signature table already exists\n";
    }
    
    // Create validation table if it doesn't exist
    if (!$conn->createSchemaManager()->tablesExist(['validation'])) {
        echo "Creating validation table...\n";
        $validationTable = $schema->createTable('validation');
        $validationTable->addColumn('id', 'integer', ['autoincrement' => true]);
        $validationTable->addColumn('signature_id', 'integer');
        $validationTable->addColumn('validator_id', 'integer');
        $validationTable->addColumn('date', 'datetime_immutable');
        $validationTable->addColumn('comment', 'string', ['length' => 255, 'notnull' => false]);
        $validationTable->setPrimaryKey(['id']);
        $validationTable->addForeignKeyConstraint('signature', ['signature_id'], ['id'], ['onDelete' => 'CASCADE']);
        $validationTable->addForeignKeyConstraint('user', ['validator_id'], ['id']);
    } else {
        echo "Validation table already exists\n";
    }
    
    // Execute SQL to create tables
    $queries = $schema->toSql($conn->getDatabasePlatform());
    foreach ($queries as $query) {
        $conn->executeStatement($query);
    }
    
    echo "Database setup completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
