<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250320133558 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE status (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE user ADD is_active TINYINT(1) NOT NULL');
        $this->addSql('ALTER TABLE user_status DROP FOREIGN KEY FK_1E527E21CD4ADDE8');
        $this->addSql('DROP INDEX IDX_1E527E21CD4ADDE8 ON user_status');
        $this->addSql('ALTER TABLE user_status ADD status_id INT NOT NULL, DROP name, DROP description, CHANGE associated_role_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE user_status ADD CONSTRAINT FK_1E527E21A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user_status ADD CONSTRAINT FK_1E527E216BF700BD FOREIGN KEY (status_id) REFERENCES status (id)');
        $this->addSql('CREATE INDEX IDX_1E527E21A76ED395 ON user_status (user_id)');
        $this->addSql('CREATE INDEX IDX_1E527E216BF700BD ON user_status (status_id)');
        $this->addSql('ALTER TABLE user_status_history DROP FOREIGN KEY FK_44EFD897A76ED395');
        $this->addSql('ALTER TABLE user_status_history DROP FOREIGN KEY FK_44EFD8976BF700BD');
        $this->addSql('DROP INDEX IDX_44EFD8976BF700BD ON user_status_history');
        $this->addSql('DROP INDEX IDX_44EFD897A76ED395 ON user_status_history');
        $this->addSql('DROP INDEX idx_user_status_history_dates ON user_status_history');
        $this->addSql('ALTER TABLE user_status_history ADD user_status_id INT NOT NULL, DROP user_id, DROP status_id, DROP start_date, DROP end_date, CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('ALTER TABLE user_status_history ADD CONSTRAINT FK_44EFD8976B178D59 FOREIGN KEY (user_status_id) REFERENCES user_status (id)');
        $this->addSql('CREATE INDEX IDX_44EFD8976B178D59 ON user_status_history (user_status_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_status DROP FOREIGN KEY FK_1E527E216BF700BD');
        $this->addSql('DROP TABLE status');
        $this->addSql('ALTER TABLE `user` DROP is_active');
        $this->addSql('ALTER TABLE user_status DROP FOREIGN KEY FK_1E527E21A76ED395');
        $this->addSql('DROP INDEX IDX_1E527E21A76ED395 ON user_status');
        $this->addSql('DROP INDEX IDX_1E527E216BF700BD ON user_status');
        $this->addSql('ALTER TABLE user_status ADD associated_role_id INT NOT NULL, ADD name VARCHAR(255) NOT NULL, ADD description VARCHAR(255) DEFAULT NULL, DROP user_id, DROP status_id');
        $this->addSql('ALTER TABLE user_status ADD CONSTRAINT FK_1E527E21CD4ADDE8 FOREIGN KEY (associated_role_id) REFERENCES role (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_1E527E21CD4ADDE8 ON user_status (associated_role_id)');
        $this->addSql('ALTER TABLE user_status_history DROP FOREIGN KEY FK_44EFD8976B178D59');
        $this->addSql('DROP INDEX IDX_44EFD8976B178D59 ON user_status_history');
        $this->addSql('ALTER TABLE user_status_history ADD status_id INT NOT NULL, ADD start_date DATETIME NOT NULL, ADD end_date DATETIME DEFAULT NULL, CHANGE created_at created_at DATETIME NOT NULL, CHANGE user_status_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE user_status_history ADD CONSTRAINT FK_44EFD897A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_status_history ADD CONSTRAINT FK_44EFD8976BF700BD FOREIGN KEY (status_id) REFERENCES user_status (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_44EFD8976BF700BD ON user_status_history (status_id)');
        $this->addSql('CREATE INDEX IDX_44EFD897A76ED395 ON user_status_history (user_id)');
        $this->addSql('CREATE INDEX idx_user_status_history_dates ON user_status_history (start_date, end_date)');
    }
}
