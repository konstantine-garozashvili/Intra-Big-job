<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add Group table and update Message table to support group messages
 */
final class Version20250317135200 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Group table and update Message table to support group messages';
    }

    public function up(Schema $schema): void
    {
        // Create the group table
        $this->addSql('CREATE TABLE `group` (
            id INT AUTO_INCREMENT NOT NULL, 
            creator_id INT NOT NULL, 
            name VARCHAR(255) NOT NULL, 
            description LONGTEXT DEFAULT NULL, 
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            INDEX IDX_6DC044C561220EA6 (creator_id), 
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        // Create the group_user table for many-to-many relationship
        $this->addSql('CREATE TABLE group_user (
            group_id INT NOT NULL, 
            user_id INT NOT NULL, 
            INDEX IDX_A4C98D39FE54D947 (group_id), 
            INDEX IDX_A4C98D39A76ED395 (user_id), 
            PRIMARY KEY(group_id, user_id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        // Add group_id column to message table
        $this->addSql('ALTER TABLE message ADD group_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307FFE54D947 FOREIGN KEY (group_id) REFERENCES `group` (id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FFE54D947 ON message (group_id)');
        
        // Add foreign key constraints
        $this->addSql('ALTER TABLE `group` ADD CONSTRAINT FK_6DC044C561220EA6 FOREIGN KEY (creator_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE group_user ADD CONSTRAINT FK_A4C98D39FE54D947 FOREIGN KEY (group_id) REFERENCES `group` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE group_user ADD CONSTRAINT FK_A4C98D39A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // Remove foreign key constraints and indexes from message table
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307FFE54D947');
        $this->addSql('DROP INDEX IDX_B6BD307FFE54D947 ON message');
        $this->addSql('ALTER TABLE message DROP group_id');
        
        // Drop the group_user and group tables
        $this->addSql('ALTER TABLE group_user DROP FOREIGN KEY FK_A4C98D39FE54D947');
        $this->addSql('ALTER TABLE group_user DROP FOREIGN KEY FK_A4C98D39A76ED395');
        $this->addSql('DROP TABLE group_user');
        $this->addSql('DROP TABLE `group`');
    }
}
