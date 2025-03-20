<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250307113500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add Signature and Validation entities for student attendance tracking';
    }

    public function up(Schema $schema): void
    {
        // Create signature table
        $this->addSql('CREATE TABLE signature (
            id INT AUTO_INCREMENT NOT NULL, 
            user_id INT NOT NULL, 
            date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            location VARCHAR(255) NOT NULL, 
            validated TINYINT(1) NOT NULL, 
            INDEX IDX_CDE3AC5FA76ED395 (user_id), 
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        // Create validation table
        $this->addSql('CREATE TABLE validation (
            id INT AUTO_INCREMENT NOT NULL, 
            signature_id INT NOT NULL, 
            validator_id INT NOT NULL, 
            date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', 
            INDEX IDX_16C5D9D69A48863C (signature_id), 
            INDEX IDX_16C5D9D6B0644AEC (validator_id), 
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        
        // Add foreign key constraints
        $this->addSql('ALTER TABLE signature ADD CONSTRAINT FK_CDE3AC5FA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE validation ADD CONSTRAINT FK_16C5D9D69A48863C FOREIGN KEY (signature_id) REFERENCES signature (id)');
        $this->addSql('ALTER TABLE validation ADD CONSTRAINT FK_16C5D9D6B0644AEC FOREIGN KEY (validator_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // Drop foreign key constraints first
        $this->addSql('ALTER TABLE validation DROP FOREIGN KEY FK_16C5D9D69A48863C');
        $this->addSql('ALTER TABLE validation DROP FOREIGN KEY FK_16C5D9D6B0644AEC');
        $this->addSql('ALTER TABLE signature DROP FOREIGN KEY FK_CDE3AC5FA76ED395');
        
        // Drop tables
        $this->addSql('DROP TABLE validation');
        $this->addSql('DROP TABLE signature');
    }
}
