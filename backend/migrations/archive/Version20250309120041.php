<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250309120041 extends AbstractMigration
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
        $this->addSql('DROP INDEX idx_address_user_id ON address');
        $this->addSql('ALTER TABLE diploma DROP FOREIGN KEY FK_EC218957A76ED395');
        $this->addSql('DROP INDEX IDX_EC218957A76ED395 ON diploma');
        $this->addSql('DROP INDEX idx_diploma_user_id ON diploma');
        $this->addSql('ALTER TABLE diploma DROP user_id, DROP date');
        $this->addSql('DROP INDEX idx_student_profile_situation_type ON student_profile');
        $this->addSql('DROP INDEX idx_user_email ON user');
        $this->addSql('DROP INDEX idx_user_specialization ON user');
        $this->addSql('DROP INDEX idx_user_theme ON user');
        $this->addSql('DROP INDEX idx_user_role_user_id ON user_role');
        $this->addSql('DROP INDEX idx_user_role_role_id ON user_role');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_diploma DROP FOREIGN KEY FK_B42C975DA76ED395');
        $this->addSql('ALTER TABLE user_diploma DROP FOREIGN KEY FK_B42C975DA99ACEB5');
        $this->addSql('DROP TABLE user_diploma');
        $this->addSql('CREATE INDEX idx_address_user_id ON address (user_id)');
        $this->addSql('ALTER TABLE diploma ADD user_id INT NOT NULL, ADD date DATE NOT NULL');
        $this->addSql('ALTER TABLE diploma ADD CONSTRAINT FK_EC218957A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_EC218957A76ED395 ON diploma (user_id)');
        $this->addSql('CREATE INDEX idx_diploma_user_id ON diploma (user_id)');
        $this->addSql('CREATE INDEX idx_student_profile_situation_type ON student_profile (situation_type_id)');
        $this->addSql('CREATE INDEX idx_user_email ON `user` (email)');
        $this->addSql('CREATE INDEX idx_user_specialization ON `user` (specialization_id)');
        $this->addSql('CREATE INDEX idx_user_theme ON `user` (theme_id)');
        $this->addSql('CREATE INDEX idx_user_role_user_id ON user_role (user_id)');
        $this->addSql('CREATE INDEX idx_user_role_role_id ON user_role (role_id)');
    }
}
