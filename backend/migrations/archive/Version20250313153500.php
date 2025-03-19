<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add recipient field to Message entity for private messaging
 */
final class Version20250313153500 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add recipient field to Message entity for private messaging';
    }

    public function up(Schema $schema): void
    {
        // Add recipient_id column to message table
        $this->addSql('ALTER TABLE message ADD recipient_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307FE92F8F78 FOREIGN KEY (recipient_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FE92F8F78 ON message (recipient_id)');
    }

    public function down(Schema $schema): void
    {
        // Remove recipient_id column from message table
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_B6BD307FE92F8F78');
        $this->addSql('DROP INDEX IDX_B6BD307FE92F8F78 ON message');
        $this->addSql('ALTER TABLE message DROP recipient_id');
    }
}
