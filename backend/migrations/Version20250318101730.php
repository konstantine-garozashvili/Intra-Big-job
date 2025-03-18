<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250318101730 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE document (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, document_type_id INT NOT NULL, validated_by_id INT DEFAULT NULL, name VARCHAR(255) NOT NULL, filename VARCHAR(255) NOT NULL, mime_type VARCHAR(100) NOT NULL, size INT NOT NULL, path VARCHAR(255) NOT NULL, status VARCHAR(255) NOT NULL, comment LONGTEXT DEFAULT NULL, validated_at DATETIME DEFAULT NULL, uploaded_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, INDEX IDX_D8698A76A76ED395 (user_id), INDEX IDX_D8698A7661232A4F (document_type_id), INDEX IDX_D8698A76C69DE5E5 (validated_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE document_category (id INT AUTO_INCREMENT NOT NULL, code VARCHAR(50) NOT NULL, name VARCHAR(100) NOT NULL, description LONGTEXT DEFAULT NULL, is_active TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_898DE89877153098 (code), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE document_history (id INT AUTO_INCREMENT NOT NULL, document_id INT NOT NULL, user_id INT NOT NULL, action VARCHAR(255) NOT NULL, details JSON DEFAULT NULL, created_at DATETIME NOT NULL, INDEX IDX_83D5D697C33F7837 (document_id), INDEX IDX_83D5D697A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE document_type (id INT AUTO_INCREMENT NOT NULL, code VARCHAR(50) NOT NULL, name VARCHAR(100) NOT NULL, description LONGTEXT DEFAULT NULL, allowed_mime_types JSON NOT NULL, max_file_size INT NOT NULL, is_required TINYINT(1) NOT NULL, deadline_at DATE DEFAULT NULL, notification_days INT DEFAULT NULL, is_active TINYINT(1) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_2B6ADBBA77153098 (code), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE document_type_category (document_type_id INT NOT NULL, document_category_id INT NOT NULL, INDEX IDX_EC1C9AB661232A4F (document_type_id), INDEX IDX_EC1C9AB690EFAA88 (document_category_id), PRIMARY KEY(document_type_id, document_category_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE domain (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE event_participant (id INT AUTO_INCREMENT NOT NULL, event_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_7C16B89171F7E88B (event_id), INDEX IDX_7C16B891A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE schedule_event (id INT AUTO_INCREMENT NOT NULL, created_by INT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, start_date_time DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', end_date_time DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', location VARCHAR(255) DEFAULT NULL, type VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_C7F7CAFBDE12AB56 (created_by), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE specialization (id INT AUTO_INCREMENT NOT NULL, domain_id INT NOT NULL, name VARCHAR(255) NOT NULL, INDEX IDX_9ED9F26A115F0EE5 (domain_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE student_profile (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, situation_type_id INT DEFAULT NULL, is_seeking_internship TINYINT(1) NOT NULL, is_seeking_apprenticeship TINYINT(1) NOT NULL, current_internship_company VARCHAR(255) DEFAULT NULL, internship_start_date DATE DEFAULT NULL, internship_end_date DATE DEFAULT NULL, portfolio_url VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_6C611FF7A76ED395 (user_id), INDEX IDX_6C611FF747CC2355 (situation_type_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_diploma (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, diploma_id INT NOT NULL, obtained_date DATE NOT NULL, INDEX IDX_B42C975DA76ED395 (user_id), INDEX IDX_B42C975DA99ACEB5 (diploma_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_situation_type (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_status (id INT AUTO_INCREMENT NOT NULL, associated_role_id INT NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, INDEX IDX_1E527E21CD4ADDE8 (associated_role_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_status_history (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, status_id INT NOT NULL, start_date DATETIME NOT NULL, end_date DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, INDEX IDX_44EFD897A76ED395 (user_id), INDEX IDX_44EFD8976BF700BD (status_id), INDEX idx_user_status_history_dates (start_date, end_date), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A7661232A4F FOREIGN KEY (document_type_id) REFERENCES document_type (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76C69DE5E5 FOREIGN KEY (validated_by_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE document_history ADD CONSTRAINT FK_83D5D697C33F7837 FOREIGN KEY (document_id) REFERENCES document (id)');
        $this->addSql('ALTER TABLE document_history ADD CONSTRAINT FK_83D5D697A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE document_type_category ADD CONSTRAINT FK_EC1C9AB661232A4F FOREIGN KEY (document_type_id) REFERENCES document_type (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE document_type_category ADD CONSTRAINT FK_EC1C9AB690EFAA88 FOREIGN KEY (document_category_id) REFERENCES document_category (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE event_participant ADD CONSTRAINT FK_7C16B89171F7E88B FOREIGN KEY (event_id) REFERENCES schedule_event (id)');
        $this->addSql('ALTER TABLE event_participant ADD CONSTRAINT FK_7C16B891A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE schedule_event ADD CONSTRAINT FK_C7F7CAFBDE12AB56 FOREIGN KEY (created_by) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE specialization ADD CONSTRAINT FK_9ED9F26A115F0EE5 FOREIGN KEY (domain_id) REFERENCES domain (id)');
        $this->addSql('ALTER TABLE student_profile ADD CONSTRAINT FK_6C611FF7A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE student_profile ADD CONSTRAINT FK_6C611FF747CC2355 FOREIGN KEY (situation_type_id) REFERENCES user_situation_type (id)');
        $this->addSql('ALTER TABLE user_diploma ADD CONSTRAINT FK_B42C975DA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE user_diploma ADD CONSTRAINT FK_B42C975DA99ACEB5 FOREIGN KEY (diploma_id) REFERENCES diploma (id)');
        $this->addSql('ALTER TABLE user_status ADD CONSTRAINT FK_1E527E21CD4ADDE8 FOREIGN KEY (associated_role_id) REFERENCES role (id)');
        $this->addSql('ALTER TABLE user_status_history ADD CONSTRAINT FK_44EFD897A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_status_history ADD CONSTRAINT FK_44EFD8976BF700BD FOREIGN KEY (status_id) REFERENCES user_status (id)');
        $this->addSql('ALTER TABLE diploma DROP FOREIGN KEY FK_EC218957A76ED395');
        $this->addSql('DROP INDEX IDX_EC218957A76ED395 ON diploma');
        $this->addSql('ALTER TABLE diploma DROP user_id, DROP date');
        $this->addSql('ALTER TABLE user ADD specialization_id INT DEFAULT NULL, ADD profile_picture_path VARCHAR(255) DEFAULT NULL, ADD linkedin_url VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D649FA846217 FOREIGN KEY (specialization_id) REFERENCES specialization (id)');
        $this->addSql('CREATE INDEX IDX_8D93D649FA846217 ON user (specialization_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D649FA846217');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A76A76ED395');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A7661232A4F');
        $this->addSql('ALTER TABLE document DROP FOREIGN KEY FK_D8698A76C69DE5E5');
        $this->addSql('ALTER TABLE document_history DROP FOREIGN KEY FK_83D5D697C33F7837');
        $this->addSql('ALTER TABLE document_history DROP FOREIGN KEY FK_83D5D697A76ED395');
        $this->addSql('ALTER TABLE document_type_category DROP FOREIGN KEY FK_EC1C9AB661232A4F');
        $this->addSql('ALTER TABLE document_type_category DROP FOREIGN KEY FK_EC1C9AB690EFAA88');
        $this->addSql('ALTER TABLE event_participant DROP FOREIGN KEY FK_7C16B89171F7E88B');
        $this->addSql('ALTER TABLE event_participant DROP FOREIGN KEY FK_7C16B891A76ED395');
        $this->addSql('ALTER TABLE schedule_event DROP FOREIGN KEY FK_C7F7CAFBDE12AB56');
        $this->addSql('ALTER TABLE specialization DROP FOREIGN KEY FK_9ED9F26A115F0EE5');
        $this->addSql('ALTER TABLE student_profile DROP FOREIGN KEY FK_6C611FF7A76ED395');
        $this->addSql('ALTER TABLE student_profile DROP FOREIGN KEY FK_6C611FF747CC2355');
        $this->addSql('ALTER TABLE user_diploma DROP FOREIGN KEY FK_B42C975DA76ED395');
        $this->addSql('ALTER TABLE user_diploma DROP FOREIGN KEY FK_B42C975DA99ACEB5');
        $this->addSql('ALTER TABLE user_status DROP FOREIGN KEY FK_1E527E21CD4ADDE8');
        $this->addSql('ALTER TABLE user_status_history DROP FOREIGN KEY FK_44EFD897A76ED395');
        $this->addSql('ALTER TABLE user_status_history DROP FOREIGN KEY FK_44EFD8976BF700BD');
        $this->addSql('DROP TABLE document');
        $this->addSql('DROP TABLE document_category');
        $this->addSql('DROP TABLE document_history');
        $this->addSql('DROP TABLE document_type');
        $this->addSql('DROP TABLE document_type_category');
        $this->addSql('DROP TABLE domain');
        $this->addSql('DROP TABLE event_participant');
        $this->addSql('DROP TABLE schedule_event');
        $this->addSql('DROP TABLE specialization');
        $this->addSql('DROP TABLE student_profile');
        $this->addSql('DROP TABLE user_diploma');
        $this->addSql('DROP TABLE user_situation_type');
        $this->addSql('DROP TABLE user_status');
        $this->addSql('DROP TABLE user_status_history');
        $this->addSql('ALTER TABLE diploma ADD user_id INT NOT NULL, ADD date DATE NOT NULL');
        $this->addSql('ALTER TABLE diploma ADD CONSTRAINT FK_EC218957A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_EC218957A76ED395 ON diploma (user_id)');
        $this->addSql('DROP INDEX IDX_8D93D649FA846217 ON `user`');
        $this->addSql('ALTER TABLE `user` DROP specialization_id, DROP profile_picture_path, DROP linkedin_url');
    }
}
