<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add missing indexes to improve query performance
 */
final class Version20240507_AddMissingIndexes extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add missing indexes to improve query performance';
    }

    public function up(Schema $schema): void
    {
        // Add index on email field for faster user lookups
        $this->addSql('CREATE INDEX idx_user_email ON `user` (email)');
        
        // Add index on user_id in user_role for faster role lookups
        $this->addSql('CREATE INDEX idx_user_role_user_id ON user_role (user_id)');
        
        // Add index on role_id in user_role for faster user by role lookups
        $this->addSql('CREATE INDEX idx_user_role_role_id ON user_role (role_id)');
        
        // Add index on specialization_id in user table
        $this->addSql('CREATE INDEX idx_user_specialization ON `user` (specialization_id)');
        
        // Add index on theme_id in user table
        $this->addSql('CREATE INDEX idx_user_theme ON `user` (theme_id)');
        
        // Add index on user_id in address table
        $this->addSql('CREATE INDEX idx_address_user_id ON address (user_id)');
        
        // Add index on user_id in diploma table
        $this->addSql('CREATE INDEX idx_diploma_user_id ON diploma (user_id)');
        
        // Add index on situation_type_id in student_profile table
        $this->addSql('CREATE INDEX idx_student_profile_situation_type ON student_profile (situation_type_id)');
    }

    public function down(Schema $schema): void
    {
        // Remove indexes in reverse order
        $this->addSql('DROP INDEX idx_student_profile_situation_type ON student_profile');
        $this->addSql('DROP INDEX idx_diploma_user_id ON diploma');
        $this->addSql('DROP INDEX idx_address_user_id ON address');
        $this->addSql('DROP INDEX idx_user_theme ON `user`');
        $this->addSql('DROP INDEX idx_user_specialization ON `user`');
        $this->addSql('DROP INDEX idx_user_role_role_id ON user_role');
        $this->addSql('DROP INDEX idx_user_role_user_id ON user_role');
        $this->addSql('DROP INDEX idx_user_email ON `user`');
    }
} 