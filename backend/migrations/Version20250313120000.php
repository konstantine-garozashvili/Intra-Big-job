<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration to create the message table for the chat functionality
 */
final class Version20250313120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create message table for chat functionality';
    }

    public function up(Schema $schema): void
    {
        // Check if the table already exists
        $tableExists = $this->connection->executeQuery("SHOW TABLES LIKE 'message'")->rowCount() > 0;
        
        if (!$tableExists) {
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
            
            $this->addSql('ALTER TABLE message 
                ADD CONSTRAINT FK_B6BD307FF624B39D 
                FOREIGN KEY (sender_id) 
                REFERENCES `user` (id)');
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307FF624B39D');
        $this->addSql('DROP TABLE message');
    }
}
