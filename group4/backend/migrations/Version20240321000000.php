<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20240321000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop messenger_messages table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS messenger_messages');
    }

    public function down(Schema $schema): void
    {
        // No need to recreate the table in down() since we're removing it completely
    }
} 