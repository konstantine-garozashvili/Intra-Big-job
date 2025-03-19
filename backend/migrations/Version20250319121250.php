<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250319121250 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP INDEX UNIQ_7B00651C5E237E06 ON status');
        $this->addSql('ALTER TABLE user ADD is_active TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE user_status ADD CONSTRAINT FK_1E527E216BF700BD FOREIGN KEY (status_id) REFERENCES status (id)');
        $this->addSql('CREATE INDEX IDX_1E527E216BF700BD ON user_status (status_id)');
        $this->addSql('ALTER TABLE user_status RENAME INDEX fk_1e527e21a76ed395 TO IDX_1E527E21A76ED395');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7B00651C5E237E06 ON status (name)');
        $this->addSql('ALTER TABLE `user` DROP is_active');
        $this->addSql('ALTER TABLE user_status DROP FOREIGN KEY FK_1E527E216BF700BD');
        $this->addSql('DROP INDEX IDX_1E527E216BF700BD ON user_status');
        $this->addSql('ALTER TABLE user_status RENAME INDEX idx_1e527e21a76ed395 TO FK_1E527E21A76ED395');
    }
}
