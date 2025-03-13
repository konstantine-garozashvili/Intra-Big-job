<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250309212602 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event_participant DROP FOREIGN KEY FK_7C16B8913E5F2F7B');
        $this->addSql('ALTER TABLE event_participant DROP FOREIGN KEY FK_7C16B8919D86650F');
        $this->addSql('DROP INDEX IDX_7C16B8919D86650F ON event_participant');
        $this->addSql('DROP INDEX IDX_7C16B8913E5F2F7B ON event_participant');
        $this->addSql('ALTER TABLE event_participant ADD event_id INT NOT NULL, ADD user_id INT NOT NULL, DROP event_id_id, DROP user_id_id');
        $this->addSql('ALTER TABLE event_participant ADD CONSTRAINT FK_7C16B89171F7E88B FOREIGN KEY (event_id) REFERENCES schedule_event (id)');
        $this->addSql('ALTER TABLE event_participant ADD CONSTRAINT FK_7C16B891A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('CREATE INDEX IDX_7C16B89171F7E88B ON event_participant (event_id)');
        $this->addSql('CREATE INDEX IDX_7C16B891A76ED395 ON event_participant (user_id)');
        $this->addSql('ALTER TABLE schedule_event DROP FOREIGN KEY FK_C7F7CAFBB03A8386');
        $this->addSql('DROP INDEX IDX_C7F7CAFBB03A8386 ON schedule_event');
        $this->addSql('ALTER TABLE schedule_event CHANGE created_by_id created_by INT NOT NULL');
        $this->addSql('ALTER TABLE schedule_event ADD CONSTRAINT FK_C7F7CAFBDE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('CREATE INDEX IDX_C7F7CAFBDE12AB56 ON schedule_event (created_by)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE event_participant DROP FOREIGN KEY FK_7C16B89171F7E88B');
        $this->addSql('ALTER TABLE event_participant DROP FOREIGN KEY FK_7C16B891A76ED395');
        $this->addSql('DROP INDEX IDX_7C16B89171F7E88B ON event_participant');
        $this->addSql('DROP INDEX IDX_7C16B891A76ED395 ON event_participant');
        $this->addSql('ALTER TABLE event_participant ADD event_id_id INT NOT NULL, ADD user_id_id INT NOT NULL, DROP event_id, DROP user_id');
        $this->addSql('ALTER TABLE event_participant ADD CONSTRAINT FK_7C16B8913E5F2F7B FOREIGN KEY (event_id_id) REFERENCES schedule_event (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE event_participant ADD CONSTRAINT FK_7C16B8919D86650F FOREIGN KEY (user_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_7C16B8919D86650F ON event_participant (user_id_id)');
        $this->addSql('CREATE INDEX IDX_7C16B8913E5F2F7B ON event_participant (event_id_id)');
        $this->addSql('ALTER TABLE schedule_event DROP FOREIGN KEY FK_C7F7CAFBDE12AB56');
        $this->addSql('DROP INDEX IDX_C7F7CAFBDE12AB56 ON schedule_event');
        $this->addSql('ALTER TABLE schedule_event CHANGE created_by created_by_id INT NOT NULL');
        $this->addSql('ALTER TABLE schedule_event ADD CONSTRAINT FK_C7F7CAFBB03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_C7F7CAFBB03A8386 ON schedule_event (created_by_id)');
    }
}
