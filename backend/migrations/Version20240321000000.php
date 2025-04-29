<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240321000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop formation and formation_student tables';
    }

    public function up(Schema $schema): void
    {
        // Drop the junction table first to maintain referential integrity
        $this->addSql('DROP TABLE IF EXISTS formation_student');
        
        // Then drop the main table
        $this->addSql('DROP TABLE IF EXISTS formation');
    }

    public function down(Schema $schema): void
    {
        // Recreate the formation table
        $this->addSql('CREATE TABLE formation (
            id INT AUTO_INCREMENT NOT NULL,
            name VARCHAR(255) NOT NULL,
            promotion VARCHAR(255) NOT NULL,
            description LONGTEXT DEFAULT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');

        // Recreate the junction table
        $this->addSql('CREATE TABLE formation_student (
            formation_id INT NOT NULL,
            user_id INT NOT NULL,
            INDEX IDX_9EE7F8925200282E (formation_id),
            INDEX IDX_9EE7F892A76ED395 (user_id),
            PRIMARY KEY(formation_id, user_id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');

        // Add foreign key constraints
        $this->addSql('ALTER TABLE formation_student 
            ADD CONSTRAINT FK_9EE7F8925200282E FOREIGN KEY (formation_id) 
            REFERENCES formation (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE formation_student 
            ADD CONSTRAINT FK_9EE7F892A76ED395 FOREIGN KEY (user_id) 
            REFERENCES user (id) ON DELETE CASCADE');
    }
} 