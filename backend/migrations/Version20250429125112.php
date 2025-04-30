<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250429125112 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE formation (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, promotion VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE formation_student (formation_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_F2DCEA485200282E (formation_id), INDEX IDX_F2DCEA48A76ED395 (user_id), PRIMARY KEY(formation_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            CREATE TABLE formation_enrollment_request (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, formation_id INT NOT NULL, reviewed_by_id INT DEFAULT NULL, status TINYINT(1) DEFAULT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', comment LONGTEXT DEFAULT NULL, INDEX IDX_78BA3D5BA76ED395 (user_id), INDEX IDX_78BA3D5B5200282E (formation_id), INDEX IDX_78BA3D5BFC6B21F1 (reviewed_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_student ADD CONSTRAINT FK_F2DCEA485200282E FOREIGN KEY (formation_id) REFERENCES formation (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_student ADD CONSTRAINT FK_F2DCEA48A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_enrollment_request ADD CONSTRAINT FK_78BA3D5BA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_enrollment_request ADD CONSTRAINT FK_78BA3D5B5200282E FOREIGN KEY (formation_id) REFERENCES formation (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_enrollment_request ADD CONSTRAINT FK_78BA3D5BFC6B21F1 FOREIGN KEY (reviewed_by_id) REFERENCES `user` (id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_student DROP FOREIGN KEY FK_F2DCEA485200282E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_student DROP FOREIGN KEY FK_F2DCEA48A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_enrollment_request DROP FOREIGN KEY FK_78BA3D5BA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_enrollment_request DROP FOREIGN KEY FK_78BA3D5B5200282E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_enrollment_request DROP FOREIGN KEY FK_78BA3D5BFC6B21F1
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE formation
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE formation_student
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE formation_enrollment_request
        SQL);
    }
}
