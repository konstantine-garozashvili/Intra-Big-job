<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250313172357 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE event_participant (id INT AUTO_INCREMENT NOT NULL, event_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_7C16B89171F7E88B (event_id), INDEX IDX_7C16B891A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE schedule_event (id INT AUTO_INCREMENT NOT NULL, created_by INT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, start_date_time DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', end_date_time DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', location VARCHAR(255) DEFAULT NULL, type VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_C7F7CAFBDE12AB56 (created_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE event_participant ADD CONSTRAINT FK_7C16B89171F7E88B FOREIGN KEY (event_id) REFERENCES schedule_event (id)');
        $this->addSql('ALTER TABLE event_participant ADD CONSTRAINT FK_7C16B891A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE schedule_event ADD CONSTRAINT FK_C7F7CAFBDE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user CHANGE phone_number phone_number VARCHAR(20) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event_participant DROP FOREIGN KEY FK_7C16B89171F7E88B');
        $this->addSql('ALTER TABLE event_participant DROP FOREIGN KEY FK_7C16B891A76ED395');
        $this->addSql('ALTER TABLE schedule_event DROP FOREIGN KEY FK_C7F7CAFBDE12AB56');
        $this->addSql('DROP TABLE event_participant');
        $this->addSql('DROP TABLE schedule_event');
        $this->addSql('ALTER TABLE `user` CHANGE phone_number phone_number VARCHAR(20) DEFAULT NULL');
    }
}
