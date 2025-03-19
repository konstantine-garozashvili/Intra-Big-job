<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250228231427 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE theme DROP FOREIGN KEY FK_9775E708B03A8386');
        $this->addSql('DROP INDEX IDX_9775E708B03A8386 ON theme');
        $this->addSql('ALTER TABLE theme ADD description VARCHAR(255) DEFAULT NULL, DROP created_by_id');
        $this->addSql('ALTER TABLE user ADD theme VARCHAR(20) DEFAULT \'light\' NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE theme ADD created_by_id INT NOT NULL, DROP description');
        $this->addSql('ALTER TABLE theme ADD CONSTRAINT FK_9775E708B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_9775E708B03A8386 ON theme (created_by_id)');
        $this->addSql('ALTER TABLE `user` DROP theme');
    }
}
