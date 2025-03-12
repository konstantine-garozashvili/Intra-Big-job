<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250306153216 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE student_profile DROP INDEX user_id, ADD UNIQUE INDEX UNIQ_6C611FF7A76ED395 (user_id)');
        $this->addSql('ALTER TABLE student_profile ADD situation_type_id INT DEFAULT NULL, CHANGE is_seeking_internship is_seeking_internship TINYINT(1) NOT NULL, CHANGE is_seeking_apprenticeship is_seeking_apprenticeship TINYINT(1) NOT NULL, CHANGE created_at created_at DATETIME NOT NULL, CHANGE updated_at updated_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE student_profile ADD CONSTRAINT FK_6C611FF747CC2355 FOREIGN KEY (situation_type_id) REFERENCES user_situation_type (id)');
        $this->addSql('CREATE INDEX IDX_6C611FF747CC2355 ON student_profile (situation_type_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE student_profile DROP INDEX UNIQ_6C611FF7A76ED395, ADD INDEX user_id (user_id)');
        $this->addSql('ALTER TABLE student_profile DROP FOREIGN KEY FK_6C611FF747CC2355');
        $this->addSql('DROP INDEX IDX_6C611FF747CC2355 ON student_profile');
        $this->addSql('ALTER TABLE student_profile DROP situation_type_id, CHANGE is_seeking_internship is_seeking_internship TINYINT(1) DEFAULT 0, CHANGE is_seeking_apprenticeship is_seeking_apprenticeship TINYINT(1) DEFAULT 0, CHANGE created_at created_at DATETIME DEFAULT CURRENT_TIMESTAMP, CHANGE updated_at updated_at DATETIME DEFAULT CURRENT_TIMESTAMP');
    }
}
