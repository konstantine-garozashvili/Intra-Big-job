<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Update signature table to match the current entity definition
 */
final class Version20250319093956 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Update signature table to add period field and remove validated field';
    }

    public function up(Schema $schema): void
    {
        // Check if the signature table exists
        $tableExists = $this->connection->executeQuery("
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'signature'
        ")->fetchOne();

        if ($tableExists) {
            // Check if period column exists
            $periodExists = $this->connection->executeQuery("
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = DATABASE() 
                AND table_name = 'signature' 
                AND column_name = 'period'
            ")->fetchOne();

            if (!$periodExists) {
                // Add period column
                $this->addSql("ALTER TABLE signature ADD COLUMN period VARCHAR(10) NOT NULL DEFAULT 'morning'");
            }

            // Check if validated column exists
            $validatedExists = $this->connection->executeQuery("
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = DATABASE() 
                AND table_name = 'signature' 
                AND column_name = 'validated'
            ")->fetchOne();

            if ($validatedExists) {
                // Remove validated column as it's not in the entity anymore
                $this->addSql("ALTER TABLE signature DROP COLUMN validated");
            }
        }
    }

    public function down(Schema $schema): void
    {
        // Check if the signature table exists
        $tableExists = $this->connection->executeQuery("
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = 'signature'
        ")->fetchOne();

        if ($tableExists) {
            // Check if period column exists
            $periodExists = $this->connection->executeQuery("
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = DATABASE() 
                AND table_name = 'signature' 
                AND column_name = 'period'
            ")->fetchOne();

            if ($periodExists) {
                // Remove period column
                $this->addSql("ALTER TABLE signature DROP COLUMN period");
            }

            // Check if validated column doesn't exist
            $validatedExists = $this->connection->executeQuery("
                SELECT COUNT(*) 
                FROM information_schema.columns 
                WHERE table_schema = DATABASE() 
                AND table_name = 'signature' 
                AND column_name = 'validated'
            ")->fetchOne();

            if (!$validatedExists) {
                // Add validated column back
                $this->addSql("ALTER TABLE signature ADD COLUMN validated TINYINT(1) NOT NULL DEFAULT 0");
            }
        }
    }
}
