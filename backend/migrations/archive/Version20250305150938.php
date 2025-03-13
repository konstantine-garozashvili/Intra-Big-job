<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250305150938 extends AbstractMigration
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
        $this->addSql('CREATE TABLE specialization (id INT AUTO_INCREMENT NOT NULL, domain_id INT NOT NULL, name VARCHAR(255) NOT NULL, INDEX IDX_9ED9F26A115F0EE5 (domain_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_status (id INT AUTO_INCREMENT NOT NULL, associated_role_id INT NOT NULL, name VARCHAR(255) NOT NULL, description VARCHAR(255) DEFAULT NULL, INDEX IDX_1E527E21CD4ADDE8 (associated_role_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_status_history (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, status_id INT NOT NULL, start_date DATETIME NOT NULL, end_date DATETIME DEFAULT NULL, created_at DATETIME NOT NULL, INDEX IDX_44EFD897A76ED395 (user_id), INDEX IDX_44EFD8976BF700BD (status_id), INDEX idx_user_status_history_dates (start_date, end_date), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A7661232A4F FOREIGN KEY (document_type_id) REFERENCES document_type (id)');
        $this->addSql('ALTER TABLE document ADD CONSTRAINT FK_D8698A76C69DE5E5 FOREIGN KEY (validated_by_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE document_history ADD CONSTRAINT FK_83D5D697C33F7837 FOREIGN KEY (document_id) REFERENCES document (id)');
        $this->addSql('ALTER TABLE document_history ADD CONSTRAINT FK_83D5D697A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE document_type_category ADD CONSTRAINT FK_EC1C9AB661232A4F FOREIGN KEY (document_type_id) REFERENCES document_type (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE document_type_category ADD CONSTRAINT FK_EC1C9AB690EFAA88 FOREIGN KEY (document_category_id) REFERENCES document_category (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE specialization ADD CONSTRAINT FK_9ED9F26A115F0EE5 FOREIGN KEY (domain_id) REFERENCES domain (id)');
        $this->addSql('ALTER TABLE user_status ADD CONSTRAINT FK_1E527E21CD4ADDE8 FOREIGN KEY (associated_role_id) REFERENCES role (id)');
        $this->addSql('ALTER TABLE user_status_history ADD CONSTRAINT FK_44EFD897A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_status_history ADD CONSTRAINT FK_44EFD8976BF700BD FOREIGN KEY (status_id) REFERENCES user_status (id)');
        $this->addSql('ALTER TABLE user ADD specialization_id INT DEFAULT NULL, ADD profile_picture_path VARCHAR(255) DEFAULT NULL');
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
        $this->addSql('ALTER TABLE specialization DROP FOREIGN KEY FK_9ED9F26A115F0EE5');
        $this->addSql('ALTER TABLE user_status DROP FOREIGN KEY FK_1E527E21CD4ADDE8');
        $this->addSql('ALTER TABLE user_status_history DROP FOREIGN KEY FK_44EFD897A76ED395');
        $this->addSql('ALTER TABLE user_status_history DROP FOREIGN KEY FK_44EFD8976BF700BD');
        $this->addSql('DROP TABLE document');
        $this->addSql('DROP TABLE document_category');
        $this->addSql('DROP TABLE document_history');
        $this->addSql('DROP TABLE document_type');
        $this->addSql('DROP TABLE document_type_category');
        $this->addSql('DROP TABLE domain');
        $this->addSql('DROP TABLE specialization');
        $this->addSql('DROP TABLE user_status');
        $this->addSql('DROP TABLE user_status_history');
        $this->addSql('DROP INDEX IDX_8D93D649FA846217 ON `user`');
        $this->addSql('ALTER TABLE `user` DROP specialization_id, DROP profile_picture_path');
    }
}
