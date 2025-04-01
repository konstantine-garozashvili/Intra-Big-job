<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250325134919 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE ticket_comment (id INT AUTO_INCREMENT NOT NULL, ticket_id INT NOT NULL, author_id INT DEFAULT NULL, content LONGTEXT NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', is_from_admin TINYINT(1) NOT NULL, INDEX IDX_98B80B3E700047D2 (ticket_id), INDEX IDX_98B80B3EF675F31B (author_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE ticket_comment ADD CONSTRAINT FK_98B80B3E700047D2 FOREIGN KEY (ticket_id) REFERENCES ticket (id)');
        $this->addSql('ALTER TABLE ticket_comment ADD CONSTRAINT FK_98B80B3EF675F31B FOREIGN KEY (author_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE ticket_comment DROP FOREIGN KEY FK_98B80B3E700047D2');
        $this->addSql('ALTER TABLE ticket_comment DROP FOREIGN KEY FK_98B80B3EF675F31B');
        $this->addSql('DROP TABLE ticket_comment');
    }
}
