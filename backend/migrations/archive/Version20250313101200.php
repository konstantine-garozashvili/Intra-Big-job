<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Fix signature table structure to match entity definition
 */
final class Version20250313101200 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update signature table structure to match entity definition';
    }

    public function up(Schema $schema): void
    {
        // Check if the signature table exists
        $tableExists = $this->connection->executeQuery("
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'bigproject' 
            AND table_name = 'signature'
        ")->fetchOne();

        if ($tableExists) {
            // Check if signed_at column exists (old structure)
            $signedAtExists = $this->connection->executeQuery("
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = 'bigproject' 
                AND table_name = 'signature' 
                AND column_name = 'signed_at'
            ")->fetchOne();

            if ($signedAtExists) {
                // Rename signed_at column to date
                $this->addSql("ALTER TABLE signature CHANGE COLUMN signed_at date DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)'");
            }

            // Check if location column exists
            $locationExists = $this->connection->executeQuery("
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = 'bigproject' 
                AND table_name = 'signature' 
                AND column_name = 'location'
            ")->fetchOne();

            if (!$locationExists) {
                // Add location column
                $this->addSql("ALTER TABLE signature ADD COLUMN location VARCHAR(255) NOT NULL DEFAULT ''");
            }

            // Check if validated column exists
            $validatedExists = $this->connection->executeQuery("
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = 'bigproject' 
                AND table_name = 'signature' 
                AND column_name = 'validated'
            ")->fetchOne();

            if (!$validatedExists) {
                // Add validated column
                $this->addSql("ALTER TABLE signature ADD COLUMN validated TINYINT(1) NOT NULL DEFAULT 0");
            }

            // Check if index exists for user_id
            $indexExists = $this->connection->executeQuery("
                SELECT COUNT(*) 
                FROM information_schema.statistics 
                WHERE table_schema = 'bigproject' 
                AND table_name = 'signature' 
                AND index_name = 'IDX_CDE3AC5FA76ED395'
            ")->fetchOne();

            if (!$indexExists) {
                // Add index for user_id
                $this->addSql("ALTER TABLE signature ADD INDEX IDX_CDE3AC5FA76ED395 (user_id)");
            }

            // Check if foreign key constraint exists
            $fkExists = $this->connection->executeQuery("
                SELECT COUNT(*) 
                FROM information_schema.table_constraints 
                WHERE table_schema = 'bigproject' 
                AND table_name = 'signature' 
                AND constraint_name = 'FK_CDE3AC5FA76ED395'
            ")->fetchOne();

            if (!$fkExists) {
                // Add foreign key constraint
                $this->addSql("ALTER TABLE signature ADD CONSTRAINT FK_CDE3AC5FA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)");
            }
        } else {
            // Create signature table if it doesn't exist
            $this->addSql('CREATE TABLE signature (
                id INT AUTO_INCREMENT NOT NULL, 
                user_id INT NOT NULL, 
                date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
                location VARCHAR(255) NOT NULL, 
                validated TINYINT(1) NOT NULL, 
                INDEX IDX_CDE3AC5FA76ED395 (user_id), 
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
            
            // Add foreign key constraint
            $this->addSql('ALTER TABLE signature ADD CONSTRAINT FK_CDE3AC5FA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        }
    }

    public function down(Schema $schema): void
    {
        // This migration is safe to revert, but we'll only revert the column renaming
        // We won't remove the added columns to prevent data loss
        
        // Check if date column exists
        $dateExists = $this->connection->executeQuery("
            SELECT COUNT(*) 
            FROM information_schema.columns 
            WHERE table_schema = 'bigproject' 
            AND table_name = 'signature' 
            AND column_name = 'date'
        ")->fetchOne();

        if ($dateExists) {
            // Rename date column back to signed_at
            $this->addSql("ALTER TABLE signature CHANGE COLUMN date signed_at DATETIME NOT NULL");
        }
    }
}
