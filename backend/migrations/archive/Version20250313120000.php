<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250313120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Creates or updates the message table for the chat feature';
    }

    public function up(Schema $schema): void
    {
        // Check if the message table already exists
        $tableExists = $this->connection->executeQuery("SHOW TABLES LIKE 'message'")->rowCount() > 0;
        
        if (!$tableExists) {
            // Create the message table if it doesn't exist
            $this->addSql('CREATE TABLE message (
                id INT AUTO_INCREMENT NOT NULL,
                sender_id INT NOT NULL,
                content LONGTEXT NOT NULL,
                created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
                is_global TINYINT(1) NOT NULL,
                read_by JSON NOT NULL,
                INDEX IDX_B6BD307FF624B39D (sender_id),
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            
            $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307FF624B39D FOREIGN KEY (sender_id) REFERENCES user (id)');
        } else {
            // Check and update the existing message table if needed
            
            // Check if sender_id column exists and has a foreign key constraint
            $senderColumnExists = $this->connection->executeQuery("SHOW COLUMNS FROM `message` LIKE 'sender_id'")->rowCount() > 0;
            if (!$senderColumnExists) {
                $this->addSql('ALTER TABLE message ADD sender_id INT NOT NULL');
                $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307FF624B39D FOREIGN KEY (sender_id) REFERENCES user (id)');
                $this->addSql('CREATE INDEX IDX_B6BD307FF624B39D ON message (sender_id)');
            }
            
            // Check if created_at column exists
            $createdAtColumnExists = $this->connection->executeQuery("SHOW COLUMNS FROM `message` LIKE 'created_at'")->rowCount() > 0;
            if (!$createdAtColumnExists) {
                $this->addSql('ALTER TABLE message ADD created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
            }
            
            // Check if is_global column exists
            $isGlobalColumnExists = $this->connection->executeQuery("SHOW COLUMNS FROM `message` LIKE 'is_global'")->rowCount() > 0;
            if (!$isGlobalColumnExists) {
                $this->addSql('ALTER TABLE message ADD is_global TINYINT(1) NOT NULL');
            }
            
            // Check if read_by column exists
            $readByColumnExists = $this->connection->executeQuery("SHOW COLUMNS FROM `message` LIKE 'read_by'")->rowCount() > 0;
            if (!$readByColumnExists) {
                $this->addSql('ALTER TABLE message ADD read_by JSON NOT NULL');
            }
        }
    }

    public function down(Schema $schema): void
    {
        // Don't drop the table in down() to avoid data loss
        // Instead, just remove the constraints
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307FF624B39D');
    }
}
