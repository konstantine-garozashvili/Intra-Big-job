<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250309212032 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE event_participant (id INT AUTO_INCREMENT NOT NULL, event_id_id INT NOT NULL, user_id_id INT NOT NULL, INDEX IDX_7C16B8913E5F2F7B (event_id_id), INDEX IDX_7C16B8919D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE schedule_event (id INT AUTO_INCREMENT NOT NULL, created_by_id INT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, start_date_time DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', end_date_time DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', location VARCHAR(255) DEFAULT NULL, type VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_C7F7CAFBB03A8386 (created_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE event_participant ADD CONSTRAINT FK_7C16B8913E5F2F7B FOREIGN KEY (event_id_id) REFERENCES schedule_event (id)');
        $this->addSql('ALTER TABLE event_participant ADD CONSTRAINT FK_7C16B8919D86650F FOREIGN KEY (user_id_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE schedule_event ADD CONSTRAINT FK_C7F7CAFBB03A8386 FOREIGN KEY (created_by_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event_participant DROP FOREIGN KEY FK_7C16B8913E5F2F7B');
        $this->addSql('ALTER TABLE event_participant DROP FOREIGN KEY FK_7C16B8919D86650F');
        $this->addSql('ALTER TABLE schedule_event DROP FOREIGN KEY FK_C7F7CAFBB03A8386');
        $this->addSql('DROP TABLE event_participant');
        $this->addSql('DROP TABLE schedule_event');
    }
}
