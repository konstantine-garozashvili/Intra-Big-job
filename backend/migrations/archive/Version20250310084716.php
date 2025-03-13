<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250310084716 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_diploma (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, diploma_id INT NOT NULL, obtained_date DATE NOT NULL, INDEX IDX_B42C975DA76ED395 (user_id), INDEX IDX_B42C975DA99ACEB5 (diploma_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE user_diploma ADD CONSTRAINT FK_B42C975DA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user_diploma ADD CONSTRAINT FK_B42C975DA99ACEB5 FOREIGN KEY (diploma_id) REFERENCES diploma (id)');
        $this->addSql('ALTER TABLE diploma DROP FOREIGN KEY FK_EC218957A76ED395');
        $this->addSql('DROP INDEX IDX_EC218957A76ED395 ON diploma');
        $this->addSql('ALTER TABLE diploma DROP user_id, DROP date');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_diploma DROP FOREIGN KEY FK_B42C975DA76ED395');
        $this->addSql('ALTER TABLE user_diploma DROP FOREIGN KEY FK_B42C975DA99ACEB5');
        $this->addSql('DROP TABLE user_diploma');
        $this->addSql('ALTER TABLE diploma ADD user_id INT NOT NULL, ADD date DATE NOT NULL');
        $this->addSql('ALTER TABLE diploma ADD CONSTRAINT FK_EC218957A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_EC218957A76ED395 ON diploma (user_id)');
    }
}
