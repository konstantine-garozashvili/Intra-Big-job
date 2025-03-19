<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Migration to recreate group, message, and signature tables
 */
final class Version20250319090859 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop and recreate group, group_user, message, and signature tables, and remove messenger_messages';
    }

    public function up(Schema $schema): void
    {
        // Drop messenger_messages table (won't be recreated)
        $this->addSql('DROP TABLE IF EXISTS messenger_messages');

        // Drop tables in correct order (respecting foreign keys)
        $this->addSql('DROP TABLE IF EXISTS message');
        $this->addSql('DROP TABLE IF EXISTS group_user');
        $this->addSql('DROP TABLE IF EXISTS signature');
        $this->addSql('DROP TABLE IF EXISTS `group`');

        // Recreate group table
        $this->addSql('CREATE TABLE `group` (
            id INT NOT NULL AUTO_INCREMENT,
            creator_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            description LONGTEXT DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            PRIMARY KEY(id),
            INDEX IDX_6DC044C561220EA6 (creator_id),
            CONSTRAINT FK_6DC044C561220EA6 FOREIGN KEY (creator_id) REFERENCES user (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Recreate group_user table
        $this->addSql('CREATE TABLE group_user (
            group_id INT NOT NULL,
            user_id INT NOT NULL,
            PRIMARY KEY(group_id, user_id),
            INDEX IDX_A4C98D39FE54D947 (group_id),
            INDEX IDX_A4C98D39A76ED395 (user_id),
            CONSTRAINT FK_A4C98D39A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
            CONSTRAINT FK_A4C98D39FE54D947 FOREIGN KEY (group_id) REFERENCES `group` (id) ON DELETE CASCADE
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Recreate message table
        $this->addSql('CREATE TABLE message (
            id INT NOT NULL AUTO_INCREMENT,
            sender_id INT NOT NULL,
            content LONGTEXT NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            is_global TINYINT(1) NOT NULL,
            read_by JSON NOT NULL,
            recipient_id INT DEFAULT NULL,
            group_id INT DEFAULT NULL,
            PRIMARY KEY(id),
            INDEX IDX_B6BD307FF624B39D (sender_id),
            INDEX IDX_B6BD307FE92F8F78 (recipient_id),
            INDEX IDX_B6BD307FFE54D947 (group_id),
            CONSTRAINT FK_B6BD307FE92F8F78 FOREIGN KEY (recipient_id) REFERENCES user (id),
            CONSTRAINT FK_B6BD307FF624B39D FOREIGN KEY (sender_id) REFERENCES user (id),
            CONSTRAINT FK_B6BD307FFE54D947 FOREIGN KEY (group_id) REFERENCES `group` (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        // Recreate signature table
        $this->addSql('CREATE TABLE signature (
            id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            date DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            location VARCHAR(255) NOT NULL,
            drawing LONGTEXT DEFAULT NULL,
            period VARCHAR(10) NOT NULL,
            PRIMARY KEY(id),
            INDEX IDX_AE880141A76ED395 (user_id),
            CONSTRAINT FK_CDE3AC5FA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        // Drop tables in correct order (respecting foreign keys)
        $this->addSql('DROP TABLE IF EXISTS message');
        $this->addSql('DROP TABLE IF EXISTS group_user');
        $this->addSql('DROP TABLE IF EXISTS signature');
        $this->addSql('DROP TABLE IF EXISTS `group`');
    }
}
