<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240525000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create ticket system tables';
    }

    public function up(Schema $schema): void
    {
        // Create ticket_status table
        $this->addSql('CREATE TABLE ticket_status (
            id INT AUTO_INCREMENT NOT NULL,
            name VARCHAR(50) NOT NULL,
            description VARCHAR(255) DEFAULT NULL,
            color VARCHAR(50) DEFAULT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Create ticket table
        $this->addSql('CREATE TABLE ticket (
            id INT AUTO_INCREMENT NOT NULL,
            creator_id INT NOT NULL,
            assigned_to_id INT DEFAULT NULL,
            status_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            description LONGTEXT NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            priority VARCHAR(50) DEFAULT NULL,
            resolved_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_97A0ADA361220EA6 (creator_id),
            INDEX IDX_97A0ADA3F4BD7827 (assigned_to_id),
            INDEX IDX_97A0ADA36BF700BD (status_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Add foreign key constraints
        $this->addSql('ALTER TABLE ticket ADD CONSTRAINT FK_97A0ADA361220EA6 FOREIGN KEY (creator_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE ticket ADD CONSTRAINT FK_97A0ADA3F4BD7827 FOREIGN KEY (assigned_to_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE ticket ADD CONSTRAINT FK_97A0ADA36BF700BD FOREIGN KEY (status_id) REFERENCES ticket_status (id)');

        // Insert default ticket status values
        $this->addSql("INSERT INTO ticket_status (name, description, color) VALUES 
            ('Open', 'Ticket is open and waiting for assignment', '#3498db'),
            ('In Progress', 'Ticket is being worked on', '#f39c12'),
            ('Resolved', 'Ticket has been resolved', '#2ecc71'),
            ('Closed', 'Ticket has been closed', '#7f8c8d'),
            ('Pending', 'Waiting for more information', '#e74c3c')
        ");
    }

    public function down(Schema $schema): void
    {
        // Drop foreign key constraints first
        $this->addSql('ALTER TABLE ticket DROP FOREIGN KEY FK_97A0ADA361220EA6');
        $this->addSql('ALTER TABLE ticket DROP FOREIGN KEY FK_97A0ADA3F4BD7827');
        $this->addSql('ALTER TABLE ticket DROP FOREIGN KEY FK_97A0ADA36BF700BD');

        // Drop tables
        $this->addSql('DROP TABLE ticket');
        $this->addSql('DROP TABLE ticket_status');
    }
} 