<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Add StudentProfile relation to User entity
 */
final class Version20250320110033 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add StudentProfile relation to User entity';
    }

    public function up(Schema $schema): void
    {
        // Create a foreign key constraint from student_profile to user
        $this->addSql('ALTER TABLE student_profile ADD CONSTRAINT FK_StudentProfile_User FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        
        // Add an index to user_id column in student_profile table for better performance
        $this->addSql('CREATE INDEX IDX_StudentProfile_User ON student_profile (user_id)');
        
        // Make sure the user_id column in student_profile is not null
        $this->addSql('ALTER TABLE student_profile MODIFY user_id INT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // Drop foreign key constraint and index
        $this->addSql('ALTER TABLE student_profile DROP FOREIGN KEY FK_StudentProfile_User');
        $this->addSql('DROP INDEX IDX_StudentProfile_User ON student_profile');
    }
}
