<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250317084502 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Suppression de la table validation et de la colonne validated de la table signature';
    }

    public function up(Schema $schema): void
    {
        // Suppression de la colonne validated de la table signature
        $this->addSql('ALTER TABLE signature DROP COLUMN validated');

        // Suppression de la table validation
        $this->addSql('DROP TABLE IF EXISTS validation');
    }

    public function down(Schema $schema): void
    {
        // Recréation de la colonne validated dans la table signature
        $this->addSql('ALTER TABLE signature ADD COLUMN validated TINYINT(1) DEFAULT 0 NOT NULL');

        // Recréation de la table validation
        $this->addSql('CREATE TABLE validation (
            id INT AUTO_INCREMENT NOT NULL,
            signature_id INT NOT NULL,
            validator_id INT NOT NULL,
            status VARCHAR(255) NOT NULL,
            comment LONGTEXT DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            INDEX IDX_FA14990A8B5B2CAC (signature_id),
            INDEX IDX_FA14990AB0644AEC (validator_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }
}
