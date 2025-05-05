<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250505124718 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE TABLE formation_teacher (id INT AUTO_INCREMENT NOT NULL, formation_id INT NOT NULL, user_id INT NOT NULL, is_main_teacher TINYINT(1) NOT NULL, created_at DATETIME NOT NULL COMMENT '(DC2Type:datetime_immutable)', updated_at DATETIME DEFAULT NULL COMMENT '(DC2Type:datetime_immutable)', INDEX IDX_F509E3AE5200282E (formation_id), INDEX IDX_F509E3AEA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_teacher ADD CONSTRAINT FK_F509E3AE5200282E FOREIGN KEY (formation_id) REFERENCES formation (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_teacher ADD CONSTRAINT FK_F509E3AEA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE specialization DROP description
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_teacher DROP FOREIGN KEY FK_F509E3AE5200282E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE formation_teacher DROP FOREIGN KEY FK_F509E3AEA76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP TABLE formation_teacher
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE specialization ADD description LONGTEXT DEFAULT NULL
        SQL);
    }
}
