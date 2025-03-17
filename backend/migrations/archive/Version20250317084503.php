<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add period field to signature table
 */
final class Version20250317084503 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add period field to signature table to track morning/afternoon signatures';
    }

    public function up(Schema $schema): void
    {
        // Add period column to signature table
        $this->addSql('ALTER TABLE signature ADD COLUMN period VARCHAR(10) NOT NULL COMMENT \'(DC2Type:period_type)\'');
    }

    public function down(Schema $schema): void
    {
        // Remove period column from signature table
        $this->addSql('ALTER TABLE signature DROP COLUMN period');
    }
} 