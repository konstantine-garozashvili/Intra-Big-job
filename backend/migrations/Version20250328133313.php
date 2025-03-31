<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250328133313 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Adds a trigger to insert into student_profile when a user\'s role is updated to student.';
    }

    public function up(Schema $schema): void
    {
        // Add the trigger
        $this->addSql('
            CREATE TRIGGER after_user_role_update
            AFTER UPDATE ON user_role
            FOR EACH ROW
            BEGIN
                IF NEW.role_id = 33 THEN
                    INSERT INTO student_profile (user_id, situation_type_id, is_seeking_internship, is_seeking_apprenticeship, created_at, updated_at)
                    SELECT NEW.user_id, 17, 0, 0, NOW(), NOW()
                    FROM dual
                    WHERE NOT EXISTS (
                        SELECT 1 FROM student_profile WHERE user_id = NEW.user_id
                    );
                END IF;
            END;
        ');
    }

    public function down(Schema $schema): void
    {
        // Drop the trigger
        $this->addSql('DROP TRIGGER IF EXISTS after_user_role_update;');
    }
}